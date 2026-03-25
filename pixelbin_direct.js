#!/usr/bin/env node

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import crypto from 'crypto';

/**
 * 🎬 PIXELBIN.IO - DIRECT API GENERATOR (No Browser!)
 * Uses captured endpoint data directly
 * Spoofs session for each request to bypass rate limits
 */

async function directGenerate() {
    console.log('='.repeat(70));
    console.log('🎬 PIXELBIN.IO - DIRECT API GENERATOR (No Browser)');
    console.log('='.repeat(70));
    
    // Find latest capture file
    const files = fs.readdirSync('.').filter(f => f.startsWith('PIXELBIN_REAL_REQUEST_') && f.endsWith('.json'));
    
    if (files.length === 0) {
        console.log('\n❌ No capture file found!');
        console.log('First run: node pixelbin_capture_exact_format.js');
        console.log('Or generate a video manually on https://www.pixelbin.io/ai-tools/video-generator\n');
        return;
    }
    
    const latestFile = files.sort().pop();
    console.log(`\n📄 Using capture: ${latestFile}\n`);
    
    const captureData = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    
    // Get prompts from command line or use default
    const prompts = process.argv.slice(2);
    
    if (prompts.length === 0) {
        console.log('No prompts provided. Using demo prompt...\n');
        prompts.push('A beautiful sunset over mountains, cinematic lighting, 4k');
    }
    
    console.log(`📋 Queue: ${prompts.length} video(s)\n`);
    
    const results = [];
    
    for (let i = 0; i < prompts.length; i++) {
        console.log('\n' + '='.repeat(70));
        console.log(`🎬 GENERATING VIDEO ${i + 1}/${prompts.length}`);
        console.log('='.repeat(70));
        
        const prompt = prompts[i];
        console.log(`Prompt: ${prompt}\n`);
        
        try {
            // SPOOF session for each request
            const spoofedClientId = crypto.randomBytes(16).toString('hex');
            const randomUserAgent = getRandomUserAgent();
            
            console.log('🎭 Spoofing Session:');
            console.log(`   New Client ID: ${spoofedClientId}`);
            console.log(`   New User Agent: ${randomUserAgent.substring(0, 60)}...`);
            console.log('   Status: FRESH SESSION (bypasses rate limit)\n');
            
            const result = await generateVideo(captureData, prompt, spoofedClientId, randomUserAgent);
            
            if (result.success) {
                console.log(`\n✅ SUCCESS! Video ${i + 1} generated!`);
                console.log('🎬 URL:', result.url);
                results.push({ prompt, success: true, url: result.url });
                
                // Save URL
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `video_${i + 1}_${timestamp}.txt`;
                fs.writeFileSync(filename, result.url);
                console.log('💾 Saved to:', filename);
            } else {
                console.log(`\n❌ Failed:`, result.error);
                results.push({ prompt, success: false, error: result.error });
            }
            
            // Wait between videos
            if (i < prompts.length - 1) {
                console.log('\n⏳ Waiting 5 seconds before next video...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
            
        } catch (error) {
            console.log(`\n❌ Error:`, error.message);
            results.push({ prompt, success: false, error: error.message });
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY');
    console.log('='.repeat(70));
    
    const successCount = results.filter(r => r.success).length;
    console.log(`Total: ${results.length}`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${results.length - successCount}`);
    
    if (successCount > 0) {
        console.log('\n🎉 VIDEOS GENERATED:');
        results.filter(r => r.success).forEach((r, i) => {
            console.log(`${i + 1}. ${r.prompt}`);
            console.log(`   URL: ${r.url}`);
        });
    }
    
    console.log('\n' + '='.repeat(70));
}

async function generateVideo(captureData, prompt, spoofedClientId, userAgent) {
    // Extract base tokens from capture
    const baseEbgParam = captureData.headers['x-ebg-param'];
    const baseEbgSignature = captureData.headers['x-ebg-signature'];
    const captchaMatch = captureData.postData.match(/name="input\.captchaToken"\r\n\r\n([^\r\n]+)/);
    
    if (!captchaMatch) {
        return { success: false, error: 'No captcha token in capture' };
    }
    
    const captchaToken = captchaMatch[1];
    
    console.log('📤 Sending API request...\n');
    
    // Create form data
    const formData = new FormData();
    formData.append('input.prompt', prompt);
    formData.append('input.aspect_ratio', '16:9');
    formData.append('input.duration', '5');
    formData.append('input.category', 'text-to-video');
    formData.append('input.background', 'prompt');
    formData.append('input.captchaToken', captchaToken);
    
    // Use SPOOFED headers
    const headers = {
        'User-Agent': userAgent,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://www.pixelbin.io',
        'Referer': 'https://www.pixelbin.io/',
        'pixb-cl-id': spoofedClientId,  // SPOOFED!
        'x-ebg-param': baseEbgParam,
        'x-ebg-signature': baseEbgSignature,
        ...formData.getHeaders()
    };
    
    try {
        const response = await axios.post(captureData.url, formData, {
            headers: headers,
            timeout: 120000,
            transformResponse: [(data) => data]
        });
        
        console.log('✅ HTTP Status:', response.status);
        
        const responseData = JSON.parse(response.data);
        console.log('\n📊 Response:', JSON.stringify(responseData, null, 2));
        
        // Check for rate limit
        if (response.status === 429) {
            console.log('\n⚠️  RATE LIMIT HIT!');
            console.log('💡 Solution: Wait 24h or clear cookies on website');
            return { success: false, error: 'Rate limit exceeded' };
        }
        
        // Get prediction ID
        const predictionId = responseData.id || responseData.prediction_id || responseData._id;
        
        if (!predictionId) {
            console.log('\n❌ No prediction ID in response');
            return { success: false, error: 'Invalid response format' };
        }
        
        console.log('\n🎉 Generation started!');
        console.log('📋 Prediction ID:', predictionId);
        
        // Poll for result
        console.log('\n⏳ Polling for video...\n');
        return await pollForVideo(predictionId, spoofedClientId, baseEbgParam, baseEbgSignature);
        
    } catch (error) {
        console.log('\n❌ Request failed');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            
            if (error.response.status === 429) {
                console.log('\n⚠️  RATE LIMIT EXCEEDED!');
                console.log('This means the captcha token was already used.');
                console.log('💡 Solution: Generate a fresh video on the website first.');
                return { success: false, error: 'Rate limit - captcha token used' };
            }
            
            console.log('Response:', error.response.data.toString());
        } else {
            console.log('Error:', error.message);
        }
        
        return { success: false, error: error.message };
    }
}

async function pollForVideo(predictionId, clientId, ebgParam, ebgSignature) {
    const pollUrl = `https://api.pixelbin.io/service/public/transformation/v1.0/predictions/veo2--generate--${predictionId}`;
    
    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'pixb-cl-id': clientId,
        'x-ebg-param': ebgParam,
        'x-ebg-signature': ebgSignature
    };
    
    for (let i = 1; i <= 60; i++) {
        console.log(`Poll #${i}...`);
        
        try {
            const response = await axios.get(pollUrl, {
                headers: headers,
                timeout: 60000,
                validateStatus: () => true
            });
            
            const data = JSON.parse(response.data);
            console.log('Status:', response.status);
            
            if (data.status === 'complete' || data.url || (data.output && data.output.url)) {
                console.log('\n🎉 VIDEO READY!');
                const videoUrl = data.url || (data.output && data.output.url);
                console.log('🎬 VIDEO URL:', videoUrl);
                return { success: true, url: videoUrl };
            }
            
            if (data.status === 'failed' || data.error) {
                console.log('\n❌ Failed:', data.error || data.message);
                return { success: false, error: data.error || data.message };
            }
            
            console.log('⏳ Processing...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
        } catch (error) {
            console.log('Poll error:', error.message);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    console.log('\n⏰ Timeout after 60 polls');
    return { success: false, error: 'Timeout' };
}

// Random User Agent generator
function getRandomUserAgent() {
    const chromeVersions = ['146.0.0.0', '145.0.0.0', '144.0.0.0', '143.0.0.0'];
    const osList = [
        'Windows NT 10.0; Win64; x64',
        'Windows NT 11.0; Win64; x64',
        'Macintosh; Intel Mac OS X 10_15_7',
        'X11; Linux x86_64'
    ];
    
    const randomVersion = chromeVersions[Math.floor(Math.random() * chromeVersions.length)];
    const randomOS = osList[Math.floor(Math.random() * osList.length)];
    
    return `Mozilla/5.0 (${randomOS}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${randomVersion} Safari/537.36`;
}

// Run
directGenerate().catch(console.error);
