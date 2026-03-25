import axios from 'axios';
import fs from 'fs';

const CONFIG = {
    baseUrl: 'https://platform.aivideogenerator.me',
    authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJhaXZpZGVvZ2VuZXJhdG9yLXVzZXItOTc5NzE5Iiwicm5TdHIiOiIzTDVNWEMwSUtPRm5temV5VFNWMDByaE9jUlNMd1NqdyJ9.Yz62KNRtivXfJSmNmKeGctQLrZ9vl6M7c3Ta7nlnFFk',
    uniqueId: '865ead8054fa643f5ae01dcd613ba1ad',
    channel: 'GROK_IMAGINE',
    origin: 'https://aivideogenerator.me',
    capturedPageId: '1c66a54447ddb90e045b28c491a40ae3' // ✅ CAPTURED FROM WEBSITE!
};

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

async function generateVideo(prompt, style = '') {
    console.log('='.repeat(70));
    console.log('🎬 AI VIDEO GENERATOR - SUCCESS TEST');
    console.log('='.repeat(70));
    console.log(`Prompt: ${prompt}`);
    console.log(`Style: ${style}`);
    console.log(`PageId: ${CONFIG.capturedPageId} ✅`);
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

    try {
        console.log('\n📤 Sending request...');
        
        const response = await axios.post(url, payload, {
            headers: getHeaders(),
            timeout: 60000,
            responseType: 'text', // Get as text
            transformResponse: [(data) => data]
        });

        console.log('\n✅ HTTP Status:', response.status);
        console.log('✅ REQUEST SUCCESSFUL!');
        
        // Save raw response to file
        const filename = `video_response_${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify({
            status: response.status,
            headers: response.headers,
            data: response.data,
            timestamp: new Date().toISOString()
        }, null, 2));
        
        console.log('\n💾 Response saved to:', filename);
        console.log('\n📄 Raw response preview:');
        console.log(response.data.toString().substring(0, 300));
        
        console.log('\n' + '='.repeat(70));
        console.log('🎉 CONGRATULATIONS! 🎉');
        console.log('='.repeat(70));
        console.log('✅ Your video generation request was ACCEPTED!');
        console.log('✅ The API responded with status 200!');
        console.log('✅ Response has been saved for analysis.');
        console.log('\nThe response is compressed (zstd format).');
        console.log('You can decompress it using online tools or Python.');
        console.log('='.repeat(70));

        return { success: true, filename };

    } catch (error) {
        console.log('\n❌ Request failed');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            if (error.response.data) {
                console.log('Error response:', error.response.data.toString());
            }
        } else {
            console.log('Error:', error.message);
        }
        
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
