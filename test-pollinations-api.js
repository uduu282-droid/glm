import axios from 'axios';

const API_URL = 'https://anmixai.vercel.app/api/pollinations/image';

async function testImageGeneration() {
  console.log('🎨 Testing Image Generation API\n');
  console.log('=' .repeat(80));
  
  const testPrompt = "A beautiful sunset over mountains";
  
  try {
    console.log(`📝 Prompt: ${testPrompt}\n`);
    
    const response = await axios.post(API_URL, {
      prompt: testPrompt,
      width: 1024,
      height: 1024,
      seed: 12345,
      model: 'flux',
      source: 'pollinations'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://anmixai.vercel.app/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'
      },
      timeout: 60000
    });
    
    console.log('✅ Status:', response.status);
    console.log('\n💾 Response Data:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.response) {
      console.log('\nStatus:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    return null;
  }
}

testImageGeneration().catch(console.error);
