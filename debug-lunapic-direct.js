/**
 * Debug LunaPic - Check if we're getting error images
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function debugLunaPic() {
  console.log('\n🔍 DEBUGGING LUNAPIC - Finding the error\n');
  
  const testImage = 'test-cat.jpg';
  
  try {
    // Step 1: Get session
    console.log('Step 1: Getting session...');
    const sessionRes = await axios.get('https://www2.lunapic.com/editor/?action=transparent', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    let cookies = {};
    if (sessionRes.headers['set-cookie']) {
      sessionRes.headers['set-cookie'].forEach(cookie => {
        const match = cookie.match(/([^=]+)=([^;]+)/);
        if (match) cookies[match[1]] = match[2];
      });
    }
    
    const sessionId = cookies['icon_id'];
    console.log(`✅ Session ID: ${sessionId}\n`);
    
    // Step 2: Upload
    console.log('Step 2: Uploading image...');
    const uploadForm = new FormData();
    uploadForm.append('file', fs.createReadStream(testImage));
    
    let cookieString = Object.entries(cookies).map(([k,v]) => `${k}=${v}`).join('; ');
    
    const uploadRes = await axios.post('https://www2.lunapic.com/editor/', uploadForm, {
      headers: {
        ...uploadForm.getHeaders(),
        'User-Agent': 'Mozilla/5.0',
        'Origin': 'https://www2.lunapic.com',
        'Referer': 'https://www2.lunapic.com/editor/?action=transparent',
        'Cookie': cookieString
      }
    });
    
    console.log('✅ Uploaded\n');
    
    // Update cookies
    if (uploadRes.headers['set-cookie']) {
      uploadRes.headers['set-cookie'].forEach(cookie => {
        const match = cookie.match(/([^=]+)=([^;]+)/);
        if (match) cookies[match[1]] = match[2];
      });
    }
    
    // Step 3: Apply effect
    console.log('Step 3: Applying background removal...');
    const transForm = new FormData();
    transForm.append('savenav', 'LunaPic > Edit > Transparent Background');
    transForm.append('fuzz', '8');
    transForm.append('fill', 'area');
    transForm.append('action', 'do-trans');
    transForm.append('x', '10');
    transForm.append('y', '10');
    
    cookieString = Object.entries(cookies).map(([k,v]) => `${k}=${v}`).join('; ');
    
    const transRes = await axios.post('https://www2.lunapic.com/editor/', transForm, {
      headers: {
        ...transForm.getHeaders(),
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Origin': 'https://www2.lunapic.com',
        'Referer': 'https://www2.lunapic.com/editor/',
        'Cookie': cookieString
      },
      responseType: 'text'
    });
    
    console.log('✅ Effect applied\n');
    
    // NO WAIT - Download immediately!
    console.log('⚡ Downloading IMMEDIATELY (no wait)...\n');
    
    // Step 4: Try to get result
    console.log('Step 4: Downloading result...');
    const timestamp = Math.floor(Math.random() * 10000000000);
    const resultUrl = `https://www2.lunapic.com/editor/working/${sessionId}?${timestamp}`;
    
    console.log(`URL: ${resultUrl}\n`);
    
    const resultRes = await axios.get(resultUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Ch-Ua': '"Not-A.Brand";v="24", "Chromium";v="146"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Referer': 'https://www2.lunapic.com/editor/',
        'Cookie': cookieString
      },
      responseType: 'arraybuffer',
      maxRedirects: 0,
      validateStatus: () => true
    });
    
    console.log('📊 RESULT DETAILS:');
    console.log('=' .repeat(70));
    console.log(`Status: ${resultRes.status}`);
    console.log(`Content-Type: ${resultRes.headers['content-type']}`);
    console.log(`Size: ${resultRes.data.byteLength} bytes`);
    console.log('=' .repeat(70));
    console.log('');
    
    // Check content
    const buffer = Buffer.from(resultRes.data);
    const header = buffer.slice(0, 8);
    const hexHeader = header.toString('hex');
    
    console.log('🔍 CONTENT ANALYSIS:');
    console.log('=' .repeat(70));
    console.log(`First 8 bytes (hex): ${hexHeader}`);
    console.log(`Is GIF89a: ${header.toString('utf8').startsWith('GIF89a') ? 'YES ✅' : 'NO ❌'}`);
    console.log(`Is PNG: ${hexHeader === '89504e470d0a1a0a' ? 'YES ✅' : 'NO ❌'}`);
    console.log(`Is HTML: ${header.toString('utf8').toLowerCase().includes('<!doctype') || header.toString('utf8').toLowerCase().includes('<html') ? 'YES ❌' : 'NO ✅'}`);
    console.log('=' .repeat(70));
    console.log('');
    
    // If it's HTML, show it
    if (header.toString('utf8').toLowerCase().includes('<!doctype') || header.toString('utf8').toLowerCase().includes('<html')) {
      const htmlContent = buffer.toString('utf8');
      console.log('❌ GOT HTML ERROR PAGE:');
      console.log('=' .repeat(70));
      
      // Extract error message
      const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        console.log(`Title: ${titleMatch[1]}`);
      }
      
      // Look for error messages
      const errorPatterns = [
        /expired/i,
        /not found/i,
        /error/i,
        /invalid/i
      ];
      
      errorPatterns.forEach(pattern => {
        const match = htmlContent.match(pattern);
        if (match) {
          console.log(`Found keyword: "${match[0]}"`);
        }
      });
      
      console.log('\nFirst 500 chars:');
      console.log(htmlContent.substring(0, 500));
      console.log('=' .repeat(70));
      
      // Save HTML
      const htmlFile = `error_page_${Date.now()}.html`;
      fs.writeFileSync(htmlFile, htmlContent);
      console.log(`\n💾 Full HTML saved to: ${htmlFile}`);
      
    } else if (header.toString('utf8').startsWith('GIF89a')) {
      console.log('✅ Got valid GIF! Saving...');
      
      // Save and check if it contains text
      const outputFile = `debug_direct_${Date.now()}.gif`;
      fs.writeFileSync(outputFile, buffer);
      console.log(`💾 Saved to: ${outputFile}`);
      console.log(`📂 Opening file...`);
      
      const { exec } = require('child_process');
      exec(`start ${outputFile}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugLunaPic().catch(console.error);
