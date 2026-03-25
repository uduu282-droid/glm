// Test direct upload without getuploadurl
const WORKER_URL = 'https://photogrid-proxy.llamai.workers.dev';

async function testDirectUpload() {
  console.log('🧪 Testing Direct Upload (skipping getuploadurl)\n');
  
  const testImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500';
  
  try {
    // Try calling nologinupload directly with image_url
    console.log('📤 Calling /api/ai/web/bgcut/nologinupload directly...');
    
    const formData = new FormData();
    formData.append('image_url', testImage);
    
    const response = await fetch(`${WORKER_URL}/api/ai/web/bgcut/nologinupload`, {
      method: 'POST',
      body: formData
    });
    
    console.log(`\n📊 Response: ${response.status}`);
    const result = await response.json();
    console.log('\n📋 Result:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testWithMultipart() {
  console.log('\n\n🧪 Testing with Manual Multipart Form Data\n');
  
  const testImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500';
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  
  // Build multipart form manually
  const body = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="image_url"',
    '',
    testImage,
    `--${boundary}--`,
    ''
  ].join('\r\n');
  
  try {
    const response = await fetch(`${WORKER_URL}/api/ai/web/bgcut/nologinupload`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: body
    });
    
    console.log(`📊 Response: ${response.status}`);
    const result = await response.json();
    console.log('📋 Result:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Run tests
(async () => {
  await testDirectUpload();
  await testWithMultipart();
})();
