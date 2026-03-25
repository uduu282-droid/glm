import puppeteer from 'puppeteer';
import fs from 'fs';

/**
 * 🎬 Capture Valid PageId from Website
 * Automates browser visit to extract working pageId
 */

async function capturePageId() {
    console.log('='.repeat(70));
    console.log('🎬 CAPTURING VALID PAGEID FROM WEBSITE');
    console.log('='.repeat(70));
    console.log('\n📡 Target: https://aivideogenerator.me\n');

    let browser = null;

    try {
        // Launch browser
        console.log('🚀 Launching browser...');
        browser = await puppeteer.launch({
            headless: false, // Show browser so user can see what's happening
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });

        const page = await browser.newPage();
        
        // Set realistic viewport and user agent
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36');

        // Enable request interception to capture API calls
        console.log('📡 Monitoring network requests...\n');
        
        let capturedPageId = null;
        let videoRequestData = null;

        // Listen for all network requests
        page.on('request', request => {
            const url = request.url();
            
            // Look for video creation API calls
            if (url.includes('/aimodels/api/v1/ai/video/create')) {
                console.log('✅ CAUGHT VIDEO API REQUEST!');
                console.log('URL:', url);
                
                const postData = request.postData();
                if (postData) {
                    try {
                        const data = JSON.parse(postData);
                        videoRequestData = data;
                        
                        if (data.pageId) {
                            capturedPageId = data.pageId;
                            console.log('\n🎯 CAPTURED PAGEID:', data.pageId);
                            console.log('\nFull Request Data:');
                            console.log(JSON.stringify(data, null, 2));
                        }
                    } catch (e) {
                        console.log('Post data:', postData.substring(0, 200));
                    }
                }
            }

            // Also look for pageRecordList calls
            if (url.includes('/aimodels/api/v1/ai/pageRecordList')) {
                console.log('\n📋 Found pageRecordList request');
                const postData = request.postData();
                if (postData) {
                    console.log('Payload:', postData);
                }
            }
        });

        // Navigate to website
        console.log('🌐 Navigating to https://aivideogenerator.me...\n');
        await page.goto('https://aivideogenerator.me', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // Wait for page to load
        console.log('⏳ Waiting for page to fully load...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Try to find and interact with the video generator
        console.log('\n🔍 Looking for video generator interface...\n');

        // Check if there are any input fields or buttons
        const hasInputField = await page.$('[name="prompt"], textarea[placeholder*="prompt"], input[placeholder*="prompt"]');
        
        if (hasInputField) {
            console.log('✅ Found prompt input field');
            
            // Try to trigger an API call by typing something
            console.log('✍️  Typing test prompt to trigger API...');
            await hasInputField.type('A beautiful sunset over mountains', { delay: 50 });
            
            // Wait for potential API call
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            console.log('ℹ️  No obvious prompt field found - checking other elements');
        }

        // Get all localStorage items (might contain pageId)
        console.log('\n💾 Checking localStorage for pageId...');
        const localStorageItems = await page.evaluate(() => {
            const items = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                items[key] = localStorage.getItem(key);
            }
            return items;
        });

        if (Object.keys(localStorageItems).length > 0) {
            console.log('\nLocalStorage contents:');
            Object.entries(localStorageItems).forEach(([key, value]) => {
                console.log(`  ${key}: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
                
                // Look for anything that might be a pageId
                if (key.toLowerCase().includes('page') || key.toLowerCase().includes('id')) {
                    console.log(`    ⭐ POTENTIAL PAGEID FOUND: ${value}`);
                    if (!capturedPageId && value.length > 5) {
                        capturedPageId = value;
                    }
                }
            });
        }

        // Also check sessionStorage
        console.log('\n💾 Checking sessionStorage...');
        const sessionStorageItems = await page.evaluate(() => {
            const items = {};
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                items[key] = sessionStorage.getItem(key);
            }
            return items;
        });

        if (Object.keys(sessionStorageItems).length > 0) {
            console.log('\nSessionStorage contents:');
            Object.entries(sessionStorageItems).forEach(([key, value]) => {
                console.log(`  ${key}: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
                
                if (key.toLowerCase().includes('page') || key.toLowerCase().includes('id')) {
                    console.log(`    ⭐ POTENTIAL PAGEID FOUND: ${value}`);
                    if (!capturedPageId && value.length > 5) {
                        capturedPageId = value;
                    }
                }
            });
        }

        // Save results
        console.log('\n' + '='.repeat(70));
        console.log('📊 CAPTURE RESULTS');
        console.log('='.repeat(70));

        if (capturedPageId) {
            console.log('\n✅ SUCCESS! Captured pageId:', capturedPageId);
            
            // Save to config file
            const configContent = `// Auto-captured pageId configuration
export const CONFIG = {
    baseUrl: 'https://platform.aivideogenerator.me',
    authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJhaXZpZGVvZ2VuZXJhdG9yLXVzZXItOTc5NzE5Iiwicm5TdHIiOiIzTDVNWEMwSUtPRm5temV5VFNWMDByaE9jUlNMd1NqdyJ9.Yz62KNRtivXfJSmNmKeGctQLrZ9vl6M7c3Ta7nlnFFk',
    uniqueId: '865ead8054fa643f5ae01dcd613ba1ad',
    channel: 'GROK_IMAGINE',
    origin: 'https://aivideogenerator.me',
    pageId: '${capturedPageId}'  // AUTO-CAPTURED
};
`;
            fs.writeFileSync('pixelbin_captured_config.js', configContent);
            console.log('\n💾 Saved configuration to: pixelbin_captured_config.js');

            // Test it immediately
            console.log('\n🧪 Testing captured pageId...');
            console.log('Run this command to test:');
            console.log(`node pixelbin_cli.js "A beautiful sunset" --style=cinematic`);
            console.log('\nThen manually add this pageId to the payload in the code.');

        } else if (videoRequestData) {
            console.log('\n⚠️  Caught API request but no pageId found in payload');
            console.log('Request data:', JSON.stringify(videoRequestData, null, 2));
        } else {
            console.log('\n❌ Could not automatically capture pageId');
            console.log('\n💡 MANUAL CAPTURE INSTRUCTIONS:');
            console.log('1. Keep this browser window open');
            console.log('2. Open DevTools (F12)');
            console.log('3. Go to Network tab');
            console.log('4. Try to generate a video on the website');
            console.log('5. Look for /video/create request');
            console.log('6. Copy the pageId from the request payload');
        }

        console.log('\n' + '='.repeat(70));
        console.log('ℹ️  Browser will remain open for manual inspection');
        console.log('Close it when you\'re done.');
        console.log('='.repeat(70));

        // Keep browser open for manual inspection
        await new Promise(resolve => setTimeout(resolve, 30000));

    } catch (error) {
        console.error('\n❌ Error during capture:', error.message);
        
        if (error.message.includes('timeout')) {
            console.log('\n💡 Timeout occurred - website might be slow or blocking automation');
            console.log('Try manual capture instead:');
            console.log('1. Visit https://aivideogenerator.me in your regular browser');
            console.log('2. Open DevTools (F12) → Network tab');
            console.log('3. Generate a video');
            console.log('4. Find /video/create request');
            console.log('5. Copy pageId from payload');
        }
    } finally {
        // Don't close browser immediately - let user inspect
        if (browser) {
            console.log('\nℹ️  Keeping browser open for 30 seconds for manual inspection...');
            await new Promise(resolve => setTimeout(resolve, 30000));
            // await browser.close();
        }
    }
}

// Run the capture
capturePageId().catch(console.error);
