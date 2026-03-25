/**
 * PhotoGrid Worker - Simple Feature Test
 * Testing actual image processing endpoints
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const WORKER_URL = 'https://photogrid-proxy.llamai.workers.dev';
const TEST_IMAGE = 'direct-pollinations-test.jpg';

async function testGetWithImageUrl(endpoint, name) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${name}`);
  console.log(`${'='.repeat(60)}`);
  
  // We need a publicly accessible image URL
  // Using a placeholder service for testing
  const imageUrl = 'https://picsum.photos/seed/test123/800/600.jpg';
  
  try {
    console.log(`GET ${endpoint}?image_url=${imageUrl}`);
    
    const response = await axios.get(`${WORKER_URL}${endpoint}`, {
      params: { image_url: imageUrl },
      responseType: 'arraybuffer',
      timeout: 30000,
      maxRedirects: 0,
      validateStatus: () => true
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Content-Type: ${response.headers['content-type'] || 'N/A'}`);
    console.log(`Size: ${(response.data.byteLength / 1024).toFixed(2)} KB`);
    
    if (response.status === 200) {
      const buffer = Buffer.from(response.data);
      const header = buffer.slice(0, 8);
      const hexHeader = header.toString('hex');
      
      const isPng = hexHeader === '89504e470d0a1a0a';
      const isJpg = hexHeader.startsWith('ffd8ff');
      const isGif = header.toString('utf8').startsWith('GIF89a');
      
      if (isPng || isJpg || isGif) {
        const ext = isPng ? 'png' : isJpg ? 'jpg' : 'gif';
        const file = `photogrid_${name.replace(/\s+/g, '_')}_${Date.now()}.${ext}`;
        fs.writeFileSync(file, buffer);
        console.log(`✅ SUCCESS! Saved to: ${file}`);
        
        const { exec } = require('child_process');
        exec(`start ${file}`);
        
        return true;
      } else {
        console.log('⚠️ Got response but not an image');
        console.log(`First bytes: ${hexHeader}`);
      }
    } else {
      const text = Buffer.from(response.data).toString('utf8').substring(0, 200);
      console.log(`❌ Error: ${text}`);
    }
    
  } catch (error) {
    console.error(`❌ ERROR: ${error.message}`);
  }
  
  return false;
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  PhotoGrid Worker - Feature Testing             ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  
  if (!fs.existsSync(TEST_IMAGE)) {
    console.log(`Note: Using online test image instead of ${TEST_IMAGE}`);
  }
  
  const tests = [
    ['/remove-bg', 'Background Removal'],
    ['/watermark-removal', 'Watermark Removal'],
    ['/object-removal', 'Object Removal'],
    ['/enhance', 'Image Enhancement'],
    ['/style-transfer', 'AI Style Transfer'],
    ['/super-resolution', 'Super Resolution'],
    ['/restore-old-photo', 'Old Photo Restoration'],
    ['/blur-background', 'Background Blur']
  ];
  
  const results = {};
  
  for (const [endpoint, name] of tests) {
    results[name] = await testGetWithImageUrl(endpoint, name);
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  
  let passed = 0;
  for (const [name, success] of Object.entries(results)) {
    console.log(`${success ? '✅' : '❌'} ${name.padEnd(25)} ${success ? 'PASSED' : 'FAILED'}`);
    if (success) passed++;
  }
  
  console.log(`\nTotal: ${passed}/${tests.length} passed (${((passed/tests.length)*100).toFixed(1)}%)`);
}

main().catch(console.error);
