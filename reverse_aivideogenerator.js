import axios from 'axios';

// Configuration extracted from network requests
const CONFIG = {
    baseUrl: 'https://platform.aivideogenerator.me',
    authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJhaXZpZGVvZ2VuZXJhdG9yLXVzZXItOTc5NzE5Iiwicm5TdHIiOiIzTDVNWEMwSUtPRm5temV5VFNWMDByaE9jUlNMd1NqdyJ9.Yz62KNRtivXfJSmNmKeGctQLrZ9vl6M7c3Ta7nlnFFk',
    uniqueId: '865ead8054fa643f5ae01dcd613ba1ad',
    channel: 'GROK_IMAGINE',
    origin: 'https://aivideogenerator.me',
    modelId: 'af548e1bec9c141716e13e8b5443e065'
};

// Common headers for all requests
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
    'sec-fetch-site': 'same-site',
    'priority': 'u=1, i',
    'uniqueid': CONFIG.uniqueId
};

console.log('🎬 AIVideoGenerator.me Platform - Reverse Engineering Analysis');
console.log('='.repeat(70));
console.log('\n📋 Extracted Configuration:');
console.log('Base URL:', CONFIG.baseUrl);
console.log('Auth Token:', CONFIG.authToken.substring(0, 50) + '...');
console.log('Unique ID:', CONFIG.uniqueId);
console.log('Channel:', CONFIG.channel);
console.log('Model ID:', CONFIG.modelId);
console.log('Origin:', CONFIG.origin);
console.log('\n' + '='.repeat(70));

