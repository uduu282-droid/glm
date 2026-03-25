/**
 * ImgUpscaler AI Photo Editor - API Discovery
 * This script helps find the actual API endpoints for AI photo editing
 */

import axios from 'axios';
import FormData from 'form-data';

const BASE_URL = 'https://api.imgupscaler.ai';

// Common API patterns to try
const ENDPOINTS_TO_TRY = [
  // Generation endpoints
  { method: 'POST', path: '/api/v1/generations', desc: 'Standard generation' },
  { method: 'POST', path: '/api/common/generate/image', desc: 'Common generate' },
  { method: 'POST', path: '/api/ai/generate', desc: 'AI generate' },
  { method: 'POST', path: '/api/ai/photo-editor', desc: 'Photo editor' },
  { method: 'POST', path: '/api/ai/edit-image', desc: 'Edit image' },
  
  // Edit endpoints
  { method: 'POST', path: '/api/v1/edits', desc: 'Standard edit' },
  { method: 'POST', path: '/api/common/edit/image', desc: 'Common edit' },
  { method: 'POST', path: '/api/ai/inpaint', desc: 'Inpaint' },
  { method: 'POST', path: '/api/ai/remove-object', desc: 'Remove object' },
  { method: 'POST', path: '/api/ai/replace-background', desc: 'Replace background' },
  
  // Enhancement endpoints
  { method: 'POST', path: '/api/v1/enhance', desc: 'Enhance' },
  { method: 'POST', path: '/api/ai/enhance-image', desc: 'Enhance image' },
  { method: 'POST', path: '/api/ai/upscale', desc: 'Upscale' },
  { method: 'POST', path: '/api/ai/restoration', desc: 'Restoration' },
];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://imgupscaler.ai',
  'Referer': 'https://imgupscaler.ai/',
  'Accept': '*/*',
};

async function testEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint.path}`;
  
  try {
    const payload = {
      prompt: 'test',
      model: 'test'
    };
    
    const response = await axios({
      method: endpoint.method,
      url,
      data: payload,
      headers: HEADERS,
      timeout: 5000
    });
    
    console.log(`\n✅ FOUND: ${endpoint.desc}`);
    console.log(`   URL: ${url}`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(response.data).substring(0, 200));
    
    return true;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      
      // 404 means endpoint doesn't exist
      if (status === 404) {
        return false;
      }
      
      // Other errors might mean endpoint exists but needs auth/params
      if ([400, 401, 403, 422].includes(status)) {
        console.log(`\n⚠️  POSSIBLE: ${endpoint.desc}`);
        console.log(`   URL: ${url}`);
        console.log(`   Status: ${status} (exists but needs proper params)`);
        return 'maybe';
      }
    }
    
    return false;
  }
}

async function discoverAPI() {
  console.log('🔍 ImgUpscaler AI Photo Editor - API Discovery');
  console.log('=' .repeat(70));
  console.log(`\nTesting ${ENDPOINTS_TO_TRY.length} potential endpoints...\n`);
  
  const found = [];
  const maybe = [];
  
  for (const endpoint of ENDPOINTS_TO_TRY) {
    process.stdout.write(`Testing: ${endpoint.desc.padEnd(30)} `);
    const result = await testEndpoint(endpoint);
    
    if (result === true) {
      found.push(endpoint);
    } else if (result === 'maybe') {
      maybe.push(endpoint);
    }
  }
  
  console.log('\n' + '=' .repeat(70));
  console.log('\n📊 Results Summary:');
  console.log(`✅ Found: ${found.length}`);
  console.log(`⚠️  Possible: ${maybe.length}`);
  console.log(`❌ Not found: ${ENDPOINTS_TO_TRY.length - found.length - maybe.length}`);
  
  if (found.length > 0) {
    console.log('\n🎉 Discovered Endpoints:');
    found.forEach(ep => {
      console.log(`   - ${BASE_URL}${ep.path}`);
    });
  }
  
  if (maybe.length > 0) {
    console.log('\n🤔 Potential Endpoints (need investigation):');
    maybe.forEach(ep => {
      console.log(`   - ${BASE_URL}${ep.path}`);
    });
  }
}

// Also check website JavaScript files for API clues
async function scanWebsiteJS() {
  console.log('\n\n🔍 Scanning Website JavaScript Files...\n');
  
  const JS_FILES = [
    'https://imgupscaler.ai/js/app.js',
    'https://imgupscaler.ai/js/main.js',
    'https://imgupscaler.ai/js/index.js'
  ];
  
  for (const jsUrl of JS_FILES) {
    try {
      const response = await axios.get(jsUrl, { timeout: 5000 });
      const content = response.data;
      
      // Look for API URLs
      const apiMatches = content.match(/https:\/\/api\.imgupscaler\.ai[^\s"']+/g);
      if (apiMatches) {
        console.log(`\n📄 Found in ${jsUrl}:`);
        const unique = [...new Set(apiMatches)];
        unique.forEach(match => {
          console.log(`   ${match}`);
        });
      }
    } catch (error) {
      // File might not exist
    }
  }
}

async function main() {
  await discoverAPI();
  await scanWebsiteJS();
  
  console.log('\n\n💡 Next Steps:');
  console.log('1. Open browser DevTools (F12)');
  console.log('2. Go to Network tab');
  console.log('3. Visit https://imgupscaler.ai/ai-photo-editor/');
  console.log('4. Try generating an image');
  console.log('5. Look for API requests to api.imgupscaler.ai');
}

main().catch(console.error);
