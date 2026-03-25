#!/usr/bin/env node

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

/**
 * 🎬 PIXELBIN.IO VIDEO GENERATOR - WITH DETAILED DEBUGGING
 */

async function debugGenerate() {
    console.log('='.repeat(70));
    console.log('🎬 PIXELBIN.IO - DEBUG VIDEO GENERATOR');
    console.log('='.repeat(70));
    
    // Find latest capture file
    const files = fs.readdirSync('.').filter(f => f.startsWith('PIXELBIN_REAL_REQUEST_') && f.endsWith('.json'));
    
    if (files.length === 0) {
        console.log('\n❌ No capture file found!');
        console.log('Run: node pixelbin_capture_exact_format.js');
        return;
    }
    
    const latestFile = files.sort().pop();
    console.log(`\n📄 Using: ${latestFile}\n`);
    
    const captureData = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    
    // Extract tokens
    const clientId = captureData.headers['pixb-cl-id'];
    const ebgParam = captureData.headers['x-ebg-param'];
    const ebgSignature = captureData.headers['x-ebg-signature'];
    
    console.log('📋 Captured Tokens:');
    console.log(`   Client ID: ${clientId}`);
    console.log(`   EBG Param: ${ebgParam}`);
    console.log(`   EBG Signature: ${ebgSignature.substring(0, 50)}...`);
    console.log(`   Timestamp: ${captureData.timestamp}`);
    
    // Check age
    const captureTime = new Date(captureData.timestamp).getTime();
    const now = Date.now();
    const ageSeconds = Math.floor((now - captureTime) / 1000);
    
    console.log(`\n⏰ Capture Age: ${ageSeconds} seconds`);
    
    if (ageSeconds > 300) {
        console.log('⚠️  WARNING: Capture is old! Tokens may have expired.');
        console.log('💡 Tip: Run pixelbin_capture_exact_format.js to get fresh tokens\n');
    } else {
        console.log('✅ Tokens are fresh (< 5 minutes old)\n');
    }
    
    // Extract captcha token
    const postData = captureData.postData;
    const captchaMatch = postData.match(/name="input\.captchaToken"\r\n\r\n([^\r\n]+)/);
    
    if (!captchaMatch) {
        console.log('❌ Could not find captchaToken!');
        return;
    }
    
    const captchaToken = captchaMatch[1];
    console.log(`✅ Captcha Token: ${captchaToken.substring(0, 50)}...\n`);
    
    const prompt = "A beautiful sunset over mountains";
    console.log('='.repeat(70));
    console.log('🎬 GENERATING VIDEO');
    console.log('='.repeat(70));
    console.log(`Prompt: ${prompt}\n`);
    
    const url = captureData.url;
    
    // Create form data
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
    
    console.log('📤 Sending request...\n');
    console.log('URL:', url);
    console.log('Method: POST');
    console.log('Headers sent:\n');
    Object.entries(headers).forEach(([key, value]) => {
        if (key.includes('signature') || key.includes('param')) {
            console.log(`  ${key}: ${value.substring(0, 40)}...`);
        } else {
            console.log(`  ${key}: ${value}`);
        }
    });
    console.log('');
    
    try {
        const response = await axios.post(url, formData, {
            headers: headers,
            timeout: 120000,
            transformResponse: [(data) => data]
        });
        
        console.log('✅ HTTP Status:', response.status);
        console.log('\n📄 Raw Response:');
        console.log(response.data);
        console.log('');
        
        const responseData = JSON.parse(response.data);
        console.log('📊 Parsed JSON Response:');
        console.log(JSON.stringify(responseData, null, 2));
        console.log('');
        
        // Get prediction ID
        const predictionId = responseData.id || responseData.prediction_id || responseData._id;
        
        if (!predictionId) {
            console.log('❌ No prediction ID in response!');
            console.log('Response format:', Object.keys(responseData));
            return;
        }
        
        console.log('\n🎉 Video generation started!');
        console.log('📋 Prediction ID:', predictionId);
        
        // Poll with detailed debug
        console.log('\n' + '='.repeat(70));
        console.log('⏳ POLLING FOR RESULT (Detailed Debug)');
        console.log('='.repeat(70));
        
        const pollUrl = `https://api.pixelbin.io/service/public/transformation/v1.0/predictions/veo2--generate--${predictionId}`;
        console.log('\nPoll URL:', pollUrl);
        
        const pollHeaders = {
            'Accept': 'application/json, text/plain, */*',
            'pixb-cl-id': clientId,
            'x-ebg-param': ebgParam,
            'x-ebg-signature': ebgSignature
        };
        
        console.log('\nPoll Headers:');
        Object.entries(pollHeaders).forEach(([key, value]) => {
            if (key.includes('signature') || key.includes('param')) {
                console.log(`  ${key}: ${value.substring(0, 40)}...`);
            } else {
                console.log(`  ${key}: ${value}`);
            }
        });
        
        for (let i = 1; i <= 30; i++) {
            console.log(`\n--- Poll #${i} ---`);
            
            try {
                const pollResponse = await axios.get(pollUrl, {
                    headers: pollHeaders,
                    timeout: 60000,
                    validateStatus: () => true  // Accept any status code
                });
                
                console.log('HTTP Status:', pollResponse.status);
                
                let pollData;
                try {
                    pollData = JSON.parse(pollResponse.data);
                } catch (e) {
                    console.log('Raw response:', pollResponse.data.toString().substring(0, 200));
                    console.log('⚠️  Could not parse as JSON');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    continue;
                }
                
                console.log('Response Data:');
                console.log(JSON.stringify(pollData, null, 2));
                
                // Check status
                const status = pollData.status || pollData.code;
                console.log('\nStatus:', status);
                
                // Check if complete
                if (status === 'complete' || pollData.url || (pollData.output && pollData.output.url)) {
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
                
                // Check for errors
                if (status === 'failed' || pollData.error || pollData.message) {
                    console.log('\n❌ Generation failed!');
                    console.log('Error:', pollData.error || pollData.message || 'Unknown');
                    return { success: false, error: pollData.error || pollData.message || 'Unknown error' };
                }
                
                // Check processing status
                if (status === 'processing' || status === 'ACCEPTED' || status === 'queued') {
                    console.log('⏳ Still processing, waiting 3 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    continue;
                }
                
                // Unknown status
                console.log('⚠️  Unknown status, continuing...');
                await new Promise(resolve => setTimeout(resolve, 3000));
                
            } catch (error) {
                console.log('❌ Poll Error:', error.message);
                
                if (error.response) {
                    console.log('Error Status:', error.response.status);
                    console.log('Error Data:', error.response.data.toString());
                }
                
                console.log('Waiting 3 seconds before retry...');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        
        console.log('\n⏰ Timeout after 30 polls');
        return { success: false, error: 'Timeout' };
        
    } catch (error) {
        console.log('\n❌ Initial Request Failed');
        console.log('Error:', error.message);
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data.toString());
        }
        
        return { success: false, error: error.message };
    }
}

// Run
debugGenerate().catch(console.error);
