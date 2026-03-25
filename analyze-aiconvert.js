/**
 * Analyze AIConvert.online Background Removal
 * https://aiconvert.online/ai-image-enhancer
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function analyzeAIConvert() {
  console.log('🔍 Analyzing AIConvert.online...\n');
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
    if ((url.includes('api') || url.includes('upload') || url.includes('process') || url.includes('convert') || url.includes('enhance') || url.includes('pint2')) && 
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
        postData: request.postData() || null,
        resourceType: request.resourceType()
      };
      apiRequests.push(requestData);
      
      console.log(`\n📡 ${request.method()} ${new URL(url).pathname}`);
      console.log(`   Full URL: ${url}`);
      console.log(`   Resource Type: ${request.resourceType()}`);
      
      if (requestData.postData) {
        console.log(`   Body: ${requestData.postData.substring(0, 300)}`);
      }
      
      // Log ALL headers for POST requests
      if (request.method() === 'POST') {
        console.log('   📋 Complete Headers:');
        Object.entries(request.headers()).forEach(([key, value]) => {
          console.log(`      ${key}: ${value.substring ? value.substring(0, 100) : value}`);
        });
      }
      
      // Log important headers
      if (request.headers()['authorization']) {
        console.log(`   🔑 Auth: ${request.headers()['authorization'].substring(0, 50)}...`);
      }
      if (request.headers()['x-api-key']) {
        console.log(`   🔑 API Key: ${request.headers()['x-api-key']}`);
      }
      if (request.headers()['cookie']) {
        console.log(`   🍪 Cookie: ${request.headers()['cookie'] ? request.headers()['cookie'].substring(0, 100) : ''}...`);
      }
    }
  });
  
  // Capture responses
  page.on('response', async response => {
    const url = response.url();
    
    if ((url.includes('api') || url.includes('upload') || url.includes('process') || url.includes('convert') || url.includes('enhance')) &&
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
  
  console.log('\n🌐 Navigating to AIConvert.online...\n');
  
  try {
    await page.goto('https://aiconvert.online/ai-image-enhancer', {
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
        console.log(`   🍪 Has cookies: ${req.headers['cookie'] ? req.headers['cookie'].substring(0, 100) : ''}...`);
      }
      
      if (req.postData) {
        console.log(`   📦 Body preview: ${req.postData.substring(0, 200)}...`);
      }
      
      console.log('');
    });
    
    // Save to file
    fs.writeFileSync('aiconvert-captured-requests.json', JSON.stringify(apiRequests, null, 2));
    console.log('💾 Saved to: aiconvert-captured-requests.json\n');
  } else {
    console.log('⚠️  No API requests captured yet.');
    console.log('💡 The site might use client-side processing or different triggers.\n');
  }
  
  // Keep browser open for manual testing
  console.log('✨ Browser is open. You can manually test the upload feature.');
  console.log('   The script will capture all API calls.\n');
}

analyzeAIConvert().catch(console.error);
