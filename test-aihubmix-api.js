import axios from 'axios';

const API_KEY = 'sk-7d0UpxQGacF7uAgb7dF6FaE6D2744023A971E1485331C96d';
const BASE_URL = 'https://aihubmix.com/v1/chat/completions';

const models = [
  'coding-minimax-m2.7-free',
  'minimax-m2.5-free',
  'coding-minimax-m2.5-free'
];

async function testModel(modelId) {
  console.log(`\n🧪 Testing: ${modelId}\n`);
  
  try {
    const response = await axios.post(
      BASE_URL,
      {
        model: modelId,
        messages: [
          {
            role: 'user',
            content: 'Hello, how are you? Please respond briefly.'
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    console.log('✅ Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2).substring(0, 500));
    
    if (response.data.choices && response.data.choices.length > 0) {
      console.log('\n💬 Response content:');
      console.log(response.data.choices[0].message.content);
    }
    
    return { success: true, model: modelId, data: response.data };
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    }
    
    return { success: false, model: modelId, error: error.message };
  }
}

async function main() {
  console.log('🔍 Testing AIHubMix API Key\n');
  console.log('=' .repeat(70));
  console.log(`API Key: sk-${API_KEY.substring(3, 20)}...`);
  
  const results = [];
  
  for (const model of models) {
    const result = await testModel(model);
    results.push(result);
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n\n📊 TEST SUMMARY');
  console.log('=' .repeat(70));
  
  const successes = results.filter(r => r.success);
  const failures = results.filter(r => !r.success);
  
  console.log(`\nTotal tested: ${results.length}`);
  console.log(`✅ Successful: ${successes.length}`);
  console.log(`❌ Failed: ${failures.length}`);
  
  if (successes.length > 0) {
    console.log('\n✅ WORKING MODELS:\n');
    successes.forEach(s => {
      console.log(`   • ${s.model}`);
    });
  }
  
  if (failures.length > 0) {
    console.log('\n❌ FAILED MODELS:\n');
    failures.forEach(f => {
      console.log(`   • ${f.model}`);
      console.log(`     Error: ${f.error}`);
    });
  }
}

main().catch(console.error);
