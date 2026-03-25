const fs = require('fs');
const axios = require('axios');

async function testWorker() {
  console.log('🧪 Testing Cloudflare Worker Output\n');
  
  const workerUrl = 'https://unified-image-api.llamai.workers.dev/api/process';
  const imagePath = 'magic_studio_test.png';
  
  if (!fs.existsSync(imagePath)) {
    console.log(`❌ File not found: ${imagePath}`);
    process.exit(1);
  }
  
  const imageBuffer = fs.readFileSync(imagePath);
  const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`;
  
  // Build multipart form data
  const parts = [];
  parts.push(`--${boundary}\r\n`);
  parts.push(`Content-Disposition: form-data; name="tool"\r\n\r\nremove-bg\r\n`);
  parts.push(`--${boundary}\r\n`);
  parts.push(`Content-Disposition: form-data; name="image"; filename="test.png"\r\n`);
  parts.push(`Content-Type: image/png\r\n\r\n`);
  
  const encoder = new TextEncoder();
  const headerParts = parts.map(part => encoder.encode(part));
  const footer = encoder.encode(`\r\n--${boundary}--\r\n`);
  
  // Calculate total size
  const totalSize = headerParts.reduce((sum, part) => sum + part.length, 0) + imageBuffer.length + footer.length;
  
  // Create final body
  const bodyBuffer = Buffer.alloc(totalSize);
  let offset = 0;
  
  for (const part of headerParts) {
    bodyBuffer.set(part, offset);
    offset += part.length;
  }
  
  bodyBuffer.set(imageBuffer, offset);
  offset += imageBuffer.length;
  bodyBuffer.set(footer, offset);
  
  console.log('📤 Sending request...');
  console.log(`   Image size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
  console.log(`   Tool: remove-bg`);
  
  try {
    const response = await axios.post(workerUrl, bodyBuffer, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.changeimageto.com/'
      },
      responseType: 'arraybuffer',
      timeout: 60000
    });
    
    console.log(`\n✅ Status: ${response.status}`);
    console.log(`📊 Response size: ${(response.data.length / 1024).toFixed(2)} KB`);
    console.log(`📝 Content-Type: ${response.headers['content-type']}`);
    console.log(`📝 Content-Disposition: ${response.headers['content-disposition']}`);
    
    // Save result
    const outputPath = `worker_test_output_${Date.now()}.png`;
    fs.writeFileSync(outputPath, Buffer.from(response.data));
    console.log(`\n💾 Saved to: ${outputPath}`);
    console.log(`✨ Success! Output file created and ready.\n`);
    
    // Try to open it
    const { exec } = require('child_process');
    exec(`start ${outputPath}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      try {
        const errorText = Buffer.from(error.response.data).toString();
        console.error(`   Body: ${errorText.substring(0, 500)}`);
      } catch {}
    }
  }
}

testWorker();
