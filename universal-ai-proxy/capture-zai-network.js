import { chromium } from 'playwright';
import fs from 'fs';

async function captureZAINetwork() {
  console.log('🕵️ Capturing Z.AI Network Traffic...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Load saved session if exists
  const sessionFile = './zai-session.json';
  if (fs.existsSync(sessionFile)) {
    const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
    if (sessionData.cookies) {
      await context.addCookies(sessionData.cookies);
      console.log('✅ Loaded saved session\n');
    }
  }
  
  // Monitor all network requests
  const capturedRequests = [];
  
  page.on('request', request => {
    const url = request.url();
    const method = request.method();
    
    // Capture API-like requests
    if (url.includes('/api/') || url.includes('/chat/') || url.includes('/completion') || url.includes('/generate')) {
      console.log('\n📡 CAPTURED REQUEST:');
      console.log('URL:', url);
      console.log('Method:', method);
      
      const headers = request.headers();
      console.log('Headers:', JSON.stringify(headers, null, 2));
      
      const postData = request.postData();
      if (postData) {
        console.log('Body:', postData);
      }
      
      capturedRequests.push({
        url,
        method,
        headers,
        postData
      });
    }
  });
  
  console.log('📍 Navigate to https://chat.z.ai and send a message...\n');
  console.log('👉 Browser open - please type and send a message in the chat\n');
  console.log('⏳ Waiting for API call...\n');
  
  await page.goto('https://chat.z.ai/', { waitUntil: 'networkidle', timeout: 60000 });
  
  // Wait for user to send a message
  console.log('💬 Please send a test message in the chat now...\n');
  console.log('⏳ Waiting 60 seconds for you to send a message...\n');
  
  // Keep browser open and wait
  await new Promise(r => setTimeout(r, 60000));
  
  console.log('\n\n📊 CAPTURED SUMMARY:');
  console.log('Total API requests:', capturedRequests.length);
  capturedRequests.forEach((req, i) => {
    console.log(`\n[${i + 1}] ${req.method} ${req.url}`);
  });
  
  // Save to file
  if (capturedRequests.length > 0) {
    fs.writeFileSync('./zai-network-capture.json', JSON.stringify(capturedRequests, null, 2));
    console.log('\n💾 Saved to: zai-network-capture.json\n');
  }
  
  await browser.close();
}

captureZAINetwork().catch(console.error);
