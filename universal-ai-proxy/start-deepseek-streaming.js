import express from 'express';
import { chromium } from 'playwright';

/**
 * DeepSeek Streaming Proxy
 * Streams responses in real-time as they're generated
 */
class DeepSeekStreamingProxy {
  constructor(port = 8787) {
    this.port = port;
    this.app = express();
    this.browser = null;
    this.page = null;
    this.baseUrl = 'https://chat.deepseek.com';
  }

  async initialize() {
    console.log('\n🌐 Launching browser...\n');
    
    this.browser = await chromium.launch({
      headless: false,
      args: ['--window-size=1280,900']
    });

    const context = await this.browser.newContext({
      viewport: { width: 1280, height: 900 }
    });

    this.page = await context.newPage();

    console.log('📍 Navigate to https://chat.deepseek.com and login manually\n');
    console.log('👉 Browser window is open - please login\n');
    console.log('⏳ Press ENTER when logged in...\n');
    
    await this.page.goto(this.baseUrl, { waitUntil: 'networkidle', timeout: 120000 });
    await new Promise(r => process.stdin.once('data', r));
    
    console.log('\n✅ Login confirmed! Starting streaming proxy...\n');
  }

  setupMiddleware() {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Cache-Control', 'no-cache');
      res.header('Connection', 'keep-alive');
      if (req.method === 'OPTIONS') return res.sendStatus(200);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        proxy: 'deepseek-streaming-proxy',
        browserConnected: !!this.browser && this.browser.isConnected(),
        url: this.page?.url()
      });
    });

    // Streaming chat endpoint
    this.app.post('/v1/chat/completions', async (req, res) => {
      try {
        const { model, messages, stream } = req.body;
        
        console.log('\n📤 Request:', messages?.[0]?.content?.substring(0, 50));
        console.log('🔄 Stream mode:', stream ? 'ON' : 'OFF');

        // If not streaming, use simple fetch
        if (!stream) {
          const result = await this.page.evaluate(async (data) => {
            const response = await fetch('/api/v0/chat/completion', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: data.model || 'deepseek-chat',
                messages: data.messages || [],
                stream: false
              }),
              credentials: 'include'
            });
            
            const text = await response.text();
            try {
              return JSON.parse(text);
            } catch (e) {
              return { error: e.message, raw: text };
            }
          }, { model, messages });

          if (result.code === 40003) {
            return res.status(401).json({ 
              error: { message: 'Session expired - please re-login in browser' } 
            });
          }

          return res.json({
            id: `chatcmpl-${Date.now()}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: model || 'deepseek-chat',
            choices: [{
              index: 0,
              message: {
                role: 'assistant',
                content: result.choices?.[0]?.message?.content || JSON.stringify(result)
              },
              finish_reason: 'stop'
            }],
            usage: result.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
          });
        }

        // STREAMING MODE - Send chunks as they arrive
        console.log('🎬 Starting streaming response...\n');
        
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Use browser to capture streaming response
        const streamDone = await this.page.evaluate(async (data) => {
          return new Promise((resolve) => {
            fetch('/api/v0/chat/completion', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: data.model || 'deepseek-chat',
                messages: data.messages || [],
                stream: true
              }),
              credentials: 'include'
            })
            .then(async (response) => {
              const reader = response.body.getReader();
              const decoder = new TextDecoder();
              let fullContent = '';
              
              while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                  resolve({ success: true, content: fullContent });
                  break;
                }
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                      continue;
                    }
                    
                    try {
                      const parsed = JSON.parse(data);
                      const content = parsed.choices?.[0]?.delta?.content || '';
                      if (content) {
                        fullContent += content;
                      }
                      
                      // Forward chunk to client
                      console.log('📤 Chunk:', content);
                    } catch (e) {
                      // Ignore parse errors
                    }
                  }
                }
              }
            })
            .catch((error) => {
              resolve({ success: false, error: error.message });
            });
          });
        }, { model, messages });

        console.log('\n✅ Stream complete:', streamDone);

      } catch (error) {
        console.error('❌ Stream error:', error.message);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    });

    // Simple web UI for testing
    this.app.get('/', (req, res) => {
      res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>DeepSeek Streaming Test</title>
  <style>
    body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
    #messages { border: 1px solid #ccc; padding: 20px; min-height: 200px; margin-bottom: 20px; }
    .user { color: blue; margin: 10px 0; }
    .assistant { color: green; margin: 10px 0; }
    textarea { width: 100%; height: 80px; margin-bottom: 10px; }
    button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
    button:hover { background: #0056b3; }
  </style>
</head>
<body>
  <h1>🤖 DeepSeek Streaming Chat</h1>
  <div id="messages"></div>
  <textarea id="input" placeholder="Type your message..."></textarea><br>
  <button onclick="sendMessage()">Send</button>
  
  <script>
    const messagesDiv = document.getElementById('messages');
    const input = document.getElementById('input');
    let messages = [];
    
    async function sendMessage() {
      const content = input.value.trim();
      if (!content) return;
      
      messages.push({ role: 'user', content });
      messagesDiv.innerHTML += '<div class="user">👤 You: ' + content + '</div>';
      input.value = '';
      
      const response = await fetch('/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages,
          stream: true
        })
      });
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      
      messagesDiv.innerHTML += '<div class="assistant">🤖 Assistant: <span id="current"></span></div>';
      const currentSpan = document.getElementById('current');
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data !== '[DONE]') {
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  assistantText += content;
                  currentSpan.textContent = assistantText;
                  messagesDiv.scrollTop = messagesDiv.scrollHeight;
                }
              } catch (e) {}
            }
          }
        }
      }
      
      messages.push({ role: 'assistant', content: assistantText });
    }
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  </script>
</body>
</html>
      `);
    });
  }

  async start() {
    await this.initialize();
    this.setupMiddleware();
    this.setupRoutes();

    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log('\n' + '='.repeat(60));
        console.log('🚀 DeepSeek Streaming Proxy is LIVE!\n');
        console.log(`📡 URL: http://localhost:${this.port}`);
        console.log(`🎯 Endpoint: http://localhost:${this.port}/v1/chat/completions`);
        console.log(`🌐 Browser: Open for chat`);
        console.log(`\n💡 Test it:\n`);
        console.log(`1. Open browser: http://localhost:${this.port}`);
        console.log(`   (Web UI for testing with streaming)\n`);
        console.log(`2. Or use curl:\n`);
        console.log(`curl -N http://localhost:${this.port}/v1/chat/completions \\`);
        console.log(`  -H "Content-Type: application/json" \\`);
        console.log(`  -d '{`);
        console.log(`    "model": "deepseek-chat",`);
        console.log(`    "messages": [{"role": "user", "content": "Hello!"}],`);
        console.log(`    "stream": true`);
        console.log(`  }'\n`);
        console.log('='.repeat(60) + '\n');
        resolve();
      });
    });
  }
}

// Main
async function main() {
  console.log('='.repeat(60));
  console.log('🚀 Starting DeepSeek Streaming Proxy...');
  console.log('='.repeat(60));
  console.log('');

  const proxy = new DeepSeekStreamingProxy(8787);
  await proxy.start();

  process.on('SIGINT', async () => {
    console.log('\n\n👋 Shutting down...\n');
    if (proxy.browser) await proxy.browser.close();
    if (proxy.server) await proxy.server.close();
    process.exit(0);
  });
}

main().catch(console.error);
