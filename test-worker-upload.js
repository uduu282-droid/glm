/**
 * Test Script for ImgUpscaler Worker
 * 
 * After deploying your worker, run this to test it:
 * node test-worker-upload.js
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

// Worker URL (deployed)
const WORKER_URL = 'https://imgupscaler-worker.llamai.workers.dev';

async function testWorker() {
  console.log('🧪 Testing ImgUpscaler Worker\n');
  console.log('=' .repeat(70));
  console.log(`Worker URL: ${WORKER_URL}\n`);
  
  // Create test image
  const testImagePath = path.join(process.cwd(), 'worker_test_image.png');
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00, 0x64,
    0x08, 0x02, 0x00, 0x00, 0x00, 0xFF, 0x80, 0x20,
    0x00, 0x00, 0x00, 0x01, 0x73, 0x52, 0x47, 0x42,
    0x00, 0xAE, 0xCE, 0x1C, 0xE9, 0x00, 0x00, 0x00,
    0x04, 0x67, 0x41, 0x4D, 0x41, 0x00, 0x00, 0xB1,
    0x8F, 0x0B, 0xFC, 0x61, 0x05, 0x00, 0x00, 0x00,
    0x09, 0x70, 0x48, 0x59, 0x73, 0x00, 0x00, 0x0E,
    0xC3, 0x00, 0x00, 0x0E, 0xC3, 0x01, 0xC7, 0x6F,
    0xA8, 0x64, 0x00, 0x00, 0x00, 0x19, 0x74, 0x45,
    0x58, 0x74, 0x53, 0x6F, 0x66, 0x74, 0x77, 0x61,
    0x72, 0x65, 0x00, 0x41, 0x64, 0x6F, 0x62, 0x65,
    0x20, 0x49, 0x6D, 0x61, 0x67, 0x65, 0x52, 0x65,
    0x61, 0x64, 0x79, 0x71, 0xC9, 0x65, 0x3C, 0x00,
    0x00, 0x00, 0x1D, 0x49, 0x44, 0x41, 0x54, 0x78,
    0xDA, 0x62, 0x62, 0x60, 0x60, 0x60, 0xF8, 0xCF,
    0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0,
    0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0,
    0xC0, 0xC0, 0xC0, 0xC0, 0x00, 0x05, 0x96, 0x01,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
  ]);
  fs.writeFileSync(testImagePath, pngHeader);
  console.log('📁 Created test image\n');
  
  try {
    // Test 1: Health check
    console.log('Test 1: Health Check');
    console.log(`GET ${WORKER_URL}/health\n`);
    
    const healthResponse = await axios.get(`${WORKER_URL}/health`);
    console.log('✅ Status:', healthResponse.status);
    console.log('Response:', JSON.stringify(healthResponse.data, null, 2));
    
    // Test 2: Upload image
    console.log('\n\nTest 2: Upload Image');
    console.log(`POST ${WORKER_URL}/upload\n`);
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath), 'test.png');
    
    const uploadResponse = await axios.post(`${WORKER_URL}/upload`, formData, {
      headers: formData.getHeaders()
    });
    
    console.log('✅ Status:', uploadResponse.status);
    console.log('Response:', JSON.stringify(uploadResponse.data, null, 2));
    
    if (uploadResponse.data.success) {
      console.log('\n🎉 SUCCESS!');
      console.log(`Signed URL: ${uploadResponse.data.data.signedUrl}`);
      console.log(`Object Name: ${uploadResponse.data.data.objectName}`);
      
      // Test 3: Verify URL is accessible
      console.log('\n\nTest 3: Verify Signed URL');
      try {
        const urlCheck = await axios.head(uploadResponse.data.data.signedUrl);
        console.log('✅ URL is accessible, Status:', urlCheck.status);
      } catch (error) {
        console.log('⚠️  URL check failed:', error.message);
      }
    } else {
      console.log('\n❌ Upload failed but request succeeded');
    }
    
    // Cleanup
    fs.unlinkSync(testImagePath);
    console.log('\n\n✅ All tests complete!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure you replaced WORKER_URL with your actual worker URL');
    console.log('2. Check that your worker is deployed: wrangler deploy');
    console.log('3. Verify worker status in Cloudflare dashboard');
  }
}

// Run tests
testWorker().catch(console.error);
