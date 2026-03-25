import fetch from 'node-fetch';

async function testQwenWorkerProxy() {
  console.log('🔍 Testing Qwen Worker Proxy\n');
  console.log('=' .repeat(60));
    
  const baseUrl= 'https://qwen-worker-proxy.ronitshrimankar1.workers.dev';
    
    // Test 1: Check if base endpoint is accessible
  console.log('Test 1: Base Endpoint Check\n');
    
    try {
    const response = await fetch(baseUrl, {
        method: 'GET',
        headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
        
       if (response.ok) {
        const text = await response.text();
       console.log('✅ Endpoint is accessible\n');
       console.log('Response preview:');
       console.log(text.substring(0, 500));
       } else {
       console.log('❌ Endpoint returned error\n');
       }
    } catch(error) {
    console.log(`❌ Error: ${error.message}\n`);
    }
    
  console.log('\n' + '=' .repeat(60));
    
    // Test 2: Try common API endpoints
  console.log('\nTest 2: Scanning for API Endpoints\n');
    
  const endpointsToTest = [
        '/v1/models',
        '/models',
        '/api/models',
        '/v1/chat/completions',
        '/chat/completions',
        '/api/v1/models',
        '/health',
        '/api/health',
        '/'
    ];
    
    for (const endpoint of endpointsToTest) {
        try {
         const url = `${baseUrl}${endpoint}`;
        const response = await fetch(url, {
             method: 'GET',
              headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });
            
         console.log(`${endpoint.padEnd(25)} → ${response.status} ${response.statusText}`);
            
           if (response.ok && endpoint.includes('model')) {
            const data = await response.json();
           console.log(`  ✅ Found models endpoint!`);
           console.log(`  Data: ${JSON.stringify(data, null, 2).substring(0, 500)}`);
           }
        } catch(error) {
        console.log(`${endpoint.padEnd(25)} → ❌ ${error.message}`);
        }
    }
    
  console.log('\n' + '=' .repeat(60));
    
    // Test 3: Try chat completions with different model names
  console.log('\nTest 3: Testing Chat Completions\n');
    
  const commonQwenModels = [
        'qwen-turbo',
        'qwen-plus',
        'qwen-max',
        'qwen-max-longcontext',
        'qwen-72b-chat',
        'qwen-14b-chat',
        'qwen-7b-chat',
        'qwen2.5-72b-instruct',
        'qwen2.5-32b-instruct',
        'qwen2.5-14b-instruct',
        'qwen2.5-7b-instruct',
        'qwen2-72b-instruct',
        'qwq-32b-preview',
        'qwen-vl-max',
        'qwen-audio-chat'
    ];
    
   const testPayload = {
        model: '',
       messages: [{ role: 'user', content: 'Respond with exactly: WORKING' }],
        max_tokens: 10
    };
    
   let workingModels = [];
    
    for (const model of commonQwenModels.slice(0, 5)) {  // Test first 5 to save time
      console.log(`Testing: ${model}...`);
        
        try {
          testPayload.model = model;
          
        const response = await fetch(`${baseUrl}/v1/chat/completions`, {
             method: 'POST',
              headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-key'  // Some proxies don't need auth
                },
               body: JSON.stringify(testPayload),
               timeout: 10000
            });
            
         console.log(`  Status: ${response.status} ${response.statusText}`);
            
           if (response.ok) {
            const data = await response.json();
           console.log(`  ✅ SUCCESS - Model works!`);
           console.log(`  Response: ${data.choices?.[0]?.message?.content || 'No content'}`);
             workingModels.push(model);
           } else {
            const errorText = await response.text();
           console.log(`  ❌ Failed: ${errorText.substring(0, 100)}`);
           }
        } catch(error) {
        console.log(`  ❌ Error: ${error.message}`);
        }
       console.log();
    }
    
  console.log('\n' + '=' .repeat(60));
    
    // Test 4: Check OpenAI-compatible endpoint
  console.log('\nTest 4: Testing OpenAI-Compatible Format\n');
    
    try {
    const openaiPayload = {
         model: 'gpt-3.5-turbo',  // Try generic name
        messages: [{ role: 'user', content: 'Hi' }]
      };
        
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-test'
            },
         body: JSON.stringify(openaiPayload),
         timeout: 10000
      });
        
    console.log(`Status: ${response.status} ${response.statusText}`);
        
       if (response.ok) {
        const data = await response.json();
       console.log('✅ OpenAI-compatible endpoint works!');
       console.log(`Response: ${JSON.stringify(data, null, 2).substring(0, 300)}`);
       } else {
        const errorText = await response.text();
       console.log(`❌ Failed: ${errorText.substring(0, 200)}`);
       }
    } catch(error) {
    console.log(`❌ Error: ${error.message}`);
    }
    
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 SUMMARY\n');
    
    if (workingModels.length > 0) {
    console.log(`✅ Found ${workingModels.length} working model(s):\n`);
      workingModels.forEach((model, i) => {
       console.log(`  ${i + 1}. ${model}`);
     });
    } else {
    console.log('❌ No working models discovered yet');
    console.log('\n💡 Next steps:');
    console.log('  1. Check if the proxy requires authentication');
    console.log('  2. Look for documentation or README');
    console.log('  3. Try accessing /models or /v1/models endpoint directly');
    console.log('  4. Contact the proxy owner for model list');
    }
    
  console.log('\n' + '=' .repeat(60));
}

testQwenWorkerProxy().catch(console.error);
