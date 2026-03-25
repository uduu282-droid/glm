import fetch from 'node-fetch';

async function testMagicStudioAPI() {
    console.log('🧪 Testing Magic Studio API: magic-studio.ziddi-beatz.workers.dev');
    console.log('=====================================================\n');
    
    const baseUrl = 'https://magic-studio.ziddi-beatz.workers.dev';
    const testPrompt = 'a cat';
    
    // Test different possible endpoint paths
    const endpointsToTest = [
        { path: '/', description: 'Root endpoint with query parameter' },
        { path: '/generate', description: 'Generate endpoint' },
        { path: '/api/generate', description: 'API generate endpoint' },
        { path: '/v1/generate', description: 'Versioned generate endpoint' }
    ];
    
    for (const endpoint of endpointsToTest) {
        try {
            console.log(`\n🚀 Testing: ${endpoint.description}`);
            console.log(`URL: ${baseUrl}${endpoint.path}?prompt=${encodeURIComponent(testPrompt)}`);
            
            const response = await fetch(`${baseUrl}${endpoint.path}?prompt=${encodeURIComponent(testPrompt)}`, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'image/png,image/jpeg,*/*'
                }
            });
            
            console.log(`Status: ${response.status} ${response.statusText}`);
            console.log(`Content-Type: ${response.headers.get('content-type')}`);
            console.log(`Content-Length: ${response.headers.get('content-length') || 'Unknown'}`);
            
            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('image')) {
                    console.log('✅ SUCCESS: Received image data!');
                    
                    // Try to get some response info without downloading the full image
                    const buffer = await response.buffer();
                    console.log(`Image size: ${buffer.length} bytes`);
                    console.log(`✅ Confirmed working endpoint: ${baseUrl}${endpoint.path}`);
                    
                    // Save the image to verify it's valid
                    const fs = await import('fs');
                    const fileName = `magic_studio_test_${Date.now()}.png`;
                    fs.writeFileSync(fileName, buffer);
                    console.log(`💾 Image saved as: ${fileName}`);
                    return `${baseUrl}${endpoint.path}`;
                } else {
                    console.log('⚠️  Response received but not image data');
                    const text = await response.text();
                    console.log(`Response preview: ${text.substring(0, 200)}...`);
                }
            } else {
                console.log(`❌ Failed with status: ${response.status}`);
                if (response.status !== 404) {
                    try {
                        const errorText = await response.text();
                        console.log(`Error details: ${errorText.substring(0, 200)}`);
                    } catch (e) {
                        console.log('Could not read error response');
                    }
                }
            }
        } catch (error) {
            console.log(`❌ Request failed: ${error.message}`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🔍 Testing common query parameter variations...');
    
    // Test different query parameter formats
    const queryVariations = [
        { param: 'prompt', value: testPrompt, description: 'prompt parameter' },
        { param: 'q', value: testPrompt, description: 'q parameter' },
        { param: 'query', value: testPrompt, description: 'query parameter' },
        { param: 'text', value: testPrompt, description: 'text parameter' }
    ];
    
    for (const query of queryVariations) {
        try {
            const url = `${baseUrl}/?${query.param}=${encodeURIComponent(query.value)}`;
            console.log(`\nTesting: ${query.description}`);
            console.log(`URL: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'image/png,image/jpeg,*/*'
                }
            });
            
            if (response.ok && response.headers.get('content-type')?.includes('image')) {
                console.log('✅ SUCCESS: Found working parameter!');
                const buffer = await response.buffer();
                const fileName = `magic_studio_${query.param}_${Date.now()}.png`;
                const fs = await import('fs');
                fs.writeFileSync(fileName, buffer);
                console.log(`💾 Image saved as: ${fileName}`);
                console.log(`✅ Confirmed endpoint: ${url}`);
                return url;
            }
        } catch (error) {
            console.log(`Failed: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n❌ Could not determine the exact working endpoint');
    console.log('The API might require specific headers, authentication, or a different approach');
    return null;
}

// Run the test
testMagicStudioAPI().then(endpoint => {
    if (endpoint) {
        console.log(`\n🎯 Exact working endpoint: ${endpoint}`);
    } else {
        console.log('\n🔧 API test completed - no working endpoint found');
    }
}).catch(error => {
    console.error('Test failed:', error);
});