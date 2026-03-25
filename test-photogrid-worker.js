/**
 * Test PhotoGrid Worker Status
 * Checks if the PhotoGrid API endpoints are responding
 */

const axios = require('axios');

const WORKER_URL = 'https://photogrid-proxy.llamai.workers.dev';

async function testPhotoGridWorker() {
  console.log('🔍 Testing PhotoGrid Worker Status...\n');
  console.log('=' .repeat(60));
  
  const tests = [
    { name: 'Health Check', endpoint: '/health' },
    { name: 'Get IP', endpoint: '/ip' },
    { name: 'Categories', endpoint: '/categories' },
    { name: 'Styles', endpoint: '/styles' },
    { name: 'Features', endpoint: '/features' }
  ];
  
  for (const test of tests) {
    try {
      console.log(`\n📋 Testing: ${test.name} (${test.endpoint})`);
      
      const response = await axios.get(`${WORKER_URL}${test.endpoint}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log(`✅ Status: ${response.status}`);
      console.log(`Response:`, JSON.stringify(response.data, null, 2).substring(0, 500));
      
    } catch (error) {
      console.error(`❌ Failed: ${test.name}`);
      console.error(`   Error: ${error.message}`);
      
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Body: ${error.response.data?.toString().substring(0, 200)}`);
      }
    }
  }
  
  // Test background removal with a sample image
  console.log('\n\n' + '=' .repeat(60));
  console.log('🎨 Testing Background Removal...\n');
  
  try {
    const testImageUrl = 'https://picsum.photos/800/600'; // Random image
    
    console.log(`📤 Request: GET /remove-bg?image_url=${testImageUrl}\n`);
    
    const response = await axios.get(`${WORKER_URL}/remove-bg`, {
      params: { image_url: testImageUrl },
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log('✅ Background Removal Response:');
    console.log('=' .repeat(60));
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Background Removal Test FAILED!\n');
    console.error('=' .repeat(60));
    console.error(`Error: ${error.message}`);
    
    if (error.response) {
      console.error(`\nStatus: ${error.response.status}`);
      try {
        const errorData = typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data, null, 2);
        console.error(`Body:`, errorData.substring(0, 1000));
      } catch (e) {
        console.error(`Body (raw):`, error.response.data?.toString().substring(0, 1000));
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('\n⏱️  Request timed out (30s)');
    }
  }
  
  console.log('\n✨ Test complete!\n');
}

// Run test
testPhotoGridWorker().catch(console.error);
