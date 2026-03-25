/**
 * LunaPic Background Remover - CORRECTED Version
 * Based on actual captured traffic flow
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function correctLunaPicTest() {
  console.log('\n🎨 LunaPic Background Removal - CORRECTED TEST\n');
  console.log('=' .repeat(70));
  
  const testImage = 'test-cat.jpg';
  
  if (!fs.existsSync(testImage)) {
    console.log('❌ No test image found!');
    return;
  }
  
  console.log(`📷 Testing with: ${testImage}`);
  console.log('=' .repeat(70) + '\n');
  
  try {
    // Step 1: Get session
    console.log('Step 1: Establishing session...');
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
    let sessionId = null;
    let cookies = '';
    
    if (setCookie) {
      const iconIdMatch = setCookie.find(c => c.includes('icon_id='));
      if (iconIdMatch) {
        sessionId = iconIdMatch.match(/icon_id=([^;]+)/)[1];
        cookies = setCookie.map(c => c.split(';')[0]).join('; ');
        console.log(`✅ Session ID: ${sessionId}`);
      }
    }
    
    if (!sessionId) {
      console.log('❌ Failed to get session!\n');
      return;
    }
    
    // Step 2: Upload image to /editor/ (POST)
    console.log('\nStep 2: Uploading image...');
    const uploadForm = new FormData();
    uploadForm.append('file', fs.createReadStream(testImage));
    // Don't need 'action' parameter for upload
    
    await axios.post(
      'https://www2.lunapic.com/editor/',
      uploadForm,
      {
        headers: {
          ...uploadForm.getHeaders(),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://www2.lunapic.com',
          'Referer': 'https://www2.lunapic.com/editor/?action=transparent',
          'Cookie': cookies
        },
        maxRedirects: 5
      }
    );
    
    console.log('✅ Image uploaded');
    
    // Wait for server processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Step 3: Apply background removal (POST to /editor/)
    console.log('\nStep 3: Applying background removal...');
    const transForm = new FormData();
    transForm.append('savenav', 'LunaPic > Edit > Transparent Background');
    transForm.append('fuzz', '8');
    transForm.append('fill', 'area');
    transForm.append('action', 'do-trans');
    transForm.append('x', '10');
    transForm.append('y', '10');
    
    const resultPageResponse = await axios.post(
      'https://www2.lunapic.com/editor/',
      transForm,
      {
        headers: {
          ...transForm.getHeaders(),
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
    
    console.log('✅ Background removal applied');
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 4: Download result from /editor/working/{session_id}-bt-1
    console.log('\nStep 4: Downloading result...');
    const resultUrl = `https://www2.lunapic.com/editor/working/${sessionId}-bt-1`;
    console.log(`   Result URL: ${resultUrl}`);
    
    const imageResponse = await axios.get(resultUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/png,image/*,*/*;q=0.5',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': cookies
      },
      responseType: 'arraybuffer',
      maxRedirects: 5
    });
    
    console.log('\n📊 RESPONSE DETAILS:');
    console.log('-'.repeat(70));
    console.log(`Status: ${imageResponse.status}`);
    console.log(`Content-Type: ${imageResponse.headers['content-type']}`);
    console.log(`Size: ${imageResponse.data.byteLength} bytes`);
    console.log('-'.repeat(70) + '\n');
    
    // Verify PNG
    const header = Buffer.from(imageResponse.data).slice(0, 8);
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const isValid = header.compare(pngSignature) === 0;
    
    if (isValid) {
      console.log('✅ Valid PNG received!\n');
      
      // Save result
      const outputPath = `corrected_result_${Date.now()}.png`;
      fs.writeFileSync(outputPath, imageResponse.data);
      
      console.log('💾 RESULT SAVED:');
      console.log(`   File: ${outputPath}`);
      console.log(`   Size: ${(imageResponse.data.byteLength / 1024).toFixed(2)} KB\n`);
      
      console.log('🎉 SUCCESS!\n');
      console.log('💡 Open the result:\n');
      console.log(`   start ${outputPath}\n`);
    } else {
      console.log('⚠️  Not a valid PNG!');
      console.log(`   First bytes: ${header.toString('hex')}\n`);
      
      // Check if it's HTML
      const firstBytes = header.toString('utf8');
      if (firstBytes.includes('<!DOCTYPE') || firstBytes.includes('<html')) {
        console.log('❌ Received HTML page instead of image\n');
      }
    }
    
  } catch (error) {
    console.error('❌ FAILED:\n');
    console.log('-'.repeat(70));
    console.log(`Error: ${error.message}`);
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`URL: ${error.config?.url}`);
      
      try {
        const body = Buffer.from(error.response.data).toString('utf8').substring(0, 500);
        console.log(`\nResponse: ${body}\n`);
      } catch (e) {}
    }
    
    console.log('-'.repeat(70) + '\n');
  }
}

correctLunaPicTest().catch(console.error);
