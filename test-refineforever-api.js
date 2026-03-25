/**
 * RefineForever API - Endpoint Tester
 * 
 * Tests the discovered API endpoints to verify functionality
 * and document actual request/response formats.
 * 
 * Usage: node test-refineforever-api.js
 */

const axios = require('axios');
const fs = require('fs');

class RefineForeverTester {
  constructor() {
    this.baseUrl = 'https://refineforever.com';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Content-Type': 'application/json'
    };
  }

  async testToolsConfig() {
    console.log('\n🧪 Test 1: Tools Configuration Endpoint');
    console.log('=' .repeat(70));
    
    try {
      const response = await axios.get(`${this.baseUrl}/tools.json`, {
        headers: { 'Accept': '*/*' }
      });
      
      console.log('✅ Status:', response.status);
      console.log('📊 Tools Count:', Array.isArray(response.data) ? response.data.length : 'N/A');
      
      // Find advanced_edit_image tool
      if (Array.isArray(response.data)) {
        const tool = response.data.find(t => t.id === 'advanced_edit_image');
        if (tool) {
          console.log('\n🎯 Advanced Edit Image Tool Found:');
          console.log('   Name:', tool.name);
          console.log('   Author:', tool.author);
          console.log('   Model: Qwen-Image-Edit-2509 (inferred)');
          console.log('   Default CFG:', tool.defaultCfg);
        } else {
          console.log('⚠️  advanced_edit_image tool not found in config');
        }
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      console.log('❌ Error:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
      }
      return { success: false, error: error.message };
    }
  }

  async testAsyncEndpoint() {
    console.log('\n\n🧪 Test 2: Submit Edit Request (/edit/async)');
    console.log('=' .repeat(70));
    
    // Create a minimal test payload
    const testPayload = {
      tool_id: 'advanced_edit_image',
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // 1x1 transparent PNG
      edit_instruction: 'Test edit',
      preservation_constraints: '',
      detail_level: 'standard',
      cfg_scale: 1.0
    };
    
    console.log('\n📤 Sending test request...');
    console.log('Payload:', JSON.stringify(testPayload, null, 2).substring(0, 200));
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/edit/async`,
        testPayload,
        { headers: this.headers }
      );
      
      console.log('✅ Status:', response.status);
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success && response.data.request_id) {
        console.log('\n✅ Request submitted successfully!');
        console.log('📝 Request ID:', response.data.request_id);
        console.log('🔄 Initial Status:', response.data.status);
        return { success: true, requestId: response.data.request_id, data: response.data };
      } else {
        console.log('\n⚠️  Unexpected response format');
        return { success: false, data: response.data };
      }
      
    } catch (error) {
      console.log('❌ Error:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Response:', JSON.stringify(error.response.data, null, 2).substring(0, 300));
      }
      return { success: false, error: error.message };
    }
  }

  async testCheckStatus(requestId) {
    console.log('\n\n🧪 Test 3: Check Status Endpoint (/edit/check/{id})');
    console.log('=' .repeat(70));
    
    if (!requestId) {
      console.log('⚠️  No request ID provided, skipping test');
      return { success: false, error: 'No request ID' };
    }
    
    console.log(`\n📡 Checking status for: ${requestId}`);
    
    try {
      const response = await axios.get(
        `${this.baseUrl}/edit/check/${requestId}`,
        { headers: this.headers }
      );
      
      console.log('✅ Status:', response.status);
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
      
      return { success: true, data: response.data };
    } catch (error) {
      console.log('❌ Error:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Response:', JSON.stringify(error.response.data, null, 2).substring(0, 300));
      }
      return { success: false, error: error.message };
    }
  }

  async testGetResult(requestId) {
    console.log('\n\n🧪 Test 4: Get Result Endpoint (/edit/result/{id})');
    console.log('=' .repeat(70));
    
    if (!requestId) {
      console.log('⚠️  No request ID provided, skipping test');
      return { success: false, error: 'No request ID' };
    }
    
    console.log(`\n📥 Fetching result for: ${requestId}`);
    
    try {
      const response = await axios.get(
        `${this.baseUrl}/edit/result/${requestId}`,
        { headers: this.headers }
      );
      
      console.log('✅ Status:', response.status);
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.result_images && response.data.result_images.length > 0) {
        console.log('\n✅ Result images found!');
        response.data.result_images.forEach((img, i) => {
          console.log(`   [${i}] ${img}`);
        });
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      console.log('❌ Error:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Response:', JSON.stringify(error.response.data, null, 2).substring(0, 300));
      }
      return { success: false, error: error.message };
    }
  }

  async runAllTests() {
    console.log('🔍 RefineForever API - Comprehensive Endpoint Testing');
    console.log('=' .repeat(70));
    console.log(`Base URL: ${this.baseUrl}`);
    console.log(`Test Time: ${new Date().toISOString()}`);
    
    const results = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      tests: []
    };
    
    // Test 1: Tools config
    const toolsResult = await this.testToolsConfig();
    results.tests.push({ name: 'tools_config', result: toolsResult });
    
    // Test 2: Submit edit
    const submitResult = await this.testAsyncEndpoint();
    results.tests.push({ name: 'submit_edit', result: submitResult });
    
    let requestId = submitResult.requestId;
    
    // Test 3: Check status (if we have a request ID)
    if (requestId) {
      const statusResult = await this.testCheckStatus(requestId);
      results.tests.push({ name: 'check_status', result: statusResult });
      
      // Wait a bit before fetching result
      console.log('\n⏳ Waiting 3 seconds before result fetch...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Test 4: Get result
      const resultResult = await this.testGetResult(requestId);
      results.tests.push({ name: 'get_result', result: resultResult });
    }
    
    // Save results
    const filename = `REFINEFOREVER_TEST_RESULTS_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    
    console.log('\n\n📊 TEST SUMMARY');
    console.log('=' .repeat(70));
    console.log(`Total Tests: ${results.tests.length}`);
    console.log(`Successful: ${results.tests.filter(t => t.result.success).length}`);
    console.log(`Failed: ${results.tests.filter(t => !t.result.success).length}`);
    console.log(`\n💾 Results saved to: ${filename}`);
    
    return results;
  }
}

// Run all tests
(async () => {
  const tester = new RefineForeverTester();
  await tester.runAllTests();
})();
