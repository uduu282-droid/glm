import fetch from 'node-fetch';

async function testAiccAPI() {
    console.log('🧪 Testing AICC API: api.ai.cc/v1');
    console.log('===============================\n');
    
    const baseUrl = 'https://api.ai.cc/v1';
    const apiKey = 'sk-WfXy1P61DdVGmYFmvtt7tjozuipMWK2h68AuxULxn81DDNua';
    
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
            headers: headers 
        });
        
        console.log(`  Status: ${response.status} ${response.statusText}`);
        console.log(`  Content-Type: ${response.headers.get('content-type')}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('  ✅ SUCCESS: Models retrieved');
            console.log(`  Available models: ${data.data.map(m => m.id).slice(0, 10).join(', ')}...`);
        } else {
            console.log(`  ❌ FAILED: ${await response.text()}`);
        }
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
    }
    
    console.log();
    
    // Test 2: Chat completions endpoint
    console.log('Test 2: POST /chat/completions');
    const chatData = {
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": "You are a travel agent. Be descriptive and helpful."},
            {"role": "user", "content": "Tell me about San Francisco"}
        ],
        "temperature": 0.7,
        "max_tokens": 256
    };
    
    try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(chatData)
        });
        
        console.log(`  Status: ${response.status} ${response.statusText}`);
        console.log(`  Content-Type: ${response.headers.get('content-type')}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('  ✅ SUCCESS: Chat completion received');
            console.log(`  Response: ${JSON.stringify(data, null, 2).substring(0, 800)}...`);
            
            // Display the actual AI response
            if (data.choices && data.choices[0] && data.choices[0].message) {
                console.log('\n  🤖 AI Response:');
                console.log(`  ${data.choices[0].message.content}`);
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

// Run the test
testAiccAPI().then((result) => {
    console.log('\n' + '='.repeat(50));
    if (result) {
        console.log('🎉 AICC API Test: SUCCESS');
    } else {
        console.log('❌ AICC API Test: FAILED');
    }
}).catch(error => {
    console.error('Test execution failed:', error);
});