#!/usr/bin/env node

/**
 * 🎬 PIXELBIN.IO - FRESH SESSION CAPTURE
 * 
 * Clears all cookies/storage and opens brand new session
 * to get fresh credits for video generation!
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

async function captureWithFreshSession() {
    console.log('='.repeat(70));
    console.log('🎬 PIXELBIN.IO - FRESH SESSION CAPTURE');
    console.log('='.repeat(70));
    console.log('\nThis will:');
    console.log('1. Open browser with CLEAN slate (no cookies)');
    console.log('2. Get FRESH credits from Pixelbin');
    console.log('3. You generate ONE video normally');
    console.log('4. Script captures ALL authentication');
    console.log('5. Save tokens for unlimited reuse!\n');
    
    let browser = null;
    
    try {
        // Launch with fresh profile - NO cookies!
        console.log('🚀 Opening FRESH browser session (no cookies)...');
        
        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
                '--user-data-dir="C:\\temp\\pixelbin-fresh-profile"'  // Fresh profile!
            ]
        });

        const page = await browser.newPage();
        
        // Clear everything
        await page.deleteCookie(...await page.cookies());
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        console.log('✅ Fresh browser ready - NO cookies, NO storage!');
        console.log('🌐 Opening Pixelbin.io...\n');
        
        let capturedRequest = null;

        // Monitor for the video generation request
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
            timeout: 60000
        });

        console.log('✅ Page loaded in FRESH session!');
        console.log('\n👉 NOW YOU DO THIS:');
        console.log('1. Sign up/login if needed (fresh account = fresh credits!)');
        console.log('2. Type ANY prompt (e.g., "test video")');
        console.log('3. Click Generate button');
        console.log('4. Wait for it to start processing');
        console.log('5. Script will capture automatically!\n');
        console.log('⏰ Browser stays open for 120 seconds...\n');
        
        // Wait for user to generate video
        await new Promise(resolve => setTimeout(resolve, 120000));

        console.log('\n\n' + '='.repeat(70));
        console.log('📊 CAPTURE SUMMARY');
        console.log('='.repeat(70));
        
        if (capturedRequest) {
            // Save captured request
            const filename = `PIXELBIN_FRESH_TOKENS_${Date.now()}.json`;
            fs.writeFileSync(filename, JSON.stringify(capturedRequest, null, 2));
            
            console.log('\n✅ SUCCESS! Captured with FRESH SESSION!');
            console.log(`📄 Saved to: ${filename}`);
            
            // Extract key info
            const clientId = capturedRequest.headers['pixb-cl-id'];
            const captchaMatch = capturedRequest.postData.match(/name="input\.captchaToken"\r\n\r\n([^\r\n]+)/);
            
            console.log('\n🔑 Captured Tokens:');
            console.log(`   Client ID: ${clientId}`);
            console.log(`   Captcha Token: ${captchaMatch ? captchaMatch[1].substring(0, 50) + '...' : 'N/A'}`);
            console.log(`   Signature: ${capturedRequest.headers['x-ebg-signature'].substring(0, 40)}...`);
            
            console.log('\n🎯 HOW TO USE:');
            console.log(`   node pixelbin_final_working.js "your prompt"`);
            console.log('\n💡 These tokens are from FRESH SESSION with full credits!');
            console.log('='.repeat(70));
            
        } else {
            console.log('\n❌ No request captured!');
            console.log('Make sure you:');
            console.log('1. Created fresh account/logged in');
            console.log('2. Typed a prompt');
            console.log('3. Clicked Generate button');
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

captureWithFreshSession();
