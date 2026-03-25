import puppeteer from 'puppeteer';
import fs from 'fs';

/**
 * 🎬 Capture EVERYTHING from Real Video Generation
 */

async function captureEverything() {
    console.log('='.repeat(70));
    console.log('🎬 CAPTURING ALL REQUEST DATA FROM REAL VIDEO GENERATION');
    console.log('='.repeat(70));
    
    let browser = null;
    
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        
        // Set realistic browser
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        console.log('\n📡 Monitoring ALL network requests...\n');
        
        const allRequests = [];
        let videoRequestFound = false;

        page.on('request', request => {
            const url = request.url();
            
            // Capture video creation request with EVERYTHING
            if (url.includes('/aimodels/api/v1/ai/video/create') && !videoRequestFound) {
                videoRequestFound = true;
                
                console.log('\n' + '='.repeat(70));
                console.log('🎯 CAUGHT VIDEO GENERATION REQUEST!');
                console.log('='.repeat(70));
                
                const postData = request.postData();
                const headers = request.headers();
                
                console.log('\n📋 COMPLETE REQUEST DATA:\n');
                
                console.log('URL:', url);
                console.log('Method:', request.method());
                
                console.log('\n--- HEADERS ---');
                Object.entries(headers).forEach(([key, value]) => {
                    console.log(`${key}: ${value}`);
                });
                
                console.log('\n--- PAYLOAD ---');
                if (postData) {
                    try {
                        const data = JSON.parse(postData);
                        console.log(JSON.stringify(data, null, 2));
                    } catch (e) {
                        console.log('Raw:', postData);
                    }
                }
                
                console.log('\n--- COOKIES ---');
                const cookies = page.cookies().then(cookies => {
                    cookies.forEach(cookie => {
                        console.log(`${cookie.name}: ${cookie.value}`);
                    });
                    
                    // Save everything
                    const completeData = {
                        timestamp: new Date().toISOString(),
                        url: url,
                        method: request.method(),
                        headers: headers,
                        payload: postData ? JSON.parse(postData) : null,
                        cookies: cookies
                    };
                    
                    const filename = `COMPLETE_VIDEO_REQUEST_${Date.now()}.json`;
                    fs.writeFileSync(filename, JSON.stringify(completeData, null, 2));
                    
                    console.log('\n💾 Saved complete request to:', filename);
                    console.log('\n' + '='.repeat(70));
                });
                
                allRequests.push({
                    type: 'video-create',
                    url: url,
                    method: request.method(),
                    headers: headers,
                    postData: postData
                });
            }
            
            // Also capture related requests
            if (url.includes('aivideogenerator')) {
                allRequests.push({
                    type: 'other',
                    url: url,
                    method: request.method()
                });
            }
        });

        console.log('\n🌐 Opening https://aivideogenerator.me...\n');
        await page.goto('https://aivideogenerator.me', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        console.log('⏳ Waiting for page load...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('\n👀 LOOK FOR THE VIDEO GENERATION INTERFACE');
        console.log('\n💡 INSTRUCTIONS:');
        console.log('1. Find the prompt input field on the website');
        console.log('2. Type any prompt (e.g., "A beautiful sunset")');
        console.log('3. Click Generate/Create Video button');
        console.log('4. I\'ll capture EVERYTHING sent to the server!');
        console.log('\n⏰ Browser open for 90 seconds...');
        
        // Wait for user interaction
        await new Promise(resolve => setTimeout(resolve, 90000));

        console.log('\n\n' + '='.repeat(70));
        console.log('📊 CAPTURE SUMMARY');
        console.log('='.repeat(70));
        console.log(`Total requests captured: ${allRequests.length}`);
        console.log(`Video generation request: ${videoRequestFound ? '✅ YES' : '❌ NO'}`);
        
        if (videoRequestFound) {
            console.log('\n🎉 SUCCESS! Check the saved JSON file for complete request data!');
            console.log('\nUse those exact parameters in pixelbin_cli.js');
        } else {
            console.log('\n⚠️  No video request detected.');
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

captureEverything().catch(console.error);
