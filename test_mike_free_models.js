import axios from 'axios';

async function testFreeModels() {
    const url = 'https://api.mikemathews7000.workers.dev/v1/chat/completions';
    const apiKey = 'sk-1ba23ac5b41208a61cd99517103759a879c97b12a79d9ff4';
    
    // Common free/open models to test
    const freeModels = [
        'llama-2-7b',
        'llama-2-13b',
        'llama-2-70b',
        'llama-3-8b',
        'llama-3-70b',
        'mistral-7b',
        'mixtral-8x7b',
        'gemma-2b',
        'gemma-7b',
        'zephyr-7b',
        'openchat-3.5',
        'neural-chat-7b',
        'starling-7b',
        'solar-10.7b'
    ];

    const testPayload = {
        messages: [
            {
                role: "user",
                content: "Respond with exactly: WORKING"
            }
        ],
        temperature: 0.1,
        max_tokens: 50
    };

    console.log('Testing free/open models...\n');
    console.log('API Key:', apiKey);
    console.log('Endpoint:', url);
    console.log('---\n');

    const workingModels = [];

    for (const model of freeModels) {
        try {
            console.log(`Testing: ${model}`);
            
            const payload = { ...testPayload, model: model };
            
            const response = await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                timeout: 15000
            });

            const responseText = response.data.choices[0].message.content.trim();
            console.log(`✅ ${model}: SUCCESS`);
            console.log(`Response: "${responseText}"`);
            
            if (responseText.includes('WORKING')) {
                workingModels.push({
                    model: model,
                    response: responseText,
                    fullResponse: response.data
                });
            }
            
            console.log('---\n');

        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data.detail || error.response.statusText;
                console.log(`❌ ${model}: ${status} - ${message}`);
                
                // If we get a 403 but not model-specific, the API key might be invalid
                if (status === 403 && !message.includes('Model')) {
                    console.log('⚠️  API key may be invalid or expired');
                    break;
                }
            } else {
                console.log(`❌ ${model}: Connection error`);
            }
            console.log('---\n');
        }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('TEST SUMMARY');
    console.log('='.repeat(50));
    
    if (workingModels.length > 0) {
        console.log(`✅ Found ${workingModels.length} working model(s):`);
        workingModels.forEach((item, index) => {
            console.log(`${index + 1}. ${item.model}`);
        });
        
        console.log('\nFirst working response:');
        console.log(workingModels[0].fullResponse);
    } else {
        console.log('❌ No free models are accessible with this API key');
        console.log('\nPossible reasons:');
        console.log('- API key requires Pro subscription');
        console.log('- API key is invalid or expired');
        console.log('- All models require paid access');
    }

    return workingModels;
}

// Run the test
testFreeModels()
    .then(results => {
        console.log('\n🏁 Test completed');
    })
    .catch(error => {
        console.log('\n💥 Test failed with error:', error.message);
    });