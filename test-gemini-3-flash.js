import axios from 'axios';

const WORKER_URL = 'https://aihubmix-worker.llamai.workers.dev';

async function testGemini3Flash() {
  console.log('🧪 Testing Gemini 3 Flash Preview Model\n');
  console.log('=' .repeat(60));
  
  const modelId = 'gemini-3-flash-preview-free';
  
  try {
    console.log(`\n📡 Sending request to: ${modelId}\n`);
    
    const response = await axios.post(
      `${WORKER_URL}/v1/chat/completions`,
      {
        model: modelId,
        messages: [
          {
            role: 'user',
            content: 'Hello! Please introduce yourself as Gemini 3 Flash.'
          }
        ],
        max_tokens: 300
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    console.log('✅ Response Status:', response.status);
    
    if (response.data.choices && response.data.choices.length > 0) {
      const content = response.data.choices[0].message?.content;
      console.log('\n💬 Response Content:\n');
      console.log(content);
      
      // Check for usage info
      if (response.data.usage) {
        console.log('\n📊 Usage Stats:');
        console.log(JSON.stringify(response.data.usage, null, 2));
      }
    }
    
    return { success: true, data: response.data };
    
  } catch (error) {
    console.log('\n❌ Error occurred:', error.message);
    
    if (error.response) {
      console.log('\n📊 Response Status:', error.response.status);
      console.log('\n📝 Response Data:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    
    return { success: false, error: error.message };
  }
}

testGemini3Flash().catch(console.error);
