import fetch from 'node-fetch';

async function testFlipGenAPI() {
    console.log('🧪 Testing Flip Gen API: flip-gen.vercel.app');
    console.log('==================================================\n');
    
    const baseUrl = 'https://flip-gen.vercel.app';
    
    // Available styles
    const styles = [
        'realistic', 'anime', 'fantasy', 'cyberpunk', 'watercolor', 
        'oil-painting', 'pixel-art', 'sketch', 'cartoon', 'abstract', 
        'vintage', 'steampunk'
    ];
    
    // Test with a simple prompt
    const prompt = 'a beautiful landscape';
    const negativePrompt = 'blurry, bad quality';
    
    console.log(`Testing ${styles.length} available styles with prompt: "${prompt}"\n`);
    
    for (const style of styles) {
        console.log(`\nTesting style: ${style}`);
        
        const endpoint = {
            name: `Flip Gen API - ${style}`,
            url: `${baseUrl}/ai/image/${style}`,
            method: 'GET',
            params: { 
                prompt: prompt,
                negative_prompt: negativePrompt
            }
        };
        
        try {
            let fullUrl = endpoint.url;
            const queryParams = new URLSearchParams(endpoint.params);
            fullUrl += '?' + queryParams.toString();
            
            console.log(`Full URL: ${fullUrl}`);
            
            const response = await fetch(fullUrl, {
                method: endpoint.method,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json, image/*, */*'
                }
            });
            
            console.log(`Status: ${response.status} ${response.statusText}`);
            console.log(`Content-Type: ${response.headers.get('content-type')}`);
            
            if (response.ok) {
                // Check if response is JSON or image
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('image')) {
                    console.log('✅ SUCCESS: Image response received');
                    // Note: We won't download the full image to save bandwidth
                    console.log('Image response detected');
                } else {
                    const text = await response.text();
                    console.log('✅ SUCCESS: API response received');
                    try {
                        const jsonData = JSON.parse(text);
                        console.log('JSON Response:', JSON.stringify(jsonData, null, 2));
                    } catch (e) {
                        console.log('Non-JSON response:', text.substring(0, 200));
                    }
                }
            } else {
                const errorText = await response.text();
                console.log(`❌ FAILED: ${response.status}`);
                console.log(`Error: ${errorText.substring(0, 200)}`);
            }
            
        } catch (error) {
            console.log(`❌ REQUEST FAILED: ${error.message}`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Test a few specific examples as provided
async function testSpecificExamples() {
    console.log('\n\n🧪 Testing Specific Examples Provided');
    console.log('=====================================\n');
    
    const examples = [
        {
            name: 'Simple Prompt (Anime Style)',
            url: 'https://flip-gen.vercel.app/ai/image/anime?prompt=naruto%20standing%20on%20mountain'
        },
        {
            name: 'Prompt with Negative Prompt (Anime Style)',
            url: 'https://flip-gen.vercel.app/ai/image/anime?prompt=naruto%20standing%20on%20mountain&negative_prompt=blurry,bad%20quality,low%20details'
        }
    ];
    
    for (const example of examples) {
        console.log(`Testing: ${example.name}`);
        console.log(`URL: ${example.url}`);
        
        try {
            const response = await fetch(example.url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json, image/*, */*'
                }
            });
            
            console.log(`Status: ${response.status} ${response.statusText}`);
            console.log(`Content-Type: ${response.headers.get('content-type')}`);
            
            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('image')) {
                    console.log('✅ SUCCESS: Image response received');
                } else {
                    const text = await response.text();
                    console.log('✅ SUCCESS: API response received');
                    try {
                        const jsonData = JSON.parse(text);
                        console.log('JSON Response:', JSON.stringify(jsonData, null, 2));
                    } catch (e) {
                        console.log('Non-JSON response:', text.substring(0, 200));
                    }
                }
            } else {
                const errorText = await response.text();
                console.log(`❌ FAILED: ${response.status}`);
                console.log(`Error: ${errorText.substring(0, 200)}`);
            }
            
        } catch (error) {
            console.log(`❌ REQUEST FAILED: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Run all tests
async function runAllTests() {
    await testFlipGenAPI();
    await testSpecificExamples();
    
    console.log('\n🎉 Flip Gen API Testing Complete!');
}

runAllTests().catch(error => {
    console.error('Test execution failed:', error);
});