const https = require('https');

const data = JSON.stringify({
  model: "qwen3-coder-plus",
  messages: [{
    role: "user",
    content: "Write a Python function to reverse a string. Keep it concise."
  }]
});

const options = {
  hostname: 'qwen-worker-proxy.ronitshrimankar1.workers.dev',
  port: 443,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🚀 Testing Qwen response speed and quality...\n');
console.log('Prompt: "Write a Python function to reverse a string"\n');

const startTime = Date.now();

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => responseData += chunk);
  
  res.on('end', () => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️  Response time: ${duration}ms\n`);
    console.log('Status:', res.statusCode);
    
    try {
      const response = JSON.parse(responseData);
      console.log('\n📝 Response:\n');
      console.log(response.choices[0].message.content);
      
      console.log('\n\n📊 Usage:');
      console.log(`  Prompt tokens: ${response.usage.prompt_tokens}`);
      console.log(`  Completion tokens: ${response.usage.completion_tokens}`);
      console.log(`  Total tokens: ${response.usage.total_tokens}`);
      
      console.log('\n✅ Test complete!');
    } catch (e) {
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Error:', error.message);
});

req.write(data);
req.end();
