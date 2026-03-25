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
    'priority': 'u=1, i',
    'uniqueid': CONFIG.uniqueId
};

console.log('🎬 GrokImagine AI Video Generation API - Reverse Engineering');
console.log('='.repeat(60));

// Test video creation with proper channel parameter
async function testCreateVideoWithChannel(prompt, style = '', negative_prompt = '') {
    console.log('\n🧪 Creating Video...');
    console.log('Prompt:', prompt);
    console.log('Style:', style);
    console.log('Negative Prompt:', negative_prompt);
    
    const url = `${CONFIG.baseUrl}/aimodels/api/v1/ai/video/create`;
    
    // Payload with channel parameter
    const payload = {
        prompt: prompt,
        style: style || undefined,
        negative_prompt: negative_prompt || undefined,
        channel: CONFIG.channel,  // Add required channel parameter
        model_version: "v1",
        duration: 3,
        resolution: "512x512"
    };
    
    // Remove undefined fields
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
    
    try {
        console.log('\nPayload:', JSON.stringify(payload, null, 2));
        
        const response = await axios.post(url, payload, {
            headers: COMMON_HEADERS,
            timeout: 30000
        });
        
        console.log('\n✅ SUCCESS');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
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

// Alternative endpoint test - maybe there's a different structure
async function testAlternativeEndpoints() {
    console.log('\n\n🔍 Testing Alternative Endpoints\n');
    
    const endpoints = [
        {
            method: 'GET',
            url: `${CONFIG.baseUrl}/aimodels/api/v1/ai/ad7be746bd7898647c69321a69f7a93b`,
            params: { channel: CONFIG.channel },
            description: 'Get AI Model Info'
        },
        {
            method: 'POST',
            url: `${CONFIG.baseUrl}/aimodels/api/v1/ai/video/generate`,
            data: {
                prompt: 'Test',
                channel: CONFIG.channel
            },
            description: 'Alternative video generation endpoint'
        },
        {
            method: 'POST',
            url: `${CONFIG.baseUrl}/aimodels/api/v1/ai/image/create`,
            data: {
                prompt: 'Test image',
                channel: CONFIG.channel
            },
            description: 'Image creation endpoint'
        }
    ];
    
    for (const endpoint of endpoints) {
        console.log(`\n--- ${endpoint.description} ---`);
        console.log(`${endpoint.method} ${endpoint.url}`);
        
        try {
            let response;
            if (endpoint.method === 'GET') {
                response = await axios.get(endpoint.url, {
                    headers: COMMON_HEADERS,
                    params: endpoint.params,
                    timeout: 15000
                });
            } else {
                response = await axios.post(endpoint.url, endpoint.data, {
                    headers: COMMON_HEADERS,
                    timeout: 15000
                });
            }
            
            console.log('✅ Status:', response.status);
            console.log('Response preview:', JSON.stringify(response.data).substring(0, 200));
            
        } catch (error) {
            if (error.response) {
                console.log('❌ Status:', error.response.status);
                console.log('Error preview:', JSON.stringify(error.response.data).substring(0, 200));
            } else {
                console.log('❌ Error:', error.message);
            }
        }
    }
}

// Test with different channel values
async function testDifferentChannels() {
    console.log('\n\n📺 Testing Different Channel Values\n');
    
    const channels = [
        'GROK_IMAGINE',
        'GROK_VIDEO',
        'DEFAULT',
        'WEB',
        'MOBILE'
    ];
    
    for (const channel of channels) {
        console.log(`\nTesting channel: ${channel}`);
        
        const payload = {
            prompt: 'A beautiful sunset',
            channel: channel
        };
        
        try {
            const response = await axios.post(
                `${CONFIG.baseUrl}/aimodels/api/v1/ai/video/create`,
                payload,
                {
                    headers: {
                        ...COMMON_HEADERS,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );
            
            console.log(`✅ ${channel}: Status ${response.status}`);
            const responseData = JSON.stringify(response.data);
            if (!responseData.includes('channel is required')) {
                console.log('Response:', responseData.substring(0, 300));
            }
            
        } catch (error) {
            if (error.response) {
                const errorMsg = JSON.stringify(error.response.data);
                if (!errorMsg.includes('channel is required')) {
                    console.log(`❌ ${channel}: Status ${error.response.status}`);
                    console.log('Response:', errorMsg.substring(0, 200));
                } else {
                    console.log(`❌ ${channel}: Still requires channel parameter`);
                }
            } else {
                console.log(`❌ ${channel}: Connection error`);
            }
        }
    }
}

// Main execution
async function runCompleteAnalysis() {
    console.log('\n🚀 Starting Complete API Analysis\n');
    
    // Test 1: Try video creation with channel
    console.log('\n' + '='.repeat(60));
    console.log('TEST 1: Video Creation with Channel Parameter');
    console.log('='.repeat(60));
    await testCreateVideoWithChannel('A beautiful sunset over mountains');
    
    // Test 2: Try different channels
    console.log('\n' + '='.repeat(60));
    console.log('TEST 2: Different Channel Values');
    console.log('='.repeat(60));
    await testDifferentChannels();
    
    // Test 3: Explore alternative endpoints
    console.log('\n' + '='.repeat(60));
    console.log('TEST 3: Alternative Endpoints');
    console.log('='.repeat(60));
    await testAlternativeEndpoints();
    
    console.log('\n' + '='.repeat(60));
    console.log('🏁 Analysis Complete');
    console.log('='.repeat(60));
    
    console.log('\n📝 FINAL API DOCUMENTATION:\n');
    console.log('Base URL:', CONFIG.baseUrl);
    console.log('Auth Token:', CONFIG.authToken);
    console.log('Unique ID:', CONFIG.uniqueId);
    console.log('Required Channel:', CONFIG.channel);
    console.log('\nKey Findings:');
    console.log('1. Channel parameter is REQUIRED in the payload');
    console.log('2. HC verification may also be required');
    console.log('3. Multiple endpoints available for different operations');
    console.log('4. Responses are compressed (zstd encoding)');
}

// Run the analysis
runCompleteAnalysis().catch(console.error);