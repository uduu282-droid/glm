#!/usr/bin/env node

/**
 * 🎬 PIXELBIN.IO VIDEO GENERATOR - FINAL WORKING VERSION
 * 
 * Uses captured real API endpoints and authentication tokens
 * to generate videos from text prompts.
 * 
 * Usage: node pixelbin_final_working.js "Your prompt here"
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Load captured request data - get MOST RECENT file
const captureFiles = fs.readdirSync('.')
    .filter(f => (f.startsWith('PIXELBIN_REAL_REQUEST_') || f.startsWith('PIXELBIN_FRESH_')) && f.endsWith('.json'));

if (captureFiles.length === 0) {
    console.error('❌ No captured request files found!');
    console.error('Please run: node pixelbin_patient_capture.js first');
    process.exit(1);
}

// Sort by modification time (newest first)
const latestCapture = captureFiles
    .map(f => ({ file: f, mtime: fs.statSync(f).mtime.getTime() }))
    .sort((a, b) => b.mtime - a.mtime)[0].file;

console.log(`📄 Using capture file: ${latestCapture}`);

const capturedData = JSON.parse(fs.readFileSync(latestCapture, 'utf-8'));

// Extract authentication tokens
const clientId = capturedData.headers['pixb-cl-id'];
const ebgParam = capturedData.headers['x-ebg-param'];
const ebgSignature = capturedData.headers['x-ebg-signature'];

// Extract captcha token from post data
const captchaMatch = capturedData.postData.match(/name="input\.captchaToken"\r\n\r\n([^\r\n]+)/);

if (!captchaMatch) {
    console.error('❌ Could not extract captchaToken from captured data!');
    console.error('Please capture fresh tokens.');
    process.exit(1);
}

const captchaToken = captchaMatch[1];

console.log('\n✅ Captured authentication tokens:');
console.log(`   Client ID: ${clientId}`);
console.log(`   EBG Param: ${ebgParam}`);
console.log(`   EBG Signature: ${ebgSignature.substring(0, 40)}...`);
console.log(`   Captcha Token: ${captchaToken.substring(0, 50)}...`);

// Get prompt from command line
const prompt = process.argv[2] || "A beautiful sunset over mountains";

console.log('\n' + '='.repeat(70));
console.log('🎬 GENERATING VIDEO');
console.log('='.repeat(70));
console.log(`Prompt: ${prompt}`);

async function generateVideo() {
    try {
        // Prepare form data
        const formData = new FormData();
        formData.append('input.prompt', prompt);
        formData.append('input.aspect_ratio', '16:9');
        formData.append('input.duration', '5');
        formData.append('input.category', 'text-to-video');
        formData.append('input.background', 'prompt');
        formData.append('input.captchaToken', captchaToken);
        
        // Prepare headers
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
        
        console.log('\n📤 Sending request to Pixelbin API...');
        
        // Send request
        const response = await axios.post(capturedData.url, formData, {
            headers: headers,
            timeout: 120000,
            transformRequest: [(data, headers) => {
                // Use form data directly
                return data;
            }],
            transformResponse: [(data) => data]
        });
        
        console.log('\n✅ HTTP Status:', response.status);
        
        const responseData = JSON.parse(response.data);
        console.log('\n📊 Response:', JSON.stringify(responseData, null, 2));
        
        // Check for different response formats
        const predictionId = responseData.id || responseData.prediction_id || responseData._id;
        
        if (!predictionId) {
            console.log('\n⚠️  Unexpected response format');
            console.log('This might mean the captcha token has expired.');
            console.log('Please capture fresh tokens and try again.');
            return null;
        }
        
        console.log('\n🎉 Video generation started!');
        console.log('📋 Prediction ID:', predictionId);
        
        // Poll for result
        console.log('\n' + '='.repeat(70));
        console.log('⏳ POLLING FOR VIDEO COMPLETION');
        console.log('='.repeat(70));
        
        // Use the URL from response if available
        const pollUrl = responseData.urls && responseData.urls.get ? 
            responseData.urls.get : 
            `https://api.pixelbin.io/service/public/transformation/v1.0/predictions/veo2--generate--${predictionId}`;
        
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
                console.log('Response:', JSON.stringify(pollData, null, 2));
                
                // Check if video is ready
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
                
                // Check for errors
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
        
        console.log('\n⏰ Timeout after 60 polls (3 minutes)');
        console.log('The video may still be processing. Try polling again later.');
        return { success: false, error: 'Timeout' };
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        return { success: false, error: error.message };
    }
}

// Run
const result = await generateVideo();
if (!result || !result.success) {
    console.log('\n⚠️  Video generation did not complete successfully.');
    console.log('This may be due to:');
    console.log('  1. Expired captcha token (most likely)');
    console.log('  2. Server-side issues');
    console.log('  3. Rate limiting');
    console.log('\n💡 Solution: Capture fresh tokens and try again!');
    process.exit(1);
}
