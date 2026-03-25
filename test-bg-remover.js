import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

console.log('🧪 Testing Background Remover API\n');

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
  console.log(`📝 Content-Type: ${response.headers['content-type']}`);
  
  // Save result
  const outputPath = `output_${Date.now()}.png`;
  fs.writeFileSync(outputPath, Buffer.from(response.data));
  console.log(`\n💾 Saved to: ${outputPath}`);
  console.log('✨ Success!\n');
  
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
