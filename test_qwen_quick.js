import fetch from 'node-fetch';

async function quickTest() {
  console.log('🧪 Quick Test - Qwen Worker Proxy\n');
    
  const url= 'https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1/chat/completions';
    
  const payload = {
    model: 'qwen3-coder-plus',
   messages: [
      {
        role: 'user',
      content: 'Write a short Python function that adds two numbers. Keep it brief.'
      }
    ],
    max_tokens: 100
  };
    
  try {
  console.log('Sending request to qwen3-coder-plus...\n');
    
  const response = await fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test'
      },
      body: JSON.stringify(payload)
    });
    
  console.log(`Status: ${response.status} ${response.statusText}\n`);
    
   if (response.ok) {
    const data = await response.json();
     
   console.log('✅ SUCCESS!\n');
   console.log('Full Response:');
   console.log(JSON.stringify(data, null, 2));
    
   console.log('\n' + '=' .repeat(60));
   console.log('AI Response:\n');
   console.log(data.choices[0].message.content);
   console.log('\n' + '=' .repeat(60));
   console.log('\n✅ Model is working perfectly!\n');
   } else {
    const errorText = await response.text();
   console.log('❌ Failed:\n');
   console.log(errorText);
   }
  } catch(error) {
  console.log(`❌ Error: ${error.message}`);
  }
}

quickTest();
