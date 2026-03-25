/**
 * Test Background Remover Backend Status
 * Checks if the Google Cloud Run backend is still responding
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'https://bgremover-backend-121350814881.us-central1.run.app/api/remove-bg';

async function testBackend() {
  console.log('🔍 Testing Background Remover Backend...\n');
  console.log('=' .repeat(60));
  console.log(`Endpoint: ${BACKEND_URL}\n`);
  
  try {
    // Create a small test image (1x1 red pixel PNG)
    const testImagePath = path.join(__dirname, 'test-red-pixel.png');
    
    // Check if we have a test image, if not create one
    if (!fs.existsSync(testImagePath)) {
      console.log('⚠️  No test image found, creating a simple PNG...');
      // Minimal valid PNG (1x1 red pixel)
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
        0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0xF0,
        0x00, 0x00, 0x01, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x00, 0x00,
        0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ]);
      fs.writeFileSync(testImagePath, pngBuffer);
      console.log('✅ Created test image\n');
    }
    
    // Prepare form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath));
    
    console.log('📤 Sending test request...');
    console.log('Headers:', JSON.stringify({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://www.changeimageto.com/',
      ...formData.getHeaders()
    }, null, 2));
    
    const startTime = Date.now();
    
    const response = await axios.post(BACKEND_URL, formData, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
        'Referer': 'https://www.changeimageto.com/',
        ...formData.getHeaders()
      },
      responseType: 'arraybuffer',
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    const duration = Date.now() - startTime;
    
    console.log('\n✅ Response received!');
    console.log('=' .repeat(60));
    console.log(`Status: ${response.status}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Response size: ${(response.data.length / 1024).toFixed(2)} KB`);
    console.log(`Content-Type: ${response.headers['content-type'] || 'unknown'}`);
    
    // Save result
    const outputPath = path.join(__dirname, 'test-result-bg-removed.png');
    fs.writeFileSync(outputPath, response.data);
    console.log(`\n💾 Result saved to: ${outputPath}`);
    
    console.log('\n✨ Backend is WORKING!\n');
    
  } catch (error) {
    console.error('\n❌ Backend test FAILED!\n');
    console.error('=' .repeat(60));
    console.error(`Error: ${error.message}`);
    
    if (error.response) {
      console.error(`\nStatus: ${error.response.status}`);
      console.error(`Headers:`, JSON.stringify(error.response.headers, null, 2));
      
      try {
        const errorBody = Buffer.from(error.response.data).toString('utf8');
        console.error(`Body:`, errorBody.substring(0, 500));
      } catch {}
    } else if (error.code === 'ECONNABORTED') {
      console.error('\n⏱️  Request timed out (30s)');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n🚫 DNS resolution failed - backend may be offline');
    }
    
    console.error('\n💡 The backend at bgremover-backend-121350814881.us-central1.run.app appears to be DOWN');
    console.error('💡 You should switch to using the PhotoGrid worker instead!\n');
  }
}

// Run test
testBackend().catch(console.error);
