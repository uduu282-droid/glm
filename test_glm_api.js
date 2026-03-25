import fetch from 'node-fetch';

// Test the new GLM Reverse API
async function testGLMAPI() {
    console.log('Testing GLM Reverse API...\n');
    
    const baseUrl = 'https://api-glm.featherlabs.online/v1';
    const apiKey = 'vtx-RUmIksxLD8Qf8njF3JsMXLqICnZEohaM';
    
    // Test available models
    const models = [
        'glm-4.7',    // Latest flagship model
        'glm-4.6',    // Powerful general-purpose model
        'glm-4.6v',   // Vision-capable model
        'glm-4.5',    // High-performance (360B)
        'glm-4.5-air' // Fast & lightweight
    ];
    
    // Test models endpoint first
    await testModelsEndpoint(baseUrl, apiKey);
    
    // Test each model with a simple prompt
    for (const model of models) {
        console.log(`\n--- Testing model: ${model} ---`);
        await testChatCompletion(baseUrl, apiKey, model);
    }
    
    // Test with vision model specifically if available
    console.log('\n--- Testing vision model capability ---');
    await testVisionModel(baseUrl, apiKey);
}

async function testModelsEndpoint(baseUrl, apiKey) {
    console.log('Testing /models endpoint...');
    
    try {
        const response = await fetch(`${baseUrl}/models`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`Models endpoint status: ${response.status} ${response.statusText}`);
        
        const data = await response.json();
        console.log('Available models:', JSON.stringify(data, null, 2));
        
        if (response.ok) {
            console.log('✅ Models endpoint working correctly!\n');
        } else {
            console.log(`❌ Models endpoint error:`, data);
        }
    } catch (error) {
        console.error('❌ Models endpoint request failed:', error.message);
    }
}

async function testChatCompletion(baseUrl, apiKey, model) {
    const url = `${baseUrl}/chat/completions`;
    
    const requestBody = {
        model: model,
        messages: [
            {
                role: "user",
                content: `Hello! This is a test message for the ${model} model. Can you confirm you're working?`
            }
        ],
        temperature: 0.7,
        max_tokens: 150
    };
    
    try {
        console.log(`Sending request to ${model}...`);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${model} responded successfully!`);
            
            if (data.choices && data.choices.length > 0) {
                console.log(`Response: ${data.choices[0].message.content.substring(0, 100)}...`);
            }
        } else {
            const errorData = await response.json();
            console.log(`❌ ${model} error:`, errorData);
        }
    } catch (error) {
        console.error(`❌ ${model} request failed:`, error.message);
    }
}

async function testVisionModel(baseUrl, apiKey) {
    // Test with a vision model (glm-4.6v)
    const url = `${baseUrl}/chat/completions`;
    
    const requestBody = {
        model: 'glm-4.6v',
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "Describe this image in detail. What do you see?"
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png" // Sample transparent PNG
                        }
                    }
                ]
            }
        ],
        max_tokens: 300
    };
    
    try {
        console.log('Testing vision model with sample image...');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log(`Vision model status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Vision model responded successfully!');
            
            if (data.choices && data.choices.length > 0) {
                console.log(`Vision response: ${data.choices[0].message.content.substring(0, 150)}...`);
            }
        } else {
            const errorData = await response.json();
            console.log('❌ Vision model error:', errorData);
        }
    } catch (error) {
        console.log('Note: Vision model test skipped (may not be available or requires specific image format)');
        console.log('Error:', error.message);
    }
}

// Run the tests
await testGLMAPI();