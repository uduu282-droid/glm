import express from 'express';
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Simplest DeepSeek Proxy - No cookie saving/loading
 * Just login once in browser and use it directly
 */
class SimpleDeepSeekProxy {
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

    // Auto-login with credentials
    console.log('📍 Logging in automatically...\n');
    console.log('📧 Email: eres3022@gmail.com');
    console.log('🔑 Password: [HIDDEN]\n');
    
    await this.page.goto(this.baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
    await new Promise(r => setTimeout(r, 3000));
    
    // Try to find and fill login form
    try {
      console.log('🔍 Looking for email field...\n');
      
      // Try multiple selectors for email
      const emailSelectors = [
        'input[type="email"]',
        'input[name="email"]',
        'input[placeholder*="Email"]',
        'input[placeholder*="email"]',
        '#email',
        '#username'
      ];
      
      let emailField = null;
      for (const selector of emailSelectors) {
        emailField = await this.page.$(selector);
        if (emailField) {
          console.log(`✅ Found email field: ${selector}\n`);
          break;
        }
      }
      
      if (emailField) {
        await emailField.fill('eres3022@gmail.com');
        console.log('✅ Email filled successfully\n');
      } else {
        console.log('⚠️  Could not find email field - trying manual approach\n');
      }
      
      console.log('🔍 Looking for password field...\n');
      const passwordField = await this.page.$('input[type="password"]');
      if (passwordField) {
        await passwordField.fill('ronit@5805');
        console.log('✅ Password filled successfully\n');
      } else {
        console.log('⚠️  Could not find password field\n');
      }
      
      // Wait a moment for fields to be recognized
      await new Promise(r => setTimeout(r, 2000));
      
      console.log('🔍 Looking for submit button...\n');
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Sign In")',
        'button:has-text("Login")',
        '.login-button'
      ];
      
      let submitButton = null;
      for (const selector of submitSelectors) {
        submitButton = await this.page.$(selector);
        if (submitButton) {
          console.log(`✅ Found submit button: ${selector}\n`);
          break;
        }
      }
      
      if (submitButton) {
        await submitButton.click();
        console.log('✅ Submit clicked - waiting for authentication...\n');
        await new Promise(r => setTimeout(r, 8000));
      } else {
        console.log('⚠️  Could not find submit button - trying alternative methods...\n');
        
        // Try pressing Enter on the password field
        console.log('🔑 Pressing Enter on password field...\n');
        if (passwordField) {
          await passwordField.press('Enter');
          await new Promise(r => setTimeout(r, 5000));
        }
        
        // Try clicking any button that might be login (but NOT sign up)
        console.log('🔍 Trying to click login button...\n');
        const allButtons = await this.page.$$('button');
        if (allButtons.length > 0) {
          for (const btn of allButtons) {
            const text = await btn.textContent();
            const lowerText = text.toLowerCase().trim();
            
            // Skip "Sign up" or "Register" buttons
            if (lowerText.includes('sign up') || lowerText.includes('register') || lowerText.includes('create account')) {
              continue; // Skip these
            }
            
            // Look for login-related buttons
            if (lowerText.includes('sign in') || 
                lowerText.includes('login') || 
                lowerText.includes('log in') ||
                (lowerText.includes('sign') && lowerText.includes('in')) ||
                lowerText === 'continue' ||
                lowerText.includes('next')) {
              console.log(`🎯 Clicking login button: "${text.trim()}"\n`);
              await btn.click();
              await new Promise(r => setTimeout(r, 8000));
              break;
            }
          }
        }
      }
      
    } catch (e) {
      console.log('⚠️  Auto-fill error:', e.message, '\n');
    }
    
    // Check if logged in
    const currentUrl = this.page.url();
    console.log('🔍 Current URL:', currentUrl);
    
    if (currentUrl.includes('/sign_in')) {
      console.log('\n⚠️  Still on login page - waiting for manual login...\n');
      console.log('👉 Please login manually in the browser window\n');
      console.log('⏳ Press ENTER when logged in...\n');
      await new Promise(r => process.stdin.once('data', r));
    } else {
      console.log('✅ Already logged in!\n');
    }
    
    console.log('✅ Login confirmed! Starting proxy...\n');
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
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        proxy: 'simple-deepseek-proxy',
        browserConnected: !!this.browser && this.browser.isConnected(),
        url: this.page?.url()
      });
    });

    this.app.post('/v1/chat/completions', async (req, res) => {
      try {
        const { model, messages } = req.body;
        
        console.log('\n📤 Request:', messages?.[0]?.content?.substring(0, 50));
        
        // Execute request DIRECTLY in the logged-in browser
        const result = await this.page.evaluate(async (data) => {
          console.log('Making fetch request to /api/v0/chat/completion...');
          
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
          
          console.log('Response status:', response.status);
          const text = await response.text();
          console.log('Raw response:', text);
          
          try {
            return JSON.parse(text);
          } catch (e) {
            return { error: 'Invalid JSON response', raw: text, parseError: e.message };
          }
        }, { model, messages });

        console.log('📥 Result:', JSON.stringify(result, null, 2).substring(0, 200));

        if (result.code === 40003) {
          console.log('⚠️  Token invalid - need to re-login in browser!\n');
          return res.status(401).json({
            error: { 
              message: 'Session expired. Please re-login in the browser window.',
              action: 'Login again in the open browser window, then retry'
            }
          });
        }

        // Return OpenAI-compatible response
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
            finish_reason: 'stop'
          }],
          usage: result.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
        });

      } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ error: { message: error.message } });
      }
    });
  }

  async start() {
    await this.initialize();
    this.setupMiddleware();
    this.setupRoutes();

    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log('\n' + '='.repeat(60));
        console.log('🚀 Simple DeepSeek Proxy is LIVE!\n');
        console.log(`📡 URL: http://localhost:${this.port}`);
        console.log(`🎯 Endpoint: http://localhost:${this.port}/v1/chat/completions`);
        console.log(`🌐 Browser: Open and Logged In`);
        console.log('\n💡 Test it:\n');
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
}

// Main
async function main() {
  console.log('='.repeat(60));
  console.log('🚀 Starting Simple DeepSeek Proxy...');
  console.log('='.repeat(60));
  console.log('');

  const proxy = new SimpleDeepSeekProxy(8787);
  await proxy.start();

  process.on('SIGINT', async () => {
    console.log('\n\n👋 Shutting down...\n');
    if (proxy.browser) await proxy.browser.close();
    if (proxy.server) await proxy.server.close();
    process.exit(0);
  });
}

main().catch(console.error);
