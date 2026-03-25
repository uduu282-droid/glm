const puppeteer = require('puppeteer');

async function capturePhotoGridAPI() {
  console.log('🕵️ Capturing PhotoGrid API Traffic...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set up request interception to capture all network calls
  const capturedRequests = [];
  
  page.on('request', request => {
    const url = request.url();
    if (url.includes('api.grid.plus') && url.includes('nologin')) {
      capturedRequests.push({
        type: 'request',
        url: url,
        method: request.method(),
        headers: request.headers(),
        postData: request.postData()
      });
      console.log('\n📡 CAPTURED REQUEST:');
      console.log(`   Method: ${request.method()}`);
      console.log(`   URL: ${url}`);
      console.log('   Headers:', JSON.stringify(request.headers(), null, 2));
      if (request.postData()) {
        console.log(`   Body: ${request.postData()}`);
      }
    }
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api.grid.plus') && url.includes('nologin')) {
      try {
        const data = await response.json();
        console.log('\n📡 CAPTURED RESPONSE:');
        console.log(`   URL: ${url}`);
        console.log(`   Status: ${response.status()}`);
        console.log(`   Data:`, JSON.stringify(data, null, 2));
      } catch (e) {
        console.log(`   Response: [Non-JSON or binary]`);
      }
    }
  });
  
  // Navigate to PhotoGrid background remover
  console.log('🌐 Navigating to PhotoGrid...');
  await page.goto('https://www.photogrid.app/en/background-remover/', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  console.log('⏳ Waiting for page to load...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Try to upload a test image by clicking the upload button
  console.log('🖱️ Looking for upload button...');
  
  try {
    // Find and click the upload area
    const uploadButton = await page.$('input[type="file"]');
    if (uploadButton) {
      console.log('✅ Found file input');
      
      // Create a test image
      const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const response = await fetch(testImage);
      const buffer = await response.arrayBuffer();
      
      await uploadButton.uploadFile({
        name: 'test.png',
        mimeType: 'image/png',
        buffer: Buffer.from(buffer)
      });
      
      console.log('✅ Uploaded test image');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      console.log('⚠️ No file input found, trying alternative method...');
      
      // Try to trigger API call via JavaScript
      await page.evaluate(() => {
        // Look for any global functions or objects related to upload
        window.addEventListener('click', () => {
          console.log('Click detected');
        });
      });
      
      // Click on the upload area
      await page.click('.upload-area').catch(() => {});
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  } catch (error) {
    console.log('⚠️ Upload attempt failed:', error.message);
  }
  
  // Wait for any API calls to complete
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Extract any JavaScript files that might contain API logic
  console.log('\n📄 Extracting JavaScript files...');
  const scripts = await page.$$eval('script[src]', scripts => 
    scripts.map(script => script.src)
  );
  
  console.log('Found scripts:');
  scripts.forEach(src => {
    if (src.includes('photogrid') || src.includes('worker')) {
      console.log(`   - ${src}`);
    }
  });
  
  // Get page content to look for inline scripts
  const pageContent = await page.content();
  const inlineScripts = pageContent.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
  
  console.log(`\n📝 Found ${inlineScripts.length} inline scripts`);
  
  // Look for API endpoints in the source
  const apiEndpoints = pageContent.match(/https?:\/\/[^\s"'<>]*api[^\s"'<>]*/gi) || [];
  const uniqueEndpoints = [...new Set(apiEndpoints)];
  
  console.log('\n🔍 Found API Endpoints:');
  uniqueEndpoints.forEach(endpoint => {
    if (endpoint.includes('grid.plus')) {
      console.log(`   ✓ ${endpoint}`);
    }
  });
  
  console.log('\n\n═══════════════════════════════════════════════════');
  console.log(`📊 Total API Requests Captured: ${capturedRequests.length}`);
  console.log('═══════════════════════════════════════════════════\n');
  
  // Save captured requests to file
  const fs = require('fs');
  fs.writeFileSync('captured-api-traffic.json', JSON.stringify(capturedRequests, null, 2));
  console.log('💾 Saved to captured-api-traffic.json\n');
  
  await browser.close();
  
  return capturedRequests;
}

// Run the capture
capturePhotoGridAPI().then(requests => {
  console.log('✅ Capture complete!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
