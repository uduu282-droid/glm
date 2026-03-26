import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Automated DeepSeek Login Test
 * This simulates what the proxy will do
 */
async function testDeepSeekLogin() {
  console.log('🧪 Testing DeepSeek Chat Website Login...\n');
  
  const credentials = {
    username: 'eres3022@gmail.com',
    password: 'ronit@4550'
  };
  
  let browser;
  
  try {
    // Step 1: Launch browser
    console.log('1. 🌐 Launching browser...');
    browser = await chromium.launch({ 
      headless: false, // Show browser so you can see what's happening
      args: ['--window-size=1280,900']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 }
    });
    
    const page = await context.newPage();
    
    // Step 2: Navigate to DeepSeek
    console.log('2. 📍 Navigating to https://chat.deepseek.com...');
    await page.goto('https://chat.deepseek.com', { waitUntil: 'networkidle' });
    await sleep(3000);
    
    console.log('3. 🔍 Looking for login form...\n');
    
    // Step 3: Try to detect and fill login form
    // Note: DeepSeek might have different login flows
    // This is a demonstration
    
    // Check if we're already on login page or need to click login button
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}\n`);
    
    // Try common login selectors
    const loginSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      '#username',
      'input[placeholder*="email"]',
      'input[placeholder*="Email"]'
    ];
    
    let foundSelector = null;
    
    for (const selector of loginSelectors) {
      const element = await page.$(selector);
      if (element) {
        console.log(`✅ Found login field: ${selector}`);
        foundSelector = selector;
        break;
      }
    }
    
    if (!foundSelector) {
      console.log('⚠️  Could not auto-detect login form.');
      console.log('This is expected - DeepSeek may use OAuth (Google/GitHub login) or have anti-bot measures.\n');
      console.log('ℹ️  The Universal Proxy handles this by:');
      console.log('   - Letting you login manually in the browser\n');
      console.log('   - Waiting for you to press ENTER after successful login\n');
      
      // Wait for manual login
      console.log('👉 Please login manually in the browser window...');
      console.log('Press ENTER in terminal when logged in...\n');
      
      await waitForManualLogin(page);
    } else {
      // Auto-fill if we found the form
      console.log('4. ⌨️  Filling credentials...');
      await page.fill(foundSelector, credentials.username);
      
      // Find password field
      const passwordSelector = 'input[type="password"]';
      await page.fill(passwordSelector, credentials.password);
      
      console.log('5. 🔘 Clicking submit...');
      const submitButton = await page.$('button[type="submit"], input[type="submit"], .login-button');
      if (submitButton) {
        await submitButton.click();
        await sleep(2000);
      }
      
      // Wait for navigation
      console.log('6. ⏳ Waiting for login to complete...');
      await page.waitForLoadState('networkidle');
      await sleep(3000);
    }
    
    // Step 4: Extract session data
    console.log('7. 🍪 Extracting session cookies and tokens...\n');
    
    const cookies = await context.cookies();
    const localStorageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          data[key] = localStorage.getItem(key);
        }
      }
      return data;
    });
    
    console.log(`📊 Found ${cookies.length} cookies`);
    console.log(`📊 Found ${Object.keys(localStorageData).length} localStorage items\n`);
    
    // Find auth-related cookies
    const authCookies = cookies.filter(c => 
      /token|auth|session|jwt/i.test(c.name)
    );
    
    if (authCookies.length > 0) {
      console.log('🎯 Auth tokens found:');
      authCookies.forEach(c => {
        console.log(`   - ${c.name}: ${c.value.substring(0, 50)}...`);
      });
      console.log('');
    }
    
    // Step 5: Save session
    const sessionData = {
      url: 'https://chat.deepseek.com',
      timestamp: Date.now(),
      cookies: cookies.map(c => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path,
        expires: c.expires
      })),
      localStorage: localStorageData,
      username: credentials.username,
      password: credentials.password
    };
    
    const sessionsDir = path.join(__dirname, '../sessions/');
    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
    }
    
    const sessionFile = path.join(sessionsDir, 'deepseek_chat_com.json');
    fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
    
    console.log('💾 Session saved to:', sessionFile);
    console.log('');
    
    // Step 6: Verify we're logged in
    console.log('8. ✅ Verifying login status...');
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);
    
    if (finalUrl.includes('/chat') || !finalUrl.includes('/login')) {
      console.log('✅ Login SUCCESSFUL!\n');
    } else {
      console.log('⚠️  May still be on login page - check browser window\n');
    }
    
    console.log('='.repeat(60));
    console.log('🎉 TEST COMPLETED!\n');
    console.log('Session extracted and saved!');
    console.log('You can now run: node src/index.js https://chat.deepseek.com\n');
    console.log('The proxy will use this saved session.\n');
    
    // Keep browser open for a moment so user can see result
    await sleep(3000);
    await browser.close();
    
    console.log('🔒 Browser closed\n');
    console.log('✨ Ready to start proxy server!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    if (browser) await browser.close();
    process.exit(1);
  }
}

async function waitForManualLogin(page) {
  return new Promise((resolve) => {
    process.stdin.once('data', async () => {
      console.log('\n🔍 Checking login status...\n');
      
      // Take a screenshot to verify
      await page.screenshot({ path: './deepseek-login-result.png' });
      console.log('📸 Screenshot saved to: ./deepseek-login-result.png\n');
      
      resolve();
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

testDeepSeekLogin();
