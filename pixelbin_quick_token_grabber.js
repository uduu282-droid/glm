#!/usr/bin/env node

/**
 * 🎬 PIXELBIN.IO - QUICK TOKEN GRABBER
 * 
 * Opens browser, auto-generates ONE video to capture fresh tokens,
 * saves them for reuse in simple scripts.
 * 
 * Takes ~15 seconds, gives you tokens for ~5 fast generations!
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

async function quickTokenGrab() {
    console.log('='.repeat(70));
    console.log('🎯 PIXELBIN QUICK TOKEN GRABBER');
    console.log('='.repeat(70));
    console.log('\nThis will:');
    console.log('1. Open browser to pixelbin.io (~5 sec)');
    console.log('2. Auto-generate ONE test video (~8 sec)');
    console.log('3. Capture ALL authentication tokens');
    console.log('4. Save tokens for use in simple scripts');
    console.log('5. Close browser');
    console.log('\n⏱️  Total time: ~15 seconds');
    console.log('💡 Then use tokens for ~5 fast API calls!\n');
    
    let browser = null;
    let capturedRequest = null;
    
    try {
        browser = await puppeteer.launch({
            headless: false, // Show browser so you see progress
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        console.log('📡 Monitoring network requests...\n');
        
        // Capture the video generation request
        page.on('request', request => {
            const url = request.url();
            
            if (url.includes('/service/public/transformation/v1.0/predictions/veo2/generate') && request.method() === 'POST') {
                console.log('🎯 CAUGHT VIDEO GENERATION REQUEST!\n');
                
                capturedRequest = {
                    timestamp: new Date().toISOString(),
                    url: url,
                    method: 'POST',
                    headers: request.headers(),
                    postData: request.postData()
                };
            }
        });

        console.log('🌐 Opening Pixelbin.io...');
        await page.goto('https://www.pixelbin.io/ai-tools/video-generator', {
            waitUntil: 'domcontentloaded',
            timeout: 45000
        });

        console.log('✅ Page loaded');
        console.log('⏳ Waiting for page to initialize...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Find and fill the prompt field
        console.log('\n✍️  Entering test prompt...');
        
        try {
            const inputSelector = 'textarea[placeholder*="prompt"], textarea[placeholder*="describe"], input[placeholder*="prompt"]';
            await page.waitForSelector(inputSelector, { timeout: 10000 });
            
            const inputField = await page.$(inputSelector);
            if (inputField) {
                await inputField.click();
                await inputField.type('Quick token grab test', { delay: 50 });
                console.log('✅ Prompt entered');
                
                // Wait for any JS to update
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Find and click generate button
                console.log('\n🎬 Clicking Generate button...');
                const buttonSelector = 'button:has-text("Generate"), button[type="submit"], .generate-button, [class*="generate"]';
                
                const buttons = await page.$$(buttonSelector);
                if (buttons.length > 0) {
                    await buttons[0].click();
                    console.log('✅ Generate clicked!');
                    
                    console.log('\n⏳ Waiting for API request...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                } else {
                    console.log('⚠️  Could not find Generate button');
                }
            }
        } catch (error) {
            console.log('⚠️  Could not auto-fill:', error.message);
        }

        console.log('\n\n' + '='.repeat(70));
        
        if (capturedRequest) {
            // Save captured request
            const filename = `PIXELBIN_FRESH_TOKENS_${Date.now()}.json`;
            fs.writeFileSync(filename, JSON.stringify(capturedRequest, null, 2));
            
            console.log('✅ SUCCESS! Tokens captured and saved!');
            console.log(`📄 File: ${filename}`);
            
            // Extract key info
            const clientId = capturedRequest.headers['pixb-cl-id'];
            const captchaMatch = capturedRequest.postData.match(/name="input\.captchaToken"\r\n\r\n([^\r\n]+)/);
            
            console.log('\n📊 Captured Tokens:');
            console.log(`   Client ID: ${clientId}`);
            console.log(`   Captcha Token: ${captchaMatch ? captchaMatch[1].substring(0, 50) + '...' : 'N/A'}`);
            console.log(`   Signature: ${capturedRequest.headers['x-ebg-signature'].substring(0, 40)}...`);
            
            console.log('\n🎯 HOW TO USE:');
            console.log(`   node pixelbin_simple_no_browser.js "your prompt"`);
            console.log('\n💡 These tokens are FRESH and should work for ~5 videos!');
            console.log('⚠️  After rate limit hits, run this script again.');
            console.log('='.repeat(70));
            
        } else {
            console.log('❌ No API request captured!');
            console.log('Make sure you generated a video on the website.');
            console.log('='.repeat(70));
        }
        
        await browser.close();

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (browser) {
            await browser.close();
        }
    }
}

quickTokenGrab();
