import { ChatWebsiteProxy } from './src/chat-website-proxy.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Quick Start Proxy - Uses saved session directly
 */
async function startProxy() {
  console.log('\n🚀 Starting DeepSeek Proxy with Saved Session...\n');
  
  const sessionFile = path.join(__dirname, '../sessions/deepseek_chat_com.json');
  
  if (!fs.existsSync(sessionFile)) {
    console.error('❌ No saved session found!');
    console.error('Please run: node src/index.js https://chat.deepseek.com\n');
    process.exit(1);
  }
  
  // Load saved session
  const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
  
  console.log('✅ Session loaded:', sessionData.url);
  console.log(`🍪 Cookies: ${sessionData.cookies?.length || 0}`);
  console.log(`💾 LocalStorage: ${Object.keys(sessionData.localStorage || {}).length} items`);
  console.log(`🕐 Created: ${new Date(sessionData.timestamp).toLocaleString()}\n`);
  
  // Start proxy
  console.log('🚀 Starting proxy server...\n');
  const proxy = new ChatWebsiteProxy(sessionData);
  await proxy.start();
  
  console.log('='.repeat(60) + '\n');
  console.log('✨ DeepSeek Proxy is LIVE!\n');
  console.log('📡 URL: http://localhost:8787\n');
  console.log('💡 Test it now:\n');
  console.log('curl http://localhost:8787/health\n');
  console.log('Or use the chat endpoint:\n');
  console.log('curl http://localhost:8787/v1/chat/completions \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{');
  console.log('    "model": "deepseek-chat",');
  console.log('    "messages": [{"role": "user", "content": "Hello!"}]');
  console.log('  }\'\n');
  console.log('='.repeat(60) + '\n');
}

startProxy().catch(console.error);
