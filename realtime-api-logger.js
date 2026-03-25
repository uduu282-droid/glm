/**
 * Real-time API Request Logger
 * Logs ALL API requests to a file as they happen
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

const LOG_FILE = 'all_api_requests.json';
let capturedRequests = [];

console.log('🔍 Starting real-time API logger...\n');

async function startLogging() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1920,1080']
  });
  
  const page = await browser.newPage();
  
  // Enable request interception
  await page.setRequestInterception(true);
  
  page.on('request', request => {
    const url = request.url();
    
    // Capture only API requests
    if (url.includes('api.imgupscaler.ai') || url.includes('imgupscaler.ai')) {
      const requestData = {
        timestamp: new Date().toISOString(),
        url,
        method: request.method(),
        headers: request.headers(),
        postData: request.postData() || null,
        resourceType: request.resourceType()
      };
      
      capturedRequests.push(requestData);
      
      // Log to console
      console.log(`\n[${new Date().toLocaleTimeString()}] ${request.method()} ${url}`);
      
      if (request.postData) {
        try {
          const parsed = JSON.parse(request.postData);
          console.log(`   Body: ${JSON.stringify(parsed).substring(0, 300)}`);
        } catch {
          const str = String(request.postData);
          console.log(`   Body: ${str.substring(0, 300)}`);
        }
      }
      
      // Save to file after each request
      saveToFile();
      
      // Highlight potential generation endpoints
      if (url.includes('/generate') || url.includes('/edit') || url.includes('/process') || url.includes('/create') || url.includes('/task')) {
        console.log(`   🎯 POTENTIAL GENERATION ENDPOINT!`);
      }
    }
    
    request.continue();
  });
  
  console.log('✅ Browser opened. Navigate to: https://imgupscaler.ai/ai-photo-editor/');
  console.log('📝 All API requests will be logged to:', LOG_FILE);
  console.log('💡 Upload an image and click Generate to capture the editing endpoint\n');
  
  await page.goto('https://imgupscaler.ai/ai-photo-editor/', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });
  
  console.log('📍 Page loaded. Ready to capture your actions...\n');
  
  // Keep running until user closes browser
  await new Promise(resolve => {
    browser.on('disconnected', () => {
      console.log('\n✅ Browser closed. Final save...');
      saveToFile();
      resolve();
    });
    
    // Timeout after 10 minutes
    setTimeout(() => {
      console.log('\n⏰ 10 minute timeout reached');
      browser.close();
    }, 600000);
  });
}

function saveToFile() {
  const output = {
    captureTime: new Date().toISOString(),
    totalRequests: capturedRequests.length,
    requests: capturedRequests
  };
  
  fs.writeFileSync(LOG_FILE, JSON.stringify(output, null, 2));
  console.log(`   💾 Saved ${capturedRequests.length} requests to ${LOG_FILE}`);
}

startLogging().catch(console.error);
