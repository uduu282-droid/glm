import { chromium } from 'playwright';
import axios from 'axios';

/**
 * Auto-Session Refresh Manager
 * Automatically re-login when session expires (like Qwen's auto-refresh)
 */
export class AutoSessionManager {
  constructor(websiteUrl, credentials) {
    this.websiteUrl = websiteUrl;
    this.credentials = credentials; // { username, password }
    this.sessionData = null;
    this.refreshInterval = null;
    this.checkIntervalMs = 5 * 60 * 1000; // Check every 5 minutes
  }

  /**
   * Start monitoring and auto-refreshing session
   */
  startMonitoring(sessionData) {
    this.sessionData = sessionData;
    
    console.log('🔄 Starting auto-session monitor...\n');
    console.log(`Check interval: Every 5 minutes`);
    console.log(`Target: ${this.websiteUrl}\n`);

    // Check session validity periodically
    this.refreshInterval = setInterval(async () => {
      const isValid = await this.checkSessionValidity();
      
      if (!isValid) {
        console.log('⚠️  Session expired! Auto-refreshing...\n');
        await this.autoRefresh();
      } else {
        console.log('✅ Session still valid');
      }
    }, this.checkIntervalMs);

    // Handle graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  /**
   * Check if current session is still valid
   */
  async checkSessionValidity() {
    if (!this.sessionData) return false;

    try {
      // Method 1: Check cookie expiry
      const now = Date.now() / 1000; // Unix timestamp
      const expiredCookies = this.sessionData.cookies.filter(cookie => {
        return cookie.expires && cookie.expires < now;
      });

      if (expiredCookies.length > 0) {
        console.log(`🍪 Found ${expiredCookies.length} expired cookies`);
        return false;
      }

      // Method 2: Make test request to see if authenticated
      const testResult = await this.makeAuthenticatedTestRequest();
      
      if (!testResult.isAuthenticated) {
        console.log('❌ Test request failed - not authenticated');
        return false;
      }

      console.log('✅ Session check passed');
      return true;

    } catch (error) {
      console.error('Session check error:', error.message);
      return false;
    }
  }

  /**
   * Make a test request to verify authentication
   */
  async makeAuthenticatedTestRequest() {
    try {
      // Build headers from session cookies
      const headers = {
        'Cookie': this.sessionData.cookies
          .map(c => `${c.name}=${c.value}`)
          .join('; ')
      };

      // Try to access user profile or chat history
      const domain = new URL(this.websiteUrl).hostname;
      const testUrls = [
        `https://${domain}/api/auth/me`,
        `https://${domain}/api/user`,
        `https://api.${domain}/user/profile`,
        this.websiteUrl
      ];

      for (const url of testUrls) {
        try {
          const response = await axios.get(url, {
            headers,
            timeout: 5000
          });

          // If we get 200 OK, we're authenticated
          if (response.status === 200) {
            return { isAuthenticated: true, url };
          }
        } catch (error) {
          // Try next URL
          continue;
        }
      }

      return { isAuthenticated: false };

    } catch (error) {
      return { isAuthenticated: false };
    }
  }

  /**
   * Automatically refresh the session by re-login
   */
  async autoRefresh() {
    console.log('🔄 Auto-refreshing session...\n');

    let browser;
    
    try {
      // Launch browser (headless for auto-refresh)
      browser = await chromium.launch({
        headless: true, // Run in background
        args: ['--window-size=1280,900']
      });

      const context = await browser.newContext({
        viewport: { width: 1280, height: 900 }
      });

      const page = await context.newPage();

      console.log(`Navigating to: ${this.websiteUrl}`);
      await page.goto(this.websiteUrl, { waitUntil: 'networkidle' });
      await this.sleep(2000);

      // Auto-detect and fill login form
      const selectors = await this.detectLoginForm(page);
      
      if (selectors.usernameSelector && selectors.passwordSelector) {
        console.log('Filling credentials...');
        await page.fill(selectors.usernameSelector, this.credentials.username);
        await page.fill(selectors.passwordSelector, this.credentials.password);
        
        if (selectors.submitSelector) {
          await page.click(selectors.submitSelector);
          await page.waitForLoadState('networkidle');
          await this.sleep(3000);
        }
      } else {
        console.log('⚠️  Could not auto-detect form - manual refresh needed');
        return false;
      }

      // Extract new session data
      console.log('Extracting new session...');
      const newSessionData = await this.extractSessionData(context, page);
      
      this.sessionData = newSessionData;
      
      // Save updated session
      this.saveSession();
      
      console.log('✅ Auto-refresh successful!\n');
      console.log(`New session expires: ${new Date(newSessionData.timestamp).toLocaleString()}\n`);
      
      return true;

    } catch (error) {
      console.error('❌ Auto-refresh failed:', error.message);
      return false;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Detect login form selectors
   */
  async detectLoginForm(page) {
    const commonSelectors = [
      {
        usernameSelector: 'input[type="email"], input[name="email"], #username',
        passwordSelector: 'input[type="password"]',
        submitSelector: 'button[type="submit"]'
      }
    ];

    for (const pattern of commonSelectors) {
      const usernameField = await page.$(pattern.usernameSelector);
      const passwordField = await page.$(pattern.passwordSelector);

      if (usernameField && passwordField) {
        return pattern;
      }
    }

    return {
      usernameSelector: null,
      passwordSelector: null,
      submitSelector: null
    };
  }

  /**
   * Extract session data from browser
   */
  async extractSessionData(context, page) {
    const sessionData = {
      url: this.websiteUrl,
      timestamp: Date.now(),
      cookies: [],
      localStorage: {},
      sessionStorage: {}
    };

    // Extract cookies
    const cookies = await context.cookies();
    sessionData.cookies = cookies.map(c => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      expires: c.expires
    }));

    // Extract localStorage
    sessionData.localStorage = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });

    return sessionData;
  }

  /**
   * Save session to file
   */
  saveSession() {
    const fs = require('fs');
    const path = require('path');
    
    const sessionsDir = path.join(__dirname, '../sessions/');
    const domain = new URL(this.websiteUrl).hostname.replace(/\./g, '_');
    const filePath = path.join(sessionsDir, `${domain}.json`);

    fs.writeFileSync(filePath, JSON.stringify(this.sessionData, null, 2));
    console.log(`💾 Session saved to: ${filePath}`);
  }

  /**
   * Stop monitoring
   */
  stop() {
    console.log('\n⏹️  Stopping auto-session monitor...\n');
    
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default AutoSessionManager;
