import fetch from 'node-fetch';

async function testFlipAPIAKIB() {
    console.log('🧪 Testing Flip APIAKIB: flip-apiakib.vercel.app');
    console.log('==================================================\n');
    
    const baseUrl = 'https://flip-apiakib.vercel.app';
    const testText = 'hello';
    
    // Test the GPT-5 endpoint with GET request
    const endpoint = {
        name: 'Flip APIAKIB - GPT-5',
        url: `${baseUrl}/ai/gpt-5`,
        method: 'GET',
        params: { text: testText }
    };
    
    console.log(`Testing: ${endpoint.name}`);
    console.log(`URL: ${endpoint.url}`);
    console.log(`Method: ${endpoint.method}`);
    console.log(`Parameters:`, endpoint.params);
    
    try {
        let fullUrl = endpoint.url;
        if (Object.keys(endpoint.params).length > 0) {
            const queryParams = new URLSearchParams(endpoint.params);
            fullUrl += '?' + queryParams.toString();
        }
        
        console.log(`Full URL: ${fullUrl}`);
        
        const response = await fetch(fullUrl, {
            method: endpoint.method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json, */*'
            }
        });
        
        console.log(`\nStatus: ${response.status} ${response.statusText}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        
        const text = await response.text();
        console.log(`Response: ${text.substring(0, 500)}...`);
        
        if (response.ok) {
            console.log('✅ SUCCESS: API response received');
            try {
                const jsonData = JSON.parse(text);
                console.log('Parsed JSON response:', JSON.stringify(jsonData, null, 2));
                return {
                    success: true,
                    data: jsonData
                };
            } catch (e) {
                console.log('Response is not JSON but status is OK');
                return { success: true, response: text.substring(0, 200) };
            }
        } else {
            console.log(`❌ FAILED: ${response.status}`);
            return { success: false, error: text.substring(0, 200) };
        }
        
    } catch (error) {
        console.log(`❌ REQUEST FAILED: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Run the test
testFlipAPIAKIB().then(result => {
    console.log('\n' + '='.repeat(50));
    if (result.success) {
        console.log('🎉 Flip APIAKIB Test: SUCCESS');
        if (result.data) {
            console.log('Response Data:', JSON.stringify(result.data, null, 2));
        }
    } else {
        console.log('❌ Flip APIAKIB Test: FAILED');
        console.log(`Error: ${result.error}`);
    }
}).catch(error => {
    console.error('Test execution failed:', error);
});