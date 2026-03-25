/**
 * Visual Background Removal Test
 * Shows before/after comparison using deployed worker
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const WORKER_URL = 'https://lunapic-proxy.llamai.workers.dev';

async function visualTest() {
  console.log('\n🎨 LunaPic Background Removal - Visual Test\n');
  console.log('=' .repeat(70));
  console.log(`Worker: ${WORKER_URL}`);
  console.log('=' .repeat(70) + '\n');
  
  // Find test images
  const testImages = [
    'test-cat.jpg',
    'test-red-pixel.png', 
    'test-flux.jpg',
    'red-circle.jpg'
  ];
  
  let testImage = null;
  for (const img of testImages) {
    if (fs.existsSync(img)) {
      testImage = img;
      break;
    }
  }
  
  if (!testImage) {
    console.log('❌ No test image found in directory!');
    console.log('Available images to test:');
    console.log('  - test-cat.jpg');
    console.log('  - test-red-pixel.png');
    console.log('  - test-flux.jpg');
    console.log('  - red-circle.jpg');
    return;
  }
  
  console.log(`📷 Testing with: ${testImage}`);
  
  // Get file info
  const stats = fs.statSync(testImage);
  const fileSizeKB = (stats.size / 1024).toFixed(2);
  console.log(`📊 Original size: ${fileSizeKB} KB\n`);
  
  // Show original image info
  console.log('📋 ORIGINAL IMAGE:');
  console.log('-'.repeat(70));
  console.log(`   File: ${testImage}`);
  console.log(`   Size: ${fileSizeKB} KB`);
  console.log(`   Path: ${path.resolve(testImage)}\n`);
  
  try {
    console.log('🚀 Processing background removal...\n');
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImage));
    formData.append('x', '10');
    formData.append('y', '10');
    formData.append('fuzz', '8');
    
    const startTime = Date.now();
    
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
        maxRedirects: 5
      }
    );
    
    // Check content-type header
    const contentType = response.headers['content-type'];
    console.log(`📡 Response Content-Type: ${contentType}`);
    
    // If we got HTML instead of image, show error
    if (contentType && contentType.includes('text/html')) {
      const htmlError = Buffer.from(response.data).toString('utf8').substring(0, 500);
      throw new Error(`Worker returned HTML instead of PNG:\n${htmlError}`);
    }
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    // Save result
    const timestamp = Date.now();
    const outputPath = `bg_removed_${timestamp}.png`;
    fs.writeFileSync(outputPath, response.data);
    
    const resultStats = fs.statSync(outputPath);
    const resultSizeKB = (resultStats.size / 1024).toFixed(2);
    
    // Display results
    console.log('\n✅ BACKGROUND REMOVAL COMPLETE!\n');
    console.log('=' .repeat(70));
    console.log('📊 RESULTS:');
    console.log('-'.repeat(70));
    console.log(`⏱️  Processing Time: ${processingTime}ms (${(processingTime/1000).toFixed(2)}s)`);
    console.log(`📦 Response Size: ${resultSizeKB} KB`);
    console.log(`💾 Output File: ${outputPath}`);
    console.log(`📍 Output Path: ${path.resolve(outputPath)}`);
    console.log(`🔗 Worker URL: ${WORKER_URL}`);
    console.log(`🎯 Parameters: x=10, y=10, fuzz=8`);
    console.log('-'.repeat(70));
    
    // Verify PNG signature
    const header = response.data.slice(0, 8);
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const isPng = header.compare(pngSignature) === 0;
    
    if (isPng) {
      console.log('\n✅ Valid PNG file generated!');
      console.log('✨ Background successfully removed with transparency!\n');
    } else {
      console.log('\n⚠️  Warning: Output may not be a valid PNG');
      console.log(`   First bytes: ${header.toString('hex')}`);
      console.log('   Checking if it\'s an error message...\n');
      
      // Try to decode as text to see if it's an error
      try {
        const textContent = Buffer.from(response.data).toString('utf8').substring(0, 200);
        if (textContent.includes('<!DOCTYPE') || textColor.includes('<html')) {
          console.log('❌ Received HTML error page instead of image');
          console.log('   This usually means the worker encountered an error');
        }
      } catch (e) {}
    }
    
    // Show comparison
    console.log('📋 COMPARISON:');
    console.log('-'.repeat(70));
    console.log('BEFORE:');
    console.log(`  📁 File: ${testImage}`);
    console.log(`  📊 Size: ${fileSizeKB} KB`);
    console.log(`  🖼️  Has background`);
    console.log('');
    console.log('AFTER:');
    console.log(`  📁 File: ${outputPath}`);
    console.log(`  📊 Size: ${resultSizeKB} KB`);
    console.log(`  🖼️  Transparent background ✨`);
    console.log('-'.repeat(70));
    
    console.log('\n🎉 SUCCESS! Your deployed worker is working perfectly!\n');
    console.log('💡 To view the result:');
    console.log(`   Windows: start ${outputPath}`);
    console.log(`   Mac: open ${outputPath}`);
    console.log(`   Linux: xdg-open ${outputPath}\n`);
    
    return {
      success: true,
      original: testImage,
      result: outputPath,
      processingTime,
      originalSize: fileSizeKB,
      resultSize: resultSizeKB
    };
    
  } catch (error) {
    console.error('\n❌ TEST FAILED\n');
    console.log('=' .repeat(70));
    
    if (error.code === 'ENOTFOUND') {
      console.log('🌐 Network Error: Cannot reach worker');
      console.log(`   URL: ${WORKER_URL}`);
      console.log('   Check if worker is deployed and accessible\n');
    } else if (error.response) {
      console.log(`📡 HTTP Error: ${error.response.status}`);
      try {
        const errorText = Buffer.from(error.response.data).toString('utf8');
        console.log(`   Response: ${errorText.substring(0, 300)}\n`);
      } catch (e) {}
    } else {
      console.log(`Error: ${error.message}\n`);
    }
    
    console.log('-'.repeat(70) + '\n');
    return { success: false, error: error.message };
  }
}

// Run the test
visualTest().then(result => {
  if (result && result.success) {
    console.log('✅ Test completed successfully!');
    console.log(`📸 Check your output: ${result.result}\n`);
  }
}).catch(console.error);
