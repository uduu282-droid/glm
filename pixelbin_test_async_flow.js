import axios from 'axios';

/**
 * 🎬 Test Async Video Generation Flow
 * Maybe we need to poll for results like other AI services
 */

const CONFIG = {
    capturedPageId: '1c66a54447ddb90e045b28c491a40ae3',
    baseUrl: 'https://platform.aivideogenerator.me',
    authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJhaXZpZGVvZ2VuZXJhdG9yLXVzZXItOTc5NzE5Iiwicm5TdHIiOiIzTDVNWEMwSUtPRm5temV5VFNWMDByaE9jUlNMd1NqdyJ9.Yz62KNRtivXfJSmNmKeGctQLrZ9vl6M7c3Ta7nlnFFk',
    uniqueId: '865ead8054fa643f5ae01dcd613ba1ad',
    channel: 'GROK_IMAGINE',
    origin: 'https://aivideogenerator.me'
};

async function testAsyncFlow() {
    console.log('='.repeat(70));
    console.log('🎬 TESTING ASYNC VIDEO GENERATION FLOW');
    console.log('='.repeat(70));
    
    const prompt = "A beautiful sunset over mountains";
    const style = "cinematic";
    
    const createUrl = `${CONFIG.baseUrl}/aimodels/api/v1/ai/video/create`;
    
    const payload = {
        prompt: prompt,
        style: style,
        channel: CONFIG.channel,
        pageId: CONFIG.capturedPageId,
        model_version: "v1",
        duration: 3,
        resolution: "512x512"
    };
    
    console.log('\n📤 Step 1: Creating video generation task...');
    
    try {
        const createResponse = await axios.post(createUrl, payload, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Authorization': CONFIG.authToken,
                'Origin': CONFIG.origin,
                'Content-Type': 'application/json',
                'uniqueid': CONFIG.uniqueId
            },
            timeout: 60000,
            transformResponse: [(data) => data]
        });
        
        console.log('Create Response Status:', createResponse.status);
        
        const createData = JSON.parse(createResponse.data);
        console.log('Create Response:', JSON.stringify(createData, null, 2));
        
        // Check if we got a task ID or similar
        if (createData.data && createData.data.taskId) {
            console.log('\n✅ Got task ID:', createData.data.taskId);
            console.log('📋 Step 2: Polling for video completion...\n');
            
            const taskId = createData.data.taskId;
            const pollUrl = `${CONFIG.baseUrl}/aimodels/api/v1/ai/video/result?taskId=${taskId}`;
            
            // Poll for results
            for (let i = 1; i <= 30; i++) {
                console.log(`Poll #${i}...`);
                
                try {
                    const pollResponse = await axios.get(pollUrl, {
                        headers: {
                            'Authorization': CONFIG.authToken,
                            'uniqueid': CONFIG.uniqueId
                        },
                        timeout: 30000
                    });
                    
                    console.log('Status:', pollResponse.status);
                    console.log('Response:', JSON.stringify(pollResponse.data, null, 2));
                    
                    // Check if video is ready
                    if (pollResponse.data.code === 200 || 
                        (pollResponse.data.data && pollResponse.data.data.url)) {
                        console.log('\n🎉 SUCCESS! Video is ready!');
                        console.log('🎬 VIDEO URL:', pollResponse.data.data.url);
                        return true;
                    }
                    
                    // Check if still processing
                    if (pollResponse.data.data && 
                        pollResponse.data.data.status === 'processing') {
                        console.log('⏳ Still processing, waiting 5 seconds...\n');
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        continue;
                    }
                    
                } catch (error) {
                    console.log('Poll error:', error.message);
                }
            }
            
            console.log('\n⏰ Timeout - video not ready after 30 polls');
            
        } else if (createData.code === 410003) {
            console.log('\n⚠️  Backend returned 410003 - Server exception');
            console.log('This might mean the backend service is actually down/broken');
        } else {
            console.log('\nℹ️  No task ID in response');
            console.log('The API might work differently than expected');
        }
        
    } catch (error) {
        console.log('❌ Create error:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data.toString());
        }
    }
    
    return false;
}

testAsyncFlow().catch(console.error);
