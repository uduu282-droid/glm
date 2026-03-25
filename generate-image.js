import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function generateAndSaveImage() {
  console.log('🎨 Generating Image with Pollinations API\n');
  console.log('=' .repeat(80));
  
  const prompt = 'A cyberpunk city at night with neon lights';
  const width = 1024;
  const height = 1024;
  const model = 'flux';
  
  console.log(`\n📝 Prompt: ${prompt}`);
  console.log(`📐 Size: ${width}x${height}`);
  console.log(`🎯 Model: ${model}\n`);
  
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&model=${model}&nologo=true`;
  
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📡 Attempt ${attempt}/${maxRetries}: Fetching image...`);
      console.log('⏳ Please wait... This may take 30-60 seconds...\n');
      
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 120000, // 2 minutes
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.status === 200) {
        const fileName = `generated_image_${Date.now()}.jpg`;
        const filePath = path.join(process.cwd(), fileName);
        
        fs.writeFileSync(filePath, response.data);
        
        const fileSize = (response.data.length / 1024).toFixed(2);
        
        console.log('✅ SUCCESS!\n');
        console.log(`💾 Image saved to: ${filePath}`);
        console.log(`📊 File size: ${fileSize} KB`);
        console.log(`🖼️  Content-Type: ${response.headers['content-type']}`);
        console.log('\n🎉 Image generation complete!\n');
        console.log('📝 To view: Open the file in your image viewer\n');
        
        return { success: true, fileName, filePath, fileSize };
      }
      
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Waiting 5 seconds before retry...\n`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.log('\n❌ All attempts failed.');
        console.log('\n💡 Alternative: Use curl directly:');
        console.log(`curl "${imageUrl}" -o image.jpg\n`);
      }
    }
  }
  
  return null;
}

generateAndSaveImage().catch(console.error);
