/**
 * Analyze LunaPic Background Removal Tool
 * https://www2.lunapic.com/editor/?action=transparent
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function analyzeLunaPic() {
  console.log('🔍 Analyzing LunaPic Background Removal...\n');
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
    
    // Look for API/upload endpoints (exclude analytics and CDNs)
    if ((url.includes('api') || url.includes('upload') || url.includes('process') || url.includes('remove') || url.includes('bg') || url.includes('lunapic')) && 
        !url.includes('google') && 
        !url.includes('analytics') && 
        !url.includes('facebook') &&
        !url.includes('sentry') &&
        !url.includes('doubleclick')) {
      const requestData = {
        timestamp: Date.now(),
        url: url,
        method: request.method(),
        headers: request.headers(),
        postData: request.postData()
      };
      apiRequests.push(requestData);
      
      console.log(`\n📡 ${request.method()} ${new URL(url).pathname}`);
      console.log(`   Full URL: ${url}`);
      
      if (request.postData()) {
        console.log(`   Body: ${request.postData().substring(0, 300)}`);
      }
      
      // Log important headers
      if (request.headers()['authorization']) {
        console.log(`   🔑 Auth: ${request.headers()['authorization'].substring(0, 50)}...`);
      }
      if (request.headers()['x-api-key']) {
        console.log(`   🔑 API Key: ${request.headers()['x-api-key']}`);
      }
      if (request.headers()['cookie']) {
        console.log(`   🍪 Cookie: ${request.headers()['cookie'].substring(0, 100)}...`);
      }
    }
  });
  
  // Capture responses
  page.on('response', async response => {
    const url = response.url();
    
    if ((url.includes('api') || url.includes('upload') || url.includes('process') || url.includes('remove') || url.includes('bg') || url.includes('lunapic')) &&
        !url.includes('google') && 
        !url.includes('analytics') && 
        !url.includes('facebook') &&
        !url.includes('sentry') &&
        !url.includes('doubleclick')) {
      const status = response.status();
      console.log(`   ✅ Response: ${status}`);
      
      if (status === 200) {
        try {
          const data = await response.json();
          const preview = JSON.stringify(data, null, 2).substring(0, 500);
          console.log(`   📊 Response:`, preview);
        } catch (e) {
          // Binary response
          const contentType = response.headers()['content-type'];
          if (contentType && contentType.includes('image')) {
            console.log(`   🖼️ Image response received (${contentType})`);
          } else {
            console.log(`   📦 Binary response: ${contentType}`);
          }
        }
      } else {
        console.log(`   ❌ Error response`);
      }
    }
  });
  
  console.log('\n🌐 Navigating to LunaPic...\n');
  
  try {
    await page.goto('https://www2.lunapic.com/editor/?action=transparent', {
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
      'button[class*="upload"]',
      '[class*="browse"]',
      '#fileInput',
      '[id*="upload"]'
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
      
      if (req.headers['cookie']) {
        console.log(`   🍪 Has cookies: ${req.headers['cookie'].substring(0, 100)}...`);
      }
      
      if (req.postData) {
        console.log(`   📦 Body preview: ${req.postData.substring(0, 200)}...`);
      }
      
      console.log('');
    });
    
    // Save to file
    fs.writeFileSync('lunapic-captured-requests.json', JSON.stringify(apiRequests, null, 2));
    console.log('💾 Saved to: lunapic-captured-requests.json\n');
  } else {
    console.log('⚠️  No API requests captured yet.');
    console.log('💡 The site might use client-side processing or different triggers.\n');
  }
  
  // Keep browser open for manual testing
  console.log('✨ Browser is open. You can manually test the upload feature.');
  console.log('   The script will capture all API calls.\n');
}

analyzeLunaPic().catch(console.error);
