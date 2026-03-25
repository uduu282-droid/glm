import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function reverseEngineerAIImages() {
    console.log('🔍 Starting AI-Images Reverse Engineering\n');
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
        cookies: {},
        techStack: {}
    };
    
    try {
        const page = await browser.newPage();
        
        // Set realistic headers
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        
        // Enable request interception
        await page.setRequestInterception(true);
        
        let requestCount = 0;
        
        page.on('request', request => {
            const url = request.url();
            const method = request.method();
            requestCount++;
            
            // Capture ALL XHR/fetch requests
            if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
                console.log(`📡 [${method}] ${url}`);
                
                allData.endpoints.add(url.split('?')[0]);
                
                // Look for API endpoints related to image generation
                if (url.includes('/api/') || 
                    url.includes('generate') || 
                    url.includes('image') ||
                    url.includes('create') ||
                    url.includes('predict') ||
                    url.includes('infer') ||
                    url.includes('flux') ||
                    url.includes('txt2img') ||
                    url.includes('sdapi') ||
                    url.includes('stable-diffusion')) {
                    
                    allData.apiRequests.push({
                        url,
                        method,
                        headers: request.headers(),
                        postData: request.postData()
                    });
                    
                    console.log(`   ⭐ GENERATION API CANDIDATE!\n`);
                } else {
                    console.log('');
                }
            }
            
            request.continue();
        });
        
        page.on('response', async response => {
            const url = response.url();
            const status = response.status();
            
            if ((url.includes('/api/') || url.includes('generate') || url.includes('image')) && 
                status >= 200 && status < 300) {
                try {
                    const contentType = response.headers()['content-type'] || '';
                    
                    if (contentType.includes('application/json')) {
                        const json = await response.json();
                        console.log(`✅ API Response: ${url.substring(0, 80)}`);
                        console.log(`   Status: ${status}`);
                        console.log(`   Keys: ${Object.keys(json).slice(0, 15).join(', ')}`);
                        
                        // Check for image data
                        const jsonString = JSON.stringify(json);
                        if (jsonString.includes('image') || 
                            jsonString.includes('url') || 
                            jsonString.includes('data:image') ||
                            jsonString.includes('output') ||
                            jsonString.includes('result') ||
                            jsonString.includes('images') ||
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
                    // Ignore errors
                }
            }
        });
        
        // Navigate to the site
        console.log('\n🌐 Loading https://ai-images-new.vercel.app/...\n');
        await page.goto('https://ai-images-new.vercel.app/', { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });
        
        console.log('⏳ Waiting for page to fully load...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Get cookies
        const cookies = await page.cookies();
        cookies.forEach(cookie => {
            allData.cookies[cookie.name] = cookie.value;
        });
        
        // Analyze page structure
        console.log('\n🔍 Analyzing page structure...\n');
        
        const pageInfo = await page.evaluate(() => {
            return {
                title: document.title || 'Unknown',
                url: window.location.href,
                description: document.querySelector('meta[name="description"]')?.content || '',
                
                // Find inputs
                inputs: Array.from(document.querySelectorAll('input, textarea')).map(input => ({
                    type: input.type || 'textarea',
                    id: input.id,
                    name: input.name,
                    placeholder: input.placeholder,
                    className: input.className
                })),
                
                // Find buttons
                buttons: Array.from(document.querySelectorAll('button')).map(btn => ({
                    text: btn.textContent?.trim().substring(0, 100),
                    type: btn.type,
                    className: btn.className,
                    id: btn.id
                })),
                
                // Look for framework-specific elements
                frameworks: {
                    gradio: document.querySelectorAll('[class*="gradio"]').length,
                    nextjs: document.querySelectorAll('#__next').length,
                    react: document.querySelectorAll('[data-reactroot]').length
                }
            };
        });
        
        console.log('Page Info:');
        console.log(`   Title: ${pageInfo.title}`);
        console.log(`   Description: ${pageInfo.description.substring(0, 100)}...`);
        console.log(`   Inputs: ${pageInfo.inputs.length}`);
        console.log(`   Buttons: ${pageInfo.buttons.length}`);
        console.log(`   Framework Detection:`);
        console.log(`      - Gradio: ${pageInfo.frameworks.gradio}`);
        console.log(`      - Next.js: ${pageInfo.frameworks.nextjs}`);
        console.log(`      - React: ${pageInfo.frameworks.react}\n`);
        
        // Wait longer to capture background requests
        console.log('⏳ Monitoring network traffic...\n');
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        // Create output directory
        const outputDir = path.join(__dirname, 'ai_images_analysis');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Save complete data
        const timestamp = new Date().toISOString();
        const completeData = {
            timestamp,
            url: 'https://ai-images-new.vercel.app/',
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
        
        // Save endpoints list
        fs.writeFileSync(
            path.join(outputDir, 'endpoints.txt'),
            Array.from(allData.endpoints).join('\n')
        );
        
        // Generate report
        const report = `# AI-Images - Reverse Engineering Report

## Analysis Information
- **Date**: ${timestamp}
- **Target**: https://ai-images-new.vercel.app/
- **Platform**: Vercel

## Summary Statistics
- Total Network Requests: ${requestCount}
- Unique Endpoints: ${allData.endpoints.size}
- API Requests: ${allData.apiRequests.length}
- Responses Captured: ${allData.responses.length}

## All Discovered Endpoints

${allData.endpoints.map(ep => `- \`${ep}\``).join('\n')}

## API Requests Details

${allData.apiRequests.map((api, i) => `### API #${i + 1}
- **URL**: ${api.url}
- **Method**: ${api.method}
- **Has Post Data**: ${!!api.postData}
`).join('\n')}

## Captured Responses

${allData.responses.map((resp, i) => `### Response #${i + 1}
- **URL**: ${resp.url}
- **Status**: ${resp.status}
- **Content-Type**: ${resp.contentType}
- **Has Image Data**: ${resp.hasImageData}
`).join('\n')}

## Authentication & Cookies

${Object.keys(allData.cookies).length > 0 ? 
    Object.entries(allData.cookies).map(([key, value]) => `- **${key}**: \`${value.substring(0, 50)}...\``).join('\n') :
    'No authentication cookies captured'}

## Technical Stack
- Platform: Vercel
- Framework: ${pageInfo.frameworks.nextjs > 0 ? 'Next.js' : pageInfo.frameworks.gradio > 0 ? 'Gradio' : 'Unknown'}

## Next Steps
1. Test discovered API endpoints directly
2. Replicate exact request format
3. Check authentication requirements
4. Document rate limits

---
*Generated by AI-Images Reverse Engineering Tool*
`;
        
        fs.writeFileSync(path.join(outputDir, 'ANALYSIS_REPORT.md'), report);
        
        console.log('\n✅ Analysis Complete!\n');
        console.log('=' .repeat(70));
        console.log('\n📊 FINAL RESULTS:\n');
        console.log(`   Total Requests: ${requestCount}`);
        console.log(`   Unique Endpoints: ${allData.endpoints.size}`);
        console.log(`   API Requests: ${allData.apiRequests.length}`);
        console.log(`   Captured Responses: ${allData.responses.length}`);
        console.log('\n📁 Output folder:', outputDir);
        console.log('\n📄 Key files:');
        console.log('   - complete_data.json (full data dump)');
        console.log('   - endpoints.txt (endpoint list)');
        console.log('   - ANALYSIS_REPORT.md (detailed report)\n');
        
        if (allData.apiRequests.length > 0) {
            console.log('⭐ API ENDPOINTS DISCOVERED:\n');
            allData.apiRequests.forEach((api, i) => {
                console.log(`${i + 1}. ${api.method} ${api.url}`);
            });
            console.log('');
        }
        
        if (allData.responses.length > 0) {
            console.log('🎨 RESPONSES WITH IMAGE DATA:\n');
            allData.responses.forEach((resp, i) => {
                console.log(`${i + 1}. ${resp.url}`);
            });
            console.log('');
        }
        
        return completeData;
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run and save results
reverseEngineerAIImages()
    .then(data => {
        console.log('\n✅ Reverse engineering completed successfully!\n');
        console.log('Check ai_images_analysis/ folder for complete results.\n');
    })
    .catch(console.error);
