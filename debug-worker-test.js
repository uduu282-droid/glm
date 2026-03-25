/**
 * Debug Test for LunaPic Worker
 * Shows detailed error information
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const WORKER_URL = 'https://lunapic-proxy.llamai.workers.dev';

async function debugTest() {
  console.log('\n🔍 LunaPic Worker - DEBUG TEST\n');
  console.log('=' .repeat(70));
  
  // Find test image
  const testImages = ['test-cat.jpg', 'red-circle.jpg'];
  let testImage = null;
  
  for (const img of testImages) {
    if (fs.existsSync(img)) {
      testImage = img;
      break;
    }
  }
  
  if (!testImage) {
    console.log('❌ No test image found!');
    return;
  }
  
  console.log(`📷 Testing with: ${testImage}`);
  console.log(`🔗 Worker: ${WORKER_URL}/remove-bg`);
  console.log('=' .repeat(70) + '\n');
  
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImage));
    formData.append('x', '10');
    formData.append('y', '10');
    formData.append('fuzz', '8');
    
    console.log('📤 Uploading image...\n');
    
    const response = await axios.post(
      `${WORKER_URL}/remove-bg`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        responseType: 'arraybuffer',
        timeout: 30000,
        validateStatus: () => true // Accept any status code
      }
    );
    
    console.log('📊 RESPONSE DETAILS:');
    console.log('-'.repeat(70));
    console.log(`Status Code: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    console.log(`Content-Type: ${response.headers['content-type']}`);
    console.log(`Content-Length: ${response.data.byteLength} bytes`);
    console.log('-'.repeat(70) + '\n');
    
    // Check if it's an error
    if (response.status !== 200) {
      console.log(`❌ HTTP Error: ${response.status} ${response.statusText}\n`);
      
      // Try to show error body
      try {
        const errorText = Buffer.from(response.data).toString('utf8');
        console.log('📄 Error Response Body:');
        console.log(errorText.substring(0, 1000));
        console.log('');
      } catch (e) {}
      
      return;
    }
    
    // Check content type
    const contentType = response.headers['content-type'];
    
    if (contentType && contentType.includes('text/html')) {
      console.log('❌ ERROR: Worker returned HTML instead of PNG!\n');
      const htmlContent = Buffer.from(response.data).toString('utf8');
      console.log('📄 HTML Content (first 500 chars):');
      console.log(htmlContent.substring(0, 500));
      console.log('');
      return;
    }
    
    if (contentType && contentType.includes('image/png') || contentType.includes('image/gif')) {
      console.log(`✅ Valid ${contentType.includes('gif') ? 'GIF' : 'PNG'} response received!\n`);
      
      // Verify signature
      const header = Buffer.from(response.data).slice(0, 8);
      const isPng = header.toString('hex').startsWith('89504e470d0a1a0a');
      const isGif = header.toString('utf8').startsWith('GIF89a') || header.toString('utf8').startsWith('GIF87a');
      
      if (isPng || isGif) {
        console.log(`✅ ${isPng ? 'PNG' : 'GIF'} signature verified!\n`);
        
        // Save file
        const extension = isGif ? 'gif' : 'png';
        const outputPath = `debug_result_${Date.now()}.${extension}`;
        fs.writeFileSync(outputPath, response.data);
        
        console.log('💾 RESULT SAVED:');
        console.log(`   File: ${outputPath}`);
        console.log(`   Size: ${(response.data.byteLength / 1024).toFixed(2)} KB`);
        console.log(`   Path: ${require('path').resolve(outputPath)}\n`);
        
        console.log('🎉 SUCCESS! Open the file to see the result:\n');
        console.log(`   start ${outputPath}\n`);
      } else {
        console.log('⚠️  Invalid PNG signature!');
        console.log(`   Expected: 89 50 4E 47 0D 0A 1A 0A`);
        console.log(`   Got:      ${header.toString('hex')}\n`);
      }
    } else {
      console.log(`⚠️  Unknown content type: ${contentType}`);
    }
    
  } catch (error) {
    console.error('❌ REQUEST FAILED:\n');
    console.log('-'.repeat(70));
    console.log(`Error Code: ${error.code}`);
    console.log(`Message: ${error.message}`);
    console.log('-'.repeat(70) + '\n');
    
    if (error.response) {
      console.log('📡 Server responded with error:');
      console.log(`   Status: ${error.response.status}`);
      try {
        const errorBody = Buffer.from(error.response.data).toString('utf8');
        console.log(`   Body: ${errorBody.substring(0, 500)}\n`);
      } catch (e) {}
    }
  }
}

debugTest().catch(console.error);
