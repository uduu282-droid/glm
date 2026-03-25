import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testImgUpscalerWithUpload() {
    console.log('🔍 ImgUpscaler - Testing with Image Upload\n');
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
        endpoints: new Set(),
        uploadRequests: [],
        processRequests: [],
        responses: []
    };
    
    try {
        const page = await browser.newPage();
        
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        
        // Create a test image (simple base64 PNG)
        const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        const buffer = Buffer.from(testImageBase64.split(',')[1], 'base64');
        const testImagePath = path.join(__dirname, 'test_image.png');
        fs.writeFileSync(testImagePath, buffer);
        
        console.log('📁 Created test image\n');
        
        await page.setRequestInterception(true);
        
        page.on('request', request => {
            const url = request.url();
            const method = request.method();
            
            if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
                console.log(`📡 [${method}] ${url}`);
                
                allData.endpoints.add(url.split('?')[0]);
                
                // Look for upload endpoints
                if (url.includes('upload') || 
                    url.includes('image') ||
                    url.includes('process') ||
                    url.includes('enhance') ||
                    url.includes('upscale') ||
                    url.includes('/api/') && method === 'POST') {
                    
                    const requestData = {
                        url,
                        method,
                        headers: request.headers(),
                        postData: request.postData()
                    };
                    
                    if (url.includes('upload')) {
                        allData.uploadRequests.push(requestData);
                        console.log(`   ⭐ UPLOAD ENDPOINT!\n`);
                    } else if (url.includes('process') || url.includes('enhance')) {
                        allData.processRequests.push(requestData);
                        console.log(`   🎨 PROCESSING ENDPOINT!\n`);
                    } else {
                        console.log(`   ⭐ API CANDIDATE!\n`);
                    }
                } else {
                    console.log('');
                }
            }
            
            request.continue();
        });
        
        page.on('response', async response => {
            const url = response.url();
            const status = response.status();
            
            if ((url.includes('upload') || url.includes('process') || url.includes('enhance')) && 
                status >= 200 && status < 300) {
                try {
                    const contentType = response.headers()['content-type'] || '';
                    
                    if (contentType.includes('application/json')) {
                        const json = await response.json();
                        console.log(`✅ Response from ${url.substring(0, 80)}`);
                        console.log(`   Status: ${status}`);
                        console.log(`   Keys: ${Object.keys(json).join(', ')}`);
                        
                        const jsonString = JSON.stringify(json);
                        if (jsonString.includes('image') || 
                            jsonString.includes('url') || 
                            jsonString.includes('result') ||
                            jsonString.includes('output') ||
                            jsonString.includes('base64')) {
                            console.log(`   🎨 CONTAINS IMAGE DATA!`);
                            
                            allData.responses.push({
                                url,
                                status,
                                contentType,
                                response: json,
                                hasImageData: true
                            });
                        }
                        console.log('');
                    }
                } catch (error) {
                    // Ignore
                }
            }
        });
        
        console.log('\n🌐 Loading https://imgupscaler.ai/ai-photo-editor/...\n');
        await page.goto('https://imgupscaler.ai/ai-photo-editor/', { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });
        
        console.log('⏳ Waiting for page to load...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Find and click the upload button to trigger file input
        console.log('🖱️  Clicking upload button...\n');
        
        try {
            // Wait for and find the file input
            const fileInput = await page.$('input[type="file"]');
            
            if (fileInput) {
                console.log('✅ Found file input element\n');
                
                // Upload the test image
                console.log('📤 Uploading test image...\n');
                await fileInput.uploadFile(testImagePath);
                
                console.log('⏳ Waiting for upload and processing...\n');
                // Wait longer for image processing
                await new Promise(resolve => setTimeout(resolve, 20000));
                
            } else {
                console.log('❌ File input not found\n');
            }
        } catch (error) {
            console.error('❌ Error uploading:', error.message);
        }
        
        // Save results
        const outputDir = path.join(__dirname, 'imgupscaler_upload_analysis');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString();
        const completeData = {
            timestamp,
            url: 'https://imgupscaler.ai/ai-photo-editor/',
            summary: {
                totalEndpoints: allData.endpoints.size,
                uploadRequests: allData.uploadRequests.length,
                processRequests: allData.processRequests.length,
                capturedResponses: allData.responses.length
            },
            endpoints: Array.from(allData.endpoints),
            uploadRequests: allData.uploadRequests,
            processRequests: allData.processRequests,
            responses: allData.responses
        };
        
        fs.writeFileSync(
            path.join(outputDir, 'upload_analysis.json'),
            JSON.stringify(completeData, null, 2)
        );
        
        fs.writeFileSync(
            path.join(outputDir, 'endpoints.txt'),
            Array.from(allData.endpoints).join('\n')
        );
        
        // Clean up test image
        fs.unlinkSync(testImagePath);
        
        console.log('\n✅ Test Complete!\n');
        console.log('=' .repeat(70));
        console.log('\n📊 RESULTS:\n');
        console.log(`   Total Endpoints: ${allData.endpoints.size}`);
        console.log(`   Upload Requests: ${allData.uploadRequests.length}`);
        console.log(`   Process Requests: ${allData.processRequests.length}`);
        console.log(`   Responses Captured: ${allData.responses.length}`);
        console.log('\n📁 Output:', outputDir);
        
        if (allData.uploadRequests.length > 0) {
            console.log('\n⭐ UPLOAD ENDPOINTS FOUND:\n');
            allData.uploadRequests.forEach((req, i) => {
                console.log(`${i + 1}. ${req.method} ${req.url}`);
                console.log(`   Headers: ${JSON.stringify(req.headers, null, 2)}`);
                console.log('');
            });
        }
        
        if (allData.processRequests.length > 0) {
            console.log('🎨 PROCESSING ENDPOINTS FOUND:\n');
            allData.processRequests.forEach((req, i) => {
                console.log(`${i + 1}. ${req.method} ${req.url}`);
                console.log('');
            });
        }
        
        if (allData.responses.length > 0) {
            console.log('📸 RESPONSES WITH IMAGE DATA:\n');
            allData.responses.forEach((resp, i) => {
                console.log(`${i + 1}. ${resp.url}`);
                console.log(`   Data: ${JSON.stringify(resp.response, null, 2)}\n`);
            });
        }
        
        return completeData;
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

testImgUpscalerWithUpload()
    .then(() => console.log('\n✅ Done!\n'))
    .catch(console.error);
