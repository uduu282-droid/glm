import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * DeepSeek-Specific Proxy Server
 * Uses the exact API endpoints from network analysis
 */
class DeepSeekProxy {
  constructor(sessionData, port = 8787) {
    this.sessionData = sessionData;
    this.port = port;
    this.app = express();
    
    // DeepSeek's actual API endpoints from network capture
    this.baseUrl = 'https://chat.deepseek.com';
    this.chatEndpoint = '/api/v0/chat/completion';
    
    this.setupMiddleware();
    this.setupRoutes();
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
        proxy: 'deepseek-proxy',
        target: this.baseUrl,
        endpoint: this.chatEndpoint,
        cookiesCount: this.sessionData.cookies?.length || 0,
        localStorageItems: Object.keys(this.sessionData.localStorage || {}).length,
        sessionId: this.sessionData.sessionId
      });
    });

    // Chat completion endpoint
    this.app.post('/v1/chat/completions', async (req, res) => {
      try {
        const { model, messages, stream, temperature, max_tokens } = req.body;
        
        console.log('\n📤 DeepSeek Chat Request:');
        console.log(`   Model: ${model || 'deepseek-chat'}`);
        console.log(`   Messages: ${messages?.length || 0}`);
        console.log(`   Content: ${messages?.[0]?.content?.substring(0, 50)}...`);
        
        // Build request body for DeepSeek's API
        const requestBody = {
          model: model || 'deepseek-chat',
          messages: messages || [],
          stream: stream || false,
          temperature: temperature || 0.7,
          max_tokens: max_tokens || 2048
        };

        // Send to DeepSeek API
        const response = await this.sendToDeepSeek(requestBody);
        
        console.log('✅ Response received from DeepSeek\n');
        
        // Format response to match OpenAI format
        res.json({
          id: `chatcmpl-${Date.now()}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: model || 'deepseek-chat',
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: response.content || response.message || JSON.stringify(response)
            },
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
          }
        });
        
      } catch (error) {
        console.error('\n❌ DeepSeek Proxy Error:', error.message);
        
        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Data:', JSON.stringify(error.response.data, null, 2));
          
          res.status(error.response.status).json(error.response.data);
        } else {
          res.status(500).json({
            error: {
              message: error.message || 'DeepSeek proxy error',
              type: 'deepseek_proxy_error'
            }
          });
        }
      }
    });

    // Session info
    this.app.get('/session', (req, res) => {
      res.json({
        url: this.sessionData.url,
        timestamp: new Date(this.sessionData.timestamp).toISOString(),
        cookiesCount: this.sessionData.cookies?.length || 0,
        localStorageItems: Object.keys(this.sessionData.localStorage || {}).length,
        sessionId: this.sessionData.sessionId,
        hasPowChallenge: !!this.sessionData.powChallenge
      });
    });
  }

  async sendToDeepSeek(requestBody) {
    // Build headers with authentication
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    // Add cookies from session
    if (this.sessionData.cookies && this.sessionData.cookies.length > 0) {
      const cookieString = this.sessionData.cookies
        .map(c => `${c.name}=${c.value}`)
        .join('; ');
      headers['Cookie'] = cookieString;
    }

    // Add device ID from localStorage if available
    const deviceId = this.sessionData.localStorage?.device_id || 
                     this.sessionData.localStorage?.did ||
                     this.sessionData.sessionId;
    
    console.log('\n🔐 Authentication:');
    console.log(`   Cookies: ${this.sessionData.cookies?.length || 0}`);
    console.log(`   Device ID: ${deviceId}`);
    
    // Make the request to DeepSeek
    const url = `${this.baseUrl}${this.chatEndpoint}`;
    console.log(`\n🎯 Sending to: ${url}`);
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2).substring(0, 200) + '...\n');

    try {
      const response = await axios.post(url, requestBody, {
        headers,
        timeout: 120000,
        validateStatus: () => true // Don't throw on any status
      });

      console.log('📥 Response status:', response.status);
      console.log('📦 Response data:', JSON.stringify(response.data, null, 2).substring(0, 500));
      
      if (response.status >= 400) {
        console.error('❌ Error response:', JSON.stringify(response.data, null, 2).substring(0, 500));
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      return response.data;
      
    } catch (error) {
      console.error('Network error:', error.message);
      throw error;
    }
  }

  async start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log('\n' + '='.repeat(60));
        console.log('🚀 DeepSeek Proxy is LIVE!\n');
        console.log(`📡 URL: http://localhost:${this.port}`);
        console.log(`🎯 Target: ${this.baseUrl}${this.chatEndpoint}`);
        console.log(`🍪 Session Cookies: ${this.sessionData.cookies?.length || 0}`);
        console.log(`💾 LocalStorage: ${Object.keys(this.sessionData.localStorage || {}).length} items`);
        console.log(`🆔 Session ID: ${this.sessionData.sessionId}\n`);
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
    if (this.server) {
      await this.server.close();
      console.log('\n🔒 DeepSeek Proxy stopped\n');
    }
  }
}

// Main execution
async function main() {
  console.log('='.repeat(60));
  console.log('🚀 Starting DeepSeek Proxy...');
  console.log('='.repeat(60));
  console.log('');

  // Load session - use absolute path
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
  const proxy = new DeepSeekProxy(sessionData, 8787);
  await proxy.start();
}

main().catch(console.error);
