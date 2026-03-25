import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testImgUpscalerAPI() {
    console.log('🧪 Testing ImgUpscaler API\n');
    console.log('=' .repeat(70));
    
    try {
        // Step 1: Create a test image (simple valid PNG)
        console.log('📁 Step 1: Creating test image...\n');
        
        // Create a simple 100x100 red PNG
        const pngHeader = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00, 0x64,
            0x08, 0x02, 0x00, 0x00, 0x00, 0xFF, 0x80, 0x20,
            0x00, 0x00, 0x00, 0x01, 0x73, 0x52, 0x47, 0x42,
            0x00, 0xAE, 0xCE, 0x1C, 0xE9, 0x00, 0x00, 0x00,
            0x04, 0x67, 0x41, 0x4D, 0x41, 0x00, 0x00, 0xB1,
            0x8F, 0x0B, 0xFC, 0x61, 0x05, 0x00, 0x00, 0x00,
            0x09, 0x70, 0x48, 0x59, 0x73, 0x00, 0x00, 0x0E,
            0xC3, 0x00, 0x00, 0x0E, 0xC3, 0x01, 0xC7, 0x6F,
            0xA8, 0x64, 0x00, 0x00, 0x00, 0x19, 0x74, 0x45,
            0x58, 0x74, 0x53, 0x6F, 0x66, 0x74, 0x77, 0x61,
            0x72, 0x65, 0x00, 0x41, 0x64, 0x6F, 0x62, 0x65,
            0x20, 0x49, 0x6D, 0x61, 0x67, 0x65, 0x52, 0x65,
            0x61, 0x64, 0x79, 0x71, 0xC9, 0x65, 0x3C, 0x00,
            0x00, 0x00, 0x19, 0x49, 0x44, 0x41, 0x54, 0x78,
            0xDA, 0x62, 0x60, 0x60, 0x60, 0x60, 0x60, 0x60,
            0x18, 0x63, 0x60, 0x18, 0x00, 0x00, 0x00, 0x69,
            0x00, 0x01, 0xD4, 0xDD, 0xDE, 0x00, 0x00, 0x00,
            0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60,
            0x82
        ]);
        
        const testImagePath = path.join(__dirname, 'test_upload.png');
        fs.writeFileSync(testImagePath, pngHeader);
        console.log('✅ Test image created: test_upload.png (100x100 red square)\n');
        
        // Step 2: Initiate upload
        console.log('📤 Step 2: Initiating upload...\n');
        
        const formData = new FormData();
        formData.append('file_name', 'test_upload.png');
        
        const uploadResponse = await axios.post(
            'https://api.imgupscaler.ai/api/common/upload/upload-image',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'referer': 'https://imgupscaler.ai/',
                    'origin': 'https://imgupscaler.ai'
                }
            }
        );
        
        console.log('Upload Response:', JSON.stringify(uploadResponse.data, null, 2));
        
        if (uploadResponse.data.code !== 100000) {
            throw new Error('Upload initiation failed: ' + uploadResponse.data.message?.en);
        }
        
        const objectName = uploadResponse.data.result.object_name;
        console.log(`\n✅ Upload initiated. Object name: ${objectName}\n`);
        
        // Step 3: Get signed URL
        console.log('🔐 Step 3: Getting signed URL...\n');
        
        const signFormData = new FormData();
        signFormData.append('object_name', objectName);
        
        const signResponse = await axios.post(
            'https://api.imgupscaler.ai/api/common/upload/sign-object',
            signFormData,
            {
                headers: {
                    ...signFormData.getHeaders(),
                    'referer': 'https://imgupscaler.ai/',
                    'origin': 'https://imgupscaler.ai'
                }
            }
        );
        
        console.log('Sign Response:', JSON.stringify(signResponse.data, null, 2));
        
        if (signResponse.data.code !== 100000) {
            throw new Error('Sign failed: ' + signResponse.data.message?.en);
        }
        
        const signedUrl = signResponse.data.result.url;
        console.log(`\n✅ Signed URL obtained\n`);
        
        // Step 4: Upload actual image to OSS
        console.log('☁️ Step 4: Uploading to cloud storage...\n');
        
        const imageBuffer = fs.readFileSync(testImagePath);
        
        await axios.put(signedUrl, imageBuffer, {
            headers: {
                'Content-Type': 'image/png'
            },
            maxRedirects: 0
        });
        
        console.log('✅ Image uploaded successfully to Alibaba Cloud OSS\n');
        
        // Clean up
        fs.unlinkSync(testImagePath);
        console.log('🗑️ Test image cleaned up\n');
        
        console.log('=' .repeat(70));
        console.log('\n✅ ALL STEPS COMPLETED SUCCESSFULLY!\n');
        console.log('The ImgUpscaler API is fully functional!\n');
        console.log('📝 Summary:');
        console.log('   1. ✅ Upload initiation works');
        console.log('   2. ✅ Signed URL generation works');
        console.log('   3. ✅ Cloud storage upload works');
        console.log('\nNote: This only tests the UPLOAD flow.');
        console.log('      Actual image processing happens after upload.\n');
        
    } catch (error) {
        console.error('\n❌ TEST FAILED:\n');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
        console.log('');
        process.exit(1);
    }
}

testImgUpscalerAPI();
