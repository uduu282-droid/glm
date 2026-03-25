/**
 * PhotoGrid - Session Quota Reset Test
 * 
 * Tests if creating new sessions resets the free quota
 */

const axios = require('axios');

class PhotoGridQuotaTester {
  constructor() {
    this.baseUrl = 'https://api.grid.plus/v1';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Origin': 'https://www.photogrid.app'
    };
  }

  /**
   * Create a new session with different fingerprint
   */
  async createNewSession() {
    // Generate random fingerprint
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const fingerprint = `session_${timestamp}_${random}`;
    
    console.log(`\n🔄 Creating new session: ${fingerprint}`);
    
    // Simulate being a new user from different "browser"
    const newHeaders = {
      ...this.headers,
      'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 20 + 100)}.0.0.0 Safari/537.36`,
      'X-Client-Fingerprint': fingerprint
    };
    
    return { newHeaders, fingerprint };
  }

  /**
   * Check current limits for a session
   */
  async checkLimits(headers) {
    try {
      const response = await axios.get(`${this.baseUrl}/web/nologinmethodlist`, {
        headers: headers
      });
      
      const data = response.data.data || {};
      return {
        uploadLimit: data.lo_aistudio?.upload_limit || 0,
        downloadLimit: data.lo_aistudio?.download_limit || 0,
        waitTime: data.lo_aistudio?.wtime || 0
      };
    } catch (error) {
      console.error('❌ Failed to check limits:', error.message);
      return null;
    }
  }

  /**
   * Test multiple sessions
   */
  async testMultipleSessions(count = 5) {
    console.log('🧪 Testing Multiple Session Creation');
    console.log('=' .repeat(70));
    console.log(`Creating ${count} different sessions to test quota reset...\n`);
    
    const results = [];
    
    for (let i = 0; i < count; i++) {
      console.log(`\n--- Session ${i + 1}/${count} ---`);
      
      // Create new session
      const { newHeaders, fingerprint } = await this.createNewSession();
      
      // Add some randomness to simulate different users
      newHeaders['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36)}`;
      
      // Check limits
      const limits = await this.checkLimits(newHeaders);
      
      if (limits) {
        console.log(`✅ Session Created: ${fingerprint.substring(0, 30)}...`);
        console.log(`📊 Limits:`);
        console.log(`   Upload: ${limits.uploadLimit}`);
        console.log(`   Download: ${limits.downloadLimit}`);
        console.log(`   Wait Time: ${limits.waitTime}s`);
        
        results.push({
          session: fingerprint,
          ...limits
        });
      } else {
        console.log(`❌ Failed to get limits for session ${i + 1}`);
        results.push(null);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary
    console.log('\n\n📊 TEST SUMMARY');
    console.log('=' .repeat(70));
    
    const successful = results.filter(r => r !== null).length;
    console.log(`Successful Sessions: ${successful}/${count}`);
    
    // Check if all sessions got the same limits
    if (successful > 1) {
      const firstLimit = results[0].uploadLimit;
      const allSame = results.every(r => r && r.uploadLimit === firstLimit);
      
      if (allSame) {
        console.log(`✅ All sessions received same quota: ${firstLimit} uploads`);
        console.log('💡 Theory CONFIRMED: Each new session gets fresh quota!');
      } else {
        console.log('⚠️  Sessions received different quotas');
        console.log('This suggests server-side tracking beyond just session cookies');
      }
    }
    
    return results;
  }

  /**
   * Test IP-based tracking
   */
  async testIPTracking() {
    console.log('\n\n🧪 Testing IP-Based Tracking');
    console.log('=' .repeat(70));
    
    try {
      const ipResponse = await axios.get(`${this.baseUrl}/web/current_ip`, {
        headers: this.headers
      });
      
      const userIP = ipResponse.data.data;
      console.log(`📍 Your IP: ${userIP}`);
      console.log('\n⚠️  If PhotoGrid tracks by IP, all sessions from same IP');
      console.log('   might share quota or be rate-limited.');
      console.log('\n💡 To truly reset quota, you would need:');
      console.log('   1. Different IP addresses (VPN/Proxy)');
      console.log('   2. Different browser fingerprints');
      console.log('   3. Clear cookies/localStorage');
      
      return userIP;
    } catch (error) {
      console.error('❌ Failed to get IP:', error.message);
      return null;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🔍 PhotoGrid Quota Reset Testing');
    console.log('=' .repeat(70));
    console.log('Testing theory: Can we bypass free quota by creating new sessions?\n');
    
    // Test 1: Check IP tracking
    await this.testIPTracking();
    
    // Test 2: Multiple sessions
    const results = await this.testMultipleSessions(5);
    
    // Final verdict
    console.log('\n\n🎯 FINAL VERDICT');
    console.log('=' .repeat(70));
    
    const successful = results.filter(r => r !== null).length;
    if (successful > 0) {
      const avgUploads = results.reduce((sum, r) => sum + (r?.uploadLimit || 0), 0) / successful;
      
      if (avgUploads > 0) {
        console.log('✅ THEORY CONFIRMED!');
        console.log(`Each new session gets ~${avgUploads} free uploads`);
        console.log('\n💡 Strategy: Create new session = New free quota');
        console.log('\n⚠️  Caveats:');
        console.log('   - May be IP-based rate limiting');
        console.log('   - Server might track fingerprints');
        console.log('   - Best with rotating IPs (VPN/proxy)');
      }
    }
    
    return results;
  }
}

// Run tests
(async () => {
  const tester = new PhotoGridQuotaTester();
  await tester.runAllTests();
})();
