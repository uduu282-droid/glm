#!/usr/bin/env node

/**
 * DeepSeek Terminal Chat
 * Simple command-line chat interface to test the proxy
 */

import { createInterface } from 'readline';

const API_URL = 'http://localhost:8787/v1/chat/completions';

// Chat configuration
const config = {
  model: 'deepseek-chat',
  temperature: 0.7,
  max_tokens: 1000,
  systemPrompt: 'You are a helpful AI assistant.'
};

// Message history
const messages = [
  { role: 'system', content: config.systemPrompt }
];

// Create readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

// ASCII Art Banner
console.log(`
╔══════════════════════════════════════════════════════════╗
║           🤖 DeepSeek Terminal Chat                      ║
║           Powered by OpenAI-Compatible Proxy             ║
╚══════════════════════════════════════════════════════════╝

Model: ${config.model}
Temperature: ${config.temperature}
Max Tokens: ${config.max_tokens}

Commands:
  /model <name>  - Change model (deepseek-chat, deepseek-coder, deepseek-reasoner)
  /clear         - Clear conversation history
  /help          - Show this help
  /quit          - Exit chat

Type your message and press Enter to chat!
${'═'.repeat(62)}
`);

// Main chat function
async function chat() {
  try {
    // Get user input
    const userInput = await new Promise((resolve) => {
      rl.question('\n👤 You: ', resolve);
    });

    const input = userInput.trim();

    // Handle commands
    if (input.startsWith('/')) {
      await handleCommand(input);
      chat();
      return;
    }

    // Exit on empty input after /quit
    if (!input) {
      chat();
      return;
    }

    // Add user message to history
    messages.push({ role: 'user', content: input });

    // Send to API
    console.log('\n⏳ DeepSeek is thinking...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        messages: messages,
        temperature: config.temperature,
        max_tokens: config.max_tokens
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract assistant's response
    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      console.log('\n❌ Error: No response from API');
      console.log('Response:', JSON.stringify(data, null, 2));
      chat();
      return;
    }

    // Display response
    console.log(`\n🤖 Assistant: ${assistantMessage}`);

    // Add to history
    messages.push({ role: 'assistant', content: assistantMessage });

    // Continue chat
    chat();

  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
    console.log('\n💡 Make sure the proxy is running:');
    console.log('   node start-deepseek-openai.js\n');
    
    rl.close();
    process.exit(1);
  }
}

// Handle slash commands
async function handleCommand(command) {
  const parts = command.split(' ');
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (cmd) {
    case '/model':
      if (!args[0]) {
        console.log(`\nCurrent model: ${config.model}`);
        console.log('Available models: deepseek-chat, deepseek-coder, deepseek-reasoner');
        console.log(`Usage: /model <name>`);
      } else {
        config.model = args[0];
        console.log(`\n✅ Model changed to: ${config.model}`);
        
        // Reset system prompt with new model
        messages[0] = { 
          role: 'system', 
          content: `You are a helpful AI assistant using ${config.model}.` 
        };
      }
      break;

    case '/clear':
      messages.length = 0;
      messages.push({ role: 'system', content: config.systemPrompt });
      console.log('\n✅ Conversation history cleared');
      break;

    case '/help':
      console.log(`
╔══════════════════════════════════════════════════════════╗
║                        Help                              ║
╠══════════════════════════════════════════════════════════╣
║ /model <name>  - Change AI model                         ║
║ /clear         - Clear conversation                      ║
║ /temp <value>  - Set temperature (0.0-2.0)               ║
║ /tokens <num>  - Set max tokens                          ║
║ /history       - Show message history                    ║
║ /help          - Show this help                          ║
║ /quit          - Exit chat                               ║
╚══════════════════════════════════════════════════════════╝
`);
      break;

    case '/temp':
      if (args[0]) {
        const temp = parseFloat(args[0]);
        if (temp >= 0 && temp <= 2) {
          config.temperature = temp;
          console.log(`\n✅ Temperature set to: ${temp}`);
        } else {
          console.log('\n❌ Temperature must be between 0.0 and 2.0');
        }
      } else {
        console.log(`\nCurrent temperature: ${config.temperature}`);
      }
      break;

    case '/tokens':
      if (args[0]) {
        config.max_tokens = parseInt(args[0]);
        console.log(`\n✅ Max tokens set to: ${config.max_tokens}`);
      } else {
        console.log(`\nCurrent max tokens: ${config.max_tokens}`);
      }
      break;

    case '/history':
      console.log('\n' + '─'.repeat(60));
      console.log('📜 Message History:');
      console.log('─'.repeat(60));
      messages.forEach((msg, i) => {
        const role = msg.role === 'user' ? '👤 You' : 
                     msg.role === 'assistant' ? '🤖 Assistant' : '⚙️ System';
        console.log(`\n${role} (${i + 1}):`);
        console.log(msg.content.substring(0, 200) + (msg.content.length > 200 ? '...' : ''));
      });
      console.log('─'.repeat(60));
      break;

    case '/quit':
    case '/exit':
      console.log('\n👋 Goodbye!\n');
      rl.close();
      process.exit(0);
      break;

    default:
      console.log(`\n❓ Unknown command: ${cmd}`);
      console.log('Type /help for available commands');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Caught interrupt signal, shutting down...\n');
  rl.close();
  process.exit(0);
});

// Start the chat
chat();
