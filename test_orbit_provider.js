import fetch from 'node-fetch';

// Test the Orbit Provider API
async function testOrbitProviderAPI() {
    console.log('Testing Orbit Provider API...\n');
    
    const url = 'https://api.orbit-provider.com/v1/chat/completions';
    const headers = {
        'Authorization': 'Bearer sk-orbit-6***3cba',  // Try Authorization header as alternative
        'Content-Type': 'application/json'
    };
    
    const payload = {
        "model": "claude-sonnet-4-5-20250929",
        "messages": [
            {"role": "user", "content": "Hello!"}
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
        
        const responseBody = await response.text();
        console.log('Response Body:');
        
        try {
            const jsonData = JSON.parse(responseBody);
            console.log(JSON.stringify(jsonData, null, 2));
        } catch (e) {
            console.log(responseBody);
        }

        if (response.ok) {
            console.log('\n✅ Orbit Provider API test successful!');
        } else {
            console.log(`\n❌ API returned error status: ${response.status}`);
        }

    } catch (error) {
        console.error('\n❌ Request failed:', error.message);
    }
}

// Run the test
await testOrbitProviderAPI();