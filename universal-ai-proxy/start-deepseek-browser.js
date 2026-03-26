import express from 'express';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * DeepSeek Browser-Based Proxy
 * Uses live browser context to keep tokens fresh
 */
class DeepSeekBrowserProxy {
  constructor(sessionData, port = 8787) {
    this.sessionData = sessionData;
    this.port = port;
    this.app = express();
    this.browser = null;
    this.context = null;
    this.page = null;
    
    this.baseUrl = 'https://chat.deepseek.com';
    this.chatEndpoint = '/api/v0/chat/completion';
  }

  async initialize() {
    console.log('\n🌐 Launching browser for live session...\n');
    
    // Launch browser (headless: false keeps it alive)
    this.browser = await chromium.launch({
      headless: false, // IMPORTANT: Keep visible for token refresh
      args: [
        '--window-size=1280,900',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    // Create context with same user agent as original session
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    this.page = await this.context.newPage();

    // Avoid detection
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
      });
    });

    // Restore session
    console.log('🔄 Restoring session in browser...\n');
    await this.context.addCookies(this.sessionData.cookies || []);
    
    // Navigate to apply localStorage
    await this.page.goto(this.baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Restore localStorage
    if (this.sessionData.localStorage) {
      await this.page.evaluate((storage) => {
        Object.keys(storage).forEach(key => {
          try {
            localStorage.setItem(key, storage[key]);
          } catch (e) {
            // Ignore quota errors
          }
        });
      }, this.sessionData.localStorage);
    }

    console.log('✅ Session restored in browser!\n');
    
    // Wait a moment for page to initialize
    await new Promise(r => setTimeout(r, 3000));

    // Start auto-refresh mechanism
    this.startTokenRefresh();
  }

  startTokenRefresh() {
    console.log('⚡ Starting automatic token refresh...\n');
    
    // Refresh tokens every 2 minutes by making a lightweight request
    setInterval(async () => {
      try {
        console.log('🔄 Auto-refreshing tokens...\n');
        
        const result = await this.page.evaluate(async () => {
          // Make a lightweight API call to refresh tokens
          const response = await fetch('/api/v0/client/settings?did=&scope=banner', {
            method: 'GET',
            credentials: 'include'
          });
          
          return {
            ok: response.ok,
            status: response.status
          };
        });

        if (result.ok) {
          console.log('✅ Tokens refreshed successfully\n');
          
          // Extract updated cookies
          const cookies = await this.context.cookies();
          this.sessionData.cookies = cookies.map(c => ({
            name: c.name,
            value: c.value,
            domain: c.domain,
            path: c.path,
            expires: c.expires
          }));
          
          // Save updated session
          this.saveSession();
        } else {
          console.log('⚠️  Token refresh returned:', result.status, '\n');
        }
      } catch (error) {
        console.log('⚠️  Token refresh failed:', error.message, '\n');
      }
    }, 120000); // Every 2 minutes
  }

