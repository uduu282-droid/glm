const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureHiFluxRequests() {
    console.log('🔍 Starting HiFlux.xyz network analysis...\n');
    
    const capturedRequests = [];
    const apiEndpoints = new Set();
    
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--disable-blink-features=AutomationControlled']
    });
    
    try {
        const page = await browser.newPage();
        
        // Set realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        
        // Intercept all network requests
        await page.setRequestInterception(true);
        
        page.on('request', request => {
            const url = request.url();
            const method = request.method();
            
            // Filter for potential API calls
            if (url.includes('/api/') || 
                url.includes('/generate') || 
                url.includes('/image') ||
                url.includes('flux') ||
                url.match(/\/(api|generate|create|predict|infer)/i)) {
                
                console.log(`📡 Captured Request: ${method} ${url}`);
                
                const requestData = {
                    url: url,
                    method: method,
                    resourceType: request.resourceType(),
                    headers: request.headers(),
                    postData: request.postData()
                };
                
                capturedRequests.push(requestData);
                apiEndpoints.add(url.split('?')[0]);
            }
            
            request.continue();
        });
        
        page.on('response', async response => {
            const url = response.url();
            if (url.includes('/api/') || url.includes('flux')) {
                try {
                    const status = response.status();
                    const headers = response.headers();
                    let body;
                    
                    try {
                        body = await response.text();
                    } catch (e) {
                        body = '[Binary or unavailable]';
                    }
                    
                    console.log(`✅ Response: ${status} - ${url.substring(0, 100)}\n`);
                } catch (error) {
                    console.log(`⚠️ Error getting response: ${error.message}\n`);
                }
            }
        });
        
        console.log('🌐 Navigating to https://www.hiflux.xyz/...\n');
        await page.goto('https://www.hiflux.xyz/', { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });
        
        // Wait for page to load
        await page.waitForTimeout(5000);
        
        // Try to find and interact with the input field
        console.log('🔎 Looking for input fields...\n');
        try {
            const inputField = await page.$('textarea, input[type="text"], input:not([type])');
            if (inputField) {
                console.log('✓ Found input field\n');
                // Don't actually type to avoid triggering anti-bot
                await page.waitForTimeout(3000);
            }
        } catch (error) {
            console.log('⚠️ Could not find input field:', error.message);
        }
        
        // Wait more to capture additional requests
        await page.waitForTimeout(5000);
        
        // Extract JavaScript files
        console.log('\n📦 Extracting JavaScript bundles...\n');
        const jsFiles = await page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            return scripts.map(s => s.src).filter(src => src.includes('_next'));
        });
        
        console.log(`Found ${jsFiles.length} JavaScript bundles\n`);
        
        // Save results
        const outputDir = path.join(__dirname, 'hiflux_analysis');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Save captured requests
        fs.writeFileSync(
            path.join(outputDir, 'captured_requests.json'),
            JSON.stringify(capturedRequests, null, 2)
        );
        
        // Save unique endpoints
        fs.writeFileSync(
            path.join(outputDir, 'api_endpoints.txt'),
            Array.from(apiEndpoints).join('\n')
        );
        
        // Save JavaScript file list
        fs.writeFileSync(
            path.join(outputDir, 'javascript_bundles.txt'),
            jsFiles.join('\n')
        );
        
        // Save page source
        const pageSource = await page.content();
        fs.writeFileSync(path.join(outputDir, 'page_source.html'), pageSource);
        
        console.log('\n✅ Analysis complete! Results saved to:', outputDir);
        console.log('\n📊 Summary:');
        console.log(`   - Captured ${capturedRequests.length} API requests`);
        console.log(`   - Found ${apiEndpoints.size} unique API endpoints`);
        console.log(`   - Extracted ${jsFiles.length} JavaScript bundles`);
        console.log('\n📁 Check the hiflux_analysis folder for detailed results\n');
        
    } catch (error) {
        console.error('❌ Error during analysis:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the analysis
captureHiFluxRequests().catch(console.error);
