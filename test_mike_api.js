import axios from 'axios';

async function testMikeAPI() {
    const url = 'https://api.mikemathews7000.workers.dev/v1/chat/completions';
    const apiKey = 'sk-1ba23ac5b41208a61cd99517103759a879c97b12a79d9ff4';
    
    const payload = {
        model: "Claude-sonnet-4.6",
        messages: [
            {
                role: "user",
                content: "Explain the request in one concise paragraph."
            }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        stream: false
    };

    try {
        console.log('Testing Mike API endpoint...');
        console.log('URL:', url);
        console.log('Model:', payload.model);
        console.log('Sending request...\n');

        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            timeout: 30000
        });

        console.log('✅ API Response Received');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('\nResponse Data:');
        console.log(JSON.stringify(response.data, null, 2));

        // Check if we got a valid response
        if (response.data.choices && response.data.choices.length > 0) {
            const message = response.data.choices[0].message;
            console.log('\n📝 Generated Response:');
            console.log('Role:', message.role);
            console.log('Content:', message.content);
        }

        return response.data;

    } catch (error) {
        console.log('❌ API Test Failed');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Status Text:', error.response.statusText);
            console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.log('No response received:', error.message);
        } else {
            console.log('Error:', error.message);
        }
        
        throw error;
    }
}

// Run the test
testMikeAPI()
    .then(() => console.log('\n✅ Test completed successfully'))
    .catch(() => console.log('\n❌ Test failed'));