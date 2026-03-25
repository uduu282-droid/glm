/**
 * PhotoGrid Worker - API Proxy Test
 * Using /api/* endpoint to proxy actual PhotoGrid calls
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const WORKER_URL = 'https://photogrid-proxy.llamai.workers.dev';
const TEST_IMAGE = 'direct-pollinations-test.jpg';

async function testApiProxy(endpoint, name) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Testing: ${name}`);
  console.log(`Endpoint: /api${endpoint}`);
  console.log(`${'='.repeat(70)}`);
  
  if (!fs.existsSync(TEST_IMAGE)) {
    console.log(`❌ Test image not found!`);
    return false;
  }
  
  try {
    const form = new FormData();
    form.append('image', fs.createReadStream(TEST_IMAGE));
    form.append('file', fs.createReadStream(TEST_IMAGE));
    
    // Add any extra parameters
    form.append('output_format', 'png');
    
    const response = await axios.post(
      `${WORKER_URL}/api${endpoint}`,
      form,
      {
        headers: form.getHeaders(),
        responseType: 'arraybuffer',
        timeout: 40000,
        maxRedirects: 0,
        validateStatus: () => true
      }
    );
    
    console.log(`\n📊 Response:`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${response.headers['content-type'] || 'N/A'}`);
    console.log(`   Size: ${(response.data.byteLength / 1024).toFixed(2)} KB`);
    
    if (response.status >= 400) {
      const errorText = Buffer.from(response.data).toString('utf8').substring(0, 200);
      console.log(`\n❌ ERROR: ${errorText}`);
      return false;
    }
    
    // Check content
    const buffer = Buffer.from(response.data);
    const header = buffer.slice(0, 8);
    const hexHeader = header.toString('hex');
    
    const isPng = hexHeader === '89504e470d0a1a0a';
    const isJpg = hexHeader.startsWith('ffd8ff');
    const isGif = header.toString('utf8').startsWith('GIF89a');
    const isJson = response.headers['content-type']?.includes('application/json');
    const isHtml = header.toString('utf8').toLowerCase().includes('<!doctype');
    
    console.log(`\n🔍 Format:`);
    console.log(`   PNG: ${isPng ? '✅' : '❌'}`);
    console.log(`   JPEG: ${isJpg ? '✅' : '❌'}`);
    console.log(`   GIF: ${isGif ? '✅' : '❌'}`);
    console.log(`   JSON: ${isJson ? 'ℹ️' : '❌'}`);
    console.log(`   HTML: ${isHtml ? '❌ ERROR PAGE' : '✅'}`);
    
    if (isHtml) {
      console.log(`\n⚠️ Received HTML error page!`);
      return false;
    }
    
    // Save result
    const timestamp = Date.now();
    const ext = isPng ? 'png' : isJpg ? 'jpg' : isGif ? 'gif' : isJson ? 'json' : 'bin';
    const outputFile = `photogrid_api_${name.replace(/\s+/g, '_')}_${timestamp}.${ext}`;
    
    fs.writeFileSync(outputFile, buffer);
    console.log(`\n💾 Saved: ${outputFile}`);
    
    if (isPng || isJpg || isGif) {
      console.log(`✅ SUCCESS! Valid image received.`);
      
      const { exec } = require('child_process');
      exec(`start ${outputFile}`);
      
      return true;
    } else if (isJson) {
      try {
        const json = JSON.parse(buffer.toString('utf8'));
        console.log(`   JSON Keys: ${Object.keys(json).join(', ')}`);
        
        // Check for base64 image
        for (const [key, value] of Object.entries(json)) {
          if (typeof value === 'string' && value.length > 100) {
            console.log(`   Found data in: ${key} (${value.length} chars)`);
          }
        }
        return true;
      } catch (e) {
        console.log(`   Invalid JSON`);
        return false;
      }
    } else {
      console.log(`⚠️ Unknown format`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ ERROR: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      const errData = Buffer.from(error.response.data).toString('utf8').substring(0, 200);
      console.log(`   Error: ${errData}`);
    }
    return false;
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║   PhotoGrid Worker - API PROXY TESTING                   ║');
  console.log('║   https://photogrid-proxy.llamai.workers.dev             ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  console.log(`\n📷 Test Image: ${TEST_IMAGE}`);
  console.log(`   Size: ${(fs.statSync(TEST_IMAGE).size/1024).toFixed(2)} KB\n`);
  
  const tests = [
    ['/remove-bg', 'Background Removal ✂️'],
    ['/watermark-removal', 'Watermark Removal 🧹'],
    ['/object-removal', 'Object Removal 🎯'],
    ['/enhance', 'Image Enhancement ✨'],
    ['/style-transfer', 'AI Style Transfer 🎨'],
    ['/super-resolution', 'Super Resolution 🔍'],
    ['/restore-old-photo', 'Old Photo Restoration 📷'],
    ['/blur-background', 'Background Blur 🌫']
  ];
  
  const results = {};
  
  for (const [endpoint, name] of tests) {
    results[name] = await testApiProxy(endpoint, name);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between tests
  }
  
  // Summary
  console.log('\n\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                            ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  let passed = 0;
  for (const [name, success] of Object.entries(results)) {
    console.log(`${success ? '✅' : '❌'} ${name.padEnd(30)} ${success ? 'PASSED' : 'FAILED'}`);
    if (success) passed++;
  }
  
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Total: ${passed}/${tests.length} passed (${((passed/tests.length)*100).toFixed(1)}%)`);
  console.log(`${'─'.repeat(60)}\n`);
  
  if (passed === tests.length) {
    console.log('🎉 ALL TESTS PASSED!\n');
  } else {
    console.log('⚠️ Some features may need different API parameters.\n');
  }
}

main().catch(console.error);
