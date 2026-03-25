import fetch from 'node-fetch';

async function testFeatherLabsAPI() {
    console.log('Testing featherlabs API...\n');
    
    const url = 'https://api.featherlabs.online/v1/chat/completions';
    const headers = {
        'Authorization': 'Bearer sk-mWdmd2RtRTNm2ndAtceylQ',
        'Content-Type': 'application/json'
    };
    
    const body = {
        "model": "GLM-5",
        "messages": [
            {
                "role": "user",
                "content": "test"
            }
        ]
    };

    try {
        console.log('Sending POST request to:', url);
        console.log('Request body:', JSON.stringify(body, null, 2));
        
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        console.log('\nResponse Status:', response.status, response.statusText);
        console.log('Response Headers:');
        for (const [key, value] of response.headers.entries()) {
            console.log(`  ${key}: ${value}`);
        }

        const responseBody = await response.text();
        console.log('\nResponse Body:');
        console.log(responseBody);

        try {
            const jsonData = JSON.parse(responseBody);
            console.log('\nParsed JSON Response:');
            console.log(JSON.stringify(jsonData, null, 2));
        } catch (e) {
            console.log('Response is not valid JSON');
        }

        if (response.ok) {
            console.log('\n✅ API test successful!');
        } else {
            console.log(`\n❌ API returned error status: ${response.status}`);
        }

    } catch (error) {
        console.error('\n❌ Request failed:', error.message);
        
        if (error.cause) {
            console.error('Cause:', error.cause);
        }
    }
}

// Run the test
testFeatherLabsAPI();