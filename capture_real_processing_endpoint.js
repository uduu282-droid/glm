import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureProcessingEndpoint() {
    console.log('🔍 Capturing Real ImgUpscaler Processing Endpoint\n');
    console.log('=' .repeat(70));
    
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-dev-shm-usage'
        ]
    });
    
    const allData = {
        processingEndpoints: [],
        uploadRequests: [],
        processRequests: [],
        responses: []
    };
    
    try {
        const page = await browser.newPage();
        
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        
        // Create test image
        const testImagePath = path.join(__dirname, 'test_for_capture.png');
        const pngHeader = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00, 0x64,
            0x08, 0x02, 0x00, 0x00, 0x00, 0xFF, 0x80, 0x20,
            0x00, 0x00, 0x00, 0x01, 0x73, 0x52, 0x47, 0x42,
            0x00, 0xAE, 0xCE, 0x1C, 0xE9, 0x00, 0x00, 0x00,
            0x04, 0x67, 0x41, 0x4D, 0x41, 0x00, 0x00, 0xB1,
            0x8F, 0x0B, 0xFC, 0x61, 0x05, 0x00, 0x00, 0x00,
            0x09, 0x70, 0x48, 0x59, 0x73, 0x00, 0x00, 0x0E,
            0xC3, 0x00, 0x00, 0x0E, 0xC3, 0x01, 0xC7, 0x6F,
            0xA8, 0x64, 0x00, 0x00, 0x00, 0x19, 0x74, 0x45,
            0x58, 0x74, 0x53, 0x6F, 0x66, 0x74, 0x77, 0x61,
            0x72, 0x65, 0x00, 0x41, 0x64, 0x6F, 0x62, 0x65,
            0x20, 0x49, 0x6D, 0x61, 0x67, 0x65, 0x52, 0x65,
            0x61, 0x64, 0x79, 0x71, 0xC9, 0x65, 0x3C, 0x00,
            0x00, 0x00, 0x1D, 0x49, 0x44, 0x41, 0x54, 0x78,
            0xDA, 0x62, 0x62, 0x60, 0x60, 0x60, 0xF8, 0xCF,
            0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0,
            0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0,
            0xC0, 0xC0, 0xC0, 0xC0, 0x00, 0x05, 0x96, 0x01,
            0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
            0xAE, 0x42, 0x60, 0x82
        ]);
        fs.writeFileSync(testImagePath, pngHeader);
        console.log('📁 Created test image\n');
        
        await page.setRequestInterception(true);
        
        page.on('request', request => {
            const url = request.url();
            const method = request.method();
            
            if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
                console.log(`📡 [${method}] ${url}`);
                
                // Look for processing-related endpoints
                if (url.includes('enhance') || 
                    url.includes('upscale') || 
                    url.includes('process') ||
                    url.includes('sharpen') ||
                    url.includes('restore') ||
                    url.includes('edit') ||
                    url.includes('/api/') && method === 'POST') {
                    
                    const requestData = {
                        url,
                        method,
                        headers: request.headers(),
                        postData: request.postData()
                    };
                    
                    if (url.includes('upload')) {
                        allData.uploadRequests.push(requestData);
                        console.log(`   ⭐ UPLOAD REQUEST!\n`);
                    } else if (url.includes('enhance') || url.includes('upscale') || url.includes('process')) {
                        allData.processRequests.push(requestData);
                        allData.processingEndpoints.push(url.split('?')[0]);
                        console.log(`   🎨 PROCESSING ENDPOINT FOUND!\n`);
                        
                        // Log full details
                        if (requestData.postData) {
                            try {
                                const postData = JSON.parse(requestData.postData);
                                console.log(`   Payload:`, JSON.stringify(postData, null, 2));
                            } catch (e) {
                                console.log(`   Post data: ${requestData.postData.substring(0, 200)}`);
                            }
                        }
                    } else {
                        console.log(`   ⭐ API CANDIDATE!\n`);
                    }
                }
            }
            
            request.continue();
        });
        
        page.on('response', async response => {
            const url = response.url();
            const status = response.status();
            
            if ((url.includes('enhance') || url.includes('upscale') || url.includes('process')) && 
                status >= 200 && status < 300) {
                try {
                    const contentType = response.headers()['content-type'] || '';
                    
                    if (contentType.includes('application/json')) {
                        const json = await response.json();
                        console.log(`✅ Processing Response: ${url.substring(0, 80)}`);
                        console.log(`   Status: ${status}`);
                        console.log(`   Keys: ${Object.keys(json).join(', ')}`);
                        
                        if (json.code === 100000 || json.code === 200) {
                            console.log(`   ✅ SUCCESS RESPONSE!`);
                            console.log(`   Result keys: ${Object.keys(json.result || {}).join(', ')}`);
                            
                            allData.responses.push({
                                url,
                                status,
                                response: json
                            });
                        }
                    }
                } catch (error) {
                    // Not JSON or other error
                }
            }
        });
        
        console.log('🌐 Loading ImgUpscaler...\n');
        await page.goto('https://imgupscaler.ai/ai-photo-editor/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        console.log('⏳ Waiting for page to fully load...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Try to find and click the upscale/enhance button
        console.log('🔍 Looking for enhancement tools...\n');
        
        try {
            // Click on Image-Editor tab first
            const editorTab = await page.$('button:contains("Image-Editor")');
            if (editorTab) {
                console.log('   Clicking Image-Editor tab...');
                await editorTab.click();
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            // Find upload input and upload our test image
            const fileInput = await page.$('input[type="file"]');
            if (fileInput) {
                console.log('   Found file input, uploading test image...\n');
                await fileInput.uploadFile(testImagePath);
                
                console.log('⏳ Waiting for upload and processing...\n');
                await new Promise(resolve => setTimeout(resolve, 10000));
                
                // Look for enhance/upscale buttons and click them
                const enhanceButtons = await page.$$('button');
                for (const button of enhanceButtons) {
                    const text = await page.evaluate(el => el.textContent.toLowerCase(), button);
                    if (text.includes('enhance') || text.includes('upscale') || text.includes('sharpen')) {
                        console.log(`   Found button: "${text.substring(0, 50)}"`);
                        try {
                            await button.click();
                            console.log('   Clicked! Monitoring network...\n');
                            await new Promise(resolve => setTimeout(resolve, 8000));
                        } catch (e) {
                            // Button might not be clickable
                        }
                    }
                }
            }
        } catch (error) {
            console.log('⚠️  Could not interact with page:', error.message);
        }
        
        console.log('\n⏳ Final monitoring period...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Save results
        const outputDir = path.join(__dirname, 'imgupscaler_processing_capture');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString();
        const completeData = {
            timestamp,
            summary: {
                uniqueEndpoints: [...new Set(allData.processingEndpoints)].length,
                uploadRequests: allData.uploadRequests.length,
                processRequests: allData.processRequests.length,
                successfulResponses: allData.responses.length
            },
            processingEndpoints: [...new Set(allData.processingEndpoints)],
            uploadRequests: allData.uploadRequests,
            processRequests: allData.processRequests,
            responses: allData.responses
        };
        
        fs.writeFileSync(
            path.join(outputDir, 'processing_endpoints.json'),
            JSON.stringify(completeData, null, 2)
        );
        
        // Save just the endpoint URLs
        fs.writeFileSync(
            path.join(outputDir, 'endpoints.txt'),
            [...new Set(allData.processingEndpoints)].join('\n')
        );
        
        console.log('\n✅ Capture Complete!\n');
        console.log('=' .repeat(70));
        console.log('\n📊 RESULTS:\n');
        console.log(`   Unique Processing Endpoints: ${[...new Set(allData.processingEndpoints)].length}`);
        console.log(`   Upload Requests: ${allData.uploadRequests.length}`);
        console.log(`   Process Requests: ${allData.processRequests.length}`);
        console.log(`   Successful Responses: ${allData.responses.length}\n`);
        
        if (allData.processRequests.length > 0) {
            console.log('⭐ PROCESSING ENDPOINTS CAPTURED:\n');
            allData.processRequests.forEach((req, i) => {
                console.log(`${i + 1}. ${req.method} ${req.url}`);
            });
        }
        
        if (allData.responses.length > 0) {
            console.log('\n🎨 SUCCESSFUL RESPONSES:\n');
            allData.responses.forEach((resp, i) => {
                console.log(`${i + 1}. ${resp.url}`);
                console.log(`   Code: ${resp.response.code}`);
                console.log(`   Result: ${JSON.stringify(resp.response.result).substring(0, 100)}...`);
            });
        }
        
        console.log('\n📁 Output directory:', outputDir);
        
        return completeData;
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the capture
captureProcessingEndpoint().catch(console.error);
