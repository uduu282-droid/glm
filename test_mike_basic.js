import axios from 'axios';

async function testBasicAPI() {
    const url = 'https://api.mikemathews7000.workers.dev/v1/chat/completions';
    const apiKey = 'sk-1ba23ac5b41208a61cd99517103759a879c97b12a79d9ff4';
    
    // Try with minimal payload
    const payload = {
        messages: [
            {
                role: "user",
                content: "Hello"
            }
        ]
    };

    try {
        console.log('Testing basic API access...');
        console.log('URL:', url);
        console.log('Sending minimal request...\n');

        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            timeout: 15000
        });

        console.log('✅ Basic API Test SUCCESS');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));

        return response.data;

    } catch (error) {
        console.log('❌ Basic API Test Failed');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Status Text:', error.response.statusText);
            console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
            
            // Check if it's a model-related error
            if (error.response.data.detail && error.response.data.detail.includes('Model')) {
                console.log('\n📝 This appears to be a model access restriction.');
                console.log('The API is accessible but requires a Pro tier subscription for model access.');
            }
        } else if (error.request) {
            console.log('No response received:', error.message);
        } else {
            console.log('Error:', error.message);
        }
        
        throw error;
    }
}

// Also test if we can get any information about the API
async function testAPIInfo() {
    const urlsToTest = [
        'https://api.mikemathews7000.workers.dev/v1/models',
        'https://api.mikemathews7000.workers.dev/models',
        'https://api.mikemathews7000.workers.dev/'
    ];

    console.log('\nTesting API information endpoints...\n');

    for (const testUrl of urlsToTest) {
        try {
            console.log(`Testing: ${testUrl}`);
            
            const response = await axios.get(testUrl, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                timeout: 10000
            });

            console.log(`✅ ${testUrl}: SUCCESS`);
            console.log(`Status: ${response.status}`);
            console.log(`Response:`, JSON.stringify(response.data, null, 2));
            console.log('---\n');
            
        } catch (error) {
            if (error.response) {
                console.log(`❌ ${testUrl}: ${error.response.status} - ${error.response.statusText}`);
                if (error.response.data) {
                    console.log(`Details:`, JSON.stringify(error.response.data, null, 2));
                }
            } else {
                console.log(`❌ ${testUrl}: Connection error`);
            }
            console.log('---\n');
        }
    }
}

// Run both tests
async function runAllTests() {
    try {
        await testBasicAPI();
        await testAPIInfo();
        console.log('\n✅ All tests completed');
    } catch (error) {
        console.log('\n❌ Tests completed with errors');
    }
}

runAllTests();