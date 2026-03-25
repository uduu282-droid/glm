#!/usr/bin/env node

import axios from 'axios';
import FormData from 'form-data';

/**
 * 🎬 REAL PIXELBIN.IO VIDEO GENERATOR
 * Using the ACTUAL api.pixelbin.io endpoint with veo2 model
 */

const CONFIG = {
    baseUrl: 'https://api.pixelbin.io',
    // Will be updated with fresh values from capture
    clientId: '023b70c9ee52e0cee3ead28dd14ffc27',
    ebgParam: 'MjAyNi0wMy0yMVQwOToyOToxMC44MzRa',
    ebgSignature: '70d119f10ed66f1669d731727b1b33fec9dc134a3be6a13084b4de1ee62c3f36'
};

async function generateVideo(options) {
    console.log('='.repeat(70));
    console.log('🎬 REAL PIXELBIN.IO VIDEO GENERATOR (veo2)');
    console.log('='.repeat(70));
    console.log(`Prompt: ${options.prompt}`);
    console.log(`Style: ${options.style || 'default'}`);
    console.log('='.repeat(70));
    
    const url = `${CONFIG.baseUrl}/service/public/transformation/v1.0/predictions/veo2/generate`;
    
    // Create form data (multipart/form-data)
    const formData = new FormData();
    formData.append('input.prompt', options.prompt);
    formData.append('input.aspect_ratio', options.aspectRatio || '16:9');
    formData.append('input.duration', (options.duration || 5).toString());
    formData.append('input.category', 'text-to-video');
    formData.append('input.background', 'prompt');
    
    // Get headers with form data
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://www.pixelbin.io',
        'Referer': 'https://www.pixelbin.io/',
        'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'pixb-cl-id': CONFIG.clientId,
        'x-ebg-param': CONFIG.ebgParam,
        'x-ebg-signature': CONFIG.ebgSignature,
        ...formData.getHeaders()
    };
    
    try {
        console.log('\n📤 Sending request...');
        console.log('Using multipart/form-data format');
        
        const response = await axios.post(url, formData, {
            headers: headers,
            timeout: 120000,
            transformResponse: [(data) => data]
        });
        
        console.log('\n✅ HTTP Status:', response.status);
        console.log('✅ REQUEST SUCCESSFUL!');
        
        const responseData = JSON.parse(response.data);
        console.log('\n📊 Response:', JSON.stringify(responseData, null, 2));
        
        // Check if we got a prediction ID or URL
        if (responseData.id || responseData.url || responseData.prediction_id) {
            console.log('\n🎉 SUCCESS! Video generation started!');
            
            const predictionId = responseData.id || responseData.prediction_id;
            if (predictionId) {
                console.log('📋 Prediction ID:', predictionId);
                
                // Poll for results
                console.log('\n⏳ Polling for video completion...');
                return await pollForResult(predictionId);
            }
            
            if (responseData.url) {
                console.log('🎬 VIDEO URL:', responseData.url);
                return { success: true, url: responseData.url };
            }
        } else {
            console.log('\n⚠️ Unexpected response format');
        }
        
        return { success: true, data: responseData };
        
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

async function pollForResult(predictionId) {
    const pollUrl = `${CONFIG.baseUrl}/service/public/transformation/v1.0/predictions/veo2--generate--${predictionId}`;
    
    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'pixb-cl-id': CONFIG.clientId,
        'x-ebg-param': CONFIG.ebgParam,
        'x-ebg-signature': CONFIG.ebgSignature
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
            if (data.status === 'complete' || data.url) {
                console.log('\n🎉 VIDEO READY!');
                console.log('🎬 VIDEO URL:', data.url);
                return { success: true, url: data.url };
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

// Parse arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        prompt: '',
        style: '',
        negative: '',
        duration: 3,
        resolution: '512x512'
    };
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        if (!arg.startsWith('--')) {
            options.prompt = arg;
        } else if (arg.startsWith('--style=')) {
            options.style = arg.split('=')[1];
        } else if (arg.startsWith('--negative=')) {
            options.negative = arg.split('=')[1];
        } else if (arg.startsWith('--duration=')) {
            options.duration = parseInt(arg.split('=')[1]) || 3;
        } else if (arg.startsWith('--resolution=')) {
            options.resolution = arg.split('=')[1];
        }
    }
    
    return options;
}

// Main
const options = parseArgs();

if (!options.prompt) {
    console.log('Usage: node pixelbin_real.js "your prompt" [options]');
    console.log('Options: --style=xxx --negative=xxx --duration=x --resolution=xxx');
    process.exit(1);
}

generateVideo(options).then(result => {
    if (result.success && result.url) {
        console.log('\n✅ DONE! Video URL:', result.url);
    } else {
        console.log('\n❌ Failed:', result.error || result.data);
    }
}).catch(console.error);
