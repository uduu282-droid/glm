/**
 * Comprehensive Test for All DeepSeek Models
 * OpenAI-Compatible Format
 */

const OPENAI_BASE_URL = 'http://localhost:8787/v1';

// Test configurations for different models
const testCases = [
  {
    model: 'deepseek-chat',
    name: 'DeepSeek Chat',
    prompt: 'Explain quantum entanglement in 2 sentences',
    max_tokens: 100
  },
  {
    model: 'deepseek-coder',
    name: 'DeepSeek Coder',
    prompt: 'Write a Python function to reverse a string',
    max_tokens: 150
  },
  {
    model: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    prompt: 'If all roses are flowers and some flowers fade quickly, can we conclude that some roses fade quickly? Explain your reasoning.',
    max_tokens: 200
  }
];

async function testAllModels() {
  console.log('='.repeat(60));
  console.log('🧪 Testing All DeepSeek Models (OpenAI-Compatible)');
  console.log('='.repeat(60));
  console.log('');

  // Step 1: Get available models
  console.log('1. 📚 Fetching available models...\n');
  
  try {
    const modelsResponse = await fetch(`${OPENAI_BASE_URL}/models`);
    const modelsData = await modelsResponse.json();
    
    console.log(`✅ Found ${modelsData.data?.length || 0} models:\n`);
    
    if (modelsData.data && modelsData.data.length > 0) {
      modelsData.data.forEach((model, i) => {
        console.log(`   ${i + 1}. ${model.id}`);
      });
      console.log('');
    }
  } catch (error) {
    console.log('⚠️  Could not fetch models:', error.message, '\n');
  }

  // Step 2: Test each model
  console.log('2. 🚀 Testing individual models...\n');
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📊 Testing: ${testCase.name} (${testCase.model})`);
    console.log(`${'─'.repeat(60)}\n`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: testCase.model,
          messages: [
            { role: 'user', content: testCase.prompt }
          ],
          max_tokens: testCase.max_tokens,
          temperature: 0.7
        })
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('✅ Response received!\n');
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`📝 Content:\n`);
      console.log(data.choices[0].message.content);
      console.log('\n');
      
      if (data.usage) {
        console.log('📊 Usage:');
        console.log(`   Prompt tokens: ${data.usage.prompt_tokens || 0}`);
        console.log(`   Completion tokens: ${data.usage.completion_tokens || 0}`);
        console.log(`   Total tokens: ${data.usage.total_tokens || 0}\n`);
      }

      results.push({
        model: testCase.model,
        status: 'success',
        duration,
        response: data
      });

    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
      
      results.push({
        model: testCase.model,
        status: 'error',
        error: error.message
      });
    }
  }

  // Step 3: Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log('');
  
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  
  console.log(`Total models tested: ${results.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('');
  
  if (successCount > 0) {
    console.log('✅ Working models:');
    results.filter(r => r.status === 'success').forEach(r => {
      console.log(`   - ${r.model} (${r.duration}ms)`);
    });
  }
  
  if (errorCount > 0) {
    console.log('\n❌ Failed models:');
    results.filter(r => r.status === 'error').forEach(r => {
      console.log(`   - ${r.model}: ${r.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('');
  
  // Step 4: OpenAI SDK compatibility test
  console.log('3. 🔧 Testing OpenAI SDK compatibility...\n');
  
  try {
    // Test with OpenAI-like request format
    const openAITest = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'What is 2 + 2?' }
        ],
        temperature: 0.5,
        max_tokens: 50,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    const openAIResponse = await openAITest.json();
    
    if (openAIResponse.id && openAIResponse.choices && openAIResponse.usage) {
      console.log('✅ OpenAI format: COMPATIBLE\n');
      console.log('Response structure:');
      console.log(`   - id: ${openAIResponse.id}`);
      console.log(`   - object: ${openAIResponse.object || 'chat.completion'}`);
      console.log(`   - created: ${openAIResponse.created}`);
      console.log(`   - model: ${openAIResponse.model}`);
      console.log(`   - choices: ${openAIResponse.choices?.length}`);
      console.log(`   - usage: ${JSON.stringify(openAIResponse.usage)}\n`);
    } else {
      console.log('⚠️  Response may not be fully OpenAI-compatible\n');
    }
    
  } catch (error) {
    console.log('❌ OpenAI compatibility test failed:', error.message, '\n');
  }

  console.log('='.repeat(60));
  console.log('✨ TESTING COMPLETE!\n');
  console.log('💡 Next steps:\n');
  console.log('1. Use with OpenAI Python SDK:');
  console.log('   from openai import OpenAI');
  console.log('   client = OpenAI(');
  console.log('       api_key="not-needed",');
  console.log('       base_url="http://localhost:8787/v1"');
  console.log('   )');
  console.log('   response = client.chat.completions.create(');
  console.log('       model="deepseek-chat",');
  console.log('       messages=[{"role": "user", "content": "Hello!"}]');
  console.log('   )\n');
  console.log('2. Or use any OpenAI-compatible tool/library\n');
  console.log('='.repeat(60));
}

// Run the test
testAllModels().catch(console.error);
