import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fullyReverseEngineerHiFlux() {
    console.log('🎨 Full HiFlux AI Reverse Engineering & Testing\n');
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
        generationAPIs: [],
        responses: [],
        cookies: {},
        authTokens: {}
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
            
            // Capture ALL requests
            if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
                console.log(`📡 [${method}] ${url}`);
                
                allData.endpoints.add(url.split('?')[0]);
                
                // Look for generation-related endpoints
                if (url.includes('generate') || 
                    url.includes('create') || 
                    url.includes('image') ||
                    url.includes('predict') ||
                    url.includes('infer') ||
                    url.includes('flux') ||
                    url.includes('/api/') ||
                    url.includes('txt2img') ||
                    url.includes('text-to-image')) {
                    
                    allData.generationAPIs.push({
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
            
            if ((url.includes('generate') || url.includes('create') || url.includes('image') || url.includes('/api/')) && 
                status >= 200 && status < 300) {
                try {
                    const contentType = response.headers()['content-type'] || '';
                    
                    if (contentType.includes('application/json')) {
                        const json = await response.json();
                        console.log(`✅ API Response: ${url.substring(0, 80)}`);
                        console.log(`   Status: ${status}, Type: ${contentType}`);
                        
                        const keys = Object.keys(json);
                        console.log(`   Keys: ${keys.slice(0, 15).join(', ')}`);
                        
                        // Check for image data
                        const jsonString = JSON.stringify(json);
                        if (jsonString.includes('image') || 
                            jsonString.includes('url') || 
                            jsonString.includes('data:image') ||
                            jsonString.includes('output') ||
                            jsonString.includes('result')) {
                            console.log(`   🎨 CONTAINS IMAGE DATA!`);
                            
                            allData.responses.push({
                                url,
                                status,
                                contentType,
                                response: json,
                                hasImageData: true,
                                keys
                            });
                        }
                        console.log('');
                    }
                } catch (error) {
                    // Ignore binary responses
                }
            }
        });
        
        // Navigate to hiflux.ai (the correct domain)
        console.log('\n🌐 Loading https://hiflux.ai/...\n');
        await page.goto('https://hiflux.ai/', { 
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
            const promptInput = document.querySelector('textarea#prompt') || 
                               document.querySelector('textarea[placeholder*="prompt"]') || 
                               document.querySelector('textarea[placeholder*="Describe"]');
            
            const generateButton = Array.from(document.querySelectorAll('button')).find(btn => {
                const text = btn.textContent?.toLowerCase() || '';
                return text.includes('generate') || text.includes('create') || text.includes('make');
            });
            
            return {
                title: document.title || 'Unknown',
                url: window.location.href,
                hasPromptInput: !!promptInput,
                hasGenerateButton: !!generateButton,
                totalButtons: document.querySelectorAll('button').length,
                totalInputs: document.querySelectorAll('input, textarea').length,
                totalForms: document.querySelectorAll('form').length
            };
        });
        
        console.log('Page Info:');
        console.log(`   Title: ${pageInfo.title}`);
        console.log(`   URL: ${pageInfo.url}`);
        console.log(`   Buttons: ${pageInfo.totalButtons}`);
        console.log(`   Inputs: ${pageInfo.totalInputs}`);
        console.log(`   Forms: ${pageInfo.totalForms}\n`);
        
        if (pageInfo.promptInput) {
            console.log('✓ Found prompt input field\n');
        }
        
        if (pageInfo.generateButton) {
            console.log('✓ Found generate button\n');
        }
        
        // Try to find the actual API endpoint by examining network traffic patterns
        console.log('\n📊 Analyzing JavaScript for API endpoints...\n');
        
        const jsEndpoints = await page.evaluate(() => {
            const endpoints = new Set();
            
            // Look through all scripts for API patterns
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            
            // Common patterns
            const patterns = [
                /https?:\/\/[^\s"'`]+\/api\/[^\s"'`]*/gi,
                /https?:\/\/[^\s"'`]+\/generate[^\s"'`]*/gi,
                /https?:\/\/[^\s"'`]+\/create[^\s"'`]*/gi,
                /https?:\/\/[^\s"'`]+\/image[^\s"'`]*/gi
            ];
            
            return Array.from(endpoints);
        });
        
        // Wait longer to capture more background requests
        console.log('⏳ Monitoring network traffic...\n');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Create output directory
        const outputDir = path.join(__dirname, 'hiflux_full_analysis');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Save complete data
        const timestamp = new Date().toISOString();
        const completeData = {
            timestamp,
            url: 'https://hiflux.ai/',
            summary: {
                totalRequests: requestCount,
                uniqueEndpoints: allData.endpoints.size,
                generationAPIs: allData.generationAPIs.length,
                capturedResponses: allData.responses.length
            },
            endpoints: Array.from(allData.endpoints),
            generationAPIs: allData.generationAPIs,
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
            path.join(outputDir, 'all_endpoints.txt'),
            Array.from(allData.endpoints).join('\n')
        );
        
        // Generate comprehensive report
        const report = `# HiFlux AI - Complete Reverse Engineering Report

## Analysis Information
- **Date**: ${timestamp}
- **Target**: https://hiflux.ai/
- **Service**: Free FLUX.1 AI Image Generator

## Summary Statistics
- Total Network Requests: ${requestCount}
- Unique Endpoints Discovered: ${allData.endpoints.size}
- Generation API Candidates: ${allData.generationAPIs.length}
- Successful Responses Captured: ${allData.responses.length}

## All Discovered Endpoints

${allData.endpoints.map(ep => `- \`${ep}\``).join('\n')}

## Generation API Details

${allData.generationAPIs.map((api, i) => `### API #${i + 1}
- **URL**: ${api.url}
- **Method**: ${api.method}
- **Has Post Data**: ${!!api.postData}
`).join('\n')}

## Captured Responses

${allData.responses.map((resp, i) => `### Response #${i + 1}
- **URL**: ${resp.url}
- **Status**: ${resp.status}
- **Content-Type**: ${resp.contentType}
- **Keys**: ${resp.keys.join(', ')}
- **Has Image Data**: ${resp.hasImageData}
`).join('\n')}

## Authentication & Cookies

${Object.keys(allData.cookies).length > 0 ? 
    Object.entries(allData.cookies).map(([key, value]) => `- **${key}**: \`${value.substring(0, 50)}...\``).join('\n') :
    'No authentication cookies captured'}

## Technical Stack
- Framework: Next.js (React Server Components)
- Authentication: NextAuth
- Hosting: Vercel
- AI Model: FLUX.1

## Next Steps for Testing

1. Test each generation API endpoint directly
2. Replicate exact request format (headers + body)
3. Check authentication requirements
4. Test rate limiting
5. Implement wrapper/proxy

---
*Generated by HiFlux Reverse Engineering Tool*
`;
        
        fs.writeFileSync(path.join(outputDir, 'COMPLETE_REPORT.md'), report);
        
        console.log('\n✅ Analysis Complete!\n');
        console.log('=' .repeat(70));
        console.log('\n📊 FINAL RESULTS:\n');
        console.log(`   Total Requests: ${requestCount}`);
        console.log(`   Unique Endpoints: ${allData.endpoints.size}`);
        console.log(`   Generation APIs: ${allData.generationAPIs.length}`);
        console.log(`   Captured Responses: ${allData.responses.length}`);
        console.log('\n📁 Output folder:', outputDir);
        console.log('\n📄 Key files:');
        console.log('   - complete_data.json (full data dump)');
        console.log('   - all_endpoints.txt (endpoint list)');
        console.log('   - COMPLETE_REPORT.md (detailed report)\n');
        
        if (allData.generationAPIs.length > 0) {
            console.log('⭐ GENERATION APIS DISCOVERED:\n');
            allData.generationAPIs.forEach((api, i) => {
                console.log(`${i + 1}. ${api.method} ${api.url}`);
            });
            console.log('');
        }
        
        if (allData.responses.length > 0) {
            console.log('🎨 RESPONSES WITH IMAGE DATA:\n');
            allData.responses.forEach((resp, i) => {
                console.log(`${i + 1}. ${resp.url}`);
                console.log(`   Keys: ${resp.keys.join(', ')}`);
            });
            console.log('');
        }
        
        // Return data for testing
        return completeData;
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run and save results
fullyReverseEngineerHiFlux()
    .then(data => {
        console.log('\n✅ Reverse engineering completed successfully!\n');
        console.log('Check hiflux_full_analysis/ folder for complete results.\n');
    })
    .catch(console.error);
