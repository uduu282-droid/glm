import axios from 'axios';

const WORKER_URL = 'https://pollinations-image-worker.llamai.workers.dev';

async function testWorker() {
  console.log('🎨 Testing Deployed Pollinations Worker\n');
  console.log('=' .repeat(80));
  console.log(`Worker URL: ${WORKER_URL}\n`);
  
  // Test 1: Check worker info
  console.log('📊 Test 1: Getting Worker Info...\n');
  try {
    const infoResponse = await axios.get(WORKER_URL);
    console.log('✅ Worker Info:');
    console.log(JSON.stringify(infoResponse.data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n' + '-'.repeat(80) + '\n');
  
  // Test 2: Health check
  console.log('💚 Test 2: Health Check...\n');
  try {
    const healthResponse = await axios.get(`${WORKER_URL}/health`);
    console.log('✅ Health Status:');
    console.log(JSON.stringify(healthResponse.data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n' + '-'.repeat(80) + '\n');
  
  // Test 3: Generate image with GET
  console.log('🖼️  Test 3: Generate Image (GET method)...\n');
  const testPrompt = 'simple cat';
  console.log(`Prompt: ${testPrompt}`);
  console.log('⏳ Generating image (this may take 30-60 seconds)...\n');
  
  try {
    const imageUrl = `${WORKER_URL}/generate?prompt=${encodeURIComponent(testPrompt)}&width=512&height=512&model=flux`;
    
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 120000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.status === 200) {
      const fs = require('fs');
      const path = require('path');
      
      const fileName = `worker_test_image_${Date.now()}.jpg`;
      const filePath = path.join(process.cwd(), fileName);
      
      fs.writeFileSync(filePath, response.data);
      
      const fileSize = (response.data.length / 1024).toFixed(2);
      
      console.log('✅ SUCCESS!');
      console.log(`\n💾 Image saved to: ${filePath}`);
      console.log(`📊 File size: ${fileSize} KB`);
      console.log(`🖼️  Content-Type: ${response.headers['content-type']}`);
    } else {
      console.log('❌ Unexpected status:', response.status);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      if (error.response.data) {
        console.log('Error body:', error.response.data.toString());
      }
    }
  }
  
  console.log('\n' + '-'.repeat(80) + '\n');
  
  // Test 4: Generate image with POST
  console.log('📨 Test 4: Generate Image (POST method)...\n');
  
  try {
    const postResponse = await axios.post(
      `${WORKER_URL}/generate`,
      {
        prompt: 'beautiful sunset',
        width: 512,
        height: 512,
        model: 'flux',
        seed: 12345
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000
      }
    );
    
    console.log('✅ POST Response:');
    console.log(JSON.stringify({
      success: postResponse.data.success,
      prompt: postResponse.data.prompt,
      width: postResponse.data.width,
      height: postResponse.data.height,
      model: postResponse.data.model,
      seed: postResponse.data.seed,
      hasImageBase64: !!postResponse.data.imageBase64,
      imageUrl: postResponse.data.imageUrl
    }, null, 2));
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      if (error.response?.data) {
        try {
          console.log('Error body:', JSON.stringify(error.response.data, null, 2));
        } catch {
          console.log('Error body:', error.response.data.toString().substring(0, 500));
        }
      }
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n📋 AVAILABLE MODELS ON POLLINATIONS:\n');
  
  console.log('Based on the API documentation and testing:\n');
  
  const models = {
    'Image Generation Models': [
      { name: 'flux', description: 'FLUX.1 - High quality image generation', recommended: true },
      { name: 'turbo', description: 'Fast generation (lower quality)' },
      { name: 'stable-diffusion', description: 'Stable Diffusion models' }
    ],
    'Text Generation Models': [
      { name: 'openai-compatible', description: 'Use via gen.pollinations.ai/v1/chat/completions' }
    ]
  };
  
  for (const [category, categoryModels] of Object.entries(models)) {
    console.log(`📁 ${category}:`);
    categoryModels.forEach(model => {
      const icon = model.recommended ? '⭐' : '•';
      console.log(`   ${icon} ${model.name.padEnd(25)} - ${model.description}`);
    });
    console.log('');
  }
  
  console.log('\n💡 TIPS:\n');
  console.log('1. Use "flux" model for best quality images');
  console.log('2. Add "nologo=true" parameter to remove watermarks');
  console.log('3. Custom seeds give reproducible results');
  console.log('4. Dimensions up to 2048x2048 supported');
  console.log('5. Anonymous usage: ~1 request per 15 seconds');
  
  console.log('\n\n📝 USAGE EXAMPLES:\n');
  console.log('GET Request:');
  console.log(`curl "${WORKER_URL}/generate?prompt=cat&width=512&height=512"\n`);
  
  console.log('POST Request:');
  console.log(`curl ${WORKER_URL}/generate \\`);
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"prompt":"cat","width":512,"model":"flux"}\'\n');
  
  console.log('\n🎉 Worker deployment complete!\n');
}

testWorker().catch(console.error);
