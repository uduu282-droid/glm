const puppeteer = require('puppeteer');
const fs = require('fs');

async function captureEverything() {
  console.log('🎬 COMPREHENSIVE PHOTOGRID NETWORK CAPTURE\n');
  console.log('📋 Instructions:');
  console.log('   1. Browser will open PhotoGrid');
  console.log('   2. Upload an image manually');
  console.log('   3. Wait for processing');
  console.log('   4. All network traffic will be captured\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Enable request interception
  await page.setRequestInterception(true);
  
  const allRequests = [];
  let requestCount = 0;
  
  // Capture ALL requests
  page.on('request', async request => {
    const url = request.url();
    
    // Only capture PhotoGrid API calls
    if (url.includes('api.grid.plus')) {
      requestCount++;
      
      const requestData = {
        id: requestCount,
        timestamp: Date.now(),
        type: 'request',
        url: url,
        method: request.method(),
        resourceType: request.resourceType(),
        headers: request.headers(),
        postData: request.postData(),
        cookies: await page.cookies()
      };
      
      allRequests.push(requestData);
      
      // Log immediately
      const pathname = new URL(url).pathname;
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📡 [${requestCount}] ${request.method()} ${pathname}`);
      console.log(`${'='.repeat(80)}`);
      
      // Show key headers
      const importantHeaders = [
        'sig', 'x-appid', 'x-deviceid', 'x-ghostid', 
        'content-type', 'x-platform', 'x-version'
      ];
      
      importantHeaders.forEach(header => {
        if (request.headers()[header]) {
          const value = request.headers()[header];
          if (header === 'sig') {
            console.log(`   🔑 ${header}: ${value.substring(0, 50)}...`);
          } else {
            console.log(`   📌 ${header}: ${value}`);
          }
        }
      });
      
      // Show body
      if (request.postData()) {
        const contentType = request.headers()['content-type'] || '';
        console.log(`   📦 Content-Type: ${contentType}`);
        
        if (contentType.includes('json')) {
          try {
            const json = JSON.parse(request.postData());
            console.log(`   📄 Body:`, JSON.stringify(json, null, 2));
          } catch (e) {
            console.log(`   📄 Body: ${request.postData().substring(0, 200)}`);
          }
        } else if (contentType.includes('form-data')) {
          console.log(`   📄 Multipart form data (${request.postData().length} bytes)`);
        } else if (contentType.includes('urlencoded')) {
          console.log(`   📄 Form: ${request.postData()}`);
        } else {
          console.log(`   📄 Raw: ${request.postData().substring(0, 200)}`);
        }
      }
    }
    
    request.continue();
  });
  
  // Capture responses
  page.on('response', async response => {
    const url = response.url();
    
    if (url.includes('api.grid.plus')) {
      const status = response.status();
      const matchingRequest = allRequests.find(r => r.url === url && !r.response);
      
      if (matchingRequest) {
        matchingRequest.response = {
          status: status,
          statusText: response.statusText(),
          headers: response.headers(),
          ok: response.ok()
        };
        
        // Try to get response body
        try {
          const text = await response.text();
          matchingRequest.response.body = text;
          
          try {
            const json = JSON.parse(text);
            matchingRequest.response.json = json;
            
            if (json.code !== undefined) {
              console.log(`   ✅ Response: ${status} - Code: ${json.code}${json.errmsg ? ` (${json.errmsg})` : ''}`);
              
              if (json.data && typeof json.data === 'object') {
                const keys = Object.keys(json.data);
                if (keys.length > 0) {
                  console.log(`   💾 Data keys: ${keys.slice(0, 10).join(', ')}${keys.length > 10 ? '...' : ''}`);
                  
                  // If it's a result with URL, highlight it
                  if (json.data.url || json.data.download_url) {
                    console.log(`   🎉 RESULT URL: ${json.data.url || json.data.download_url}`);
                  }
                }
              }
            }
          } catch (e) {
            console.log(`   📄 Response body: ${text.substring(0, 200)}...`);
          }
        } catch (e) {
          console.log(`   ⚠️ Could not read response body`);
        }
      }
    }
  });
  
  console.log('🌐 Opening PhotoGrid background remover...\n');
  await page.goto('https://www.photogrid.app/en/background-remover/', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('\n\n' + '='.repeat(80));
  console.log('🖱️ MANUAL ACTION REQUIRED');
  console.log('='.repeat(80));
  console.log('\nPlease:');
  console.log('   1. Click "Upload" or drag & drop an image');
  console.log('   2. Wait for background removal to complete');
  console.log('   3. I\'ll capture all API calls automatically\n');
  
  // Wait indefinitely for user action
  console.log('⏳ Waiting for you to upload an image...');
  console.log('(Press Ctrl+C when done to save the capture)\n');
  
  // Keep browser open until user closes or we detect activity
  let lastRequestCount = requestCount;
  let idleCount = 0;
  
  while (idleCount < 3) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (requestCount === lastRequestCount) {
      idleCount++;
    } else {
      idleCount = 0;
      lastRequestCount = requestCount;
    }
  }
  
  console.log('\n\n✅ Capture complete!\n');
  
  // Analyze and save
  console.log('📊 ANALYSIS SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total API requests captured: ${allRequests.length}\n`);
  
  // Group by endpoint
  const endpoints = {};
  allRequests.forEach(req => {
    const pathname = new URL(req.url).pathname;
    if (!endpoints[pathname]) {
      endpoints[pathname] = { count: 0, hasSig: false, methods: new Set() };
    }
    endpoints[pathname].count++;
    endpoints[pathname].methods.add(req.method);
    if (req.headers.sig) endpoints[pathname].hasSig = true;
  });
  
  console.log('Endpoints used:');
  Object.entries(endpoints).forEach(([endpoint, data]) => {
    const sigStatus = data.hasSig ? '🔑 REQUIRES SIG' : '✅ NO SIG';
    const methods = Array.from(data.methods).join(', ');
    console.log(`   ${sigStatus} | ${methods.padEnd(6)} | ${endpoint} (${data.count} calls)`);
  });
  
  // Find the actual upload and result endpoints
  console.log('\n\n🎯 KEY ENDPOINTS FOR BACKGROUND REMOVAL:');
  console.log('='.repeat(80));
  
  const uploadEndpoint = allRequests.find(r => 
    r.url.includes('upload') && r.method === 'POST'
  );
  
  if (uploadEndpoint) {
    console.log('\n📤 UPLOAD ENDPOINT:');
    console.log(`   URL: ${new URL(uploadEndpoint.url).pathname}`);
    console.log(`   Method: ${uploadEndpoint.method}`);
    console.log(`   Content-Type: ${uploadEndpoint.headers['content-type']}`);
    console.log(`   Has Signature: ${uploadEndpoint.headers.sig ? 'YES' : 'NO'}`);
    if (uploadEndpoint.headers.sig) {
      console.log(`   Signature: ${uploadEndpoint.headers.sig}`);
    }
    if (uploadEndpoint.postData) {
      console.log(`   Body length: ${uploadEndpoint.postData.length} bytes`);
    }
  }
  
  const resultEndpoint = allRequests.find(r => 
    r.url.includes('result') && r.method === 'POST'
  );
  
  if (resultEndpoint) {
    console.log('\n📥 RESULT ENDPOINT:');
    console.log(`   URL: ${new URL(resultEndpoint.url).pathname}`);
    console.log(`   Method: ${resultEndpoint.method}`);
    console.log(`   Has Signature: ${resultEndpoint.headers.sig ? 'YES' : 'NO'}`);
    if (resultEndpoint.response && resultEndpoint.response.json) {
      const json = resultEndpoint.response.json;
      if (json.code === 0 && json.data) {
        console.log(`   ✅ SUCCESS! Code: 0`);
        if (json.data.url) {
          console.log(`   🎉 Result URL: ${json.data.url}`);
        }
      }
    }
  }
  
  // Save everything
  const captureData = {
    timestamp: new Date().toISOString(),
    totalRequests: allRequests.length,
    endpoints: Object.keys(endpoints),
    requests: allRequests
  };
  
  const filename = `full-capture-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(captureData, null, 2));
  console.log(`\n💾 Full capture saved to: ${filename}`);
  
  // Also save a simplified version
  const simplifiedFilename = `simplified-capture-${Date.now()}.json`;
  const simplified = allRequests.map(r => ({
    url: r.url,
    method: r.method,
    hasSig: !!r.headers.sig,
    sig: r.headers.sig,
    contentType: r.headers['content-type'],
    hasBody: !!r.postData,
    bodyLength: r.postData?.length || 0,
    responseCode: r.response?.json?.code,
    responseData: r.response?.json?.data ? 'HAS_DATA' : 'NO_DATA',
    responseOk: r.response?.ok
  }));
  fs.writeFileSync(simplifiedFilename, JSON.stringify(simplified, null, 2));
  console.log(`💾 Simplified capture saved to: ${simplifiedFilename}`);
  
  console.log('\n✅ Done! You can now analyze the captured data.\n');
  
  await browser.close();
}

// Run the capture
captureEverything().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
