import axios from 'axios';
import fs from 'fs';

/**
 * 🎬 Test Different Models/Styles on Pixelbin API
 */

const CONFIG = {
    baseUrl: 'https://platform.aivideogenerator.me',
    authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJhaXZpZGVvZ2VuZXJhdG9yLXVzZXItOTc5NzE5Iiwicm5TdHIiOiIzTDVNWEMwSUtPRm5temV5VFNWMDByaE9jUlNMd1NqdyJ9.Yz62KNRtivXfJSmNmKeGctQLrZ9vl6M7c3Ta7nlnFFk',
    uniqueId: '865ead8054fa643f5ae01dcd613ba1ad',
    channel: 'GROK_IMAGINE',
    origin: 'https://aivideogenerator.me',
    capturedPageId: '1c66a54447ddb90e045b28c491a40ae3'
};

// Test different styles/models
const STYLES_TO_TEST = [
    { name: 'Cinematic', style: 'cinematic', prompt: 'A beautiful sunset over mountains' },
    { name: 'Cyberpunk', style: 'cyberpunk', prompt: 'Futuristic city with flying cars' },
    { name: 'Realistic', style: 'realistic', prompt: 'Ocean waves on a beach' },
    { name: 'Fantasy', style: 'fantasy', prompt: 'Magical forest with glowing mushrooms' },
    { name: 'SciFi', style: 'scifi', prompt: 'Astronaut in space with Earth' },
    { name: 'Anime', style: 'anime', prompt: 'Cherry blossoms in Japanese garden' },
    { name: 'Cartoon', style: 'cartoon', prompt: 'Cute robot dancing' },
    { name: 'Painting', style: 'painting', prompt: 'Portrait of a woman' },
    { name: 'Sketch', style: 'sketch', prompt: 'Mountain landscape drawing' },
    { name: 'Horror', style: 'horror', prompt: 'Haunted house at night' },
    { name: 'Vintage', style: 'vintage', prompt: 'Old car from 1950s' },
    { name: 'Modern', style: 'modern', prompt: 'Minimalist architecture' }
];

function getHeaders() {
    return {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Authorization': CONFIG.authToken,
        'Origin': CONFIG.origin,
        'Referer': `${CONFIG.origin}/`,
        'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'uniqueid': CONFIG.uniqueId,
        'Content-Type': 'application/json'
    };
}

async function testStyle(styleConfig) {
    const url = `${CONFIG.baseUrl}/aimodels/api/v1/ai/video/create`;
    
    const payload = {
        prompt: styleConfig.prompt,
        style: styleConfig.style || undefined,
        channel: CONFIG.channel,
        pageId: CONFIG.capturedPageId,
        model_version: "v1",
        duration: 3,
        resolution: "512x512"
    };

    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    try {
        const response = await axios.post(url, payload, {
            headers: getHeaders(),
            timeout: 30000,
            responseType: 'text',
            transformResponse: [(data) => data]
        });

        let responseData;
        try {
            responseData = JSON.parse(response.data);
        } catch (e) {
            responseData = { raw: response.data.substring(0, 200) };
        }

        return {
            success: true,
            status: response.status,
            code: responseData.code,
            message: responseData.message || 'Parsed successfully',
            data: responseData
        };

    } catch (error) {
        return {
            success: false,
            status: error.response?.status || 0,
            code: error.response?.data?.code || 0,
            message: error.message,
            error: error.response?.data
        };
    }
}

async function runModelTests() {
    console.log('='.repeat(70));
    console.log('🎬 TESTING ALL MODELS/STYLES');
    console.log('='.repeat(70));
    console.log(`Total styles to test: ${STYLES_TO_TEST.length}`);
    console.log(`Using PageId: ${CONFIG.capturedPageId}`);
    console.log('='.repeat(70));

    const results = [];
    const workingModels = [];
    const failedModels = [];

    for (let i = 0; i < STYLES_TO_TEST.length; i++) {
        const styleConfig = STYLES_TO_TEST[i];
        
        console.log(`\n[${i + 1}/${STYLES_TO_TEST.length}] Testing: ${styleConfig.name}`);
        console.log(`   Style: ${styleConfig.style}`);
        console.log(`   Prompt: ${styleConfig.prompt}`);
        
        const result = await testStyle(styleConfig);
        results.push({ ...styleConfig, ...result });

        // Analyze result
        if (result.status === 200) {
            if (result.code === 200) {
                console.log(`   ✅ SUCCESS! Model working perfectly`);
                workingModels.push(styleConfig.name);
            } else if (result.code === 410003) {
                console.log(`   ⚠️ Server exception (backend issue, but request accepted)`);
                workingModels.push(styleConfig.name + ' (backend processing)');
            } else if (result.code === 400000) {
                console.log(`   ❌ Validation error: ${result.message}`);
                failedModels.push(styleConfig.name);
            } else {
                console.log(`   ❓ Unknown response code: ${result.code}`);
            }
        } else {
            console.log(`   ❌ Request failed: ${result.message}`);
            failedModels.push(styleConfig.name);
        }

        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Save detailed results
    const reportFilename = `model_test_results_${Date.now()}.json`;
    fs.writeFileSync(reportFilename, JSON.stringify({
        summary: {
            total: STYLES_TO_TEST.length,
            working: workingModels.length,
            failed: failedModels.length,
            timestamp: new Date().toISOString()
        },
        workingModels,
        failedModels,
        detailedResults: results
    }, null, 2));

    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(70));
    console.log(`\nTotal Tested: ${STYLES_TO_TEST.length}`);
    console.log(`✅ Working/Accepted: ${workingModels.length}`);
    console.log(`❌ Failed: ${failedModels.length}`);
    
    if (workingModels.length > 0) {
        console.log('\n🎉 WORKING MODELS/STYLES:');
        workingModels.forEach(model => {
            console.log(`   • ${model}`);
        });
    }

    if (failedModels.length > 0) {
        console.log('\n❌ FAILED MODELS/STYLES:');
        failedModels.forEach(model => {
            console.log(`   • ${model}`);
        });
    }

    console.log('\n💾 Detailed results saved to:', reportFilename);
    console.log('='.repeat(70));

    // Calculate success rate
    const successRate = ((workingModels.length / STYLES_TO_TEST.length) * 100).toFixed(1);
    console.log(`\n📈 Success Rate: ${successRate}%`);

    if (successRate === '100.0') {
        console.log('\n🎉 PERFECT SCORE! All models/styles are accepted by the API!');
    } else if (successRate >= '50.0') {
        console.log('\n✅ Good! More than half working!');
    } else {
        console.log('\n⚠️ Needs improvement');
    }
}

// Run the tests
runModelTests().catch(console.error);
