import axios from 'axios';

const WORKER_URL = 'https://aihubmix-worker.llamai.workers.dev';

async function testGemini2Flash() {
  console.log('🧪 Testing Gemini 2.0 Flash Model\n');
  console.log('=' .repeat(60));
  
  const modelId = 'gemini-2.0-flash-free';
  
  try {
    console.log(`\n📡 Sending request to: ${modelId}\n`);
    
    const response = await axios.post(
      `${WORKER_URL}/v1/chat/completions`,
      {
        model: modelId,
        messages: [
          {
            role: 'user',
            content: 'Hello! Please introduce yourself as Gemini 2.0 Flash.'
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
    console.log('\n💬 Full Response:\n');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.choices && response.data.choices.length > 0) {
      const content = response.data.choices[0].message?.content;
      console.log('\n\n📝 Extracted Content:\n');
      console.log(content);
    }
    
    return { success: true, data: response.data };
    
  } catch (error) {
    console.log('\n❌ Error occurred:', error.message);
    
    if (error.response) {
      console.log('\n📊 Response Status:', error.response.status);
      console.log('\n📝 Response Data:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.request) {
      console.log('\n🔍 No response received. Request details:');
      console.log(error.request);
    }
    
    return { success: false, error: error.message };
  }
}

testGemini2Flash().catch(console.error);
