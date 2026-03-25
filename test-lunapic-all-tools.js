/**
 * Comprehensive LunaPic Tools Test
 * Tests multiple editing tools and features
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class LunaPicToolsTester {
  constructor() {
    this.baseUrl = 'https://www2.lunapic.com';
    this.sessionCookies = null;
  }

  async initializeSession() {
    console.log('\n📥 Initializing session...\n');
    const response = await axios.get(`${this.baseUrl}/editor/?action=transparent`, {
      headers: this.getHeaders()
    });
    
    // Extract cookies
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      this.sessionCookies = cookies.join('; ');
    }
    
    console.log('✅ Session initialized\n');
    return true;
  }

  async uploadImage(imagePath) {
    console.log(`📤 Uploading image: ${path.basename(imagePath)}\n`);
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));
    formData.append('action', 'upload');
    
    const response = await axios.post(`${this.baseUrl}/editor/`, formData, {
      headers: {
        ...this.getHeaders(),
        ...formData.getHeaders(),
        ...(this.sessionCookies ? { Cookie: this.sessionCookies } : {})
      },
      responseType: 'text'
    });
    
    // Try to extract session info
    const htmlContent = response.data;
    const sessionIdMatch = htmlContent.match(/icon_id=(\w+)/);
    const sessionId = sessionIdMatch ? sessionIdMatch[1] : null;
    
    console.log('✅ Image uploaded\n');
    return { success: true, sessionId, html: htmlContent };
  }

  // Test 1: Background Removal (Transparent)
  async testBackgroundRemoval(clickX = 50, clickY = 50) {
    console.log('🧪 TEST 1: Background Removal (Magic Wand)\n');
    console.log('-'.repeat(60));
    
    try {
      const formData = new FormData();
      formData.append('action', 'do-trans');
      formData.append('fuzz', '8');
      formData.append('fill', 'area');
      formData.append('x', clickX.toString());
      formData.append('y', clickY.toString());
      formData.append('redo', '1');
      
      const response = await axios.post(
        `${this.baseUrl}/editor/?action=do-trans`, 
        formData, 
        {
          headers: {
            ...this.getHeaders(),
            ...formData.getHeaders(),
            ...(this.sessionCookies ? { Cookie: this.sessionCookies } : {}),
            'referer': `${this.baseUrl}/editor/`
          },
          responseType: 'arraybuffer'
        }
      );
      
      const outputPath = path.join(__dirname, `lunapic-test-transparent-${Date.now()}.png`);
      fs.writeFileSync(outputPath, response.data);
      
      console.log(`✅ SUCCESS - Result saved: ${outputPath}`);
      console.log(`   File size: ${(response.data.length / 1024).toFixed(2)} KB\n`);
      
      return { success: true, file: outputPath, size: response.data.length };
    } catch (error) {
      console.error('❌ FAILED:', error.message);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
      }
      console.log();
      return { success: false, error: error.message };
    }
  }

  // Test 2: Grayscale/Black & White
  async testGrayscale() {
    console.log('🧪 TEST 2: Grayscale Conversion\n');
    console.log('-'.repeat(60));
    
    try {
      const formData = new FormData();
      formData.append('action', 'grayscale');
      formData.append('red', '1');
      formData.append('green', '1');
      formData.append('blue', '1');
      
      const response = await axios.post(
        `${this.baseUrl}/editor/?action=grayscale`, 
        formData, 
        {
          headers: {
            ...this.getHeaders(),
            ...formData.getHeaders(),
            ...(this.sessionCookies ? { Cookie: this.sessionCookies } : {}),
            'referer': `${this.baseUrl}/editor/`
          },
          responseType: 'arraybuffer'
        }
      );
      
      const outputPath = path.join(__dirname, `lunapic-test-grayscale-${Date.now()}.png`);
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

  // Test 3: Blur Effect
  async testBlur(radius = 5) {
    console.log('🧪 TEST 3: Blur Effect\n');
    console.log('-'.repeat(60));
    
    try {
      const formData = new FormData();
      formData.append('action', 'blur');
      formData.append('radius', radius.toString());
      
      const response = await axios.post(
        `${this.baseUrl}/editor/?action=blur`, 
        formData, 
        {
          headers: {
            ...this.getHeaders(),
            ...formData.getHeaders(),
            ...(this.sessionCookies ? { Cookie: this.sessionCookies } : {}),
            'referer': `${this.baseUrl}/editor/`
          },
          responseType: 'arraybuffer'
        }
      );
      
      const outputPath = path.join(__dirname, `lunapic-test-blur-${Date.now()}.png`);
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

  // Test 4: Brightness Adjustment
  async testBrightness(brightness = 20) {
    console.log('🧪 TEST 4: Brightness Adjustment\n');
    console.log('-'.repeat(60));
    
    try {
      const formData = new FormData();
      formData.append('action', 'brightness');
      formData.append('bright', brightness.toString());
      
      const response = await axios.post(
        `${this.baseUrl}/editor/?action=brightness`, 
        formData, 
        {
          headers: {
            ...this.getHeaders(),
            ...formData.getHeaders(),
            ...(this.sessionCookies ? { Cookie: this.sessionCookies } : {}),
            'referer': `${this.baseUrl}/editor/`
          },
          responseType: 'arraybuffer'
        }
      );
      
      const outputPath = path.join(__dirname, `lunapic-test-brightness-${Date.now()}.png`);
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

  // Test 5: Contrast Adjustment
  async testContrast(contrast = 30) {
    console.log('🧪 TEST 5: Contrast Adjustment\n');
    console.log('-'.repeat(60));
    
    try {
      const formData = new FormData();
      formData.append('action', 'contrast');
      formData.append('contrast', contrast.toString());
      
      const response = await axios.post(
        `${this.baseUrl}/editor/?action=contrast`, 
        formData, 
        {
          headers: {
            ...this.getHeaders(),
            ...formData.getHeaders(),
            ...(this.sessionCookies ? { Cookie: this.sessionCookies } : {}),
            'referer': `${this.baseUrl}/editor/`
          },
          responseType: 'arraybuffer'
        }
      );
      
      const outputPath = path.join(__dirname, `lunapic-test-contrast-${Date.now()}.png`);
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

  // Test 6: Invert Colors
  async testInvert() {
    console.log('🧪 TEST 6: Invert Colors\n');
    console.log('-'.repeat(60));
    
    try {
      const formData = new FormData();
      formData.append('action', 'invert');
      
      const response = await axios.post(
        `${this.baseUrl}/editor/?action=invert`, 
        formData, 
        {
          headers: {
            ...this.getHeaders(),
            ...formData.getHeaders(),
            ...(this.sessionCookies ? { Cookie: this.sessionCookies } : {}),
            'referer': `${this.baseUrl}/editor/`
          },
          responseType: 'arraybuffer'
        }
      );
      
      const outputPath = path.join(__dirname, `lunapic-test-invert-${Date.now()}.png`);
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

  // Test 7: Resize
  async testResize(width = 800) {
    console.log('🧪 TEST 7: Resize Image\n');
    console.log('-'.repeat(60));
    
    try {
      const formData = new FormData();
      formData.append('action', 'resize');
      formData.append('width', width.toString());
      formData.append('height', 'auto');
      
      const response = await axios.post(
        `${this.baseUrl}/editor/?action=resize`, 
        formData, 
        {
          headers: {
            ...this.getHeaders(),
            ...formData.getHeaders(),
            ...(this.sessionCookies ? { Cookie: this.sessionCookies } : {}),
            'referer': `${this.baseUrl}/editor/`
          },
          responseType: 'arraybuffer'
        }
      );
      
      const outputPath = path.join(__dirname, `lunapic-test-resize-${Date.now()}.png`);
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

  // Test 8: Rotate 90 degrees
  async testRotate(degrees = 90) {
    console.log('🧪 TEST 8: Rotate Image\n');
    console.log('-'.repeat(60));
    
    try {
      const formData = new FormData();
      formData.append('action', 'rotate');
      formData.append('degrees', degrees.toString());
      
      const response = await axios.post(
        `${this.baseUrl}/editor/?action=rotate`, 
        formData, 
        {
          headers: {
            ...this.getHeaders(),
            ...formData.getHeaders(),
            ...(this.sessionCookies ? { Cookie: this.sessionCookies } : {}),
            'referer': `${this.baseUrl}/editor/`
          },
          responseType: 'arraybuffer'
        }
      );
      
      const outputPath = path.join(__dirname, `lunapic-test-rotate-${Date.now()}.png`);
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

  getHeaders() {
    return {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
      'accept-language': 'en-US,en;q=0.9',
      'sec-ch-ua': '"Not-A.Brand";v="24", "Chromium";v="146"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'origin': 'https://www2.lunapic.com',
      'upgrade-insecure-requests': '1'
    };
  }
}

// Main test execution
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║     LunaPic Complete Tools Testing Suite                ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  const tester = new LunaPicToolsTester();
  
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
  
  // Initialize session
  await tester.initializeSession();
  
  // Upload image
  const uploadResult = await tester.uploadImage(testImagePath);
  
  if (!uploadResult.success) {
    console.log('❌ Upload failed! Cannot continue testing.\n');
    return;
  }
  
  // Run all tests
  const results = {
    timestamp: new Date().toISOString(),
    testImage: testImagePath,
    tests: []
  };
  
  // Test 1: Background Removal
  results.tests.push(await tester.testBackgroundRemoval(50, 50));
  
  // Test 2: Grayscale
  results.tests.push(await tester.testGrayscale());
  
  // Test 3: Blur
  results.tests.push(await tester.testBlur(5));
  
  // Test 4: Brightness
  results.tests.push(await tester.testBrightness(20));
  
  // Test 5: Contrast
  results.tests.push(await tester.testContrast(30));
  
  // Test 6: Invert
  results.tests.push(await tester.testInvert());
  
  // Test 7: Resize
  results.tests.push(await tester.testResize(800));
  
  // Test 8: Rotate
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
  const jsonPath = path.join(__dirname, 'lunapic-test-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`📄 Detailed results saved to: ${jsonPath}\n`);
}

main().catch(console.error);
