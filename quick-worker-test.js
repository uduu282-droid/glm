/**
 * Quick Test for Deployed LunaPic Worker
 * Tests the background removal endpoint on production worker
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Your deployed worker URL
const WORKER_URL = 'https://lunapic-proxy.llamai.workers.dev';

async function quickTest() {
  console.log('\n🧪 Testing Deployed LunaPic Worker\n');
  console.log('=' .repeat(60));
  console.log(`Worker URL: ${WORKER_URL}`);
  console.log('=' .repeat(60) + '\n');
  
  // Find a test image
  const testImages = ['test-cat.jpg', 'test-red-pixel.png', 'test-flux.jpg', 'red-circle.jpg'];
  let testImage = null;
  
  for (const img of testImages) {
    if (fs.existsSync(img)) {
      testImage = img;
      break;
    }
  }
  
  if (!testImage) {
    console.log('❌ No test image found. Please provide an image file.');
    console.log('Usage: node quick-worker-test.js <image-file>');
    return;
  }
  
  console.log(`📷 Using test image: ${testImage}\n`);
  
  try {
    // Test background removal
    console.log('🚀 Sending request to worker...\n');
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImage));
    formData.append('x', '10');  // Click point X
    formData.append('y', '10');  // Click point Y
    formData.append('fuzz', '8'); // Tolerance
    
    const startTime = Date.now();
    
    const response = await axios.post(
      `${WORKER_URL}/remove-bg`,
      formData,
      {
        headers: formData.getHeaders(),
        responseType: 'arraybuffer',
        timeout: 30000
      }
    );
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    // Save result
    const outputPath = `worker_result_${Date.now()}.png`;
    fs.writeFileSync(outputPath, response.data);
    
    console.log('✅ SUCCESS!\n');
    console.log('-'.repeat(60));
    console.log(`⏱️  Processing Time: ${processingTime}ms`);
    console.log(`📊 Response Size: ${(response.data.length / 1024).toFixed(2)} KB`);
    console.log(`💾 Saved to: ${outputPath}`);
    console.log('-'.repeat(60) + '\n');
    
    // Check if it's a valid PNG
    const header = response.data.slice(0, 8);
    const isPng = header.toString('binary') === '\x89PNG\r\n\x1a\n';
    
    if (isPng) {
      console.log('✅ Valid PNG file generated!\n');
    } else {
      console.log('⚠️  Warning: Output may not be a valid PNG\n');
    }
    
    console.log('✨ Worker is working correctly!\n');
    
  } catch (error) {
    console.error('❌ TEST FAILED\n');
    console.log('-'.repeat(60));
    
    if (error.code === 'ENOTFOUND') {
      console.log('🌐 Network Error: Cannot reach worker URL');
      console.log(`   Check if worker is deployed at: ${WORKER_URL}`);
    } else if (error.response) {
      console.log(`📡 HTTP Error: ${error.response.status}`);
      try {
        const errorText = Buffer.from(error.response.data).toString('utf8');
        console.log(`   Response: ${errorText.substring(0, 200)}`);
      } catch (e) {}
    } else {
      console.log(`Error: ${error.message}`);
    }
    
    console.log('-'.repeat(60) + '\n');
  }
}

// Run test
quickTest().catch(console.error);
