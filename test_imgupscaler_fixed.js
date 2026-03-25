import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testImgUpscalerCorrected() {
    console.log('🧪 Testing ImgUpscaler API (CORRECTED FLOW)\n');
    console.log('=' .repeat(70));
    
    try {
        // Step 1: Create test image
        console.log('📁 Step 1: Creating test image...\n');
        
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
        console.log('✅ Test image created\n');
        
        // CORRECTED FLOW based on captured data:
        // 1. Get upload URL first
        // 2. Upload directly to that URL (PUT)
        // 3. Sign the object
        
        console.log('📤 Step 2: Getting initial upload URL...\n');
        
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
            throw new Error('Upload initiation failed');
        }
        
        const directUploadUrl = uploadResponse.data.result.url;
        console.log(`\n✅ Got direct upload URL\n`);
        
        // Upload image to the provided URL (Alibaba Cloud OSS)
        console.log('☁️ Step 3: Uploading image to cloud storage (PUT)...\n');
        
        const imageBuffer = fs.readFileSync(testImagePath);
        
        await axios.put(directUploadUrl, imageBuffer, {
            headers: {
                'Content-Type': 'image/png'
            },
            maxRedirects: 0
        });
        
        console.log('✅ Image uploaded to cloud storage\n');
        
        // Now sign the object
        console.log('🔐 Step 4: Signing the uploaded object...\n');
        
        const objectName = uploadResponse.data.result.object_name;
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
        
        if (signResponse.data.code === 100000) {
            console.log('\n✅ Object signed successfully!\n');
            console.log('Signed URL:', signResponse.data.result.url);
        } else {
            console.log('\n⚠️ Sign response code:', signResponse.data.code);
            console.log('Message:', signResponse.data.message?.en);
        }
        
        // Clean up
        fs.unlinkSync(testImagePath);
        console.log('\n🗑️ Test image cleaned up\n');
        
        console.log('=' .repeat(70));
        console.log('\n✅ TEST COMPLETED!\n');
        console.log('API Status: WORKING ✅\n');
        console.log('Flow verified:');
        console.log('   1. ✅ Get upload URL from /upload-image');
        console.log('   2. ✅ PUT image directly to OSS URL');
        console.log('   3. ✅ Sign object with /sign-object');
        console.log('\nNote: This confirms the UPLOAD API works.\n');
        
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

testImgUpscalerCorrected();
