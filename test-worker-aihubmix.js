import axios from 'axios';

const WORKER_URL = 'https://aihubmix-worker.llamai.workers.dev';

const models = [
  'coding-minimax-m2.7-free',
  'minimax-m2.5-free',
  'coding-minimax-m2.5-free'
];

async function testWorkerModel(modelId) {
  console.log(`\n🧪 Testing via Worker: ${modelId}\n`);
  
  try {
    const response = await axios.post(
      `${WORKER_URL}/v1/chat/completions`,
      {
        model: modelId,
        messages: [
          {
            role: 'user',
            content: 'Hello! Test this worker endpoint.'
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Worker Status:', response.status);
    
    if (response.data.choices && response.data.choices.length > 0) {
      console.log('💬 Response:', response.data.choices[0].message.content.substring(0, 200));
    }
    
    return { success: true, model: modelId, data: response.data };
    
  } catch (error) {
    console.log('❌ Worker Error:', error.message);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    }
    
    return { success: false, model: modelId, error: error.message };
  }
}

async function main() {
  console.log('🔍 Testing AIHubMix Worker Deployment\n');
  console.log('=' .repeat(70));
  console.log(`Worker URL: ${WORKER_URL}\n`);
  
  // Test health first
  try {
    const healthResponse = await axios.get(`${WORKER_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  console.log('\n\n📡 Testing All Models Through Worker...\n');
  
  const results = [];
  
  for (const model of models) {
    const result = await testWorkerModel(model);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n\n📊 WORKER TEST SUMMARY');
  console.log('=' .repeat(70));
  
  const successes = results.filter(r => r.success);
  const failures = results.filter(r => !r.success);
  
  console.log(`\nTotal: ${results.length}`);
  console.log(`✅ Success: ${successes.length}`);
  console.log(`❌ Failed: ${failures.length}`);
  
  if (successes.length > 0) {
    console.log('\n✅ WORKING VIA WORKER:\n');
    successes.forEach(s => {
      console.log(`   • ${s.model}`);
    });
  }
  
  if (failures.length > 0) {
    console.log('\n❌ FAILED:\n');
    failures.forEach(f => {
      console.log(`   • ${f.model}`);
    });
  }
  
  console.log('\n\n💡 Usage Example:\n');
  console.log(`curl ${WORKER_URL}/v1/chat/completions \\`);
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"model": "minimax-m2.5-free", "messages": [{"role": "user", "content": "Hello!"}]}\'');
}

main().catch(console.error);
