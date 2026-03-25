const axios = require('axios');

const API_KEY = 'sk-f53498343eab4e4bae4d956b481ae0b5';

async function testDeepSeekAPI() {
    console.log('🧪 Testing DeepSeek API Key...\n');
    
    try {
        console.log('📤 Sending test request...');
        console.log('Model: deepseek-chat');
        console.log('Prompt: "Say hello in exactly 3 words"\n');
        
        const response = await axios.post(
            'https://api.deepseek.com/v1/chat/completions',
            {
                model: 'deepseek-chat',
                messages: [{
                    role: 'user',
                    content: 'Say hello in exactly 3 words'
                }],
                max_tokens: 20
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ SUCCESS! API key works!\n');
        console.log('💬 Response:', response.data.choices[0].message.content);
        console.log('\n📊 Usage:', response.data.usage);
        console.log('\n✨ Your API key is working perfectly!');
        
    } catch (error) {
        console.log('❌ Test failed!\n');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error:', error.response.data);
            
            if (error.response.data.error) {
                console.log('\n⚠️  Issue:', error.response.data.error.message || error.response.data.error);
            }
        } else if (error.request) {
            console.log('No response received. Check your internet connection.');
        } else {
            console.log('Error:', error.message);
        }
    }
}

testDeepSeekAPI();
