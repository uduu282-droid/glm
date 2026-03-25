const puppeteer = require('puppeteer');
const fs = require('fs');

async function findSignatureAlgorithm() {
  console.log('🔍 Searching for PhotoGrid signature algorithm...\n');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Intercept all JS files
  const jsFiles = new Map();
  
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.resourceType() === 'script') {
      const url = request.url();
      if (url.includes('photogrid')) {
        console.log(`📄 Found script: ${url}`);
        jsFiles.set(url, null);
      }
    }
    request.continue();
  });
  
  page.on('response', async response => {
    if (response.request().resourceType() === 'script') {
      const url = response.url();
      if (jsFiles.has(url)) {
        try {
          const text = await response.text();
          jsFiles.set(url, text);
          
          // Search for signature-related code
          if (text.includes('sig') || text.includes('sign') || text.includes('hash')) {
            console.log(`   ⚡ Contains signature keywords!`);
            
            // Extract relevant lines
            const lines = text.split('\n');
            lines.forEach((line, idx) => {
              if (line.match(/sig[a-z]*[:=]/i) || line.includes('XX') || line.includes('sha256')) {
                console.log(`   Line ${idx + 1}: ${line.trim().substring(0, 200)}`);
              }
            });
          }
        } catch (e) {
          // Ignore binary files
        }
      }
    }
  });
  
  console.log('🌐 Loading PhotoGrid...');
  await page.goto('https://www.photogrid.app/en/background-remover/', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Save all captured JS files
  console.log('\n💾 Saving JS files...');
  let counter = 0;
  for (const [url, content] of jsFiles.entries()) {
    if (content) {
      const filename = `photo-grid-js-${counter++}.txt`;
      fs.writeFileSync(filename, content);
      console.log(`   Saved: ${filename} (${content.length} bytes)`);
    }
  }
  
  await browser.close();
  console.log('\n✅ Analysis complete!\n');
}

findSignatureAlgorithm().catch(console.error);
