const puppeteer = require('puppeteer');

async function captureBgRemoval() {
  console.log('🕵️ Capturing Background Removal API Flow...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capture all requests
  const capturedRequests = [];
  
  page.on('request', request => {
    const url = request.url();
    if (url.includes('api.grid.plus') && (url.includes('nologin') || url.includes('bgcut') || url.includes('upload'))) {
      capturedRequests.push({
        type: 'request',
        url: url,
        method: request.method(),
        headers: request.headers(),
        postData: request.postData()
      });
      console.log('\n📡 REQUEST:');
      console.log(`   ${request.method()} ${url}`);
      if (request.postData()) {
        console.log(`   Body: ${request.postData().substring(0, 200)}`);
      }
    }
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api.grid.plus') && (url.includes('nologin') || url.includes('bgcut') || url.includes('upload'))) {
      console.log(`\n📡 RESPONSE (${response.status()}):`);
      try {
        const data = await response.json();
        console.log(`   ${JSON.stringify(data, null, 1).substring(0, 300)}`);
      } catch (e) {
        const text = await response.text();
        console.log(`   [Binary/Text] Length: ${text.length}`);
      }
    }
  });
  
  console.log('🌐 Navigating to background remover...');
  await page.goto('https://www.photogrid.app/en/background-remover/', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n🖱️ Attempting to trigger background removal...');
  
  // Look for any button or upload area
  try {
    // Try to find upload button
    const selectors = ['.upload-btn', '.upload-area', 'button', '[type="file"]'];
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`✅ Found element: ${selector}`);
          await element.click();
          await new Promise(resolve => setTimeout(resolve, 5000));
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // If no button found, try to directly call the API from page context
    await page.evaluate(() => {
      console.log('Trying direct API call from page...');
    });
    
  } catch (error) {
    console.log('⚠️ Interaction failed:', error.message);
  }
  
  // Wait for API calls
  await new Promise(resolve => setTimeout(resolve, 8000));
  
  console.log(`\n\n📊 Captured ${capturedRequests.length} requests`);
  
  const fs = require('fs');
  fs.writeFileSync('bg-removal-traffic.json', JSON.stringify(capturedRequests, null, 2));
  console.log('💾 Saved to bg-removal-traffic.json');
  
  await browser.close();
}

captureBgRemoval().catch(console.error);
