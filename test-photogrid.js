/**
 * PhotoGrid Background Remover - API Tester
 * 
 * Tests the discovered API endpoints
 */

const axios = require('axios');

class PhotoGridTester {
  constructor() {
    this.baseUrl = 'https://api.grid.plus/v1';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Origin': 'https://www.photogrid.app'
    };
    
    // Common parameters from the web requests
    this.commonParams = {
      platform: 'h5',
      appid: '808645',
      version: '8.9.7',
      country: 'US',
      locale: 'en'
    };
  }

  async logTest(name, status, details = '') {
    const icon = status === '✅ PASS' ? '✅' : status === '❌ FAIL' ? '❌' : '⚠️ ';
    console.log(`${icon} ${name}: ${status}`);
    if (details) console.log(`   ${details}`);
  }

  /**
   * Test 1: Health Check / Get IP
   */
  async testGetIP() {
    console.log('\n🧪 Test 1: Get Current IP');
    console.log('=' .repeat(70));
    
    try {
      const response = await axios.get(`${this.baseUrl}/web/current_ip`, {
        headers: this.headers
      });
      
      await this.logTest('Get IP', '✅ PASS', JSON.stringify(response.data).substring(0, 150));
      return true;
    } catch (error) {
      await this.logTest('Get IP', '❌ FAIL', `${error.message} - Status: ${error.response?.status}`);
      return false;
    }
  }

  /**
   * Test 2: Get AI Categories
   */
  async testGetCategories() {
    console.log('\n🧪 Test 2: Get AI Categories');
    console.log('=' .repeat(70));
    
    try {
      const params = new URLSearchParams(this.commonParams);
      const response = await axios.get(`${this.baseUrl}/ai/aihug/category/list?${params}`, {
        headers: this.headers
      });
      
      await this.logTest('AI Categories', '✅ PASS', `Found ${response.data?.data?.length || 0} categories`);
      return true;
    } catch (error) {
      await this.logTest('AI Categories', '❌ FAIL', `${error.message} - Status: ${error.response?.status}`);
      return false;
    }
  }

  /**
   * Test 3: Get AI Styles
   */
  async testGetStyles() {
    console.log('\n🧪 Test 3: Get AI Styles');
    console.log('=' .repeat(70));
    
    try {
      const params = new URLSearchParams(this.commonParams);
      const response = await axios.get(`${this.baseUrl}/ai/web/aihug/style_list?${params}`, {
        headers: this.headers
      });
      
      await this.logTest('AI Styles', '✅ PASS', `Found ${response.data?.data?.length || 0} styles`);
      return true;
    } catch (error) {
      await this.logTest('AI Styles', '❌ FAIL', `${error.message} - Status: ${error.response?.status}`);
      return false;
    }
  }

  /**
   * Test 4: Get Payment Info
   */
  async testGetPaymentInfo() {
    console.log('\n🧪 Test 4: Get Payment Information');
    console.log('=' .repeat(70));
    
    try {
      const response = await axios.get(`${this.baseUrl}/pay/web/sub/payment/info`, {
        headers: this.headers
      });
      
      await this.logTest('Payment Info', '✅ PASS', JSON.stringify(response.data).substring(0, 150));
      return true;
    } catch (error) {
      await this.logTest('Payment Info', '❌ FAIL', `${error.message} - Status: ${error.response?.status}`);
      return false;
    }
  }

  /**
   * Test 5: Get BF Info (Background Features?)
   */
  async testGetBFInfo() {
    console.log('\n🧪 Test 5: Get BF Info (Background Features)');
    console.log('=' .repeat(70));
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/web/bfinfo?t=le8bv`,
        {},
        { headers: { ...this.headers, 'Content-Type': 'application/json' } }
      );
      
      await this.logTest('BF Info', '✅ PASS', JSON.stringify(response.data).substring(0, 150));
      return true;
    } catch (error) {
      await this.logTest('BF Info', '❌ FAIL', `${error.message} - Status: ${error.response?.status}`);
      return false;
    }
  }

  /**
   * Test 6: Get No-Login Methods
   */
  async testGetNoLoginMethods() {
    console.log('\n🧪 Test 6: Get No-Login Methods');
    console.log('=' .repeat(70));
    
    try {
      const response = await axios.get(`${this.baseUrl}/web/nologinmethodlist`, {
        headers: this.headers
      });
      
      await this.logTest('No-Login Methods', '✅ PASS', JSON.stringify(response.data).substring(0, 150));
      return true;
    } catch (error) {
      await this.logTest('No-Login Methods', '❌ FAIL', `${error.message} - Status: ${error.response?.status}`);
      return false;
    }
  }

  /**
   * Run All Tests
   */
  async runAllTests() {
    console.log('🔍 PhotoGrid Background Remover - API Testing');
    console.log('=' .repeat(70));
    console.log(`Start Time: ${new Date().toISOString()}\n`);
    
    const results = [];
    
    results.push(await this.testGetIP());
    results.push(await this.testGetCategories());
    results.push(await this.testGetStyles());
    results.push(await this.testGetPaymentInfo());
    results.push(await this.testGetBFInfo());
    results.push(await this.testGetNoLoginMethods());
    
    // Summary
    console.log('\n\n📊 TEST SUMMARY');
    console.log('=' .repeat(70));
    
    const passed = results.filter(r => r).length;
    const failed = results.filter(r => !r).length;
    
    console.log(`Total Tests: ${results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed/results.length)*100).toFixed(1)}%`);
    
    // Save results
    const fs = require('fs');
    const filename = `PHOTOGRID_TEST_RESULTS_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(filename, JSON.stringify({
      testTime: new Date().toISOString(),
      totalTests: results.length,
      passed,
      failed,
      successRate: ((passed/results.length)*100).toFixed(1)
    }, null, 2));
    
    console.log(`\n💾 Results saved to: ${filename}`);
    
    return { passed, failed, total: results.length };
  }
}

// Run all tests
(async () => {
  const tester = new PhotoGridTester();
  const results = await tester.runAllTests();
  
  console.log('\n\n🎯 FINAL VERDICT');
  console.log('=' .repeat(70));
  
  if (results.passed > 0 && results.failed === 0) {
    console.log('✅ ALL TESTS PASSED! PhotoGrid API is fully accessible.');
  } else if (results.passed > results.failed) {
    console.log('⚠️  MOSTLY WORKING - Some features need attention.');
  } else {
    console.log('❌ MAJOR ISSUES - Most features not working.');
  }
})();
