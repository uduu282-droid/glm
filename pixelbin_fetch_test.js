/**
 * 🎬 Video Generator Using Native Fetch
 * Better compression handling with native HTTP
 */

const CONFIG = {
    baseUrl: 'https://platform.aivideogenerator.me',
    authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJhaXZpZGVvZ2VuZXJhdG9yLXVzZXItOTc5NzE5Iiwicm5TdHIiOiIzTDVNWEMwSUtPRm5temV5VFNWMDByaE9jUlNMd1NqdyJ9.Yz62KNRtivXfJSmNmKeGctQLrZ9vl6M7c3Ta7nlnFFk',
    uniqueId: '865ead8054fa643f5ae01dcd613ba1ad',
    channel: 'GROK_IMAGINE',
    origin: 'https://aivideogenerator.me',
    capturedPageId: '1c66a54447ddb90e045b28c491a40ae3'
};

async function generateVideo(prompt, style = '') {
    console.log('='.repeat(70));
    console.log('🎬 GENERATING VIDEO (Native Fetch)');
    console.log('='.repeat(70));
    console.log(`Prompt: ${prompt}`);
    console.log(`Style: ${style}`);
    console.log(`PageId: ${CONFIG.capturedPageId}`);
    console.log('='.repeat(70));

    const url = `${CONFIG.baseUrl}/aimodels/api/v1/ai/video/create`;
    
    const payload = {
        prompt: prompt,
        style: style || undefined,
        channel: CONFIG.channel,
        pageId: CONFIG.capturedPageId,
        model_version: "v1",
        duration: 3,
        resolution: "512x512"
    };

    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    const headers = {
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
        'Content-Type': 'application/json',
        'uniqueid': CONFIG.uniqueId
    };

    try {
        console.log('\n📤 Sending request...');
        console.log('Payload:', JSON.stringify(payload, null, 2));
        
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        console.log('\n✅ Response Status:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));

        // Get response as text first
        const responseText = await response.text();
        console.log('\n📄 Raw Response Text:');
        console.log(responseText.substring(0, 500));

        // Try to parse as JSON
        try {
            const responseData = JSON.parse(responseText);
            console.log('\n' + '='.repeat(70));
            console.log('📊 PARSED JSON RESPONSE');
            console.log('='.repeat(70));
            console.log(JSON.stringify(responseData, null, 2));

            if (responseData.code === 200 || (responseData.data && !responseData.message)) {
                console.log('\n🎉 SUCCESS! Video generation initiated!');
                
                if (responseData.data) {
                    console.log('\n📋 Response Data:', JSON.stringify(responseData.data, null, 2));
                    
                    if (responseData.data.url) {
                        console.log('\n🎬 VIDEO URL:', responseData.data.url);
                    }
                    if (responseData.data.taskId) {
                        console.log('📋 Task ID:', responseData.data.taskId);
                    }
                }
            } else {
                console.log('\n⚠️ API returned error:', responseData.message || responseData.code);
            }

            return { success: true, data: responseData };
        } catch (e) {
            console.log('\n❌ Could not parse JSON:', e.message);
            console.log('Response might be compressed or malformed.');
            return { success: false, error: 'Could not parse response', raw: responseText };
        }

    } catch (error) {
        console.log('\n❌ Request failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Main
async function main() {
    const args = process.argv.slice(2);
    const prompt = args[0] || "A beautiful sunset over mountains";
    const style = args[1] || "";

    await generateVideo(prompt, style);
}

main().catch(console.error);
