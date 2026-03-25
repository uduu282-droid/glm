import https from 'node:https';

const apiKey = 'pk_live_Px9T7cai';
const sites = [
  { url: 'https://chatgpt.com', key: '0x4AAAAAAACn4dxJshRCXdgD' },
  { url: 'https://gemini.google.com', key: '0x4AAAAAAACn4dxJshRCXdgD' },
  { url: 'https://poe.com', key: '0x4AAAAAAACn4dxJshRCXdgD' },
  { url: 'https://claude.ai', key: '0x4AAAAAAACn4dxJshRCXdgD' },
  { url: 'https://huggingface.co/chat', key: '0x4AAAAAAACn4dxJshRCXdgD' }
];

async function testSite(siteInfo, index) {
  return new Promise((resolve) => {
    const url = `https://cf.zvx.workers.dev/?apikey=${apiKey}&url=${siteInfo.url}&key=${siteInfo.key}`;
    
    console.log(`\n${index + 1}. Testing: ${siteInfo.url}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`   Status: ${json.status}`);
          console.log(`   Time: ${json.elapsed_time}s`);
          if (json.token) {
            console.log(`   Token length: ${json.token.length} characters`);
          }
          resolve({ site: siteInfo.url, success: json.status === 'success', time: json.elapsed_time });
        } catch (e) {
          console.log(`   Error: Failed to parse response`);
          resolve({ site: siteInfo.url, success: false, error: 'Parse error' });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   Error: ${error.message}`);
      resolve({ site: siteInfo.url, success: false, error: error.message });
    });
    
    req.setTimeout(15000, () => {
      console.log(`   Error: Request timeout`);
      req.destroy();
      resolve({ site: siteInfo.url, success: false, error: 'Timeout' });
    });
  });
}

async function runAllTests() {
  console.log('=== AI Chat Website Protection Bypass Test ===');
  console.log(`Using API Key: ${apiKey}`);
  
  const results = [];
  
  for (let i = 0; i < sites.length; i++) {
    const result = await testSite(sites[i], i);
    results.push(result);
  }
  
  console.log('\n=== SUMMARY ===');
  const successful = results.filter(r => r.success).length;
  console.log(`Successful: ${successful}/${results.length}`);
  
  console.log('\nSuccessful sites:');
  results.filter(r => r.success).forEach(r => {
    console.log(`  ✓ ${r.site} (${r.time}s)`);
  });
  
  console.log('\nFailed sites:');
  results.filter(r => !r.success).forEach(r => {
    console.log(`  ✗ ${r.site} - ${r.error || 'Failed'}`);
  });
}

runAllTests();