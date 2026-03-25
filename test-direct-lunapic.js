/**
 * Direct LunaPic Test (Bypass Worker)
 * Tests LunaPic API directly to isolate the issue
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testDirectLunaPic() {
  console.log('\n🔍 Testing LunaPic API DIRECTLY (bypassing worker)\n');
  console.log('=' .repeat(70));
  
  const testImage = 'test-cat.jpg';
  
  if (!fs.existsSync(testImage)) {
    console.log('❌ No test image found!');
    return;
  }
  
  console.log(`📷 Testing with: ${testImage}`);
  console.log('🔗 Target: https://www2.lunapic.com/editor/');
  console.log('=' .repeat(70) + '\n');
  
  try {
    // Step 1: Get session cookie
    console.log('Step 1: Establishing session with LunaPic...');
    const sessionResponse = await axios.get(
      'https://www2.lunapic.com/editor/?action=transparent',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        maxRedirects: 5
      }
    );
    
    const setCookie = sessionResponse.headers['set-cookie'];
    let sessionId = null;
    let cookies = '';
    
    if (setCookie) {
      const iconIdMatch = setCookie.find(c => c.includes('icon_id='));
      if (iconIdMatch) {
        sessionId = iconIdMatch.match(/icon_id=([^;]+)/)[1];
        cookies = setCookie.map(c => c.split(';')[0]).join('; ');
        console.log(`✅ Session established: ${sessionId}`);
      }
    }
    
    if (!sessionId) {
      console.log('❌ Failed to get session cookie!');
      console.log('Set-Cookie headers:', setCookie);
      return;
    }
    
    // Step 2: Upload image
    console.log('\nStep 2: Uploading image...');
    const uploadForm = new FormData();
    uploadForm.append('file', fs.createReadStream(testImage));
    uploadForm.append('action', 'upload');
    
    const uploadResponse = await axios.post(
      'https://www2.lunapic.com/editor/',
      uploadForm,
      {
        headers: {
          ...uploadForm.getHeaders(),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://www2.lunapic.com',
          'Referer': 'https://www2.lunapic.com/editor/',
          'Cookie': cookies
        },
        maxRedirects: 5
      }
    );
    
    console.log('✅ Image uploaded successfully');
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Apply background removal
    console.log('\nStep 3: Applying background removal...');
    const transForm = new FormData();
    transForm.append('action', 'do-trans');
    transForm.append('fuzz', '8');
    transForm.append('fill', 'area');
    transForm.append('x', '10');
    transForm.append('y', '10');
    transForm.append('redo', '1');
    
    const resultResponse = await axios.post(
      'https://www2.lunapic.com/editor/?action=do-trans',
      transForm,
      {
        headers: {
          ...transForm.getHeaders(),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/png,image/*,*/*;q=0.5',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://www2.lunapic.com',
          'Referer': 'https://www2.lunapic.com/editor/',
          'Cookie': cookies
        },
        responseType: 'arraybuffer',
        maxRedirects: 5
      }
    );
    
    console.log('\n📊 RESPONSE DETAILS:');
    console.log('-'.repeat(70));
    console.log(`Status: ${resultResponse.status}`);
    console.log(`Content-Type: ${resultResponse.headers['content-type']}`);
    console.log(`Size: ${resultResponse.data.byteLength} bytes`);
    console.log('-'.repeat(70) + '\n');
    
    // Check content type
    const contentType = resultResponse.headers['content-type'];
    
    if (contentType && contentType.includes('text/html')) {
      console.log('❌ LunaPic returned HTML error page!\n');
      const htmlContent = Buffer.from(resultResponse.data).toString('utf8').substring(0, 1000);
      console.log('📄 HTML Content:');
      console.log(htmlContent);
      console.log('\n');
      return;
    }
    
    // Verify PNG
    const header = Buffer.from(resultResponse.data).slice(0, 8);
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const isValid = header.compare(pngSignature) === 0;
    
    if (isValid) {
      console.log('✅ Valid PNG received from LunaPic!\n');
      
      // Save result
      const outputPath = `direct_lunapic_result_${Date.now()}.png`;
      fs.writeFileSync(outputPath, resultResponse.data);
      
      console.log('💾 RESULT SAVED:');
      console.log(`   File: ${outputPath}`);
      console.log(`   Size: ${(resultResponse.data.byteLength / 1024).toFixed(2)} KB\n`);
      
      console.log('🎉 SUCCESS! LunaPic API is working!\n');
      console.log('💡 Open the result:\n');
      console.log(`   start ${outputPath}\n`);
    } else {
      console.log('⚠️  Invalid PNG signature!');
      console.log(`   Got: ${header.toString('hex')}\n`);
    }
    
  } catch (error) {
    console.error('❌ REQUEST FAILED:\n');
    console.log('-'.repeat(70));
    console.log(`Error: ${error.message}`);
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Content-Type: ${error.response.headers['content-type']}`);
      
      try {
        const body = Buffer.from(error.response.data).toString('utf8');
        if (body.includes('<!DOCTYPE') || body.includes('<html')) {
          console.log('\n❌ Received HTML error page\n');
          console.log(body.substring(0, 500));
        } else {
          console.log('\n📄 Response body:');
          console.log(body.substring(0, 500));
        }
      } catch (e) {}
    }
    
    console.log('-'.repeat(70) + '\n');
  }
}

testDirectLunaPic().catch(console.error);
