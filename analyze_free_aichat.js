import fetch from 'node-fetch';

async function analyzeFreeAIChat() {
  console.log('🔍 Analyzing Free AI Chat: free-aichat.vercel.app');
  console.log('===================================================\n');
    
   const baseUrl = 'https://free-aichat.vercel.app';
    
    // Test 1: Fetch and analyze the homepage HTML/JavaScript
  console.log('Test 1: Analyzing Client-Side Application\n');
    
    try {
      const response = await fetch(baseUrl, {
          method: 'GET',
          headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            }
        });
        
        if (!response.ok) {
          console.log(`  ❌ Failed to fetch homepage: ${response.status}`);
            return;
        }
        
      const html = await response.text();
      console.log(`  ✅ Homepage fetched (${html.length} chars)\n`);
        
        // Look for model selectors in the HTML
      console.log('  🔍 Searching for AI models...\n');
        
        // Pattern 1: Model names in quotes after "model": or model:
      const modelPattern1 = /["']?model["']?\s*[:=]\s*["']([^"']+)["']/gi;
       const matches1 = [...html.matchAll(modelPattern1)];
        
        if (matches1.length > 0) {
          console.log(`  📦 Found ${matches1.length} model references (Pattern 1):`);
            matches1.forEach((match, i) => {
              console.log(`    ${i +1}. ${match[1]}`);
            });
          console.log();
        }
        
        // Pattern 2: Common model name formats
      const commonModels = [
            'gpt-4', 'gpt-3.5', 'gpt-4o', 'gpt-4-turbo',
            'claude-3', 'claude-sonnet', 'claude-haiku',
            'llama-3', 'llama-2', 'llama-3.1',
            'mistral', 'mixtral',
            'gemini-pro', 'gemini-1.5',
            'command-r', 'cohere',
            'phi-3', 'phi-2'
        ];
        
      const foundModels = [];
       commonModels.forEach(model => {
           const regex = new RegExp(model.replace(/[-.]/g, '[-.]') + '[\\w.-]*', 'i');
           const match = html.match(regex);
            if (match) {
                foundModels.push(match[0]);
            }
        });
        
        if (foundModels.length > 0) {
          console.log(`  📦 Found ${foundModels.length} known model patterns:`);
            foundModels.forEach((model, i) => {
              console.log(`    ${i + 1}. ${model}`);
            });
          console.log();
        }
        
        // Pattern 3: Look for dropdown/select options
      const optionPattern = /<option[^>]*value=["']([^"']+)["'][^>]*>([^<]+)<\/option>/gi;
       const options = [...html.matchAll(optionPattern)];
        
        if (options.length > 0) {
          console.log(`  📦 Found ${options.length} dropdown options:`);
            options.forEach((opt, i) => {
              console.log(`    ${i + 1}. Value: "${opt[1]}" Label: "${opt[2].trim()}"`);
            });
          console.log();
        }
        
        // Pattern 4: Look for any JavaScript arrays that might contain models
      const arrayPattern = /(?:models?|availableModels?|modelList)\s*[:=]\s*\[([\s\S]{0,500}?)\]/gi;
       const arrays = [...html.matchAll(arrayPattern)];
        
        if (arrays.length > 0) {
          console.log(`  📦 Found ${arrays.length} model arrays/objects:`);
            arrays.forEach((arr, i) => {
              console.log(`\n    Array ${i +1}:`);
              console.log(`    ${arr[0].substring(0, 300)}`);
            });
          console.log();
        }
        
        // Pattern 5: Look for API endpoints in JavaScript
      const apiEndpoints = html.match(/(https?:\/\/[^\s"'<>]+\/api[^\s"'<>]*)/g) || [];
       const uniqueEndpoints = [...new Set(apiEndpoints)];
        
        if (uniqueEndpoints.length > 0) {
          console.log(`  🔗 Found ${uniqueEndpoints.length} API endpoints:`);
            uniqueEndpoints.forEach(ep => {
              console.log(`    ${ep}`);
            });
          console.log();
        }
        
        // Pattern 6: Look for fetch/XHR calls in embedded JavaScript
      const fetchPattern = /fetch\(["']([^"']+)["']/g;
       const fetchCalls = [...html.matchAll(fetchPattern)];
        
        if (fetchCalls.length > 0) {
          console.log(`  🔗 Found ${fetchCalls.length} fetch calls:`);
            fetchCalls.forEach((call, i) => {
              console.log(`    ${i + 1}. ${call[1]}`);
            });
          console.log();
        }
        
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
  console.log('\n' + '='.repeat(60));
  console.log('\nTest 2: Testing Next.js Server Action\n');
    
    // Try to interact with the actual chat endpoint
    // Based on the network tab data, this appears to use Next.js Actions
    
   const actionHeaders = {
        'accept': 'text/x-component',
        'content-type': 'text/plain;charset=UTF-8',
        'next-action': '405240754eac217df4ff6088d4d438a00cf17c8683',
        'next-router-state-tree': '%5B%22%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
        'origin': baseUrl,
        'referer': `${baseUrl}/`,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    };
    
    // Try different action payloads
   const payloads = [
        { name: 'Empty payload', body: '' },
        { name: 'JSON message', body: JSON.stringify({ message: 'hello' }) },
        { name: 'Chat format', body: JSON.stringify({ messages: [{ role: 'user', content: 'test' }] }) }
    ];
    
    for (const payload of payloads) {
      console.log(`Testing: ${payload.name}`);
        try {
          const response = await fetch(`${baseUrl}/`, {
              method: 'POST',
              headers: actionHeaders,
               body: payload.body
            });
            
          console.log(`  Status: ${response.status} ${response.statusText}`);
          console.log(`  Content-Type: ${response.headers.get('content-type')}`);
            
            if (response.status === 200) {
              const text = await response.text();
              console.log('  ✅ SUCCESS - Got response!');
              console.log(`  Preview: ${text.substring(0, 500)}...\n`);
            } else {
              console.log(`  ℹ️  Status: ${response.status}\n`);
            }
        } catch (error) {
          console.log(`  ❌ Error: ${error.message}\n`);
        }
    }
    
  console.log('\n' + '='.repeat(60));
  console.log('✅ Analysis Complete\n');
    
  console.log('💡 Summary:');
  console.log('   This appears to be a Next.js application using React Server Components.');
  console.log('   The actual API endpoints are not publicly documented.');
  console.log('   To discover the models, you would need to:\n');
  console.log('   1. Open the browser DevTools Network tab');
  console.log('   2. Use the chat interface on the website');
  console.log('   3. Look for API calls that include model parameters');
  console.log('   4. Check the JavaScript bundles for model lists\n');
}

// Run analysis
analyzeFreeAIChat().catch(console.error);
