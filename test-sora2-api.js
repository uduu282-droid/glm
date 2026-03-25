/**
 * Test Sora-2 Video Generation API
 * Tests text-to-video and image-to-video capabilities
 * 
 * API: https://vetrex.site/v1/
 */

const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'https://vetrex.site/v1';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testSora2API() {
  console.log('🧪 Testing Sora-2 Video Generation API\n');
  console.log('=' .repeat(70));
  
  try {
    // ============================================
    // TEST 1: Text-to-Video Generation (16:9)
    // ============================================
    console.log('\n📊 TEST 1: Text-to-Video Generation (Landscape 16:9)\n');
    
    const generatePayload1 = {
      prompt: 'A cinematic shot of a cyberpunk city with neon lights and flying cars',
      model: 'sora-2',
      aspect_ratio: '16:9'
    };
    
    console.log('Creating generation task...');
    console.log('Prompt:', generatePayload1.prompt);
    console.log('Model:', generatePayload1.model);
    console.log('Aspect Ratio:', generatePayload1.aspect_ratio);
    
    let taskId1;
    try {
      const genResponse1 = await axios.post(
        `${BASE_URL}/videos/generations`,
        generatePayload1,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      console.log('\n✅ Task Created Successfully!');
      console.log('Response:', JSON.stringify(genResponse1.data, null, 2));
      taskId1 = genResponse1.data.task_id || genResponse1.data.id;
      
      if (!taskId1) {
        console.log('❌ No task_id in response');
        return;
      }
      
    } catch (error) {
      console.error('\n❌ Generation Failed:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response:', JSON.stringify(error.response.data, null, 2));
      }
      return;
    }
    
    // Wait and check status
    console.log('\n⏳ Waiting for video generation (this may take 2-5 minutes)...');
    let completed = false;
    let videoUrl1;
    
    for (let i = 0; i < 30; i++) {
      await sleep(10000); // Wait 10 seconds
      
      try {
        const statusResponse = await axios.get(`${BASE_URL}/videos/results/${taskId1}`);
        const status = statusResponse.data.status || statusResponse.data;
        
        console.log(`\n📊 Check #${i + 1}: Status = ${status}`);
        
        if (status === 'completed' || status === 'success') {
          console.log('\n✅ Generation Completed!');
          console.log('Full Response:', JSON.stringify(statusResponse.data, null, 2));
          
          videoUrl1 = statusResponse.data.video_url || statusResponse.data.url || statusResponse.data.output_url;
          if (videoUrl1) {
            console.log('\n🎬 Video URL:', videoUrl1);
            completed = true;
            break;
          }
        } else if (status === 'failed' || status === 'error') {
          console.log('\n❌ Generation Failed');
          console.log('Error:', statusResponse.data.error || 'Unknown error');
          break;
        } else if (status === 'processing' || status === 'running') {
          console.log('   Still processing...');
        } else {
          console.log('   Status:', status);
        }
        
      } catch (error) {
        console.error('Error checking status:', error.message);
      }
    }
    
    if (!completed) {
      console.log('\n⚠️  Video generation did not complete within timeout period');
    }
    
    // ============================================
    // TEST 2: Text-to-Video Generation (9:16)
    // ============================================
    console.log('\n\n📊 TEST 2: Text-to-Video Generation (Portrait 9:16)\n');
    
    const generatePayload2 = {
      prompt: 'A beautiful waterfall in a tropical forest, cinematic lighting',
      model: 'sora-2',
      aspect_ratio: '9:16'
    };
    
    console.log('Creating generation task...');
    console.log('Prompt:', generatePayload2.prompt);
    console.log('Aspect Ratio:', generatePayload2.aspect_ratio);
    
    let taskId2;
    try {
      const genResponse2 = await axios.post(
        `${BASE_URL}/videos/generations`,
        generatePayload2,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      console.log('\n✅ Task Created Successfully!');
      taskId2 = genResponse2.data.task_id || genResponse2.data.id;
      
      if (!taskId2) {
        console.log('❌ No task_id in response');
        return;
      }
      
    } catch (error) {
      console.error('\n❌ Generation Failed:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
      }
      return;
    }
    
    // Quick status check (don't wait full duration)
    console.log('\n⏳ Quick status check (waiting 30 seconds)...');
    await sleep(30000);
    
    try {
      const statusResponse2 = await axios.get(`${BASE_URL}/videos/results/${taskId2}`);
      console.log('Status Check:', JSON.stringify(statusResponse2.data, null, 2));
    } catch (error) {
      console.error('Error checking status:', error.message);
    }
    
    // ============================================
    // TEST 3: Image-to-Video (if we have a test image)
    // ============================================
    console.log('\n\n📊 TEST 3: Image-to-Video (Animate Image)\n');
    
    // Use a sample image URL
    const testImageUrl = 'https://picsum.photos/seed/test123/1280/720.jpg';
    
    const editPayload = {
      prompt: 'animate this image slowly with subtle motion',
      model: 'sora-2',
      aspect_ratio: '16:9',
      images: [testImageUrl]
    };
    
    console.log('Creating image animation task...');
    console.log('Image URL:', testImageUrl);
    console.log('Prompt:', editPayload.prompt);
    
    let taskId3;
    try {
      const editResponse = await axios.post(
        `${BASE_URL}/videos/edits`,
        editPayload,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      console.log('\n✅ Animation Task Created Successfully!');
      console.log('Response:', JSON.stringify(editResponse.data, null, 2));
      taskId3 = editResponse.data.task_id || editResponse.data.id;
      
    } catch (error) {
      console.error('\n❌ Animation Failed:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response:', JSON.stringify(error.response.data, null, 2));
      }
      // This is okay - continue with summary
    }
    
    // ============================================
    // FINAL SUMMARY
    // ============================================
    console.log('\n' + '=' .repeat(70));
    console.log('📋 TEST SUMMARY');
    console.log('=' .repeat(70));
    
    console.log('\n✅ TEST 1 (Text-to-Video 16:9):', taskId1 ? 'Task Created' : 'Failed');
    if (videoUrl1) {
      console.log('   🎬 Video Generated:', videoUrl1);
    }
    
    console.log('\n✅ TEST 2 (Text-to-Video 9:16):', taskId2 ? 'Task Created' : 'Failed');
    
    console.log('\n✅ TEST 3 (Image-to-Video):', taskId3 ? 'Task Created' : 'Failed/Skipped');
    
    console.log('\n💡 API ENDPOINTS:');
    console.log('   • POST /videos/generations - Create text-to-video');
    console.log('   • POST /videos/edits - Create image-to-video');
    console.log('   • GET /videos/results/{task_id} - Check status & get result');
    
    console.log('\n📝 USAGE EXAMPLE:');
    console.log('-'.repeat(70));
    console.log('// Generate video from text:');
    console.log('curl -X POST "https://vetrex.site/v1/videos/generations" \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{');
    console.log('    "prompt": "Your prompt here",');
    console.log('    "model": "sora-2",');
    console.log('    "aspect_ratio": "16:9"');
    console.log('  }\'');
    console.log('');
    console.log('// Check status:');
    console.log('curl "https://vetrex.site/v1/videos/results/YOUR_TASK_ID"');
    console.log('=' .repeat(70) + '\n');
    
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testSora2API();
