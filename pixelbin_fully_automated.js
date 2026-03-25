#!/usr/bin/env node

import puppeteer from 'puppeteer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

/**
 * 🎬 FULLY AUTOMATED PIXELBIN.IO VIDEO GENERATOR
 * One command: Opens browser, captures tokens, generates video, downloads it!
 */

async function fullyAutomated() {
    console.log('='.repeat(70));
    console.log('🎬 PIXELBIN.IO - FULLY AUTOMATED VIDEO GENERATOR');
    console.log('='.repeat(70));
    
    const prompt = process.argv[2] || "A beautiful sunset over mountains";
    console.log(`\n📝 Prompt: ${prompt}`);
    
    let browser = null;
    
    try {
        // Step 1: Launch browser and capture tokens
        console.log('\n' + '='.repeat(70));
        console.log('STEP 1: Capturing fresh authentication tokens...');
        console.log('='.repeat(70));
        
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        let capturedRequest = null;

        page.on('request', request => {
            const url = request.url();
            
            if (url.includes('/service/public/transformation/v1.0/predictions/veo2/generate') && request.method() === 'POST') {
                console.log('\n✅ Captured video generation request!');
                
                capturedRequest = {
                    url: url,
                    method: request.method(),
                    headers: request.headers(),
                    postData: request.postData()
                };
            }
        });

        console.log('\n🌐 Opening Pixelbin.io...');
        await page.goto('https://www.pixelbin.io/ai-tools/video-generator', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        console.log('⏳ Waiting for page to load...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Find and fill the prompt field
        console.log('\n✍️  Entering prompt automatically...');
        
        // Try to find input field
        const inputSelector = 'textarea[placeholder*="prompt"], textarea[placeholder*="describe"], input[placeholder*="prompt"]';
        
        try {
            await page.waitForSelector(inputSelector, { timeout: 10000 });
            const inputField = await page.$(inputSelector);
            
            if (inputField) {
                await inputField.click();
                await inputField.type(prompt, { delay: 50 });
                console.log('✅ Prompt entered:', prompt);
                
                // Wait a bit for captcha to generate
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Try to find and click generate button
                const buttonSelector = 'button:has-text("Generate"), button[type="submit"], .generate-button, [class*="generate"]';
                
                console.log('\n🎬 Clicking Generate button...');
                const buttons = await page.$$(buttonSelector);
                
                if (buttons.length > 0) {
                    await buttons[0].click();
                    console.log('✅ Generate button clicked!');
                    
                    // Wait for API call to be captured
                    console.log('\n⏳ Waiting for API request to be captured...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                } else {
                    console.log('⚠️  Could not find Generate button automatically');
                    console.log('👀 Please click Generate manually in the browser...');
                    await new Promise(resolve => setTimeout(resolve, 30000));
                }
            }
        } catch (error) {
            console.log('⚠️  Could not auto-fill form, please generate manually...');
            await new Promise(resolve => setTimeout(resolve, 60000));
        }

        if (!capturedRequest) {
            console.log('\n❌ No API request captured!');
            console.log('Make sure you actually generated a video on the website.');
            await browser.close();
            return;
        }

        console.log('\n✅ Browser automation complete!');
        await browser.close();

        // Step 2: Extract tokens and generate video
        console.log('\n' + '='.repeat(70));
        console.log('STEP 2: Generating video with captured tokens...');
        console.log('='.repeat(70));

        const clientId = capturedRequest.headers['pixb-cl-id'];
        const ebgParam = capturedRequest.headers['x-ebg-param'];
        const ebgSignature = capturedRequest.headers['x-ebg-signature'];
        
        console.log('\n📋 Extracted tokens:');
        console.log(`   Client ID: ${clientId}`);
        console.log(`   EBG Param: ${ebgParam}`);
        console.log(`   EBG Signature: ${ebgSignature.substring(0, 40)}...`);

        // Extract captcha token from post data
        const captchaMatch = capturedRequest.postData.match(/name="input\.captchaToken"\r\n\r\n([^\r\n]+)/);
        
        if (!captchaMatch) {
            console.log('\n❌ Could not find captchaToken!');
            return;
        }
        
        const captchaToken = captchaMatch[1];
        console.log(`\n✅ Captcha Token: ${captchaToken.substring(0, 50)}...`);

        // Generate video
        const url = capturedRequest.url;
        
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

        console.log('\n📤 Sending video generation request...');
        
        const response = await axios.post(url, formData, {
            headers: headers,
            timeout: 120000,
            transformResponse: [(data) => data]
        });

        console.log('\n✅ HTTP Status:', response.status);
        
        const responseData = JSON.parse(response.data);
        console.log('\n📊 Response:', JSON.stringify(responseData, null, 2));

        if (!responseData.id && !responseData.prediction_id) {
            console.log('\n⚠️  Unexpected response format');
            return;
        }

        const predictionId = responseData.id || responseData.prediction_id;
        console.log('\n🎉 Video generation started!');
        console.log('📋 Prediction ID:', predictionId);

        // Step 3: Poll for result
        console.log('\n' + '='.repeat(70));
        console.log('STEP 3: Polling for video completion...');
        console.log('='.repeat(70));

        const pollUrl = `https://api.pixelbin.io/service/public/transformation/v1.0/predictions/veo2--generate--${predictionId}`;
        
        const pollHeaders = {
            'Accept': 'application/json, text/plain, */*',
            'pixb-cl-id': clientId,
            'x-ebg-param': ebgParam,
            'x-ebg-signature': ebgSignature
        };

        for (let i = 1; i <= 60; i++) {
            console.log(`\nPoll #${i}...`);
            
            try {
                const pollResponse = await axios.get(pollUrl, {
                    headers: pollHeaders,
                    timeout: 60000
                });
                
                const pollData = JSON.parse(pollResponse.data);
                console.log('Status:', pollResponse.status);
                
                if (pollData.status === 'complete' || pollData.url || (pollData.output && pollData.output.url)) {
                    console.log('\n🎉 VIDEO READY!');
                    const videoUrl = pollData.url || (pollData.output && pollData.output.url);
                    console.log('🎬 VIDEO URL:', videoUrl);
                    
                    console.log('\n' + '='.repeat(70));
                    console.log('🎉 SUCCESS! YOUR VIDEO IS READY!');
                    console.log('='.repeat(70));
                    console.log('URL:', videoUrl);
                    console.log('\n💡 Download it using:');
                    console.log(`curl -o video.mp4 "${videoUrl}"`);
                    console.log('='.repeat(70));
                    
                    return { success: true, url: videoUrl };
                }
                
                if (pollData.status === 'failed' || pollData.error) {
                    console.log('\n❌ Generation failed:', pollData.error || pollData.message);
                    return { success: false, error: pollData.error || pollData.message };
                }
                
                console.log('⏳ Still processing, waiting 3 seconds...');
                await new Promise(resolve => setTimeout(resolve, 3000));
                
            } catch (error) {
                console.log('Poll error:', error.message);
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

// Run
const result = await fullyAutomated();
if (!result.success) {
    console.log('\n❌ Failed:', result.error);
    process.exit(1);
}
