import fetch from 'node-fetch';

async function testFreeAIChatAPI() {
   console.log('🧪 Testing Free AI Chat API: free-aichat.vercel.app');
   console.log('====================================================\n');
    
   const baseUrl = 'https://free-aichat.vercel.app';
    
    // From the network request, we can see this is a Next.js app with actions
    // The action ID from the request: 405240754eac217df4ff6088d4d438a00cf17c8683
    
   const headers= {
        'accept': 'text/x-component',
        'content-type': 'text/plain;charset=UTF-8',
        'next-action': '405240754eac217df4ff6088d4d438a00cf17c8683',
        'next-router-state-tree': '%5B%22%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
        'origin': 'https://free-aichat.vercel.app',
        'referer': 'https://free-aichat.vercel.app/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    };
    
    // Test payload - empty request body as shown in the network tab
   const requestBody = '';
    
   console.log('Test 1: Basic Action Request');
   console.log('POST /');
    try {
       const response = await fetch(`${baseUrl}/`, {
           method: 'POST',
           headers: headers,
            body: requestBody
        });
        
       console.log(`  Status: ${response.status} ${response.statusText}`);
       console.log(`  Content-Type: ${response.headers.get('content-type')}`);
       console.log(`  X-Powered-By: ${response.headers.get('x-powered-by')}`);
        
       const text = await response.text();
        
        if (response.ok) {
           console.log('  ✅ SUCCESS: Response received');
           console.log(`\n  Response Preview (${text.length} chars):`);
           console.log(text.substring(0, 1500));
            
            // Try to parse as JSON if possible
            try {
               const data = JSON.parse(text);
               console.log('\n  📦 Parsed JSON:');
               console.log(JSON.stringify(data, null, 2).substring(0, 1000));
            } catch (e) {
               console.log('\n  ℹ️  Response is not JSON (likely React Server Component output)');
            }
        } else {
           console.log(`  ❌ FAILED: ${text.substring(0, 500)}`);
        }
    } catch (error) {
       console.log(`  ❌ Error: ${error.message}`);
    }
    
   console.log('\n' + '='.repeat(60));
   console.log('\nTest 2: Exploring Available Endpoints\n');
    
    // Common endpoints to check
   const endpointsToTest = [
        { name: 'Models Endpoint', url: `${baseUrl}/api/models`, method: 'GET' },
        { name: 'Chat Completions', url: `${baseUrl}/api/chat`, method: 'POST' },
        { name: 'Vercel AI SDK', url: `${baseUrl}/api/chat`, method: 'POST', headers: { 'Content-Type': 'application/json' } },
    ];
    
    for (const endpoint of endpointsToTest) {
       console.log(`Testing: ${endpoint.name}`);
       console.log(`${endpoint.method} ${endpoint.url}`);
        
        try {
           const options = {
               method: endpoint.method,
               headers: endpoint.headers || {}
            };
            
            if (endpoint.method === 'POST') {
                options.headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify({
                   messages: [{ role: 'user', content: 'test' }],
                    model: 'gpt-3.5-turbo'
                });
            }
            
           const response = await fetch(endpoint.url, options);
            
           console.log(`  Status: ${response.status} ${response.statusText}`);
           console.log(`  Content-Type: ${response.headers.get('content-type')}`);
            
            if (response.ok) {
               const text = await response.text();
               console.log('  ✅ Endpoint exists');
               console.log(`  Response: ${text.substring(0, 300)}...\n`);
            } else {
               console.log(`  ❌ Not accessible\n`);
            }
        } catch (error) {
           console.log(`  ❌ Error: ${error.message}\n`);
        }
    }
    
   console.log('\n' + '='.repeat(60));
   console.log('\nTest 3: Fetching Homepage to Analyze Models\n');
    
    try {
       const response = await fetch(baseUrl, {
           method: 'GET',
           headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
       console.log(`  Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
           const html = await response.text();
           console.log(`  ✅ Homepage fetched (${html.length} chars)`);
            
            // Look for model names in the HTML
           const modelPatterns = [
                /gpt-[\w.-]+/gi,
                /claude-[\w.-]+/gi,
                /llama-[\d.]+b?/gi,
                /mistral-[\w.-]+/gi,
                /gemini-[\w.-]+/gi,
                /"model":\s*"([^"]+)"/gi,
                /models\s*[:=]\s*\[([\s\S]*?)\]/gi
            ];
            
           console.log('\n  🔍 Searching for model references in HTML...');
            
            let foundModels = new Set();
            
            modelPatterns.forEach((pattern, idx) => {
               const matches = html.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        // Clean up the match
                        let cleanMatch = match.replace(/["':=\[\],\s]/g, '').trim();
                        if (cleanMatch.length > 2 && cleanMatch.length < 50) {
                            foundModels.add(cleanMatch);
                        }
                    });
                }
            });
            
            if (foundModels.size > 0) {
               console.log(`\n  📦 Found ${foundModels.size} potential model references:`);
                Array.from(foundModels).slice(0, 20).forEach(model => {
                   console.log(`    - ${model}`);
                });
            }
            
            // Also look for any API configuration
           const apiConfigMatch = html.match(/\/api\/[\w/-]+/g);
            if (apiConfigMatch) {
               console.log(`\n  🔗 Found ${apiConfigMatch.length} API endpoints:`);
               const uniqueEndpoints = [...new Set(apiConfigMatch)];
                uniqueEndpoints.slice(0, 10).forEach(ep => {
                   console.log(`    ${ep}`);
                });
            }
            
        } else {
           console.log(`  ❌ Failed to fetch homepage`);
        }
    } catch (error) {
       console.log(`  ❌ Error: ${error.message}`);
    }
    
   console.log('\n' + '='.repeat(60));
   console.log('✅ Free AI Chat API Analysis Complete\n');
}

// Run the test
testFreeAIChatAPI().catch(console.error);
