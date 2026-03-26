import { chromium } from 'playwright';
import fs from 'fs';

/**
 * Browser-Based Auth Manager
 * Automates login to chat websites and extracts session tokens
 */
export class BrowserAuthManager {
  constructor(websiteUrl) {
    this.websiteUrl = websiteUrl;
    this.browser = null;
    this.context = null;
    this.page = null;
    // Store final config
    this.sessionData = {
      url: this.websiteUrl,
      timestamp: Date.now(),
      cookies: [],
      localStorage: {},
      sessionStorage: {},
      username: username, // Save for auto-refresh
      password: password  // Save for auto-refresh (encrypted in real app)
    };
  }

  /**
   * Launch browser and login to the chat website
   */
  async login(username, password, customSelector = null) {
    console.log('🌐 Launching browser...\n');
    
    try {
      // Launch browser
      this.browser = await chromium.launch({ 
        headless: false, // Show browser so user can see what's happening
        args: ['--window-size=1280,900']
      });

      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 900 }
      });

      this.page = await this.context.newPage();

      console.log(`📍 Navigating to: ${this.websiteUrl}\n`);
      await this.page.goto(this.websiteUrl, { waitUntil: 'networkidle' });

      // Wait a bit for page to load
      await this.sleep(2000);

      // Auto-detect login form or use custom selectors
      const selectors = customSelector || await this.detectLoginForm();

      console.log('⌨️  Filling login form...\n');
      
      if (selectors.usernameSelector) {
        await this.page.fill(selectors.usernameSelector, username);
      } else {
        console.log('⚠️  Manual login required - type your credentials in the browser\n');
        console.log('I\'ll wait for you to login manually...\n');
        
        // Wait for user to login manually
        await this.waitForManualLogin();
      }

      if (selectors.passwordSelector) {
        await this.page.fill(selectors.passwordSelector, password);
      }

      // Click submit button
      if (selectors.submitSelector) {
        console.log('🔘 Clicking login button...\n');
        await this.page.click(selectors.submitSelector);
        
        // Wait for navigation after login
        await this.page.waitForLoadState('networkidle');
        await this.sleep(3000);
      }

      // Extract session data
      console.log('🍪 Extracting session cookies and tokens...\n');
      this.sessionData = await this.extractSessionData();

      console.log('✅ Login successful!\n');
      
      return this.sessionData;

    } catch (error) {
      console.error('❌ Login failed:', error.message);
      throw error;
    }
  }

  /**
   * Auto-detect login form selectors
   */
  async detectLoginForm() {
    console.log('🔍 Detecting login form...\n');

    // Common selector patterns
    const commonSelectors = [
      {
        name: 'Standard Email/Password',
        usernameSelector: 'input[type="email"], input[name="email"], input[id="email"], #username',
        passwordSelector: 'input[type="password"], input[name="password"], input[id="password"]',
        submitSelector: 'button[type="submit"], input[type="submit"], .login-button, #login-btn'
      },
      {
        name: 'Username Only',
        usernameSelector: 'input[type="text"], input[name="username"], input[id="username"]',
        passwordSelector: 'input[type="password"]',
        submitSelector: 'button[type="submit"]'
      }
    ];

    for (const pattern of commonSelectors) {
      const usernameField = await this.page.$(pattern.usernameSelector);
      const passwordField = await this.page.$(pattern.passwordSelector);

      if (usernameField && passwordField) {
        console.log(`✅ Found: ${pattern.name}\n`);
        return pattern;
      }
    }

    console.log('⚠️  Could not auto-detect login form\n');
    console.log('💡 You can provide custom selectors or login manually\n');
    
    return {
      usernameSelector: null,
      passwordSelector: null,
      submitSelector: null
    };
  }

  /**
   * Wait for user to login manually in browser
   */
  async waitForManualLogin() {
    return new Promise((resolve) => {
      console.log('👀 Waiting for you to login in the browser...\n');
      console.log('Once logged in, press ENTER in terminal to continue...\n');
      
      process.stdin.once('data', () => {
        resolve();
      });
    });
  }

  /**
   * Extract session cookies and localStorage data
   */
  async extractSessionData() {
    const sessionData = {
      url: this.websiteUrl,
      timestamp: Date.now(),
      cookies: [],
      localStorage: {},
      sessionStorage: {}
    };

    // Extract cookies
    const cookies = await this.context.cookies();
    sessionData.cookies = cookies.map(c => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      expires: c.expires
    }));

    // Extract localStorage
    sessionData.localStorage = await this.page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });

    // Extract sessionStorage
    sessionData.sessionStorage = await this.page.evaluate(() => {
      const data = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        data[key] = sessionStorage.getItem(key);
      }
      return data;
    });

    // Find authentication tokens
    sessionData.authTokens = this.findAuthTokens(sessionData);

    console.log(`📊 Found ${cookies.length} cookies`);
    console.log(`📊 Found ${Object.keys(sessionData.localStorage).length} localStorage items`);
    if (sessionData.authTokens.length > 0) {
      console.log(`🎯 Found ${sessionData.authTokens.length} auth tokens!`);
    }

    return sessionData;
  }

  /**
   * Find authentication tokens in cookies/storage
   */
  findAuthTokens(sessionData) {
    const authPatterns = [
      /token/i,
      /auth/i,
      /session/i,
      /jwt/i,
      /access/i,
      /refresh/i,
      /bearer/i
    ];

    const tokens = [];

    // Check cookies
    sessionData.cookies.forEach(cookie => {
      if (authPatterns.some(p => p.test(cookie.name))) {
        tokens.push({
          type: 'cookie',
          name: cookie.name,
          value: cookie.value
        });
      }
    });

    // Check localStorage
    Object.keys(sessionData.localStorage).forEach(key => {
      if (authPatterns.some(p => p.test(key))) {
        tokens.push({
          type: 'localStorage',
          name: key,
          value: sessionData.localStorage[key]
        });
      }
    });

    return tokens;
  }

  /**
   * Save session to file
   */
  saveSession(filePath) {
    fs.writeFileSync(filePath, JSON.stringify(this.sessionData, null, 2));
    console.log(`💾 Session saved to: ${filePath}\n`);
  }

  /**
   * Load session from file
   */
  static loadSession(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }

  /**
   * Restore session (reuse existing login)
   */
  async restoreSession(sessionData) {
    console.log('🔄 Restoring previous session...\n');
    
    await this.context.addCookies(sessionData.cookies || []);
    
    // Navigate to site to apply localStorage
    await this.page.goto(sessionData.url, { waitUntil: 'networkidle' });
    
    // Set localStorage
    await this.page.evaluate((storage) => {
      Object.keys(storage).forEach(key => {
        localStorage.setItem(key, storage[key]);
      });
    }, sessionData.localStorage || {});

    console.log('✅ Session restored!\n');
  }

  /**
   * Check if session is still valid
   */
  async checkSession() {
    try {
      await this.page.reload({ waitUntil: 'networkidle' });
      await this.sleep(2000);
      
      // Check if we're still on the same URL (not redirected to login)
      const currentUrl = this.page.url();
      
      if (currentUrl.includes('/login') || currentUrl.includes('/signin')) {
        console.log('❌ Session expired - redirected to login page\n');
        return false;
      }

      console.log('✅ Session still valid\n');
      return true;
    } catch (error) {
      console.error('❌ Session check failed:', error.message);
      return false;
    }
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

export default BrowserAuthManager;
