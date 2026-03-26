import express from 'express';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * DeepSeek OpenAI-Compatible Proxy
 * - Auto-discovers all available models
 * - Provides OpenAI-compatible endpoints
 * - Live browser for auto token refresh
 */
class DeepSeekOpenAIProxy {
  constructor(sessionData, port = 8787) {
    this.sessionData = sessionData;
    this.port = port;
    this.app = express();
    this.browser = null;
    this.context = null;
    this.page = null;
    
    this.baseUrl = 'https://chat.deepseek.com';
    this.chatEndpoint = '/api/v0/chat/completion';
    
    // Discovered models
    this.models = [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', type: 'chat' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', type: 'chat' },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', type: 'chat' }
    ];
  }

  async initialize() {
    console.log('\n🌐 Launching browser for DeepSeek OpenAI Proxy...\n');
    
    this.browser = await chromium.launch({
      headless: false,
      args: ['--window-size=1280,900', '--disable-blink-features=AutomationControlled']
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    this.page = await this.context.newPage();

    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    // Restore session
    console.log('🔄 Restoring session...\n');
    await this.context.addCookies(this.sessionData.cookies || []);
    await this.page.goto(this.baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
    
    if (this.sessionData.localStorage) {
      await this.page.evaluate((storage) => {
        Object.keys(storage).forEach(key => {
          try { localStorage.setItem(key, storage[key]); } catch (e) {}
        });
      }, this.sessionData.localStorage);
    }

    console.log('✅ Session restored!\n');
    await new Promise(r => setTimeout(r, 3000));
    this.startTokenRefresh();
  }

  startTokenRefresh() {
    console.log('⚡ Starting automatic token refresh...\n');
    setInterval(async () => {
      try {
        await this.page.evaluate(async () => {
          await fetch('/api/v0/client/settings?did=&scope=banner', { credentials: 'include' });
        });
        const cookies = await this.context.cookies();
        this.sessionData.cookies = cookies.map(c => ({
          name: c.name, value: c.value, domain: c.domain, path: c.path, expires: c.expires
        }));
        this.saveSession();
        console.log('🔄 Tokens refreshed\n');
      } catch (error) {
        console.log('⚠️  Token refresh failed:', error.message, '\n');
      }
    }, 120000);
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
    // OpenAI-compatible models endpoint
    this.app.get('/v1/models', (req, res) => {
      res.json({
        object: 'list',
        data: this.models.map(model => ({
          id: model.id,
          object: 'model',
          created: Date.now(),
          owned_by: 'deepseek',
          permission: [],
          root: model.id,
          parent: null
        }))
      });
    });

    // Get specific model info
    this.app.get('/v1/models/:model', (req, res) => {
      const model = this.models.find(m => m.id === req.params.model);
      if (!model) {
        return res.status(404).json({ error: { message: 'Model not found', type: 'invalid_request_error' } });
      }
      res.json({
        id: model.id,
        object: 'model',
        created: Date.now(),
        owned_by: 'deepseek',
        permission: [],
        root: model.id,
        parent: null
      });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        proxy: 'deepseek-openai-proxy',
        browserConnected: !!this.browser && this.browser.isConnected(),
        modelsCount: this.models.length,
        models: this.models.map(m => m.id)
      });
    });

    // OpenAI-compatible chat completions endpoint
    this.app.post('/v1/chat/completions', async (req, res) => {
      try {
        const { model, messages, stream, temperature, max_tokens, top_p, frequency_penalty, presence_penalty } = req.body;
        
        console.log('\n📤 OpenAI-Compatible Request:');
        console.log(`   Model: ${model}`);
        console.log(`   Messages: ${messages?.length || 0}`);
        console.log(`   Content: ${messages?.[0]?.content?.substring(0, 50)}...`);
        
        const result = await this.page.evaluate(async (data) => {
          const response = await fetch('/api/v0/chat/completion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: data.model || 'deepseek-chat',
              messages: data.messages || [],
              stream: data.stream || false,
              temperature: data.temperature !== undefined ? data.temperature : 0.7,
              max_tokens: data.max_tokens || 2048,
              top_p: data.top_p || 0.9,
              frequency_penalty: data.frequency_penalty || 0,
              presence_penalty: data.presence_penalty || 0
            }),
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          return await response.json();
        }, {
          model: model || 'deepseek-chat',
          messages: messages || [],
          stream: stream || false,
          temperature,
          max_tokens,
          top_p,
          frequency_penalty,
          presence_penalty
        });

        console.log('✅ Response received from DeepSeek\n');
        
        // Check for errors
        if (result.code === 40003 || result.msg === 'INVALID_TOKEN') {
          console.log('⚠️  Token expired - auto-relogin triggered...\n');
          
          try {
            // Auto re-login by navigating to login page and waiting
            await this.autoRelogin();
            
            // Retry the request with fresh session
            const retryResult = await this.page.evaluate(async (data) => {
              const response = await fetch('/api/v0/chat/completion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  model: data.model || 'deepseek-chat',
                  messages: data.messages || [],
                  stream: data.stream || false,
                  temperature: data.temperature !== undefined ? data.temperature : 0.7,
                  max_tokens: data.max_tokens || 2048,
                  top_p: data.top_p || 0.9,
                  frequency_penalty: data.frequency_penalty || 0,
                  presence_penalty: data.presence_penalty || 0
                }),
                credentials: 'include'
              });
              
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }
              
              return await response.json();
            }, {
              model: model || 'deepseek-chat',
              messages: messages || [],
              stream: stream || false,
              temperature,
              max_tokens,
              top_p,
              frequency_penalty,
              presence_penalty
            });
            
            // Format successful retry response
            const openaiResponse = {
              id: `chatcmpl-${Date.now()}`,
              object: 'chat.completion',
              created: Math.floor(Date.now() / 1000),
              model: model || 'deepseek-chat',
              choices: [{
                index: 0,
                message: {
                  role: 'assistant',
                  content: retryResult.choices?.[0]?.message?.content || 
                           retryResult.data?.content || 
                           retryResult.response || 
                           JSON.stringify(retryResult)
                },
                finish_reason: retryResult.choices?.[0]?.finish_reason || 'stop'
              }],
              usage: retryResult.usage || {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0
              }
            };
            
            return res.json(openaiResponse);
            
          } catch (retryError) {
            console.log('❌ Auto-relogin failed:', retryError.message, '\n');
            return res.status(401).json({
              error: {
                message: 'Session expired. Please visit DeepSeek in browser to re-login.',
                type: 'invalid_request_error',
                code: 'session_expired',
                action: 'Please login manually at https://chat.deepseek.com then restart proxy'
              }
            });
          }
        }

        // Format as OpenAI response
        const openaiResponse = {
          id: `chatcmpl-${Date.now()}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: model || 'deepseek-chat',
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: result.choices?.[0]?.message?.content || 
                       result.data?.content || 
                       result.response || 
                       JSON.stringify(result)
            },
            finish_reason: result.choices?.[0]?.finish_reason || 
                          (result.finish_reason ? result.finish_reason : 'stop')
          }],
          usage: result.usage || {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
          }
        };

        res.json(openaiResponse);
        
      } catch (error) {
        console.error('\n❌ OpenAI Proxy Error:', error.message);
        res.status(500).json({
          error: {
            message: error.message || 'DeepSeek proxy error',
            type: 'server_error',
            code: 'proxy_error'
          }
        });
      }
    });

    // Test all models endpoint
    this.app.post('/test-all-models', async (req, res) => {
      try {
        console.log('\n🧪 Testing all DeepSeek models...\n');
        const results = [];
        
        for (const model of this.models) {
          console.log(`\n📊 Testing model: ${model.id}...`);
          
          try {
            const testResult = await this.page.evaluate(async (modelId) => {
              const response = await fetch('/api/v0/chat/completion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  model: modelId,
                  messages: [{ role: 'user', content: 'Say "OK" in 1 word' }],
                  max_tokens: 10
                }),
                credentials: 'include'
              });
              
              if (!response.ok) {
                return { error: `HTTP ${response.status}` };
              }
              
              return await response.json();
            }, model.id);
            
            results.push({
              model: model.id,
              status: testResult.code === 40003 ? 'expired' : 'success',
              response: testResult
            });
            
            console.log(`✅ ${model.id}: ${testResult.code === 40003 ? 'EXPIRED' : 'WORKING'}`);
            
          } catch (error) {
            results.push({
              model: model.id,
              status: 'error',
              error: error.message
            });
            console.log(`❌ ${model.id}: ${error.message}`);
          }
        }
        
        res.json({
          status: 'complete',
          modelsTested: results.length,
          results
        });
        
      } catch (error) {
        res.status(500).json({ error: { message: error.message } });
      }
    });

    // Session management
    this.app.get('/session', async (req, res) => {
      const cookies = await this.context.cookies();
      res.json({
        url: this.sessionData.url,
        browserConnected: this.browser?.isConnected(),
        cookiesCount: cookies.length,
        modelsAvailable: this.models.map(m => m.id)
      });
    });
  }

  saveSession() {
    const sessionFile = path.join(__dirname, '..', 'sessions', 'deepseek_session.json');
    fs.writeFileSync(sessionFile, JSON.stringify(this.sessionData, null, 2));
  }

  async autoRelogin() {
    console.log('\n🔄 Attempting automatic re-login...\n');
    
    try {
      // Navigate to login page
      await this.page.goto(`${this.baseUrl}/sign_in`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait a moment for page to load
      await new Promise(r => setTimeout(r, 3000));
      
      // Try to auto-fill credentials if available
      if (this.sessionData.credentials) {
        const { email, password } = this.sessionData.credentials;
        
        try {
          const emailField = await this.page.$('input[type="email"]');
          if (emailField) {
            await emailField.fill(email);
            console.log('✅ Email filled automatically\n');
          }
        } catch (e) {}
        
        try {
          const passwordField = await this.page.$('input[type="password"]');
          if (passwordField) {
            await passwordField.fill(password);
            console.log('✅ Password filled automatically\n');
          }
        } catch (e) {}
        
        // Try to click submit
        try {
          const submitButton = await this.page.$('button[type="submit"]');
          if (submitButton) {
            await submitButton.click();
            console.log('✅ Submit clicked - waiting for login...\n');
            await new Promise(r => setTimeout(r, 5000));
          }
        } catch (e) {}
      }
      
      // Check if we're logged in now
      const currentUrl = this.page.url();
      if (currentUrl.includes('/chat') || !currentUrl.includes('/sign_in')) {
        console.log('✅ Auto-relogin successful!\n');
        
        // Extract fresh session data
        const cookies = await this.context.cookies();
        this.sessionData.cookies = cookies.map(c => ({
          name: c.name,
          value: c.value,
          domain: c.domain,
          path: c.path,
          expires: c.expires
        }));
        
        const localStorage = await this.page.evaluate(() => {
          const data = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) data[key] = localStorage.getItem(key);
          }
          return data;
        });
        
        this.sessionData.localStorage = localStorage;
        this.saveSession();
        
        return true;
      }
      
      // If still on login page, we need manual intervention
      console.log('⚠️  Auto-relogin needs manual help - browser window is open\n');
      console.log('👉 Please complete login in the browser window...\n');
      console.log('⏳ Waiting up to 60 seconds...\n');
      
      // Wait for user to complete login (up to 60 seconds)
      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 1000));
        
        const url = this.page.url();
        if (url.includes('/chat') || !url.includes('/sign_in')) {
          console.log('✅ Manual login detected!\n');
          
          // Extract fresh session
          const cookies = await this.context.cookies();
          this.sessionData.cookies = cookies.map(c => ({
            name: c.name,
            value: c.value,
            domain: c.domain,
            path: c.path,
            expires: c.expires
          }));
          
          const localStorage = await this.page.evaluate(() => {
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key) data[key] = localStorage.getItem(key);
            }
            return data;
          });
          
          this.sessionData.localStorage = localStorage;
          this.saveSession();
          
          return true;
        }
      }
      
      throw new Error('Login timeout after 60 seconds');
      
    } catch (error) {
      console.log('❌ Auto-relogin failed:', error.message, '\n');
      throw error;
    }
  }

  async start() {
    await this.initialize();
    this.setupMiddleware();
    this.setupRoutes();

    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log('\n' + '='.repeat(60));
        console.log('🚀 DeepSeek OpenAI-Compatible Proxy is LIVE!\n');
        console.log(`📡 URL: http://localhost:${this.port}`);
        console.log(`🎯 OpenAI Endpoint: http://localhost:${this.port}/v1/chat/completions`);
        console.log(`📚 Models Endpoint: http://localhost:${this.port}/v1/models`);
        console.log(`🌐 Browser: Connected & Auto-refreshing`);
        console.log(`📊 Available Models (${this.models.length}):\n`);
        
        this.models.forEach((model, i) => {
          console.log(`   ${i + 1}. ${model.id.padEnd(20)} - ${model.name}`);
        });
        
        console.log('\n💡 Usage with OpenAI SDK:\n');
        console.log('from openai import OpenAI');
        console.log('client = OpenAI(');
        console.log('    api_key="not-needed",');
        console.log('    base_url="http://localhost:8787/v1"');
        console.log(')');
        console.log('\nOr use curl:\n');
        console.log('curl http://localhost:8787/v1/chat/completions \\');
        console.log('  -H "Content-Type: application/json" \\');
        console.log('  -d \'{');
        console.log('    "model": "deepseek-chat",');
        console.log('    "messages": [{"role": "user", "content": "Hello!"}]');
        console.log('  }\'\n');
        console.log('='.repeat(60) + '\n');
        resolve();
      });
    });
  }

  async stop() {
    console.log('\n🛑 Stopping proxy...\n');
    if (this.server) await this.server.close();
    if (this.browser) {
      console.log('🔒 Closing browser...\n');
      await this.browser.close();
    }
    console.log('✅ Proxy stopped\n');
  }
}

// Main execution
async function main() {
  console.log('='.repeat(60));
  console.log('🚀 Starting DeepSeek OpenAI-Compatible Proxy...');
  console.log('='.repeat(60));
  console.log('');

  const sessionFile = 'c:\\Users\\Ronit\\Downloads\\test models 2\\universal-ai-proxy\\sessions\\deepseek_session.json';
  
  if (!fs.existsSync(sessionFile)) {
    console.error('❌ No saved session found!');
    console.error('Please run: node login-deepseek.js\n');
    process.exit(1);
  }

  const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
  
  console.log('✅ Session loaded');
  console.log(`🍪 Cookies: ${sessionData.cookies?.length || 0}`);
  console.log(`💾 LocalStorage: ${Object.keys(sessionData.localStorage || {}).length} items\n`);

  const proxy = new DeepSeekOpenAIProxy(sessionData, 8787);
  await proxy.start();

  process.on('SIGINT', async () => {
    console.log('\n\n👋 Shutting down...\n');
    await proxy.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n👋 Shutting down...\n');
    await proxy.stop();
    process.exit(0);
  });
}

main().catch(console.error);
