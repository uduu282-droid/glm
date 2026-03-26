import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * DeepSeek Authentication Manager
 * Handles the complete auth flow including:
 * - Guest challenge
 * - Email verification
 * - Login/Register
 * - PoW (Proof of Work) challenge
 * - Session management
 */
export class DeepSeekAuth {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.sessionData = {
      url: 'https://chat.deepseek.com',
      timestamp: Date.now(),
      cookies: [],
      localStorage: {},
      credentials: null,
      powChallenge: null,
      sessionId: null
    };
  }

  /**
   * Complete login flow with email/password
   */
  async login(email, password) {
    console.log('🔐 Starting DeepSeek Authentication Flow...\n');
    
    try {
      // Step 1: Launch browser
      await this.launchBrowser();
      
      // Step 2: Navigate to DeepSeek
      await this.navigateToDeepSeek();
      
      // Step 3: Handle guest challenge (if needed)
      await this.handleGuestChallenge();
      
      // Step 4: Login with email/password
      await this.performLogin(email, password);
      
      // Step 5: Wait for successful login
      await this.waitForLoginSuccess();
      
      // Step 6: Extract session data
      await this.extractSessionData();
      
      // Step 7: Handle PoW challenge preparation
      await this.preparePoWChallenge();
      
      console.log('✅ Authentication completed successfully!\n');
      
      return this.sessionData;
      
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      throw error;
    }
  }

  /**
   * Launch browser with proper configuration
   */
  async launchBrowser() {
    console.log('1. 🌐 Launching browser...\n');
    
    this.browser = await chromium.launch({
      headless: false,
      args: [
        '--window-size=1280,900',
        '--disable-blink-features=AutomationControlled'
      ]
    });
    
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
    
    console.log('   ✅ Browser launched\n');
  }

  /**
   * Navigate to DeepSeek chat
   */
  async navigateToDeepSeek() {
    console.log('2. 📍 Navigating to chat.deepseek.com...\n');
    
    await this.page.goto('https://chat.deepseek.com', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    await this.sleep(3000);
    console.log('   ✅ Navigation complete\n');
  }

  /**
   * Handle guest challenge (DeepSeek may require this before login)
   */
  async handleGuestChallenge() {
    console.log('3. 🔍 Checking for guest challenge...\n');
    
    try {
      // Look for guest challenge or any initial dialogs
      const guestButton = await this.page.$('button:has-text("Continue as Guest")');
      if (guestButton) {
        console.log('   ⚠️  Guest option found, but we\'ll use email login\n');
      }
      
      // Check if already logged in
      const chatInput = await this.page.$('textarea[placeholder*="message"], #chat-input');
      if (chatInput) {
        console.log('   ✅ Already logged in!\n');
        return true;
      }
      
      console.log('   ℹ️  No guest challenge detected, proceeding to login\n');
      
    } catch (error) {
      console.log('   ⚠️  Guest challenge check skipped\n');
    }
  }

  /**
   * Perform login with email and password
   */
  async performLogin(email, password) {
    console.log('4. ⌨️  Performing login...\n');
    
    // Store credentials
    this.sessionData.credentials = { email, password };
    
    // Try to find login button/link first
    const loginSelectors = [
      'a:has-text("Login")',
      'a:has-text("Sign In")',
      'button:has-text("Login")',
      'button:has-text("Sign In")',
      '[data-testid="login"]',
      '.login-btn'
    ];
    
    let loginClicked = false;
    for (const selector of loginSelectors) {
      try {
        const loginElement = await this.page.$(selector);
        if (loginElement) {
          console.log(`   🔘 Clicking login button: ${selector}\n`);
          await loginElement.click();
          await this.sleep(2000);
          loginClicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!loginClicked) {
      console.log('   ℹ️  May already be on login page\n');
    }
    
    // Wait for login form to appear
    await this.sleep(2000);
    
    // Find and fill email field
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[placeholder*="Email"]',
      '#email',
      '#username'
    ];
    
    let emailFilled = false;
    for (const selector of emailSelectors) {
      try {
        const emailField = await this.page.$(selector);
        if (emailField) {
          console.log(`   📧 Filling email field\n`);
          await emailField.fill(email);
          emailFilled = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!emailFilled) {
      console.log('   ⚠️  Could not find email field - manual login may be required\n');
    }
    
    // Find and fill password field
    const passwordField = await this.page.$('input[type="password"]');
    if (passwordField) {
      console.log('   🔑 Filling password\n');
      await passwordField.fill(password);
    } else {
      console.log('   ⚠️  Could not find password field\n');
    }
    
    // Find and click submit button
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Sign In")',
      'button:has-text("Login")',
      '.login-button'
    ];
    
    for (const selector of submitSelectors) {
      try {
        const submitButton = await this.page.$(selector);
        if (submitButton) {
          console.log(`   🔘 Submitting login form\n`);
          await submitButton.click();
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    console.log('   ⏳ Waiting for authentication...\n');
    await this.sleep(5000);
  }

  /**
   * Wait for login to succeed
   */
  async waitForLoginSuccess() {
    console.log('5. ⏳ Verifying login success...\n');
    
    // Wait for navigation
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (e) {
      console.log('   ⚠️  Navigation timeout, checking status...\n');
    }
    
    await this.sleep(3000);
    
    // Check if we're on chat page
    const currentUrl = this.page.url();
    console.log(`   📍 Current URL: ${currentUrl}\n`);
    
    if (currentUrl.includes('/chat') || 
        !currentUrl.includes('/login')) {
      console.log('   ✅ Login successful!\n');
      return true;
    } else {
      console.log('   ⚠️  May still be on login page\n');
      console.log('   💡 Waiting for manual confirmation...\n');
      console.log('   👉 If login failed, please login manually in the browser\n');
      console.log('   Press ENTER when ready...\n');
      
      await this.waitForManualConfirmation();
    }
    
    return true;
  }

  /**
   * Extract session cookies and tokens
   */
  async extractSessionData() {
    console.log('6. 🍪 Extracting session data...\n');
    
    // Extract cookies
    const cookies = await this.context.cookies();
    this.sessionData.cookies = cookies.map(c => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      expires: c.expires
    }));
    
    // Extract localStorage
    this.sessionData.localStorage = await this.page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          data[key] = localStorage.getItem(key);
        }
      }
      return data;
    });
    
    // Extract sessionStorage
    this.sessionData.sessionStorage = await this.page.evaluate(() => {
      const data = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          data[key] = sessionStorage.getItem(key);
        }
      }
      return data;
    });
    
    // Find auth tokens
    const authTokens = this.findAuthTokens();
    
    console.log(`   📊 Found ${cookies.length} cookies\n`);
    console.log(`   📊 Found ${Object.keys(this.sessionData.localStorage).length} localStorage items\n`);
    
    if (authTokens.length > 0) {
      console.log(`   🎯 Found ${authTokens.length} authentication tokens:\n`);
      authTokens.forEach(token => {
        console.log(`      - ${token.type}.${token.name}: ${token.value.substring(0, 50)}...\n`);
      });
    }
    
    // Get session ID from URL or storage
    this.sessionData.sessionId = this.extractSessionId();
  }

  /**
   * Prepare Proof of Work challenge
   */
  async preparePoWChallenge() {
    console.log('7. ⚡ Preparing PoW challenge...\n');
    
    try {
      // The PoW challenge is typically created when starting a chat session
      // We'll capture it from network traffic or localStorage
      
      const powData = await this.page.evaluate(() => {
        // Look for PoW-related data in localStorage
        const keys = Object.keys(localStorage);
        const powKeys = keys.filter(k => /pow|challenge|proof/i.test(k));
        
        const result = {};
        powKeys.forEach(key => {
          result[key] = localStorage.getItem(key);
        });
        
        return result;
      });
      
      if (Object.keys(powData).length > 0) {
        this.sessionData.powChallenge = powData;
        console.log('   ✅ PoW challenge captured\n');
      } else {
        console.log('   ℹ️  PoW will be generated when creating chat session\n');
      }
      
    } catch (error) {
      console.log('   ⚠️  PoW preparation skipped\n');
    }
  }

  /**
   * Find authentication tokens
   */
  findAuthTokens() {
    const authPatterns = [/token/i, /auth/i, /session/i, /jwt/i, /access/i];
    const tokens = [];
    
    // Check cookies
    this.sessionData.cookies.forEach(cookie => {
      if (authPatterns.some(p => p.test(cookie.name))) {
        tokens.push({
          type: 'cookie',
          name: cookie.name,
          value: cookie.value
        });
      }
    });
    
    // Check localStorage
    Object.keys(this.sessionData.localStorage).forEach(key => {
      if (authPatterns.some(p => p.test(key))) {
        tokens.push({
          type: 'localStorage',
          name: key,
          value: this.sessionData.localStorage[key]
        });
      }
    });
    
    return tokens;
  }

  /**
   * Extract session ID
   */
  extractSessionId() {
    // Try to get from URL
    const url = this.page.url();
    const match = url.match(/session=([a-zA-Z0-9-]+)/);
    if (match) return match[1];
    
    // Try localStorage
    const sessionId = this.sessionData.localStorage['session_id'] || 
                      this.sessionData.localStorage['sessionId'];
    if (sessionId) return sessionId;
    
    // Generate DID (Device ID) similar to the network logs
    return `d${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Save session to file
   */
  saveSession(filePath = null) {
    const sessionsDir = path.join(__dirname, '../sessions/');
    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
    }
    
    const sessionFile = filePath || path.join(sessionsDir, 'deepseek_session.json');
    fs.writeFileSync(sessionFile, JSON.stringify(this.sessionData, null, 2));
    
    console.log(`💾 Session saved to: ${sessionFile}\n`);
    return sessionFile;
  }

  /**
   * Load session from file
   */
  static loadSession(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }

  /**
   * Restore session in browser
   */
  async restoreSession(sessionData) {
    console.log('🔄 Restoring previous session...\n');
    
    await this.context.addCookies(sessionData.cookies || []);
    
    await this.page.goto(sessionData.url, { waitUntil: 'networkidle' });
    
    if (sessionData.localStorage) {
      await this.page.evaluate((storage) => {
        Object.keys(storage).forEach(key => {
          localStorage.setItem(key, storage[key]);
        });
      }, sessionData.localStorage);
    }
    
    console.log('✅ Session restored!\n');
  }

  /**
   * Wait for manual confirmation
   */
  async waitForManualConfirmation() {
    return new Promise((resolve) => {
      process.stdin.once('data', () => {
        resolve();
      });
    });
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Browser closed\n');
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export default instance
export default DeepSeekAuth;
