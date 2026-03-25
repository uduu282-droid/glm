#!/usr/bin/env node

import puppeteer from 'puppeteer';
import axios from 'axios';
import FormData from 'form-data';
import crypto from 'crypto';

/**
 * 🎬 PIXELBIN.IO - UNLIMITED VIDEO GENERATOR
 * Auto-clears cookies + spoofs session for each generation
 * Bypasses rate limits by creating fresh sessions
 */

async function generateUnlimitedVideos() {
    console.log('='.repeat(70));
    console.log('🎬 PIXELBIN.IO - UNLIMITED VIDEO GENERATOR');
    console.log('='.repeat(70));
    
    const prompts = process.argv.slice(2);
    
    if (prompts.length === 0) {
        console.log('\nUsage: node pixelbin_unlimited.js "prompt1" "prompt2" ...');
        console.log('\nExample:');
        console.log('  node pixelbin_unlimited.js "A sunset" "A car" "Ocean waves"');
        console.log('\nOr use default test prompts...\n');
        
        // Default test prompts
        prompts.push(
            "A beautiful sunset over mountains, cinematic lighting",
            "A sports car driving on highway, realistic",
            "Ocean waves crashing on beach, 4k quality"
        );
    }
    
    console.log(`📋 Queue: ${prompts.length} video(s)\n`);
    
    const results = [];
    
    for (let i = 0; i < prompts.length; i++) {
        console.log('\n' + '='.repeat(70));
        console.log(`🎬 GENERATING VIDEO ${i + 1}/${prompts.length}`);
        console.log('='.repeat(70));
        console.log(`Prompt: ${prompts[i]}\n`);
        
        try {
            const result = await generateVideoWithFreshSession(prompts[i]);
            
            if (result.success) {
                console.log(`\n✅ SUCCESS! Video ${i + 1} generated!`);
                console.log('🎬 URL:', result.url);
                results.push({ prompt: prompts[i], success: true, url: result.url });
                
                // Save video URL to file
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `video_${i + 1}_${timestamp}.txt`;
                require('fs').writeFileSync(filename, result.url);
                console.log('💾 Saved to:', filename);
            } else {
                console.log(`\n❌ Failed video ${i + 1}:`, result.error);
                results.push({ prompt: prompts[i], success: false, error: result.error });
            }
            
            // Wait between videos (avoid rate limit detection)
            if (i < prompts.length - 1) {
                console.log('\n⏳ Waiting 10 seconds before next video...');
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
            
        } catch (error) {
            console.log(`\n❌ Error generating video ${i + 1}:`, error.message);
            results.push({ prompt: prompts[i], success: false, error: error.message });
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 GENERATION SUMMARY');
    console.log('='.repeat(70));
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`Total: ${results.length}`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    
    if (successCount > 0) {
        console.log('\n🎉 SUCCESSFUL VIDEOS:');
        results.filter(r => r.success).forEach((r, i) => {
            console.log(`${i + 1}. ${r.prompt}`);
            console.log(`   URL: ${r.url}`);
        });
    }
    
    console.log('\n' + '='.repeat(70));
    
    return results;
}

async function generateVideoWithFreshSession(prompt) {
    let browser = null;
    
    try {
        // Launch FRESH browser instance (no cookies, no cache)
        console.log('🚀 Launching fresh browser session...\n');
        
        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--incognito'  // Incognito mode = no cookies!
            ]
        });

        const page = await browser.newPage();
        
        // SPOOF fingerprint with random values
        const randomClientId = crypto.randomBytes(16).toString('hex');
        const randomUserAgent = getRandomUserAgent();
        
        console.log('🎭 Spoofing session...\n');
        console.log(`   Client ID: ${randomClientId}`);
        console.log(`   User Agent: ${randomUserAgent.substring(0, 50)}...\n`);
        
        await page.setUserAgent(randomUserAgent);
        await page.setViewport({ width: 1920 + Math.floor(Math.random() * 100), height: 1080 });
        
        // Clear all storage
        await page.evaluateOnNewDocument(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        
        let capturedData = null;

        // Monitor network requests
        page.on('request', request => {
            const url = request.url();
            
            if (url.includes('/service/public/transformation/v1.0/predictions/veo2/generate') && 
                request.method() === 'POST') {
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
        console.log('🌐 Opening Pixelbin.io (fresh session)...\n');
        await page.goto('https://www.pixelbin.io/ai-tools/video-generator', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        console.log('✅ Page loaded\n');
        
        // Wait for user to generate
        console.log('👀 WAITING FOR YOU TO GENERATE A VIDEO...');
        console.log('\nINSTRUCTIONS:');
        console.log(`1. Enter this prompt: "${prompt}"`);
        console.log('2. Click Generate button');
        console.log('3. I\'ll capture and replicate it for unlimited generation!\n');
        console.log('⏰ Waiting 90 seconds...\n');
        
        // Wait for capture
        for (let i = 0; i < 90; i++) {
            if (capturedData) {
                console.log('\n✅ Request captured! Processing...\n');
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (!capturedData) {
            console.log('\n❌ No request captured after 90 seconds');
            await browser.close();
            return { success: false, error: 'No capture' };
        }

        await browser.close();

        // Extract tokens from captured request
        console.log('📋 Extracting tokens...\n');
        
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
            return { success: false, error: 'No captcha token' };
        }
        
        const captchaToken = captchaMatch[1];
        console.log(`✅ Captcha Token: ${captchaToken.substring(0, 50)}...\n`);

        // Generate video with captured data
        console.log('='.repeat(70));
        console.log('🎬 GENERATING VIDEO WITH CAPTURED TOKENS');
        console.log('='.repeat(70));
        
        const formData = new FormData();
        formData.append('input.prompt', prompt);
        formData.append('input.aspect_ratio', '16:9');
        formData.append('input.duration', '5');
        formData.append('input.category', 'text-to-video');
        formData.append('input.background', 'prompt');
        formData.append('input.captchaToken', captchaToken);
        
        const headers = {
            'User-Agent': randomUserAgent,
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
            return { success: false, error: 'No prediction ID' };
        }

        console.log('\n🎉 Video generation started!');
        console.log('📋 Prediction ID:', predictionId);

        // Poll for result
        console.log('\n' + '='.repeat(70));
        console.log('⏳ POLLING FOR VIDEO...');
        console.log('='.repeat(70));

        const pollUrl = `https://api.pixelbin.io/service/public/transformation/v1.0/predictions/veo2--generate--${predictionId}`;
        
        const pollHeaders = {
            'Accept': 'application/json, text/plain, */*',
            'pixb-cl-id': clientId,
            'x-ebg-param': ebgParam,
            'x-ebg-signature': ebgSignature
        };

        for (let i = 1; i <= 60; i++) {
            console.log(`Poll #${i}...`);
            
            try {
                const pollResponse = await axios.get(pollUrl, {
                    headers: pollHeaders,
                    timeout: 60000,
                    validateStatus: () => true
                });
                
                const pollData = JSON.parse(pollResponse.data);
                
                if (pollData.status === 'complete' || pollData.url || (pollData.output && pollData.output.url)) {
                    console.log('\n🎉 VIDEO READY!');
                    const videoUrl = pollData.url || (pollData.output && pollData.output.url);
                    console.log('🎬 VIDEO URL:', videoUrl);
                    
                    return { success: true, url: videoUrl };
                }
                
                if (pollData.status === 'failed' || pollData.error) {
                    console.log('\n❌ Generation failed');
                    return { success: false, error: pollData.error || pollData.message };
                }
                
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

// Random User Agent generator for spoofing
function getRandomUserAgent() {
    const chromeVersions = ['146.0.0.0', '145.0.0.0', '144.0.0.0', '143.0.0.0'];
    const versions = [
        'Windows NT 10.0; Win64; x64',
        'Windows NT 11.0; Win64; x64',
        'Macintosh; Intel Mac OS X 10_15_7',
        'X11; Linux x86_64'
    ];
    
    const randomVersion = chromeVersions[Math.floor(Math.random() * chromeVersions.length)];
    const randomOS = versions[Math.floor(Math.random() * versions.length)];
    
    return `Mozilla/5.0 (${randomOS}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${randomVersion} Safari/537.36`;
}

// Run
generateUnlimitedVideos().catch(console.error);
