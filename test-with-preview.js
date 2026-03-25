import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

console.log('🎨 Testing Background Remover & Creating Preview\n');

const imagePath = 'magic_studio_test.png';

if (!fs.existsSync(imagePath)) {
  console.log(`❌ File not found: ${imagePath}`);
  process.exit(1);
}

const formData = new FormData();
formData.append('file', fs.createReadStream(imagePath));

console.log(`📤 Uploading: ${imagePath}`);
console.log('⏳ Processing...\n');

try {
  const response = await axios.post(
    'https://bgremover-backend-121350814881.us-central1.run.app/api/remove-bg',
    formData,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
        'Referer': 'https://www.changeimageto.com/',
        ...formData.getHeaders()
      },
      responseType: 'arraybuffer',
      timeout: 60000
    }
  );

  console.log(`✅ Status: ${response.status}`);
  console.log(`📊 Size: ${(response.data.length / 1024).toFixed(2)} KB`);
  
  const resultBuffer = Buffer.from(response.data);
  const timestamp = Date.now();
  
  // Save original transparent PNG
  const outputPath = `output_${timestamp}.png`;
  fs.writeFileSync(outputPath, resultBuffer);
  console.log(`\n💾 Saved transparent PNG: ${outputPath}`);
  
  // Create preview with white background
  try {
    const canvas = createCanvas(800, 800);
    const ctx = canvas.getContext('2d');
    
    // Load the result image
    const resultImage = await loadImage(resultBuffer);
    
    // Set canvas size to match image
    canvas.width = resultImage.width;
    canvas.height = resultImage.height;
    
    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the image on top
    ctx.drawImage(resultImage, 0, 0);
    
    // Save as JPG (no transparency)
    const previewPath = `preview_${timestamp}.jpg`;
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
    fs.writeFileSync(previewPath, buffer);
    console.log(`🖼️ Saved preview with white background: ${previewPath}`);
    
    // Also create checkered background version
    const checkeredCanvas = createCanvas(resultImage.width, resultImage.height);
    const checkCtx = checkeredCanvas.getContext('2d');
    
    // Draw checkered pattern
    const squareSize = 20;
    for (let y = 0; y < checkeredCanvas.height; y += squareSize) {
      for (let x = 0; x < checkeredCanvas.width; x += squareSize) {
        checkCtx.fillStyle = ((x / squareSize + y / squareSize) % 2 === 0) ? '#CCCCCC' : '#FFFFFF';
        checkCtx.fillRect(x, y, squareSize, squareSize);
      }
    }
    
    // Draw the image on top
    checkCtx.drawImage(resultImage, 0, 0);
    
    const checkeredPath = `preview_checkered_${timestamp}.png`;
    const checkeredBuffer = checkeredCanvas.toBuffer('image/png');
    fs.writeFileSync(checkeredPath, checkeredBuffer);
    console.log(`✓ Saved preview with checkered background: ${checkeredPath}`);
    
    console.log('\n✨ All files created successfully!\n');
    console.log('📁 Files:');
    console.log(`   1. ${outputPath} (transparent PNG - use in design software)`);
    console.log(`   2. ${previewPath} (white background - easy to view)`);
    console.log(`   3. ${checkeredPath} (checkered background - shows transparency)\n`);
    
    // Try to open the preview
    const { exec } = require('child_process');
    exec(`start ${previewPath}`);
    console.log('👀 Opening preview in default image viewer...\n');
    
  } catch (canvasError) {
    console.log('\n⚠️  Canvas library not available, skipping preview generation.');
    console.log('💡 Install it with: npm install canvas\n');
    console.log('📄 You can still view the PNG file directly:\n');
    console.log(`   File: ${outputPath}\n`);
    
    // Try to open with default app
    const { exec } = require('child_process');
    exec(`start ${outputPath}`);
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  if (error.response) {
    console.error(`   Status: ${error.response.status}`);
    try {
      const errorText = Buffer.from(error.response.data).toString();
      console.error(`   Body: ${errorText.substring(0, 500)}`);
    } catch {}
  }
}
