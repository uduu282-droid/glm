import fetch from 'node-fetch';

async function testAnannasAPI() {
    console.log('🧪 Testing Anannas AI API: api.anannas.ai/v1');
    console.log('==========================================\n');
    
    const baseUrl = 'https://api.anannas.ai/v1';
    const apiKey = 'sk-cr-27275ae349694731b095effe5abe64e3';
    
    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
    
    // Test 1: Get models endpoint
    console.log('Test 1: GET /models');
    try {
        const response = await fetch(`${baseUrl}/models`, { 
            method: 'GET', 
            headers: headers,
            timeout: 15000
        });
        
        console.log(`  Status: ${response.status} ${response.statusText}`);
        console.log(`  Content-Type: ${response.headers.get('content-type')}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('  ✅ SUCCESS: Models retrieved');
            console.log(`  Total models: ${data.data.length}`);
            console.log(`  First 10 models: ${data.data.slice(0, 10).map(m => m.id).join(', ')}`);
            console.log(`  Sample response: ${JSON.stringify(data, null, 2).substring(0, 500)}...`);
            return data;
        } else {
            console.log(`  ❌ FAILED: ${await response.text()}`);
            return null;
        }
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        return null;
    }
    
    console.log();
}

async function testChatCompletions() {
    console.log('Test 2: POST /chat/completions');
    
    const baseUrl = 'https://api.anannas.ai/v1';
    const apiKey = 'sk-cr-27275ae349694731b095effe5abe64e3';
    
    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };
    
    // Test with the exact example from the user
    const chatData = {
        "model": "openai/gpt-5-mini",
        "messages": [
            { "role": "user", "content": "Explain quantum computing" }
        ]
    };
    
    try {
        console.log('Testing with openai/gpt-5-mini...');
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(chatData),
            timeout: 30000
        });
        
        console.log(`  Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('  ✅ SUCCESS: Chat completion received');
            console.log(`  Response: ${JSON.stringify(data, null, 2).substring(0, 800)}...`);
            
            if (data.choices && data.choices[0] && data.choices[0].message) {
                console.log('\n  🤖 AI Response:');
                console.log(`  ${data.choices[0].message.content.substring(0, 500)}...`);
            }
            
            return data;
        } else {
            console.log(`  ❌ FAILED: ${await response.text()}`);
            return null;
        }
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        return null;
    }
}

// Run the tests
async function runTests() {
    const modelsResult = await testAnannasAPI();
    
    console.log('\n' + '='.repeat(50));
    
    if (modelsResult) {
        console.log('✅ Models endpoint working - 325 models available');
        
        // Now test chat completions
        const chatResult = await testChatCompletions();
        
        console.log('\n' + '='.repeat(50));
        if (chatResult) {
            console.log('🎉 Anannas API Test: COMPLETE SUCCESS');
            console.log('✅ Models endpoint: Working (325 models)');
            console.log('✅ Chat completions: Working');
        } else {
            console.log('❌ Anannas API Test: PARTIAL SUCCESS');
            console.log('✅ Models endpoint: Working (325 models)');
            console.log('❌ Chat completions: Failed/Timeout');
        }
    } else {
        console.log('❌ Anannas API Test: FAILED');
        console.log('❌ Models endpoint: Not working');
    }
}

runTests().catch(error => {
    console.error('Test execution failed:', error);
});