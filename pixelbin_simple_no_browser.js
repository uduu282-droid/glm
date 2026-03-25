#!/usr/bin/env node

/**
 * 🎬 PIXELBIN.IO - SIMPLIFIED VERSION (NO BROWSER NEEDED?)
 * 
 * Uses captured tokens directly without Puppeteer automation.
 * If tokens don't require captcha solving, this should work!
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

console.log('='.repeat(70));
console.log('🎬 PIXELBIN.IO - DIRECT API CALL (USING CAPTURED TOKENS)');
console.log('='.repeat(70));

// Load captured request data
const captureFiles = fs.readdirSync('.')
    .filter(f => f.startsWith('PIXELBIN_REAL_REQUEST_') && f.endsWith('.json'))
    .sort();

if (captureFiles.length === 0) {
    console.error('❌ No captured request files found!');
    console.error('Please visit pixelbin.io and generate a video first.');
    process.exit(1);
}

const latestCapture = captureFiles[captureFiles.length - 1];
console.log(`📄 Using: ${latestCapture}`);

const capturedData = JSON.parse(fs.readFileSync(latestCapture, 'utf-8'));

// Extract tokens
const clientId = capturedData.headers['pixb-cl-id'];
const ebgParam = capturedData.headers['x-ebg-param'];
const ebgSignature = capturedData.headers['x-ebg-signature'];

// Extract captcha token from post data
const captchaMatch = capturedData.postData.match(/name="input\.captchaToken"\r\n\r\n([^\r\n]+)/);

if (!captchaMatch) {
    console.error('❌ Could not find captchaToken in captured data!');
    process.exit(1);
}

const captchaToken = captchaMatch[1];

console.log('\n✅ Using captured tokens:');
console.log(`   Client ID: ${clientId}`);
console.log(`   EBG Param: ${ebgParam}`);
console.log(`   EBG Signature: ${ebgSignature.substring(0, 40)}...`);
console.log(`   Captcha Token: ${captchaToken.substring(0, 50)}...`);

// Get prompt
const prompt = process.argv[2] || "A beautiful sunset";

console.log(`\n📝 Prompt: ${prompt}`);

async function generateVideo() {
    try {
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
            transformRequest: [(data) => data],
            transformResponse: [(data) => data]
        });
        
        console.log('✅ HTTP Status:', response.status);
        console.log('\n📊 Response:', JSON.stringify(response.data, null, 2));
        
        if (!responseData.id && !responseData.prediction_id) {
            console.log('\n⚠️  Unexpected response format');
            return null;
        }
        
        const predictionId = responseData.id || responseData.prediction_id;
        console.log('\n🎉 Video generation started!');
        console.log('📋 Prediction ID:', predictionId);
        
        // Poll for result
        console.log('\n' + '='.repeat(70));
        console.log('⏳ POLLING FOR COMPLETION');
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
                    console.log('🎉 SUCCESS!');
                    console.log('='.repeat(70));
                    console.log('URL:', videoUrl);
                    console.log(`\ncurl -o video.mp4 "${videoUrl}"`);
                    console.log('='.repeat(70));
                    
                    return { success: true, url: videoUrl };
                }
                
                if (pollData.status === 'failed' || pollData.error) {
                    console.log('\n❌ Failed:', pollData.error || pollData.message);
                    return { success: false, error: pollData.error || pollData.message };
                }
                
                console.log('⏳ Processing...');
                await new Promise(resolve => setTimeout(resolve, 3000));
                
            } catch (error) {
                console.log('Poll error:', error.message);
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        
        console.log('\n⏰ Timeout');
        return { success: false, error: 'Timeout' };
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', error.response.data);
            
            if (error.response.status === 403) {
                console.log('\n' + '='.repeat(70));
                console.log('💡 INSIGHT:');
                console.log('='.repeat(70));
                console.log('The captchaToken might be:');
                console.log('1. Invisible/automatic (no user interaction needed)');
                console.log('2. Generated by JavaScript on page load');
                console.log('3. Session-based (tied to browser cookies)');
                console.log('\nEven though you didnt solve a captcha,');
                console.log('the website still requires this token!');
                console.log('='.repeat(70));
            }
        }
        return { success: false, error: error.message };
    }
}

const result = await generateVideo();
process.exit(result?.success ? 0 : 1);
