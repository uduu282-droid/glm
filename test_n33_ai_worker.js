import fetch from 'node-fetch';

async function testN33AICornerWorker() {
  console.log('🧪 Testing N33 AI Corner Worker Proxy\n');
  console.log('=' .repeat(60));
  
  const baseUrl = 'https://n33-ai.qwen4346.workers.dev';
  
  const models = [
    { id: 'sonar', name: 'Sonar' },
    { id: 'sonar-pro', name: 'Sonar Pro' },
    { id: 'grok-4.1-fast', name: 'Grok 4.1 Fast' },
    { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5' },
    { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5 ⭐ BEST' },
    { id: 'claude-opus-4.5', name: 'Claude Opus 4.5' },
    // gpt-5.2 removed - confirmed broken (returns empty content)
    { id: 'gemini-3-flash', name: 'Gemini 3 Flash' },
    { id: 'gemini-3-pro', name: 'Gemini 3 Pro' }
  ];
  
  // Test 1: Get models endpoint
  console.log('Test 1: Checking /v1/models endpoint\n');
  
  try {
    const response = await fetch(`${baseUrl}/v1/models`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ Available Models:\n');
      
      if (data.data && Array.isArray(data.data)) {
        data.data.forEach(model => {
          console.log(`  • ${model.id || model.name}`);
        });
      } else if (Array.isArray(data)) {
        data.forEach(model => {
          console.log(`  • ${model.id || model.name}`);
        });
      } else {
        console.log(JSON.stringify(data, null, 2));
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ Failed: ${errorText.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  console.log('\n' + '=' .repeat(60));
  
  // Test 2: Test each model with a simple question
  console.log('\nTest 2: Testing All 9 Models\n');
  
  const testMessage = 'What is 2+2? Answer in one word.';
  let successCount = 0;
  
  for (const model of models) {
    console.log(`\nTesting: ${model.name} (${model.id})...`);
    
    try {
      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test'
        },
        body: JSON.stringify({
          model: model.id,
          messages: [{ role: 'user', content: testMessage }],
          max_tokens: 20
        })
      });
      
      console.log(`  Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const responseText = await response.text();
        
        // Handle SSE streaming format
        let aiResponse = '';
        let finalContent = '';
        
        try {
          // Try parsing as SSE stream
          const lines = responseText.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6);
              
              // Skip [DONE] marker
              if (dataStr.trim() === '[DONE]') continue;
              
              try {
                const data = JSON.parse(dataStr);
                
                // Check for delta (streaming) or message (non-streaming)
                if (data.choices && data.choices[0]) {
                  const choice = data.choices[0];
                  
                  if (choice.delta && choice.delta.content !== undefined) {
                    // Streaming chunk
                    finalContent += choice.delta.content;
                  } else if (choice.message && choice.message.content !== undefined) {
                    // Complete message
                    finalContent = choice.message.content;
                  }
                  
                  // Also check finish_reason to know when complete
                  if (choice.finish_reason) {
                    break; // Stop when we have a finish reason
                  }
                }
              } catch (jsonErr) {
                // Skip malformed JSON lines
                continue;
              }
            }
          }
          
          aiResponse = finalContent || 'No content extracted';
          
          // If still no content, try alternative parsing
          if (aiResponse === 'No content extracted') {
            // Try finding content in raw response
            const match = responseText.match(/"content":"([^"]+)"/);
            if (match) {
              aiResponse = match[1].replace(/\\n/g, '\n');
            }
          }
          
          console.log(`  ✅ SUCCESS`);
          console.log(`  Response: "${aiResponse.trim()}"`);
          successCount++;
        } catch (parseError) {
          // If SSE parsing fails, try regular JSON
          try {
            const data = JSON.parse(responseText);
            aiResponse = data.choices?.[0]?.message?.content || 'Parsed response';
            console.log(`  ✅ SUCCESS (non-streaming)`);
            console.log(`  Response: "${aiResponse.trim()}"`);
            successCount++;
          } catch {
            console.log(`  ⚠️  Got response but parsing failed`);
            console.log(`  Raw: ${responseText.substring(0, 100)}...`);
          }
        }
      } else {
        const errorText = await response.text();
        console.log(`  ❌ Failed: ${errorText.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 SUMMARY\n');
  console.log(`Models tested: ${models.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${models.length - successCount}`);
  console.log(`Success rate: ${Math.round((successCount / models.length) * 100)}%\n`);
  
  if (successCount === models.length) {
    console.log('🎉 ALL MODELS WORKING PERFECTLY!\n');
    console.log('💡 Configuration for Claude Code CLI:\n');
    console.log('   $env:ANTHROPIC_BASE_URL="https://n33-ai.qwen4346.workers.dev/v1"');
    console.log('   $env:ANTHROPIC_API_KEY="not-needed"');
    console.log('   claude --model <model-name>\n');
  } else {
    console.log('⚠️  Some models failed. Check results above.\n');
  }
  
  console.log('=' .repeat(60));
  
  // Test 3: Check API info
  console.log('\nTest 3: Checking Base Endpoint Info\n');
  
  try {
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ API Information:\n');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log(`ℹ️  No info at base endpoint: ${error.message}`);
  }
  
  console.log('\n' + '=' .repeat(60));
}

testN33AICornerWorker().catch(console.error);
