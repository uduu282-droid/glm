import fetch from 'node-fetch';

async function testMagicStudioDetailed() {
    console.log('🔍 Detailed Magic Studio API Testing');
    console.log('====================================\n');
    
    const baseUrl = 'https://magic-studio.ziddi-beatz.workers.dev';
    const testPrompt = 'a cat';
    
    // Try different header combinations that might work
    const headerCombinations = [
        {
            name: 'Browser-like headers',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Referer': 'https://magic-studio.ziddi-beatz.workers.dev/',
                'Sec-Fetch-Dest': 'image',
                'Sec-Fetch-Mode': 'no-cors',
                'Sec-Fetch-Site': 'same-origin'
            }
        },
        {
            name: 'Simple headers',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        },
        {
            name: 'API-like headers',
            headers: {
                'User-Agent': 'PostmanRuntime/7.36.0',
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br'
            }
        }
    ];
    
    // Test different endpoints with different headers
    const endpoints = ['/', '/generate', '/api/generate', '/v1/generate'];
    const params = ['prompt', 'q', 'query', 'text'];
    
    for (const headerSet of headerCombinations) {
        console.log(`\n🧪 Testing with: ${headerSet.name}`);
        console.log('----------------------------------------');
        
        for (const endpoint of endpoints) {
            for (const param of params) {
                const url = `${baseUrl}${endpoint}?${param}=${encodeURIComponent(testPrompt)}`;
                
                try {
                    console.log(`\nTesting: ${url}`);
                    
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: headerSet.headers
                    });
                    
                    console.log(`Status: ${response.status} ${response.statusText}`);
                    console.log(`Content-Type: ${response.headers.get('content-type')}`);
                    
                    if (response.ok) {
                        const contentType = response.headers.get('content-type');
                        if (contentType && (contentType.includes('image') || contentType.includes('png') || contentType.includes('jpeg'))) {
                            console.log('✅ SUCCESS: Image response received!');
                            const buffer = await response.buffer();
                            console.log(`Image size: ${buffer.length} bytes`);
                            
                            // Save the image
                            const fs = await import('fs');
                            const fileName = `magic_studio_success_${Date.now()}.png`;
                            fs.writeFileSync(fileName, buffer);
                            console.log(`💾 Image saved as: ${fileName}`);
                            
                            console.log(`\n🎯 WORKING ENDPOINT FOUND:`);
                            console.log(`   URL: ${url}`);
                            console.log(`   Headers: ${headerSet.name}`);
                            console.log(`   Response Size: ${buffer.length} bytes`);
                            return { url, headers: headerSet.name, size: buffer.length };
                        } else {
                            console.log(`⚠️  OK response but not image: ${contentType}`);
                            const text = await response.text();
                            console.log(`Response preview: ${text.substring(0, 100)}...`);
                        }
                    } else if (response.status === 500) {
                        const errorText = await response.text();
                        console.log(`500 Error: ${errorText.substring(0, 100)}...`);
                    } else {
                        console.log(`❌ Failed: ${response.status}`);
                    }
                } catch (error) {
                    console.log(`❌ Request error: ${error.message}`);
                }
                
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
    }
    
    console.log('\n🔄 Testing POST method (alternative approach)...');
    
    // Try POST method with JSON body
    try {
        const postResponse = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Content-Type': 'application/json',
                'Accept': 'image/png,image/jpeg,*/*'
            },
            body: JSON.stringify({
                prompt: testPrompt,
                model: 'default'
            })
        });
        
        console.log(`POST Status: ${postResponse.status}`);
        console.log(`POST Content-Type: ${postResponse.headers.get('content-type')}`);
        
        if (postResponse.ok && postResponse.headers.get('content-type')?.includes('image')) {
            console.log('✅ POST method works!');
            const buffer = await postResponse.buffer();
            const fs = await import('fs');
            const fileName = `magic_studio_post_${Date.now()}.png`;
            fs.writeFileSync(fileName, buffer);
            console.log(`💾 POST image saved as: ${fileName}`);
            return { url: baseUrl, method: 'POST', size: buffer.length };
        }
    } catch (error) {
        console.log(`POST failed: ${error.message}`);
    }
    
    console.log('\n❌ No working configuration found');
    console.log('The API might be temporarily down or require specific authentication');
    return null;
}

// Run the detailed test
testMagicStudioDetailed().then(result => {
    if (result) {
        console.log('\n🎉 SUCCESS SUMMARY:');
        console.log('==================');
        console.log(`Endpoint: ${result.url}`);
        console.log(`Method: ${result.method || 'GET'}`);
        console.log(`Headers: ${result.headers || 'Default'}`);
        console.log(`Image Size: ${result.size} bytes`);
    } else {
        console.log('\n🔧 Testing complete - API not accessible with current configuration');
    }
}).catch(error => {
    console.error('Test failed with error:', error);
});