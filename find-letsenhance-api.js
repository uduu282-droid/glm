/**
 * Find LetsEnhance API endpoints from loaded page
 */

const puppeteer = require('puppeteer');

async function findLetsEnhanceAPI() {
  console.log('🔍 Finding LetsEnhance API endpoints...\n');
  
  const browser = await puppeteer.launch({ 
    headless: true, // Run headless for faster execution
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Listen for all requests
  const requests = [];
  page.on('request', request => {
    const url = request.url();
    // Capture ALL requests including API calls
    if (url.includes('letsenhance.io') && !url.includes('.css') && !url.includes('.woff')) {
      requests.push({
        method: request.method(),
        url: url,
        headers: request.headers()
      });
    }
  });
  
  console.log('🌐 Loading page...');
  await page.goto('https://letsenhance.io/background-removal', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  console.log('✅ Page loaded\n');
  
  // Execute JavaScript to find API URLs in the code
  const apiUrls = await page.evaluate(() => {
    const found = new Set();
    
    // Search in all scripts
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
      if (script.src) {
        // External script - check URL
        if (script.src.includes('api') || script.src.includes('graphql')) {
          found.add(script.src);
        }
      }
      if (script.textContent) {
        // Inline script - search for API patterns
        const text = script.textContent;
        
        // Look for API endpoints
        const patterns = [
          /https?:\/\/[^\s"'<>]*api[^\s"'<>]*/gi,
          /\/api\/[^\s"'<>]*/g,
          /graphql/gi,
          /fetch\(['"`](.*?)['"`]/g,
          /axios\.(get|post|put|delete)\(['"`](.*?)['"`]/g
        ];
        
        patterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(text)) !== null) {
            const url = match[1] || match[0];
            if (url.includes('api') || url.includes('upload') || url.includes('remove')) {
              found.add(url.replace(/['"`]/g, ''));
            }
          }
        });
      }
    }
    
    // Check global variables that might contain API config
    const globals = ['API_URL', 'API_BASE', 'BASE_URL', 'config', 'CONFIG'];
    globals.forEach(name => {
      try {
        if (window[name]) {
          found.add(`${name}: ${JSON.stringify(window[name])}`);
        }
      } catch(e) {}
    });
    
    return Array.from(found);
  });
  
  console.log('📋 Found API Endpoints:\n');
  apiUrls.forEach((url, i) => {
    console.log(`${i + 1}. ${url}\n`);
  });
  
  // Also check network requests
  console.log('\n📡 Network Requests with "api" or "upload":\n');
  const apiRequests = requests.filter(r => 
    r.url.toLowerCase().includes('api') || 
    r.url.toLowerCase().includes('upload') ||
    r.url.toLowerCase().includes('process')
  );
  
  apiRequests.forEach((r, i) => {
    console.log(`${i + 1}. ${r.method} ${new URL(r.url).pathname}`);
    if (r.headers['authorization']) {
      console.log(`   Auth: ${r.headers['authorization'].substring(0, 50)}...`);
    }
    console.log('');
  });
  
  await browser.close();
  
  console.log('\n✨ Analysis complete!');
}

findLetsEnhanceAPI().catch(console.error);
