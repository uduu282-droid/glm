/**
 * Test script for AIHubMix Worker
 * Tests health, models, and stats endpoints
 */

import http from 'http';

const WORKER_URL = 'http://127.0.0.1:8787'; // Local wrangler dev server

// Add keep-alive agent for better connection handling
const agent = new http.Agent({ keepAlive: true });

async function testHealth() {
  console.log('\n🏥 Testing /health endpoint...');
  try {
    const response = await fetch(`${WORKER_URL}/health`, { agent });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Health check passed!');
      console.log('Response:', JSON.stringify(data, null, 2));
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

async function testModels() {
  console.log('\n📦 Testing /models endpoint...');
  try {
    const response = await fetch(`${WORKER_URL}/models`, { agent });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Models endpoint working!');
      console.log(`Total models: ${data.models.length}`);
      
      // Show model categories
      const coding = data.models.filter(m => m.type === 'coding').length;
      const general = data.models.filter(m => m.type === 'general').length;
      const vision = data.models.filter(m => m.type === 'vision').length;
      
      console.log(`  - Coding models: ${coding}`);
      console.log(`  - General models: ${general}`);
      console.log(`  - Vision models: ${vision}`);
      
      console.log('\nSample models:');
      data.models.slice(0, 5).forEach(model => {
        console.log(`  • ${model.id} (${model.provider})`);
      });
      
      return true;
    } else {
      console.log('❌ Models endpoint failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Models endpoint error:', error.message);
    return false;
  }
}

async function testStats() {
  console.log('\n📊 Testing /stats endpoint...');
  try {
    const response = await fetch(`${WORKER_URL}/stats`, { agent });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Stats endpoint working!');
      console.log('Response:', JSON.stringify(data, null, 2));
      return true;
    } else {
      console.log('❌ Stats endpoint failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Stats endpoint error:', error.message);
    return false;
  }
}

async function testChatCompletion() {
  console.log('\n💬 Testing /v1/chat/completions endpoint...');
  try {
    const response = await fetch(`${WORKER_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-nano-free',
        messages: [
          { role: 'user', content: 'Say "Hello, this is a test!" in exactly 3 words.' }
        ]
      }),
      agent
    });
    
    const data = await response.json();
    
    if (response.ok && data.choices && data.choices.length > 0) {
      console.log('✅ Chat completion working!');
      console.log('Response:', data.choices[0].message.content);
      return true;
    } else {
      console.log('⚠️  Chat completion returned:', response.status);
      console.log('Response:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Chat completion error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting AIHubMix Worker Tests...\n');
  console.log('=' .repeat(50));
  
  const results = {
    health: await testHealth(),
    models: await testModels(),
    stats: await testStats(),
    chat: await testChatCompletion()
  };
  
  console.log('\n' + '=' .repeat(50));
  console.log('📋 Test Summary:');
  console.log('=' .repeat(50));
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.values(results).length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Worker is deployed and working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
    console.log('\nNote: If all tests failed with connection error, make sure to:');
    console.log('  1. Run: wrangler dev worker-aihubmix.js');
    console.log('  2. Wait for the local server to start');
    console.log('  3. Re-run this test');
  }
}

// Run the tests
runTests().catch(console.error);
