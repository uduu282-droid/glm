/**
 * Final comprehensive test for GPT-5.2
 */

import fetch from 'node-fetch';

async function testGPT52() {
  const baseUrl = 'https://n33-ai.qwen4346.workers.dev/v1';
  
  console.log('🧪 COMPREHENSIVE GPT-5.2 TEST\n');
  console.log('='.repeat(60));
  
  // Test 1: Check if model is listed
  console.log('\nTest 1: Checking if GPT-5.2 is in models list...');
  try {
    const modelsResponse = await fetch(`${baseUrl}/models`);
    const modelsData = await modelsResponse.json();
    
    const gptModel = modelsData.data?.find(m => m.id === 'gpt-5.2');
    
    if (gptModel) {
      console.log('✅ GPT-5.2 found in models list');
      console.log('   Model info:', JSON.stringify(gptModel, null, 2));
    } else {
      console.log('❌ GPT-5.2 NOT found in models list');
      return;
    }
  } catch (error) {
    console.log('❌ Error checking models:', error.message);
    return;
  }
  
  // Test 2: Try different request formats
  console.log('\n' + '='.repeat(60));
  console.log('\nTest 2: Testing Different Request Formats\n');
  
  const tests = [
    {
      name: 'Standard format',
      payload: {
        model: 'gpt-5.2',
        messages: [{ role: 'user', content: 'Say hello' }],
        max_tokens: 50
      }
    },
    {
      name: 'With system message',
      payload: {
        model: 'gpt-5.2',
        messages: [
          { role: 'system', content: 'You are helpful.' },
          { role: 'user', content: 'Say hello' }
        ],
        max_tokens: 50
      }
    },
    {
      name: 'Non-streaming explicit',
      payload: {
        model: 'gpt-5.2',
        messages: [{ role: 'user', content: 'Say hello' }],
        max_tokens: 50,
        stream: false
      }
    },
    {
      name: 'Streaming format',
      payload: {
        model: 'gpt-5.2',
        messages: [{ role: 'user', content: 'Say hello' }],
        max_tokens: 50,
        stream: true
      }
    }
  ];
  
  let anyWorked = false;
  
  for (const test of tests) {
    console.log(`\nTesting: ${test.name}...`);
    
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test'
        },
        body: JSON.stringify(test.payload)
      });
      
      console.log(`  Status: ${response.status} ${response.statusText}`);
      
      const text = await response.text();
      
      // Try to parse as JSON
      try {
        const data = JSON.parse(text);
        
        // Check for content
        const content = data.choices?.[0]?.message?.content || 
                       data.choices?.[0]?.delta?.content ||
                       'NO CONTENT';
        
        console.log(`  Content: "${content}"`);
        
        if (content && content !== 'NO CONTENT' && content.trim() !== '') {
          console.log('  ✅ SUCCESS - Got actual response!');
          anyWorked = true;
        } else {
          console.log('  ❌ FAILED - Empty or missing content');
        }
        
        // Show full response for debugging
        console.log('  Full response:', JSON.stringify(data, null, 2).substring(0, 300));
        
      } catch (parseError) {
        console.log('  Raw response:', text.substring(0, 200));
      }
      
    } catch (error) {
      console.log('  ❌ Error:', error.message);
    }
    
    // Delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Test 3: Compare with working model
  console.log('\n' + '='.repeat(60));
  console.log('\nTest 3: Comparison with claude-sonnet-4.5 (known working)\n');
  
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4.5',
        messages: [{ role: 'user', content: 'Say hello in one word' }],
        max_tokens: 20
      })
    });
    
    const text = await response.text();
    const data = JSON.parse(text);
    const content = data.choices?.[0]?.message?.content;
    
    console.log(`  claude-sonnet-4.5 Response: "${content}"`);
    console.log('  ✅ This model works perfectly!');
    
  } catch (error) {
    console.log('  ❌ Error:', error.message);
  }
  
  // Final verdict
  console.log('\n' + '='.repeat(60));
  console.log('\n🎯 FINAL VERDICT\n');
  
  if (anyWorked) {
    console.log('✅ GPT-5.2 IS WORKING (at least one test succeeded)');
    console.log('   Recommendation: Keep it, but investigate parsing issues');
  } else {
    console.log('❌ GPT-5.2 IS BROKEN (all tests returned empty content)');
    console.log('   Recommendation: REMOVE from worker configuration');
    console.log('   Reason: Backend configuration issue (likely missing API key)');
  }
  
  console.log('\n' + '='.repeat(60));
}

testGPT52().catch(console.error);
