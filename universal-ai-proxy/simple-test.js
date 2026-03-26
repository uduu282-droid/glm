// Simple test for DeepSeek Browser Proxy
console.log('🧪 Testing DeepSeek Browser Proxy...\n');

const testData = {
  model: 'deepseek-chat',
  messages: [{
    role: 'user', 
    content: 'Hello! Please respond with just 3 words.'
  }]
};

console.log('Sending:', JSON.stringify(testData, null, 2));
console.log('\n');

fetch('http://localhost:8787/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData)
})
.then(res => res.json())
.then(data => {
  console.log('✅ Response received!\n');
  console.log('Full response:', JSON.stringify(data, null, 2));
  console.log('\n');
  
  if (data.choices && data.choices.length > 0) {
    const content = data.choices[0].message.content;
    console.log('🤖 Assistant says:', content);
  } else if (data.error) {
    console.log('⚠️  Error:', data.error.message);
  }
})
.catch(err => {
  console.error('❌ Error:', err.message);
});
