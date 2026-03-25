/**
 * Test AIConvert.online API
 * Based on captured network traffic from browser
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class AIConvertAPI {
  constructor() {
    this.baseUrl = 'https://pint2.aiarabai.com/api';
  }

  async enhanceImage(imagePath) {
    console.log('\n🎨 Testing AIConvert.online Image Enhancement\n');
    console.log('=' .repeat(60));
    
    try {
      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        throw new Error(`File not found: ${imagePath}`);
      }

      console.log(`📤 Uploading image: ${path.basename(imagePath)}\n`);

      // Step 1: Submit image for enhancement
      const formData = new FormData();
      formData.append('img', fs.createReadStream(imagePath));
      formData.append('version', 'v2');  // Use latest version
      formData.append('scale', '2');     // 2x enhancement
      
      const submitResponse = await axios.post(`${this.baseUrl}/enhancer`, formData, {
        headers: {
          ...formData.getHeaders(),
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
          'accept-language': 'en-US,en;q=0.9',
          'sec-ch-ua': '"Not-A.Brand";v="24", "Chromium";v="146"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'referer': 'https://aiconvert.online/'
        },
        timeout: 30000
      });

      console.log('✅ Image submitted for processing');
      console.log(`   Status: ${submitResponse.status}\n`);
      console.log('📊 Response data:', JSON.stringify(submitResponse.data, null, 2).substring(0, 300));

      // Extract job ID - it should be returned in the response or headers
      let jobId = null;
      
      // Try different sources for job ID
      if (submitResponse.data?.task_id) {
        jobId = submitResponse.data.task_id;
      } else if (submitResponse.data?.job_id) {
        jobId = submitResponse.data.job_id;
      } else if (submitResponse.headers['x-task-id']) {
        jobId = submitResponse.headers['x-task-id'];
      } else if (submitResponse.headers['x-job-id']) {
        jobId = submitResponse.headers['x-job-id'];
      } else {
        // Check the response URL that was actually used
        const responseUrl = submitResponse.config.url;
        console.log(`   Response URL: ${responseUrl}`);
        const match = responseUrl.match(/\/enhancer\/([\w-]+)/);
        if (match) {
          jobId = match[1];
        }
      }
      
      if (!jobId) {
        throw new Error('Could not extract job ID from response. Available data: ' + JSON.stringify(submitResponse.data));
      }

      console.log(`🔍 Job ID: ${jobId}\n`);

      // Step 2: Poll for status
      console.log('⏳ Waiting for processing to complete...\n');
      
      let resultUrl;
      for (let attempt = 1; attempt <= 30; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        
        const statusResponse = await axios.get(`${this.baseUrl}/status/${jobId}`);
        
        if (statusResponse.data.status === 'SUCCESS') {
          console.log('✅ Processing complete!\n');
          resultUrl = `${this.baseUrl}/result/${jobId}`;
          break;
        } else if (statusResponse.data.status === 'FAILED') {
          throw new Error('Processing failed');
        } else {
          console.log(`   Attempt ${attempt}: Status = ${statusResponse.data.status}`);
        }
      }

      if (!resultUrl) {
        throw new Error('Timeout waiting for result');
      }

      // Step 3: Get result
      console.log('📥 Downloading result...\n');
      
      const resultResponse = await axios.get(resultUrl, {
        responseType: 'arraybuffer'
      });

      // Check if response is JSON with base64 or direct image
      const contentType = resultResponse.headers['content-type'];
      let outputPath;
      
      if (contentType.includes('application/json')) {
        // Parse JSON response
        const resultData = JSON.parse(Buffer.from(resultResponse.data).toString());
        
        if (resultData.result_b64) {
          console.log('✅ Received base64 encoded result\n');
          
          // Decode base64
          const base64Data = resultData.result_b64.replace(/^data:image\/\w+;base64,/, '');
          const imageBuffer = Buffer.from(base64Data, 'base64');
          
          // Save result
          outputPath = path.join(__dirname, `aiconvert-result-${Date.now()}.png`);
          fs.writeFileSync(outputPath, imageBuffer);
        }
      } else if (contentType.includes('image')) {
        // Direct image response
        outputPath = path.join(__dirname, `aiconvert-result-${Date.now()}.png`);
        fs.writeFileSync(outputPath, resultResponse.data);
      }

      console.log('✨ SUCCESS!\n');
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
        console.error(`   Data: ${JSON.stringify(error.response.data, null, 2).substring(0, 500)}`);
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
  console.log('🧪 AIConvert.online API Test\n');
  console.log('=' .repeat(60));
  
  const api = new AIConvertAPI();
  
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
  
  // Run test
  const result = await api.enhanceImage(testImagePath);
  
  if (result.success) {
    console.log('✅ TEST PASSED - API is working!\n');
  } else {
    console.log('❌ TEST FAILED\n');
    console.log('💡 This API might require:');
    console.log('   - Different endpoint or parameters');
    console.log('   - Authentication headers');
    console.log('   - Specific image format/size\n');
  }
}

// Run test
main().catch(console.error);
