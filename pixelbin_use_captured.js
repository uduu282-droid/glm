#!/usr/bin/env node

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

/**
 * 🎬 REAL PIXELBIN.IO VIDEO GENERATOR - AUTO CAPTURE VERSION
 * Automatically captures fresh tokens and generates video
 */

async function captureAndGenerate() {
    console.log('='.repeat(70));
    console.log('🎬 PIXELBIN.IO VIDEO GENERATOR - AUTO CAPTURE');
    console.log('='.repeat(70));
    
    // Find the latest capture file
    const files = fs.readdirSync('.').filter(f => f.startsWith('PIXELBIN_REAL_REQUEST_') && f.endsWith('.json'));
    
    if (files.length === 0) {
        console.log('\n❌ No capture file found!');
        console.log('Run this first: node pixelbin_capture_exact_format.js');
        console.log('Then generate a video on the website.');
        return;
    }
    
    // Get latest file
    const latestFile = files.sort().pop();
    console.log(`\n📄 Using capture file: ${latestFile}`);
    
    const captureData = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    
    // Extract values
    const clientId = captureData.headers['pixb-cl-id'];
    const ebgParam = captureData.headers['x-ebg-param'];
    const ebgSignature = captureData.headers['x-ebg-signature'];
    
    console.log('\n✅ Captured credentials:');
    console.log(`   Client ID: ${clientId}`);
    console.log(`   EBG Param: ${ebgParam}`);
    console.log(`   EBG Signature: ${ebgSignature.substring(0, 40)}...`);
    
    // Parse form data to extract captcha token
    const postData = captureData.postData;
    const captchaMatch = postData.match(/name="input\.captchaToken"\r\n\r\n([^\r\n]+)/);
    
    if (!captchaMatch) {
        console.log('\n❌ Could not find captchaToken in captured data');
        return;
    }
    
    const captchaToken = captchaMatch[1];
    console.log(`\n✅ Captcha Token: ${captchaToken.substring(0, 50)}...`);
    
    console.log('\n' + '='.repeat(70));
    console.log('🎬 GENERATING VIDEO WITH CAPTURED DATA');
    console.log('='.repeat(70));
    
    const prompt = "A beautiful sunset over mountains";
    console.log(`Prompt: ${prompt}`);
    
    const url = 'https://api.pixelbin.io/service/public/transformation/v1.0/predictions/veo2/generate';
    
    // Create form data using captured format
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
    
    try {
        console.log('\n📤 Sending request...');
        
        const response = await axios.post(url, formData, {
            headers: headers,
            timeout: 120000,
            transformResponse: [(data) => data]
        });
        
        console.log('\n✅ HTTP Status:', response.status);
        
        const responseData = JSON.parse(response.data);
        console.log('\n📊 Response:', JSON.stringify(responseData, null, 2));
        
        // Check for success (handle multiple response formats)
        if (responseData.id || responseData.prediction_id || responseData._id) {
            console.log('\n🎉 SUCCESS! Video generation started!');
            const predictionId = responseData.id || responseData.prediction_id || responseData._id;
            console.log('📋 Prediction ID:', predictionId);
            
            // Poll for result
            console.log('\n⏳ Polling for video...');
            return await pollForResult(predictionId, clientId, ebgParam, ebgSignature);
        } else {
            console.log('\n⚠️ Unexpected response');
            return { success: false, data: responseData };
        }
        
    } catch (error) {
        console.log('\n❌ Request failed');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response:', error.response.data.toString());
        } else {
            console.log('Error:', error.message);
        }
        return { success: false, error: error.message };
    }
}

async function pollForResult(predictionId, clientId, ebgParam, ebgSignature) {
    const pollUrl = `https://api.pixelbin.io/service/public/transformation/v1.0/predictions/veo2--generate--${predictionId}`;
    
    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'pixb-cl-id': clientId,
        'x-ebg-param': ebgParam,
        'x-ebg-signature': ebgSignature
    };
    
    for (let i = 1; i <= 60; i++) {
        console.log(`\nPoll #${i}...`);
        
        try {
            const response = await axios.get(pollUrl, {
                headers: headers,
                timeout: 60000
            });
            
            const data = JSON.parse(response.data);
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(data, null, 2));
            
            // Check if complete
            if (data.status === 'complete' || data.url || (data.output && data.output.url)) {
                console.log('\n🎉 VIDEO READY!');
                const videoUrl = data.url || (data.output && data.output.url);
                console.log('🎬 VIDEO URL:', videoUrl);
                return { success: true, url: videoUrl };
            }
            
            if (data.status === 'failed' || data.error) {
                console.log('\n❌ Generation failed');
                return { success: false, error: data.error || 'Unknown error' };
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
}

// Run
captureAndGenerate().catch(console.error);
