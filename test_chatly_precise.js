import axios from 'axios';

async function testChatlyAPIPrecise() {
    const url = 'https://streaming-chatly.vyro.ai/v2/agent/completions';
    const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTkyOWI0NC0yNzljLTQ5NGYtOTY2ZC0zMmNkNzc0NzAxZDUiLCJpbnRlZ3JpdHlDaGVjayI6ZmFsc2UsImJhc2VVcmwiOiJodHRwczovL2NoYXRseWFpLmFwcCIsInByb2R1Y3RWYWxpZEZvciI6IkNIQVRMWSIsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE3NzIzNjY1NDYsImV4cCI6MTc3MjM4ODE0Niwic3ViIjoiMGU5MjliNDQtMjc5Yy00OTRmLTk2NmQtMzJjZDc3NDcwMWQ1IiwianRpIjoiNDkyYTUxOTMtY2NiNC00MzNkLWI2YzMtNjQ1ZDEyN2MxNjcyIn0.wan26qpBoVuzODEteDWJ4xtSIkPqMqtbYH_9YyuDxQ8';
    const orgId = '0e929b44-279c-494f-966d-32cd774701d5';

    console.log('Testing Chatly API with precise multipart format...');
    console.log('URL:', url);
    console.log('---\n');

    // Test with raw multipart data format
    const testPayload = `------WebKitFormBoundary5m5nYe9FXAJm6WqL\r\nContent-Disposition: form-data; name="messages"\r\n\r\n[{"role":"user","content":"Hello, what are you?"}]\r\n------WebKitFormBoundary5m5nYe9FXAJm6WqL\r\nContent-Disposition: form-data; name="stream"\r\n\r\nfalse\r\n------WebKitFormBoundary5m5nYe9FXAJm6WqL--\r\n`;

    try {
        console.log('Sending raw multipart request...');
        
        const response = await axios.post(url, testPayload, {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'X-Org-Id': orgId,
                'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary5m5nYe9FXAJm6WqL'
            },
            timeout: 30000
        });

        console.log('✅ SUCCESS');
        console.log('Status:', response.status);
        console.log('Response:', response.data);
        console.log('Rate Limit Remaining:', response.headers['x-ratelimit-remaining']);
        
        return response.data;

    } catch (error) {
        console.log('❌ Request failed');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response:', error.response.data);
            console.log('Headers:', error.response.headers);
        } else {
            console.log('Error:', error.message);
        }
        
        // Try alternative approach
        console.log('\nTrying alternative approach with different field names...');
        return await testAlternativeFormat(url, bearerToken, orgId);
    }
}

async function testAlternativeFormat(url, bearerToken, orgId) {
    try {
        // Try with different possible field names
        const payloads = [
            // Format 1: messages as JSON string
            {
                data: `------boundary123\r\nContent-Disposition: form-data; name="messages"\r\n\r\n[{"role":"user","content":"Hello"}]\r\n------boundary123\r\nContent-Disposition: form-data; name="stream"\r\n\r\nfalse\r\n------boundary123--\r\n`,
                contentType: 'multipart/form-data; boundary=----boundary123'
            },
            // Format 2: message field
            {
                data: `------boundary456\r\nContent-Disposition: form-data; name="message"\r\n\r\nHello\r\n------boundary456\r\nContent-Disposition: form-data; name="stream"\r\n\r\nfalse\r\n------boundary456--\r\n`,
                contentType: 'multipart/form-data; boundary=----boundary456'
            },
            // Format 3: prompt field
            {
                data: `------boundary789\r\nContent-Disposition: form-data; name="prompt"\r\n\r\nHello\r\n------boundary789\r\nContent-Disposition: form-data; name="stream"\r\n\r\nfalse\r\n------boundary789--\r\n`,
                contentType: 'multipart/form-data; boundary=----boundary789'
            }
        ];

        for (let i = 0; i < payloads.length; i++) {
            try {
                console.log(`\nTrying format ${i + 1}...`);
                
                const response = await axios.post(url, payloads[i].data, {
                    headers: {
                        'Authorization': `Bearer ${bearerToken}`,
                        'X-Org-Id': orgId,
                        'Content-Type': payloads[i].contentType
                    },
                    timeout: 15000
                });

                console.log(`✅ Format ${i + 1} SUCCESS`);
                console.log('Response:', response.data);
                return response.data;

            } catch (formatError) {
                if (formatError.response) {
                    console.log(`❌ Format ${i + 1} failed:`, formatError.response.data?.error || formatError.response.status);
                } else {
                    console.log(`❌ Format ${i + 1} connection error`);
                }
            }
        }

        console.log('\nAll formats failed. Checking if we can get model info...');
        return await testModelInfo(url, bearerToken, orgId);

    } catch (error) {
        console.log('Alternative testing failed:', error.message);
        throw error;
    }
}

async function testModelInfo(url, bearerToken, orgId) {
    // Try to get available models or info
    const infoUrl = url.replace('/agent/completions', '/models');
    
    try {
        console.log('\nTrying to get model information...');
        
        const response = await axios.get(infoUrl, {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'X-Org-Id': orgId
            },
            timeout: 10000
        });

        console.log('✅ Model info retrieved:');
        console.log(response.data);
        return response.data;

    } catch (error) {
        if (error.response) {
            console.log('Model info request failed:', error.response.status, error.response.data);
        } else {
            console.log('Model info connection error:', error.message);
        }
        
        // Try base URL
        return await testBaseEndpoint(url, bearerToken, orgId);
    }
}

async function testBaseEndpoint(url, bearerToken, orgId) {
    const baseUrl = url.split('/').slice(0, -2).join('/');
    
    try {
        console.log('\nTrying base endpoint:', baseUrl);
        
        const response = await axios.get(baseUrl, {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'X-Org-Id': orgId
            },
            timeout: 10000
        });

        console.log('✅ Base endpoint response:');
        console.log(response.data);
        return response.data;

    } catch (error) {
        console.log('Base endpoint test failed:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response:', error.response.data);
        }
        throw error;
    }
}

// Run the test
testChatlyAPIPrecise()
    .then(result => {
        console.log('\n🎉 Chatly API test completed');
        if (result) {
            console.log('Final result:', JSON.stringify(result, null, 2));
        }
    })
    .catch(error => {
        console.log('\n💥 Chatly API test failed completely');
    });