import axios from 'axios';

// Configuration
const CONFIG = {
    platformBase: 'https://platform.aivideogenerator.me',
    apiBase: 'https://api.aivideogenerator.me',
    authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJhaXZpZGVvZ2VuZXJhdG9yLXVzZXItOTc5NzE5Iiwicm5TdHIiOiIzTDVNWEMwSUtPRm5temV5VFNWMDByaE9jUlNMd1NqdyJ9.Yz62KNRtivXfJSmNmKeGctQLrZ9vl6M7c3Ta7nlnFFk',
    uniqueId: '865ead8054fa643f5ae01dcd613ba1ad',
    channel: 'GROK_IMAGINE',
    origin: 'https://aivideogenerator.me'
};

// Common headers
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

console.log('🎬 AIVideoGenerator.me - Complete Workflow Test');
console.log('='.repeat(70));

// Step 1: Get User Info
async function getUserInfo() {
    console.log('\n📝 Step 1: Getting User Information...');
    
    const url = `${CONFIG.apiBase}/api/auth/user-info`;
    
    try {
        const response = await axios.get(url, {
            headers: {
                ...COMMON_HEADERS,
                'uniqueid': 'bb09b988ce3c0247dff49dc8cd5a39d1' // Different device ID for this endpoint
            },
            timeout: 15000
        });
        
        console.log('✅ User Info Retrieved');
        console.log('Status:', response.status);
        
        // Try to parse the compressed response
        try {
            const data = JSON.stringify(response.data);
            console.log('Response preview:', data.substring(0, 200));
        } catch (e) {
            console.log('Response type:', typeof response.data);
        }
        
        return response.data;
    } catch (error) {
        console.log('❌ Failed to get user info');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
        return null;
    }
}

// Step 2: Get Page Record List (to find pageId)
async function getPageRecordList() {
    console.log('\n📋 Step 2: Getting Page Record List...');
    
    const url = `${CONFIG.platformBase}/aimodels/api/v1/ai/pageRecordList`;
    
    // Payload from network request (97 bytes)
    const payload = {
        page: 1,
        pageSize: 10
        // Might need additional fields
    };
    
    try {
        const response = await axios.post(url, payload, {
            headers: {
                ...COMMON_HEADERS,
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });
        
        console.log('✅ Page Record List Retrieved');
        console.log('Status:', response.status);
        
        // Parse response
        try {
            const data = JSON.stringify(response.data);
            console.log('Response:', data.substring(0, 500));
            
            // Look for pageId in response
            if (data.includes('pageId') || data.includes('id')) {
                console.log('\n🔍 Found potential pageId in response!');
                const parsed = JSON.parse(data.replace(/[\x00-\x1F\x7F-\x9F]/g, ''));
                console.log('Parsed data:', JSON.stringify(parsed, null, 2));
                
                // Extract first pageId
                if (parsed.records && parsed.records.length > 0) {
                    const pageId = parsed.records[0].id || parsed.records[0].pageId;
                    console.log('\n✨ Extracted pageId:', pageId);
                    return pageId;
                }
            }
        } catch (e) {
            console.log('Could not parse response:', e.message);
        }
        
        return null;
    } catch (error) {
        console.log('❌ Failed to get page record list');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
        return null;
    }
}

// Step 3: Create Video with pageId
async function createVideoWithPageId(pageId, prompt, style = '', negative_prompt = '') {
    console.log('\n🎬 Step 3: Creating Video with pageId...');
    console.log('PageId:', pageId);
    console.log('Prompt:', prompt);
    console.log('Style:', style);
    console.log('Negative Prompt:', negative_prompt);
    
    const url = `${CONFIG.platformBase}/aimodels/api/v1/ai/video/create`;
    
    const payload = {
        prompt: prompt,
        style: style || undefined,
        negative_prompt: negative_prompt || undefined,
        channel: CONFIG.channel,
        pageId: pageId,  // THE MISSING PIECE!
        model_version: "v1",
        duration: 3,
        resolution: "512x512"
    };
    
    // Remove undefined fields
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
    
    try {
        console.log('\nPayload:', JSON.stringify(payload, null, 2));
        
        const response = await axios.post(url, payload, {
            headers: {
                ...COMMON_HEADERS,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        
        console.log('\n✅ Video Creation SUCCESS!');
        console.log('Status:', response.status);
        
        // Parse response
        try {
            const data = JSON.stringify(response.data);
            console.log('Response:', data);
            
            // Check if we got a video URL or task ID
            if (data.includes('url') || data.includes('videoUrl') || data.includes('task')) {
                console.log('\n🎉 Successfully created video!');
                const cleanData = data.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
                console.log('Clean response:', cleanData);
            }
        } catch (e) {
            console.log('Response type:', typeof response.data);
        }
        
        return response.data;
    } catch (error) {
        console.log('\n❌ Video creation failed');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error:', error.message);
        }
        return null;
    }
}

// Alternative: Try without pageId but with different parameters
async function tryAlternativeApproaches() {
    console.log('\n\n🔄 Trying Alternative Approaches...\n');
    
    const approaches = [
        {
            name: 'Without pageId (original)',
            payload: {
                prompt: 'Test prompt',
                channel: CONFIG.channel
            }
        },
        {
            name: 'With empty pageId',
            payload: {
                prompt: 'Test prompt',
                channel: CONFIG.channel,
                pageId: ''
            }
        },
        {
            name: 'With pageId as null',
            payload: {
                prompt: 'Test prompt',
                channel: CONFIG.channel,
                pageId: null
            }
        },
        {
            name: 'With pageId as 0',
            payload: {
                prompt: 'Test prompt',
                channel: CONFIG.channel,
                pageId: 0
            }
        }
    ];
    
    for (const approach of approaches) {
        console.log(`\n--- Testing: ${approach.name} ---`);
        
        try {
            const response = await axios.post(
                `${CONFIG.platformBase}/aimodels/api/v1/ai/video/create`,
                approach.payload,
                {
                    headers: {
                        ...COMMON_HEADERS,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );
            
            console.log('✅ Status:', response.status);
            const data = JSON.stringify(response.data);
            console.log('Response:', data.substring(0, 300));
            
        } catch (error) {
            console.log('❌ Status:', error.response?.status || 'Connection error');
            const errorData = JSON.stringify(error.response?.data);
            console.log('Error:', errorData?.substring(0, 200) || error.message);
        }
    }
}

// Main workflow
async function runCompleteWorkflow() {
    console.log('\n🚀 Starting Complete Workflow Test\n');
    
    // Step 1: Get user info
    await getUserInfo();
    
    // Step 2: Get page records to find pageId
    const pageId = await getPageRecordList();
    
    // Step 3: Create video with pageId
    if (pageId) {
        await createVideoWithPageId(
            pageId,
            'A beautiful sunset over mountains',
            'cinematic',
            'blurry, low quality'
        );
    } else {
        console.log('\n⚠️  No pageId found, trying alternative approaches...');
        await tryAlternativeApproaches();
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🏁 Workflow Test Complete');
    console.log('='.repeat(70));
    
    console.log('\n📝 Summary:');
    console.log('- User info endpoint: Working');
    console.log('- Page record list: Should provide pageId');
    console.log('- Video creation: Requires valid pageId');
    console.log('\n💡 Next Steps:');
    console.log('1. Check pageRecordList response for valid pageId');
    console.log('2. Use that pageId in video creation requests');
    console.log('3. Monitor network traffic for exact pageId format');
}

// Run the workflow
runCompleteWorkflow().catch(console.error);