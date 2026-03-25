import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyzeFooocusWithSpoofing() {
    console.log('🔍 Fooocus FLUX - Endpoint Discovery + Identity Spoofing Test\n');
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
        endpoints: [],
        authTokens: [],
        creditChecks: [],
        generationRequests: [],
        cookies: {},
        localStorage: {}
    };
    
    try {
        const page = await browser.newPage();
        
        // Set realistic headers
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        
        // Intercept ALL requests
        await page.setRequestInterception(true);
        
        page.on('request', request => {
            const url = request.url();
            const method = request.method();
            
            // Capture EVERYTHING
            if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
                console.log(`📡 [${method}] ${url}`);
                
                // Store endpoint
                const baseUrl = url.split('?')[0];
                if (!allData.endpoints.includes(baseUrl)) {
                    allData.endpoints.push(baseUrl);
                }
                
                // Look for auth tokens
                const headers = request.headers();
                if (headers.authorization || headers['x-auth-token'] || headers['x-api-key']) {
                    allData.authTokens.push({
                        url,
                        headers: {
                            authorization: headers.authorization,
                            'x-auth-token': headers['x-auth-token'],
                            'x-api-key': headers['x-api-key']
                        }
                    });
                    console.log(`   🔑 AUTH TOKEN FOUND!\n`);
                }
                
                // Track credit-related requests
                if (url.includes('credit') || url.includes('balance') || url.includes('point')) {
                    allData.creditChecks.push({
                        url,
                        method,
                        headers,
                        postData: request.postData()
                    });
                    console.log(`   💰 CREDIT SYSTEM REQUEST!\n`);
                }
                
                // Look for generation endpoints
                if (url.includes('generate') || 
                    url.includes('create') || 
                    url.includes('image') ||
                    url.includes('flux') ||
                    url.includes('predict') ||
                    url.includes('infer') ||
                    url.includes('/api/') && method === 'POST') {
                    
                    allData.generationRequests.push({
                        url,
                        method,
                        headers,
                        postData: request.postData()
                    });
                    console.log(`   🎨 GENERATION ENDPOINT CANDIDATE!\n`);
                }
            }
            
            request.continue();
        });
        
        page.on('response', async response => {
            const url = response.url();
            const status = response.status();
            
            if ((url.includes('/api/') || url.includes('credit') || url.includes('generate')) && 
                status >= 200 && status < 300) {
                try {
                    const contentType = response.headers()['content-type'] || '';
                    
                    if (contentType.includes('application/json')) {
                        const json = await response.json();
                        console.log(`✅ Response from ${url.substring(0, 80)}`);
                        console.log(`   Keys: ${Object.keys(json).join(', ')}`);
                        
                        // Check for credit info
                        if (JSON.stringify(json).includes('credit') || 
                            JSON.stringify(json).includes('balance') ||
                            JSON.stringify(json).includes('point')) {
                            console.log(`   💰 CREDIT/BALANCE DATA!\n`);
                        }
                        
                        // Check for image data
                        if (JSON.stringify(json).includes('image') || 
                            JSON.stringify(json).includes('url') ||
                            JSON.stringify(json).includes('data:image')) {
                            console.log(`   🎨 IMAGE DATA FOUND!\n`);
                        }
                    }
                } catch (error) {
                    // Ignore
                }
            }
        });
        
        // Navigate to the site
        console.log('\n🌐 Loading https://fooocus-one-eight.vercel.app/apps/flux...\n');
        await page.goto('https://fooocus-one-eight.vercel.app/apps/flux', { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Get cookies
        const cookies = await page.cookies();
        cookies.forEach(cookie => {
            allData.cookies[cookie.name] = cookie.value;
        });
        
        // Get localStorage
        const localStorage = await page.evaluate(() => {
            const data = {};
            Object.keys(localStorage).forEach(key => {
                data[key] = localStorage.getItem(key);
            });
            return data;
        });
        allData.localStorage = localStorage;
        
        console.log('\n🔍 Analyzing authentication & storage...\n');
        console.log('Cookies captured:', Object.keys(allData.cookies).length);
        console.log('LocalStorage items:', Object.keys(allData.localStorage).length);
        
        // Try to find session/token patterns
        const tokenPatterns = [];
        Object.keys(allData.cookies).forEach(key => {
            if (key.includes('session') || key.includes('token') || key.includes('auth')) {
                tokenPatterns.push({
                    type: 'cookie',
                    name: key,
                    value: allData.cookies[key]
                });
            }
        });
        
        Object.keys(allData.localStorage).forEach(key => {
            if (key.includes('session') || key.includes('token') || key.includes('auth')) {
                tokenPatterns.push({
                    type: 'localStorage',
                    name: key,
                    value: allData.localStorage[key]
                });
            }
        });
        
        // Create output directory
        const outputDir = path.join(__dirname, 'fooocus_spoofing_analysis');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Save complete data
        const timestamp = new Date().toISOString();
        const completeData = {
            timestamp,
            url: 'https://fooocus-one-eight.vercel.app/apps/flux',
            summary: {
                totalEndpoints: allData.endpoints.length,
                authTokensFound: allData.authTokens.length,
                creditRequests: allData.creditChecks.length,
                generationCandidates: allData.generationRequests.length,
                cookiesCaptured: Object.keys(allData.cookies).length,
                localStorageItems: Object.keys(allData.localStorage).length
            },
            endpoints: allData.endpoints,
            authTokens: allData.authTokens,
            creditChecks: allData.creditChecks,
            generationRequests: allData.generationRequests,
            cookies: allData.cookies,
            localStorage: allData.localStorage,
            tokenPatterns
        };
        
        fs.writeFileSync(
            path.join(outputDir, 'complete_analysis.json'),
            JSON.stringify(completeData, null, 2)
        );
        
        // Generate report
        const report = `# Fooocus FLUX - Spoofing Analysis Report

## Analysis Date
${timestamp}

## Summary
- **Total Endpoints**: ${allData.endpoints.length}
- **Auth Tokens Found**: ${allData.authTokens.length}
- **Credit Requests**: ${allData.creditChecks.length}
- **Generation Candidates**: ${allData.generationRequests.length}
- **Cookies Captured**: ${Object.keys(allData.cookies).length}
- **LocalStorage Items**: ${Object.keys(allData.localStorage).length}

## All Discovered Endpoints

${allData.endpoints.map(ep => `- \`${ep}\``).join('\n')}

