/**
 * Test Script for GLM-5 Worker Proxy
 * 
 * Usage:
 *   node test-worker.js [worker-url]
 * 
 * Examples:
 *   node test-worker.js                          # Test local worker (localhost:8787)
 *   node test-worker.js https://your-worker.workers.dev  # Test deployed worker
 */

const WORKER_URL = process.argv[2] || 'http://localhost:8787';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(colors.cyan, title);
  console.log('='.repeat(60) + '\n');
}

async function testHealth() {
  section('TEST 1: Health Check');
  
  try {
    const response = await fetch(`${WORKER_URL}/health`);
    const data = await response.json();
    
    log(colors.green, '✅ Health endpoint working!');
    console.log('Status:', data.status);
    console.log('Session:', data.session);
    console.log('Turns:', data.turns);
    console.log('Chat ID:', data.chat_id);
    
    return data;
  } catch (error) {
    log(colors.red, '❌ Health check failed:', error.message);
    return null;
  }
}

async function testModels() {
  section('TEST 2: Models Endpoint');
  
  try {
    const response = await fetch(`${WORKER_URL}/v1/models`);
    const data = await response.json();
    
    log(colors.green, '✅ Models endpoint working!');
    console.log('Total models:', data.data?.length || 0);
    
    if (data.data && data.data.length > 0) {
      data.data.forEach(model => {
        console.log(`\n- ${model.id}`);
        console.log(`  Owned by: ${model.owned_by}`);
        console.log(`  Created: ${new Date(model.created * 1000).toISOString()}`);
      });
    }
    
    return data;
  } catch (error) {
    log(colors.red, '❌ Models endpoint failed:', error.message);
    return null;
  }
}

async function testNonStreaming() {
  section('TEST 3: Non-Streaming Chat');
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${WORKER_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'glm-5',
        messages: [{ role: 'user', content: 'Say hello in one word' }]
      })
    });
    
    const elapsed = Date.now() - startTime;
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    log(colors.green, '✅ Non-streaming chat working!');
    console.log(`Response time: ${elapsed}ms`);
    console.log('Model:', data.model);
    console.log('Answer:', data.choices?.[0]?.message?.content || 'No content');
    console.log('Finish reason:', data.choices?.[0]?.finish_reason);
    
    return data;
  } catch (error) {
    log(colors.red, '❌ Non-streaming chat failed:', error.message);
    return null;
  }
}

async function testStreaming() {
  section('TEST 4: Streaming Chat');
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${WORKER_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'glm-5',
        messages: [{ role: 'user', content: 'Count from 1 to 5' }],
        stream: true
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${error.error?.message || 'Unknown error'}`);
    }
    
    log(colors.green, '✅ Streaming started!');
    console.log('Streaming tokens...\n');
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let tokens = [];
    let buffer = '';
    let firstTokenTime = null;
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        
        const jsonStr = trimmed.slice(5).trim();
        if (!jsonStr || jsonStr === '[DONE]') continue;
        
        try {
          const event = JSON.parse(jsonStr);
          
          if (event.choices && event.choices[0]) {
            const delta = event.choices[0].delta?.content || '';
            
            if (delta) {
              if (!firstTokenTime) {
                firstTokenTime = Date.now();
                log(colors.yellow, `First token: ${(Date.now() - startTime)}ms`);
              }
              
              process.stdout.write(delta);
              tokens.push(delta);
            }
            
            if (event.choices[0].finish_reason === 'stop') {
              console.log('\n\n✅ Stream complete!');
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    
    const fullText = tokens.join('');
    const totalTime = Date.now() - startTime;
    
    console.log(`\nTotal time: ${totalTime}ms`);
    console.log(`Tokens received: ${tokens.length}`);
    console.log(`Full answer: ${fullText}`);
    
    return { text: fullText, tokens: tokens.length };
  } catch (error) {
    log(colors.red, '❌ Streaming chat failed:', error.message);
    console.error(error.stack);
    return null;
  }
}

async function testMultiTurn() {
  section('TEST 5: Multi-turn Conversation');
  
  try {
    log(colors.blue, 'Turn 1: Introduction');
    
    // Turn 1
    const response1 = await fetch(`${WORKER_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'glm-5',
        messages: [
          { role: 'system', content: 'You are helpful.' },
          { role: 'user', content: 'My name is Bob' }
        ]
      })
    });
    
    const data1 = await response1.json();
    const answer1 = data1.choices?.[0]?.message?.content;
    
    log(colors.green, '✅ Turn 1 complete!');
    console.log('Answer:', answer1);
    
    // Turn 2
    log(colors.blue, '\nTurn 2: Memory test');
    
    const response2 = await fetch(`${WORKER_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'glm-5',
        messages: [
          { role: 'system', content: 'You are helpful.' },
          { role: 'user', content: 'My name is Bob' },
          { role: 'assistant', content: answer1 },
          { role: 'user', content: 'What is my name?' }
        ]
      })
    });
    
    const data2 = await response2.json();
    const answer2 = data2.choices?.[0]?.message?.content;
    
    log(colors.green, '✅ Turn 2 complete!');
    console.log('Answer:', answer2);
    
    // Check if name was remembered
    if (answer2 && answer2.toLowerCase().includes('bob')) {
      log(colors.green, '\n✅ SUCCESS! Model remembered the name!');
    } else {
      log(colors.yellow, '\n⚠️  Model may not have remembered the name');
    }
    
    return { turn1: answer1, turn2: answer2 };
  } catch (error) {
    log(colors.red, '❌ Multi-turn test failed:', error.message);
    return null;
  }
}

async function testSessionReset() {
  section('TEST 6: Session Reset');
  
  try {
    const response = await fetch(`${WORKER_URL}/v1/session/reset`, {
      method: 'POST'
    });
    
    const data = await response.json();
    
    log(colors.green, '✅ Session reset successful!');
    console.log('Status:', data.status);
    console.log('Message:', data.message);
    
    return data;
  } catch (error) {
    log(colors.red, '❌ Session reset failed:', error.message);
    return null;
  }
}

async function runAllTests() {
  section('🧪 GLM-5 Worker Proxy - Comprehensive Test Suite');
  console.log('Worker URL:', WORKER_URL);
  console.log('Starting tests...\n');
  
  const results = {
    health: await testHealth(),
    models: await testModels(),
    nonStreaming: await testNonStreaming(),
    streaming: await testStreaming(),
    multiTurn: await testMultiTurn(),
    reset: await testSessionReset(),
  };
  
  section('📊 TEST SUMMARY');
  
  const passed = Object.values(results).filter(r => r !== null).length;
  const total = Object.keys(results).length;
  
  console.log(`Passed: ${passed}/${total}`);
  
  if (passed === total) {
    log(colors.green, '\n🎉 All tests passed! Worker is ready for deployment!');
  } else {
    log(colors.yellow, '\n⚠️  Some tests failed. Check the output above for details.');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// Run all tests
runAllTests().catch(console.error);
