const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * TAAFT Image Generator - Browser Automation
 * Uses Puppeteer to automate the real website
 */

async function generateTaaftImage(prompt, options = {}) {
    const {
        outputPath = null,
        width = 1024,
        height = 1024,
        aspectRatio = '1:1',
        timeout = 120000, // 2 minutes for generation
        headless = true,
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
                '--window-size=1920x1080'
            ]
        });

        const page = await browser.newPage();
        
        // Set viewport
        await page.setViewport({ width: 1920, height: 1080 });

        // Set realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36');

        console.log('📥 Navigating to TAAFT image generator...');
        
        // Navigate to the page
        await page.goto('https://theresanaiforthat.com/@taaft/image-generator/', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        console.log('⏳ Waiting for page to load...');
        
        // Wait for the textarea to be available
        await page.waitForSelector('textarea[placeholder*="Describe"]', { timeout: 10000 });
        
        console.log('✏️ Entering prompt...');
        
        // Type the prompt
        await page.type('textarea[placeholder*="Describe"]', prompt, { delay: 50 });

        // Select aspect ratio if needed
        if (aspectRatio) {
            try {
                console.log(`📐 Setting aspect ratio to ${aspectRatio}...`);
                const aspectButton = await page.$(`button:has-text("${aspectRatio}")`);
                if (aspectButton) {
                    await aspectButton.click();
                }
            } catch (e) {
                console.log('⚠️ Could not set aspect ratio, using default');
            }
        }

        console.log('🎨 Clicking Generate button...');
        
        // Click the generate button
        const generateButton = await page.$('button:has-text("Generate")');
        if (!generateButton) {
            throw new Error('Generate button not found');
        }
        
        await generateButton.click();

        console.log('⏳ Waiting for image generation (this may take 30-60 seconds)...');

        // Wait for the generated image to appear
        // Look for either the image itself or a download button
        await page.waitForFunction(() => {
            // Check for generated images
            const images = document.querySelectorAll('img');
            for (let img of images) {
                if (img.src && img.src.includes('generated')) {
                    return img;
                }
            }
            
            // Or check for download buttons
            const downloadButtons = Array.from(document.querySelectorAll('button, a'));
            for (let btn of downloadButtons) {
                if (btn.textContent.toLowerCase().includes('download')) {
                    return btn;
                }
            }
            
            return null;
        }, { timeout: timeout });

        console.log('✅ Image generated successfully!');

        // Try to get the image
        const imageData = await page.evaluate(() => {
            // Find generated images
            const images = Array.from(document.querySelectorAll('img'));
            
            for (let img of images) {
                if (img.src && (img.src.includes('data:image') || img.src.includes('generated'))) {
                    return {
                        src: img.src,
                        width: img.naturalWidth,
                        height: img.naturalHeight
                    };
                }
            }
            
            return null;
        });

        if (imageData) {
            console.log(`🖼️ Found image: ${imageData.width}x${imageData.height}`);
            
            // If it's a data URL, save it
            if (imageData.src.startsWith('data:image')) {
                const base64Data = imageData.src.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
                const imageBuffer = Buffer.from(base64Data, 'base64');
                
                const filename = outputPath || `taaft_puppeteer_generated_${Date.now()}.png`;
                fs.writeFileSync(filename, imageBuffer);
                console.log(`💾 Image saved to: ${filename}`);
                
                return {
                    success: true,
                    filename: filename,
                    prompt: prompt,
                    timestamp: new Date().toISOString(),
                    size: imageBuffer.length
                };
            } else {
                // It's a URL - download it
                const imageUrl = imageData.src;
                console.log(`🔗 Image URL: ${imageUrl}`);
                
                const response = await page.goto(imageUrl);
                const imageBuffer = await response.buffer();
                
                const filename = outputPath || `taaft_puppeteer_generated_${Date.now()}.png`;
                fs.writeFileSync(filename, imageBuffer);
                console.log(`💾 Image saved to: ${filename}`);
                
                return {
                    success: true,
                    filename: filename,
                    prompt: prompt,
                    url: imageUrl,
                    timestamp: new Date().toISOString(),
                    size: imageBuffer.length
                };
            }
        } else {
            console.log('⚠️ Could not find generated image in page');
            return {
                success: false,
                error: 'Image not found in page',
                prompt: prompt
            };
        }

    } catch (error) {
        console.error('❌ Error generating image:', error.message);
        
        // Take screenshot for debugging
        if (browser) {
            try {
                const pages = await browser.pages();
                if (pages.length > 0) {
                    const screenshotPath = `taaft_error_${Date.now()}.png`;
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
 * Batch generate multiple images
 */
async function batchGenerate(prompts, outputDir = './taaft_batch_output') {
    console.log(`📦 Starting batch generation of ${prompts.length} images...`);
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const results = [];
    
    for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        const outputPath = path.join(outputDir, `image_${i + 1}_${Date.now()}.png`);
        
        console.log(`\n🎨 Generating image ${i + 1}/${prompts.length}`);
        console.log(`Prompt: ${prompt}`);
        
        const result = await generateTaaftImage(prompt, {
            outputPath: outputPath,
            timeout: 120000
        });
        
        results.push(result);
        
        // Wait between generations to avoid rate limiting
        if (i < prompts.length - 1) {
            console.log('⏳ Waiting 3 seconds before next generation...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    // Save results summary
    const summaryPath = path.join(outputDir, 'batch_results.json');
    fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));
    console.log(`\n📊 Results saved to: ${summaryPath}`);
    
    const successful = results.filter(r => r.success).length;
    console.log(`✅ Batch complete: ${successful}/${prompts.length} images generated successfully`);
    
    return results;
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('TAAFT Image Generator - Puppeteer Automation');
        console.log('\nUsage:');
        console.log('  node taafft_puppeteer.js "your prompt here"');
        console.log('  node taafft_puppeteer.js --batch');
        console.log('\nExamples:');
        console.log('  node taafft_puppeteer.js "A beautiful sunset over mountains"');
        console.log('  node taafft_puppeteer.js --batch');
        process.exit(0);
    }
    
    if (args[0] === '--batch') {
        // Batch mode with predefined prompts
        const prompts = [
            "A serene lake at sunset with mountains in background",
            "A cute cat sitting on a windowsill looking outside",
            "Futuristic city with flying cars and tall skyscrapers",
            "A magical forest with glowing mushrooms and fairy lights",
            "An astronaut riding a horse on Mars"
        ];
        
        await batchGenerate(prompts);
    } else {
        // Single image mode
        const prompt = args.join(' ');
        const result = await generateTaaftImage(prompt, {
            headless: true
        });
        
        if (result.success) {
            console.log('\n✅ Success! Image generated.');
        } else {
            console.log('\n❌ Failed to generate image:', result.error);
            process.exit(1);
        }
    }
}

// Export for use as module
module.exports = { generateTaaftImage, batchGenerate };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
