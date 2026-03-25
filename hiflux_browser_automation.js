import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * HiFlux AI Browser Automation
 * 
 * This script automates the HiFlux.ai web interface to generate images.
 * Note: This is for educational purposes. Check ToS before using.
 */

async function generateImageWithHiFlux(prompt, options = {}) {
    const {
        timeout = 120000, // 2 minutes timeout
        waitForImage = 30000, // 30 seconds for generation
        saveDir = './hiflux_generated_images',
        verbose = true
    } = options;
    
    if (verbose) {
        console.log('🎨 HiFlux AI Image Generator (Browser Automation)\n');
        console.log('=' .repeat(60));
        console.log(`Prompt: "${prompt}"\n`);
    }
    
    const browser = await puppeteer.launch({
        headless: false, // Keep visible for debugging and potential captchas
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-dev-shm-usage'
        ]
    });
    
    try {
        const page = await browser.newPage();
        
        // Set realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        
        // Navigate to HiFlux
        if (verbose) console.log('🌐 Loading HiFlux.ai...');
        await page.goto('https://hiflux.ai/', {
            waitUntil: 'networkidle2',
            timeout: timeout
        });
        
        if (verbose) console.log('✅ Page loaded\n');
        
        // Wait for the input field
        if (verbose) console.log('⏳ Waiting for prompt input...');
        await page.waitForSelector('#prompt', { timeout: 10000 });
        
        // Clear and type the prompt
        if (verbose) console.log('✍️  Typing prompt...');
        await page.click('#prompt');
        await page.keyboard.down('Control');
        await page.keyboard.press('a');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
        await page.type('#prompt', prompt, { delay: 50 });
        
        if (verbose) console.log('✅ Prompt entered\n');
        
        // Find and click the generate button
        if (verbose) console.log('🔍 Looking for generate button...');
        
        // Try multiple selectors for the generate button
        const generateButtonSelectors = [
            'button[class*="generate"]',
            'button[class*="create"]',
            '[role="button"]:has-text("Generate")',
            '[role="button"]:has-text("Create")',
            'form button[type="submit"]'
        ];
        
        let generateBtn = null;
        for (const selector of generateButtonSelectors) {
            try {
                generateBtn = await page.$(selector);
                if (generateBtn) {
                    if (verbose) console.log(`✓ Found button with selector: ${selector}`);
                    break;
                }
            } catch (e) {
                // Try next selector
            }
        }
        
        if (!generateBtn) {
            // Fallback: look for any button near the prompt
            generateBtn = await page.evaluateHandle(() => {
                const promptInput = document.querySelector('#prompt');
                if (!promptInput) return null;
                
                // Look for buttons in parent containers
                let parent = promptInput.parentElement;
                while (parent && parent !== document.body) {
                    const button = parent.querySelector('button');
                    if (button) return button;
                    parent = parent.parentElement;
                }
                return null;
            });
        }
        
        if (generateBtn) {
            if (verbose) console.log('🎯 Clicking generate button...\n');
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: waitForImage }),
                generateBtn.click()
            ]);
        } else {
            if (verbose) console.log('❌ Could not find generate button');
            throw new Error('Generate button not found');
        }
        
        // Wait for image generation
        if (verbose) console.log('⏳ Waiting for image generation...');
        
        // Wait for any new image to appear
        await page.waitForFunction(() => {
            const images = document.querySelectorAll('img');
            return Array.from(images).some(img => {
                const src = img.src;
                return src && (src.includes('data:image') || src.includes('generated') || src.includes('result'));
            });
        }, { timeout: waitForImage });
        
        if (verbose) console.log('✅ Image generated!\n');
        
        // Extract the generated image
        const imageUrl = await page.evaluate(() => {
            const images = document.querySelectorAll('img');
            for (const img of images) {
                const src = img.src;
                if (src && (src.includes('data:image') || 
                           src.includes('generated') || 
                           src.includes('result') ||
                           src.includes('blob:'))) {
                    return src;
                }
            }
            return null;
        });
        
        if (!imageUrl) {
            throw new Error('No generated image found');
        }
        
        if (verbose) {
            console.log('🖼️  Generated Image URL:');
            console.log(imageUrl.substring(0, 100) + '...\n');
        }
        
        // Save the image
        if (verbose) console.log('💾 Saving image...');
        
        // Create output directory
        if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir, { recursive: true });
        }
        
        // Generate filename
        const timestamp = Date.now();
        const safePrompt = prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_');
        const filename = `hiflux_${safePrompt}_${timestamp}.png`;
        const filepath = path.join(saveDir, filename);
        
        // Download image
        if (imageUrl.startsWith('data:')) {
            // Base64 image
            const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
            fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
        } else {
            // URL image - navigate to it and screenshot
            const newPage = await browser.newPage();
            await newPage.goto(imageUrl);
            await newPage.screenshot({ path: filepath });
            await newPage.close();
        }
        
        if (verbose) {
            console.log('✅ Image saved successfully!\n');
            console.log('📁 File:', filepath);
            console.log('\n' + '=' .repeat(60));
            console.log('✨ Generation complete!\n');
        }
        
        return {
            success: true,
            imageUrl,
            filepath,
            prompt,
            timestamp
        };
        
    } catch (error) {
        console.error('\n❌ Error during generation:', error.message);
        
        // Take screenshot for debugging
        try {
            const screenshotPath = path.join(__dirname, 'hiflux_error_screenshot.png');
            await page.screenshot({ path: screenshotPath });
            console.log('📸 Error screenshot saved:', screenshotPath);
        } catch (e) {
            // Ignore screenshot errors
        }
        
        return {
            success: false,
            error: error.message,
            prompt,
            timestamp: Date.now()
        };
    } finally {
        await browser.close();
    }
}

// Example usage
async function main() {
    const testPrompts = [
        'a cute cat',
        'sunset over mountains',
        'futuristic city'
    ];
    
    const results = [];
    
    for (const prompt of testPrompts) {
        const result = await generateImageWithHiFlux(prompt, {
            verbose: true,
            saveDir: './hiflux_test_generations'
        });
        
        results.push(result);
        
        // Delay between generations to avoid rate limiting
        if (prompt !== testPrompts[testPrompts.length - 1]) {
            console.log('⏳ Waiting 10 seconds before next generation...\n');
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
    
    // Summary
    console.log('\n📊 Generation Summary:\n');
    console.log('=' .repeat(60));
    console.log(`Total Attempts: ${results.length}`);
    console.log(`Successful: ${results.filter(r => r.success).length}`);
    console.log(`Failed: ${results.filter(r => !r.success).length}\n`);
    
    results.forEach((result, i) => {
        console.log(`${i + 1}. "${result.prompt}"`);
        if (result.success) {
            console.log(`   ✅ Success: ${result.filepath}`);
        } else {
            console.log(`   ❌ Failed: ${result.error}`);
        }
    });
    
    // Save results
    const resultsFile = path.join(__dirname, 'hiflux_generation_results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log('\n📁 Results saved to:', resultsFile);
    console.log('\n✨ All done!\n');
}

// Run if this is the main module
if (process.argv[1] === process.argv[1]) {
    main().catch(console.error);
}

export { generateImageWithHiFlux };
