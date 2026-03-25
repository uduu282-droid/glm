import fetch from 'node-fetch';

console.log('🧪 Testing Qwen Model via Claude Code Configuration\n');
console.log('=' .repeat(60));

const url = 'https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1/chat/completions';

const testMessages = [
  'Write a one-line Python hello world',
  'What is 2 + 2?',
  'Explain AI in one sentence'
];

async function runTests() {
  let successCount= 0;
  
  for (const message of testMessages) {
   console.log(`\n📝 Test: ${message}\n`);
    
    try {
     const payload = {
       model: 'qwen3-coder-plus',
       messages: [{ role: 'user', content: message }],
        max_tokens: 50
      };
      
     const response = await fetch(url, {
       method: 'POST',
       headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer not-needed'
        },
        body: JSON.stringify(payload)
      });
      
     console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
       const data = await response.json();
       const aiResponse = data.choices[0].message.content;
        
       console.log('✅ SUCCESS!\n');
       console.log(`🤖 AI Response:\n${aiResponse}\n`);
        successCount++;
      } else {
       const errorText = await response.text();
       console.log(`❌ Failed: ${errorText.substring(0, 200)}\n`);
      }
    } catch(error) {
     console.log(`❌ Error: ${error.message}\n`);
    }
    
   console.log('-'.repeat(60));
  }
  
  console.log('\n📊 SUMMARY\n');
  console.log(`Tests passed: ${successCount}/${testMessages.length}`);
  
  if (successCount === testMessages.length) {
   console.log('\n✅ ALL TESTS PASSED!\n');
   console.log('🎉 Qwen model (qwen3-coder-plus) is working perfectly!\n');
   console.log('💡 You can now use it in Claude Code CLI with:\n');
   console.log('   $env:ANTHROPIC_BASE_URL="https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1"');
   console.log('   claude --model qwen3-coder-plus\n');
  } else {
   console.log('\n⚠️  Some tests failed. Check configuration.\n');
  }
}

runTests().catch(console.error);
