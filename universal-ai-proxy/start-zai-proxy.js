import express from 'express';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

/**
 * Z.AI (Chat.Z) Proxy
 * Alternative to DeepSeek - may have better API access
 */
class ZAIProxy {
  constructor(port = 8787) {
    this.port = port;
    this.app = express();
    this.browser = null;
    this.page = null;
    this.baseUrl = 'https://chat.z.ai';
  }

  async initialize() {
    console.log('\n🌐 Launching browser for Z.AI...\n');
    
    this.browser = await chromium.launch({
      headless: false,
      args: ['--window-size=1280,900']
    });

    const context = await this.browser.newContext({
      viewport: { width: 1280, height: 900 }
    });

    this.page = await context.newPage();

    // Try to load saved session first
    const sessionFile = path.join(process.cwd(), 'zai-session.json');
    if (fs.existsSync(sessionFile)) {
      console.log('📂 Found saved Z.AI session!\n');
      try {
        const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
        
        // Restore cookies
        if (sessionData.cookies && sessionData.cookies.length > 0) {
          await context.addCookies(sessionData.cookies);
          console.log(`✅ Restored ${sessionData.cookies.length} cookies\n`);
        }
        
        // Go to site and check if still logged in
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await new Promise(r => setTimeout(r, 5000));
        
        // Check if we're actually logged in
        const currentUrl = this.page.url();
        if (!currentUrl.includes('/login') && !currentUrl.includes('/signin') && !currentUrl.includes('/auth')) {
          console.log('✅ Session restored successfully! Logged in as:', currentUrl);
          console.log('\n🚀 Starting Z.AI proxy with saved session...\n');
          return; // Success!
        } else {
          console.log('⚠️  Saved session expired - need to re-login\n');
        }
      } catch (error) {
        console.log('❌ Error loading saved session:', error.message);
      }
    }
    
    // No saved session or expired - navigate for login
    console.log('📍 Navigate to https://chat.z.ai and login\n');
    console.log('👉 Browser window is open - please login/register\n');
    console.log('⏳ Press ENTER when logged in...\n');
    
    await this.page.goto(this.baseUrl, { waitUntil: 'networkidle', timeout: 120000 });
    await new Promise(r => process.stdin.once('data', r));
    
    // Save the session
    console.log('\n💾 Saving session...\n');
    await this.saveSession(context, sessionFile);
    
    console.log('✅ Login confirmed! Starting Z.AI proxy...\n');
  }
  
  async saveSession(context, sessionFile) {
    try {
      const cookies = await context.cookies();
      const localStorage = await this.page.evaluate(() => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) data[key] = localStorage.getItem(key);
        }
        return data;
      });
      
      const sessionData = {
        cookies: cookies.map(c => ({
          name: c.name,
          value: c.value,
          domain: c.domain,
          path: c.path,
          expires: c.expires
        })),
        localStorage: localStorage,
        url: this.page.url(),
        timestamp: Date.now()
      };
      
      fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
      console.log('✅ Session saved to:', sessionFile);
      console.log('   - Cookies:', sessionData.cookies.length);
      console.log('   - LocalStorage items:', Object.keys(sessionData.localStorage).length);
      console.log('   - URL:', sessionData.url);
    } catch (error) {
      console.error('❌ Error saving session:', error.message);
    }
  }

  setupMiddleware() {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') return res.sendStatus(200);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        proxy: 'zai-proxy',
        target: this.baseUrl,
        browserConnected: !!this.browser && this.browser.isConnected(),
        url: this.page?.url()
      });
    });

    // Chat completions endpoint
    this.app.post('/v1/chat/completions', async (req, res) => {
      try {
        const { model, messages, stream } = req.body;
        
        console.log('\n📤 Z.AI Request:', messages?.[0]?.content?.substring(0, 50));
        
        // Try to use the browser to make the request
        const result = await this.page.evaluate(async (data) => {
          try {
            // First, try the direct API endpoint
            const response = await fetch('/api/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: data.model || 'z-ai',
                messages: data.messages || [],
                stream: data.stream || false
              }),
              credentials: 'include'
            });
            
            console.log('API Response status:', response.status);
            const text = await response.text();
            console.log('Raw response:', text.substring(0, 300));
            
            try {
              return JSON.parse(text);
            } catch (e) {
              return { error: e.message, raw: text.substring(0, 500) };
            }
            
          } catch (error) {
            return { error: 'Fetch failed: ' + error.message };
          }
        }, { model, messages, stream });

        console.log('\n📥 Result:', JSON.stringify(result, null, 2).substring(0, 300));

        // Check if we got a valid response
        if (result.error && !result.choices) {
          console.log('⚠️  API call failed, trying alternative approach...\n');
          
          // Try alternative endpoint or method
          res.status(200).json({
            id: `chatcmpl-${Date.now()}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: model || 'z-ai',
            choices: [{
              index: 0,
              message: {
                role: 'assistant',
                content: `Z.AI API returned: ${JSON.stringify(result)}\n\nThis suggests the API endpoint may be different or requires different authentication.`
              },
              finish_reason: 'stop'
            }],
            usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
          });
        } else {
          // Success! Return OpenAI-compatible response
          res.json({
            id: `chatcmpl-${Date.now()}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: model || 'z-ai',
            choices: [{
              index: 0,
              message: {
                role: 'assistant',
                content: result.choices?.[0]?.message?.content || JSON.stringify(result)
              },
              finish_reason: result.choices?.[0]?.finish_reason || 'stop'
            }],
            usage: result.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
          });
        }

      } catch (error) {
        console.error('❌ Z.AI Proxy Error:', error.message);
        res.status(500).json({
          error: {
            message: error.message,
            type: 'proxy_error'
          }
        });
      }
    });

    // Models endpoint
    this.app.get('/v1/models', (req, res) => {
      res.json({
        object: 'list',
        data: [
          {
            id: 'z-ai',
            object: 'model',
            created: Date.now(),
            owned_by: 'z.ai'
          }
        ]
      });
    });
  }

  async start() {
    await this.initialize();
    this.setupMiddleware();
    this.setupRoutes();

    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log('\n' + '='.repeat(60));
        console.log('🚀 Z.AI Proxy is LIVE!\n');
        console.log(`📡 URL: http://localhost:${this.port}`);
        console.log(`🎯 Target: ${this.baseUrl}`);
        console.log(`🌐 Browser: Connected`);
        console.log('\n💡 Test it:\n');
        console.log('curl http://localhost:' + this.port + '/v1/chat/completions \\');
        console.log('  -H "Content-Type: application/json" \\');
        console.log('  -d \'{');
        console.log('    "model": "z-ai",');
        console.log('    "messages": [{"role": "user", "content": "Hello!"}]');
        console.log('  }\'\n');
        console.log('='.repeat(60) + '\n');
        resolve();
      });
    });
  }
}

// Main
async function main() {
  console.log('='.repeat(60));
  console.log('🚀 Starting Z.AI Proxy...');
  console.log('='.repeat(60));
  console.log('');

  const proxy = new ZAIProxy(8787);
  await proxy.start();

  process.on('SIGINT', async () => {
    console.log('\n\n👋 Shutting down...\n');
    if (proxy.browser) await proxy.browser.close();
    if (proxy.server) await proxy.server.close();
    process.exit(0);
  });
}

main().catch(console.error);
