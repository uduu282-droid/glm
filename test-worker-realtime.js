/**
 * Real-time LunaPic Worker Test
 * Shows exactly what the worker returns
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testWorker() {
  console.log('\n🔬 Testing LunaPic Worker - Real-time Check\n');
  console.log('=' .repeat(70));
  
  const testImage = 'test-cat.jpg';
  if (!fs.existsSync(testImage)) {
    console.log('❌ No test image found!');
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImage));
    formData.append('x', '10');
    formData.append('y', '10');
    
    console.log('📤 Uploading to worker...');
    console.log('   Image:', testImage);
    console.log('   Size:', (fs.statSync(testImage).size / 1024).toFixed(2), 'KB\n');
    
    const response = await axios.post(
      'https://lunapic-proxy.llamai.workers.dev/remove-bg',
      formData,
      {
        headers: formData.getHeaders(),
        responseType: 'arraybuffer',
        maxRedirects: 0,
        validateStatus: () => true // Accept all status codes
      }
    );
    
    console.log('📊 RESPONSE DETAILS:');
    console.log('-' .repeat(70));
    console.log(`   Status Code: ${response.status}`);
    console.log(`   Status Text: ${response.statusText}`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    console.log(`   Content-Length: ${response.data.byteLength} bytes (${(response.data.byteLength/1024).toFixed(2)} KB)`);
    console.log(`   Response URL: ${response.request.res?.responseUrl || 'N/A'}`);
    console.log('-' .repeat(70));
    console.log('');
    
    // Check if it's JSON (error)
    if (response.headers['content-type']?.includes('application/json')) {
      const jsonBody = JSON.parse(Buffer.from(response.data).toString('utf8'));
      console.log('❌ ERROR RESPONSE:');
      console.log(JSON.stringify(jsonBody, null, 2));
      return;
    }
    
    // Verify image format
    const buffer = Buffer.from(response.data);
    const header = buffer.slice(0, 8);
    const hexHeader = header.toString('hex');
    
    console.log('🔍 IMAGE VALIDATION:');
    console.log('-' .repeat(70));
    console.log(`   First 8 bytes (hex): ${hexHeader}`);
    console.log(`   PNG signature (89504e470d0a1a0a): ${hexHeader === '89504e470d0a1a0a' ? '✅ YES' : '❌ NO'}`);
    console.log(`   GIF signature (GIF89a): ${header.toString('utf8').startsWith('GIF89a') ? '✅ YES' : '❌ NO'}`);
    console.log(`   GIF signature (GIF87a): ${header.toString('utf8').startsWith('GIF87a') ? '✅ YES' : '❌ NO'}`);
    console.log('-' .repeat(70));
    console.log('');
    
    // Save file
    const isPng = hexHeader === '89504e470d0a1a0a';
    const isGif = header.toString('utf8').startsWith('GIF89a') || header.toString('utf8').startsWith('GIF87a');
    const extension = isPng ? 'png' : isGif ? 'gif' : 'bin';
    const outputPath = `realtime_result_${Date.now()}.${extension}`;
    
    fs.writeFileSync(outputPath, buffer);
    
    console.log('💾 RESULT SAVED:');
    console.log('-' .repeat(70));
    console.log(`   File: ${outputPath}`);
    console.log(`   Format: ${isPng ? 'PNG' : isGif ? 'GIF' : 'UNKNOWN'} (.${extension})`);
    console.log(`   Size: ${(buffer.length/1024).toFixed(2)} KB`);
    console.log('-' .repeat(70));
    console.log('');
    
    if (isPng || isGif) {
      console.log('✅ SUCCESS! Opening result...\n');
      const { exec } = require('child_process');
      exec(`start ${outputPath}`);
    } else {
      console.log('⚠️  WARNING: Unknown format!');
      console.log('   First 100 chars as text:');
      console.log(buffer.slice(0, 100).toString('utf8'));
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data?.toString('utf8').substring(0, 200));
    }
  }
}

testWorker().catch(console.error);
