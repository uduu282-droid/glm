// Quick debug test to see what's happening
import { chromium } from 'playwright';
import fs from 'fs';

const sessionFile = 'c:\\Users\\Ronit\\Downloads\\test models 2\\universal-ai-proxy\\sessions\\deepseek_session.json';
const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));

console.log('🧪 Testing DeepSeek session directly...\n');

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
await context.addCookies(sessionData.cookies || []);

const page = await context.newPage();
console.log('🌐 Navigating to DeepSeek...');
await page.goto('https://chat.deepseek.com', { waitUntil: 'networkidle' });

console.log('⏳ Waiting for page to load...');
await new Promise(r => setTimeout(r, 5000));

console.log('🔍 Checking current URL:', page.url());

// Try to make a test request
console.log('\n📤 Making test API request...');
const result = await page.evaluate(async () => {
  try {
    const response = await fetch('/api/v0/chat/completion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 10
      }),
      credentials: 'include'
    });
    
    console.log('Response status:', response.status);
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
});

console.log('\n📥 Result:', JSON.stringify(result, null, 2));

if (result.code === 40003) {
  console.log('\n⚠️  Token is invalid - need to re-login manually in browser!');
  console.log('\n👉 Browser window is open - please login at DeepSeek...');
  console.log('Press ENTER when done...\n');
  
  await new Promise(r => process.stdin.once('data', r));
  
  // Extract new session
  console.log('💾 Extracting new session...');
  const cookies = await context.cookies();
  const localStorage = await page.evaluate(() => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) data[key] = localStorage.getItem(key);
    }
    return data;
  });
  
  sessionData.cookies = cookies.map(c => ({
    name: c.name, value: c.value, domain: c.domain, path: c.path, expires: c.expires
  }));
  sessionData.localStorage = localStorage;
  
  fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
  console.log('✅ Session saved!\n');
}

await browser.close();
console.log('Done!\n');
