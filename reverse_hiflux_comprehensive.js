import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function comprehensiveHiFluxAnalysis() {
    console.log('🚀 Starting Comprehensive HiFlux.xyz Reverse Engineering\n');
    console.log('=' .repeat(60));
    
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-dev-shm-usage'
        ]
    });
    
    const allData = {
        networkRequests: [],
        apiEndpoints: new Set(),
        javascriptFiles: [],
        forms: [],
        buttons: [],
        potentialAPIs: []
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
        
        page.on('request', request => {
            const url = request.url();
            const method = request.method();
            
            // Capture all XHR and fetch requests
            if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
                console.log(`📡 [${method}] ${url}`);
                
                allData.networkRequests.push({
                    url,
                    method,
                    resourceType: request.resourceType(),
                    headers: request.headers(),
                    postData: request.postData()
                });
                
                // Extract base endpoint
                const baseUrl = url.split('?')[0];
                if (baseUrl.includes('/api/') || 
                    baseUrl.includes('generate') || 
                    baseUrl.includes('image') ||
                    baseUrl.includes('create') ||
                    baseUrl.includes('predict')) {
                    allData.apiEndpoints.add(baseUrl);
                }
            }
            
            request.continue();
        });
        
        page.on('response', async response => {
            const url = response.url();
            const status = response.status();
            
            if ((url.includes('/api/') || url.includes('generate')) && status >= 200 && status < 300) {
                try {
                    const contentType = response.headers()['content-type'] || '';
                    
                    // Try to get response body for JSON APIs
                    if (contentType.includes('application/json')) {
                        const json = await response.json();
                        console.log(`✅ API Response from ${url.substring(0, 80)}...`);
                        console.log(`   Status: ${status}, Type: ${contentType}`);
                        
                        // Analyze response structure
                        if (typeof json === 'object') {
                            const keys = Object.keys(json);
                            console.log(`   Response keys: ${keys.slice(0, 10).join(', ')}`);
                            
                            // Look for image URLs or data
                            if (keys.some(k => k.includes('image') || k.includes('url') || k.includes('data'))) {
                                console.log(`   ⭐ POTENTIAL IMAGE GENERATION API!`);
                            }
                        }
                        console.log('');
                    }
                } catch (error) {
                    // Ignore binary responses
                }
            }
        });
        
        // Navigate to the site
        console.log('\n🌐 Loading https://www.hiflux.xyz/...\n');
        await page.goto('https://www.hiflux.xyz/', { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Extract page information
        console.log('\n📊 Extracting page structure...\n');
        
        const pageInfo = await page.evaluate(() => {
            return {
                scripts: Array.from(document.querySelectorAll('script[src]'))
                    .map(s => s.src)
                    .filter(src => src.includes('_next') || src.includes('.js')),
                
                forms: Array.from(document.querySelectorAll('form'))
                    .map((form, i) => ({
                        id: form.id || `form_${i}`,
                        action: form.action,
                        method: form.method,
                        className: form.className
                    })),
                
                inputs: Array.from(document.querySelectorAll('input, textarea'))
                    .map((input, i) => ({
                        type: input.type,
                        name: input.name,
                        placeholder: input.placeholder,
                        id: input.id
                    })),
                
                buttons: Array.from(document.querySelectorAll('button, [role="button"]'))
                    .map((btn, i) => ({
                        text: btn.textContent?.trim().substring(0, 50),
                        type: btn.type,
                        className: btn.className,
                        id: btn.id
                    }))
            };
        });
        
        allData.javascriptFiles = pageInfo.scripts;
        allData.forms = pageInfo.forms;
        allData.buttons = pageInfo.buttons;
        
        console.log(`Found:`);
        console.log(`   - ${pageInfo.scripts.length} JavaScript files`);
        console.log(`   - ${pageInfo.forms.length} forms`);
        console.log(`   - ${pageInfo.inputs.length} input fields`);
        console.log(`   - ${pageInfo.buttons.length} buttons\n`);
        
        // Look for the main input field
        const promptInput = await page.$('textarea[placeholder*="prompt"], textarea[placeholder*="describe"], input[type="text"]');
        if (promptInput) {
            console.log('✓ Found main prompt input field\n');
        }
        
        // Wait to capture more requests
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Create output directory
        const outputDir = path.join(__dirname, 'hiflux_complete_analysis');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Save all captured data
        console.log('\n💾 Saving analysis results...\n');
        
        // Save network requests
        fs.writeFileSync(
            path.join(outputDir, 'network_requests.json'),
            JSON.stringify(allData.networkRequests, null, 2)
        );
        
        // Save API endpoints
        fs.writeFileSync(
            path.join(outputDir, 'api_endpoints.txt'),
            Array.from(allData.apiEndpoints).join('\n')
        );
        
        // Save page info
        fs.writeFileSync(
            path.join(outputDir, 'page_structure.json'),
            JSON.stringify(pageInfo, null, 2)
        );
        
        // Save full data dump
        const dataDump = {
            timestamp: new Date().toISOString(),
            url: 'https://www.hiflux.xyz/',
            networkRequests: allData.networkRequests.length,
            apiEndpoints: Array.from(allData.apiEndpoints),
            javascriptFiles: allData.javascriptFiles,
            forms: allData.forms,
            buttons: allData.buttons
        };
        
        fs.writeFileSync(
            path.join(outputDir, 'complete_analysis.json'),
            JSON.stringify(dataDump, null, 2)
        );
        
        // Generate summary report
        const report = generateReport(dataDump);
        fs.writeFileSync(path.join(outputDir, 'ANALYSIS_REPORT.md'), report);
        
        console.log('✅ Analysis Complete!\n');
        console.log('=' .repeat(60));
        console.log('\n📊 FINAL SUMMARY:\n');
        console.log(`   Network Requests Captured: ${allData.networkRequests.length}`);
        console.log(`   Unique API Endpoints: ${allData.apiEndpoints.size}`);
        console.log(`   JavaScript Files: ${allData.javascriptFiles.length}`);
        console.log(`   Forms Found: ${allData.forms.length}`);
        console.log(`   Buttons Found: ${allData.buttons.length}`);
        console.log('\n📁 Results saved to:', outputDir);
        console.log('\n📄 Key files:');
        console.log('   - api_endpoints.txt (discovered API URLs)');
        console.log('   - network_requests.json (full request details)');
        console.log('   - ANALYSIS_REPORT.md (detailed findings)');
        console.log('   - complete_analysis.json (complete data dump)\n');
        
        if (allData.apiEndpoints.size > 0) {
            console.log('⭐ DISCOVERED API ENDPOINTS:\n');
            Array.from(allData.apiEndpoints).forEach(ep => {
                console.log(`   → ${ep}`);
            });
            console.log('');
        }
        
    } catch (error) {
        console.error('\n❌ Error during analysis:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

function generateReport(data) {
    return `# HiFlux.xyz Reverse Engineering Analysis Report

## Overview
- **Target**: https://www.hiflux.xyz/
- **Analysis Date**: ${data.timestamp}
- **Service**: Free AI Image Generator (FLUX.1 powered)

## Discovery Summary

### Network Activity
- **Total Requests Captured**: ${data.networkRequests}
- **Unique API Endpoints**: ${data.apiEndpoints.length}

### Page Structure
- **JavaScript Files**: ${data.javascriptFiles.length}
- **Forms**: ${data.forms.length}
- **Buttons**: ${data.buttons.length}

## API Endpoints Discovered

${data.apiEndpoints.map((ep, i) => `${i + 1}. \`${ep}\``).join('\n')}

## Next Steps

1. **Test Endpoints**: Use the discovered API endpoints with test prompts
2. **Analyze Request Format**: Check network_requests.json for headers and body format
3. **Identify Authentication**: Look for API keys or tokens in requests
4. **Check Rate Limits**: Test endpoint rate limiting
5. **Implement Wrapper**: Create a proxy or client library

## Technical Details

### Likely Technology Stack
- **Framework**: Next.js (based on _next/static chunks)
- **Deployment**: Vercel/Cloudflare (common for Next.js)
- **AI Backend**: FLUX.1 models

### Potential Protection Mechanisms
- May have Cloudflare bot protection
- Possible rate limiting per IP
- Could use session tokens or cookies

## Recommendations

1. Start by testing the simplest API endpoint
2. Replicate exact headers from captured requests
3. Monitor for rate limiting (429 responses)
4. Check CORS policies for direct browser access
5. Consider using Puppeteer for ongoing automation if direct API access is restricted

---
*Generated by HiFlux Reverse Engineering Tool*
`;
}

// Run the analysis
comprehensiveHiFluxAnalysis().catch(console.error);
