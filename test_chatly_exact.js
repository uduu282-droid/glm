import axios from 'axios';

async function testChatlyExactFormat() {
    const url = 'https://streaming-chatly.vyro.ai/v2/agent/completions';
    const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTkyOWI0NC0yNzljLTQ5NGYtOTY2ZC0zMmNkNzc0NzAxZDUiLCJpbnRlZ3JpdHlDaGVjayI6ZmFsc2UsImJhc2VVcmwiOiJodHRwczovL2NoYXRseWFpLmFwcCIsInByb2R1Y3RWYWxpZEZvciI6IkNIQVRMWSIsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE3NzIzNjY1NDYsImV4cCI6MTc3MjM4ODE0Niwic3ViIjoiMGU5MjliNDQtMjc5Yy00OTRmLTk2NmQtMzJjZDc3NDcwMWQ1IiwianRpIjoiNDkyYTUxOTMtY2NiNC00MzNkLWI2YzMtNjQ1ZDEyN2MxNjcyIn0.wan26qpBoVuzODEteDWJ4xtSIkPqMqtbYH_9YyuDxQ8';
    const orgId = '0e929b44-279c-494f-966d-32cd774701d5';

    console.log('🔍 Testing Chatly API with exact format analysis...');
    console.log('URL:', url);
    console.log('Rate Limit:', '150 requests (currently 148 remaining)');
    console.log('---\n');

    // Based on the error, let's try different approaches
    const testCases = [
        // Test 1: Raw JSON instead of multipart
        {
            name: 'Test 1: Raw JSON payload',
            data: {
                messages: [{ role: 'user', content: 'Hello' }],
                stream: false
            },
            headers: {
                'Content-Type': 'application/json'
            }
        },
        
        // Test 2: Different field name
        {
            name: 'Test 2: "message" field instead of "messages"',
            data: {
                message: 'Hello',
                stream: false
            },
            headers: {
                'Content-Type': 'application/json'
            }
        },
        
        // Test 3: Add more fields that might be required
        {
            name: 'Test 3: Extended JSON with common fields',
            data: {
                messages: [{ role: 'user', content: 'Hello' }],
                stream: false,
                temperature: 0.7,
                max_tokens: 200,
                model: 'default'
            },
            headers: {
                'Content-Type': 'application/json'
            }
        },
        
        // Test 4: Minimal payload
        {
            name: 'Test 4: Minimal possible payload',
            data: {
                prompt: 'Hello'
            },
            headers: {
                'Content-Type': 'application/json'
            }
        }
    ];

    for (const testCase of testCases) {
        try {
            console.log(`\n${testCase.name}`);
            console.log('Payload:', JSON.stringify(testCase.data, null, 2));
            
            const response = await axios.post(url, testCase.data, {
                headers: {
                    'Authorization': `Bearer ${bearerToken}`,
                    'X-Org-Id': orgId,
                    ...testCase.headers
                },
                timeout: 15000
            });

            console.log(`✅ SUCCESS`);
            console.log('Status:', response.status);
            console.log('Response:', response.data);
            return response.data;

        } catch (error) {
            if (error.response) {
                console.log(`❌ FAILED: ${error.response.status}`);
                console.log('Error:', error.response.data);
                
                // Special handling for the specific error
                if (error.response.data?.code === 1102) {
                    console.log('📝 This is the "Value not found in multipart segment" error');
                    console.log('The API might require a specific multipart format or field structure');
                }
            } else {
                console.log(`❌ Connection error: ${error.message}`);
            }
        }
    }

    // If all JSON tests fail, let's try to understand what the API expects
    console.log('\n📋 All JSON format tests failed. The API likely requires:');
    console.log('- Specific multipart/form-data format');
    console.log('- Exact field names in the multipart segments');
    console.log('- Possibly specific boundary format');
    console.log('- Additional required headers or fields');

    // Try one more test with a very specific multipart format
    console.log('\n🔧 Trying one final specific multipart format...');
    
    const specificPayload = `------WebKitFormBoundarySpecific\r\nContent-Disposition: form-data; name="input"\r\n\r\n{"messages":[{"role":"user","content":"Hello"}]}\r\n------WebKitFormBoundarySpecific\r\nContent-Disposition: form-data; name="stream"\r\n\r\nfalse\r\n------WebKitFormBoundarySpecific--\r\n`;

    try {
        const response = await axios.post(url, specificPayload, {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'X-Org-Id': orgId,
                'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundarySpecific'
            },
            timeout: 15000
        });

        console.log('✅ Final test SUCCESS');
        console.log('Response:', response.data);
        return response.data;

    } catch (error) {
        if (error.response) {
            console.log('❌ Final test failed:', error.response.status);
            console.log('Error:', error.response.data);
        } else {
            console.log('❌ Final test connection error:', error.message);
        }
        
        console.log('\n🔍 CONCLUSION:');
        console.log('The Chatly API endpoint is accessible and responding');
        console.log('However, it requires a very specific request format that we haven\'t identified yet');
        console.log('Error code 1102 suggests missing required values in multipart segments');
        console.log('Recommendation: Check browser dev tools for exact request format');
        
        return null;
    }
}

// Run the test
testChatlyExactFormat()
    .then(result => {
        if (result) {
            console.log('\n🎉 Found working format!');
        } else {
            console.log('\n❓ Format not identified - further investigation needed');
        }
    })
    .catch(error => {
        console.log('\n💥 Test failed:', error.message);
    });