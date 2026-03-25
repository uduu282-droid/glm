import fetch from 'node-fetch';

// Test NVIDIA API with streaming response (JavaScript version)
async function testNVIDIAStreaming() {
    console.log('Testing NVIDIA API with streaming response...\n');
    
    const url = 'https://integrate.api.nvidia.com/v1/chat/completions';
    const apiKey = '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';
    
    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };

    const payload = {
        "model": "z-ai/glm4.7",
        "messages": [{"content": "hey", "role": "user"}],
        "temperature": 1,
        "top_p": 1,
        "max_tokens": 100,
        "stream": true
    };

    try {
        console.log('URL:', url);
        console.log('Model: z-ai/glm4.7');
        console.log('Message: "hey"');
        console.log('Streaming response:');
        console.log('-'.repeat(50));
        
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error('Error details:', errorText);
            return;
        }

        // Process streaming response (Node.js compatible approach)
        const chunks = [];
        
        response.body.on('data', (chunk) => {
            chunks.push(chunk);
        });
        
        response.body.on('end', () => {
            const fullResponse = Buffer.concat(chunks).toString();
            console.log('Full response received:');
            console.log(fullResponse);
            console.log('\n\n✅ NVIDIA API test completed successfully!');
        });
        
        // For streaming, we'll wait for the response to complete
        await new Promise((resolve) => {
            response.body.on('end', resolve);
        });
        
    } catch (error) {
        console.error('\n❌ Request failed:', error.message);
    }
}

// Run the test
await testNVIDIAStreaming();