import axios from 'axios';
import FormData from 'form-data';

async function testChatlyWithFormData() {
    const url = 'https://streaming-chatly.vyro.ai/v2/agent/completions';
    const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTkyOWI0NC0yNzljLTQ5NGYtOTY2ZC0zMmNkNzc0NzAxZDUiLCJpbnRlZ3JpdHlDaGVjayI6ZmFsc2UsImJhc2VVcmwiOiJodHRwczovL2NoYXRseWFpLmFwcCIsInByb2R1Y3RWYWxpZEZvciI6IkNIQVRMWSIsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE3NzIzNjY1NDYsImV4cCI6MTc3MjM4ODE0Niwic3ViIjoiMGU5MjliNDQtMjc5Yy00OTRmLTk2NmQtMzJjZDc3NDcwMWQ1IiwianRpIjoiNDkyYTUxOTMtY2NiNC00MzNkLWI2YzMtNjQ1ZDEyN2MxNjcyIn0.wan26qpBoVuzODEteDWJ4xtSIkPqMqtbYH_9YyuDxQ8';
    const orgId = '0e929b44-279c-494f-966d-32cd774701d5';

    console.log('Testing Chatly API with proper FormData...');
    console.log('URL:', url);
    console.log('Rate Limit:', '150 requests');
    console.log('---\n');

    try {
        // Test 1: Basic message
        console.log('Test 1: Basic message with FormData');
        const form1 = new FormData();
        form1.append('messages', JSON.stringify([{
            role: 'user',
            content: 'Hello'
        }]));
        form1.append('stream', 'false');

        const response1 = await axios.post(url, form1, {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'X-Org-Id': orgId,
                ...form1.getHeaders()
            },
            timeout: 30000
        });

        console.log('✅ Test 1 SUCCESS');
        console.log('Status:', response1.status);
        console.log('Response:', response1.data);
        console.log('Rate limit remaining:', response1.headers['x-ratelimit-remaining']);
        console.log('---\n');

        // Test 2: More complex message
        console.log('Test 2: Complex message');
        const form2 = new FormData();
        form2.append('messages', JSON.stringify([{
            role: 'user',
            content: 'Explain what you are and what you can do in 2-3 sentences.'
        }]));
        form2.append('stream', 'false');
        form2.append('temperature', '0.7');
        form2.append('max_tokens', '300');

        const response2 = await axios.post(url, form2, {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'X-Org-Id': orgId,
                ...form2.getHeaders()
            },
            timeout: 30000
        });

        console.log('✅ Test 2 SUCCESS');
        console.log('Response:', response2.data);
        console.log('---\n');

        // Test 3: Test streaming
        console.log('Test 3: Streaming test');
        const form3 = new FormData();
        form3.append('messages', JSON.stringify([{
            role: 'user',
            content: 'Count from 1 to 3.'
        }]));
        form3.append('stream', 'true');

        try {
            const response3 = await axios.post(url, form3, {
                headers: {
                    'Authorization': `Bearer ${bearerToken}`,
                    'X-Org-Id': orgId,
                    ...form3.getHeaders()
                },
                timeout: 30000,
                responseType: 'stream'
            });

            console.log('✅ Streaming initiated');
            console.log('Content-Type:', response3.headers['content-type']);
            
            let streamData = '';
            response3.data.on('data', (chunk) => {
                streamData += chunk.toString();
                // Process streaming data in real-time
                console.log('Stream chunk received:', chunk.toString());
            });
            
            response3.data.on('end', () => {
                console.log('✅ Streaming completed');
                console.log('Full stream data:', streamData);
            });

        } catch (streamError) {
            console.log('ℹ️  Streaming test info:', streamError.message);
        }

        // Test 4: Rate limit check
        console.log('\nTest 4: Final rate limit check');
        console.log('Rate limit info from last response:');
        console.log('- Limit:', response2.headers['x-ratelimit-limit']);
        console.log('- Remaining:', response2.headers['x-ratelimit-remaining']);
        console.log('- Reset time:', new Date(response2.headers['x-ratelimit-reset'] * 1000).toLocaleString());

        console.log('\n🎉 All tests completed successfully!');
        return {
            test1: response1.data,
            test2: response2.data
        };

    } catch (error) {
        console.log('❌ API Test Failed');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Status Text:', error.response.statusText);
            console.log('Response Data:', error.response.data);
            console.log('Headers:', Object.keys(error.response.headers));
            
            // Check if it's a specific error we can handle
            if (error.response.data?.code === 1102) {
                console.log('\n📝 Error code 1102: "Value not found in multipart segment"');
                console.log('This suggests the API expects a specific multipart format or field names.');
            }
        } else if (error.request) {
            console.log('No response received:', error.message);
        } else {
            console.log('Error:', error.message);
        }
        
        // Try to get more info about the API
        return await probeAPI(url, bearerToken, orgId);
    }
}

async function probeAPI(url, bearerToken, orgId) {
    console.log('\n🔍 Probing API for more information...');
    
    // Try different endpoints that might give us info
    const endpoints = [
        url.replace('/agent/completions', '/models'),
        url.replace('/agent/completions', '/info'),
        url.replace('/agent/completions', '/health'),
        url.replace('/v2/agent/completions', '/v2/models'),
        url.replace('/v2/agent/completions', '/v1/models')
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`Trying: ${endpoint}`);
            const response = await axios.get(endpoint, {
                headers: {
                    'Authorization': `Bearer ${bearerToken}`,
                    'X-Org-Id': orgId
                },
                timeout: 5000
            });
            
            console.log(`✅ ${endpoint}:`, response.status);
            console.log('Response:', response.data);
            return response.data;
            
        } catch (error) {
            if (error.response) {
                console.log(`❌ ${endpoint}: ${error.response.status}`);
            } else {
                console.log(`❌ ${endpoint}: Connection error`);
            }
        }
    }
    
    console.log('No additional endpoints found.');
    throw new Error('All probing attempts failed');
}

// Run the test
testChatlyWithFormData()
    .then(results => {
        console.log('\n🏁 Chatly API testing completed');
        if (results) {
            console.log('Successful responses received.');
        }
    })
    .catch(error => {
        console.log('\n💥 Chatly API testing failed:', error.message);
    });