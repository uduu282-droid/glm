import axios from 'axios';

const WORKER_URL = 'https://aihubmix-worker.llamai.workers.dev';

async function testTenRequests() {
  console.log('🔥 Testing 10 Rapid Requests with Key Rotation\n');
  console.log('=' .repeat(80));
  console.log('Goal: Test if we hit rate limits with 10 consecutive requests\n');
  
  // Check initial stats
  try {
    const initialStats = await axios.get(`${WORKER_URL}/stats`);
    console.log('📊 Initial Stats:');
    console.log(`   Total Keys: ${initialStats.data.totalKeys}`);
    console.log(`   Current Key: #${initialStats.data.currentKeyIndex}`);
    console.log(`   Previous Requests: ${initialStats.data.totalRequests}\n`);
  } catch (error) {
    console.log('❌ Could not get initial stats:', error.message);
  }
  
  console.log('🚀 Starting 10 rapid requests...\n');
  
  const results = [];
  const startTime = Date.now();
  
  // Send 10 requests as fast as possible
  for (let i = 1; i <= 10; i++) {
    const prompt = `Request #${i} - Keep your response to exactly 5 words.`;
    
    console.log(`📝 Request #${i.toString().padStart(2, '0')}: Sending...`);
    
    try {
      const response = await axios.post(
        `${WORKER_URL}/v1/chat/completions`,
        {
          model: 'gpt-4.1-nano-free', // Fast model
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 20
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );
      
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      
      if (response.status === 200) {
        const content = response.data.choices[0].message.content;
        console.log(`✅ SUCCESS (${elapsed}s) - Key rotated automatically`);
        console.log(`   Response: "${content.substring(0, 60)}..."`);
        
        results.push({
          request: i,
          status: 'success',
          httpStatus: response.status,
          elapsed: elapsed,
          responseLength: content.length
        });
      } else {
        console.log(`⚠️  UNEXPECTED (${elapsed}s) - Status: ${response.status}`);
        results.push({
          request: i,
          status: 'unexpected',
          httpStatus: response.status,
          elapsed: elapsed
        });
      }
      
    } catch (error) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      
      let errorMsg = error.message;
      let statusCode = null;
      
      if (error.response) {
        statusCode = error.response.status;
        
        if (error.response.status === 429) {
          console.log(`❌ RATE LIMIT (${elapsed}s) - Got 429!`);
          if (error.response.data?.error) {
            console.log(`   Error: ${JSON.stringify(error.response.data.error)}`);
          }
        } else if (error.response.status === 403) {
          console.log(`❌ FORBIDDEN (${elapsed}s) - Got 403!`);
        } else {
          console.log(`❌ ERROR (${elapsed}s) - Status: ${error.response.status}`);
        }
        
        errorMsg = `${error.message} (${statusCode})`;
      } else {
        console.log(`❌ NETWORK ERROR (${elapsed}s) - ${error.message}`);
      }
      
      results.push({
        request: i,
        status: 'failed',
        error: errorMsg,
        httpStatus: statusCode,
        elapsed: elapsed
      });
    }
    
    // Minimal delay - just 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // Final stats
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 FINAL RESULTS');
  console.log('=' .repeat(80));
  
  try {
    const finalStats = await axios.get(`${WORKER_URL}/stats`);
    console.log('\n🔑 Key Usage Statistics:');
    console.log(JSON.stringify(finalStats.data, null, 2));
  } catch (error) {
    console.log('❌ Could not fetch final stats:', error.message);
  }
  
  console.log('\n\n📈 Summary:');
  const successes = results.filter(r => r.status === 'success');
  const failures = results.filter(r => r.status === 'failed');
  const unexpected = results.filter(r => r.status === 'unexpected');
  
  console.log(`\nTotal Time: ${totalTime}s`);
  console.log(`Average per Request: ${(totalTime / 10).toFixed(2)}s`);
  console.log(`\n✅ Successful: ${successes.length}/10`);
  console.log(`❌ Failed: ${failures.length}/10`);
  console.log(`⚠️  Unexpected: ${unexpected.length}/10`);
  
  if (failures.length > 0) {
    console.log('\n❌ Failures:');
    failures.forEach(f => {
      console.log(`   Request #${f.request}: ${f.error}`);
    });
  }
  
  console.log('\n\n💡 Analysis:');
  
  if (successes.length === 10) {
    console.log('   🎉 PERFECT! All 10 requests succeeded!');
    console.log('   ✅ Key rotation is working flawlessly');
    console.log('   ✅ No rate limits encountered');
  } else if (successes.length >= 7) {
    console.log('   👍 Good! Most requests succeeded');
    console.log('   ⚠️  Some rate limiting occurred');
  } else {
    console.log('   ⚠️  Heavy rate limiting detected');
    console.log('   💡 Consider adding more API keys or increasing delays');
  }
  
  console.log('\n\n✅ TEST COMPLETE!\n');
}

testTenRequests().catch(console.error);
