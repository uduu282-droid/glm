import puppeteer from 'puppeteer';
import fs from 'fs';

/**
 * 🎬 Monitor the ENTIRE video generation flow
 */

async function monitorFullFlow() {
    console.log('='.repeat(70));
    console.log('🎬 MONITORING COMPLETE VIDEO GENERATION FLOW');
    console.log('='.repeat(70));
    
    let browser = null;
    
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        console.log('\n📡 Capturing ALL API calls...\n');
        
        const apiCalls = [];

        page.on('request', request => {
            const url = request.url();
            
            // Capture ALL AI-related API calls
            if (url.includes('/aimodels/api/v1/ai/') || 
                url.includes('platform.') || 
                url.includes('video')) {
                
                const callInfo = {
                    timestamp: Date.now(),
                    method: request.method(),
                    url: url,
                    headers: request.headers(),
                    postData: request.postData()
                };
                
                console.log(`\n🔍 Found API call:`);
                console.log(`   ${request.method()} ${url}`);
                
                if (request.postData()) {
                    try {
                        const data = JSON.parse(request.postData());
                        console.log(`   Payload:`, JSON.stringify(data).substring(0, 200));
                        callInfo.payload = data;
                    } catch (e) {
                        console.log(`   PostData:`, request.postData().substring(0, 100));
                    }
                }
                
                apiCalls.push(callInfo);
            }
        });

        page.on('response', async response => {
            const url = response.url();
            
            if (url.includes('/aimodels/api/v1/ai/') && 
                !url.includes('.js') && 
                !url.includes('.css')) {
                
                console.log(`   Response: ${response.status()}`);
                
                try {
                    const text = await response.text();
                    if (text.length < 500) {
                        console.log(`   Body:`, text.substring(0, 300));
                    }
                } catch (e) {
                    console.log(`   (Could not read body)`);
                }
            }
        });

        console.log('\n🌐 Navigating to https://aivideogenerator.me...\n');
        await page.goto('https://aivideogenerator.me', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        console.log('\n✅ Page loaded successfully');
        console.log('\n👀 NOW YOU GENERATE A VIDEO:');
        console.log('1. Find the prompt input');
        console.log('2. Type any prompt');
        console.log('3. Click Generate button');
        console.log('4. Wait for video to appear');
        console.log('\n⏰ Browser open for 120 seconds...');
        
        // Wait for user to generate video
        await new Promise(resolve => setTimeout(resolve, 120000));

        console.log('\n\n' + '='.repeat(70));
        console.log('📊 CAPTURED API CALLS SUMMARY');
        console.log('='.repeat(70));
        console.log(`Total API calls captured: ${apiCalls.length}\n`);
        
        apiCalls.forEach((call, index) => {
            console.log(`${index + 1}. ${call.method} ${call.url.split('?')[0]}`);
            if (call.payload) {
                console.log(`   Payload keys: ${Object.keys(call.payload).join(', ')}`);
            }
        });
        
        // Save complete data
        const filename = `FULL_VIDEO_FLOW_${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify({
            timestamp: new Date().toISOString(),
            totalCalls: apiCalls.length,
            apiCalls: apiCalls
        }, null, 2));
        
        console.log(`\n💾 Saved complete flow to: ${filename}`);
        console.log('\n' + '='.repeat(70));
        
        if (apiCalls.length > 0) {
            console.log('\n🎯 Look at the saved file to see EXACTLY what the website sends!');
        } else {
            console.log('\n⚠️  No API calls captured. Did you generate a video?');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

monitorFullFlow().catch(console.error);
