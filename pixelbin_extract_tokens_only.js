#!/usr/bin/env node

/**
 * 🎬 PIXELBIN.IO - TOKEN EXTRACTOR (NO AUTOMATION!)
 * 
 * Just opens browser, waits for JS to generate tokens,
 * extracts them, and closes. No video generation needed!
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

async function extractTokens() {
    console.log('='.repeat(70));
    console.log('🔑 PIXELBIN TOKEN EXTRACTOR');
    console.log('='.repeat(70));
    console.log('\nThis will:');
    console.log('1. Open browser to pixelbin.io');
    console.log('2. Wait for JavaScript to generate tokens');
    console.log('3. Extract ALL authentication tokens');
    console.log('4. Save them for use in simple scripts');
    console.log('5. Close browser (no video generation!)');
    console.log('\n⏱️  Takes ~10 seconds...\n');
    
    let browser = null;
    
    try {
        browser = await puppeteer.launch({
            headless: false, // Show browser so you see what's happening
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        console.log('🌐 Opening Pixelbin.io...');
        
        await page.goto('https://www.pixelbin.io/ai-tools/video-generator', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        console.log('✅ Page loaded');
        console.log('⏳ Waiting for JavaScript to generate tokens...');
        
        // Wait for page to fully load and JS to run
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('\n📡 Scanning for authentication tokens...\n');
        
        // Capture all requests to find our tokens
        let foundTokens = null;
        
        const requestPromise = new Promise((resolve) => {
            page.on('request', request => {
                const url = request.url();
                
                if (url.includes('/service/public/transformation/v1.0/predictions/veo2/generate')) {
                    const headers = request.headers();
                    
                    if (headers['pixb-cl-id'] && headers['x-ebg-signature']) {
                        console.log('🎯 FOUND AUTHENTICATED REQUEST!\n');
                        
                        foundTokens = {
                            timestamp: new Date().toISOString(),
                            url: url,
                            method: 'POST',
                            headers: {
                                'pixb-cl-id': headers['pixb-cl-id'],
                                'x-ebg-param': headers['x-ebg-param'],
                                'x-ebg-signature': headers['x-ebg-signature'],
                                'user-agent': headers['user-agent'],
                                'referer': 'https://www.pixelbin.io/',
                                'origin': 'https://www.pixelbin.io'
                            }
                        };
                        
                        resolve(foundTokens);
                    }
                }
            });
        });
        
        // Trigger token generation by interacting with page
        console.log('✍️  Clicking on input field to trigger JS...');
        
        try {
            // Try to click the input field to activate the page
            await page.click('textarea, input[type="text"], [contenteditable="true"]').catch(() => {});
        } catch (e) {
            console.log('   (Could not click, continuing...)');
        }
        
        // Wait a bit more for any background requests
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // If we didn't capture a request, try to extract from page JavaScript
        if (!foundTokens) {
            console.log('\n📊 Trying to extract tokens from page JavaScript...');
            
            try {
                const extractedData = await page.evaluate(() => {
                    // Try to find tokens in localStorage
                    const storage = {};
                    for (let key in localStorage) {
                        if (key.includes('pixel') || key.includes('token') || key.includes('auth')) {
                            storage[key] = localStorage[key];
                        }
                    }
                    
                    // Try to find tokens in cookies
                    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
                        const [key, value] = cookie.trim().split('=');
                        if (key && value) {
                            acc[key] = value;
                        }
                        return acc;
                    }, {});
                    
                    return {
                        localStorage: storage,
                        cookies: cookies,
                        userAgent: navigator.userAgent
                    };
                });
                
                console.log('\n📋 Found in localStorage:', Object.keys(extractedData.localStorage).length, 'items');
                console.log('📋 Found in Cookies:', Object.keys(extractedData.cookies).length, 'items');
                
                // Even without specific tokens, we can construct a request
                console.log('\n💡 Will attempt to use captured template with fresh session...');
                
            } catch (error) {
                console.log('   Could not extract from page:', error.message);
            }
        }
        
        console.log('\n\n' + '='.repeat(70));
        console.log('📊 EXTRACTION COMPLETE');
        console.log('='.repeat(70));
        
        if (foundTokens) {
            const filename = `PIXELBIN_FRESH_TOKENS_${Date.now()}.json`;
            fs.writeFileSync(filename, JSON.stringify(foundTokens, null, 2));
            
            console.log('\n✅ SUCCESS! Tokens extracted and saved!');
            console.log(`📄 File: ${filename}`);
            console.log('\n🎯 Usage:');
            console.log(`   node pixelbin_use_simple.js "your prompt"`);
            console.log('\n💡 These tokens are FRESH and should work immediately!');
            console.log('='.repeat(70));
            
        } else {
            console.log('\n⚠️  Could not capture live tokens.');
            console.log('\n💡 The website might:');
            console.log('   1. Only generate tokens when you actually type a prompt');
            console.log('   2. Use lazy loading (tokens generated on-demand)');
            console.log('   3. Require interaction before generating auth');
            console.log('\n🎯 Try this instead:');
            console.log('   1. Visit https://www.pixelbin.io/ai-tools/video-generator');
            console.log('   2. Type ANY prompt and click Generate');
            console.log('   3. The capture script will get the tokens automatically');
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

extractTokens();
