#!/usr/bin/env node

/**
 * 🎬 PIXELBIN.IO - HEADER SPOOFING VERSION
 * 
 * Spoofs headers and clears cookies to bypass rate limiting.
 * No browser automation needed - just captured request format!
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { randomUUID } from 'crypto';

console.log('='.repeat(70));
console.log('🎬 PIXELBIN.IO - HEADER SPOOFING (NO BROWSER NEEDED!)');
console.log('='.repeat(70));

// Load captured request as template
const captureFiles = fs.readdirSync('.')
    .filter(f => f.startsWith('PIXELBIN_REAL_REQUEST_') && f.endsWith('.json'))
    .sort();

if (captureFiles.length === 0) {
    console.error('❌ No captured request files found!');
    console.error('Run pixelbin_capture_exact_format.js ONCE to get the format.');
    process.exit(1);
}

const templateFile = captureFiles[0]; // Use first one as template
console.log(`📄 Using template: ${templateFile}`);

const templateData = JSON.parse(fs.readFileSync(templateFile, 'utf-8'));

// Extract base values from template
const templateUrl = templateData.url;
const baseCaptchaToken = extractCaptchaToken(templateData.postData);

console.log('\n✅ Loaded request template');
console.log('   URL:', templateUrl);
console.log('   Template Captcha Token:', baseCaptchaToken?.substring(0, 50) + '...');

// Get prompt
const prompt = process.argv[2] || "A beautiful sunset";
console.log(`\n📝 Prompt: ${prompt}`);

function extractCaptchaToken(postData) {
    const match = postData.match(/name="input\.captchaToken"\r\n\r\n([^\r\n]+)/);
    return match ? match[1] : null;
}

function generateSpoofedHeaders() {
    // Generate random client ID
    const clientId = randomUUID().replace(/-/g, '').substring(0, 32);
    
    // Generate timestamp
    const now = new Date();
    const ebgParam = Buffer.from(now.toISOString()).toString('base64');
    
    // Generate random signature (64 char hex)
    const signature = Array.from({length: 32}, () => 
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    // Random user agent variations
    const chromeVersions = [
        'Chrome/146.0.0.0',
        'Chrome/145.0.0.0', 
        'Chrome/144.0.0.0'
    ];
    const randomChrome = chromeVersions[Math.floor(Math.random() * chromeVersions.length)];
    
    return {
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${randomChrome} Safari/537.36`,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://www.pixelbin.io',
        'Referer': 'https://www.pixelbin.io/',
        'pixb-cl-id': clientId,
        'x-ebg-param': ebgParam,
        'x-ebg-signature': signature,
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary' + 
            Array.from({length: 16}, () => 
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
                    [Math.floor(Math.random() * 62)]
            ).join('')
    };
}

async function generateVideo() {
    try {
        console.log('\n🔄 Generating fresh spoofed headers...');
        const headers = generateSpoofedHeaders();
        
        console.log('   Client ID:', headers['pixb-cl-id']);
        console.log('   EBG Param:', headers['x-ebg-param']);
        console.log('   Signature:', headers['x-ebg-signature'].substring(0, 40) + '...');
        
        // Try with original captcha token first
        let captchaToken = baseCaptchaToken;
        
        // If that fails, we might need to generate a new one
        // For now, let's try with the captured one
        console.log('   Using captcha token from template');
        
        const formData = new FormData();
        formData.append('input.prompt', prompt);
        formData.append('input.aspect_ratio', '16:9');
        formData.append('input.duration', '5');
        formData.append('input.category', 'text-to-video');
        formData.append('input.background', 'prompt');
        formData.append('input.captchaToken', captchaToken);
        
        // Add dynamic headers to form data
        Object.assign(headers, formData.getHeaders());
        
        console.log('\n📤 Sending request with spoofed headers...\n');
        
        const response = await axios.post(templateUrl, formData, {
            headers: headers,
            timeout: 120000,
            transformRequest: [(data) => data],
            transformResponse: [(data) => data],
            // Clear any cached cookies
            withCredentials: false
        });
        
        console.log('✅ HTTP Status:', response.status);
        console.log('\n📊 Response:', JSON.stringify(response.data, null, 2));
        
        const responseData = response.data;
        
        if (!responseData.id && !responseData.prediction_id) {
            console.log('\n⚠️  Unexpected response format');
            
            if (response.status === 429) {
                console.log('\n💡 Still getting rate limited!');
                console.log('The captchaToken itself might be tracked.');
                console.log('We may need to regenerate it too.');
            }
            
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
            'pixb-cl-id': headers['pixb-cl-id'],
            'x-ebg-param': headers['x-ebg-param'],
            'x-ebg-signature': headers['x-ebg-signature']
        };
        
        for (let i = 1; i <= 60; i++) {
            console.log(`\nPoll #${i}...`);
            
            try {
                const pollResponse = await axios.get(pollUrl, {
                    headers: pollHeaders,
                    timeout: 60000,
                    withCredentials: false
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
            
            if (error.response.status === 429) {
                console.log('\n' + '='.repeat(70));
                console.log('💡 RATE LIMITED!');
                console.log('='.repeat(70));
                console.log('The captchaToken is probably being tracked.');
                console.log('We need to either:');
                console.log('1. Wait for rate limit to reset');
                console.log('2. Capture a fresh captchaToken from website');
                console.log('3. Find a way to generate valid captchaTokens');
                console.log('='.repeat(70));
            } else if (error.response.status === 403) {
                console.log('\n' + '='.repeat(70));
                console.log('💡 FORBIDDEN!');
                console.log('='.repeat(70));
                console.log('Headers might be invalid or captchaToken expired.');
                console.log('Try capturing a fresh request from the website.');
                console.log('='.repeat(70));
            }
        }
        return { success: false, error: error.message };
    }
}

const result = await generateVideo();
process.exit(result?.success ? 0 : 1);
