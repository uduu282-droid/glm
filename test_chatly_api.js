import axios from 'axios';
import FormData from 'form-data';

async function testChatlyAPI() {
    const url = 'https://streaming-chatly.vyro.ai/v2/agent/completions';
    const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTkyOWI0NC0yNzljLTQ5NGYtOTY2ZC0zMmNkNzc0NzAxZDUiLCJpbnRlZ3JpdHlDaGVjayI6ZmFsc2UsImJhc2VVcmwiOiJodHRwczovL2NoYXRseWFpLmFwcCIsInByb2R1Y3RWYWxpZEZvciI6IkNIQVRMWSIsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE3NzIzNjY1NDYsImV4cCI6MTc3MjM4ODE0Niwic3ViIjoiMGU5MjliNDQtMjc5Yy00OTRmLTk2NmQtMzJjZDc3NDcwMWQ1IiwianRpIjoiNDkyYTUxOTMtY2NiNC00MzNkLWI2YzMtNjQ1ZDEyN2MxNjcyIn0.wan26qpBoVuzODEteDWJ4xtSIkPqMqtbYH_9YyuDxQ8';
    const orgId = '0e929b44-279c-494f-966d-32cd774701d5';

    console.log('Testing Chatly API endpoint...');
    console.log('URL:', url);
    console.log('Method: POST');
    console.log('---\n');

    try {
        // Test 1: Simple text message
        console.log('Test 1: Simple text message');
        const formData1 = new FormData();
        formData1.append('messages', JSON.stringify([{
            role: 'user',
            content: 'Hello, explain what you are in one sentence.'
        }]));
        formData1.append('stream', 'false');

        const response1 = await axios.post(url, formData1, {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'X-Org-Id': orgId,
                ...formData1.getHeaders()
            },
            timeout: 30000
        });

        console.log('✅ Test 1 SUCCESS');
        console.log('Status:', response1.status);
        console.log('Response:', response1.data);
        console.log('---\n');

        // Test 2: With streaming disabled explicitly
        console.log('Test 2: Explicit streaming disabled');
        const formData2 = new FormData();
        formData2.append('messages', JSON.stringify([{
            role: 'user',
            content: 'What are you capable of?'
        }]));
        formData2.append('stream', 'false');
        formData2.append('temperature', '0.7');
        formData2.append('max_tokens', '500');

        const response2 = await axios.post(url, formData2, {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'X-Org-Id': orgId,
                ...formData2.getHeaders()
            },
            timeout: 30000
        });

        console.log('✅ Test 2 SUCCESS');
        console.log('Status:', response2.status);
        console.log('Response:', response2.data);
        console.log('---\n');

        // Test 3: Check rate limits
        console.log('Test 3: Rate limit check');
        const rateLimitHeaders = {
            'x-ratelimit-limit': response1.headers['x-ratelimit-limit'],
            'x-ratelimit-remaining': response1.headers['x-ratelimit-remaining'],
            'x-ratelimit-reset': response1.headers['x-ratelimit-reset']
        };
        
        console.log('Rate Limit Info:', rateLimitHeaders);
        console.log('---\n');

        // Test 4: Try streaming (if supported)
        console.log('Test 4: Testing streaming capability');
        const formData4 = new FormData();
        formData4.append('messages', JSON.stringify([{
            role: 'user',
            content: 'Count from 1 to 5, one number per line.'
        }]));
        formData4.append('stream', 'true');

        try {
            const response4 = await axios.post(url, formData4, {
                headers: {
                    'Authorization': `Bearer ${bearerToken}`,
                    'X-Org-Id': orgId,
                    ...formData4.getHeaders()
                },
                timeout: 30000,
                responseType: 'stream'
            });

            console.log('✅ Streaming test initiated');
            console.log('Status:', response4.status);
            console.log('Content-Type:', response4.headers['content-type']);
            
            // Handle streaming response
            let streamData = '';
            response4.data.on('data', (chunk) => {
                streamData += chunk.toString();
            });
            
            response4.data.on('end', () => {
                console.log('Stream completed. Data received:');
                console.log(streamData);
            });
            
        } catch (streamError) {
            console.log('ℹ️  Streaming test result:', streamError.message);
        }

        console.log('\n🎉 All tests completed successfully!');
        return true;

    } catch (error) {
        console.log('❌ API Test Failed');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Status Text:', error.response.statusText);
            console.log('Headers:', error.response.headers);
            console.log('Response Data:', error.response.data);
        } else if (error.request) {
            console.log('No response received:', error.message);
        } else {
            console.log('Error:', error.message);
        }
        
        return false;
    }
}

// Run the test
testChatlyAPI()
    .then(success => {
        if (success) {
            console.log('\n✅ Chatly API test completed successfully');
        } else {
            console.log('\n❌ Chatly API test failed');
        }
    })
    .catch(error => {
        console.log('\n💥 Test failed with error:', error.message);
    });