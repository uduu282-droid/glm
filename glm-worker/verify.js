#!/usr/bin/env node
/**
 * Quick Verification Script
 * Tests if the GLM-5 Worker is working correctly
 */

const WORKER_URL = process.argv[2] || 'http://localhost:8787';

async function quickTest() {
  console.log('🧪 Quick GLM-5 Worker Test\n');
  
  try {
    // Test 1: Health check
    console.log('1. Health check...');
    const health = await fetch(`${WORKER_URL}/health`);
    const healthData = await health.json();
    console.log(`   ✅ Status: ${healthData.status}`);
    
    // Test 2: Simple chat
    console.log('\n2. Testing chat completion...');
    const startTime = Date.now();
    
    const response = await fetch(`${WORKER_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'glm-5',
        messages: [{ role: 'user', content: 'Say "test" in one word' }]
      })
    });
    
    const elapsed = Date.now() - startTime;
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Response time: ${elapsed}ms`);
      console.log(`   ✅ Answer: ${data.choices?.[0]?.message?.content || '(empty)'}`);
      console.log('\n✅ Worker is functioning correctly!\n');
    } else {
      console.log(`   ❌ Error: ${data.error?.message || 'Unknown error'}`);
      console.log('\n⚠️  Worker may need session reset\n');
    }
    
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}\n`);
  }
}

quickTest();
