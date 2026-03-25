import axios from 'axios';

async function testMikeModels() {
    const url = 'https://api.mikemathews7000.workers.dev/v1/models';
    const apiKey = 'sk-1ba23ac5b41208a61cd99517103759a879c97b12a79d9ff4';

    try {
        console.log('Fetching available models...');
        
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            timeout: 10000
        });

        console.log('✅ Models API Response Received');
        console.log('Status:', response.status);
        console.log('\nAvailable Models:');
        
        if (Array.isArray(response.data.data)) {
            response.data.data.forEach((model, index) => {
                console.log(`${index + 1}. ${model.id}`);
                if (model.description) {
                    console.log(`   Description: ${model.description}`);
                }
                console.log('');
            });
        } else {
            console.log(JSON.stringify(response.data, null, 2));
        }

        return response.data;

    } catch (error) {
        console.log('❌ Models API Test Failed');
        
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
testMikeModels()
    .then(() => console.log('\n✅ Models test completed'))
    .catch(() => console.log('\n❌ Models test failed'));