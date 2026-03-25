const puppeteer = require('puppeteer');

async function captureCompleteFlow() {
  console.log('🎬 Capturing COMPLETE Background Removal Flow\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  const allRequests = [];
  
  // Capture EVERYTHING
  page.on('request', request => {
    const url = request.url();
    if (url.includes('api.grid.plus')) {
      const requestData = {
        type: 'request',
        timestamp: Date.now(),
        url: url,
        method: request.method(),
        headers: request.headers(),
        postData: request.postData()
      };
      allRequests.push(requestData);
      
      console.log(`\n📡 [${allRequests.length}] ${request.method()} ${new URL(url).pathname}`);
      
      if (request.postData()) {
        const preview = request.postData().substring(0, 150).replace(/\n/g, ' ');
        console.log(`   Body: ${preview}...`);
      }
      
      // Log signature header if present
      const sig = request.headers()['sig'];
      if (sig) {
        console.log(`   🔑 sig: ${sig.substring(0, 40)}...`);
      }
    }
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api.grid.plus')) {
      const status = response.status();
      console.log(`   ✅ Response: ${status}`);
      
      if (status === 200) {
        try {
          const data = await response.json();
          if (data.code !== undefined) {
            console.log(`   📊 Code: ${data.code}${data.errmsg ? ` (${data.errmsg})` : ''}`);
          }
          if (data.data && Object.keys(data.data).length > 0) {
            console.log(`   💾 Data keys: ${Object.keys(data.data).join(', ')}`);
          }
        } catch (e) {
          // Binary response
        }
      }
    }
  });
  
  console.log('🌐 Opening PhotoGrid background remover...\n');
  await page.goto('https://www.photogrid.app/en/background-remover/', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n🖱️ Looking for upload mechanism...\n');
  
  // Try multiple approaches
  try {
    // Method 1: Click upload button
    const selectors = [
      'input[type="file"]',
      '.upload-btn',
      '.upload-area', 
      '[class*="upload"]',
      'button[class*="upload"]'
    ];
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`✅ Found: ${selector}`);
          
          // Create a simple test image as blob
          await page.evaluate(() => {
            // Create a 1x1 red pixel PNG
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'red';
            ctx.fillRect(0, 0, 1, 1);
            
            canvas.toBlob((blob) => {
              window.testBlob = blob;
              console.log('Test blob created');
            }, 'image/png');
          });
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Try to upload
          const inputFile = await page.$('input[type="file"]');
          if (inputFile) {
            console.log('Uploading test image...');
            await inputFile.uploadFile({
              name: 'test.png',
              mimeType: 'image/png',
              buffer: Buffer.from([137,80,78,71,13,10,26,10]) // Minimal PNG header
            });
          }
          
          await new Promise(resolve => setTimeout(resolve, 8000));
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
  } catch (error) {
    console.log('⚠️ Upload attempt:', error.message);
  }
  
  // Wait more for API calls
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log(`\n\n═══════════════════════════════════════════════`);
  console.log(`📊 CAPTURED ${allRequests.length} API REQUESTS`);
  console.log(`═══════════════════════════════════════════════\n`);
  
  // Analyze the flow
  console.log('📋 REQUEST FLOW ANALYSIS:\n');
  
  allRequests.forEach((req, idx) => {
    const pathname = new URL(req.url).pathname;
    console.log(`${idx + 1}. ${req.method} ${pathname}`);
    
    if (req.headers['sig']) {
      console.log(`   🔑 Has signature: ${req.headers['sig'].substring(0, 30)}...`);
    }
    
    if (req.postData) {
      const contentType = req.headers['content-type'] || 'unknown';
      console.log(`   📦 Content-Type: ${contentType}`);
      if (contentType.includes('json')) {
        console.log(`   📄 Body: ${req.postData.substring(0, 100)}`);
      } else if (contentType.includes('form-data')) {
        console.log(`   📄 Multipart form data`);
      } else if (contentType.includes('urlencoded')) {
        console.log(`   📄 Form encoded: ${req.postData.substring(0, 100)}`);
      }
    }
  });
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync('complete-flow-capture.json', JSON.stringify(allRequests, null, 2));
  console.log(`\n💾 Saved complete capture to complete-flow-capture.json`);
  
  await browser.close();
  console.log('\n✅ Done!\n');
}

captureCompleteFlow().catch(console.error);
