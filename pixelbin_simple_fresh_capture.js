#!/usr/bin/env node

/**
 * 🎬 PIXELBIN.IO - SIMPLE FRESH CAPTURE
 * 
 * Opens clean browser, you generate video, script captures tokens!
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

async function simpleFreshCapture() {
    console.log('='.repeat(70));
    console.log('🎬 PIXELBIN.IO - SIMPLE FRESH CAPTURE');
    console.log('='.repeat(70));
    console.log('\n✨ Opens FRESH browser (no cookies)');
    console.log('✨ You get NEW credits automatically');
    console.log('✨ Generate ONE video normally');
    console.log('✨ Script captures everything!\n');
    
    let browser = null;
    
    try {
        console.log('🚀 Launching fresh browser...');
        
        // Fresh Chrome profile with no previous data
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--start-maximized',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        });

        const page = await browser.newPage();
        
        // Set realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36');

        console.log('✅ Fresh browser ready!');
        console.log('🌐 Opening Pixelbin.io...\n');
        
        let capturedRequest = null;

        // Monitor for video generation request
        page.on('request', request => {
            const url = request.url();
            
            if (url.includes('/service/public/transformation/v1.0/predictions/veo2/generate') && request.method() === 'POST') {
                console.log('\n🎯 CAUGHT VIDEO GENERATION REQUEST!\n');
                
                capturedRequest = {
                    timestamp: new Date().toISOString(),
                    url: url,
                    method: request.method(),
                    headers: request.headers(),
                    postData: request.postData()
                };
            }
        });

        await page.goto('https://www.pixelbin.io/ai-tools/video-generator', {
            waitUntil: 'domcontentloaded',
            timeout: 90000
        });

        console.log('✅ Page loaded!');
        console.log('\n👉 WHAT TO DO NOW:');
        console.log('1. Wait for page to fully load');
        console.log('2. If needed, sign up/login (FREE!)');
        console.log('3. Type prompt: "test"');
        console.log('4. Click Generate button');
        console.log('5. Script will capture automatically!\n');
        console.log('⏰ Waiting 180 seconds...\n');
        
        // Wait for user action
        await new Promise(resolve => setTimeout(resolve, 180000));

        console.log('\n\n' + '='.repeat(70));
        
        if (capturedRequest) {
            const filename = `PIXELBIN_FRESH_${Date.now()}.json`;
            fs.writeFileSync(filename, JSON.stringify(capturedRequest, null, 2));
            
            console.log('✅ SUCCESS! Tokens captured!');
            console.log(`📄 File: ${filename}`);
            
            const clientId = capturedRequest.headers['pixb-cl-id'];
            const captchaMatch = capturedRequest.postData.match(/name="input\.captchaToken"\r\n\r\n([^\r\n]+)/);
            
            console.log('\n🔑 Tokens:');
            console.log(`   Client ID: ${clientId}`);
            console.log(`   Captcha: ${captchaMatch ? captchaMatch[1].substring(0, 40) + '...' : 'N/A'}`);
            
            console.log('\n🎯 USE IT:');
            console.log(`   node pixelbin_final_working.js "your prompt"`);
            console.log('='.repeat(70));
            
        } else {
            console.log('❌ No request captured!');
            console.log('Did you generate a video on the website?');
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

simpleFreshCapture();
