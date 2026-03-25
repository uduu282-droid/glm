import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureFullProcessing() {
    console.log('🎨 Capturing Full Image Processing Flow\n');
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
        downloadRequests: [],
        responses: []
    };
    
    try {
        const page = await browser.newPage();
        
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        
        // Create a test image (valid PNG)
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
            0x00, 0x00, 0x19, 0x49, 0x44, 0x41, 0x54, 0x78,
            0xDA, 0x62, 0x60, 0x60, 0x60, 0x60, 0x60, 0x60,
            0x18, 0x63, 0x60, 0x18, 0x00, 0x00, 0x00, 0x69,
            0x00, 0x01, 0xD4, 0xDD, 0xDE, 0x00, 0x00, 0x00,
            0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60,
            0x82
        ]);
        
        const testImagePath = path.join(__dirname, 'process_test.png');
        fs.writeFileSync(testImagePath, pngHeader);
        console.log('📁 Test image created\n');
        
        await page.setRequestInterception(true);
        
        page.on('request', request => {
            const url = request.url();
            const method = request.method();
            
            if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
                console.log(`📡 [${method}] ${url}`);
                
                allData.endpoints.add(url.split('?')[0]);
                
                // Categorize requests
                if (url.includes('upload')) {
                    allData.uploadRequests.push({
                        url,
                        method,
                        headers: request.headers(),
                        postData: request.postData()
                    });
                    console.log(`   ⭐ UPLOAD!\n`);
                } else if (url.includes('enhance') || url.includes('upscale') || url.includes('process') || url.includes('super')) {
                    allData.processRequests.push({
                        url,
                        method,
                        headers: request.headers(),
                        postData: request.postData()
                    });
                    console.log(`   🎨 PROCESSING!\n`);
                } else if (url.includes('download') || url.includes('result') || url.includes('output')) {
                    allData.downloadRequests.push({
                        url,
                        method,
                        headers: request.headers()
                    });
                    console.log(`   📥 DOWNLOAD!\n`);
                } else if (url.includes('/api/')) {
                    console.log(`   ⭐ API!\n`);
                } else {
                    console.log('');
                }
            }
            
            request.continue();
        });
        
        page.on('response', async response => {
            const url = response.url();
            const status = response.status();
            
            if ((url.includes('upload') || url.includes('enhance') || url.includes('process') || url.includes('result')) && 
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
                            jsonString.includes('enhanced') ||
                            jsonString.includes('upscaled')) {
                            console.log(`   🖼️ IMAGE/RESULT DATA!`);
                            
                            allData.responses.push({
                                url,
                                status,
                                contentType,
                                response: json,
                                hasImageData: true
                            });
                        }
                        console.log('');
                    } else if (contentType.includes('image')) {
                        console.log(`🖼️ IMAGE RESPONSE from ${url.substring(0, 80)}\n`);
                        allData.responses.push({
                            url,
                            status,
                            contentType,
                            isImageResponse: true
                        });
                    }
                } catch (error) {
                    // Ignore
                }
            }
        });
        
        console.log('\n🌐 Loading site...\n');
        await page.goto('https://imgupscaler.ai/ai-photo-editor/', { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });
        
        console.log('⏳ Waiting for page...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Upload image
        console.log('📤 Uploading test image...\n');
        
        const fileInput = await page.$('input[type="file"]');
        
        if (fileInput) {
            await fileInput.uploadFile(testImagePath);
            
            console.log('⏳ Monitoring upload and processing (wait 30s)...\n');
            await new Promise(resolve => setTimeout(resolve, 30000));
            
            // Check for processed images on the page
            console.log('🔍 Checking for processed/enhanced images...\n');
                    
            const processedImages = await page.evaluate(() => {
                const images = document.querySelectorAll('img');
                const results = [];
                        
                images.forEach(img => {
                    const src = img.src;
                    if (src && (src.includes('enhanced') || src.includes('upscaled') || src.includes('processed') || src.includes('result') || src.includes('output'))) {
                        results.push({
                            src,
                            alt: img.alt,
                            className: img.className
                        });
                    }
                });
                        
                return results;
            });
            
            if (processedImages.length > 0) {
                console.log('✅ FOUND PROCESSED IMAGES:\n');
                processedImages.forEach((img, i) => {
                    console.log(`${i + 1}. ${img.src}\n`);
                });
            } else {
                console.log('⚠️ No processed images found in DOM yet\n');
            }
            
        } else {
            console.log('❌ File input not found\n');
        }
        
        // Save results
        const outputDir = path.join(__dirname, 'imgupscaler_full_capture');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString();
        const completeData = {
            timestamp,
            summary: {
                totalEndpoints: allData.endpoints.size,
                uploadRequests: allData.uploadRequests.length,
                processRequests: allData.processRequests.length,
                downloadRequests: allData.downloadRequests.length,
                capturedResponses: allData.responses.length,
                processedImagesFound: processedImages ? processedImages.length : 0
            },
            endpoints: Array.from(allData.endpoints),
            uploadRequests: allData.uploadRequests,
            processRequests: allData.processRequests,
            downloadRequests: allData.downloadRequests,
            responses: allData.responses,
            processedImages
        };
        
        fs.writeFileSync(
            path.join(outputDir, 'full_capture.json'),
            JSON.stringify(completeData, null, 2)
        );
        
        fs.unlinkSync(testImagePath);
        
        console.log('\n✅ Capture Complete!\n');
        console.log('=' .repeat(70));
        console.log('\n📊 RESULTS:\n');
        console.log(`   Total Endpoints: ${allData.endpoints.size}`);
        console.log(`   Upload Requests: ${allData.uploadRequests.length}`);
        console.log(`   Process Requests: ${allData.processRequests.length}`);
        console.log(`   Download Requests: ${allData.downloadRequests.length}`);
        console.log(`   Responses: ${allData.responses.length}`);
        console.log(`   Processed Images: ${processedImages ? processedImages.length : 0}\n`);
        
        if (allData.processRequests.length > 0) {
            console.log('🎨 PROCESSING ENDPOINTS FOUND:\n');
            allData.processRequests.forEach((req, i) => {
                console.log(`${i + 1}. ${req.method} ${req.url}\n`);
            });
        }
        
        if (allData.responses.length > 0) {
            console.log('📸 IMPORTANT RESPONSES:\n');
            allData.responses.forEach((resp, i) => {
                console.log(`${i + 1}. ${resp.url}`);
                if (resp.response) {
                    console.log(`   Data: ${JSON.stringify(resp.response, null, 2)}\n`);
                } else {
                    console.log(`   Type: Image\n`);
                }
            });
        }
        
        console.log('\n📁 Output:', outputDir, '\n');
        
        return completeData;
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

captureFullProcessing()
    .then(() => console.log('✅ Done!\n'))
    .catch(console.error);
