/**
 * Direct API Test - Bypass Worker
 * Test if ImgUpscaler API accepts requests directly
 */

import axios from 'axios';
import FormData from 'form-data';

async function testDirectAPI() {
  console.log('🧪 Testing ImgUpscaler API Directly (No Worker)\n');
  console.log('=' .repeat(70));
  
  try {
    // Test 1: Try initiate upload
    console.log('Test 1: Initiate Upload\n');
    
    const formData = new FormData();
    formData.append('file_name', 'test.png');
    
    const response = await axios.post(
      'https://api.imgupscaler.ai/api/common/upload/upload-image',
      formData,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://imgupscaler.ai',
          'Referer': 'https://imgupscaler.ai/',
          'Accept': '*/*',
          'product-code': '067003',
          'product-serial': ''
        }
      }
    );
    
    console.log('✅ Status:', response.status);
    console.log('Response code:', response.data.code);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.code === 100000) {
      console.log('\n🎉 SUCCESS! API works from your network!\n');
      console.log('Object name:', response.data.result.object_name);
      console.log('OSS URL:', response.data.result.url.substring(0, 80) + '...');
    } else {
      console.log('\n⚠️  API returned non-success code\n');
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    
    if (error.response) {
      console.error('\nResponse status:', error.response.status);
      console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
      
      try {
        const errorData = error.response.data;
        console.error('Response body:', errorData.toString().substring(0, 500));
      } catch (e) {
        console.error('Could not parse response body');
      }
    }
    
    console.log('\n💡 This tells us if ImgUpscaler blocks your IP/network\n');
  }
}

testDirectAPI().catch(console.error);
