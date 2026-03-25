import fetch from 'node-fetch';

async function testMakeHubAPI() {
    console.log('🧪 Testing MakeHub API: api.makehub.ai/v1');
    console.log('========================================\n');
    
    const baseUrl = 'https://api.makehub.ai/v1';
    
    // First, test the models endpoint
    console.log('Testing models endpoint...');
    try {
        const modelsResponse = await fetch(`${baseUrl}/models`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Authorization': 'Bearer mh_85afbeff51e5450fa84319bc05dab185776afdf8d8464e9082baad75d69b7'  // Using the API key provided
            }
        });
        
        console.log(`Models Endpoint Status: ${modelsResponse.status} ${modelsResponse.statusText}`);
        console.log(`Models Endpoint Content-Type: ${modelsResponse.headers.get('content-type')}`);
        
        const modelsText = await modelsResponse.text();
        console.log(`Models Response (first 500 chars): ${modelsText.substring(0, 500)}...`);
        
    } catch (error) {
        console.log(`❌ Models Endpoint Request Failed: ${error.message}`);
    }
    
    // Test with a simple chat completion-like request
    console.log('\nTesting chat completion endpoint...');
    try {
        const chatResponse = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer mh_85afbeff51e5450fa84319bc05dab185776afdf8d8464e9082baad75d69b7'  // Using the API key provided
            },
            body: JSON.stringify({
                model: "openai/gpt-4",
                messages: [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": "What are the benefits of using a routing platform for AI models?"}
                ]
            })
        });
        
        console.log(`Chat Completion Status: ${chatResponse.status} ${chatResponse.statusText}`);
        console.log(`Chat Completion Content-Type: ${chatResponse.headers.get('content-type')}`);
        
        const chatText = await chatResponse.text();
        console.log(`Chat Response (first 500 chars): ${chatText.substring(0, 500)}...`);
        
    } catch (error) {
        console.log(`❌ Chat Completion Request Failed: ${error.message}`);
    }
}

// Run the test
testMakeHubAPI().then(() => {
    console.log('\n' + '='.repeat(50));
    console.log('🎉 MakeHub API Testing Complete!');
}).catch(error => {
    console.error('Test execution failed:', error);
});