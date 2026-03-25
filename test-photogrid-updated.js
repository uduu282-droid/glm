// Test Updated PhotoGrid Worker with Background Removal
const WORKER_URL = 'https://photogrid-proxy.llamai.workers.dev';

async function testGetUploadUrl() {
  console.log('🧪 Testing Step 1: Get Upload URL\n');
  
  try {
    const response = await fetch(`${WORKER_URL}/api/ai/web/nologin/getuploadurl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Response Status: ${response.status}`);
    const result = await response.json();
    console.log('\n📋 Result:');
    console.log(JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    return null;
  }
}

async function testBackgroundRemovalSimple() {
  console.log('\n\n🧪 Testing Simplified Background Removal\n');
  
  const testImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500';
  
  try {
    console.log(`📤 Request: GET /remove-bg?image_url=${testImage}\n`);
    
    const response = await fetch(`${WORKER_URL}/remove-bg?image_url=${encodeURIComponent(testImage)}`);
    
    console.log(`📊 Response Status: ${response.status}`);
    const result = await response.json();
    console.log('\n📋 Result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.data && result.data.url) {
      console.log('\n✅ SUCCESS! Background removed!');
      console.log(`   Download URL: ${result.data.url}`);
    } else if (result.error) {
      console.log(`\n⚠️ Error: ${result.error}`);
    }
    
    return result;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    return null;
  }
}

async function testDirectAPI() {
  console.log('\n\n🧪 Testing Direct API Call (without worker)\n');
  
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  const deviceId = Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  const ghostId = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Origin': 'https://www.photogrid.app',
    'x-appid': '808645',
    'x-deviceid': deviceId,
    'x-ghostid': ghostId,
    'x-mcc': 'en-US',
    'x-platform': 'h5',
    'x-version': '8.9.7'
  };
  
  console.log('📤 Step 1: Get upload URL...');
  
  try {
    const uploadResponse = await fetch('https://api.grid.plus/v1/ai/web/nologin/getuploadurl', {
      method: 'POST',
      headers: headers
    });
    
    console.log(`📊 Upload URL Response: ${uploadResponse.status}`);
    const uploadData = await uploadResponse.json();
    console.log(JSON.stringify(uploadData, null, 2));
    
    if (uploadData.code === 0) {
      console.log('\n✅ Got upload URL successfully!');
      
      // Step 2 would be to upload the image
      console.log('\n📤 Step 2: Would upload image to bgcut/nologinupload');
    } else {
      console.log(`\n❌ Upload URL failed with code: ${uploadData.code}`);
      console.log(`Message: ${uploadData.errmsg}`);
    }
    
  } catch (error) {
    console.log('❌ FAILED:', error.message);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   PHOTOGRID BACKGROUND REMOVAL - COMPREHENSIVE TEST');
  console.log('═══════════════════════════════════════════════════\n');
  
  // Test 1: Direct API call to understand the flow
  await testDirectAPI();
  
  // Test 2: Test via worker
  await testBackgroundRemovalSimple();
  
  // Test 3: Just get upload URL via worker
  await testGetUploadUrl();
  
  console.log('\n\n═══════════════════════════════════════════════════');
  console.log('✅ All tests completed!');
  console.log('═══════════════════════════════════════════════════\n');
}

main();