// Test 1: GET Model Information
async function testGetModelInfo() {
    console.log('\n🧪 Test 1: GET Model Information');
    
    const url = `${CONFIG.baseUrl}/aimodels/api/v1/ai/${CONFIG.modelId}`;
    
    try {
        const response = await axios.get(url, {
            headers: COMMON_HEADERS,
            params: {
                channel: CONFIG.channel
            },
            timeout: 15000
        });
        
        console.log('✅ SUCCESS');
        console.log('Status:', response.status);
        console.log('Response (compressed):', typeof response.data);
        console.log('Headers received:', Object.keys(response.headers).length);
        
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

// Test 2: POST Create Video
async function testCreateVideo(prompt, style = '', negative_prompt = '') {
    console.log('\n🧪 Test 2: CREATE VIDEO');
    console.log('Prompt:', prompt);
    console.log('Style:', style);
    console.log('Negative Prompt:', negative_prompt);
    
    const url = `${CONFIG.baseUrl}/aimodels/api/v1/ai/video/create`;
    
    // Payload structure (285 bytes content-length from original request)
    const payload = {
        prompt: prompt,
        style: style || undefined,
        negative_prompt: negative_prompt || undefined,
        channel: CONFIG.channel,
        model_version: "v1",
        duration: 3,
        resolution: "512x512"
    };
    
    // Remove undefined fields
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
    
    try {
        console.log('\nPayload:', JSON.stringify(payload, null, 2));
        console.log('Payload size:', JSON.stringify(payload).length, 'bytes');
        
        const response = await axios.post(url, payload, {
            headers: {
                ...COMMON_HEADERS,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        
        console.log('\n✅ SUCCESS');
        console.log('Status:', response.status);
        console.log('Response type:', typeof response.data);
        
        // Try to parse the response
        try {
            const responseData = JSON.stringify(response.data);
            console.log('Response preview:', responseData.substring(0, 300));
        } catch (e) {
            console.log('Raw response length:', response.data?.length || 'unknown');
        }
        
        return response.data;
    } catch (error) {
        console.log('\n❌ FAILED');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
            console.log('Headers sent:', JSON.stringify(error.config.headers, null, 2));
        } else {
            console.log('Error:', error.message);
        }
        return null;
    }
}

// Test 3: Compare with previous platform
async function testPlatformComparison() {
    console.log('\n\n🔄 Testing Platform Comparison\n');
    
    const platforms = [
        {
            name: 'AIVideoGenerator.me (NEW)',
            baseUrl: 'https://platform.aivideogenerator.me',
            token: CONFIG.authToken
        },
        {
            name: 'TattooIdea.ai (PREVIOUS)',
            baseUrl: 'https://aiplatform.tattooidea.ai',
            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJncm9raW1hZ2luZWFpLmNvbS11c2VyLTc2MDg2MiIsInJuU3RyIjoid3JxVjNNUVR6QmNWTHBjMVJJMUJ0MnJHWjV4V0djbE4ifQ.lu79hPMu1eey_5tMB-gOUOryMvb4f3IT8lOXdX0Rrow'
        }
    ];
    
    for (const platform of platforms) {
        console.log(`\n--- Testing ${platform.name} ---`);
        console.log('Base:', platform.baseUrl);
        
        try {
            const response = await axios.get(
                `${platform.baseUrl}/aimodels/api/v1/ai/${CONFIG.modelId}`,
                {
                    headers: {
                        ...COMMON_HEADERS,
                        'Authorization': platform.token
                    },
                    params: { channel: CONFIG.channel },
                    timeout: 15000
                }
            );
            
            console.log('✅ Status:', response.status);
            console.log('Server:', response.headers.server || 'Unknown');
            console.log('CF-Ray:', response.headers['cf-ray'] || 'N/A');
            
        } catch (error) {
            if (error.response) {
                console.log('❌ Status:', error.response.status);
                console.log('Error:', error.response.data);
            } else {
                console.log('❌ Error:', error.message);
            }
        }
    }
}

// Test 4: Different video creation scenarios
async function testVideoScenarios() {
    console.log('\n\n🎬 Testing Different Video Scenarios\n');
    
    const scenarios = [
        {
            name: 'Simple Sunset',
            prompt: 'A beautiful sunset over mountains',
            style: '',
            negative: ''
        },
        {
            name: 'Cyberpunk City',
            prompt: 'Futuristic city with flying cars, neon lights, rain',
            style: 'cyberpunk',
            negative: 'blurry, low quality'
        },
        {
            name: 'Ocean Waves',
            prompt: 'Peaceful ocean waves crashing on sandy beach',
            style: 'realistic',
            negative: 'cartoon, anime'
        },
        {
            name: 'Space Scene',
            prompt: 'Astronaut floating in space with Earth in background',
            style: 'cinematic',
            negative: 'blurry'
        }
    ];
    
    for (const scenario of scenarios) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Scenario: ${scenario.name}`);
        console.log('='.repeat(60));
        
        await testCreateVideo(
            scenario.prompt,
            scenario.style,
            scenario.negative
        );
        
        // Wait between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

// Main execution
async function runCompleteAnalysis() {
    console.log('\n🚀 Starting Complete API Analysis\n');
    
    // Test 1: Get model information
    console.log('\n' + '='.repeat(70));
    console.log('TEST 1: Model Information Retrieval');
    console.log('='.repeat(70));
    await testGetModelInfo();
    
    // Test 2: Create video with simple prompt
    console.log('\n' + '='.repeat(70));
    console.log('TEST 2: Basic Video Creation');
    console.log('='.repeat(70));
    await testCreateVideo('A beautiful sunset over mountains');
    
    // Test 3: Platform comparison
    console.log('\n' + '='.repeat(70));
    console.log('TEST 3: Platform Comparison');
    console.log('='.repeat(70));
    await testPlatformComparison();
    
    // Test 4: Different scenarios
    console.log('\n' + '='.repeat(70));
    console.log('TEST 4: Video Creation Scenarios');
    console.log('='.repeat(70));
    await testVideoScenarios();
    
    console.log('\n' + '='.repeat(70));
    console.log('🏁 Analysis Complete');
    console.log('='.repeat(70));
    
    console.log('\n📝 FINAL API DOCUMENTATION:\n');
    console.log('Platform: AIVideoGenerator.me');
    console.log('Base URL:', CONFIG.baseUrl);
    console.log('Auth Token:', CONFIG.authToken);
    console.log('Unique ID:', CONFIG.uniqueId);
    console.log('Channel:', CONFIG.channel);
    console.log('Model ID:', CONFIG.modelId);
    
    console.log('\n🔑 Key Differences from Previous Platform:');
    console.log('- Different domain: platform.aivideogenerator.me');
    console.log('- New JWT token with different user ID');
    console.log('- Same API structure and endpoints');
    console.log('- Still uses Cloudflare protection');
    console.log('- Same compression (zstd) for responses');
}

// Run the analysis
runCompleteAnalysis().catch(console.error);