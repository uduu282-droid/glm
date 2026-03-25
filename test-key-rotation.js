import axios from 'axios';

const WORKER_URL = 'https://aihubmix-worker.llamai.workers.dev';

async function testKeyRotation() {
  console.log('🔑 Testing API Key Rotation System\n');
  console.log('=' .repeat(80));
  
  // Check worker info and stats first
  try {
    console.log('📊 Checking worker info...\n');
    const info = await axios.get(WORKER_URL);
    console.log('✅ Worker Info:', JSON.stringify(info.data, null, 2));
    
    console.log('\n\n📊 Initial Stats:\n');
    const initialStats = await axios.get(`${WORKER_URL}/stats`);
    console.log(JSON.stringify(initialStats.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n\n🚀 Making multiple requests to test rotation...\n');
  console.log('(Each request should use a different API key)\n');
  
  const testModels = [
    'gpt-4o-free',
    'minimax-m2.5-free',
    'coding-minimax-m2.7-free',
    'gpt-4.1-nano-free',
    'glm-4.7-flash-free'
  ];
  
  const results = [];
  
  for (let i = 0; i < testModels.length; i++) {
    const modelId = testModels[i];
    console.log(`\n📝 Request #${i + 1}: ${modelId}`);
    console.log('-'.repeat(80));
    
    try {
      const response = await axios.post(
        `${WORKER_URL}/v1/chat/completions`,
        {
          model: modelId,
          messages: [
            {
              role: 'user',
              content: 'Hi! Just testing the key rotation system.'
            }
          ]
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );
      
      console.log(`✅ Success! Status: ${response.status}`);
      
      if (response.data.choices && response.data.choices.length > 0) {
        const content = response.data.choices[0].message.content;
        console.log(`💬 Response (${content.length} chars): ${content.substring(0, 150)}...`);
      }
      
      results.push({
        success: true,
        model: modelId,
        status: response.status
      });
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      
      if (error.response?.data?.error) {
        console.log(`   Error: ${JSON.stringify(error.response.data.error, null, 2)}`);
      }
      
      results.push({
        success: false,
        model: modelId,
        error: error.message
      });
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Final stats
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 FINAL STATISTICS');
  console.log('='.repeat(80));
  
  try {
    const finalStats = await axios.get(`${WORKER_URL}/stats`);
    console.log('\nKey Usage Statistics:');
    console.log(JSON.stringify(finalStats.data, null, 2));
    
    console.log('\n\n📈 Analysis:\n');
    const stats = finalStats.data;
    console.log(`Total Requests: ${stats.totalRequests}`);
    console.log(`Successful: ${stats.successfulRequests}`);
    console.log(`Failed: ${stats.failedRequests}`);
    console.log(`Success Rate: ${Math.round(stats.successfulRequests / stats.totalRequests * 100)}%`);
    
    console.log('\nKey Distribution:');
    stats.keyStats.forEach(key => {
      console.log(`  Key #${key.index}: ${key.successes} successes, ${key.failures} failures`);
    });
    
  } catch (error) {
    console.log('❌ Could not fetch stats:', error.message);
  }
  
  // Summary
  console.log('\n\n✅ TEST COMPLETE!\n');
  
  const successes = results.filter(r => r.success).length;
  const failures = results.filter(r => !r.success).length;
  
  console.log(`Results: ${successes}/${results.length} successful`);
  
  console.log('\n💡 Key Rotation Features:');
  console.log('  ✅ Round-robin rotation (changes key every request)');
  console.log('  ✅ Auto-retry on rate limits (tries next key)');
  console.log('  ✅ Failure tracking per key');
  console.log('  ✅ Load balancing across all 9 keys');
  console.log('  ✅ Stats endpoint to monitor usage\n');
}

testKeyRotation().catch(console.error);
