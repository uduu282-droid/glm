import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Common image generation API endpoints for FLUX.1 services
const potentialEndpoints = [
    {
        url: 'https://hiflux.ai/api/generate',
        method: 'POST',
        body: { prompt: 'a cat' }
    },
    {
        url: 'https://hiflux.ai/api/image/generate',
        method: 'POST',
        body: { prompt: 'a cat' }
    },
    {
        url: 'https://hiflux.ai/api/v1/generate',
        method: 'POST',
        body: { prompt: 'a cat' }
    },
    {
        url: 'https://hiflux.ai/api/predict',
        method: 'POST',
        body: { inputs: 'a cat' }
    },
    {
        url: 'https://hiflux.ai/api/inference',
        method: 'POST',
        body: { prompt: 'a cat' }
    }
];

async function testHiFluxAPIs() {
    console.log('🧪 Testing HiFlux AI API Endpoints\n');
    console.log('=' .repeat(60));
    
    const results = [];
    
    for (const endpoint of potentialEndpoints) {
        console.log(`\n📍 Testing: ${endpoint.url}`);
        
        try {
            const response = await fetch(endpoint.url, {
                method: endpoint.method,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(endpoint.body)
            });
            
            const status = response.status;
            const contentType = response.headers.get('content-type') || '';
            
            console.log(`   Status: ${status}`);
            console.log(`   Content-Type: ${contentType}`);
            
            let data;
            if (contentType.includes('application/json')) {
                data = await response.json();
                console.log(`   Response keys: ${Object.keys(data).slice(0, 10).join(', ')}`);
                
                // Check for success or image data
                if (status >= 200 && status < 300) {
                    console.log(`   ✅ SUCCESS!`);
                    
                    if (JSON.stringify(data).includes('image') || 
                        JSON.stringify(data).includes('url') ||
                        JSON.stringify(data).includes('data')) {
                        console.log(`   🎨 CONTAINS IMAGE DATA!`);
                    }
                } else {
                    console.log(`   ❌ Failed: ${data.message || data.error || 'Unknown error'}`);
                }
            } else {
                const text = await response.text();
                console.log(`   Response: ${text.substring(0, 200)}`);
            }
            
            results.push({
                endpoint: endpoint.url,
                status,
                contentType,
                success: status >= 200 && status < 300,
                response: data || null
            });
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            results.push({
                endpoint: endpoint.url,
                error: error.message,
                success: false
            });
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('\n📊 TEST SUMMARY:\n');
    
    const successfulTests = results.filter(r => r.success);
    console.log(`Total Tested: ${results.length}`);
    console.log(`Successful: ${successfulTests.length}`);
    console.log(`Failed: ${results.length - successfulTests.length}`);
    
    if (successfulTests.length > 0) {
        console.log('\n✅ SUCCESSFUL ENDPOINTS:\n');
        successfulTests.forEach((result, i) => {
            console.log(`${i + 1}. ${result.endpoint}`);
            if (result.response) {
                console.log(`   Keys: ${Object.keys(result.response).slice(0, 10).join(', ')}`);
            }
        });
    }
    
    // Save results
    const outputDir = path.join(__dirname, 'hiflux_api_tests');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString();
    const testReport = {
        timestamp,
        totalTested: results.length,
        successful: successfulTests.length,
        results,
        successfulEndpoints: successfulTests.map(s => s.endpoint)
    };
    
    fs.writeFileSync(
        path.join(outputDir, 'api_test_results.json'),
        JSON.stringify(testReport, null, 2)
    );
    
    // Generate markdown report
    const mdReport = `# HiFlux AI API Test Report

## Test Date
${timestamp}

## Summary
- **Total Endpoints Tested**: ${results.length}
- **Successful**: ${successfulTests.length}
- **Failed**: ${results.length - successfulTests.length}

## Successful Endpoints

${successfulTests.length > 0 ? 
    successfulTests.map(r => `### ${r.endpoint}
- Status: ${r.status}
- Content-Type: ${r.contentType}
- Response Keys: ${r.response ? Object.keys(r.response).join(', ') : 'N/A'}
`).join('\n') :
    'No successful endpoints found. The API may require:\n- Authentication\n- Different request format\n- Browser-based interaction only'}

## All Tested Endpoints

${results.map((r, i) => `${i + 1}. **${r.endpoint}** - ${r.success ? '✅ Success' : r.error ? `❌ ${r.error}` : `❌ Failed (${r.status})`}`).join('\n')}

## Conclusion

${successfulTests.length > 0 ? 
    `Found ${successfulTests.length} working endpoint(s). These can be used for integration.` :
    'No direct API access found. The service likely requires:\n1. Browser automation (Puppeteer)\n2. Authentication via NextAuth\n3. Different endpoint discovery method'}

---
*Generated by HiFlux API Tester*
`;
    
    fs.writeFileSync(path.join(outputDir, 'API_TEST_REPORT.md'), mdReport);
    
    console.log('\n📁 Results saved to:', outputDir);
    console.log('   - api_test_results.json');
    console.log('   - API_TEST_REPORT.md\n');
    
    return testReport;
}

// Run tests
testHiFluxAPIs().catch(console.error);
