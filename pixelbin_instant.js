#!/usr/bin/env node

import puppeteer from 'puppeteer';
import axios from 'axios';
import FormData from 'form-data';

/**
 * 🎬 INSTANT PIXELBIN VIDEO GENERATOR
 * Captures tokens and generates video in ONE run - no timeout!
 */

async function instantGenerate() {
    console.log('='.repeat(70));
    console.log('🎬 PIXELBIN.IO - INSTANT VIDEO GENERATOR');
    console.log('='.repeat(70));
    
    const prompt = process.argv[2] || "A beautiful sunset over mountains";
    console.log(`\n📝 Prompt: ${prompt}\n`);
    
    let browser = null;
    let capturedData = null;
    
    try {
        // Launch browser
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        console.log('📡 Monitoring for API requests...\n');
        
        // Capture the request
        page.on('request', request => {
            const url = request.url();
            
            if (url.includes('/service/public/transformation/v1.0/predictions/veo2/generate') && request.method() === 'POST') {
                console.log('✅ CAUGHT API REQUEST!\n');
                
                capturedData = {
                    url: url,
                    method: request.method(),
                    headers: request.headers(),
                    postData: request.postData()
                };
            }
        });

        // Go to website
        console.log('🌐 Opening Pixelbin.io...');
        await page.goto('https://www.pixelbin.io/ai-tools/video-generator', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        console.log('✅ Page loaded\n');
        
        // Wait for user to generate
        console.log('👀 WAITING FOR YOU TO GENERATE A VIDEO ON THE WEBSITE...');
        console.log('\nINSTRUCTIONS:');
        console.log('1. Enter this prompt (or your own): "' + prompt + '"');
        console.log('2. Click Generate button');
        console.log('3. I\'ll capture the request and generate another video automatically!');
        console.log('\n⏰ Waiting 90 seconds...\n');
        
        // Wait up to 90 seconds for user action
        for (let i = 0; i < 90; i++) {
            if (capturedData) {
                console.log('\n✅ Request captured! Proceeding...\n');
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (!capturedData) {
            console.log('\n❌ No request captured after 90 seconds');
            await browser.close();
            return;
        }

        await browser.close();

        // Extract tokens
        console.log('📋 Extracting authentication tokens...\n');
        
        const clientId = capturedData.headers['pixb-cl-id'];
        const ebgParam = capturedData.headers['x-ebg-param'];
        const ebgSignature = capturedData.headers['x-ebg-signature'];
        
        console.log(`✅ Client ID: ${clientId}`);
        console.log(`✅ EBG Param: ${ebgParam}`);
        console.log(`✅ EBG Signature: ${ebgSignature.substring(0, 40)}...\n`);

        // Extract captcha token
        const captchaMatch = capturedData.postData.match(/name="input\.captchaToken"\r\n\r\n([^\r\n]+)/);
        
        if (!captchaMatch) {
            console.log('❌ Could not find captchaToken!');
            return;
        }
        
        const captchaToken = captchaMatch[1];
        console.log(`✅ Captcha Token: ${captchaToken.substring(0, 50)}...\n`);

        // Generate video NOW (while tokens are fresh!)
        console.log('='.repeat(70));
        console.log('🎬 GENERATING VIDEO WITH FRESH TOKENS...');
        console.log('='.repeat(70));
        
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

        console.log('\n📤 Sending request...\n');
        
        const response = await axios.post(capturedData.url, formData, {
            headers: headers,
            timeout: 120000,
            transformResponse: [(data) => data]
        });

        console.log('✅ HTTP Status:', response.status);
        
        const responseData = JSON.parse(response.data);
        console.log('\n📊 Response:', JSON.stringify(responseData, null, 2));

        // Get prediction ID
        const predictionId = responseData.id || responseData.prediction_id || responseData._id;
        
        if (!predictionId) {
            console.log('\n❌ Unexpected response format');
            return;
        }

        console.log('\n🎉 Video generation started!');
        console.log('📋 Prediction ID:', predictionId);

        // Poll for result
        console.log('\n' + '='.repeat(70));
        console.log('⏳ POLLING FOR VIDEO COMPLETION...');
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
                    console.log('\n💡 Download command:');
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
const result = await instantGenerate();
if (!result.success) {
    console.log('\n❌ Failed:', result.error);
    process.exit(1);
}
