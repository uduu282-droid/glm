// Test Background Removal on PhotoGrid Worker
const WORKER_URL = 'https://photogrid-proxy.llamai.workers.dev';

async function testBackgroundRemoval() {
  console.log('🧪 Testing PhotoGrid Background Removal\n');
  
  try {
    // Test image (Nike shoe from Unsplash)
    const testImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop';
    
    console.log('📤 Sending background removal request...');
    console.log(`   Image: ${testImage}`);
    
    const response = await fetch(`${WORKER_URL}/api/ai/mcp/background`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: testImage,
        type: 'cut'
      })
    });
    
    console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    console.log('\n📋 Response Data:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.code === 0 && result.data) {
      console.log('\n✅ SUCCESS!');
      console.log(`   Processing ID: ${result.data.id || 'N/A'}`);
      console.log(`   Result URL: ${result.data.url || result.data.download_url || 'Processing...'}`);
      
      if (result.data.wait_time) {
        console.log(`   Wait Time: ${result.data.wait_time}s`);
      }
    } else {
      console.log('\n⚠️ API returned error or unexpected format');
      console.log(`   Code: ${result.code}`);
      console.log(`   Message: ${result.errmsg || result.message || 'Unknown'}`);
    }
    
  } catch (error) {
    console.log('\n❌ FAILED:', error.message);
  }
}

async function testWatermarkRemoval() {
  console.log('\n\n🧪 Testing Watermark Removal (Alternative)\n');
  
  try {
    const testImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500';
    
    console.log('📤 Sending watermark removal request...');
    
    const response = await fetch(`${WORKER_URL}/api/ai/remove/watermark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: testImage
      })
    });
    
    console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    console.log('\n📋 Response Data:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log('\n❌ FAILED:', error.message);
  }
}

async function checkQuota() {
  console.log('\n\n📊 Checking Current Session Quota\n');
  
  try {
    const response = await fetch(`${WORKER_URL}/api/web/nologinmethodlist?platform=h5&appid=808645&version=8.9.7&country=US&locale=en`);
    const data = await response.json();
    
    console.log('Available Quotas:');
    console.log(`   Background Cut: ${data.data?.wn_bgcut?.upload_limit || 0} uploads remaining`);
    console.log(`   Watermark Removal: ${data.data?.wn_superremove?.upload_limit || 0} uploads remaining`);
    console.log(`   Enhancement: ${data.data?.wn_enhancer?.upload_limit || 0} uploads remaining`);
    
  } catch (error) {
    console.log('❌ Failed to check quota:', error.message);
  }
}

// Run tests
(async () => {
  await checkQuota();
  await testBackgroundRemoval();
  await testWatermarkRemoval();
  console.log('\n\n✅ All tests completed!\n');
})();
