import axios from 'axios';

// Configuration extracted from network requests
const CONFIG = {
    baseUrl: 'https://aiplatform.tattooidea.ai',
    authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJncm9raW1hZ2luZWFpLmNvbS11c2VyLTc2MDg2MiIsInJuU3RyIjoid3JxVjNNUVR6QmNWTHBjMVJJMUJ0MnJHWjV4V0djbE4ifQ.lu79hPMu1eey_5tMB-gOUOryMvb4f3IT8lOXdX0Rrow',
    uniqueId: '865ead8054fa643f5ae01dcd613ba1ad',
    channel: 'GROK_IMAGINE',
    origin: 'https://grokimagineai.com'
};

// Headers common to all requests
const COMMON_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Authorization': CONFIG.authToken,
    'Origin': CONFIG.origin,
    'Referer': `${CONFIG.origin}/`,
    'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'priority': 'u=1, i'
};

console.log('🔍 Reverse Engineering Analysis - GrokImagine AI Platform');
console.log('='.repeat(60));
console.log('\n📋 Extracted Configuration:');
console.log('Base URL:', CONFIG.baseUrl);
console.log('Auth Token:', CONFIG.authToken.substring(0, 50) + '...');
console.log('Unique ID:', CONFIG.uniqueId);
console.log('Channel:', CONFIG.channel);
console.log('Origin:', CONFIG.origin);
console.log('\n' + '='.repeat(60));

// Test 1: GET request to retrieve AI model data
async function testGetAIModel() {
    console.log('\n🧪 Test 1: GET AI Model Data');
    
    const url = `${CONFIG.baseUrl}/aimodels/api/v1/ai/ad7be746bd7898647c69321a69f7a93b`;
    
    try {
        const response = await axios.get(url, {
            headers: {
                ...COMMON_HEADERS,
                'uniqueid': CONFIG.uniqueId
            },
            params: {
                channel: CONFIG.channel
            },
            timeout: 15000
        });
        
        console.log('✅ SUCCESS');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.log('❌ FAILED');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
        return null;
    }
}

// Test 2: GET user information
async function testGetUserInfo() {
    console.log('\n🧪 Test 2: GET User Information');
    
    const url = `${CONFIG.baseUrl}/user/api/v1/user/getUserInfo`;
    
    try {
        const response = await axios.get(url, {
            headers: {
                ...COMMON_HEADERS,
                'uniqueid': CONFIG.uniqueId
            },
            timeout: 15000
        });
        
        console.log('✅ SUCCESS');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.log('❌ FAILED');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
        return null;
    }
}

// Test 3: POST request to create video (this is the main endpoint)
async function testCreateVideo(prompt, style = '', negative_prompt = '') {
    console.log('\n🧪 Test 3: CREATE VIDEO');
    console.log('Prompt:', prompt);
    console.log('Style:', style);
    console.log('Negative Prompt:', negative_prompt);
    
    const url = `${CONFIG.baseUrl}/aimodels/api/v1/ai/video/create`;
    
    // Payload structure (reverse engineered from the 323 bytes content-length)
    const payload = {
        prompt: prompt,
        style: style,
        negative_prompt: negative_prompt,
        // Additional fields that might be needed:
        // model_version: "v1",
        // duration: 3,
        // resolution: "512x512",
        // seed: -1,
        // guidance_scale: 7.5,
        // num_inference_steps: 50
    };
    
    try {
        const response = await axios.post(url, payload, {
            headers: {
                ...COMMON_HEADERS,
                'Content-Type': 'application/json',
                'uniqueid': CONFIG.uniqueId
            },
            timeout: 30000
        });
        
        console.log('✅ SUCCESS');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.log('❌ FAILED');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error:', error.response.data);
            console.log('Headers sent:', JSON.stringify(error.config.headers, null, 2));
            console.log('Payload sent:', JSON.stringify(payload, null, 2));
        } else {
            console.log('Error:', error.message);
        }
        return null;
    }
}

// Test 4: Try different video creation parameters
async function testVideoCreationVariants() {
    console.log('\n🎬 Testing Video Creation with Different Parameters\n');
    
    const testCases = [
        {
            name: 'Simple prompt',
            prompt: 'A beautiful sunset over mountains',
            style: '',
            negative_prompt: ''
        },
        {
            name: 'Detailed prompt with style',
            prompt: 'A futuristic city with flying cars, cyberpunk style',
            style: 'cyberpunk',
            negative_prompt: 'blurry, low quality'
        },
        {
            name: 'Character animation',
            prompt: 'A cute robot dancing in the rain',
            style: 'cartoon',
            negative_prompt: 'distorted, ugly'
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n--- Test Case: ${testCase.name} ---`);
        await testCreateVideo(
            testCase.prompt,
            testCase.style,
            testCase.negative_prompt
        );
        console.log('\n');
    }
}

// Main execution
async function runAllTests() {
    console.log('\n🚀 Starting API Reverse Engineering Tests\n');
    
    // Test authentication and basic endpoints first
    const userInfo = await testGetUserInfo();
    if (!userInfo) {
        console.log('\n⚠️  Authentication might be invalid. Continuing anyway...');
    }
    
    // Test AI model retrieval
    const aiModel = await testGetAIModel();
    
    // Test video creation with various prompts
    await testVideoCreationVariants();
    
    console.log('\n' + '='.repeat(60));
    console.log('🏁 All tests completed');
    console.log('='.repeat(60));
    
    console.log('\n📝 API Documentation Summary:');
    console.log('1. Base URL:', CONFIG.baseUrl);
    console.log('2. Auth Header: Authorization: Bearer <JWT_TOKEN>');
    console.log('3. Required Header: uniqueid: <DEVICE_ID>');
    console.log('4. Channel Parameter: channel=GROK_IMAGINE');
    console.log('5. Main Endpoint: POST /aimodels/api/v1/ai/video/create');
    console.log('6. Payload Format: JSON with prompt, style, negative_prompt');
}

// Run the tests
runAllTests().catch(console.error);