/**
 * PhotoGrid Worker - Complete Feature Test
 * Tests all 8 endpoints with real images
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const WORKER_URL = 'https://photogrid-proxy.llamai.workers.dev';

// Test image (use a larger one for better results)
const TEST_IMAGE = 'direct-pollinations-test.jpg';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testEndpoint(endpoint, description, options = {}) {
  const { 
    method = 'POST', 
    formData = {}, 
    expectImage = true,
    timeout = 30000 
  } = options;
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🧪 Testing: ${description}`);
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`${'='.repeat(70)}`);
  
  if (!fs.existsSync(TEST_IMAGE)) {
    console.log(`❌ Test image not found: ${TEST_IMAGE}`);
    return false;
  }
  
  try {
    let response;
    
    if (method === 'POST') {
      const form = new FormData();
      
      // Add file if exists
      if (formData.file !== false) {
        form.append('image', fs.createReadStream(TEST_IMAGE));
        form.append('file', fs.createReadStream(TEST_IMAGE));
      }
      
      // Add other form fields
      if (formData.extra) {
        Object.entries(formData.extra).forEach(([key, value]) => {
          form.append(key, value);
        });
      }
      
      response = await axios.post(
        `${WORKER_URL}${endpoint}`,
        form,
        {
          headers: form.getHeaders(),
          responseType: 'arraybuffer',
          timeout: timeout,
          maxRedirects: 0,
          validateStatus: () => true
        }
      );
    } else {
      response = await axios.get(`${WORKER_URL}${endpoint}`, {
        responseType: 'arraybuffer',
        timeout: timeout
      });
    }
    
    console.log(`\n📊 Response:`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${response.headers['content-type'] || 'N/A'}`);
    console.log(`   Size: ${(response.data.byteLength / 1024).toFixed(2)} KB`);
    
    // Check if it's an error
    if (response.status >= 400) {
      const errorText = Buffer.from(response.data).toString('utf8').substring(0, 200);
      console.log(`\n❌ ERROR RESPONSE:`);
      console.log(`   ${errorText}`);
      return false;
    }
    
    // Validate response
    const buffer = Buffer.from(response.data);
    const header = buffer.slice(0, 8);
    const hexHeader = header.toString('hex');
    
    const isPng = hexHeader === '89504e470d0a1a0a';
    const isGif = header.toString('utf8').startsWith('GIF89a') || header.toString('utf8').startsWith('GIF87a');
    const isJpg = hexHeader.startsWith('ffd8ff');
    const isJson = response.headers['content-type']?.includes('application/json');
    const isHtml = header.toString('utf8').toLowerCase().includes('<!doctype') || 
                   header.toString('utf8').toLowerCase().includes('<html');
    
    console.log(`\n🔍 Validation:`);
    console.log(`   PNG: ${isPng ? '✅' : '❌'}`);
    console.log(`   GIF: ${isGif ? '✅' : '❌'}`);
    console.log(`   JPEG: ${isJpg ? '✅' : '❌'}`);
    console.log(`   JSON: ${isJson ? 'ℹ️' : '❌'}`);
    console.log(`   HTML: ${isHtml ? '❌ ERROR PAGE!' : '✅'}`);
    
    if (isHtml) {
      console.log(`\n⚠️  Received HTML error page instead of image!`);
      const htmlContent = buffer.toString('utf8').substring(0, 300);
      console.log(`   First 300 chars: ${htmlContent}`);
      return false;
    }
    
    // Save result
    const timestamp = Date.now();
    const extension = isPng ? 'png' : isGif ? 'gif' : isJpg ? 'jpg' : isJson ? 'json' : 'bin';
    const outputFile = `photogrid_${endpoint.replace(/\//g, '_')}_${timestamp}.${extension}`;
    
    fs.writeFileSync(outputFile, buffer);
    console.log(`\n💾 Saved to: ${outputFile}`);
    
    if (isPng || isGif || isJpg) {
      console.log(`✅ SUCCESS! Valid image received.`);
      
      // Auto-open
      const { exec } = require('child_process');
      exec(`start ${outputFile}`);
      
      return true;
    } else if (isJson) {
      console.log(`ℹ️  Received JSON response (might be base64 encoded image)`);
      try {
        const json = JSON.parse(buffer.toString('utf8'));
        console.log(`   Keys: ${Object.keys(json).join(', ')}`);
        
        // Look for base64 image
        for (const [key, value] of Object.entries(json)) {
          if (typeof value === 'string' && (value.startsWith('data:image') || value.length > 1000)) {
            console.log(`   Found potential image data in: ${key}`);
          }
        }
        return true;
      } catch (e) {
        console.log(`   Invalid JSON`);
        return false;
      }
    } else {
      console.log(`⚠️  Unknown format`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ ERROR: ${error.message}`);
    if (error.code === 'ECONNABORTED') {
      console.log(`   Request timed out after ${timeout}ms`);
    }
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      const errData = Buffer.from(error.response.data).toString('utf8').substring(0, 200);
      console.log(`   Error: ${errData}`);
    }
    return false;
  }
}

async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║     PhotoGrid Worker - COMPLETE FEATURE TEST                  ║');
  console.log('║     https://photogrid-proxy.llamai.workers.dev                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  
  console.log(`\n📷 Test Image: ${TEST_IMAGE}`);
  console.log(`   Size: ${fs.existsSync(TEST_IMAGE) ? (fs.statSync(TEST_IMAGE).size/1024).toFixed(2) + ' KB' : 'NOT FOUND'}`);
  
  const results = {};
  
  // Test 1: Background Removal
  results['Background Removal'] = await testEndpoint('/remove-bg', 'Background Removal ✂️', {
    formData: { extra: { output_format: 'png' } }
  });
  await sleep(2000);
  
  // Test 2: Watermark Removal
  results['Watermark Removal'] = await testEndpoint('/watermark-removal', 'Watermark Removal 🧹', {
    timeout: 40000
  });
  await sleep(2000);
  
  // Test 3: Object Removal
  results['Object Removal'] = await testEndpoint('/object-removal', 'Object Removal 🎯', {
    timeout: 40000
  });
  await sleep(2000);
  
  // Test 4: Image Enhancement
  results['Image Enhancement'] = await testEndpoint('/enhance', 'Image Enhancement ✨', {
    timeout: 40000
  });
  await sleep(2000);
  
  // Test 5: AI Style Transfer
  results['AI Style Transfer'] = await testEndpoint('/style-transfer', 'AI Style Transfer 🎨', {
    timeout: 40000
  });
  await sleep(2000);
  
  // Test 6: Super Resolution
  results['Super Resolution'] = await testEndpoint('/super-resolution', 'Super Resolution 🔍', {
    timeout: 40000
  });
  await sleep(2000);
  
  // Test 7: Old Photo Restoration
  results['Old Photo Restoration'] = await testEndpoint('/restore-old-photo', 'Old Photo Restoration 📷', {
    timeout: 40000
  });
  await sleep(2000);
  
  // Test 8: Background Blur
  results['Background Blur'] = await testEndpoint('/blur-background', 'Background Blur 🌫', {
    timeout: 40000
  });
  
  // Summary
  console.log('\n\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  for (const [feature, success] of Object.entries(results)) {
    const icon = success ? '✅' : '❌';
    const status = success ? 'PASSED' : 'FAILED';
    console.log(`${icon} ${feature.padEnd(30)} ${status}`);
  }
  
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`Total: ${passed}/${total} tests passed (${((passed/total)*100).toFixed(1)}%)`);
  console.log(`${'─'.repeat(70)}\n`);
  
  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! Worker is working perfectly!\n');
  } else {
    console.log('⚠️  Some tests failed. Check the results above.\n');
  }
}

runAllTests().catch(console.error);
