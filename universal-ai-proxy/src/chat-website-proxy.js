import express from 'express';
import axios from 'axios';
import { BrowserAuthManager } from './browser-auth.js';

/**
 * Chat Website Proxy Server
 * Proxies requests using browser session authentication
 */
export class ChatWebsiteProxy {
  constructor(sessionData, port = 8787) {
    this.sessionData = sessionData;
    this.port = port;
    this.app = express();
    this.authManager = null;
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
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
        proxy: 'running',
        target: this.sessionData.url,
        cookiesCount: this.sessionData.cookies?.length || 0,
        hasTokens: this.sessionData.authTokens?.length > 0
      });
    });

    // Main chat endpoint - tries to extract API from website
    this.app.post('/v1/chat/completions', async (req, res) => {
      try {
        console.log(`📤 Request: ${req.body.messages?.[0]?.content?.substring(0, 50)}...`);
        
        const response = await this.sendChatRequest(req.body);
        
        console.log(`✅ Response received`);
        res.json(response);
      } catch (error) {
        console.error('❌ Proxy error:', error.message);
        
        if (error.response) {
          res.status(error.response.status).json(error.response.data);
        } else {
          res.status(500).json({
            error: {
              message: error.message || 'Proxy error',
              type: 'proxy_error'
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
        authTokens: this.sessionData.authTokens?.map(t => t.name) || []
      });
    });

    // Refresh session (re-login)
    this.app.post('/refresh', async (req, res) => {
      try {
        console.log('🔄 Refreshing session...\n');
        
        const authManager = new BrowserAuthManager(this.sessionData.url);
        await authManager.login(null, null); // Manual login
        
        this.sessionData = authManager.sessionData;
        
        res.json({
          status: 'success',
          message: 'Session refreshed',
          newExpiry: new Date(this.sessionData.timestamp).toISOString()
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          message: error.message
        });
      }
    });
  }

  async sendChatRequest(messageData) {
    // This depends on the specific website's API structure
    // We'll use the session data to make authenticated requests
    
    const headers = {
      'Content-Type': 'application/json'
    };

    // If we found auth tokens, use them
    if (this.sessionData.authTokens && this.sessionData.authTokens.length > 0) {
      const token = this.sessionData.authTokens[0];
      
      if (token.type === 'cookie') {
        // For cookie-based auth, we need to include cookies in request
        headers['Cookie'] = this.sessionData.cookies
          .map(c => `${c.name}=${c.value}`)
          .join('; ');
      } else if (token.type === 'localStorage') {
        // For token-based auth
        headers['Authorization'] = `Bearer ${token.value}`;
      }
    }

    // Try to detect the website's API endpoint
    const apiUrl = await this.detectApiEndpoint();
    
    console.log(`🎯 Using API: ${apiUrl}`);

    // Make the request with session authentication
    const response = await axios.post(apiUrl, messageData, {
      headers,
      timeout: 60000
    });

    return response.data;
  }

  async detectApiEndpoint() {
    // Common API patterns for chat websites
    const domain = new URL(this.sessionData.url).hostname;
    
    const apiPatterns = [
      `https://${domain}/api/v1/chat/completions`,
      `https://api.${domain}/v1/chat/completions`,
      `https://${domain}/v1/chat/completions`,
      `https://${domain}/backend-api/conversation`,
      `https://${domain}/api/chat`
    ];

    console.log('🔍 Detecting API endpoint...\n');

    // Try each pattern with a simple OPTIONS request
    for (const url of apiPatterns) {
      try {
        console.log(`Trying: ${url}`);
        
        // Build auth headers from session
        const headers = { 'Content-Type': 'application/json' };
        
        if (this.sessionData.cookies && this.sessionData.cookies.length > 0) {
          headers['Cookie'] = this.sessionData.cookies
            .map(c => `${c.name}=${c.value}`)
            .join('; ');
        }
        
        const testResponse = await axios.options(url, { 
          headers,
          timeout: 3000 
        });
        
        if (testResponse.status === 200 || testResponse.status === 204) {
          console.log(`✅ Found working endpoint: ${url}\n`);
          return url;
        }
      } catch (error) {
        // Try next URL
        continue;
      }
    }

    // If no OPTIONS worked, try POST with minimal payload
    console.log('\n⚠️  OPTIONS requests failed, trying POST...\n');
    
    for (const url of apiPatterns) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        
        if (this.sessionData.cookies && this.sessionData.cookies.length > 0) {
          headers['Cookie'] = this.sessionData.cookies
            .map(c => `${c.name}=${c.value}`)
            .join('; ');
        }
        
        const testResponse = await axios.post(url, {
          model: 'test',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        }, { headers, timeout: 5000 });
        
        // If we get any response other than 404, this might be the endpoint
        if (testResponse.status !== 404) {
          console.log(`✅ Found potential endpoint: ${url}\n`);
          return url;
        }
      } catch (error) {
        continue;
      }
    }

    // Default to most common pattern
    const defaultUrl = `https://${domain}/api/v1/chat/completions`;
    console.log(`⚠️  Using default endpoint: ${defaultUrl}\n`);
    return defaultUrl;
  }

  start() {
    return new Promise((resolve) => {
      const server = this.app.listen(this.port, () => {
        console.log('\n🚀 Chat Website Proxy is running!');
        console.log(`📡 Listening on: http://localhost:${this.port}`);
        console.log(`🎯 Target Website: ${this.sessionData.url}`);
        console.log(`🍪 Session Cookies: ${this.sessionData.cookies?.length || 0}`);
        console.log(`🎯 Auth Tokens: ${this.sessionData.authTokens?.length || 0}`);
        console.log('\n💡 Test it with:');
        console.log(`   curl http://localhost:${this.port}/health\n`);
        
        resolve(server);
      });
    });
  }
}

export default ChatWebsiteProxy;
