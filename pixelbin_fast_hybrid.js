#!/usr/bin/env node

/**
 * 🎬 PIXELBIN.IO - HYBRID VERSION (FAST!)
 * 
 * Quick browser session to get fresh tokens (5 sec),
 * then direct API call. Much faster than full automation!
 */

import puppeteer from 'puppeteer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function fastGenerate() {
    console.log('='.repeat(70));
    console.log('🎬 PIXELBIN.IO - FAST HYBRID GENERATOR');
    console.log('='.repeat(70));
    
    const prompt = process.argv[2] || "A beautiful sunset";
    console.log(`\n📝 Prompt: ${prompt}`);
    
    let browser = null;
    let capturedRequest = null;
    
    try {
        // STEP 1: Quick token capture (5-7 seconds)
        console.log('\n⚡ STEP 1/3: Getting fresh tokens (quick)...');
        
        browser = await puppeteer.launch({
            headless: true, // Headless for speed!
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
                '--no-first-run',
                '--no-default-browser-check'
            ]
        });

        const page = await browser.newPage();
        
        // Better stealth - mimic real browser
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Extra anti-detection
        await page.evaluateOnNewDocument(() => {
            // Remove webdriver property
            delete navigator.__proto__.webdriver;
            // Mock plugins
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
            // Mock languages
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        });

        // Monitor for API requests
        page.on('request', request => {
            const url = request.url();
            if (url.includes('/service/public/transformation/v1.0/predictions/veo2/generate') && request.method() === 'POST') {
                capturedRequest = {
                    url: url,
                    headers: request.headers(),
                    postData: request.postData()
                };
            }
        });

        console.log('   Opening pixelbin.io...');
        await page.goto('https://www.pixelbin.io/ai-tools/video-generator', {
            waitUntil: 'domcontentloaded',
            timeout: 45000
        });

        console.log('   ✅ Page loaded');
        console.log('   ⏳ Waiting for JS initialization...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // If still no capture, trigger by typing in input
        if (!capturedRequest) {
            console.log('   ✍️  Triggering token generation...');
            try {
                await page.type('textarea[placeholder*="prompt"], input[placeholder*="prompt"]', 'test', { delay: 10 });
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (e) {
                console.log('   (Could not type, continuing...)');
            }
        }

        await browser.close();
        browser = null;

        if (!capturedRequest) {
            console.log('\n❌ Could not capture tokens from page.');
            console.log('   The site might only generate tokens on actual video generation.');
            return;
        }

        console.log('   ✅ Tokens captured!');
        console.log('   🗑️  Browser closed (saving resources)');

        // STEP 2: Use captured tokens immediately
        console.log('\n⚡ STEP 2/3: Generating video with fresh tokens...');

        const clientId = capturedRequest.headers['pixb-cl-id'];
        const ebgParam = capturedRequest.headers['x-ebg-param'];
        const ebgSignature = capturedRequest.headers['x-ebg-signature'];

        // Extract captcha token
        const captchaMatch = capturedRequest.postData.match(/name="input\.captchaToken"\r\n\r\n([^\r\n]+)/);
        if (!captchaMatch) {
            console.log('   ❌ No captchaToken found in captured request!');
            return;
        }
        const captchaToken = captchaMatch[1];

        // Prepare request with YOUR prompt
        const formData = new FormData();
        formData.append('input.prompt', prompt);
        formData.append('input.aspect_ratio', '16:9');
        formData.append('input.duration', '5');
        formData.append('input.category', 'text-to-video');
        formData.append('input.background', 'prompt');
        formData.append('input.captchaToken', captchaToken);

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://www.pixelbin.io',
            'Referer': 'https://www.pixelbin.io/',
            'pixb-cl-id': clientId,
            'x-ebg-param': ebgParam,
            'x-ebg-signature': ebgSignature,
            ...formData.getHeaders()
        };

        console.log('   📤 Sending API request...');

        const response = await axios.post(capturedRequest.url, formData, {
            headers: headers,
            timeout: 120000,
            transformRequest: [(data) => data],
            transformResponse: [(data) => data]
        });

        console.log('   ✅ Status:', response.status);

        const responseData = JSON.parse(response.data);
        
        if (!responseData.id && !responseData.prediction_id) {
            console.log('   ⚠️  Unexpected response format');
            console.log('   Response:', JSON.stringify(responseData, null, 2));
            return;
        }

        const predictionId = responseData.id || responseData.prediction_id;
        console.log('   🎉 Generation started! ID:', predictionId);

        // STEP 3: Poll for completion
        console.log('\n⚡ STEP 3/3: Polling for result...');

        const pollUrl = `https://api.pixelbin.io/service/public/transformation/v1.0/predictions/veo2--generate--${predictionId}`;
        const pollHeaders = {
            'Accept': 'application/json, text/plain, */*',
            'pixb-cl-id': clientId,
            'x-ebg-param': ebgParam,
            'x-ebg-signature': ebgSignature
        };

        for (let i = 1; i <= 60; i++) {
            console.log(`   Poll #${i}...`);
            
            try {
                const pollResponse = await axios.get(pollUrl, {
                    headers: pollHeaders,
                    timeout: 60000
                });

                const pollData = JSON.parse(pollResponse.data);

                if (pollData.status === 'complete' || pollData.url || (pollData.output && pollData.output.url)) {
                    const videoUrl = pollData.url || (pollData.output && pollData.output.url);
                    
                    console.log('\n' + '='.repeat(70));
                    console.log('🎉 VIDEO READY!');
                    console.log('='.repeat(70));
                    console.log('URL:', videoUrl);
                    console.log(`\ncurl -o video.mp4 "${videoUrl}"`);
                    console.log('='.repeat(70));
                    
                    return { success: true, url: videoUrl };
                }

                if (pollData.status === 'failed' || pollData.error) {
                    console.log('   ❌ Failed:', pollData.error || pollData.message);
                    return { success: false, error: pollData.error || pollData.message };
                }

                await new Promise(resolve => setTimeout(resolve, 3000));

            } catch (error) {
                console.log('   Error:', error.message);
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        console.log('\n⏰ Timeout after 60 polls');
        return { success: false, error: 'Timeout' };

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (browser) {
            await browser.close();
        }
        return { success: false, error: error.message };
    }
}

const result = await fastGenerate();
process.exit(result?.success ? 0 : 1);
