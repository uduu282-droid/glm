/**
 * Test Raphael API with browser automation to get real session
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function testWithRealSession() {
  console.log('🚀 Launching browser...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Enable request interception to capture everything
  await page.setRequestInterception(true);
  
  let capturedEditRequest = null;
  
  page.on('request', request => {
    const url = request.url();
    
    if (url.includes('/api/ai-image-editor')) {
      console.log('✅ CAPTURED EDIT REQUEST!');
      console.log('URL:', url);
      console.log('Method:', request.method());
      console.log('Headers:', JSON.stringify(request.headers(), null, 2));
      
      if (request.postData()) {
        try {
          const postData = JSON.parse(request.postData());
          console.log('\nPayload:', JSON.stringify(postData, null, 2));
          capturedEditRequest = {
            url,
            method: request.method(),
            headers: request.headers(),
            payload: postData
          };
        } catch (e) {
          console.log('Raw POST data:', request.postData().substring(0, 500));
        }
      }
    }
    
    request.continue();
  });
  
  console.log('📖 Navigating to Raphael AI...\n');
  await page.goto('https://raphael.app/ai-image-editor', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });
  
  console.log('\n✅ Page loaded. Please perform an image edit manually.');
  console.log('💡 Upload an image and click Generate\n');
  console.log('Waiting for API call... (press Ctrl+C when done)\n');
  
  // Wait for user interaction (up to 2 minutes)
  await page.waitForFunction(() => {
    return window !== undefined; // Always true, just to keep page open
  }, { timeout: 120000 }).catch(() => {});
  
  if (capturedEditRequest) {
    console.log('\n\n🎯 SUCCESS! Captured request details:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(capturedEditRequest, null, 2));
    console.log('='.repeat(60));
    
    // Save to file
    fs.writeFileSync('./captured_real_request.json', JSON.stringify(capturedEditRequest, null, 2));
    console.log('\n💾 Saved to: ./captured_real_request.json');
  } else {
    console.log('\n⚠️  No edit request captured. Try again.');
  }
  
  await browser.close();
}

testWithRealSession().catch(console.error);
