import axios from 'axios';
import FormData from 'form-data';

const BASE_URL = 'https://api.imgupscaler.ai';

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://imgupscaler.ai',
    'Referer': 'https://imgupscaler.ai/',
    'Accept': '*/*'
};

async function testEndpoint(name, method, url, payload = null) {
    console.log(`\n🧪 ${name}`);
    console.log(`   ${method} ${url}`);
    
    try {
        let response;
        if (method === 'GET') {
            response = await axios.get(url, { headers: HEADERS, timeout: 10000 });
        } else if (method === 'POST') {
            const formData = new FormData();
            if (payload) {
                Object.keys(payload).forEach(key => formData.append(key, payload[key]));
            }
            response = await axios.post(url, formData, { 
                headers: { ...HEADERS, ...formData.getHeaders() },
                timeout: 10000 
            });
        }
        
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   Response code: ${response.data.code}`);
        if (response.data.code === 100000) {
            console.log(`   🎉 SUCCESS!`);
            return { success: true, data: response.data };
        } else {
            console.log(`   ⚠️  Code: ${response.data.code} - ${response.data.message?.en || 'Unknown'}`);
            return { success: false, error: response.data.message?.en };
        }
    } catch (error) {
        if (error.response) {
            console.log(`   ❌ Status: ${error.response.status}`);
            if (error.response.status === 404) {
                console.log(`   Not Found`);
            } else {
                console.log(`   Error: ${JSON.stringify(error.response.data).substring(0, 100)}`);
            }
        } else {
            console.log(`   ❌ ${error.message}`);
        }
        return { success: false, error: error.message };
    }
}

async function main() {
    console.log('🔍 Testing Alternative ImgUpscaler Endpoints\n');
    console.log('=' .repeat(70));
    
    // First get an image URL by uploading
    console.log('📤 Step 1: Getting test image URL...\n');
    
    const uploadForm = new FormData();
    uploadForm.append('file_name', 'test.png');
    
    let imageUrl = null;
    let objectName = null;
    
    try {
        const uploadResp = await axios.post(
            `${BASE_URL}/api/common/upload/upload-image`,
            uploadForm,
            { headers: { ...HEADERS, ...uploadForm.getHeaders() } }
        );
        
        if (uploadResp.data.code === 100000) {
            imageUrl = uploadResp.data.result.url;
            objectName = uploadResp.data.result.object_name;
            console.log('✅ Got image URL from upload');
            
            // Sign it
            const signForm = new FormData();
            signForm.append('object_name', objectName);
            
            const signResp = await axios.post(
                `${BASE_URL}/api/common/upload/sign-object`,
                signForm,
                { headers: { ...HEADERS, ...signForm.getHeaders() } }
            );
            
            if (signResp.data.code === 100000) {
                imageUrl = signResp.data.result.url;
                console.log('✅ Got signed URL');
            }
        }
    } catch (error) {
        console.log('❌ Upload failed:', error.message);
        return;
    }
    
    console.log('\n\n🎨 Testing Alternative Processing Endpoints...\n');
    console.log('=' .repeat(70));
    
    const tests = [
        // V2 endpoints (from user info response)
        {
            name: 'V2 Upscale Endpoint',
            method: 'POST',
            url: `${BASE_URL}/api/image/upscale-v2`,
            payload: { image_url: imageUrl }
        },
        {
            name: 'V2 Enhance Endpoint',
            method: 'POST',
            url: `${BASE_URL}/api/v2/image/enhance`,
            payload: { image_url: imageUrl }
        },
        {
            name: 'Auto Remove Endpoint',
            method: 'POST',
            url: `${BASE_URL}/api/image/auto-remove`,
            payload: { image_url: imageUrl }
        },
        {
            name: 'Manual Remove Endpoint',
            method: 'POST',
            url: `${BASE_URL}/api/image/manual-remove`,
            payload: { image_url: imageUrl }
        },
        {
            name: 'Colorize Endpoint',
            method: 'POST',
            url: `${BASE_URL}/api/image/colorize`,
            payload: { image_url: imageUrl }
        },
        {
            name: 'Unblur Endpoint',
            method: 'POST',
            url: `${BASE_URL}/api/image/unblur`,
            payload: { image_url: imageUrl }
        },
        
        // Different patterns
        {
            name: 'Enhancement Task (POST)',
            method: 'POST',
            url: `${BASE_URL}/api/enhancement/create`,
            payload: { image_url: imageUrl, type: 'upscale' }
        },
        {
            name: 'AI Enhance Service',
            method: 'POST',
            url: `${BASE_URL}/api/service/enhance`,
            payload: { image_url: imageUrl }
        },
        {
            name: 'Image Tool API',
            method: 'POST',
            url: `${BASE_URL}/api/tool/upscale`,
            payload: { image_url: imageUrl }
        },
        
        // Try with task pattern
        {
            name: 'Task Creation',
            method: 'POST',
            url: `${BASE_URL}/api/task/create`,
            payload: { image_url: imageUrl, action: 'upscale' }
        },
        {
            name: 'Async Process',
            method: 'POST',
            url: `${BASE_URL}/api/async/process`,
            payload: { image_url: imageUrl }
        },
        
        // Check base API
        {
            name: 'Base API Info',
            method: 'GET',
            url: `${BASE_URL}/`
        },
        {
            name: 'API Version',
            method: 'GET',
            url: `${BASE_URL}/api/version`
        },
        {
            name: 'API Health',
            method: 'GET',
            url: `${BASE_URL}/api/health`
        }
    ];
    
    const results = [];
    for (const test of tests) {
        const result = await testEndpoint(test.name, test.method, test.url, test.payload);
        results.push({ ...test, ...result });
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary
    console.log('\n\n📊 TEST SUMMARY');
    console.log('=' .repeat(70));
    
    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);
    
    console.log(`\nTotal: ${results.length}`);
    console.log(`✅ Success: ${successes.length}`);
    console.log(`❌ Failed: ${failures.length}`);
    
    if (successes.length > 0) {
        console.log('\n🎉 WORKING ENDPOINTS:\n');
        successes.forEach(s => {
            console.log(`   • ${s.name}`);
            console.log(`     ${s.method} ${s.url}`);
        });
    }
    
    // Save results
    const fs = await import('fs');
    const path = await import('path');
    const outputDir = path.join(process.cwd(), 'imgupscaler_alternative_tests');
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(
        path.join(outputDir, `alternative_test_${timestamp}.json`),
        JSON.stringify({ timestamp, results }, null, 2)
    );
    
    console.log(`\n💾 Results saved to: ${outputDir}`);
}

main().catch(console.error);
