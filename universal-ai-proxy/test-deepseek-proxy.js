// Test the DeepSeek proxy
const testMessage = {
  model: "deepseek-chat",
  messages: [{
    role: "user",
    content: "Hello! This is a test of the DeepSeek proxy. Please respond with a short greeting."
  }]
};

console.log('🧪 Testing DeepSeek Proxy...\n');
console.log('Sending message:', JSON.stringify(testMessage, null, 2));
console.log('\n');

fetch('http://localhost:8787/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testMessage)
})
.then(res => res.json())
.then(data => {
  console.log('✅ Response received!\n');
  console.log('Full response:', JSON.stringify(data, null, 2));
  console.log('\n');
  
  if (data.choices && data.choices.length > 0) {
    const message = data.choices[0].message;
    console.log('🤖 Assistant says:', message.content || message);
  }
})
.catch(err => {
  console.error('❌ Error:', err.message);
});
