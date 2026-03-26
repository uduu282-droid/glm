import { chromium } from 'playwright';

async function testZAI() {
  console.log('🧪 Testing https://chat.z.ai...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('📍 Navigating to https://chat.z.ai...\n');
    await page.goto('https://chat.z.ai/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    console.log('✅ Page loaded!\n');
    console.log('🔍 Final URL:', page.url());
    console.log('📄 Title:', await page.title());
    
    // Check for login requirements
    const content = await page.content();
    
    if (content.includes('login') || content.includes('sign in') || content.includes('auth')) {
      console.log('\n⚠️  Login required\n');
    } else {
      console.log('\n✅ May be accessible without login!\n');
    }
    
    // Try to find chat interface
    const chatInput = await page.$('textarea, input[placeholder*="message"], input[placeholder*="type"]');
    if (chatInput) {
      console.log('✅ Found chat input field!\n');
    } else {
      console.log('❌ No chat input found\n');
    }
    
    // Keep browser open for inspection
    console.log('👀 Browser open for inspection...\n');
    console.log('Press ENTER to close...\n');
    await new Promise(r => process.stdin.once('data', r));
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testZAI().catch(console.error);
