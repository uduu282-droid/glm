import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Quick Test Script for ImgUpscaler Processing Endpoints
 * Tests all discovered enhancement endpoints to find the working ones
 */

const BASE_URL = 'https://api.imgupscaler.ai';
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://imgupscaler.ai',
    'Referer': 'https://imgupscaler.ai/',
    'Accept': '*/*'
};

async function testEndpoint(name, endpoint, payload) {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   Endpoint: ${endpoint}`);
    
    try {
        const response = await axios.post(
            `${BASE_URL}${endpoint}`,
            payload,
            {
                headers: {
                    ...HEADERS,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log(`✅ Status: ${response.status}`);
        console.log(`   Response code: ${response.data.code}`);
        console.log(`   Keys: ${Object.keys(response.data).join(', ')}`);
        
        if (response.data.code === 100000) {
            console.log(`   ✅ SUCCESS! This endpoint works!`);
            console.log(`   Result keys: ${Object.keys(response.data.result || {}).join(', ')}`);
            return { success: true, data: response.data };
        } else {
            console.log(`   ⚠️  Non-success code: ${response.data.code}`);
            console.log(`   Message: ${response.data.message?.en || 'Unknown'}`);
            return { success: false, error: response.data.message?.en };
        }
    } catch (error) {
        if (error.response) {
            console.log(`❌ Status: ${error.response.status}`);
            console.log(`   Error: ${JSON.stringify(error.response.data).substring(0, 200)}`);
        } else {
            console.log(`❌ Request failed: ${error.message}`);
        }
        return { success: false, error: error.message };
    }
}

async function main() {
    console.log('🔍 ImgUpscaler - Testing All Processing Endpoints');
    console.log('=' .repeat(70));
    
    // First, we need a valid image URL from the upload flow
    console.log('\n📤 Step 1: Creating test image and uploading...\n');
    
    // Create test image
    const testImage = path.join(__dirname, 'test_endpoint.png');
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
        0x00, 0x00, 0x1D, 0x49, 0x44, 0x41, 0x54, 0x78,
        0xDA, 0x62, 0x62, 0x60, 0x60, 0x60, 0xF8, 0xCF,
        0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0,
        0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0,
        0xC0, 0xC0, 0xC0, 0xC0, 0x00, 0x05, 0x96, 0x01,
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
        0xAE, 0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(testImage, pngHeader);
    
    // Upload the image
    const formData = new FormData();
    formData.append('file_name', 'test_endpoint.png');
    
    try {
        const uploadResponse = await axios.post(
            `${BASE_URL}/api/common/upload/upload-image`,
            formData,
            {
                headers: {
                    ...HEADERS,
                    ...formData.getHeaders()
                }
            }
        );
        
        if (uploadResponse.data.code !== 100000) {
            throw new Error('Upload failed');
        }
        
        const uploadUrl = uploadResponse.data.result.url;
        const objectName = uploadResponse.data.result.object_name;
        
        console.log('✅ Upload initiated');
        
        // Upload to cloud
        await axios.put(uploadUrl, pngHeader, {
            headers: { 'Content-Type': 'image/png' }
        });
        
        console.log('✅ Uploaded to cloud');
        
        // Sign
        const signFormData = new FormData();
        signFormData.append('object_name', objectName);
        
        const signResponse = await axios.post(
            `${BASE_URL}/api/common/upload/sign-object`,
            signFormData,
            {
                headers: {
                    ...HEADERS,
                    ...signFormData.getHeaders()
                }
            }
        );
        
        const imageUrl = signResponse.data.result.url;
        console.log('✅ Object signed');
        console.log(`   Image URL: ${imageUrl.substring(0, 80)}...`);
        
        // Now test different processing endpoints
        console.log('\n\n🎨 Testing Processing Endpoints...\n');
        console.log('=' .repeat(70));
        
        const endpointsToTest = [
            {
                name: 'General Enhancement (upscale)',
                endpoint: '/api/image/enhance',
                payload: { image_url: imageUrl, scale: 2 }
            },
            {
                name: 'Sharpen',
                endpoint: '/api/image/sharpen',
                payload: { image_url: imageUrl, intensity: 'high' }
            },
            {
                name: 'Restore',
                endpoint: '/api/image/restore',
                payload: { image_url: imageUrl, restore_type: 'old_photo' }
            },
            {
                name: 'AI Edit',
                endpoint: '/api/image/edit',
                payload: { 
                    image_url: imageUrl,
                    prompt: 'Enhance this image'
                }
            },
            {
                name: 'Alternative Enhance (v1)',
                endpoint: '/api/v1/image/enhance',
                payload: { image_url: imageUrl }
            },
            {
                name: 'Process Endpoint',
                endpoint: '/api/process',
                payload: { image_url: imageUrl, type: 'upscale' }
            }
        ];
        
        const results = [];
        
        for (const test of endpointsToTest) {
            const result = await testEndpoint(test.name, test.endpoint, test.payload);
            results.push({
                name: test.name,
                endpoint: test.endpoint,
                ...result
            });
            
            // Add delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Summary
        console.log('\n\n📊 TEST SUMMARY');
        console.log('=' .repeat(70));
        
        const successes = results.filter(r => r.success);
        const failures = results.filter(r => !r.success);
        
        console.log(`\nTotal tested: ${results.length}`);
        console.log(`✅ Successful: ${successes.length}`);
        console.log(`❌ Failed: ${failures.length}`);
        
        if (successes.length > 0) {
            console.log('\n✅ WORKING ENDPOINTS:\n');
            successes.forEach(s => {
                console.log(`   • ${s.name}`);
                console.log(`     ${s.endpoint}`);
            });
        }
        
        if (failures.length > 0) {
            console.log('\n❌ NON-WORKING ENDPOINTS:\n');
            failures.forEach(f => {
                console.log(`   • ${f.name}`);
                console.log(`     ${f.endpoint}`);
                console.log(`     Error: ${f.error || 'Unknown'}`);
            });
        }
        
        // Save results
        const outputDir = path.join(__dirname, 'imgupscaler_endpoint_tests');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        fs.writeFileSync(
            path.join(outputDir, `test_results_${timestamp}.json`),
            JSON.stringify({
                timestamp,
                imageUrl,
                results
            }, null, 2)
        );
        
        console.log(`\n💾 Results saved to: ${outputDir}`);
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error);
    }
}

main().catch(console.error);
