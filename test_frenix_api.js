import axios from 'axios';
import fs from 'fs';

const API_KEY = 'sk-frenix-770ede37d7';
const API_URL = 'https://api.frenix.sh/v1/chat/completions';

async function testFrenixAPI() {
    console.log('🧪 Testing Frenix API...\n');
    
    const payload = {
        model: 'gpt-4o-mini', // Common model, can be changed
        messages: [
            {
                role: 'user',
                content: 'Hello! This is a test message. Please respond briefly.'
            }
        ],
        max_tokens: 100,
        temperature: 0.7
    };

    try {
        console.log('📤 Sending request...');
        console.log('Model:', payload.model);
        console.log('Message:', payload.messages[0].content);
        console.log('');

        const response = await axios.post(API_URL, payload, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
        });

        console.log('✅ Request successful!\n');
        console.log('📊 Response Details:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Status:', response.status);
        console.log('Model:', response.data.model || 'N/A');
        console.log('Usage:', JSON.stringify(response.data.usage, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (response.data.choices && response.data.choices.length > 0) {
            console.log('💬 Assistant Response:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(response.data.choices[0].message?.content);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            
            console.log('Finish Reason:', response.data.choices[0].finish_reason);
        }

        // Save full response to file
        fs.writeFileSync('frenix_api_test_result.json', JSON.stringify(response.data, null, 2));
        console.log('\n💾 Full response saved to: frenix_api_test_result.json');

    } catch (error) {
        console.error('❌ Request failed!\n');
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received:', error.message);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testFrenixAPI();
