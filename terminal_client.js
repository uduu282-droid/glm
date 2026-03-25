import fetch from 'node-fetch';
import fs from 'fs';
import readline from 'readline';

console.log('🤖 Free AI Chat Terminal Client\n');
console.log('=' .repeat(60));

// Check if we have API configuration
const configFiles = ['api_config.json', 'terminal_client_config.js'];
let config = null;
let configFileUsed = '';

for (const file of configFiles) {
  if (fs.existsSync(file)) {
    try {
      if (file.endsWith('.json')) {
       config = JSON.parse(fs.readFileSync(file, 'utf8'));
      } else {
        // Try to import JS config
       const module = await import(`./${file}`);
       config = module.default || module;
      }
     configFileUsed = file;
    console.log(`✅ Loaded configuration from ${file}`);
      break;
    } catch(error) {
    console.log(`⚠️  Could not load ${file}: ${error.message}`);
    }
  }
}

if (!config) {
  console.log('\n❌ No API configuration found!');
  console.log('\n📝 Please follow these steps:\n');
  console.log('1. Open https://free-aichat.vercel.app/ in browser');
  console.log('2. Press F12→ Network tab');
  console.log('3. Send a chat message');
  console.log('4. Right-click POST request → Copy → Copy as cURL');
  console.log('5. Paste into captured_request.txt');
  console.log('6. Run: node analyze_and_test.js');
  console.log('\nThis will create api_config.json automatically.\n');
  process.exit(1);
}

console.log(`\n🎯 Target: ${config.url}`);
console.log(`Model: ${config.headers['next-action'] ? 'Gemini/Groq (via Next.js Action)' : 'Unknown'}`);
console.log('\n💡 Type your messages below. Type "quit" to exit.\n');
console.log('-'.repeat(60));

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Message history (optional - some APIs need conversation context)
let messageHistory = [];
let currentModel= 'gemini'; // Default model

// Function to send message to API
async function sendMessage(message) {
  try {
  console.log('\n⏳ Sending...\n');
    
    // Prepare headers- remove any that might cause issues
  const headers = { ...config.headers };
    
    // Update body with new message
   let body = config.body || '';
    
    // Try different body formats based on what we see in config
    if (body === '' || !body) {
      // Empty body - try common formats
     body = JSON.stringify({
      message: message,
       model: currentModel
     });
    headers['content-type'] = 'application/json';
    } else if (body.includes('"0":')) {
      // Looks like React Server Components format
      // Try to replace the message part
     body = body.replace(/"\d+"\s*:\s*"([^"]*)"/, `"0":"${message.replace(/"/g, '\\"')}"`);
    } else {
      // JSON format
      try {
       const parsed = JSON.parse(body);
        parsed.message = message;
        parsed.content = message;
        body = JSON.stringify(parsed);
      } catch(e) {
        // Not JSON, use as-is
        body = message;
      }
    }
    
  const startTime = Date.now();
    
  const response = await fetch(config.url, {
    method: config.method || 'POST',
    headers: headers,
      body: body
    });
    
  const endTime = Date.now();
  const duration = endTime - startTime;
    
  console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
  console.log(`⏱️  Response Time: ${duration}ms`);
  console.log(`Content-Type: ${response.headers.get('content-type')}`);
    
  const responseBody = await response.text();
    
    if (response.ok) {
    console.log('\n✅ Response received!\n');
      
      // Try to extract meaningful content from response
     let aiResponse = responseBody;
      
      // Handle React Server Component format
     if (responseBody.includes('0:') && responseBody.includes('"f":"')) {
      console.log('ℹ️  React Server Component format detected');
       // Try to find text content
      const textMatch = responseBody.match(/["'](.*?)["']:\s*["'](.*?)["']/g);
       if (textMatch) {
        console.log('Extracted parts:', textMatch.slice(0, 3).join(', '));
       }
     }
      
      // Handle JSON format
      try {
       const json = JSON.parse(responseBody);
        if (json.choices && json.choices[0]) {
          aiResponse = json.choices[0].message?.content || json.choices[0].text;
        } else if (json.response) {
          aiResponse = json.response;
        } else if (json.message) {
          aiResponse = json.message;
        } else if (json.content) {
          aiResponse = json.content;
        }
      } catch(e) {
        // Not JSON or already handled
      }
      
    console.log('🤖 AI Response:');
    console.log('-'.repeat(60));
    console.log(aiResponse);
    console.log('-'.repeat(60));
      
      // Add to history
    messageHistory.push({
       role: 'user',
      content: message,
       timestamp: new Date().toISOString()
     });
    messageHistory.push({
       role: 'assistant',
      content: aiResponse,
       timestamp: new Date().toISOString()
     });
      
      return aiResponse;
    } else {
    console.log('\n❌ Request failed\n');
    console.log('Response:', responseBody.substring(0, 500));
      return null;
    }
    
  } catch(error) {
  console.log(`\n❌ Error: ${error.message}`);
  console.log('\n💡 Tip: The Next-Action token may have expired. Try capturing a fresh request.');
    return null;
  }
}

// Main chat loop
function startChat() {
  console.log('\n🎮 Ready to chat! (type "help" for commands)\n');
  
  rl.on('line', async (input) => {
   const trimmed = input.trim();
    
    if (trimmed.toLowerCase() === 'quit' || trimmed.toLowerCase() === 'exit') {
    console.log('\n👋 Goodbye!\n');
      rl.close();
     process.exit(0);
    }
    
    if (trimmed.toLowerCase() === 'help') {
    console.log('\nCommands:');
    console.log('  help     - Show this help');
    console.log('  clear    - Clear chat history');
    console.log('  model    - Switch model (gemini/groq)');
    console.log('  history  - Show message history');
    console.log('  save     - Save chat to file');
    console.log('  quit     - Exit program\n');
      rl.prompt();
      return;
    }
    
    if (trimmed.toLowerCase() === 'clear') {
    messageHistory = [];
    console.log('\n✅ Chat history cleared\n');
      rl.prompt();
      return;
    }
    
    if (trimmed.toLowerCase() === 'model') {
    console.log(`\nCurrent model: ${currentModel}`);
    console.log('Available models: gemini, groq');
    console.log('(Note: Model switching may require recapturing requests)\n');
      rl.prompt();
      return;
    }
    
    if (trimmed.toLowerCase() === 'history') {
    console.log('\n📜 Chat History:');
    messageHistory.forEach((msg, i) => {
      const emoji = msg.role === 'user' ? '👤' : '🤖';
      console.log(`${i +1}. ${emoji} ${msg.content.substring(0, 100)}...`);
     });
    console.log();
      rl.prompt();
      return;
    }
    
    if (trimmed.toLowerCase() === 'save') {
     const filename = `chat_${Date.now()}.txt`;
     const content = messageHistory.map((msg, i) => {
       const label = msg.role === 'user' ? 'You' : 'AI';
        return `[${i + 1}] ${label}: ${msg.content}\n`;
      }).join('');
      fs.writeFileSync(filename, content);
    console.log(`\n✅ Chat saved to ${filename}\n`);
      rl.prompt();
      return;
    }
    
    if (!trimmed) {
      rl.prompt();
      return;
    }
    
    // Send message
   await sendMessage(trimmed);
  console.log();
   rl.prompt();
  });
  
  rl.on('close', () => {
  console.log('\n👋 Session ended\n');
  process.exit(0);
  });
}

// Start the chat
startChat();
