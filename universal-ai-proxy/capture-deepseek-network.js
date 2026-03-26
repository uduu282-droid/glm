import { chromium } from 'playwright';
import { NetworkAnalyzer } from './src/network-analyzer.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * DeepSeek Network Traffic Capture
 * Monitors all API requests during login and chat operations
 */
async function captureDeepSeekTraffic() {
  console.log('='.repeat(60));
  console.log('📡 DeepSeek Network Traffic Analyzer');
  console.log('='.repeat(60));
  console.log('');
  
  const analyzer = new NetworkAnalyzer();
  let browser;
  
  try {
    // Launch browser
    console.log('1. 🌐 Launching browser with network monitoring...\n');
    browser = await chromium.launch({
      headless: false,
      args: ['--window-size=1280,900']
    });
    
    // Start monitoring
    const { context, page } = await analyzer.startMonitoring(browser);
    
    // Navigate to DeepSeek
    console.log('2. 📍 Navigating to chat.deepseek.com...\n');
    await page.goto('https://chat.deepseek.com', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    await analyzer.sleep(3000);
    
    console.log('3. 🔍 Monitoring authentication flow...\n');
    console.log('   ℹ️  Please complete the login process in the browser\n');
    console.log('   - Enter your email and password\n');
    console.log('   - Complete any verification steps\n');
    console.log('   - Navigate to the chat interface\n');
    console.log('');
    console.log('   ⏳ Waiting for you to login...\n');
    console.log('   Press ENTER when you\'ve logged in and reached the chat screen\n');
    
    // Wait for manual login
    await new Promise((resolve) => {
      process.stdin.once('data', resolve);
    });
    
    console.log('\n✅ Login detected! Capturing session data...\n');
    
    // Extract session data
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
    
    // Create session object
    const sessionData = {
      url: 'https://chat.deepseek.com',
      timestamp: Date.now(),
      credentials: {
        email: 'eres3022@gmail.com',
        password: 'ronit@5805'
      },
      cookies: cookies.map(c => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path,
        expires: c.expires
      })),
      localStorage: localStorageData,
      capturedEndpoints: Array.from(analyzer.apiEndpoints),
      totalRequests: analyzer.requests.length
    };
    
    // Analyze traffic
    console.log('4. 📊 Analyzing captured network traffic...\n');
    const topEndpoints = await analyzer.findBestChatEndpoint();
    
    console.log('5. 🎯 Top Chat API Candidates:\n');
    topEndpoints.forEach((endpoint, index) => {
      console.log(`   ${index + 1}. ${endpoint.url}`);
      console.log(`      Method: ${endpoint.method}`);
      console.log(`      Score: ${endpoint.score}`);
      if (endpoint.reasons.length > 0) {
        console.log(`      Reasons: ${endpoint.reasons.join(', ')}`);
      }
      if (endpoint.hasBody) {
        console.log(`      Body preview: ${endpoint.bodyPreview?.substring(0, 100)}...`);
      }
      console.log('');
    });
    
    // Print all captured endpoints
    analyzer.printCapturedEndpoints();
    
    // Save session data
    const sessionsDir = path.join(__dirname, 'sessions/');
    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
    }
    
    const sessionFile = path.join(sessionsDir, 'deepseek_network_capture.json');
    fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
    
    console.log('💾 Session saved to:', sessionFile, '\n');
    
    // Save detailed network data
    const networkFile = path.join(__dirname, 'deepseek_network_data.json');
    analyzer.saveToFile(networkFile);
    
    console.log('💾 Network data saved to:', networkFile, '\n');
    
    // Take screenshot
    const screenshotPath = path.join(__dirname, 'deepseek_session_screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log('📸 Screenshot saved to:', screenshotPath, '\n');
    
    console.log('='.repeat(60));
    console.log('✨ CAPTURE COMPLETE!\n');
    console.log('📊 Summary:\n');
    console.log(`   - Total requests captured: ${analyzer.requests.length}`);
    console.log(`   - API endpoints found: ${sessionData.capturedEndpoints.length}`);
    console.log(`   - Cookies extracted: ${cookies.length}`);
    console.log(`   - LocalStorage items: ${Object.keys(localStorageData).length}`);
    console.log('');
    console.log('🚀 Next Steps:\n');
    console.log('1. Review the captured endpoints above\n');
    console.log('2. The best chat endpoint is likely #1 from the list\n');
    console.log('3. Start proxy with: node start-deepseek.js\n');
    console.log('');
    console.log('='.repeat(60));
    console.log('');
    
    // Keep browser open briefly
    await analyzer.sleep(5000);
    await browser.close();
    console.log('🔒 Browser closed\n');
    
  } catch (error) {
    console.error('\n❌ Capture failed:', error.message);
    console.error('Stack:', error.stack);
    if (browser) await browser.close();
    process.exit(1);
  }
}

// Run the capture
captureDeepSeekTraffic().catch(console.error);
