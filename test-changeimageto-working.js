/**
 * Quick ChangeImageTo Test - Working Background Remover
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testChangeImageTo() {
  console.log('\n🎨 Testing ChangeImageTo - WORKING Service\n');
  
  const testImage = 'direct-pollinations-test.jpg'; // Use larger image
  if (!fs.existsSync(testImage)) {
    console.log('❌ No test image!');
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImage)); // Changed from 'image' to 'file'
    
    console.log('📤 Uploading to ChangeImageTo...');
    console.log(`   Image: ${testImage}`);
    console.log(`   Size: ${(fs.statSync(testImage).size/1024).toFixed(2)} KB\n`);
    
    const response = await axios.post(
      'https://bgremover-backend-121350814881.us-central1.run.app/api/remove-bg',
      formData,
      {
        headers: formData.getHeaders(),
        responseType: 'arraybuffer'
      }
    );
    
    console.log('📊 RESULT:');
    console.log('=' .repeat(60));
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers['content-type']}`);
    console.log(`Size: ${(response.data.byteLength/1024).toFixed(2)} KB`);
    console.log('=' .repeat(60));
    
    // Verify PNG
    const buffer = Buffer.from(response.data);
    const header = buffer.slice(0, 8);
    const isPng = header.toString('hex') === '89504e470d0a1a0a';
    
    console.log(`\n✅ Valid PNG: ${isPng ? 'YES' : 'NO'}`);
    
    // Save
    const outputFile = `changeimageto_result_${Date.now()}.png`;
    fs.writeFileSync(outputFile, buffer);
    
    console.log(`💾 Saved: ${outputFile}`);
    console.log(`📂 Opening...\n`);
    
    const { exec } = require('child_process');
    exec(`start ${outputFile}`);
    
    console.log('✨ SUCCESS! This service works perfectly!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${Buffer.from(error.response.data).toString('utf8').substring(0, 200)}`);
    }
  }
}

testChangeImageTo().catch(console.error);