  setupMiddleware() {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        proxy: 'deepseek-browser-proxy',
        target: this.baseUrl,
        endpoint: this.chatEndpoint,
        browserConnected: !!this.browser && this.browser.isConnected(),
        hasPage: !!this.page,
        cookiesCount: this.sessionData.cookies?.length || 0,
        localStorageItems: Object.keys(this.sessionData.localStorage || {}).length,
        sessionId: this.sessionData.sessionId
      });
    });

    // Chat completion - THE MAIN ENDPOINT
    this.app.post('/v1/chat/completions', async (req, res) => {
      try {
        const { model, messages, stream, temperature, max_tokens } = req.body;
        
        console.log('\n📤 DeepSeek Chat Request (Browser):');
        console.log(`   Model: ${model || 'deepseek-chat'}`);
        console.log(`   Messages: ${messages?.length || 0}`);
        console.log(`   Content: ${messages?.[0]?.content?.substring(0, 50)}...`);
        
        // Execute request IN THE BROWSER CONTEXT
        const result = await this.page.evaluate(async (data) => {
          const response = await fetch('/api/v0/chat/completion', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include' // Include cookies automatically
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          return await response.json();
        }, {
          model: model || 'deepseek-chat',
          messages: messages || [],
          stream: stream || false,
          temperature: temperature || 0.7,
          max_tokens: max_tokens || 2048
        });

        console.log('✅ Response received from DeepSeek (via browser)\n');
        
        // Check if response contains error
        if (result.code === 40003) {
          console.log('⚠️  Token expired - triggering re-login...\n');
          await this.handleTokenExpired(res);
          return;
        }

        // Format response to OpenAI format
        res.json({
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
                       JSON.stringify(result)
            },
            finish_reason: result.choices?.[0]?.finish_reason || 'stop'
          }],
          usage: result.usage || {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
          }
        });
        
      } catch (error) {
        console.error('\n❌ Browser Proxy Error:', error.message);
        
        res.status(500).json({
          error: {
            message: error.message || 'DeepSeek browser proxy error',
            type: 'browser_proxy_error'
          }
        });
      }
    });

    // Session info
    this.app.get('/session', async (req, res) => {
      // Get fresh cookies from browser
      const cookies = await this.context.cookies();
      
      res.json({
        url: this.sessionData.url,
        browserConnected: this.browser?.isConnected(),
        cookiesCount: cookies.length,
        localStorageItems: Object.keys(this.sessionData.localStorage || {}).length,
        sessionId: this.sessionData.sessionId,
        hasPowChallenge: !!this.sessionData.powChallenge,
        lastRefreshed: new Date().toISOString()
      });
    });

    // Manual refresh endpoint
    this.app.post('/refresh', async (req, res) => {
      try {
        console.log('🔄 Manual token refresh requested\n');
        
        const result = await this.page.evaluate(async () => {
          const response = await fetch('/api/v0/client/settings?did=&scope=banner', {
            method: 'GET',
            credentials: 'include'
          });
          return response.ok;
        });

        if (result) {
          const cookies = await this.context.cookies();
          this.sessionData.cookies = cookies.map(c => ({
            name: c.name,
            value: c.value,
            domain: c.domain,
            path: c.path,
            expires: c.expires
          }));
          
          this.saveSession();
          
          res.json({
            status: 'success',
            message: 'Tokens refreshed',
            cookiesCount: this.sessionData.cookies.length
          });
        } else {
          res.status(500).json({
            status: 'error',
            message: 'Refresh failed'
          });
        }
      } catch (error) {
        res.status(500).json({
          status: 'error',
          message: error.message
        });
      }
    });
  }

  async handleTokenExpired(res) {
    console.log('🔐 Re-authenticating...\n');
    
    // Navigate to login page
    await this.page.goto(`${this.baseUrl}/sign_in`, { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // Auto-fill credentials if available
    if (this.sessionData.credentials) {
      const { email, password } = this.sessionData.credentials;
      
      // Try to fill email
      try {
        const emailField = await this.page.$('input[type="email"]');
        if (emailField) {
          await emailField.fill(email);
          console.log('✅ Email filled\n');
        }
      } catch (e) {}

      // Try to fill password
      try {
        const passwordField = await this.page.$('input[type="password"]');
        if (passwordField) {
          await passwordField.fill(password);
          console.log('✅ Password filled\n');
        }
      } catch (e) {}

      console.log('👉 Please complete login manually if needed, then press ENTER...\n');
      await new Promise(r => process.stdin.once('data', r));
    } else {
      console.log('👉 No credentials saved. Please login manually in browser, then press ENTER...\n');
      await new Promise(r => process.stdin.once('data', r));
    }

    // Extract new session
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
        if (key) {
          data[key] = localStorage.getItem(key);
        }
      }
      return data;
    });

    this.sessionData.localStorage = localStorage;
    this.saveSession();

    console.log('✅ Re-authentication complete!\n');
    
    res.json({
      error: {
        message: 'Session expired. Please retry your request.',
        type: 'session_expired',
        action: 'retry'
      }
    });
  }

  saveSession() {
    const sessionFile = path.join(__dirname, '..', 'sessions', 'deepseek_session.json');
    fs.writeFileSync(sessionFile, JSON.stringify(this.sessionData, null, 2));
    console.log('💾 Session auto-saved\n');
  }

  async start() {
    await this.initialize();
    
    this.setupMiddleware();
    this.setupRoutes();

    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log('\n' + '='.repeat(60));
        console.log('🚀 DeepSeek Browser Proxy is LIVE!\n');
        console.log(`📡 URL: http://localhost:${this.port}`);
        console.log(`🎯 Target: ${this.baseUrl}${this.chatEndpoint}`);
        console.log(`🌐 Browser: Connected & Running`);
        console.log(`🍪 Session Cookies: ${this.sessionData.cookies?.length || 0}`);
        console.log(`💾 LocalStorage: ${Object.keys(this.sessionData.localStorage || {}).length} items`);
        console.log(`🆔 Session ID: ${this.sessionData.sessionId}`);
        console.log(`⚡ Auto-Refresh: Every 2 minutes\n`);
        console.log('💡 Test it now:\n');
        console.log('curl http://localhost:' + this.port + '/health\n');
        console.log('Or use the chat endpoint:\n');
        console.log('curl http://localhost:' + this.port + '/v1/chat/completions \\');
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
    
    if (this.server) {
      await this.server.close();
    }
    
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
  console.log('🚀 Starting DeepSeek Browser Proxy...');
  console.log('='.repeat(60));
  console.log('');

  // Load session
  const sessionFile = 'c:\\Users\\Ronit\\Downloads\\test models 2\\universal-ai-proxy\\sessions\\deepseek_session.json';
  
  if (!fs.existsSync(sessionFile)) {
    console.error('❌ No saved session found!');
    console.error('Please run: node login-deepseek.js\n');
    process.exit(1);
  }

  const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
  
  console.log('✅ Session loaded:', sessionData.url);
  console.log(`🍪 Cookies: ${sessionData.cookies?.length || 0}`);
  console.log(`💾 LocalStorage: ${Object.keys(sessionData.localStorage || {}).length} items`);
  console.log(`🕐 Created: ${new Date(sessionData.timestamp).toLocaleString()}\n`);

  // Start proxy
  const proxy = new DeepSeekBrowserProxy(sessionData, 8787);
  await proxy.start();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n👋 Received SIGINT, shutting down gracefully...\n');
    await proxy.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n👋 Received SIGTERM, shutting down gracefully...\n');
    await proxy.stop();
    process.exit(0);
  });
}

main().catch(console.error);
