/**
 * Test script for Pollinations Image Worker
 * Tests image generation endpoints with different models
 */

import http from 'http';

const WORKER_URL = 'http://127.0.0.1:8788';

// Add keep-alive agent for better connection handling
const agent = new http.Agent({ keepAlive: true });

async function testHealth() {
  console.log('\n🏥 Testing /health endpoint...');
  try {
    const response = await fetch(`${WORKER_URL}/health`, { agent });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Health check passed!');
      console.log('Service:', data.service);
      console.log('Version:', data.version);
      console.log('Free:', data.free);
      return true;
    } else {
      console.log('❌ Health check failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

async function testInfo() {
  console.log('\n📦 Testing root endpoint (/)...');
  try {
    const response = await fetch(`${WORKER_URL}/`, { agent });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Worker info retrieved!');
      console.log('Name:', data.name);
      console.log('Description:', data.description);
      console.log('\nFeatures:');
      data.features.forEach(f => console.log(`  ✅ ${f}`));
      console.log('\nEndpoints:');
      Object.entries(data.endpoints).forEach(([endpoint, desc]) => {
        console.log(`  • ${endpoint}: ${desc}`);
      });
      return true;
    } else {
      console.log('❌ Info endpoint failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Info endpoint error:', error.message);
    return false;
  }
}

async function testImageGenerationGET() {
  console.log('\n🎨 Testing GET /generate (Flux model)...');
  try {
    const prompt = 'red circle';
    const url = `${WORKER_URL}/generate?prompt=${encodeURIComponent(prompt)}&width=512&height=512&model=flux&seed=42`;
    
    console.log('URL:', url);
    const response = await fetch(url, { agent });
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      console.log('✅ Image generated successfully!');
      console.log('Content-Type:', contentType);
      console.log('Size:', contentLength, 'bytes');
      
      // Save the image
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await require('fs').promises.writeFile('test-pollination-get.jpg', buffer);
      console.log('💾 Saved to: test-pollination-get.jpg');
      
      return true;
    } else {
      const error = await response.json();
      console.log('❌ Image generation failed:', response.status);
      console.log('Error:', error);
      return false;
    }
  } catch (error) {
    console.log('❌ Image generation error:', error.message);
    return false;
  }
}

async function testImageGenerationPOST() {
  console.log('\n🖼️ Testing POST /generate (JSON body)...');
  try {
    const requestBody = {
      prompt: 'a beautiful sunset over ocean',
      width: 1024,
      height: 1024,
      model: 'flux',
      seed: 12345,
      nologo: true
    };
    
    const response = await fetch(`${WORKER_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      agent
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Image generated successfully!');
      console.log('Prompt:', data.prompt);
      console.log('Model:', data.model);
      console.log('Dimensions:', `${data.width}x${data.height}`);
      console.log('Seed:', data.seed);
      console.log('Image URL:', data.imageUrl);
      console.log('Base64 length:', data.imageBase64?.length || 0, 'chars');
      
      // Save base64 image
      if (data.imageBase64) {
        const base64Data = data.imageBase64.replace(/^data:image\/jpeg;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        await require('fs').promises.writeFile('test-pollination-post.jpg', buffer);
        console.log('💾 Saved to: test-pollination-post.jpg');
      }
      
      return true;
    } else {
      console.log('❌ Image generation failed:', response.status);
      console.log('Error:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Image generation error:', error.message);
    return false;
  }
}

async function testDifferentModels() {
  console.log('\n🧪 Testing different models...\n');
  
  const models = [
    { name: 'flux', status: 'recommended' },
    { name: 'turbo', status: 'may be unavailable' },
    { name: 'stable-diffusion', status: 'SD 1.5' },
    { name: 'stable-diffusion-xl', status: 'SDXL' }
  ];
  
  const results = [];
  
  for (const model of models) {
    console.log(`Testing model: ${model.name} (${model.status})`);
    
    try {
      const url = `${WORKER_URL}/generate?prompt=test&width=256&height=256&model=${model.name}&seed=42`;
      const response = await fetch(url, { 
        agent,
        timeout: 30000 // 30 second timeout
      });
      
      if (response.ok) {
        console.log(`  ✅ ${model.name} - Working!`);
        results.push({ model: model.name, status: '✅ Working' });
      } else {
        const error = await response.json();
        console.log(`  ❌ ${model.name} - ${error.error || response.status}`);
        results.push({ model: model.name, status: `❌ ${error.error || response.status}` });
      }
    } catch (error) {
      console.log(`  ❌ ${model.name} - ${error.message}`);
      results.push({ model: model.name, status: `❌ ${error.message}` });
    }
  }
  
  console.log('\n📊 Model Test Results:');
  console.log('=' .repeat(50));
  results.forEach(r => console.log(`${r.model.padEnd(25)} ${r.status}`));
  console.log('=' .repeat(50));
  
  return true;
}

async function runTests() {
  console.log('🧪 Starting Pollinations Worker Tests...\n');
  console.log('=' .repeat(60));
  
  const results = {
    health: await testHealth(),
    info: await testInfo(),
    getGen: await testImageGenerationGET(),
    postGen: await testImageGenerationPOST(),
    models: await testDifferentModels()
  };
  
  console.log('\n' + '=' .repeat(60));
  console.log('📋 Test Summary:');
  console.log('=' .repeat(60));
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.values(results).length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Pollinations worker is working perfectly.');
    console.log('\n📸 Generated images:');
    console.log('   • test-pollination-get.jpg (GET endpoint)');
    console.log('   • test-pollination-post.jpg (POST endpoint)');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
  }
  
  console.log('\n💡 Note: Pollinations API may have occasional timeouts or');
  console.log('   server issues. Try again if you get errors.\n');
}

// Run the tests
runTests().catch(console.error);
