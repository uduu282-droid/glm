import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

console.log('🧪 Testing ALL Image Processing Tools - Complete Scan\n');

const BASE_URL = 'https://bgremover-backend-121350814881.us-central1.run.app';
const imagePath = 'magic_studio_test.png';

// ALL available tools from changeimageto.com
const allTools = [
  // Background Tools
  { name: 'Remove Background', path: '/api/remove-bg' },
  { name: 'Change Background', path: '/api/change-bg' },
  { name: 'Blur Background', path: '/api/blur-bg' },
  { name: 'B&W Background', path: '/api/bw-bg' },
  
  // Color & Enhancement
  { name: 'Change Colors', path: '/api/change-colors' },
  { name: 'Enhance', path: '/api/enhance' },
  { name: 'Upscale', path: '/api/upscale' },
  
  // Format & Conversion
  { name: 'Convert Format', path: '/api/convert-format' },
  { name: 'Image to PDF', path: '/api/image-to-pdf' },
  
  // Text & OCR
  { name: 'OCR', path: '/api/ocr' },
  { name: 'Remove Text', path: '/api/remove-text' },
  { name: 'Add Text', path: '/api/add-text' },
  
  // Watermark & Object Removal
  { name: 'Remove Watermark', path: '/api/remove-watermark' },
  { name: 'Remove Gemini Watermark', path: '/api/remove-gemini-watermark' },
  { name: 'Remove People', path: '/api/remove-people' },
  
  // Resize & Optimization
  { name: 'Resize', path: '/api/resize' },
  { name: 'Compress', path: '/api/compress' },
  
  // Metadata & Quality
  { name: 'Metadata', path: '/api/metadata' },
  { name: 'Check Quality', path: '/api/check-quality' }
];

if (!fs.existsSync(imagePath)) {
  console.log(`❌ File not found: ${imagePath}`);
  process.exit(1);
}

async function testEndpoint(tool) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(imagePath));
  
  try {
    const response = await axios.post(`${BASE_URL}${tool.path}`, formData, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.changeimageto.com/',
        ...formData.getHeaders()
      },
      responseType: 'arraybuffer',
      timeout: 30000,
      validateStatus: () => true
    });
    
    if (response.status === 200) {
      const size = (response.data.length / 1024).toFixed(2);
      console.log(`✅ ${tool.name}: ${response.status} (${size} KB)`);
      
      // Save result
      const safeName = tool.path.replace(/\//g, '-').substring(1);
      const outputPath = `test${safeName}_${Date.now()}.bin`;
      fs.writeFileSync(outputPath, Buffer.from(response.data));
      console.log(`   💾 Saved: ${outputPath}\n`);
      return { success: true, status: response.status, size };
    } else {
      console.log(`⚠️  ${tool.name}: ${response.status}`);
      try {
        const errorText = Buffer.from(response.data).toString().substring(0, 150);
        console.log(`   Error: ${errorText}\n`);
      } catch {}
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.log(`❌ ${tool.name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log(`📤 Testing with: ${imagePath}`);
  console.log(`🔗 Backend: ${BASE_URL}\n`);
  console.log('='.repeat(70));
  
  const results = {
    working: [],
    failed: []
  };
  
  for (const tool of allTools) {
    const result = await testEndpoint(tool);
    if (result.success) {
      results.working.push({ ...tool, ...result });
    } else {
      results.failed.push({ ...tool, ...result });
    }
    
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 FINAL RESULTS:');
  console.log(`\n✅ Working Tools (${results.working.length}):`);
  results.working.forEach((t, i) => {
    console.log(`   ${i+1}. ${t.name} - ${t.size} KB`);
  });
  
  console.log(`\n⚠️  Failed/Not Found (${results.failed.length}):`);
  results.failed.forEach(t => {
    console.log(`   - ${t.name} (${t.status || t.error})`);
  });
  
  console.log('\n✨ Summary:');
  console.log(`   Total tools tested: ${allTools.length}`);
  console.log(`   Working: ${results.working.length} (${((results.working.length/allTools.length)*100).toFixed(1)}%)`);
  console.log(`   Failed: ${results.failed.length} (${((results.failed.length/allTools.length)*100).toFixed(1)}%)\n`);
}

main().catch(console.error);
