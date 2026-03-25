const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * OpenAI.fm Audio Generator - Browser Automation
 * Uses Puppeteer to bypass rate limiting and security checks
 */

async function generateOpenaiFmAudio(prompt, options = {}) {
    const {
        outputPath = null,
        duration = 30,
        genre = 'ambient',
        tempo = 'medium',
        timeout = 120000, // 2 minutes for generation
        headless = true,
        waitForDownload = true,
    } = options;

    let browser = null;

    try {
        console.log('🚀 Launching browser...');
        browser = await puppeteer.launch({
            headless: headless ? 'new' : false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920x1080',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        const page = await browser.newPage();
        
        // Set realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36');
        
        // Bypass automation detection
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
        });

        console.log('📥 Navigating to OpenAI.fm...');
        
        // Navigate to the page
        await page.goto('https://www.openai.fm/', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        console.log('⏳ Waiting for page to load...');
        
        // Wait for input field to be available
        // Try multiple selectors as we don't know the exact one yet
        let promptSelector = 'textarea[placeholder*="Describe"], textarea[placeholder*="prompt"], input[type="text"], #prompt';
        
        try {
            await page.waitForSelector(promptSelector, { timeout: 10000 });
            console.log('✏️ Entering prompt...');
            
            // Type the prompt with delay to appear human-like
            await page.type(promptSelector, prompt, { delay: 100 });
            
        } catch (e) {
            console.log('⚠️ Could not find prompt field automatically');
            console.log('🔍 Taking screenshot for debugging...');
            
            const screenshotPath = `openai_fm_debug_${Date.now()}.png`;
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`📸 Screenshot saved to: ${screenshotPath}`);
            
            throw new Error('Could not find input field - website structure may have changed');
        }

        // Configure settings if available
        if (duration) {
            try {
                console.log(`⏱️ Setting duration to ${duration}s...`);
                // Try to find duration slider or input
                const durationSelector = 'input[type="range"][name*="duration"], input[name*="duration"]';
                const durationElement = await page.$(durationSelector);
                
                if (durationElement) {
                    // Evaluate to set value
                    await page.evaluate((selector, value) => {
                        const el = document.querySelector(selector);
                        if (el) el.value = value;
                    }, durationSelector, duration.toString());
                }
            } catch (e) {
                console.log('⚠️ Could not set duration, using default');
            }
        }

        console.log('🎵 Clicking Generate button...');
        
        // Find and click the generate button
        const generateButton = await page.$('button:has-text("Generate"), button[type="submit"], #generate-btn, .generate-button');
        
        if (!generateButton) {
            throw new Error('Generate button not found');
        }
        
        await generateButton.click();

        console.log('⏳ Waiting for audio generation (this may take 30-90 seconds)...');

        // Wait for audio player or download link to appear
        if (waitForDownload) {
            await page.waitForFunction(() => {
                // Check for audio element
                const audioElements = document.querySelectorAll('audio');
                for (let audio of audioElements) {
                    if (audio.src && audio.src.length > 0) {
                        return { type: 'audio', src: audio.src };
                    }
                }
                
                // Check for download links
                const downloadLinks = Array.from(document.querySelectorAll('a[href*=".wav"], a[href*=".mp3"], a[download]'));
                if (downloadLinks.length > 0) {
                    return { 
                        type: 'download', 
                        src: downloadLinks[0].href,
                        filename: downloadLinks[0].download 
                    };
                }
                
                // Check for any blob URLs
                const blobLinks = Array.from(document.querySelectorAll('a[href^="blob:"]'));
                if (blobLinks.length > 0) {
                    return { type: 'blob', src: blobLinks[0].href };
                }
                
                return null;
            }, { timeout: timeout });

            console.log('✅ Audio generated successfully!');

            // Get the audio URL
            const audioInfo = await page.evaluate(() => {
                // Check for audio elements
                const audioElements = document.querySelectorAll('audio');
                for (let audio of audioElements) {
                    if (audio.src) {
                        return {
                            type: 'audio',
                            src: audio.src,
                            duration: audio.duration
                        };
                    }
                }
                
                // Check for download links
                const downloadLinks = Array.from(document.querySelectorAll('a[href*=".wav"], a[href*=".mp3"], a[download]'));
                if (downloadLinks.length > 0) {
                    const link = downloadLinks[0];
                    return {
                        type: 'download',
                        src: link.href,
                        filename: link.download
                    };
                }
                
                return null;
            });

            if (audioInfo) {
                console.log(`🎵 Found audio: ${audioInfo.type}`);
                console.log(`📷 Source: ${audioInfo.src.substring(0, 100)}...`);
                
                // Download the audio
                let audioBuffer;
                let extension = '.wav';
                
                if (audioInfo.src.startsWith('data:audio')) {
                    // It's a data URL
                    const base64Data = audioInfo.src.replace(/^data:audio\/(wav|mp3);base64,/, '');
                    audioBuffer = Buffer.from(base64Data, 'base64');
                    extension = audioInfo.src.includes('mp3') ? '.mp3' : '.wav';
                } else {
                    // Navigate to the audio URL and download
                    const audioResponse = await page.goto(audioInfo.src);
                    audioBuffer = await audioResponse.buffer();
                    
                    // Try to determine format from content-type
                    const contentType = audioResponse.headers()['content-type'];
                    if (contentType && contentType.includes('mp3')) {
                        extension = '.mp3';
                    }
                }
                
                const filename = outputPath || `openai_fm_generated_${Date.now()}${extension}`;
                fs.writeFileSync(filename, audioBuffer);
                console.log(`💾 Audio saved to: ${filename}`);
                console.log(`🎵 File size: ${audioBuffer.length} bytes`);
                
                return {
                    success: true,
                    filename: filename,
                    prompt: prompt,
                    timestamp: new Date().toISOString(),
                    size: audioBuffer.length,
                    extension: extension
                };
            } else {
                console.log('⚠️ Could not find generated audio in page');
                return {
                    success: false,
                    error: 'Audio not found in page',
                    prompt: prompt
                };
            }
        } else {
            // Just return success without waiting for download
            console.log('✅ Generation initiated (not waiting for download)');
            return {
                success: true,
                message: 'Generation started, check page manually',
                prompt: prompt
            };
        }

    } catch (error) {
        console.error('❌ Error generating audio:', error.message);
        
        // Take screenshot for debugging
        if (browser) {
            try {
                const pages = await browser.pages();
                if (pages.length > 0) {
                    const screenshotPath = `openai_fm_error_${Date.now()}.png`;
                    await pages[0].screenshot({ path: screenshotPath, fullPage: false });
                    console.log(`📸 Error screenshot saved to: ${screenshotPath}`);
                }
            } catch (e) {
                console.error('Could not take screenshot:', e);
            }
        }
        
        return {
            success: false,
            error: error.message,
            prompt: prompt
        };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Batch generate multiple audio tracks
 */
async function batchGenerate(prompts, outputDir = './openai_fm_batch_output') {
    console.log(`📦 Starting batch generation of ${prompts.length} audio tracks...`);
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const results = [];
    
    for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        const outputPath = path.join(outputDir, `audio_${i + 1}_${Date.now()}.wav`);
        
        console.log(`\n🎵 Generating audio ${i + 1}/${prompts.length}`);
        console.log(`Prompt: ${prompt}`);
        
        const result = await generateOpenaiFmAudio(prompt, {
            outputPath: outputPath,
            timeout: 120000
        });
        
        results.push(result);
        
        // Wait between generations to avoid rate limiting
        if (i < prompts.length - 1) {
            console.log('⏳ Waiting 5 seconds before next generation...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    
    // Save results summary
    const summaryPath = path.join(outputDir, 'batch_results.json');
    fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));
    console.log(`\n📊 Results saved to: ${summaryPath}`);
    
    const successful = results.filter(r => r.success).length;
    console.log(`✅ Batch complete: ${successful}/${prompts.length} audio tracks generated successfully`);
    
    return results;
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('OpenAI.fm Audio Generator - Puppeteer Automation');
        console.log('\nUsage:');
        console.log('  node openai_fm_puppeteer.js "your prompt here"');
        console.log('  node openai_fm_puppeteer.js --batch');
        console.log('\nExamples:');
        console.log('  node openai_fm_puppeteer.js "Create a peaceful piano melody"');
        console.log('  node openai_fm_puppeteer.js --batch');
        process.exit(0);
    }
    
    if (args[0] === '--batch') {
        // Batch mode with predefined prompts
        const prompts = [
            "Create a peaceful piano melody for relaxation",
            "Generate ambient electronic music with soft pads",
            "Create an upbeat pop track with catchy melody",
            "Generate cinematic orchestral music for epic scenes",
            "Create lo-fi hip hop beats for studying"
        ];
        
        await batchGenerate(prompts);
    } else {
        // Single audio mode
        const prompt = args.join(' ');
        const result = await generateOpenaiFmAudio(prompt, {
            headless: true,
            duration: 30,
            genre: 'ambient',
            tempo: 'medium'
        });
        
        if (result.success) {
            console.log('\n✅ Success! Audio generated.');
        } else {
            console.log('\n❌ Failed to generate audio:', result.error);
            process.exit(1);
        }
    }
}

// Export for use as module
module.exports = { generateOpenaiFmAudio, batchGenerate };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
