import fs from 'fs';
import fetch from 'node-fetch';

console.log('🔍 Captured Request Analyzer\n');
console.log('=' .repeat(60));

// Read the captured request file
const capturedFile = 'captured_request.txt';

if (!fs.existsSync(capturedFile)) {
  console.log('❌ No captured_request.txt found!');
  console.log('\n📝 Please follow these steps:');
  console.log('1. Open https://free-aichat.vercel.app/ in your browser');
  console.log('2. Press F12 to open DevTools');
  console.log('3. Go to Network tab');
  console.log('4. Send a message in the chat');
  console.log('5. Right-click the POST request → Copy → Copy as cURL');
  console.log('6. Paste it into captured_request.txt');
  process.exit(1);
}

const capturedContent = fs.readFileSync(capturedFile, 'utf8');

console.log('✅ Found captured request file\n');

// Parse cURL command
function parseCurlCommand(curlCmd) {
  const result = {
    url: '',
   method: 'GET',
   headers: {},
    body: ''
  };
  
  // Extract URL
  const urlMatch = curlCmd.match(/curl\s+['"]([^'"]+)['"]/);
  if (urlMatch) {
    result.url = urlMatch[1];
  }
  
  // Extract method
  const methodMatch = curlCmd.match(/-X\s+(\w+)/);
  if (methodMatch) {
    result.method = methodMatch[1];
  } else if (curlCmd.includes('--data') || curlCmd.includes('--data-raw')) {
    result.method = 'POST';
  }
  
  // Extract headers
  const headerMatches = curlCmd.matchAll(/-H\s+['"]([^:]+):\s*([^'"]+)['"]/g);
  for (const match of headerMatches) {
    result.headers[match[1].trim()] = match[2].trim();
  }
  
  // Extract body
  const bodyMatch = curlCmd.match(/--data-raw?\s+['"](.*)['"]/);
  if (bodyMatch) {
    result.body = bodyMatch[1];
  }
  
  return result;
}

// Parse fetch call
function parseFetchCall(fetchCall) {
  try {
    // Try to extract URL and options from fetch syntax
   const urlMatch = fetchCall.match(/fetch\(['"]([^'"]+)['"]/);
   const url = urlMatch ? urlMatch[1] : '';
    
    // This is simplified - you'd need more complex parsing for full fetch
   console.log('⚠️  Fetch format detected (basic parsing only)');
    
    return {
      url: url,
     method: 'POST',
     headers: {},
      body: ''
    };
  } catch(error) {
   console.log('❌ Could not parse fetch call');
    return null;
  }
}

// Detect format and parse
let parsedRequest = null;

if (capturedContent.includes('curl')) {
  console.log('📡 Detected cURL format');
  parsedRequest = parseCurlCommand(capturedContent);
} else if (capturedContent.includes('fetch(')) {
  console.log('📡 Detected fetch format');
  parsedRequest = parseFetchCall(capturedContent);
} else {
  console.log('⚠️  Unknown format - please use cURL or fetch format');
  process.exit(1);
}

if (!parsedRequest) {
  console.log('❌ Failed to parse request');
  process.exit(1);
}

console.log('\n📊 Parsed Request Details:\n');
console.log(`URL: ${parsedRequest.url}`);
console.log(`Method: ${parsedRequest.method}`);
console.log(`Headers Count: ${Object.keys(parsedRequest.headers).length}`);
console.log(`Body Length: ${parsedRequest.body.length} chars`);

console.log('\n📋 Headers Found:');
Object.entries(parsedRequest.headers).forEach(([key, value]) => {
  const preview = value.length > 50 ? value.substring(0, 50) + '...' : value;
  console.log(`  • ${key}: ${preview}`);
});

// Check for critical Next.js headers
const hasNextAction= Object.keys(parsedRequest.headers).some(h => h.toLowerCase().includes('next-action'));
const hasNextRouterState = Object.keys(parsedRequest.headers).some(h => h.toLowerCase().includes('next-router-state'));

console.log('\n🔍 Critical Headers Analysis:');
console.log(`  Next-Action present: ${hasNextAction ? '✅' : '❌'}`);
console.log(`  Next-Router-State-Tree present: ${hasNextRouterState ? '✅' : '❌'}`);

if (!hasNextAction || !hasNextRouterState) {
  console.log('\n⚠️  WARNING: Missing critical Next.js headers!');
  console.log('This might be a generic request, not the actual chat API call.');
  console.log('Please make sure you captured the RIGHT request after sending a message.');
}

// Save parsed configuration
const config = {
  url: parsedRequest.url,
  method: parsedRequest.method,
  headers: parsedRequest.headers,
  body: parsedRequest.body,
  timestamp: new Date().toISOString()
};

fs.writeFileSync('api_config.json', JSON.stringify(config, null, 2));
console.log('\n✅ Saved API configuration to api_config.json');

// Now test the API
console.log('\n' + '='.repeat(60));
console.log('\n🧪 Testing the API...\n');

async function testAPI() {
  try {
   console.log('Making test request...');
    
   const response = await fetch(parsedRequest.url, {
     method: parsedRequest.method,
     headers: parsedRequest.headers,
      body: parsedRequest.body || undefined
    });
    
   console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);
   console.log(`Content-Type: ${response.headers.get('content-type')}`);
    
   const responseBody = await response.text();
    
    if (response.ok) {
     console.log('\n✅ SUCCESS! API is working!\n');
     console.log('📝 Response Preview:');
     console.log('-'.repeat(60));
     console.log(responseBody.substring(0, 1000));
     console.log('-'.repeat(60));
      
      // Save full response
      fs.writeFileSync('test_response.txt', responseBody);
     console.log('\n✅ Full response saved to test_response.txt');
      
      // Analyze response format
     console.log('\n🔍 Response Analysis:');
      if (responseBody.includes('gemini') || responseBody.includes('Gemini')) {
       console.log('  ✓ Contains Gemini references');
      }
      if (responseBody.includes('groq') || responseBody.includes('Groq')) {
       console.log('  ✓ Contains Groq references');
      }
      if (responseBody.startsWith('0:') || responseBody.includes('"f":"')) {
       console.log('  ✓ React Server Component format detected');
      }
      
    } else {
     console.log('\n❌ Request failed but reached server');
     console.log('Response:', responseBody.substring(0, 500));
    }
    
  } catch(error) {
   console.log(`\n❌ Test failed: ${error.message}`);
   console.log('\nPossible issues:');
   console.log('  • Expired tokens/action IDs (common with Next.js)');
   console.log('  • Missing cookies or session data');
   console.log('  • CORS or origin restrictions');
   console.log('  • Dynamic headers that change per request');
  }
}

testAPI().then(() => {
  console.log('\n' + '='.repeat(60));
  console.log('\n💡 Next Steps:');
  console.log('1. Check api_config.json for parsed configuration');
  console.log('2. Check test_response.txt for API response');
  console.log('3. Run "node terminal_client.js" to start chatting (if API works)');
  console.log('\n' + '='.repeat(60));
});
