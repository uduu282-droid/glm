/**
 * LunaPic Traffic Analysis - Check HTML Response
 * Maybe the result image URL is in the HTML response?
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function analyzeLunaPicResponse() {
  console.log('\n🔍 LunaPic Response Analysis\n');
  console.log('=' .repeat(70));
  
  const testImage = 'test-cat.jpg';
  
  if (!fs.existsSync(testImage)) {
    console.log('❌ No test image found!');
    return;
  }
  
  try {
    // Step 1: Get session
    console.log('Step 1: Getting session...');
    const sessionResponse = await axios.get(
      'https://www2.lunapic.com/editor/?action=transparent',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      }
    );
    
    const setCookie = sessionResponse.headers['set-cookie'];
    let cookies = {};
    
    if (setCookie) {
      setCookie.forEach(cookie => {
        const match = cookie.match(/^([^=]+)=([^;]+)/);
        if (match) {
          cookies[match[1]] = match[2];
        }
      });
    }
    
    const sessionId = cookies['icon_id'];
    console.log(`✅ Session: ${sessionId}`);
    
    // Step 2: Upload
    console.log('\nStep 2: Uploading image...');
    const uploadForm = new FormData();
    uploadForm.append('file', fs.createReadStream(testImage));
    
    const cookieString = Object.entries(cookies).map(([k,v]) => `${k}=${v}`).join('; ');
    
    const uploadResponse = await axios.post(
      'https://www2.lunapic.com/editor/',
      uploadForm,
      {
        headers: {
          ...uploadForm.getHeaders(),
          'User-Agent': 'Mozilla/5.0',
          'Origin': 'https://www2.lunapic.com',
          'Referer': 'https://www2.lunapic.com/editor/?action=transparent',
          'Cookie': cookieString
        }
      }
    );
    
    console.log('✅ Uploaded');
    
    // Update cookies
    if (uploadResponse.headers['set-cookie']) {
      uploadResponse.headers['set-cookie'].forEach(cookie => {
        const match = cookie.match(/^([^=]+)=([^;]+)/);
        if (match) {
          cookies[match[1]] = match[2];
        }
      });
    }
    
    // Step 3: Apply effect
    console.log('\nStep 3: Applying background removal...');
    const transForm = new FormData();
    transForm.append('savenav', 'LunaPic > Edit > Transparent Background');
    transForm.append('fuzz', '8');
    transForm.append('fill', 'area');
    transForm.append('action', 'do-trans');
    transForm.append('x', '10');
    transForm.append('y', '10');
    
    const newCookieString = Object.entries(cookies).map(([k,v]) => `${k}=${v}`).join('; ');
    
    const effectResponse = await axios.post(
      'https://www2.lunapic.com/editor/',
      transForm,
      {
        headers: {
          ...transForm.getHeaders(),
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Origin': 'https://www2.lunapic.com',
          'Referer': 'https://www2.lunapic.com/editor/',
          'Cookie': cookieString
        },
        responseType: 'text' // Get as text to parse
      }
    );
    
    console.log('✅ Effect applied');
    console.log('\n📄 Analyzing HTML response...\n');
    
    const htmlContent = effectResponse.data;
    
    // Look for image URLs or working directory references
    const imgMatches = htmlContent.match(/\/editor\/working\/[^"'\s)]+/gi);
    if (imgMatches) {
      console.log('🖼️  Found image URLs in HTML:');
      imgMatches.forEach((match, i) => {
        console.log(`   ${i+1}. ${match}`);
      });
    }
    
    // Look for -bt-1 pattern (background removed)
    const btMatches = htmlContent.match(/[^\s"'()]*-bt-[0-9]+[^\s"'()]*/gi);
    if (btMatches) {
      console.log('\n🎯 Found -bt- references:');
      btMatches.forEach((match, i) => {
        console.log(`   ${i+1}. ${match}`);
      });
    }
    
    // Look for any URLs with session ID
    if (sessionId) {
      const sessionMatches = htmlContent.match(new RegExp(`[^\\s"'()]*${sessionId}[^\\s"'()]*`, 'gi'));
      if (sessionMatches) {
        console.log('\n📋 Found URLs with session ID:');
        sessionMatches.slice(0, 10).forEach((match, i) => {
          console.log(`   ${i+1}. ${match}`);
        });
      }
    }
    
    // Save HTML for manual inspection
    const htmlFile = `lunapic_response_${Date.now()}.html`;
    fs.writeFileSync(htmlFile, htmlContent);
    console.log(`\n💾 Full HTML saved to: ${htmlFile}`);
    console.log('\n🔍 Open and inspect the HTML to find the actual image URL!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Content-Type: ${error.response.headers['content-type']}`);
    }
  }
}

analyzeLunaPicResponse().catch(console.error);
