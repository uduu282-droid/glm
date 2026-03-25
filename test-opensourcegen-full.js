/**
 * OpenSourceGen - Comprehensive Feature Tester
 * 
 * Tests ALL discovered endpoints and features
 */

const axios = require('axios');

class OpenSourceGenTester {
  constructor() {
    this.baseUrl = 'https://opensourcegen.com';
    this.apiKey = null;
    this.fingerprint = null;
    this.authenticated = false;
    this.testResults = [];
  }

  async logTest(name, status, details = '') {
    const result = { name, status, details, timestamp: new Date().toISOString() };
    this.testResults.push(result);
    
    const icon = status === '✅ PASS' ? '✅' : status === '❌ FAIL' ? '❌' : '⚠️ ';
    console.log(`${icon} ${name}: ${status}`);
    if (details) console.log(`   ${details}`);
  }

  /**
   * Test 1: Health Check
   */
  async testHealthCheck() {
    console.log('\n🧪 Test 1: Health Check Endpoint');
    console.log('=' .repeat(70));
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/health`);
      await this.logTest('Health Check', '✅ PASS', `Status: ${response.status}, Response: ${JSON.stringify(response.data).substring(0, 100)}`);
      return true;
    } catch (error) {
      await this.logTest('Health Check', '❌ FAIL', error.message);
      return false;
    }
  }

  /**
   * Test 2: Device Registration
   */
  async testDeviceRegistration() {
    console.log('\n🧪 Test 2: Device Registration');
    console.log('=' .repeat(70));
    
    try {
      this.fingerprint = `test_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      const response = await axios.post(
        `${this.baseUrl}/api/osg-register`,
        { fingerprint: this.fingerprint },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (response.data && (response.data.apiKey || response.data.token)) {
        this.apiKey = response.data.apiKey || response.data.token;
        this.authenticated = true;
        await this.logTest('Device Registration', '✅ PASS', `Received API key: ${this.apiKey?.substring(0, 20)}...`);
        return true;
      } else {
        await this.logTest('Device Registration', '❌ FAIL', 'No API key received in response');
        return false;
      }
    } catch (error) {
      await this.logTest('Device Registration', '❌ FAIL', `${error.message} - ${error.response?.data ? JSON.stringify(error.response.data).substring(0, 100) : ''}`);
      return false;
    }
  }

  /**
   * Test 3: User Account Info
   */
  async testAccountInfo() {
    console.log('\n🧪 Test 3: User Account Information');
    console.log('=' .repeat(70));
    
    if (!this.authenticated) {
      await this.logTest('Account Info', '⚠️ SKIP', 'Not authenticated');
      return false;
    }
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/user/account`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      await this.logTest('Account Info', '✅ PASS', `Account: ${JSON.stringify(response.data).substring(0, 150)}`);
      return true;
    } catch (error) {
      await this.logTest('Account Info', '❌ FAIL', `${error.message} - Status: ${error.response?.status}`);
      return false;
    }
  }

  /**
   * Test 4: Image Generation
   */
  async testImageGeneration() {
    console.log('\n🧪 Test 4: Image Generation');
    console.log('=' .repeat(70));
    
    if (!this.authenticated) {
      await this.logTest('Image Generation', '⚠️ SKIP', 'Not authenticated');
      return false;
    }
    
    const testPrompts = [
      'A simple red circle on white background',
      'Test image generation'
    ];
    
    for (const prompt of testPrompts) {
      console.log(`\nTesting prompt: "${prompt}"`);
      
      try {
        // Try /api/generate endpoint
        const response = await axios.post(
          `${this.baseUrl}/api/generate`,
          {
            prompt: prompt,
            model: 'flux',
            width: 512,
            height: 512
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data && (response.data.imageUrl || response.data.url || response.data.id)) {
          await this.logTest(`Image Generation: "${prompt}"`, '✅ PASS', `Result: ${JSON.stringify(response.data).substring(0, 200)}`);
          return true;
        } else {
          await this.logTest(`Image Generation: "${prompt}"`, '❌ FAIL', 'Unexpected response format');
        }
      } catch (error) {
        console.log(`Failed with /api/generate, trying alternatives...`);
        
        // Try alternative endpoints
        const alternativeEndpoints = [
          '/api/create',
          '/api/image/generate',
          '/api/text2img',
          '/api/v1/generate'
        ];
        
        let success = false;
        for (const endpoint of alternativeEndpoints) {
          try {
            const response = await axios.post(
              `${this.baseUrl}${endpoint}`,
              {
                prompt: prompt,
                model: 'flux',
                width: 512,
                height: 512
              },
              {
                headers: {
                  'Authorization': `Bearer ${this.apiKey}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (response.data && (response.data.imageUrl || response.data.url || response.data.id)) {
              await this.logTest(`Image Generation (${endpoint}): "${prompt}"`, '✅ PASS', `Result found!`);
              success = true;
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        if (!success) {
          await this.logTest(`Image Generation: "${prompt}"`, '❌ FAIL', `${error.message} - Status: ${error.response?.status}`);
        }
      }
    }
    
