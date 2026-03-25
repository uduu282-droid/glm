/**
 * Test PhotoGrid Watermark Remover
 * Tests the watermark removal capability through the worker
 */

const axios = require('axios');

// Worker URL
const WORKER_URL = 'https://photogrid-proxy.llamai.workers.dev';

async function testWatermarkRemover() {
  console.log('🧪 Testing PhotoGrid Watermark Remover\n');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Check worker health
    console.log('\n📊 Step 1: Checking Worker Health...\n');
    const healthResponse = await axios.get(`${WORKER_URL}/health`);
    console.log('✅ Worker Status:', healthResponse.data);
    
    // Step 2: Check current quota
    console.log('\n📊 Step 2: Checking Current Quota...\n');
    const quotaResponse = await axios.get(`${WORKER_URL}/quota`);
    console.log('✅ Quota Status:', quotaResponse.data);
    
    // Step 3: Get AI categories (to verify API access)
    console.log('\n📊 Step 3: Verifying API Access (Getting Categories)...\n');
    const categoriesResponse = await axios.get(`${WORKER_URL}/categories`);
    const categories = categoriesResponse.data.data || [];
    console.log(`✅ Found ${categories.length} AI Categories:`);
    categories.forEach((cat, i) => {
      console.log(`   ${i + 1}. ${cat.name || cat.title || 'Unknown'}`);
    });
    
    // Step 4: Reset session to get fresh quota
    console.log('\n📊 Step 4: Resetting Session for Fresh Quota...\n');
    const resetResponse = await axios.get(`${WORKER_URL}/reset`);
    console.log('✅ Session Reset:', resetResponse.data);
    
    // Step 5: Test watermark removal endpoint
    console.log('\n📊 Step 5: Testing Watermark Removal Endpoint...\n');
    
    // Note: We need to discover the actual watermark removal endpoint
    // This will test if we can access the API
    console.log('ℹ️  Testing basic API endpoint access...\n');
    
    const testEndpoint = `${WORKER_URL}/api/web/nologinmethodlist`;
    const testResponse = await axios.get(testEndpoint);
    
    console.log('✅ API Response:', testResponse.status);
    console.log('Response Data:', JSON.stringify(testResponse.data, null, 2));
    
    // Step 6: Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📋 TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log('✅ Worker is online and responding');
    console.log('✅ Session management working');
    console.log('✅ API access confirmed');
    console.log('✅ Quota system functional');
    console.log('\n⚠️  Note: Actual watermark removal requires:');
    console.log('   1. Image upload endpoint (needs to be captured from live site)');
    console.log('   2. Processing endpoint path');
    console.log('   3. Download mechanism');
    console.log('\n💡 Next Steps:');
    console.log('   - Capture network traffic while using photogrid.app');
    console.log('   - Identify the exact upload/processing endpoints');
    console.log('   - Add those endpoints to the worker routing');
    console.log('=' .repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testWatermarkRemover();
