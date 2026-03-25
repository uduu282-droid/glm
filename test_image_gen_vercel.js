import fetch from 'node-fetch';

async function testImageGenVercelAPI() {
    console.log('🧪 Testing Image Gen Vercel API: image-gen-eosin.vercel.app');
    console.log('========================================================\n');
    
    const baseUrl = 'https://image-gen-eosin.vercel.app';
    
    // Test the edit-image endpoint (POST request)
    const editEndpoint = {
        name: 'Image Gen Vercel - Edit Image',
        url: `${baseUrl}/edit-image`,
        method: 'POST',
        body: {
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
            prompt: 'Turn this landscape into a watercolor painting',
            model: 'gemini-2.5-flash-image-preview',
            imageCount: 1
        }
    };
    
    console.log(`Testing: ${editEndpoint.name}`);
    console.log(`URL: ${editEndpoint.url}`);
    console.log(`Method: ${editEndpoint.method}`);
    console.log(`Body:`, JSON.stringify(editEndpoint.body, null, 2));
    
    try {
        const response = await fetch(editEndpoint.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify(editEndpoint.body)
        });
        
        console.log(`\nStatus: ${response.status} ${response.statusText}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        
        const text = await response.text();
        console.log(`Response preview: ${text.substring(0, 500)}...`);
        
        if (response.ok) {
            console.log('✅ SUCCESS: API response received');
            try {
                const jsonData = JSON.parse(text);
                console.log('Parsed JSON response:', JSON.stringify(jsonData, null, 2));
                
                if (jsonData.session_id && jsonData.workflow_id) {
                    console.log('✅ Async image generation initiated');
                    console.log(`Session ID: ${jsonData.session_id}`);
                    console.log(`Workflow ID: ${jsonData.workflow_id}`);
                    console.log('Note: Use /track-session endpoint to monitor progress');
                    return {
                        success: true,
                        session_id: jsonData.session_id,
                        workflow_id: jsonData.workflow_id
                    };
                }
            } catch (e) {
                console.log('Response is not JSON, treating as success');
                return { success: true, response: text.substring(0, 200) };
            }
        } else {
            console.log(`❌ FAILED: ${response.status}`);
            return { success: false, error: text.substring(0, 200) };
        }
        
    } catch (error) {
        console.log(`❌ REQUEST FAILED: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Run the test
testImageGenVercelAPI().then(result => {
    console.log('\n' + '='.repeat(50));
    if (result.success) {
        console.log('🎉 Image Gen Vercel API Test: SUCCESS');
        if (result.session_id) {
            console.log(`Session ID: ${result.session_id}`);
            console.log(`Workflow ID: ${result.workflow_id}`);
        }
    } else {
        console.log('❌ Image Gen Vercel API Test: FAILED');
        console.log(`Error: ${result.error}`);
    }
}).catch(error => {
    console.error('Test execution failed:', error);
});