import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function reverseEngineerImgUpscaler() {
    console.log('🔍 Starting ImgUpscaler Reverse Engineering\n');
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
        apiRequests: [],
        responses: [],
        cookies: {}
    };
    
    try {
        const page = await browser.newPage();
        
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        
        await page.setRequestInterception(true);
        
        let requestCount = 0;
        
        page.on('request', request => {
            const url = request.url();
            const method = request.method();
            requestCount++;
            
            if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
                console.log(`📡 [${method}] ${url}`);
                
                allData.endpoints.add(url.split('?')[0]);
                
                if (url.includes('/api/') || 
                    url.includes('upload') || 
                    url.includes('enhance') ||
                    url.includes('upscale') ||
                    url.includes('process') ||
                    url.includes('edit') ||
                    url.includes('image')) {
                    
                    allData.apiRequests.push({
                        url,
                        method,
                        headers: request.headers(),
                        postData: request.postData()
                    });
                    
                    console.log(`   ⭐ API CANDIDATE!\n`);
                } else {
                    console.log('');
                }
            }
            
            request.continue();
        });
        
        page.on('response', async response => {
            const url = response.url();
            const status = response.status();
            
            if ((url.includes('/api/') || url.includes('upload') || url.includes('enhance')) && 
                status >= 200 && status < 300) {
                try {
                    const contentType = response.headers()['content-type'] || '';
                    
                    if (contentType.includes('application/json')) {
                        const json = await response.json();
                        console.log(`✅ Response: ${url.substring(0, 80)}`);
                        console.log(`   Status: ${status}`);
                        console.log(`   Keys: ${Object.keys(json).slice(0, 15).join(', ')}`);
                        
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
        
        const cookies = await page.cookies();
        cookies.forEach(cookie => {
            allData.cookies[cookie.name] = cookie.value;
        });
        
        console.log('\n🔍 Analyzing page structure...\n');
        
        const pageInfo = await page.evaluate(() => {
            return {
                title: document.title || 'Unknown',
                description: document.querySelector('meta[name="description"]')?.content || '',
                
                inputs: Array.from(document.querySelectorAll('input, textarea')).map(input => ({
                    type: input.type,
                    id: input.id,
                    placeholder: input.placeholder,
                    accept: input.accept
                })),
                
                buttons: Array.from(document.querySelectorAll('button')).map(btn => ({
                    text: btn.textContent?.trim().substring(0, 100),
                    type: btn.type,
                    className: btn.className
                })),
                
                uploadElements: Array.from(document.querySelectorAll('input[type="file"], .upload')).map(el => ({
                    tag: el.tagName,
                    accept: el.accept,
                    className: el.className
                }))
            };
        });
        
        console.log('Page Info:');
        console.log(`   Title: ${pageInfo.title}`);
        console.log(`   Inputs: ${pageInfo.inputs.length}`);
        console.log(`   Buttons: ${pageInfo.buttons.length}`);
        console.log(`   Upload Elements: ${pageInfo.uploadElements.length}\n`);
        
        console.log('⏳ Monitoring network traffic...\n');
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        const outputDir = path.join(__dirname, 'imgupscaler_analysis');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString();
        const completeData = {
            timestamp,
            url: 'https://imgupscaler.ai/ai-photo-editor/',
            summary: {
                totalRequests: requestCount,
                uniqueEndpoints: allData.endpoints.size,
                apiRequests: allData.apiRequests.length,
                capturedResponses: allData.responses.length
            },
            endpoints: Array.from(allData.endpoints),
            apiRequests: allData.apiRequests,
            responses: allData.responses,
            cookies: allData.cookies,
            pageInfo
        };
        
        fs.writeFileSync(
            path.join(outputDir, 'complete_data.json'),
            JSON.stringify(completeData, null, 2)
        );
        
        fs.writeFileSync(
            path.join(outputDir, 'endpoints.txt'),
            Array.from(allData.endpoints).join('\n')
        );
        
        console.log('\n✅ Analysis Complete!\n');
        console.log('=' .repeat(70));
        console.log('\n📊 RESULTS:\n');
        console.log(`   Total Requests: ${requestCount}`);
        console.log(`   Unique Endpoints: ${allData.endpoints.size}`);
        console.log(`   API Requests: ${allData.apiRequests.length}`);
        console.log(`   Captured Responses: ${allData.responses.length}`);
        console.log('\n📁 Output:', outputDir);
        
        if (allData.apiRequests.length > 0) {
            console.log('\n⭐ API ENDPOINTS FOUND:\n');
            allData.apiRequests.forEach((api, i) => {
                console.log(`${i + 1}. ${api.method} ${api.url}`);
            });
        }
        
        if (allData.responses.length > 0) {
            console.log('\n🎨 RESPONSES WITH IMAGE DATA:\n');
            allData.responses.forEach((resp, i) => {
                console.log(`${i + 1}. ${resp.url}`);
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

reverseEngineerImgUpscaler()
    .then(() => console.log('\n✅ Done!\n'))
    .catch(console.error);
