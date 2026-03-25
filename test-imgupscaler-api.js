/**
 * Test ImgUpscaler.ai API
 * Based on captured network traffic
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class ImgUpscalerAPI {
  constructor() {
    this.baseUrl = 'https://api.imgupscaler.ai/api';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://imgupscaler.ai/',
      'authorization': '',
      'product-code': '067003',
      'product-serial': ''
    };
  }

  async uploadImage(imagePath) {
    console.log('\n📤 Step 1: Uploading image...\n');
    
    const fileName = path.basename(imagePath);
    const ext = path.extname(fileName).toLowerCase();
    const uuid = Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
    const objectName = `datarm/common_upload/${new Date().toISOString().split('T')[0]}/input/${uuid}${ext}`;
    
    console.log(`   File: ${fileName}`);
    console.log(`   Object name: ${objectName}\n`);
    
    // Include the ACTUAL file
    const formData = new FormData();
    formData.append('object_name', objectName);
    formData.append('file', fs.createReadStream(imagePath));
    
    try {
      // Step 1: Get signed upload URL
      console.log('   Requesting signed URL...\n');
      
      const signResponse = await axios.post(`${this.baseUrl}/common/upload/sign-object`, formData, {
        headers: {
          ...this.headers,
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      console.log('✅ Got signed URL:', JSON.stringify(signResponse.data, null, 2));
      
      if (signResponse.data.code !== 100000) {
        throw new Error('Failed to get signed URL');
      }
      
      const uploadUrl = signResponse.data.result.url;
      
      // Step 2: Upload image to S3
      const imageBuffer = fs.readFileSync(imagePath);
      
      await axios.put(uploadUrl, imageBuffer, {
        headers: {
          'Content-Type': 'image/png'
        }
      });
      
      console.log('✅ Image uploaded successfully');
      
      return uploadUrl.split('?')[0]; // Return base URL without signature
      
    } catch (error) {
      console.error('❌ Upload failed:', error.message);
      throw error;
    }
  }

  async createEnhanceJob(imageUrl) {
    console.log('\n🎨 Step 2: Creating enhancement job...\n');
    
    const formData = new FormData();
    formData.append('target_pixel', '2.88');
    formData.append('original_image_file', imageUrl);
    formData.append('mode', 'fast');
    
    try {
      const response = await axios.post(`${this.baseUrl}/image-upscaler/v2/enhancer/create-job`, formData, {
        headers: {
          ...this.headers,
          ...formData.getHeaders()
        }
      });
      
      console.log('✅ Job created:', JSON.stringify(response.data, null, 2));
      
      if (response.data.code === 100000 || response.data.code === 300006) {
        return response.data.result.job_id;
      } else {
        throw new Error('Failed to create job');
      }
      
    } catch (error) {
      console.error('❌ Job creation failed:', error.message);
      throw error;
    }
  }

  async checkJobStatus(jobId) {
    console.log(`\n⏳ Step 3: Checking job status (${jobId})...\n`);
    
    try {
      const response = await axios.get(`${this.baseUrl}/image-upscaler/v1/universal_upscale/get-job/${jobId}`, {
        headers: this.headers
      });
      
      console.log('📊 Status response:', JSON.stringify(response.data, null, 2));
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Status check failed:', error.message);
      throw error;
    }
  }

  async pollForResult(jobId, maxAttempts = 30) {
    console.log('\n🔄 Polling for result...\n');
    
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const status = await this.checkJobStatus(jobId);
      
      if (status.code === 100000 && status.result.output_url) {
        console.log('\n✅ Job completed!');
        console.log('📥 Output URLs:', status.result.output_url);
        
        // Download the result
        const outputUrl = Array.isArray(status.result.output_url) 
          ? status.result.output_url[0] 
          : status.result.output_url;
        
        return outputUrl;
      }
      
      console.log(`⏳ Attempt ${i + 1}/${maxAttempts} - Still processing...`);
    }
    
    throw new Error('Timeout waiting for job completion');
  }

  async downloadResult(url, outputPath) {
    console.log('\n💾 Downloading result...\n');
    
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });
    
    fs.writeFileSync(outputPath, response.data);
    console.log(`✅ Saved to: ${outputPath}`);
  }
}

// Main test function
async function main() {
  console.log('🧪 Testing ImgUpscaler.ai API\n');
  console.log('=' .repeat(60));
  
  const api = new ImgUpscalerAPI();
  
  // Use an existing image from the folder
  let testImagePath = path.join(__dirname, 'ashlynn_generated_image.png');
  
  if (!fs.existsSync(testImagePath)) {
    // Fallback to another image
    testImagePath = path.join(__dirname, 'ashlynn_generated_image.png');
  }
  
  if (!fs.existsSync(testImagePath)) {
    console.log('❌ No suitable test image found in folder');
    console.log('💡 Please place a PNG image in the folder named:');
    console.log('   - magic_studio_test.png');
    console.log('   - or ashlynn_generated_image.png\n');
    return;
  }
  
  console.log(`✅ Using test image: ${path.basename(testImagePath)}`);
  console.log(`   Size: ${(fs.statSync(testImagePath).size / 1024).toFixed(2)} KB\n`);
  
  try {
    // Step 1: Upload
    const imageUrl = await api.uploadImage(testImagePath);
    
    // Step 2: Create job
    const jobId = await api.createEnhanceJob(imageUrl);
    
    // Step 3: Poll for result
    const outputUrl = await api.pollForResult(jobId);
    
    // Step 4: Download result
    const outputPath = path.join(__dirname, `upscaler-result-${Date.now()}.png`);
    await api.downloadResult(outputUrl, outputPath);
    
    console.log('\n✨ TEST COMPLETED SUCCESSFULLY!\n');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\n❌ TEST FAILED\n');
    console.error('Error:', error.message);
  }
}

// Run test
main().catch(console.error);
