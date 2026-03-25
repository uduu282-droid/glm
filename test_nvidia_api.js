import fetch from 'node-fetch';

// Test the NVIDIA API integration
async function testNVIDIAAPI() {
    console.log('Testing NVIDIA API integration...\n');
    
    const url = 'https://integrate.api.nvidia.com/v1/chat/completions';
    const apiKey = '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';
    
    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };

    const payload = {
        "model": "moonshotai/kimi-k2-5",
        "messages": [
            {"role": "user", "content": "Hello"}
        ]
    };

    try {
        console.log('URL:', url);
        console.log('Headers:', headers);
        console.log('Payload:', JSON.stringify(payload, null, 2));
        
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        console.log('\nStatus Code:', response.status);
        console.log('Status Text:', response.statusText);
        
        const responseBody = await response.text();
        console.log('Response Body:');
        console.log(responseBody);

        try {
            const jsonData = JSON.parse(responseBody);
            console.log('\nParsed JSON Response:');
            console.log(JSON.stringify(jsonData, null, 2));
        } catch (e) {
            console.log('Response is not valid JSON');
        }

        if (response.ok) {
            console.log('\n✅ NVIDIA API test successful!');
        } else {
            console.log(`\n❌ API returned error status: ${response.status}`);
        }

    } catch (error) {
        console.error('\n❌ Request failed:', error.message);
    }
}

// Run the test
await testNVIDIAAPI();