## Authentication Tokens

${allData.authTokens.length > 0 ? 
    allData.authTokens.map((token, i) => `### Token #${i + 1}
- **URL**: ${token.url}
- **Authorization**: ${token.headers.authorization || 'N/A'}
- **X-Auth-Token**: ${token.headers['x-auth-token'] || 'N/A'}
- **X-API-Key**: ${token.headers['x-api-key'] || 'N/A'}
`).join('\n') :
    'No explicit auth tokens found in headers'}

## Credit System Requests

${allData.creditChecks.length > 0 ?
    allData.creditChecks.map((req, i) => `### Credit Request #${i + 1}
- **URL**: ${req.url}
- **Method**: ${req.method}
- **Headers**: ${JSON.stringify(req.headers, null, 2)}
`).join('\n') :
    'No credit-related requests captured'}

## Generation Endpoint Candidates

${allData.generationRequests.length > 0 ?
    allData.generationRequests.map((req, i) => `### Generation Candidate #${i + 1}
- **URL**: ${req.url}
- **Method**: ${req.method}
- **Has Post Data**: ${!!req.postData}
`).join('\n') :
    'No generation endpoints captured yet'}

## Cookies Captured

${Object.entries(allData.cookies).map(([key, value]) => `- **${key}**: \`${value.substring(0, 100)}...\``).join('\n')}

## LocalStorage Items

${Object.entries(allData.localStorage).map(([key, value]) => `- **${key}**: \`${String(value).substring(0, 100)}...\``).join('\n')}

## Potential Spoofing Targets

### Session Identifiers:
${tokenPatterns.length > 0 ?
    tokenPatterns.map(t => `- [${t.type}] ${t.name}: ${t.value.substring(0, 50)}...`).join('\n') :
    'No obvious session tokens found'}

## Recommendations for Spoofing

1. **Identify Session Cookie**: Look for cookies with "session", "auth", or "token" in name
2. **Clear & Re-login**: Try clearing cookies and re-authenticating to get new session
3. **Check LocalStorage**: Some apps store auth tokens in localStorage
4. **Monitor Credit Endpoint**: Watch how balance updates after actions
5. **Test Multiple Sessions**: Open multiple tabs to see if sessions are independent

---
*Generated by Fooocus FLUX Spoofing Analysis Tool*
`;
        
        fs.writeFileSync(path.join(outputDir, 'SPOOFING_REPORT.md'), report);
        
        console.log('\n✅ Analysis Complete!\n');
        console.log('=' .repeat(70));
        console.log('\n📊 RESULTS:\n');
        console.log(`   Total Endpoints: ${allData.endpoints.length}`);
        console.log(`   Auth Tokens: ${allData.authTokens.length}`);
        console.log(`   Credit Requests: ${allData.creditChecks.length}`);
        console.log(`   Generation Candidates: ${allData.generationRequests.length}`);
        console.log(`   Cookies: ${Object.keys(allData.cookies).length}`);
        console.log(`   LocalStorage: ${Object.keys(allData.localStorage).length}`);
        console.log('\n📁 Output folder:', outputDir);
        console.log('\n📄 Key files:');
        console.log('   - complete_analysis.json (full data)');
        console.log('   - SPOOFING_REPORT.md (detailed report)\n');
        
        if (allData.generationRequests.length > 0) {
            console.log('⭐ GENERATION ENDPOINTS FOUND:\n');
            allData.generationRequests.forEach((req, i) => {
                console.log(`${i + 1}. ${req.method} ${req.url}`);
            });
            console.log('');
        }
        
        if (tokenPatterns.length > 0) {
            console.log('🔑 POTENTIAL SESSION TOKENS:\n');
            tokenPatterns.forEach((token, i) => {
                console.log(`${i + 1}. [${token.type}] ${token.name}`);
            });
            console.log('\n💡 Try clearing these to reset identity!');
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

// Run analysis
analyzeFooocusWithSpoofing()
    .then(data => {
        console.log('\n✅ Spoofing analysis completed!\n');
        console.log('Check fooocus_spoofing_analysis/ folder for results.\n');
    })
    .catch(console.error);
