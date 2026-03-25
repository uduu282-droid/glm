/**
 * OpenSourceGen - Terminal Client
 * 
 * A command-line client for interacting with OpenSourceGen API
 * Supports image generation, downloads, and account management
 * 
 * Usage: node opensourcegen-terminal.js
 */

const axios = require('axios');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

class OpenSourceGenTerminal {
  constructor() {
    this.baseUrl = 'https://opensourcegen.com';
    this.apiKey = null;
    this.fingerprint = null;
    this.authenticated = false;
    
    // Setup readline for interactive prompts
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Generate a simple device fingerprint
   */
  generateFingerprint() {
    // Simple fingerprint based on timestamp and random data
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `terminal_${timestamp}_${random}`;
  }

  /**
   * Initialize and authenticate with OpenSourceGen
   */
  async initialize() {
    console.log('🔑 Initializing OpenSourceGen Terminal Client...\n');
    
    try {
      // Generate fingerprint
      this.fingerprint = this.generateFingerprint();
      console.log(`📱 Device Fingerprint: ${this.fingerprint}`);
      
      // Register with the service
      console.log('🔄 Registering device...');
      const response = await axios.post(
        `${this.baseUrl}/api/osg-register`,
        {
          fingerprint: this.fingerprint
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'OpenSourceGen-Terminal/1.0'
          }
        }
      );
      
      if (response.data && (response.data.apiKey || response.data.token)) {
        this.apiKey = response.data.apiKey || response.data.token;
        this.authenticated = true;
        console.log('✅ Authentication successful!\n');
        
        // Save session to file
        this.saveSession();
        
        return true;
      } else {
        console.log('❌ Registration failed - no API key received');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return false;
      }
      
    } catch (error) {
      console.error('❌ Initialization error:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
      return false;
    }
  }

  /**
   * Check API health
   */
  async checkHealth() {
    console.log('\n🏥 Checking API Health...\n');
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/health`);
      console.log('✅ Health Status:', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      return null;
    }
  }

  /**
   * Get user account information
   */
  async getAccountInfo() {
    if (!this.authenticated) {
      console.log('❌ Not authenticated. Run "init" first.');
      return null;
    }
    
    console.log('\n👤 Fetching Account Information...\n');
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/user/account`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'OpenSourceGen-Terminal/1.0'
        }
      });
      
      console.log('Account Details:');
      console.log(JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get account info:', error.message);
      if (error.response?.status === 401) {
        console.log('⚠️  Session expired. Please re-authenticate.');
        this.authenticated = false;
      }
      return null;
    }
  }

  /**
   * Generate an image from text prompt
   */
  async generateImage(prompt, options = {}) {
    if (!this.authenticated) {
      console.log('❌ Not authenticated. Run "init" first.');
      return null;
    }
    
    console.log('\n🎨 Generating Image...\n');
    console.log(`Prompt: ${prompt}`);
    console.log(`Model: ${options.model || 'flux'}`);
    console.log(`Size: ${options.width || 1024}x${options.height || 1024}\n`);
    
    try {
      // Note: The actual endpoint might be /api/generate or similar
      // This needs to be verified with the actual API
      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          prompt: prompt,
          model: options.model || 'flux',
          width: options.width || 1024,
          height: options.height || 1024,
          steps: options.steps || 20,
          guidance: options.guidance || 7.5
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'OpenSourceGen-Terminal/1.0'
          }
        }
      );
      
      console.log('✅ Generation successful!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      
      // If imageUrl is in response, offer to download
      if (response.data.imageUrl || response.data.url) {
        const imageUrl = response.data.imageUrl || response.data.url;
        console.log(`\n📥 Image URL: ${imageUrl}`);
        
        // Ask if user wants to download
        return new Promise((resolve) => {
          this.rl.question('\nDownload this image? (y/n): ', (answer) => {
            if (answer.toLowerCase() === 'y') {
              this.downloadMedia(imageUrl).then(resolve);
            } else {
              resolve(response.data);
            }
          });
        });
      }
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Generation failed:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
      }
      return null;
    }
  }

  /**
   * Download media from URL
   */
  async downloadMedia(url) {
    console.log('\n📥 Downloading Media...\n');
    console.log(`URL: ${url}`);
    
    try {
      // Use the download endpoint
      const downloadUrl = `${this.baseUrl}/api/user/media/download?url=${encodeURIComponent(url)}`;
      
      const response = await axios.get(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'OpenSourceGen-Terminal/1.0'
        },
        responseType: 'arraybuffer'
      });
      
      // Save to file
      const filename = `downloaded_${Date.now()}.png`;
      const filepath = path.join(process.cwd(), filename);
      
      fs.writeFileSync(filepath, response.data);
      
      console.log(`✅ Downloaded to: ${filepath}`);
      console.log(`File size: ${(response.data.length / 1024).toFixed(2)} KB\n`);
      
      return filepath;
      
    } catch (error) {
      console.error('❌ Download failed:', error.message);
      return null;
    }
  }

  /**
   * List user's media
   */
  async listMedia(page = 1, limit = 10) {
    if (!this.authenticated) {
      console.log('❌ Not authenticated. Run "init" first.');
      return null;
    }
    
    console.log('\n📋 Listing Your Media...\n');
    
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      const response = await axios.get(
        `${this.baseUrl}/api/user/media?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'User-Agent': 'OpenSourceGen-Terminal/1.0'
          }
        }
      );
      
      console.log('Your Media:');
      console.log(JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('❌ Failed to list media:', error.message);
      return null;
    }
  }

  /**
   * Save session to file
   */
  saveSession() {
    const sessionData = {
      apiKey: this.apiKey,
      fingerprint: this.fingerprint,
      authenticated: this.authenticated,
      timestamp: Date.now()
    };
    
    const sessionFile = path.join(process.cwd(), 'opensourcegen-session.json');
    fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
    console.log(`💾 Session saved to: ${sessionFile}\n`);
  }

  /**
   * Load session from file
   */
  loadSession() {
    const sessionFile = path.join(process.cwd(), 'opensourcegen-session.json');
    
    if (fs.existsSync(sessionFile)) {
      const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
      
      // Check if session is still valid (less than 24 hours old)
      const age = Date.now() - sessionData.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (age < maxAge) {
        this.apiKey = sessionData.apiKey;
        this.fingerprint = sessionData.fingerprint;
        this.authenticated = sessionData.authenticated;
        console.log('✅ Loaded existing session\n');
        return true;
      } else {
        console.log('⚠️  Session expired\n');
        fs.unlinkSync(sessionFile);
      }
    }
    return false;
  }

  /**
   * Interactive command loop
   */
  async startInteractiveMode() {
    console.log('\n🚀 OpenSourceGen Terminal Client');
    console.log('=' .repeat(70));
    console.log('Commands:');
    console.log('  init          - Initialize and authenticate');
    console.log('  health        - Check API health');
    console.log('  account       - Show account information');
    console.log('  generate      - Generate an image');
    console.log('  list          - List your media');
    console.log('  download [URL] - Download media from URL');
    console.log('  help          - Show this help');
    console.log('  exit          - Exit the client');
    console.log('=' .repeat(70));
    
    // Try to load existing session
    if (this.loadSession()) {
      console.log('Ready! Type "account" to test connection or "generate" to create.\n');
    } else {
      console.log('Type "init" to start.\n');
    }
    
    const commandLoop = async () => {
      return new Promise((resolve) => {
        this.rl.question('\n📝 opensourcegen> ', async (input) => {
          const args = input.trim().split(/\s+/);
          const command = args[0].toLowerCase();
          
          switch (command) {
            case 'init':
              await this.initialize();
              break;
              
            case 'health':
              await this.checkHealth();
              break;
              
            case 'account':
              await this.getAccountInfo();
              break;
              
            case 'generate':
              if (args.length > 1) {
                const prompt = args.slice(1).join(' ');
                await this.generateImage(prompt);
              } else {
                // Interactive prompt
                this.rl.question('Enter prompt: ', async (prompt) => {
                  await this.generateImage(prompt);
                  commandLoop();
                });
                return;
              }
              break;
              
            case 'list':
              await this.listMedia();
              break;
              
            case 'download':
              if (args.length > 1) {
                const url = args.slice(1).join(' ');
                await this.downloadMedia(url);
              } else {
                console.log('Usage: download [image-url]');
              }
              break;
              
            case 'help':
              console.log('\nCommands:');
              console.log('  init          - Initialize and authenticate');
              console.log('  health        - Check API health');
              console.log('  account       - Show account information');
              console.log('  generate      - Generate an image');
              console.log('  list          - List your media');
              console.log('  download [URL] - Download media from URL');
              console.log('  help          - Show this help');
              console.log('  exit          - Exit the client');
              break;
              
            case 'exit':
            case 'quit':
              console.log('Goodbye! 👋\n');
              this.rl.close();
              resolve();
              return;
              
            default:
              if (command) {
                console.log(`Unknown command: ${command}. Type "help" for commands.`);
              }
          }
          
          commandLoop();
        });
      });
    };
    
    await commandLoop();
  }
}

// Main execution
(async () => {
  const client = new OpenSourceGenTerminal();
  await client.startInteractiveMode();
})();
