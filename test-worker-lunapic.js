/**
 * Test LunaPic Worker
 * Tests all endpoints of the deployed worker
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// CONFIGURATION - UPDATE THIS WITH YOUR WORKER URL
// const WORKER_URL = 'http://localhost:8787'; // Local testing with wrangler
const WORKER_URL = 'https://lunapic-proxy.llamai.workers.dev'; // Production

class LunaPicWorkerTester {
  constructor(workerUrl) {
    this.workerUrl = workerUrl;
  }

  async testRemoveBg(imagePath, x = 50, y = 50) {
    console.log('\n🧪 TEST 1: Background Removal\n');
    console.log('-'.repeat(60));
    
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(imagePath));
      formData.append('x', x.toString());
      formData.append('y', y.toString());
      
      const response = await axios.post(
        `${this.workerUrl}/remove-bg`,
        formData,
        {
          headers: formData.getHeaders(),
          responseType: 'arraybuffer',
          timeout: 30000
        }
      );
      
      const outputPath = path.join(__dirname, `worker-test-removebg-${Date.now()}.png`);
      fs.writeFileSync(outputPath, response.data);
      
      console.log(`✅ SUCCESS - Result saved: ${outputPath}`);
      console.log(`   File size: ${(response.data.length / 1024).toFixed(2)} KB\n`);
      
      return { success: true, file: outputPath, size: response.data.length };
    } catch (error) {
      console.error('❌ FAILED:', error.message);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${error.response.data.toString().substring(0, 200)}`);
      }
      console.log();
      return { success: false, error: error.message };
    }
  }

  async testGrayscale(imagePath) {
    console.log('\n🧪 TEST 2: Grayscale\n');
    console.log('-'.repeat(60));
    
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(imagePath));
      
      const response = await axios.post(
        `${this.workerUrl}/grayscale`,
        formData,
        {
          headers: formData.getHeaders(),
          responseType: 'arraybuffer',
          timeout: 30000
        }
      );
      
      const outputPath = path.join(__dirname, `worker-test-grayscale-${Date.now()}.png`);
      fs.writeFileSync(outputPath, response.data);
      
      console.log(`✅ SUCCESS - Result saved: ${outputPath}`);
      console.log(`   File size: ${(response.data.length / 1024).toFixed(2)} KB\n`);
      
      return { success: true, file: outputPath, size: response.data.length };
    } catch (error) {
      console.error('❌ FAILED:', error.message);
      console.log();
      return { success: false, error: error.message };
    }
  }

  async testBlur(imagePath, radius = 5) {
    console.log('\n🧪 TEST 3: Blur\n');
    console.log('-'.repeat(60));
    
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(imagePath));
      formData.append('radius', radius.toString());
      
      const response = await axios.post(
        `${this.workerUrl}/blur`,
        formData,
        {
          headers: formData.getHeaders(),
          responseType: 'arraybuffer',
          timeout: 30000
        }
      );
      
      const outputPath = path.join(__dirname, `worker-test-blur-${Date.now()}.png`);
      fs.writeFileSync(outputPath, response.data);
      
      console.log(`✅ SUCCESS - Result saved: ${outputPath}`);
      console.log(`   File size: ${(response.data.length / 1024).toFixed(2)} KB\n`);
      
      return { success: true, file: outputPath, size: response.data.length };
    } catch (error) {
      console.error('❌ FAILED:', error.message);
      console.log();
      return { success: false, error: error.message };
    }
  }

  async testBrightness(imagePath, bright = 20) {
    console.log('\n🧪 TEST 4: Brightness\n');
    console.log('-'.repeat(60));
    
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(imagePath));
      formData.append('bright', bright.toString());
      
      const response = await axios.post(
        `${this.workerUrl}/brightness`,
        formData,
        {
          headers: formData.getHeaders(),
          responseType: 'arraybuffer',
          timeout: 30000
        }
      );
      
      const outputPath = path.join(__dirname, `worker-test-brightness-${Date.now()}.png`);
      fs.writeFileSync(outputPath, response.data);
      
      console.log(`✅ SUCCESS - Result saved: ${outputPath}`);
      console.log(`   File size: ${(response.data.length / 1024).toFixed(2)} KB\n`);
      
      return { success: true, file: outputPath, size: response.data.length };
    } catch (error) {
      console.error('❌ FAILED:', error.message);
      console.log();
      return { success: false, error: error.message };
    }
  }

  async testContrast(imagePath, contrast = 30) {
    console.log('\n🧪 TEST 5: Contrast\n');
    console.log('-'.repeat(60));
    
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(imagePath));
      formData.append('contrast', contrast.toString());
      
      const response = await axios.post(
        `${this.workerUrl}/contrast`,
        formData,
        {
          headers: formData.getHeaders(),
          responseType: 'arraybuffer',
          timeout: 30000
        }
      );
      
      const outputPath = path.join(__dirname, `worker-test-contrast-${Date.now()}.png`);
      fs.writeFileSync(outputPath, response.data);
      
      console.log(`✅ SUCCESS - Result saved: ${outputPath}`);
      console.log(`   File size: ${(response.data.length / 1024).toFixed(2)} KB\n`);
      
      return { success: true, file: outputPath, size: response.data.length };
    } catch (error) {
      console.error('❌ FAILED:', error.message);
      console.log();
      return { success: false, error: error.message };
    }
  }

  async testInvert(imagePath) {
    console.log('\n🧪 TEST 6: Invert\n');
    console.log('-'.repeat(60));
    
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(imagePath));
      
      const response = await axios.post(
        `${this.workerUrl}/invert`,
        formData,
        {
          headers: formData.getHeaders(),
          responseType: 'arraybuffer',
          timeout: 30000
        }
      );
      
      const outputPath = path.join(__dirname, `worker-test-invert-${Date.now()}.png`);
      fs.writeFileSync(outputPath, response.data);
      
      console.log(`✅ SUCCESS - Result saved: ${outputPath}`);
      console.log(`   File size: ${(response.data.length / 1024).toFixed(2)} KB\n`);
      
      return { success: true, file: outputPath, size: response.data.length };
    } catch (error) {
      console.error('❌ FAILED:', error.message);
      console.log();
      return { success: false, error: error.message };
    }
  }

  async testResize(imagePath, width = 800) {
    console.log('\n🧪 TEST 7: Resize\n');
    console.log('-'.repeat(60));
    
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(imagePath));
      formData.append('width', width.toString());
      
      const response = await axios.post(
        `${this.workerUrl}/resize`,
        formData,
        {
          headers: formData.getHeaders(),
          responseType: 'arraybuffer',
          timeout: 30000
        }
      );
      
      const outputPath = path.join(__dirname, `worker-test-resize-${Date.now()}.png`);
      fs.writeFileSync(outputPath, response.data);
      
      console.log(`✅ SUCCESS - Result saved: ${outputPath}`);
      console.log(`   File size: ${(response.data.length / 1024).toFixed(2)} KB\n`);
      
      return { success: true, file: outputPath, size: response.data.length };
    } catch (error) {
      console.error('❌ FAILED:', error.message);
      console.log();
      return { success: false, error: error.message };
    }
  }

  async testRotate(imagePath, degrees = 90) {
    console.log('\n🧪 TEST 8: Rotate\n');
    console.log('-'.repeat(60));
    
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(imagePath));
      formData.append('degrees', degrees.toString());
      
      const response = await axios.post(
        `${this.workerUrl}/rotate`,
        formData,
        {
          headers: formData.getHeaders(),
          responseType: 'arraybuffer',
          timeout: 30000
        }
      );
      
      const outputPath = path.join(__dirname, `worker-test-rotate-${Date.now()}.png`);
      fs.writeFileSync(outputPath, response.data);
      
      console.log(`✅ SUCCESS - Result saved: ${outputPath}`);
      console.log(`   File size: ${(response.data.length / 1024).toFixed(2)} KB\n`);
      
      return { success: true, file: outputPath, size: response.data.length };
    } catch (error) {
      console.error('❌ FAILED:', error.message);
      console.log();
      return { success: false, error: error.message };
    }
  }
}

// Main test execution
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║     Testing LunaPic Worker Deployment                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  // Check for test image
  let testImagePath = path.join(__dirname, 'ashlynn_generated_image.png');
  
  if (!fs.existsSync(testImagePath)) {
    console.log('❌ No test image found!\n');
    console.log('💡 Please provide an image file named:');
    console.log('   - ashlynn_generated_image.png\n');
    return;
  }
  
  console.log(`✅ Test image: ${path.basename(testImagePath)}`);
  console.log(`   Size: ${(fs.statSync(testImagePath).size / 1024).toFixed(2)} KB\n`);
  
  const tester = new LunaPicWorkerTester(WORKER_URL);
  
  // Run all tests
  const results = {
    timestamp: new Date().toISOString(),
    workerUrl: WORKER_URL,
    testImage: testImagePath,
    tests: []
  };
  
  // Execute tests
  results.tests.push(await tester.testRemoveBg(50, 50));
  results.tests.push(await tester.testGrayscale());
  results.tests.push(await tester.testBlur(5));
  results.tests.push(await tester.testBrightness(20));
  results.tests.push(await tester.testContrast(30));
  results.tests.push(await tester.testInvert());
  results.tests.push(await tester.testResize(800));
  results.tests.push(await tester.testRotate(90));
  
  // Summary
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  const passed = results.tests.filter(t => t.success).length;
  const failed = results.tests.filter(t => !t.success).length;
  
  console.log(`Total Tests: ${results.tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.tests.length) * 100).toFixed(1)}%\n`);
  
  console.log('📊 Results by Tool:\n');
  results.tests.forEach((test, i) => {
    const status = test.success ? '✅' : '❌';
    const toolName = [
      'Background Removal',
      'Grayscale',
      'Blur',
      'Brightness',
      'Contrast',
      'Invert',
      'Resize',
      'Rotate'
    ][i];
    
    console.log(`${status} ${toolName}`);
    if (test.success && test.file) {
      console.log(`   Output: ${path.basename(test.file)} (${(test.size / 1024).toFixed(2)} KB)`);
    } else if (!test.success) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  console.log('\n💾 All output files saved to current directory\n');
  
  // Save JSON results
  const jsonPath = path.join(__dirname, 'worker-test-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`📄 Detailed results saved to: ${jsonPath}\n`);
  
  if (passed === results.tests.length) {
    console.log('🎉 ALL TESTS PASSED! Worker is working perfectly!\n');
  } else {
    console.log('⚠️  Some tests failed. Check your worker deployment.\n');
  }
}

main().catch(console.error);
