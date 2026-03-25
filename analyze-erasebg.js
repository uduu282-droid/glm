/**
 * Analyze Erase.bg Background Removal Service
 * Capture network traffic and API endpoints
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function analyzeEraseBg() {
  console.log('🔍 Analyzing Erase.bg...\n');
  console.log('=' .repeat(60));
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  const apiRequests = [];
  
  // Capture all API requests
  page.on('request', request => {
    const url = request.url();
    
    // Look for API endpoints
    if (url.includes('api') || url.includes('remove') || url.includes('background') || url.includes('upload')) {
      const requestData = {
        timestamp: Date.now(),
        url: url,
        method: request.method(),
        headers: request.headers(),
        postData: request.postData()
      };
      apiRequests.push(requestData);
      
      console.log(`\n📡 ${request.method()} ${url}`);
      
      if (request.postData()) {
        console.log(`   Body: ${request.postData().substring(0, 200)}`);
      }
    }
  });
  
  // Capture responses
  page.on('response', async response => {
    const url = response.url();
    
    if (url.includes('api') || url.includes('remove') || url.includes('background') || url.includes('upload')) {
      const status = response.status();
      console.log(`   ✅ Response: ${status}`);
      
      if (status === 200) {
        try {
          const data = await response.json();
          console.log(`   📊 Response:`, JSON.stringify(data, null, 2).substring(0, 500));
        } catch (e) {
          // Binary response
          const contentType = response.headers()['content-type'];
          if (contentType && contentType.includes('image')) {
            console.log(`   🖼️ Image response received`);
          }
        }
      }
    }
  });
  
  console.log('\n🌐 Navigating to Erase.bg...\n');
  
  try {
    await page.goto('https://www.erase.bg/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log('\n✅ Page loaded successfully');
    console.log('📄 Page title:', await page.title());
    
    // Wait for page to fully load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Try to find upload button or drop zone
    console.log('\n🔍 Looking for upload mechanism...');
    
    const selectors = [
      'input[type="file"]',
      '.upload-btn',
      '.upload-area',
      '[class*="upload"]',
      '[class*="drop"]',
      'button[class*="upload"]'
    ];
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`✅ Found: ${selector}`);
        }
      } catch (e) {}
    }
    
    // Wait more for any API calls
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ Error loading page:', error.message);
  }
  
  // Save captured requests
  console.log('\n\n' + '=' .repeat(60));
  console.log(`📊 CAPTURED ${apiRequests.length} API REQUESTS`);
  console.log('=' .repeat(60) + '\n');
  
  if (apiRequests.length > 0) {
    console.log('📋 API ENDPOINTS FOUND:\n');
    
    apiRequests.forEach((req, idx) => {
      console.log(`${idx + 1}. ${req.method} ${new URL(req.url).pathname}`);
      console.log(`   Full URL: ${req.url}`);
      
      if (req.headers['authorization']) {
        console.log(`   🔑 Auth: ${req.headers['authorization'].substring(0, 50)}...`);
      }
      
      if (req.headers['x-api-key']) {
        console.log(`   🔑 API Key: ${req.headers['x-api-key']}`);
      }
      
      if (req.postData) {
        console.log(`   📦 Body preview: ${req.postData.substring(0, 150)}...`);
      }
      
      console.log('');
    });
    
    // Save to file
    fs.writeFileSync('erasebg-captured-requests.json', JSON.stringify(apiRequests, null, 2));
    console.log('💾 Saved to: erasebg-captured-requests.json\n');
  } else {
    console.log('⚠️  No API requests captured yet.');
    console.log('💡 The site might use client-side processing or different triggers.\n');
  }
  
  // Keep browser open for manual testing
  console.log('✨ Browser is open. You can manually test the upload feature.');
  console.log('   The script will capture all API calls.\n');
  
  // Don't close browser immediately
  // await browser.close();
}

analyzeEraseBg().catch(console.error);