    return false;
  }

  /**
   * Test 5: List User Media
   */
  async testListMedia() {
    console.log('\n🧪 Test 5: List User Media');
    console.log('=' .repeat(70));
    
    if (!this.authenticated) {
      await this.logTest('List Media', '⚠️ SKIP', 'Not authenticated');
      return false;
    }
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/user/media?page=1&limit=10`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      await this.logTest('List Media', '✅ PASS', `Found ${response.data?.length || 0} items`);
      return true;
    } catch (error) {
      await this.logTest('List Media', '❌ FAIL', `${error.message} - Status: ${error.response?.status}`);
      return false;
    }
  }

  /**
   * Test 6: Download Media
   */
  async testDownloadMedia() {
    console.log('\n🧪 Test 6: Download Media');
    console.log('=' .repeat(70));
    
    if (!this.authenticated) {
      await this.logTest('Download Media', '⚠️ SKIP', 'Not authenticated');
      return false;
    }
    
    // Test with a sample URL (we'd need a real URL from the platform)
    const testUrl = 'https://opensourcegen.com/images/test.png';
    
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/user/media/download?url=${encodeURIComponent(testUrl)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );
      
      await this.logTest('Download Media', '✅ PASS', `Downloaded ${response.data.length} bytes`);
      return true;
    } catch (error) {
      await this.logTest('Download Media', '❌ FAIL', `${error.message} - Note: Requires valid image URL`);
      return false;
    }
  }

  /**
   * Test 7: Subscription/Credits Check
   */
  async testSubscriptionInfo() {
    console.log('\n🧪 Test 7: Subscription & Credits');
    console.log('=' .repeat(70));
    
    if (!this.authenticated) {
      await this.logTest('Subscription Info', '⚠️ SKIP', 'Not authenticated');
      return false;
    }
    
    try {
      // This might be part of account info or a separate endpoint
      const accountResponse = await axios.get(`${this.baseUrl}/api/user/account`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const accountData = accountResponse.data;
      const hasSubscription = accountData.subscription || accountData.plan || accountData.tier;
      const hasCredits = accountData.credits || accountData.creditsRemaining || accountData.generationsRemaining;
      
      if (hasSubscription || hasCredits) {
        await this.logTest('Subscription Info', '✅ PASS', `Sub: ${hasSubscription || 'N/A'}, Credits: ${hasCredits || 'Unlimited'}`);
        return true;
      } else {
        await this.logTest('Subscription Info', '⚠️ INFO', 'No subscription/credits info in account data');
        return true;
      }
    } catch (error) {
      await this.logTest('Subscription Info', '❌ FAIL', error.message);
      return false;
    }
  }

  /**
   * Run All Tests
   */
  async runAllTests() {
    console.log('🔍 OpenSourceGen - Comprehensive Feature Testing');
    console.log('=' .repeat(70));
    console.log(`Start Time: ${new Date().toISOString()}\n`);
    
    // Run tests in sequence
    await this.testHealthCheck();
    const registered = await this.testDeviceRegistration();
    
    if (registered) {
      await this.testAccountInfo();
      await this.testImageGeneration();
      await this.testListMedia();
      await this.testDownloadMedia();
      await this.testSubscriptionInfo();
    } else {
      console.log('\n⚠️  Skipping remaining tests due to registration failure');
    }
    
    // Summary
    console.log('\n\n📊 TEST SUMMARY');
    console.log('=' .repeat(70));
    
    const passed = this.testResults.filter(t => t.status.includes('PASS')).length;
    const failed = this.testResults.filter(t => t.status.includes('FAIL')).length;
    const skipped = this.testResults.filter(t => t.status.includes('SKIP')).length;
    const info = this.testResults.filter(t => t.status.includes('INFO')).length;
    
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Skipped: ${skipped}`);
    console.log(`ℹ️  Info Only: ${info}`);
    
    console.log('\n📋 Detailed Results:');
    this.testResults.forEach((test, i) => {
      console.log(`${i + 1}. ${test.name}: ${test.status}`);
    });
    
    // Save results
    const fs = require('fs');
    const filename = `OPENSOURCEGEN_TEST_RESULTS_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(filename, JSON.stringify({
      testTime: new Date().toISOString(),
      totalTests: this.testResults.length,
      passed,
      failed,
      skipped,
      results: this.testResults
    }, null, 2));
    
    console.log(`\n💾 Results saved to: ${filename}`);
    
    return { passed, failed, skipped, total: this.testResults.length };
  }
}

// Run all tests
(async () => {
  const tester = new OpenSourceGenTester();
  const results = await tester.runAllTests();
  
  console.log('\n\n🎯 FINAL VERDICT');
  console.log('=' .repeat(70));
  
  if (results.passed > 0 && results.failed === 0) {
    console.log('✅ ALL TESTS PASSED! OpenSourceGen is fully functional.');
  } else if (results.passed > results.failed) {
    console.log('⚠️  MOSTLY WORKING - Some features need attention.');
  } else {
    console.log('❌ MAJOR ISSUES - Most features not working.');
  }
})();
