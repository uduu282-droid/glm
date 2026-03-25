import puppeteer from 'puppeteer';
import fs from 'fs';

/**
 * 🎬 Capture REAL Pixelbin.io Request Format
 */

async function capturePixelbinRequest() {
    console.log('='.repeat(70));
    console.log('🎬 CAPTURING REAL PIXELBIN.IO VIDEO GENERATION REQUEST');
    console.log('='.repeat(70));
    
    let browser = null;
    
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        console.log('\n📡 Monitoring network requests...\n');
        
        let capturedRequest = null;

        page.on('request', request => {
            const url = request.url();
            
            // Capture the veo2 generate request
            if (url.includes('/service/public/transformation/v1.0/predictions/veo2/generate') && request.method() === 'POST') {
                console.log('\n' + '='.repeat(70));
                console.log('🎯 CAUGHT PIXELBIN VIDEO GENERATION REQUEST!');
                console.log('='.repeat(70));
                
                const postData = request.postData();
                const headers = request.headers();
                
                console.log('\n📋 COMPLETE REQUEST:\n');
                console.log('URL:', url);
                console.log('Method:', request.method());
                
                console.log('\n--- HEADERS ---');
                Object.entries(headers).forEach(([key, value]) => {
                    console.log(`${key}: ${value}`);
                });
                
                console.log('\n--- POST DATA ---');
                console.log(postData);
                
                // Try to parse based on content type
                const contentType = headers['content-type'] || '';
                console.log('\n--- CONTENT TYPE ---');
                console.log(contentType);
                
                if (contentType.includes('multipart/form-data')) {
                    console.log('\n⚠️  This is multipart/form-data (binary data)');
                    console.log('Raw length:', postData ? postData.length : 0);
                } else if (contentType.includes('application/json')) {
                    try {
                        const json = JSON.parse(postData);
                        console.log('\nParsed JSON:');
                        console.log(JSON.stringify(json, null, 2));
                    } catch (e) {
                        console.log('Could not parse as JSON');
                    }
                }
                
                // Save everything
                capturedRequest = {
                    timestamp: new Date().toISOString(),
                    url: url,
                    method: request.method(),
                    headers: headers,
                    postData: postData,
                    contentType: contentType
                };
                
                const filename = `PIXELBIN_REAL_REQUEST_${Date.now()}.json`;
                fs.writeFileSync(filename, JSON.stringify(capturedRequest, null, 2));
                
                console.log('\n💾 Saved to:', filename);
                console.log('\n' + '='.repeat(70));
            }
        });

        console.log('\n🌐 Opening https://www.pixelbin.io/ai-tools/video-generator...\n');
        await page.goto('https://www.pixelbin.io/ai-tools/video-generator', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        console.log('✅ Page loaded');
        console.log('\n👀 NOW YOU GENERATE A VIDEO:');
        console.log('1. Enter a prompt in the text-to-video interface');
        console.log('2. Select any options/styles');
        console.log('3. Click Generate button');
        console.log('4. I\'ll capture the EXACT request format!');
        console.log('\n⏰ Browser open for 120 seconds...');
        
        await new Promise(resolve => setTimeout(resolve, 120000));

        console.log('\n\n' + '='.repeat(70));
        console.log('📊 SUMMARY');
        console.log('='.repeat(70));
        
        if (capturedRequest) {
            console.log('✅ Successfully captured video generation request!');
            console.log('\n📄 Check the saved JSON file for exact format.');
            console.log('\n🎯 Use this format in pixelbin_real_veo2.js');
        } else {
            console.log('❌ No request captured.');
            console.log('Make sure you actually generated a video on the website.');
        }
        
        console.log('='.repeat(70));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

capturePixelbinRequest().catch(console.error);
