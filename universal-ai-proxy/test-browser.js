import { chromium } from 'playwright';

/**
 * Quick Test - Verify browser automation works
 */
async function testBrowser() {
  console.log('🧪 Testing Browser Automation...\n');
  
  let browser;
  
  try {
    console.log('1. Launching browser...');
    browser = await chromium.launch({ 
      headless: false,
      args: ['--window-size=800,600']
    });
    
    const page = await browser.newPage();
    
    console.log('2. Navigating to example site...');
    await page.goto('https://www.example.com', { waitUntil: 'networkidle' });
    
    console.log('3. Taking screenshot...');
    await page.screenshot({ path: './test-screenshot.png' });
    
    console.log('4. Getting page title...');
    const title = await page.title();
    console.log(`   Title: "${title}"\n`);
    
    console.log('✅ Browser automation is working!\n');
    console.log('Screenshot saved to: ./test-screenshot.png\n');
    
    await browser.close();
    console.log('🎉 Test PASSED!\n');
    
  } catch (error) {
    console.error('❌ Test FAILED:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

testBrowser();
