// Test the COMPLETE flow: bfinfo -> nologinupload
const WORKER_URL = 'https://photogrid-proxy.llamai.workers.dev';

async function testCompleteFlow() {
  console.log('🎬 Testing Complete Flow\n');
  
  const testImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500';
  
  try {
    // Step 1: Call bfinfo (WITHOUT signature)
    console.log('1️⃣ Calling /api/web/bfinfo...');
    const bfinfoResponse = await fetch(`${WORKER_URL}/api/web/bfinfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ method: 'wn_bgcut' })
    });
    
    console.log(`   Response: ${bfinfoResponse.status}`);
    const bfinfoData = await bfinfoResponse.json();
    console.log(`   Data:`, JSON.stringify(bfinfoData));
    
    // Step 2: Try upload immediately after
    console.log('\n2️⃣ Calling /api/ai/web/bgcut/nologinupload...');
    const formData = new FormData();
    formData.append('image_url', testImage);
    
    const uploadResponse = await fetch(`${WORKER_URL}/api/ai/web/bgcut/nologinupload`, {
      method: 'POST',
      body: formData
    });
    
    console.log(`   Response: ${uploadResponse.status}`);
    const result = await uploadResponse.json();
    console.log(`   Data:`, JSON.stringify(result, null, 2));
    
    if (result.code === 0 && result.data) {
      console.log('\n✅ SUCCESS! Background removed!');
      console.log(`   Result URL: ${result.data.url || result.data.download_url}`);
    } else {
      console.log(`\n❌ Error code: ${result.code}`);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testCompleteFlow();
