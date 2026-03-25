import fetch from 'node-fetch';

async function testAllImageEndpoints() {
    console.log('🔍 Testing All Image Generation Endpoints');
    console.log('========================================\n');
    
    const endpoints = [
        // From FINAL_API_TEST_SUMMARY.md
        {
            name: 'Ashlynn Image API (Main)',
            url: 'https://image.itz-ashlynn.workers.dev/generate',
            method: 'GET',
            params: { prompt: 'a beautiful landscape', version: 'flux', size: '1024x1024' }
        },
        {
            name: 'Ashlynn Styles Endpoint',
            url: 'https://image.itz-ashlynn.workers.dev/styles',
            method: 'GET',
            params: {}
        },
        {
            name: 'Magic Studio API',
            url: 'https://magic-studio.ziddi-beatz.workers.dev/',
            method: 'GET',
            params: { prompt: 'a cat' }
        },
        {
            name: 'Flux Demo API',
            url: 'https://fast-flux-demo.replicate.workers.dev/api/generate-image',
            method: 'GET',
            params: { text: 'A beautiful sunset' }
        },
        {
            name: 'Nanob Ashlynn API',
            url: 'https://nanob.ashlynn.workers.dev/',
            method: 'GET',
            params: {}
        },
        
        // From image_apis_test_report.txt
        {
            name: 'Text to Image API',
            url: 'https://text-to-img.apis-bj-devs.workers.dev/',
            method: 'GET',
            params: { prompt: 'cute girl' }
        },
        {
            name: 'Diffusion AI API',
            url: 'https://diffusion-ai.bjcoderx.workers.dev/',
            method: 'GET',
            params: { prompt: 'a cute baby' }
        },
        
        // From worker_apis_test_report.txt
        {
            name: 'SeaArt AI API',
            url: 'https://seaart-ai.apis-bj-devs.workers.dev/',
            method: 'GET',
            params: { Prompt: 'a cute boy' }
        },
        
        // From image_api_test_report.txt
        {
            name: 'Image Gen Vercel API',
            url: 'https://image-gen-eosin.vercel.app/edit-image',
            method: 'POST',
            params: {
                imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
                prompt: 'Turn this landscape into a watercolor painting',
                model: 'gemini-2.5-flash-image-preview'
            }
        },
        
        // Additional endpoints from test files
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
        }
    ];
    
    const results = [];
    const liveEndpoints = [];
    
    for (const endpoint of endpoints) {
        console.log(`\n🧪 Testing: ${endpoint.name}`);
        console.log(`URL: ${endpoint.url}`);
        console.log(`Method: ${endpoint.method}`);
        
        try {
            let fullUrl = endpoint.url;
            let body = null;
            
            if (endpoint.method === 'GET' && Object.keys(endpoint.params).length > 0) {
                const queryParams = new URLSearchParams(endpoint.params);
                fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryParams.toString();
            } else if (endpoint.method === 'POST') {
                body = JSON.stringify(endpoint.params);
            }
            
            console.log(`Full URL: ${fullUrl}`);
            
            const response = await fetch(fullUrl, {
                method: endpoint.method,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Content-Type': endpoint.method === 'POST' ? 'application/json' : 'application/x-www-form-urlencoded',
                    'Accept': 'image/png,image/jpeg,*/*'
                },
                body: body,
                timeout: 30000
            });
            
            const result = {
                name: endpoint.name,
                url: endpoint.url,
                method: endpoint.method,
                status: response.status,
                statusText: response.statusText,
                contentType: response.headers.get('content-type'),
                success: response.ok,
                responseTime: Date.now()
            };
            
            console.log(`Status: ${response.status} ${response.statusText}`);
            console.log(`Content-Type: ${result.contentType}`);
            
            if (response.ok) {
                if (result.contentType && result.contentType.includes('image')) {
                    console.log('✅ SUCCESS: Image response received!');
                    const buffer = await response.buffer();
                    result.imageSize = buffer.length;
                    console.log(`Image size: ${buffer.length} bytes`);
                    
                    // Save image for verification
                    const fs = await import('fs');
                    const fileName = `test_${endpoint.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
                    fs.writeFileSync(fileName, buffer);
                    result.savedFile = fileName;
                    console.log(`💾 Image saved as: ${fileName}`);
                    
                    liveEndpoints.push(result);
                } else {
                    console.log('✅ SUCCESS: API response received (non-image)');
                    try {
                        const text = await response.text();
                        result.responsePreview = text.substring(0, 200);
                        console.log(`Response preview: ${result.responsePreview}...`);
                    } catch (e) {
                        result.responsePreview = 'Could not read response';
                    }
                    liveEndpoints.push(result);
                }
            } else {
                console.log(`❌ FAILED: ${response.status}`);
                try {
                    const errorText = await response.text();
                    result.error = errorText.substring(0, 200);
                    console.log(`Error details: ${result.error}...`);
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
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\nTotal endpoints tested: ${endpoints.length}`);
    console.log(`Working endpoints: ${liveEndpoints.length}`);
    console.log(`Failed endpoints: ${results.length - liveEndpoints.length}`);
    
    console.log('\n✅ LIVE WORKING ENDPOINTS:');
    console.log('-'.repeat(40));
    liveEndpoints.forEach(endpoint => {
        console.log(`\n🟢 ${endpoint.name}`);
        console.log(`   URL: ${endpoint.url}`);
        console.log(`   Status: ${endpoint.status} ${endpoint.statusText}`);
        if (endpoint.imageSize) {
            console.log(`   Image Size: ${endpoint.imageSize} bytes`);
            console.log(`   Saved File: ${endpoint.savedFile}`);
        } else if (endpoint.responsePreview) {
            console.log(`   Response: ${endpoint.responsePreview}...`);
        }
    });
    
    console.log('\n❌ FAILED ENDPOINTS:');
    console.log('-'.repeat(40));
    const failed = results.filter(r => !r.success);
    failed.forEach(endpoint => {
        console.log(`\n🔴 ${endpoint.name}`);
        console.log(`   URL: ${endpoint.url}`);
        console.log(`   Error: ${endpoint.error || `${endpoint.status} ${endpoint.statusText}`}`);
    });
    
    return { results, liveEndpoints };
}

// Run the comprehensive test
testAllImageEndpoints().then(({ results, liveEndpoints }) => {
    console.log('\n🎉 Testing complete!');
    console.log(`Found ${liveEndpoints.length} live image generation endpoints out of ${results.length} total.`);
}).catch(error => {
    console.error('Testing failed:', error);
});