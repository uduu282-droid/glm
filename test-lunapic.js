/**
 * Test LunaPic Background Remover
 * Quick test to verify the API is working
 */

const LunaPicBackgroundRemover = require('./lunapic-background-remover.js');
const fs = require('fs');
const path = require('path');

async function testLunaPic() {
  console.log('\n🧪 Testing LunaPic Background Remover\n');
  console.log('=' .repeat(60));
  
  // Find a test image
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
    console.log('❌ No test image found. Please provide an image file.');
    console.log('Usage: node test-lunapic.js <image-file>');
    return;
  }
  
  console.log(`📷 Using test image: ${testImage}\n`);
  
  const remover = new LunaPicBackgroundRemover();
  
  try {
    // Test with default settings
    const result = await remover.processImage(testImage, {
      clickX: 10,
      clickY: 10,
      fuzz: 8,
      outputPath: `lunapic_test_result_${Date.now()}.png`
    });
    
    if (result.success) {
      console.log('✅ TEST PASSED!');
      console.log(`📁 Result saved to: ${result.outputPath}`);
    } else {
      console.log('❌ TEST FAILED');
      console.log(`Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ TEST FAILED WITH ERROR:', error.message);
  }
  
  console.log('\n' + '=' .repeat(60) + '\n');
}

// Run test
testLunaPic().catch(console.error);
