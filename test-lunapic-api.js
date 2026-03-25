/**
 * Test LunaPic Background Removal API
 * Based on captured network traffic from browser
 * 
 * Workflow:
 * 1. Upload image to editor (POST /editor/)
 * 2. Apply transparency tool with magic wand (POST /editor/?action=do-trans)
 * 3. Download result from working directory
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const tough = require('tough-cookie');

class LunaPicAPI {
  constructor() {
    this.baseUrl = 'https://www2.lunapic.com';
    this.cookieJar = new tough.CookieJar();
  }

  async removeBackground(imagePath, clickX = 50, clickY = 50) {
    console.log('\n🎨 Testing LunaPic Background Removal\n');
    console.log('=' .repeat(60));
    
    try {
      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        throw new Error(`File not found: ${imagePath}`);
      }

      const fileName = path.basename(imagePath);
      console.log(`📤 Uploading image: ${fileName}\n`);

      // Step 1: Load the editor page first to get session
      console.log('📥 Loading editor page...');
      const editorResponse = await axios.get(`${this.baseUrl}/editor/?action=transparent`, {
        headers: this.getHeaders(),
        validateStatus: () => true
      });
      
      // Extract cookies from response
      const cookies = editorResponse.headers['set-cookie'];
      if (cookies) {
        cookies.forEach(cookie => {
          this.cookieJar.setCookieSync(cookie, this.baseUrl);
        });
      }
      console.log('✅ Editor loaded\n');

      // Step 2: Upload image
      console.log('📤 Uploading image to editor...\n');
      const uploadForm = new FormData();
      uploadForm.append('file', fs.createReadStream(imagePath));
      uploadForm.append('action', 'upload');
      
      const uploadResponse = await axios.post(`${this.baseUrl}/editor/`, uploadForm, {
        headers: {
          ...this.getHeaders(),
          ...uploadForm.getHeaders()
        },
        validateStatus: () => true
      });

      // Extract session ID from uploaded image URL
      const htmlContent = uploadResponse.data;
      const sessionIdMatch = htmlContent.match(/icon_id=(\w+)/);
      const sessionId = sessionIdMatch ? sessionIdMatch[1] : null;
      
      console.log('📊 Upload response status:', uploadResponse.status);
      if (sessionId) {
        console.log(`🔑 Session ID: ${sessionId}\n`);
      } else {
        console.log('⚠️  Could not extract session ID\n');
      }

      // Step 3: Apply background removal (magic wand at specified coordinates)
      console.log('✨ Applying background removal...\n');
      const transForm = new FormData();
      transForm.append('action', 'do-trans');
      transForm.append('fuzz', '8');  // Tolerance level
      transForm.append('fill', 'area');
      transForm.append('x', clickX.toString());
      transForm.append('y', clickY.toString());
      transForm.append('redo', '1');
      
      const transResponse = await axios.post(`${this.baseUrl}/editor/?action=do-trans`, transForm, {
        headers: {
          ...this.getHeaders(),
          ...transForm.getHeaders(),
          'referer': `${this.baseUrl}/editor/`
        },
        responseType: 'arraybuffer',
        validateStatus: () => true
      });

      console.log('📊 Transparency response status:', transResponse.status);
      
      // Save result
      const outputPath = path.join(__dirname, `lunapic-result-${Date.now()}.png`);
      fs.writeFileSync(outputPath, transResponse.data);
      
      console.log('\n✨ SUCCESS!\n');
      console.log('=' .repeat(60));
      console.log(`💾 Result saved to: ${outputPath}\n`);
      
      return {
        success: true,
        outputPath
      };

    } catch (error) {
      console.error('\n❌ Error:', error.message);
      
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data length: ${error.response.data.length} bytes`);
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  getHeaders() {
    return {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
      'accept-language': 'en-US,en;q=0.9',
      'sec-ch-ua': '"Not-A.Brand";v="24", "Chromium";v="146"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'origin': 'https://www2.lunapic.com',
      'upgrade-insecure-requests': '1'
    };
  }
}

// Main test function
async function main() {
  console.log('🧪 LunaPic Background Removal Test\n');
  console.log('=' .repeat(60));
  
  const api = new LunaPicAPI();
  
  // Use existing test image
  let testImagePath = path.join(__dirname, 'ashlynn_generated_image.png');
  
  if (!fs.existsSync(testImagePath)) {
    console.log('❌ No test image found!\n');
    console.log('💡 Please place an image file named:');
    console.log('   - ashlynn_generated_image.png');
    console.log('   - or update the script to use your image\n');
    return;
  }
  
  console.log(`✅ Using test image: ${path.basename(testImagePath)}`);
  console.log(`   Size: ${(fs.statSync(testImagePath).size / 1024).toFixed(2)} KB\n`);
  
  // Run test - adjust click coordinates as needed
  // These coordinates should point to the background area you want to remove
  const result = await api.removeBackground(testImagePath, 50, 50);
  
  if (result.success) {
    console.log('✅ TEST PASSED - API is working!\n');
    console.log('💡 Note: LunaPic uses a magic wand tool.');
    console.log('   The click coordinates determine which area becomes transparent.\n');
  } else {
    console.log('❌ TEST FAILED\n');
    console.log('💡 This API might require:');
    console.log('   - Different click coordinates (x, y)');
    console.log('   - Specific image format/size');
    console.log('   - Session cookies from browser\n');
  }
}

// Run test
main().catch(console.error);
