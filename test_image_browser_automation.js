import puppeteer from 'puppeteer';
import axios from 'axios';

async function testImageGenerationWithBrowser() {
    console.log('🎨 Testing Image Generation API with Browser Automation');
    console.log('Target: https://aifreeforever.com/api/generate-image');
    console.log('='.repeat(50));

    let browser;
    try {
        // Launch browser with stealth options
        console.log('🚀 Launching browser...');
        browser = await puppeteer.launch({
            headless: false, // Show browser for debugging
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-features=site-per-process'
            ]
        });

        const page = await browser.newPage();
        
        // Set realistic user agent and headers
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
        
        // Set extra headers
        await page.setExtraHTTPHeaders({
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
            'Origin': 'https://aifreeforever.com',
            'Referer': 'https://aifreeforever.com/image-generators'
        });

        // Navigate to the website first to get cookies
        console.log('🌐 Visiting website to get cookies...');
        await page.goto('https://aifreeforever.com/image-generators', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });

        // Wait for Cloudflare to process
        console.log('⏳ Waiting for Cloudflare challenge...');
        await page.waitForTimeout(5000);

        // Test the API endpoint
        console.log('🧪 Testing API endpoint...');
        
        const testPrompt = "A beautiful sunset over mountains";
        
        const apiResponse = await page.evaluate(async (prompt) => {
            const payload = {
                "prompt": prompt,
                "resolution": "1024 × 1024 (Square)",
                "speed_mode": "Unsqueezedhighest quality)",
                "output_format": "webp",
                "output_quality": 100,
                "seed": -1,
                "model_type": "fast"
            };

            try {
                const response = await fetch('https://aifreeforever.com/api/generate-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                return {
                    success: true,
                    status: response.status,
                    data: result
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }, testPrompt);

        if (apiResponse.success) {
            console.log('✅ API Request SUCCESS');
            console.log('Status:', apiResponse.status);
            console.log('Response:', JSON.stringify(apiResponse.data, null, 2));
            
            // Check for image URLs
            const result = apiResponse.data;
            if (result.images && result.images.length > 0) {
                console.log('\n🖼️  Generated images:');
                result.images.forEach((image, index) => {
                    console.log(`${index + 1}. ${image}`);
                });
            } else if (result.imageUrl) {
                console.log('\n🖼️  Generated image:');
                console.log(result.imageUrl);
            } else {
                console.log('\n⚠️  No image URLs found in response');
            }
        } else {
            console.log('❌ API Request FAILED');
            console.log('Error:', apiResponse.error);
        }

        // Keep browser open for a moment to see results
        console.log('\n👀 Browser will remain open for 10 seconds to review...');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.log('❌ Browser automation failed:', error.message);
        console.log('Error details:', error);
    } finally {
        if (browser) {
            await browser.close();
            console.log('🔒 Browser closed');
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🏁 Browser-based testing completed');
}

// Alternative: Simple curl-like test with enhanced headers
async function testWithEnhancedHeaders() {
    console.log('\n🧪 Testing with enhanced headers (alternative approach)');
    
    const url = "https://aifreeforever.com/api/generate-image";
    const prompt = "A cat wearing sunglasses";
    
    const payload = {
        "prompt": prompt,
        "resolution": "1024 × 1024 (Square)",
        "speed_mode": "Unsqueezed🍋highest quality)",
        "output_format": "webp",
        "output_quality": 100,
        "seed": -1,
        "model_type": "fast"
    };

    // Try with more sophisticated headers
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
        'Origin': 'https://aifreeforever.com',
        'Referer': 'https://aifreeforever.com/image-generators',
        'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    };

    try {
        console.log('Sending request with enhanced headers...');
        const response = await axios.post(url, payload, { headers, timeout: 30000 });
        
        console.log('✅ Enhanced headers request SUCCESS');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ Enhanced headers request FAILED');
        if (error.response) {
            console.log('Status:', error.response.status);
            if (error.response.data && typeof error.response.data === 'string' && error.response.data.includes('Cloudflare')) {
                console.log('🛡️  Still blocked by Cloudflare protection');
            } else {
                console.log('Response:', error.response.data);
            }
        } else {
            console.log('Error:', error.message);
        }
    }
}

// Run both tests
async function runAllTests() {
    console.log('🤖 Starting comprehensive image generation API tests\n');
    
    // First try browser automation
    await testImageGenerationWithBrowser();
    
    // Then try enhanced headers approach
    await testWithEnhancedHeaders();
    
    console.log('\n✅ All tests completed');
}

// Check if puppeteer is installed
try {
    runAllTests().catch(console.error);
} catch (error) {
    console.log('⚠️  Running enhanced headers test only...');
    testWithEnhancedHeaders().catch(console.error);
}