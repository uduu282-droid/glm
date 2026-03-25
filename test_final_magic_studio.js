import fetch from 'node-fetch';

async function testExactMagicStudioEndpoint() {
    console.log('🎯 Testing Exact Magic Studio Endpoint');
    console.log('=====================================\n');
    
    const baseUrl = 'https://magic-studio.ziddi-beatz.workers.dev';
    const testPrompt = 'a cat';
    
    // Based on the error message, it wants ?prompt= parameter
    console.log('Testing the exact format from error message...\n');
    
    // Test the root endpoint with prompt parameter
    const testUrl = `${baseUrl}/?prompt=${encodeURIComponent(testPrompt)}`;
    
    console.log(`Testing: ${testUrl}`);
    
    try {
        const response = await fetch(testUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/png,image/jpeg,image/*,*/*;q=0.8'
            }
        });
        
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        console.log(`Content-Length: ${response.headers.get('content-length')}`);
        
        if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('image')) {
                console.log('✅ SUCCESS: Image response received!');
                const buffer = await response.buffer();
                console.log(`Image size: ${buffer.length} bytes`);
                
                // Save the image
                const fs = await import('fs');
                const fileName = `magic_studio_final_${Date.now()}.png`;
                fs.writeFileSync(fileName, buffer);
                console.log(`💾 Image saved as: ${fileName}`);
                
                console.log('\n🎉 EXACT WORKING ENDPOINT FOUND!');
                console.log('================================');
                console.log(`URL: ${testUrl}`);
                console.log(`Method: GET`);
                console.log(`Parameter: prompt=${testPrompt}`);
                console.log(`Response: Image (${buffer.length} bytes)`);
                console.log(`Saved file: ${fileName}`);
                
                return {
                    url: testUrl,
                    method: 'GET',
                    parameter: `prompt=${testPrompt}`,
                    size: buffer.length,
                    file: fileName
                };
            } else {
                console.log(`⚠️  OK response but not image: ${contentType}`);
                const text = await response.text();
                console.log(`Response content: ${text.substring(0, 300)}...`);
            }
        } else {
            console.log(`❌ Failed with status: ${response.status}`);
            const errorText = await response.text();
            console.log(`Error details: ${errorText}`);
        }
    } catch (error) {
        console.log(`❌ Request failed: ${error.message}`);
    }
    
    // Also test other potential endpoints with the same format
    console.log('\nTesting other endpoints with same parameter format...\n');
    
    const endpoints = ['/api/generate', '/generate', '/v1/generate', '/image'];
    
    for (const endpoint of endpoints) {
        const url = `${baseUrl}${endpoint}?prompt=${encodeURIComponent(testPrompt)}`;
        console.log(`Testing: ${url}`);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'image/png,image/jpeg,image/*,*/*;q=0.8'
                }
            });
            
            console.log(`Status: ${response.status}`);
            
            if (response.ok && response.headers.get('content-type')?.includes('image')) {
                console.log('✅ SUCCESS: Image response!');
                const buffer = await response.buffer();
                const fs = await import('fs');
                const fileName = `magic_studio_${endpoint.replace(/\//g, '_')}_${Date.now()}.png`;
                fs.writeFileSync(fileName, buffer);
                console.log(`💾 Image saved as: ${fileName}`);
                
                console.log(`\n🎯 ALTERNATIVE ENDPOINT FOUND: ${url}`);
                return {
                    url: url,
                    method: 'GET',
                    parameter: `prompt=${testPrompt}`,
                    size: buffer.length,
                    file: fileName
                };
            }
        } catch (error) {
            console.log(`Failed: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n❌ No working endpoint found with current approach');
    return null;
}

// Run the final test
testExactMagicStudioEndpoint().then(result => {
    if (result) {
        console.log('\n📋 FINAL RESULTS:');
        console.log('=================');
        console.log(`Endpoint: ${result.url}`);
        console.log(`Method: ${result.method}`);
        console.log(`Parameter: ${result.parameter}`);
        console.log(`Image Size: ${result.size} bytes`);
        console.log(`Saved File: ${result.file}`);
        console.log('\nYou can now use this endpoint in your applications!');
    } else {
        console.log('\n🔧 Testing complete - API not accessible');
    }
}).catch(error => {
    console.error('Test failed:', error);
});