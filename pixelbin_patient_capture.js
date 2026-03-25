#!/usr/bin/env node

/**
 * 🎬 PIXELBIN.IO - PATIENT CAPTURE
 * 
 * Waits longer for you to generate video, captures when ready!
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

async function patientCapture() {
    console.log('='.repeat(70));
    console.log('🎬 PIXELBIN.IO - PATIENT TOKEN CAPTURE');
    console.log('='.repeat(70));
    console.log('\n✨ Opens browser with FRESH session');
    console.log('✨ Waits as long as you need');
    console.log('✨ Captures when YOU generate video\n');
    
    let browser = null;
    
    try {
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--start-maximized'
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36');

        console.log('🌐 Opening Pixelbin.io...');
        
        let capturedRequest = null;

        page.on('request', request => {
            const url = request.url();
            
            if (url.includes('/service/public/transformation/v1.0/predictions/veo2/generate') && request.method() === 'POST') {
                console.log('\n🎯 CAUGHT VIDEO GENERATION REQUEST!');
                
                capturedRequest = {
                    timestamp: new Date().toISOString(),
                    url: url,
                    method: request.method(),
                    headers: request.headers(),
                    postData: request.postData()
                };
                
                // Save immediately!
                const filename = `PIXELBIN_FRESH_${Date.now()}.json`;
                fs.writeFileSync(filename, JSON.stringify(capturedRequest, null, 2));
                console.log(`💾 Saved to: ${filename}`);
                
                const clientId = capturedRequest.headers['pixb-cl-id'];
                const captchaMatch = capturedRequest.postData.match(/name="input\.captchaToken"\r\n\r\n([^\r\n]+)/);
                
                console.log('\n✅ TOKENS CAPTURED SUCCESSFULLY!');
                console.log(`   Client ID: ${clientId}`);
                console.log(`   Captcha: ${captchaMatch ? captchaMatch[1].substring(0, 40) + '...' : 'N/A'}`);
                console.log('\n🎯 NOW RUN: node pixelbin_final_working.js "your prompt"');
                console.log('='.repeat(70));
            }
        });

        await page.goto('https://www.pixelbin.io/ai-tools/video-generator', {
            waitUntil: 'domcontentloaded',
            timeout: 90000
        });

        console.log('✅ Page loaded!');
        console.log('\n👉 YOUR TASKS:');
        console.log('1. Sign up/login if needed (FREE account)');
        console.log('2. Type prompt: "A car drifting"');
        console.log('3. Click Generate button');
        console.log('4. Script will auto-capture and save!\n');
        console.log('⏰ I\'ll wait forever... press Ctrl+C when done\n');
        
        // Keep alive until user presses Ctrl+C
        await new Promise(() => {}); // Infinite wait

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (browser) {
            await browser.close();
        }
    }
}

patientCapture();
