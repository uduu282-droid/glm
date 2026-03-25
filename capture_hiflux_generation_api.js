import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureImageGenerationAPI() {
    console.log('🎨 Starting HiFlux Image Generation API Capture\n');
    console.log('=' .repeat(60));
    
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-dev-shm-usage'
        ]
    });
    
    const capturedData = {
        generateRequests: [],
        allEndpoints: new Set(),
        responses: []
    };
    
    try {
        const page = await browser.newPage();
        
        // Set realistic headers
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        
        // Intercept requests
        await page.setRequestInterception(true);
        
        page.on('request', request => {
            const url = request.url();
            const method = request.method();
            
            // Capture ALL fetch/XHR requests
            if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
                console.log(`📡 [${method}] ${url}`);
                
                capturedData.allEndpoints.add(url.split('?')[0]);
                
                // Look for generation-related endpoints
                if (url.includes('generate') || 
                    url.includes('create') || 
                    url.includes('image') ||
                    url.includes('predict') ||
                    url.includes('infer') ||
                    url.includes('flux') ||
                    url.includes('ai/') ||
                    url.includes('/api/')) {
                    
                    capturedData.generateRequests.push({
                        url,
                        method,
                        headers: request.headers(),
                        postData: request.postData()
                    });
                    
                    console.log(`   ⭐ POTENTIAL GENERATION API!\n`);
                } else {
                    console.log('');
                }
            }
            
            request.continue();
        });
        
        page.on('response', async response => {
            const url = response.url();
            const status = response.status();
            
            if ((url.includes('generate') || url.includes('create') || url.includes('image')) && 
                status >= 200 && status < 300) {
                try {
                    const contentType = response.headers()['content-type'] || '';
                    
                    if (contentType.includes('application/json')) {
                        const json = await response.json();
                        console.log(`✅ Generation API Response: ${url.substring(0, 80)}`);
                        console.log(`   Status: ${status}`);
                        console.log(`   Keys: ${Object.keys(json).slice(0, 10).join(', ')}`);
                        
                        // Check for image data
                        const jsonString = JSON.stringify(json);
                        if (jsonString.includes('image') || jsonString.includes('url') || jsonString.includes('data:image')) {
                            console.log(`   🎨 CONTAINS IMAGE DATA!`);
                            
                            capturedData.responses.push({
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
        console.log('\n🌐 Loading https://www.hiflux.xyz/...\n');
        await page.goto('https://www.hiflux.xyz/', { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Find and analyze the main interface
        console.log('\n🔍 Analyzing page interface...\n');
        
        const interfaceInfo = await page.evaluate(() => {
            // Find text inputs
            const inputs = Array.from(document.querySelectorAll('textarea, input[type="text"]'));
            const textInputs = inputs.map(input => ({
                type: input.tagName.toLowerCase(),
                placeholder: input.placeholder,
                id: input.id,
                className: input.className,
                hasValue: !!input.value
            }));
            
            // Find buttons
            const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
            const actionButtons = buttons
                .filter(btn => {
                    const text = btn.textContent?.toLowerCase() || '';
                    return text.includes('generate') || 
                           text.includes('create') || 
                           text.includes('make') ||
                           text.includes('draw') ||
                           text.includes('ai');
                })
                .map(btn => ({
                    text: btn.textContent?.trim(),
                    id: btn.id,
                    className: btn.className,
                    disabled: btn.disabled
                }));
            
            // Try to find the main form
            const forms = Array.from(document.querySelectorAll('form'));
            const mainForm = forms.find(form => {
                const hasInput = form.querySelector('textarea, input[type="text"]');
                const hasButton = form.querySelector('button');
                return hasInput && hasButton;
            });
            
            return {
                textInputs,
                actionButtons,
                hasMainForm: !!mainForm,
                formAction: mainForm?.action || mainForm?.getAttribute('action')
            };
        });
        
        console.log('Interface Analysis:');
        console.log(`   Text Inputs: ${interfaceInfo.textInputs.length}`);
        console.log(`   Action Buttons: ${interfaceInfo.actionButtons.length}`);
        console.log(`   Has Main Form: ${interfaceInfo.hasMainForm}\n`);
        
        if (interfaceInfo.textInputs.length > 0) {
            console.log('Sample Input:');
            console.log(`   Placeholder: "${interfaceInfo.textInputs[0].placeholder}"`);
            console.log(`   Type: ${interfaceInfo.textInputs[0].type}\n`);
        }
        
        if (interfaceInfo.actionButtons.length > 0) {
            console.log('Sample Button:');
            console.log(`   Text: "${interfaceInfo.actionButtons[0].text}"`);
            console.log(`   ID: ${interfaceInfo.actionButtons[0].id}\n`);
        }
        
        // Wait more to capture additional requests
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Create output directory
        const outputDir = path.join(__dirname, 'hiflux_generation_api');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Save results
        console.log('\n💾 Saving captured data...\n');
        
        const timestamp = new Date().toISOString();
        const completeData = {
            timestamp,
            url: 'https://www.hiflux.xyz/',
            allEndpoints: Array.from(capturedData.allEndpoints),
            generationRequests: capturedData.generateRequests,
            responses: capturedData.responses,
            interfaceInfo
        };
        
        fs.writeFileSync(
            path.join(outputDir, 'generation_api_data.json'),
            JSON.stringify(completeData, null, 2)
        );
        
        // Extract just the endpoints
        fs.writeFileSync(
            path.join(outputDir, 'endpoints.txt'),
            Array.from(capturedData.allEndpoints).join('\n')
        );
        
        // Generate report
        const report = `# HiFlux Image Generation API Discovery

## Analysis Date
${timestamp}

## Discovered Endpoints (${capturedData.allEndpoints.size} total)

${Array.from(capturedData.allEndpoints).map(ep => `- \`${ep}\``).join('\n')}

## Generation-Specific Requests (${capturedData.generateRequests.length} found)

${capturedData.generateRequests.map((req, i) => `### Request ${i + 1}
- **URL**: ${req.url}
- **Method**: ${req.method}
- **Has Post Data**: ${!!req.postData}
`).join('\n')}

## Interface Information
- Text Inputs: ${interfaceInfo.textInputs.length}
- Action Buttons: ${interfaceInfo.actionButtons.length}
- Main Form: ${interfaceInfo.hasMainForm ? 'Yes' : 'No'}

## Next Steps
1. Test the discovered endpoints directly
2. Replicate request format (headers + body)
3. Check authentication requirements
4. Document rate limits
`;
        
        fs.writeFileSync(path.join(outputDir, 'DISCOVERY_REPORT.md'), report);
        
        console.log('✅ Analysis Complete!\n');
        console.log('=' .repeat(60));
        console.log('\n📊 SUMMARY:\n');
        console.log(`   Total Endpoints: ${capturedData.allEndpoints.size}`);
        console.log(`   Generation APIs: ${capturedData.generateRequests.length}`);
        console.log(`   Responses Captured: ${capturedData.responses.length}`);
        console.log('\n📁 Output folder:', outputDir);
        console.log('\n📄 Files:');
        console.log('   - generation_api_data.json (complete data)');
        console.log('   - endpoints.txt (all endpoints)');
        console.log('   - DISCOVERY_REPORT.md (detailed report)\n');
        
        if (capturedData.generateRequests.length > 0) {
            console.log('⭐ KEY FINDINGS:\n');
            capturedData.generateRequests.forEach((req, i) => {
                console.log(`${i + 1}. ${req.method} ${req.url}`);
            });
            console.log('');
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the capture
captureImageGenerationAPI().catch(console.error);
