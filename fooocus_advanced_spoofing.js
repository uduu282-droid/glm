import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ADVANCED SPOOFING - Guest Credit Reset System
 * 
 * This script:
 * 1. Creates fresh browser instance with new fingerprint
 * 2. Auto-login as guest (gets free credits)
 * 3. Generates image using guest credits
 * 4. Closes browser (destroys identity)
 * 5. Repeats with NEW identity
 */

async function advancedSpoofing() {
    console.log('🎭 Advanced Fooocus FLUX - Guest Identity Spoofing\n');
    console.log('=' .repeat(70));
    
    const results = [];
    const maxGenerations = 5; // Test 5 generations with different identities
    
    for (let i = 0; i < maxGenerations; i++) {
        console.log(`\n🔄 Generation #${i + 1}/${maxGenerations}\n`);
        
        const result = await generateWithFreshIdentity(i + 1);
        results.push(result);
        
        if (result.success) {
            console.log(`✅ SUCCESS! Image generated with NEW identity\n`);
            console.log(`   Image URL: ${result.imageUrl}`);
            console.log(`   Credits Used: 1 point\n`);
        } else {
            console.log(`❌ FAILED: ${result.error}\n`);
        }
        
        // Delay between generations (be respectful)
        if (i < maxGenerations - 1) {
            console.log('⏳ Waiting 10 seconds before next identity...\n');
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
    
    // Summary
    console.log('\n' + '=' .repeat(70));
    console.log('\n📊 SPOOFING TEST SUMMARY:\n');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`Total Attempts: ${results.length}`);
    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);
    console.log(`Success Rate: ${((successful.length / results.length) * 100).toFixed(1)}%\n`);
    
    if (successful.length > 0) {
        console.log('✅ SUCCESSFUL GENERATIONS:\n');
        successful.forEach((result, idx) => {
            console.log(`${idx + 1}. Identity #${result.identityNumber}`);
            console.log(`   Prompt: "${result.prompt}"`);
            console.log(`   Image: ${result.imageUrl}`);
            console.log(`   Time: ${(result.generationTime / 1000).toFixed(2)}s\n`);
        });
    }
    
    // Save results
    const timestamp = new Date().toISOString();
    const outputDir = path.join(__dirname, 'fooocus_spoofing_results');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(
        path.join(outputDir, `spoofing_test_${timestamp.replace(/[:.]/g, '-')}.json`),
        JSON.stringify({
            timestamp,
            totalAttempts: results.length,
            successful: successful.length,
            failed: failed.length,
            results
        }, null, 2)
    );
    
    console.log('📁 Results saved to:', outputDir);
    console.log('\n✨ Advanced spoofing test completed!\n');
}

async function generateWithFreshIdentity(identityNumber) {
    const startTime = Date.now();
    let browser = null;
    
    try {
        // Create NEW browser instance (completely fresh identity)
        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-first-run',
                '--no-default-browser-check'
            ]
        });
        
        const page = await browser.newPage();
        
        // Set UNIQUE user agent for this identity
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        ];
        
        const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
        await page.setUserAgent(randomUA);
        
        // Set random viewport size (more fingerprint variation)
        const widths = [1920, 1366, 1536];
        const heights = [1080, 768, 864];
        const randomWidth = widths[Math.floor(Math.random() * widths.length)];
        const randomHeight = heights[Math.floor(Math.random() * heights.length)];
        await page.setViewport({ width: randomWidth, height: randomHeight });
        
        // Disable automation detection
        await page.evaluateOnNewDocument(() => {
            delete navigator.__proto__.webdriver;
        });
        
        console.log(`   🎭 Identity #${identityNumber}:`);
        console.log(`      User-Agent: ${randomUA.substring(0, 60)}...`);
        console.log(`      Viewport: ${randomWidth}x${randomHeight}`);
        
        // Intercept requests to capture generation endpoint
        let generationCaptured = false;
        let generationData = null;
        
        await page.setRequestInterception(true);
        
        page.on('request', request => {
            const url = request.url();
            const method = request.method();
            
            // Look for the actual generation endpoint
            if (!generationCaptured && 
                url.includes('/api/') && 
                method === 'POST' &&
                !url.includes('auth') && 
                !url.includes('credits') &&
                !url.includes('analytics') &&
                !url.includes('collect')) {
                
                generationCaptured = true;
                generationData = {
                    url,
                    method,
                    headers: request.headers(),
                    postData: request.postData()
                };
                
                console.log(`   🎯 GENERATION REQUEST CAPTURED!`);
                console.log(`      URL: ${url}`);
            }
            
            request.continue();
        });
        
        // Navigate to site
        console.log(`   🌐 Loading site...`);
        await page.goto('https://fooocus-one-eight.vercel.app/apps/flux', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        // Wait for auto guest-login
        console.log(`   ⏳ Waiting for guest login...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check credits balance
        const creditsInfo = await page.evaluate(() => {
            // Try to find credit display in UI
            const creditElements = document.querySelectorAll('*');
            let creditsText = '';
            
            creditElements.forEach(el => {
                const text = el.textContent || '';
                if (text.includes('credit') || text.includes('point')) {
                    creditsText = text.trim().substring(0, 50);
                }
            });
            
            return { creditsText };
        });
        
        console.log(`   💰 Credits: ${creditsInfo.creditsText || 'Unknown (logged in as guest)'}`);
        
        // Find and click the generate button
        console.log(`   🔍 Looking for generate button...`);
        
        const generateButton = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(btn => {
                const text = btn.textContent?.toLowerCase() || '';
                return text.includes('generate') || text.includes('points');
            });
        });
        
        if (!generateButton) {
            throw new Error('Generate button not found');
        }
        
        // Type a prompt first
        console.log(`   ✍️  Typing prompt...`);
        const prompt = `beautiful landscape ${identityNumber}`;
        
        await page.evaluate((promptText) => {
            const textarea = document.querySelector('textarea[placeholder*="Describe"]');
            if (!textarea) throw new Error('Textarea not found');
            textarea.value = promptText;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }, prompt);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Click generate
        console.log(`   🚀 Clicking generate...`);
        await generateButton.click();
        
        // Wait for generation to complete
        console.log(`   ⏳ Waiting for image generation...`);
        
        // Wait for either success or error
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        // Check if image was generated
        const generatedImage = await page.evaluate(() => {
            const images = document.querySelectorAll('img');
            for (const img of images) {
                const src = img.src;
                if (src && (src.includes('i.ibb.co') || src.includes('generated'))) {
                    return src;
                }
            }
            return null;
        });
        
        const generationTime = Date.now() - startTime;
        
        if (generatedImage) {
            return {
                success: true,
                identityNumber,
                prompt,
                imageUrl: generatedImage,
                generationTime,
                userAgent: randomUA,
                viewport: `${randomWidth}x${randomHeight}`,
                capturedGeneration: generationData
            };
        } else {
            return {
                success: false,
                error: 'No generated image found',
                identityNumber,
                generationTime
            };
        }
        
    } catch (error) {
        const generationTime = Date.now() - startTime;
        console.error(`   ❌ Error: ${error.message}`);
        
        return {
            success: false,
            error: error.message,
            identityNumber,
            generationTime
        };
    } finally {
        if (browser) {
            await browser.close();
            console.log(`   🗑️  Identity #${identityNumber} destroyed (browser closed)\n`);
        }
    }
}

// Run the advanced spoofing test
advancedSpoofing().catch(console.error);
