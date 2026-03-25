import axios from 'axios';

async function testChatlyWithExactBoundary() {
    const url = 'https://streaming-chatly.vyro.ai/v2/agent/completions';
    const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTkyOWI0NC0yNzljLTQ5NGYtOTY2ZC0zMmNkNzc0NzAxZDUiLCJpbnRlZ3JpdHlDaGVjayI6ZmFsc2UsImJhc2VVcmwiOiJodHRwczovL2NoYXRseWFpLmFwcCIsInByb2R1Y3RWYWxpZEZvciI6IkNIQVRMWSIsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE3NzIzNjY1NDYsImV4cCI6MTc3MjM4ODE0Niwic3ViIjoiMGU5MjliNDQtMjc5Yy00OTRmLTk2NmQtMzJjZDc3NDcwMWQ1IiwianRpIjoiNDkyYTUxOTMtY2NiNC00MzNkLWI2YzMtNjQ1ZDEyN2MxNjcyIn0.wan26qpBoVuzODEteDWJ4xtSIkPqMqtbYH_9YyuDxQ8';
    const orgId = '0e929b44-279c-494f-966d-32cd774701d5';

    console.log('🎯 Testing Chatly API with EXACT boundary from network request');
    console.log('Boundary:', '----WebKitFormBoundaryz2B8nAFWV8IdKcaT');
    console.log('---\n');

    // Test with the exact boundary format from your request
    const exactPayload = `------WebKitFormBoundaryz2B8nAFWV8IdKcaT\r\nContent-Disposition: form-data; name="messages"\r\n\r\n[{"role":"user","content":"Hello, what are you?"}]\r\n------WebKitFormBoundaryz2B8nAFWV8IdKcaT\r\nContent-Disposition: form-data; name="stream"\r\n\r\nfalse\r\n------WebKitFormBoundaryz2B8nAFWV8IdKcaT--\r\n`;

    try {
        console.log('Sending request with exact boundary...');
        
        const response = await axios.post(url, exactPayload, {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'X-Org-Id': orgId,
                'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryz2B8nAFWV8IdKcaT'
            },
            timeout: 30000
        });

        console.log('✅ SUCCESS with exact boundary!');
        console.log('Status:', response.status);
        console.log('Response:', response.data);
        console.log('Rate limit remaining:', response.headers['x-ratelimit-remaining']);
        
        return response.data;

    } catch (error) {
        console.log('❌ Exact boundary test failed');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error:', error.response.data);
            
            // Try with different field names that might work
            return await testAlternativeFields(url, bearerToken, orgId);
        } else {
            console.log('Connection error:', error.message);
        }
        
        return null;
    }
}

async function testAlternativeFields(url, bearerToken, orgId) {
    console.log('\n🔧 Testing alternative field names...');
    
    const fieldTests = [
        {
            name: 'input field',
            payload: `------WebKitFormBoundaryz2B8nAFWV8IdKcaT\r\nContent-Disposition: form-data; name="input"\r\n\r\n{"messages":[{"role":"user","content":"Hello"}]}\r\n------WebKitFormBoundaryz2B8nAFWV8IdKcaT\r\nContent-Disposition: form-data; name="stream"\r\n\r\nfalse\r\n------WebKitFormBoundaryz2B8nAFWV8IdKcaT--\r\n`
        },
        {
            name: 'message field (single)',
            payload: `------WebKitFormBoundaryz2B8nAFWV8IdKcaT\r\nContent-Disposition: form-data; name="message"\r\n\r\nHello\r\n------WebKitFormBoundaryz2B8nAFWV8IdKcaT\r\nContent-Disposition: form-data; name="stream"\r\n\r\nfalse\r\n------WebKitFormBoundaryz2B8nAFWV8IdKcaT--\r\n`
        },
        {
            name: 'prompt field',
            payload: `------WebKitFormBoundaryz2B8nAFWV8IdKcaT\r\nContent-Disposition: form-data; name="prompt"\r\n\r\nHello\r\n------WebKitFormBoundaryz2B8nAFWV8IdKcaT\r\nContent-Disposition: form-data; name="stream"\r\n\r\nfalse\r\n------WebKitFormBoundaryz2B8nAFWV8IdKcaT--\r\n`
        }
    ];

    for (const test of fieldTests) {
        try {
            console.log(`\nTesting ${test.name}...`);
            
            const response = await axios.post(url, test.payload, {
                headers: {
                    'Authorization': `Bearer ${bearerToken}`,
                    'X-Org-Id': orgId,
                    'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryz2B8nAFWV8IdKcaT'
                },
                timeout: 15000
            });

            console.log(`✅ ${test.name} SUCCESS!`);
            console.log('Response:', response.data);
            return response.data;

        } catch (error) {
            if (error.response) {
                console.log(`❌ ${test.name} failed:`, error.response.data?.error || error.response.status);
            } else {
                console.log(`❌ ${test.name} connection error`);
            }
        }
    }
    
    return null;
}

async function testCreditEndpoint() {
    const creditUrl = 'https://xipe.vyro.ai/v1/credit?org_id=0e929b44-279c-494f-966d-32cd774701d5';
    const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTkyOWI0NC0yNzljLTQ5NGYtOTY2ZC0zMmNkNzc0NzAxZDUiLCJpbnRlZ3JpdHlDaGVjayI6ZmFsc2UsImJhc2VVcmwiOiJodHRwczovL2NoYXRseWFpLmFwcCIsInByb2R1Y3RWYWxpZEZvciI6IkNIQVRMWSIsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE3NzIzNjY1NDYsImV4cCI6MTc3MjM4ODE0Niwic3ViIjoiMGU5MjliNDQtMjc5Yy00OTRmLTk2NmQtMzJjZDc3NDcwMWQ1IiwianRpIjoiNDkyYTUxOTMtY2NiNC00MzNkLWI2YzMtNjQ1ZDEyN2MxNjcyIn0.wan26qpBoVuzODEteDWJ4xtSIkPqMqtbYH_9YyuDxQ8';

    console.log('\n💳 Testing Credit Endpoint...');
    console.log('URL:', creditUrl);
    
    try {
        const response = await axios.get(creditUrl, {
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            },
            timeout: 10000
        });

        console.log('✅ Credit endpoint SUCCESS');
        console.log('Status:', response.status);
        console.log('Response:', response.data);
        
        return response.data;

    } catch (error) {
        console.log('❌ Credit endpoint failed');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
        return null;
    }
}

// Run all tests
async function runCompleteTest() {
    console.log('🧪 Complete Chatly API Test Suite\n');
    
    // Test credit endpoint first
    const creditData = await testCreditEndpoint();
    
    // Test main API with exact boundary
    const apiResult = await testChatlyWithExactBoundary();
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    
    if (creditData) {
        console.log('✅ Credit endpoint: Working');
        console.log('   Credits available:', creditData);
    } else {
        console.log('❌ Credit endpoint: Failed');
    }
    
    if (apiResult) {
        console.log('✅ Main API: Working');
        console.log('   Response received:', JSON.stringify(apiResult, null, 2));
    } else {
        console.log('❌ Main API: Format not identified yet');
        console.log('   The API responds but requires exact multipart format');
    }
    
    console.log('\n💡 Next steps:');
    console.log('- Use browser dev tools to capture exact working request');
    console.log('- Check if there are additional required headers');
    console.log('- Verify the exact multipart segment structure');
}

runCompleteTest();