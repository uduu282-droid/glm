import axios from 'axios';

async function testDifferentModels() {
    const url = 'https://api.mikemathews7000.workers.dev/v1/chat/completions';
    const apiKey = 'sk-1ba23ac5b41208a61cd99517103759a879c97b12a79d9ff4';
    
    // Test different models
    const modelsToTest = [
        'gpt-3.5-turbo',
        'gpt-4',
        'claude-3-haiku',
        'claude-3-sonnet',
        'claude-2.1',
        'claude-2.0',
        'claude-instant-1.2'
    ];

    const testPayload = {
        messages: [
            {
                role: "user",
                content: "Say hello in one word."
            }
        ],
        temperature: 0.7,
        max_tokens: 100,
        stream: false
    };

    console.log('Testing different models...\n');

    for (const model of modelsToTest) {
        try {
            console.log(`Testing model: ${model}`);
            
            const payload = { ...testPayload, model: model };
            
            const response = await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                timeout: 15000
            });

            console.log(`✅ ${model}: SUCCESS`);
            console.log(`Response: ${response.data.choices[0].message.content}`);
            console.log('---\n');
            
            // If we find a working model, return it
            return { model, response: response.data };

        } catch (error) {
            if (error.response) {
                console.log(`❌ ${model}: ${error.response.status} - ${error.response.data.detail || error.response.statusText}`);
            } else {
                console.log(`❌ ${model}: Connection error`);
            }
            console.log('---\n');
        }
    }

    console.log('No working models found with current API key.');
    return null;
}

// Run the test
testDifferentModels()
    .then(result => {
        if (result) {
            console.log(`\n✅ Found working model: ${result.model}`);
        } else {
            console.log('\n❌ No models worked with current API key');
        }
    })
    .catch(error => console.log('\n❌ Test failed:', error.message));