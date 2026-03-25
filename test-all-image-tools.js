import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

console.log('🧪 Testing All Image Processing Tools\n');

const BASE_URL = 'https://bgremover-backend-121350814881.us-central1.run.app';
const imagePath = 'magic_studio_test.png';

// Available endpoints to test based on the tools list
const endpoints = [
  { name: 'Remove Background', path: '/api/remove-bg' },
  { name: 'Change Background', path: '/api/change-bg' },
  { name: 'Change Colors', path: '/api/change-colors' },
  { name: 'Convert Format', path: '/api/convert-format' },
  { name: 'Image to PDF', path: '/api/image-to-pdf' },
  { name: 'OCR (Image to Text)', path: '/api/ocr' },
  { name: 'Upscale Image', path: '/api/upscale' },
  { name: 'Blur Background', path: '/api/blur-bg' },
  { name: 'Black & White BG', path: '/api/bw-bg' },
  { name: 'Enhance Image', path: '/api/enhance' },
  { name: 'Resize Image', path: '/api/resize' },
  { name: 'Compress Image', path: '/api/compress' },
  { name: 'Remove Text', path: '/api/remove-text' },
  { name: 'Add Text', path: '/api/add-text' },
  { name: 'Remove Watermark', path: '/api/remove-watermark' },
  { name: 'Remove People', path: '/api/remove-people' },
  { name: 'Metadata', path: '/api/metadata' },
];

if (!fs.existsSync(imagePath)) {
  console.log(`❌ File not found: ${imagePath}`);
  process.exit(1);
}

async function testEndpoint(endpoint) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(imagePath));
  
  // Add common parameters
  if (endpoint.path === '/api/upscale') {
    formData.append('scale', '2');
  }
  if (endpoint.path === '/api/resize') {
    formData.append('width', '800');
    formData.append('height', '600');
  }
  if (endpoint.path === '/api/compress') {
    formData.append('quality', '80');
  }
  
  try {
    const response = await axios.post(`${BASE_URL}${endpoint.path}`, formData, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.changeimageto.com/',
        ...formData.getHeaders()
      },
      responseType: 'arraybuffer',
      timeout: 30000,
      validateStatus: () => true // Don't throw on error status
    });
    
    if (response.status === 200) {
      const size = (response.data.length / 1024).toFixed(2);
      console.log(`✅ ${endpoint.name}: ${response.status} (${size} KB)`);
      
      // Save result
      const ext = endpoint.path.split('/')[2] || 'output';
      const outputPath = `test_${ext}_${Date.now()}.png`;
      fs.writeFileSync(outputPath, Buffer.from(response.data));
      console.log(`   💾 Saved: ${outputPath}\n`);
      return true;
    } else {
      console.log(`⚠️  ${endpoint.name}: ${response.status}`);
      try {
        const errorText = Buffer.from(response.data).toString().substring(0, 200);
        console.log(`   Error: ${errorText}\n`);
      } catch {}
      return false;
    }
  } catch (error) {
    console.log(`❌ ${endpoint.name}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`📤 Testing with: ${imagePath}\n`);
  console.log('='.repeat(60));
  
  const results = {
    working: [],
    notFound: [],
    errors: []
  };
  
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint);
    if (success) {
      results.working.push(endpoint.name);
    } else {
      results.notFound.push(endpoint.name);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY:');
  console.log(`\n✅ Working (${results.working.length}):`);
  results.working.forEach(name => console.log(`   - ${name}`));
  
  console.log(`\n⚠️  Not Found/Errors (${results.notFound.length}):`);
  results.notFound.forEach(name => console.log(`   - ${name}`));
  
  console.log('\n✨ Done!\n');
}

main();
