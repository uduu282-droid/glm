import fetch from 'node-fetch';

async function analyzeQwenWorkerProxy() {
  console.log('🔍 Analyzing Qwen Worker Proxy\n');
  console.log('=' .repeat(60));
    
  const baseUrl= 'https://qwen-worker-proxy.ronitshrimankar1.workers.dev';
    
    // Test 1: Get API info
  console.log('Test 1: Checking Base Endpoint\n');
    
    try {
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });
      
    const data = await response.json();
      
    console.log('✅ API Information:\n');
    console.log(JSON.stringify(data, null, 2));
      
    } catch(error) {
    console.log(`❌ Error: ${error.message}\n`);
    }
    
  console.log('\n' + '=' .repeat(60));
    
    // Test 2: Check debug endpoints
  console.log('\nTest 2: Exploring Debug Endpoints\n');
    
  const debugEndpoints = [
        '/v1/debug/token',
        '/v1/debug/auth/test',
        '/v1/debug/auth/initiate',
        '/v1/debug/auth/poll'
    ];
    
    for (const endpoint of debugEndpoints) {
        try {
        const url = `${baseUrl}${endpoint}`;
       const response = await fetch(url, {
            method: 'GET',
             headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });
            
        console.log(`${endpoint.padEnd(30)} → ${response.status} ${response.statusText}`);
            
           if (response.ok) {
           const data = await response.json();
          console.log(`  Response: ${JSON.stringify(data).substring(0, 200)}`);
           }
        } catch(error) {
       console.log(`${endpoint.padEnd(30)} → ❌ ${error.message}`);
        }
    }
    
  console.log('\n' + '=' .repeat(60));
    
    // Test 3: Try to find documentation
  console.log('\nTest 3: Looking for Documentation\n');
    
  const docsPaths = [
        '/README.md',
        '/docs',
        '/api-docs',
        '/swagger',
        '/openapi.json',
        '/health'
    ];
    
    for (const path of docsPaths) {
        try {
        const url = `${baseUrl}${path}`;
       const response = await fetch(url, {
            method: 'GET',
             headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });
            
        console.log(`${path.padEnd(20)} → ${response.status} ${response.statusText}`);
        } catch(error) {
       console.log(`${path.padEnd(20)} → ❌ ${error.message}`);
        }
    }
    
  console.log('\n' + '=' .repeat(60));
    
    // Test 4: Analyze response headers
  console.log('\nTest 4: Checking Response Headers\n');
    
    try {
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });
      
    console.log('\nServer Headers:');
     response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
     });
      
    } catch(error) {
    console.log(`❌ Error: ${error.message}`);
    }
    
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 ANALYSIS SUMMARY\n');
  console.log('Based on the analysis:\n');
  console.log('✅ What We Know:');
  console.log('  • Platform: Cloudflare Workers');
  console.log('  • API Format: OpenAI-compatible');
  console.log('  • Models: qwen3-coder-plus, qwen3-coder-flash, vision-model');
  console.log('  • Auth: None required (OAuth 2.0 optional)');
  console.log('  • Version: 1.0.0');
  console.log('\n⚠️  Source Code Status:');
  console.log('  • Not publicly available (private repository)');
  console.log('  • Running on Cloudflare Workers infrastructure');
  console.log('  • Owner: ronitshrimankar1');
  console.log('\n💡 To View Source Code:');
  console.log('  1. Contact the owner: ronitshrimankar1');
  console.log('  2. Check GitHub for: qwen-worker-proxy');
  console.log('  3. Or deploy your own similar proxy!\n');
  console.log('=' .repeat(60));
}

analyzeQwenWorkerProxy().catch(console.error);
