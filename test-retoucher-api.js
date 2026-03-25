/**
 * Test Retoucher.online Background Removal API
 * Based on captured network traffic analysis
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class RetoucherAPI {
  constructor() {
    this.baseUrl = 'https://api-int.retoucher.online/api/v4';
    this.clientId = `${Math.floor(Math.random() * 1000000000)}.${Date.now()}`;
    console.log(`🆔 Generated clientId: ${this.clientId}\n`);
  }

  async checkLimits() {
    try {
      console.log('📊 Checking user limits...\n');
      
      const response = await axios.get(`${this.baseUrl}/UserInfo`, {
        params: {
          clientId: this.clientId,
          country: 'US',
          timezone: 'GMT-5'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://retoucher.online/',
          'Accept': 'application/json, text/plain, */*'
        }
      });

      console.log('✅ UserInfo Response:');
      console.log(JSON.stringify(response.data, null, 2));
      
      if (response.data.isSuccess && response.data.result) {
        const license = response.data.result.license;
        console.log(`\n📋 License Info:`);
        console.log(`   Type: ${license.currentTariffId}`);
        console.log(`   Available: ${license.availableLimit}`);
        console.log(`   Used: ${license.currentDownloadView}`);
        console.log(`   Viewed: ${license.currentLimitView}\n`);
        return license.availableLimit > 0;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error checking limits:', error.message);
      return false;
    }
  }

  async pollForResult(requestId, maxAttempts = 10) {
    console.log(`\n🔄 Polling for result (requestId: ${requestId})...\n`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        
        console.log(`   Attempt ${attempt}/${maxAttempts}...`);
        
        // Try different possible endpoints
        const endpoints = [
          `${this.baseUrl}/Request/Result?requestId=${requestId}`,
          `${this.baseUrl}/Request/GetResult?requestId=${requestId}`,
          `${this.baseUrl}/Request/Status?requestId=${requestId}`
        ];
        
        for (const endpoint of endpoints) {
          try {
            const response = await axios.get(endpoint, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://retoucher.online/',
                'Accept': 'application/json, text/plain, */*'
              },
              timeout: 5000
            });
            
            console.log(`   ✅ Got response from: ${endpoint}`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Data:`, JSON.stringify(response.data, null, 2).substring(0, 500));
            
            // If we got here, this endpoint worked
            return response.data;
          } catch (error) {
            // Try next endpoint
            continue;
          }
        }
        
        console.log(`   ⏳ No result yet...\n`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
      }
    }
    
    console.log('❌ Max attempts reached. Could not retrieve result.\n');
    return null;
  }

  async removeBackground(imagePath) {
    console.log('🎨 Testing Retoucher.online Background Removal\n');
    console.log('=' .repeat(60));
    
    try {
      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        throw new Error(`File not found: ${imagePath}`);
      }

      // Check limits first
      const hasLimits = await this.checkLimits();
      if (!hasLimits) {
        console.log('⚠️  No available limits. Skipping test.\n');
        return { success: false, error: 'No available limits' };
      }

      // Create form data
      const formData = new FormData();
      formData.append('clientId', this.clientId);
      formData.append('count', '1');
      formData.append('file', fs.createReadStream(imagePath));

      console.log(`📤 Uploading image: ${imagePath}\n`);

      // Send request
      const response = await axios.post(`${this.baseUrl}/Request/Create`, formData, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://retoucher.online/',
          ...formData.getHeaders()
        },
        responseType: 'arraybuffer',
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      console.log('✅ Response received!');
      console.log('=' .repeat(60));
      console.log(`Status: ${response.status}`);
      console.log(`Response size: ${(response.data.length / 1024).toFixed(2)} KB`);
      console.log(`Content-Type: ${response.headers['content-type'] || 'unknown'}`);

      // Check if it's an image or JSON
      const contentType = response.headers['content-type'];
      
      if (contentType && contentType.includes('application/json')) {
        // Parse JSON response
        const jsonResponse = JSON.parse(Buffer.from(response.data).toString());
        console.log('\n📊 JSON Response:', JSON.stringify(jsonResponse, null, 2));
        
        if (jsonResponse.isSuccess) {
          console.log('\n✨ Request successful!');
          
          // Check if we got a requestId (async processing)
          if (jsonResponse.requestId) {
            console.log(`🔍 Got requestId: ${jsonResponse.requestId}`);
            console.log('\n⏳ This appears to be async processing...');
            console.log('💡 Need to poll for result or check documentation\n');
            
            // Try to get result (guessing endpoint patterns)
            await this.pollForResult(jsonResponse.requestId);
          }
          
          if (jsonResponse.result && jsonResponse.result.url) {
            console.log(`🔗 Result URL: ${jsonResponse.result.url}`);
          }
        } else {
          throw new Error(jsonResponse.message || 'API returned error');
        }
      } else if (contentType && contentType.includes('image')) {
        // Save image
        const outputPath = path.join(__dirname, `retoucher-result-${Date.now()}.png`);
        fs.writeFileSync(outputPath, response.data);
        console.log(`\n💾 Image saved to: ${outputPath}`);
        console.log('✨ Background removed successfully!\n');
        
        return {
          success: true,
          outputPath,
          size: response.data.length
        };
      }

      return {
        success: true,
        message: 'Request processed'
      };

    } catch (error) {
      console.error('\n❌ Error during background removal:', error.message);
      
      if (error.response) {
        console.error(`\n   Status: ${error.response.status}`);
        console.error(`   Headers:`, JSON.stringify(error.response.headers, null, 2));
        
        try {
          const errorData = Buffer.from(error.response.data).toString('utf8');
          console.error(`   Body:`, errorData.substring(0, 500));
          
          // Try to parse as JSON
          try {
            const jsonError = JSON.parse(errorData);
            console.error(`   Parsed:`, JSON.stringify(jsonError, null, 2));
          } catch {}
        } catch {}
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Main test function
async function main() {
  console.log('🔍 Retoucher.online API Test\n');
  console.log('=' .repeat(60));
  
  const api = new RetoucherAPI();
  
  // Create a test image if none exists
  const testImagePath = path.join(__dirname, 'test-retoucher.png');
  
  if (!fs.existsSync(testImagePath)) {
    console.log('⚠️  No test image found, creating a simple PNG...');
    // Minimal valid PNG (1x1 red pixel)
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0xF0,
      0x00, 0x00, 0x01, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x00, 0x00,
      0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(testImagePath, pngBuffer);
    console.log('✅ Created test image\n');
  }
  
  // Test the API
  const result = await api.removeBackground(testImagePath);
  
  if (result.success) {
    console.log('✅ Test completed successfully!\n');
  } else {
    console.log('❌ Test failed!\n');
    console.log('💡 This API might require:');
    console.log('   - Session cookies from browser');
    console.log('   - Additional headers');
    console.log('   - Different endpoint or parameters\n');
  }
}

// Run test
main().catch(console.error);
