import inquirer from 'inquirer';
import { BrowserAuthManager } from './browser-auth.js';
import { ChatWebsiteProxy } from './chat-website-proxy.js';
import { AutoSessionManager } from './auto-session-manager.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Main Application - Chat Website Proxy
 */
class ChatWebsiteProxyApp {
  constructor() {
    this.configPath = path.join(__dirname, '../sessions/');
    this.sessionFile = null;
  }

  async start(websiteUrl) {
    console.log('\n🌐 Universal Chat Website Proxy v1.0\n');
    console.log('=' .repeat(60) + '\n');

    try {
      // Ensure sessions directory exists
      if (!fs.existsSync(this.configPath)) {
        fs.mkdirSync(this.configPath, { recursive: true });
      }

      this.sessionFile = path.join(this.configPath, `${this.getDomain(websiteUrl)}.json`);

      // Check for existing session
      let sessionData = null;
      
      if (fs.existsSync(this.sessionFile)) {
        console.log('💾 Found saved session!\n');
        
        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'reuseSession',
            message: 'Reuse existing session?',
            default: true
          }
        ]);

        if (answers.reuseSession) {
          sessionData = JSON.parse(fs.readFileSync(this.sessionFile, 'utf8'));
          console.log(`✅ Loaded session for: ${sessionData.url}\n`);
        }
      }

      // If no session or user chose not to reuse
      if (!sessionData) {
        console.log('🔐 Setting up new login session...\n');
        
        // Get login credentials
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'username',
            message: 'Enter your username/email:',
            validate: (input) => input.length > 0 || 'Username required'
          },
          {
            type: 'password',
            name: 'password',
            message: 'Enter your password:',
            mask: '*',
            validate: (input) => input.length >= 3 || 'Password must be at least 3 characters'
          },
          {
            type: 'confirm',
            name: 'customSelectors',
            message: 'Use custom login form selectors? (for non-standard sites)',
            default: false
          }
        ]);

        let customSelectors = null;
        if (answers.customSelectors) {
          const selectorAnswers = await inquirer.prompt([
            {
              type: 'input',
              name: 'usernameSelector',
              message: 'Username field CSS selector:',
              default: 'input[type="email"]'
            },
            {
              type: 'input',
              name: 'passwordSelector',
              message: 'Password field CSS selector:',
              default: 'input[type="password"]'
            },
            {
              type: 'input',
              name: 'submitSelector',
              message: 'Submit button CSS selector:',
              default: 'button[type="submit"]'
            }
          ]);
          
          customSelectors = selectorAnswers;
        }

        // Launch browser and login
        const authManager = new BrowserAuthManager(websiteUrl);
        
        try {
          sessionData = await authManager.login(
            answers.username, 
            answers.password,
            customSelectors
          );
          
          // Save session
          authManager.saveSession(this.sessionFile);
          
        } finally {
          await authManager.close();
        }
      }

      // Start the proxy server
      console.log('🚀 Starting proxy server...\n');
      const proxy = new ChatWebsiteProxy(sessionData);
      await proxy.start();

      console.log('='.repeat(60) + '\n');
      console.log('✨ Your chat website is now proxied!\n');
      console.log('📊 Session Info:');
      console.log(`   Website: ${sessionData.url}`);
      console.log(`   Cookies: ${sessionData.cookies?.length || 0}`);
      console.log(`   Auth Tokens: ${sessionData.authTokens?.length || 0}`);
      console.log(`   Saved: ${this.sessionFile}\n`);
      
      // Ask if user wants auto-refresh
      const { enableAutoRefresh } = await inquirer.prompt([{
        type: 'confirm',
        name: 'enableAutoRefresh',
        message: 'Enable auto-session refresh? (like Qwen - re-login when expired)',
        default: true
      }]);

      if (enableAutoRefresh && sessionData.username && sessionData.password) {
        console.log('\n🔄 Starting auto-session manager...\n');
        
        const autoManager = new AutoSessionManager(
          sessionData.url,
          { 
            username: sessionData.username, 
            password: sessionData.password 
          }
        );
        
        autoManager.startMonitoring(sessionData);
        
        console.log('✅ Auto-refresh enabled!');
        console.log('   Will check session every 5 minutes\n');
      } else if (enableAutoRefresh) {
        console.log('\n⚠️  Cannot enable auto-refresh without saved credentials');
        console.log('   Next time, login will save credentials for auto-refresh\n');
      }
      
      console.log('💡 Usage:\n');
      console.log(`   POST http://localhost:8787/v1/chat/completions`);
      console.log(`   Body: {"model": "default", "messages": [{"role": "user", "content": "Hello"}]}\n`);
      
      console.log('⚠️  To refresh session (when expired):');
      console.log(`   POST http://localhost:8787/refresh\n`);

    } catch (error) {
      console.error('\n❌ Error:', error.message);
      console.error('\nStack:', error.stack);
      console.error('\n💡 Make sure you provided correct credentials and the website URL is valid\n');
    }
  }

  getDomain(url) {
    try {
      const domain = new URL(url).hostname.replace(/\./g, '_');
      return domain;
    } catch {
      return 'unknown';
    }
  }

  showUsage() {
    console.log('Usage:');
    console.log('  node src/index.js <CHAT_WEBSITE_URL>\n');
    console.log('Examples:');
    console.log('  node src/index.js https://chat.openai.com');
    console.log('  node src/index.js https://chat.deepseek.com');
    console.log('  node src/index.js https://claude.ai');
    console.log('  node src/index.js https://poe.com\n');
    console.log('Options:');
    console.log('  --clear     Clear all saved sessions');
    console.log('  --help      Show this help message\n');
  }

  clearSessions() {
    if (fs.existsSync(this.configPath)) {
      const files = fs.readdirSync(this.configPath);
      files.forEach(file => {
        fs.unlinkSync(path.join(this.configPath, file));
      });
      console.log('✅ All sessions cleared!\n');
    } else {
      console.log('ℹ️  No saved sessions found\n');
    }
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  const app = new ChatWebsiteProxyApp();
  app.showUsage();
  process.exit(0);
}

if (args.includes('--clear')) {
  const app = new ChatWebsiteProxyApp();
  app.clearSessions();
  process.exit(0);
}

const websiteUrl = args.find(arg => arg.startsWith('http'));

if (!websiteUrl) {
  const app = new ChatWebsiteProxyApp();
  app.showUsage();
  process.exit(1);
}

// Start the application
const app = new ChatWebsiteProxyApp();
app.start(websiteUrl);
