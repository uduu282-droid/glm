/**
 * Quick ImgUpscaler AI Photo Editor - Endpoint Capture
 * 
 * This script will help you find the AI editing endpoint
 * by monitoring network traffic while you manually test the website.
 * 
 * Usage:
 * 1. Run this script
 * 2. It will open browser and navigate to imgupscaler.ai
 * 3. You manually upload an image and enter a prompt
 * 4. Click Generate
 * 5. Script captures all API requests
 * 6. Check captured_edit_endpoint.json for the endpoint details
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

const OUTPUT_FILE = 'captured_edit_endpoint.json';

async function captureEditEndpoint() {
  console.log('🔍 ImgUpscaler AI Photo Editor - Endpoint Capture\n');
  console.log('=' .repeat(70));
  console.log('\n📋 Instructions:');
  console.log('1. Browser will open automatically');
  console.log('2. Navigate to: https://imgupscaler.ai/ai-photo-editor/');
  console.log('3. Upload any image (or use default)');
  console.log('4. Enter a test prompt like "make it brighter"');
  console.log('5. Click "Generate Images" button');
  console.log('6. I\'ll capture the API request automatically');
  console.log('\n⏳ Waiting for you to interact with the page...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1920,1080']
  });
  
  const page = await browser.newPage();
  
  // Enable request interception
  const capturedRequests = [];
  
  await page.setRequestInterception(true);
  
  page.on('request', request => {
    const url = request.url();
    
    // Filter for API requests only
    if (url.includes('api.imgupscaler.ai')) {
      const postData = request.postData();
      
      console.log('\n📡 Captured API Request:');
      console.log('   URL:', url);
      console.log('   Method:', request.method());
      
      if (postData) {
        try {
          const parsed = JSON.parse(postData);
          console.log('   Body:', JSON.stringify(parsed, null, 2).substring(0, 500));
        } catch {
          console.log('   Body:', postData.substring(0, 500));
        }
      }
      
      // Save complete request details
      capturedRequests.push({
        timestamp: Date.now(),
        url,
        method: request.method(),
        headers: request.headers(),
        postData: postData || null,
        resourceType: request.resourceType()
      });
      
      // Check if this looks like the edit endpoint
      if (url.includes('/edit') || url.includes('/generate') || url.includes('/process')) {
        console.log('\n🎯 POSSIBLE EDIT ENDPOINT FOUND!');
        console.log('   Full URL:', url);
        
        // Save immediately
        saveCapture(capturedRequests);
      }
    }
    
    request.continue();
  });
  
  console.log('✅ Browser opened. Please navigate to:');
  console.log('   https://imgupscaler.ai/ai-photo-editor/\n');
  console.log('👀 Monitoring network traffic...\n');
  
  // Navigate to the site
  await page.goto('https://imgupscaler.ai/ai-photo-editor/', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });
  
  console.log('📍 Page loaded. Look for "Image Editor" or generation mode.');
  console.log('💡 Tip: You can also try Text-to-Image mode to find that endpoint too.\n');
  
  // Keep monitoring for 5 minutes
  console.log('⏰ Will monitor for 5 minutes...');
  
  await new Promise(resolve => setTimeout(resolve, 300000));
  
  // Save all captured requests
  saveCapture(capturedRequests);
  
  await browser.close();
  
  console.log('\n✅ Capture complete!');
  console.log(`📄 Check ${OUTPUT_FILE} for all captured requests`);
  console.log('\n🔍 Next steps:');
  console.log('   1. Open the JSON file');
  console.log('   2. Look for POST requests to /api/* endpoints');
  console.log('   3. Find the one with "prompt" parameter');
  console.log('   4. That\'s your AI editing endpoint!\n');
}

function saveCapture(requests) {
  const captureData = {
    timestamp: Date.now(),
    totalRequests: requests.length,
    apiRequests: requests.filter(r => r.url.includes('api.imgupscaler.ai')),
    potentialEndpoints: requests.filter(r => 
      r.url.includes('api.imgupscaler.ai') && 
      (r.url.includes('/edit') || 
       r.url.includes('/generate') || 
       r.url.includes('/process') ||
       r.url.includes('/enhance') ||
       r.url.includes('/image/'))
    )
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(captureData, null, 2));
  console.log(`\n💾 Saved ${captureData.apiRequests.length} API requests to ${OUTPUT_FILE}`);
  
  if (captureData.potentialEndpoints.length > 0) {
    console.log(`🎯 Found ${captureData.potentialEndpoints.length} potential edit endpoints!`);
  }
}

// Run capture
captureEditEndpoint().catch(console.error);
