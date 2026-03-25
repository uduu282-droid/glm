/**
 * Debug script to test Raphael API with different payload variations
 */

const axios = require('axios');
const fs = require('fs');

async function testPayloads() {
  const imagePath = './direct-pollinations-test.jpg';
  const imageBuffer = fs.readFileSync(imagePath);
  const base64 = imageBuffer.toString('base64');
  
  const baseUrl = 'https://raphael.app/api/ai-image-editor';
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Content-Type': 'application/json'
  };
  
  // Test 1: Minimal payload
  console.log('Test 1: Minimal required fields only');
  try {
    const response1 = await axios.post(baseUrl, {
      input_image_base64: base64,
      input_image_mime_type: 'image/webp',
      input_image_extension: 'webp',
      width: 480,
      height: 480,
      mode: 'standard',
      client_request_id: require('crypto').randomUUID()
    }, { headers });
    
    console.log('✅ Success with minimal payload!');
    console.log(response1.data);
  } catch (error) {
    console.log('❌ Failed:', error.response?.status);
    console.log('Response:', JSON.stringify(error.response?.data));
  }
  
  // Test 2: With prompt field
  console.log('\n\nTest 2: With prompt field');
  try {
    const response2 = await axios.post(baseUrl, {
      input_image_base64: base64,
      input_image_mime_type: 'image/webp',
      input_image_extension: 'webp',
      width: 480,
      height: 480,
      prompt: 'test edit',
      mode: 'standard',
      client_request_id: require('crypto').randomUUID()
    }, { headers });
    
    console.log('✅ Success with prompt!');
    console.log(response2.data);
  } catch (error) {
    console.log('❌ Failed:', error.response?.status);
    console.log('Response:', JSON.stringify(error.response?.data));
  }
  
  // Test 3: All possible fields
  console.log('\n\nTest 3: All possible fields');
  try {
    const response3 = await axios.post(baseUrl, {
      input_image_base64: base64,
      input_image_mime_type: 'image/webp',
      input_image_extension: 'webp',
      width: 480,
      height: 480,
      prompt: 'enhance colors',
      mode: 'standard',
      client_request_id: require('crypto').randomUUID(),
      quality: 1.0,
      steps: 20
    }, { headers });
    
    console.log('✅ Success with all fields!');
    console.log(response3.data);
  } catch (error) {
    console.log('❌ Failed:', error.response?.status);
    console.log('Response:', JSON.stringify(error.response?.data));
  }
}

testPayloads().catch(console.error);
