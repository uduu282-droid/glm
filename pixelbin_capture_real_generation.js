import puppeteer from 'puppeteer';
import fs from 'fs';

/**
 * 🎬 Capture REAL Video Generation Request
 * Uses the actual website to generate a video and captures all parameters
 */

async function captureRealVideoGeneration() {
    console.log('='.repeat(70));
    console.log('🎬 CAPTURING REAL VIDEO GENERATION FROM WEBSITE');
    console.log('='.repeat(70));
    
    let browser = null;
    
    try {
        // Launch browser with DevTools protocol enabled
        console.log('\n🚀 Launching browser with debugging enabled...');
        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security'
            ]
        });

        const page = await browser.newPage();
        
        // Set realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        console.log('\n📡 Setting up network monitoring...\n');
        
        let capturedRequests = [];
        let videoGenerationRequest = null;

        // Monitor ALL network requests
        page.on('request', request => {
            const url = request.url();
            
            // Look for video creation API calls
            if (url.includes('/aimodels/api/v1/ai/video/create')) {
                console.log('\n✅ CAUGHT VIDEO CREATION REQUEST!');
                console.log('URL:', url);
                
                const postData = request.postData();
                if (postData) {
                    try {
                        const data = JSON.parse(postData);
                        videoGenerationRequest = {
                            url: url,
                            method: request.method(),
                            headers: request.headers(),
                            payload: data,
                            timestamp: new Date().toISOString()
                        };
                        
                        console.log('\n📋 FULL REQUEST CAPTURED:');
                        console.log('Method:', request.method());
                        console.log('\nHeaders:');
                        Object.entries(request.headers()).forEach(([key, value]) => {
                            console.log(`  ${key}: ${value}`);
                        });
                        
                        console.log('\nPayload:');
                        console.log(JSON.stringify(data, null, 2));
                    } catch (e) {
                        console.log('Post data (raw):', postData.substring(0, 300));
                    }
                }
            }
            
            // Also capture pageRecordList
            if (url.includes('/aimodels/api/v1/ai/pageRecordList')) {
                console.log('\n📄 Found pageRecordList request');
                capturedRequests.push({
                    type: 'pageRecordList',
                    url: url,
                    method: request.method(),
                    postData: request.postData()
                });
            }
            
            // Capture any other AI model API calls
            if (url.includes('/aimodels/api/v1/ai/')) {
                console.log(`\n🔍 Found AI API call: ${url}`);
                capturedRequests.push({
                    type: 'ai-api',
                    url: url,
                    method: request.method()
                });
            }
        });

        // Navigate to the website
        console.log('\n🌐 Navigating to https://aivideogenerator.me...\n');
        await page.goto('https://aivideogenerator.me', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        console.log('⏳ Waiting for page to fully load...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Try to find the prompt input field
        console.log('\n🔍 Looking for video generator interface...');
        
        // Wait for and find input fields
        await page.waitForSelector('input, textarea', { timeout: 10000 }).catch(() => {
            console.log('⚠️  No input fields found automatically');
        });

        // Try to interact with the page
        const promptSelectors = [
            '[name="prompt"]',
            'textarea[placeholder*="prompt"]',
            'textarea[placeholder*="describe"]',
            'textarea[placeholder*="video"]',
            'input[placeholder*="prompt"]',
            'textarea'
        ];

        let promptField = null;
        for (const selector of promptSelectors) {
            promptField = await page.$(selector).catch(() => null);
            if (promptField) {
                console.log(`✅ Found prompt field: ${selector}`);
                break;
            }
        }

        if (promptField) {
            console.log('\n✍️  Entering test prompt...');
            await promptField.click();
            await promptField.type('A beautiful sunset over mountains', { delay: 50 });
            
            // Wait a bit for any auto-submit or API calls
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Look for generate button
            const generateSelectors = [
                'button:has-text("Generate")',
                'button:has-text("Create")',
                'button[type="submit"]',
                '.generate-button',
                '.create-button'
            ];
            
            let generateButton = null;
            for (const selector of generateSelectors) {
                generateButton = await page.$(selector).catch(() => null);
                if (generateButton) {
                    console.log(`✅ Found generate button: ${selector}`);
                    console.log('\n🎬 Clicking generate button...');
                    await generateButton.click();
                    break;
                }
            }
            
            if (!generateButton) {
                console.log('⚠️  Could not find generate button automatically');
                console.log('\n💡 MANUAL INSTRUCTIONS:');
                console.log('1. Use the website interface to generate a video');
                console.log('2. This tool will capture all API requests');
                console.log('3. Check the console output for captured data');
            }
        } else {
            console.log('\nℹ️  No obvious prompt field found.');
            console.log('\n💡 MANUAL MODE:');
            console.log('1. Navigate the website manually');
            console.log('2. Generate a video using the UI');
            console.log('3. All API requests will be captured');
        }

        // Keep browser open for manual interaction
        console.log('\n' + '='.repeat(70));
        console.log('👀 BROWSER READY FOR MANUAL INTERACTION');
        console.log('='.repeat(70));
        console.log('\n📋 WHAT TO DO:');
        console.log('1. If auto-detection failed, manually generate a video');
        console.log('2. Use the website\'s video generator interface');
        console.log('3. Watch console output for captured requests');
        console.log('\n⏰ Browser will remain open for 60 seconds...');
        
        // Wait for manual interaction
        await new Promise(resolve => setTimeout(resolve, 60000));

        // Save captured data
        console.log('\n' + '='.repeat(70));
        console.log('💾 SAVING CAPTURED DATA');
        console.log('='.repeat(70));
        
        const captureData = {
            timestamp: new Date().toISOString(),
            videoGenerationRequest,
            otherCapturedRequests: capturedRequests,
            summary: {
                totalRequests: capturedRequests.length,
                videoRequestCaptured: !!videoGenerationRequest
            }
        };
        
        const filename = `captured_video_request_${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(captureData, null, 2));
        
        console.log('\n✅ Data saved to:', filename);
        
        if (videoGenerationRequest) {
            console.log('\n🎉 SUCCESS! Captured video generation request!');
            console.log('\n📋 Use these exact parameters in your code:');
            console.log(JSON.stringify(videoGenerationRequest.payload, null, 2));
        } else {
            console.log('\n⚠️  No video generation request captured');
            console.log('Check if you need to manually interact with the website');
        }

        console.log('\n' + '='.repeat(70));

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        
        if (error.message.includes('timeout')) {
            console.log('\n💡 Timeout - website might be slow or blocking automation');
        }
    } finally {
        if (browser) {
            console.log('\nℹ️  Keeping browser open for inspection...');
            await new Promise(resolve => setTimeout(resolve, 10000));
            await browser.close();
            console.log('Browser closed.');
        }
    }
}

// Run the capture
captureRealVideoGeneration().catch(console.error);
