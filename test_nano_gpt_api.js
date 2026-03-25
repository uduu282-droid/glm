import fetch from 'node-fetch';

async function testNanoGptAPI() {
    console.log('🧪 Testing Nano-GPT API');
    console.log('======================\n');
    
    const baseUrl = 'https://nano-gpt.com/api/v1';
    const apiKey = 'sk-nano-1d74edc0-adbb-43ec-8942-f32033d73de7';
    
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
            console.log(`  Available models: ${data.data.map(m => m.id).join(', ')}`);
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
        "model": "gpt-5.2",
        "messages": [
            { "role": "user", "content": "Hello, how are you?" }
        ]
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
            return data;
        } else {
            const errorText = await response.text();
            console.log(`  ❌ FAILED: ${errorText}`);
            
            // Parse the payment error to show details
            try {
                const errorData = JSON.parse(errorText);
                if (errorData.error && errorData.error.code === 'insufficient_quota') {
                    console.log('\n  💰 Payment Required:');
                    console.log(`     Amount: $${errorData.accepts[0].maxAmountRequiredUSD} USD`);
                    console.log(`     Payment ID: ${errorData.accepts[0].paymentId}`);
                    console.log(`     Expires: ${new Date(errorData.accepts[0].expiresAt * 1000).toLocaleString()}`);
                    console.log('     Payment Methods:');
                    errorData.accepts.forEach((method, index) => {
                        console.log(`       ${index + 1}. ${method.scheme.toUpperCase()} (${method.network}): ${method.maxAmountRequiredFormatted}`);
                    });
                }
            } catch (e) {
                // Not JSON or different format
            }
            return null;
        }
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        return null;
    }
}

// Run the test
testNanoGptAPI().then((result) => {
    console.log('\n' + '='.repeat(50));
    if (result) {
        console.log('🎉 Nano-GPT API Test: SUCCESS');
    } else {
        console.log('❌ Nano-GPT API Test: FAILED');
    }
}).catch(error => {
    console.error('Test execution failed:', error);
});