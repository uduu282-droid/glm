import fetch from 'node-fetch';
import fs from 'fs';

async function testAllEndpoints() {
    console.log('🔍 Testing All Image Generation Endpoints');
    console.log('========================================\n');
    
    const endpoints = [
        // Working endpoints from our inventory
        {
            name: 'Ashlynn Image API',
            url: 'https://image.itz-ashlynn.workers.dev/generate',
            method: 'GET',
            params: { prompt: 'a beautiful landscape', version: 'flux', size: '1024x1024' }
        },
        {
            name: 'Ashlynn Styles API',
            url: 'https://image.itz-ashlynn.workers.dev/styles',
            method: 'GET',
            params: {}
        },
        {
            name: 'Ashlynn Base API',
            url: 'https://image.itz-ashlynn.workers.dev/',
            method: 'GET',
            params: {}
        },
        {
            name: 'Text to Image API',
            url: 'https://text-to-img.apis-bj-devs.workers.dev/',
            method: 'GET',
            params: { prompt: 'cute girl' }
        },
        {
            name: 'SeaArt AI API',
            url: 'https://seaart-ai.apis-bj-devs.workers.dev/',
            method: 'GET',
            params: { Prompt: 'a cute boy' }
        },
        {
            name: 'AI Free Forever API',
            url: 'https://aifreeforever.com/api/generate-image',
            method: 'POST',
            params: {
                prompt: 'A beautiful sunset over mountains',
                resolution: '1024 × 1024 (Square)',
                speed_mode: 'Unsqueezed 🍋 (highest quality)',
                output_format: 'webp',
                output_quality: 100,
                seed: -1,
                model_type: 'fast'
            }
        },
        {
            name: 'Flux API',
            url: 'https://fast-flux-demo.replicate.workers.dev/api/generate-image',
            method: 'GET',
            params: { text: 'A beautiful sunset' }
        },
        {
            name: 'Diffusion AI API',
            url: 'https://diffusion-ai.bjcoderx.workers.dev/',
            method: 'GET',
            params: { prompt: 'a cute baby' }
        },
        {
            name: 'Magic Studio API',
            url: 'https://magic-studio.ziddi-beatz.workers.dev/',
            method: 'GET',
            params: { prompt: 'a cat' }
        }
    ];

    const workingEndpoints = [];
    const results = [];

    for (const endpoint of endpoints) {
        console.log(`\n🧪 Testing: ${endpoint.name}`);
        console.log(`URL: ${endpoint.url}`);
        
        try {
            let fullUrl = endpoint.url;
            let body = null;
            let headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            };
            
            if (endpoint.method === 'GET' && Object.keys(endpoint.params).length > 0) {
                const queryParams = new URLSearchParams(endpoint.params);
                fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryParams.toString();
            } else if (endpoint.method === 'POST') {
                body = JSON.stringify(endpoint.params);
                headers['Content-Type'] = 'application/json';
            }
            
            console.log(`Full URL: ${fullUrl}`);
            
            const response = await fetch(fullUrl, {
                method: endpoint.method,
                headers: headers,
                body: body,
                timeout: 30000
            });
            
            const result = {
                name: endpoint.name,
                url: endpoint.url,
                method: endpoint.method,
                status: response.status,
                success: response.ok,
                contentType: response.headers.get('content-type') || 'unknown'
            };
            
            console.log(`Status: ${response.status} ${response.statusText}`);
            console.log(`Content-Type: ${result.contentType}`);
            
            if (response.ok) {
                console.log('✅ SUCCESS');
                workingEndpoints.push(result);
                
                // Try to get response content for verification
                try {
                    if (result.contentType.includes('image')) {
                        const buffer = await response.buffer();
                        result.responseType = 'image';
                        result.size = buffer.length;
                        console.log(`Image size: ${buffer.length} bytes`);
                    } else {
                        const text = await response.text();
                        result.responseType = 'text/json';
                        result.preview = text.substring(0, 100);
                        console.log(`Response preview: ${result.preview}...`);
                    }
                } catch (e) {
                    result.responseType = 'unknown';
                }
            } else {
                console.log(`❌ FAILED: ${response.status}`);
                try {
                    const errorText = await response.text();
                    result.error = errorText.substring(0, 100);
                } catch (e) {
                    result.error = 'Could not read error response';
                }
            }
            
            results.push(result);
            
        } catch (error) {
            console.log(`❌ REQUEST FAILED: ${error.message}`);
            results.push({
                name: endpoint.name,
                url: endpoint.url,
                method: endpoint.method,
                success: false,
                error: error.message
            });
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Generate clean TXT file with only working endpoints
    generateWorkingEndpointsFile(workingEndpoints);
    
    // Display summary
    displaySummary(results, workingEndpoints);
    
    return { results, workingEndpoints };
}

function generateWorkingEndpointsFile(workingEndpoints) {
    const fileName = 'WORKING_IMAGE_ENDPOINTS.txt';
    let content = 'WORKING IMAGE GENERATION ENDPOINTS\n';
    content += '==================================\n\n';
    content += `Last Updated: ${new Date().toISOString()}\n`;
    content += `Total Working Endpoints: ${workingEndpoints.length}\n\n`;
    
    workingEndpoints.forEach((endpoint, index) => {
        content += `${index + 1}. ${endpoint.name}\n`;
        content += `   URL: ${endpoint.url}\n`;
        content += `   Method: ${endpoint.method}\n`;
        content += `   Status: ${endpoint.status}\n`;
        if (endpoint.responseType === 'image') {
            content += `   Response: Direct image data (${endpoint.size} bytes)\n`;
        } else if (endpoint.responseType === 'text/json') {
            content += `   Response: ${endpoint.preview}...\n`;
        }
        content += '\n';
    });
    
    fs.writeFileSync(fileName, content);
    console.log(`\n💾 Working endpoints saved to: ${fileName}`);
}

function displaySummary(results, workingEndpoints) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\nTotal endpoints tested: ${results.length}`);
    console.log(`Working endpoints: ${workingEndpoints.length}`);
    console.log(`Failed endpoints: ${results.length - workingEndpoints.length}`);
    
    console.log('\n✅ LIVE WORKING ENDPOINTS:');
    console.log('-'.repeat(40));
    workingEndpoints.forEach(endpoint => {
        console.log(`\n🟢 ${endpoint.name}`);
        console.log(`   URL: ${endpoint.url}`);
        console.log(`   Status: ${endpoint.status}`);
    });
    
    console.log('\n❌ FAILED ENDPOINTS:');
    console.log('-'.repeat(40));
    const failed = results.filter(r => !r.success);
    failed.forEach(endpoint => {
        console.log(`\n🔴 ${endpoint.name}`);
        console.log(`   URL: ${endpoint.url}`);
        console.log(`   Error: ${endpoint.error || `${endpoint.status}`}`);
    });
}

// Run the comprehensive test
testAllEndpoints().then(({ results, workingEndpoints }) => {
    console.log('\n🎉 Testing complete!');
    console.log(`Found ${workingEndpoints.length} working image generation endpoints out of ${results.length} total.`);
}).catch(error => {
    console.error('Testing failed:', error);
});