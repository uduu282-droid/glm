import axios from 'axios';
import pkg from 'zstd-codec';
const { ZSTDCodec } = pkg;

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
    console.log('🎬 AI VIDEO GENERATOR - FINAL WORKING VERSION');
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
        console.log('Payload:', JSON.stringify(payload, null, 2));
        
        const response = await axios.post(url, payload, {
            headers: getHeaders(),
            timeout: 60000,
            responseType: 'arraybuffer',
            transformResponse: [(data) => {
                // Don't let axios auto-decompress, we'll do it manually
                return data;
            }]
        });

        console.log('\n✅ HTTP Status:', response.status);
        
        // Initialize ZSTD codec
        const zstd = new ZSTDCodec();
        await zstd.init();

        // Decompress zstd
        const compressedData = new Uint8Array(response.data);
        console.log('Compressed size:', compressedData.length, 'bytes');
        
        const decompressedData = zstd.decode(compressedData);
        const jsonString = new TextDecoder().decode(decompressedData);
        
        console.log('\n' + '='.repeat(70));
        console.log('📊 DECOMPRESSED RESPONSE');
        console.log('='.repeat(70));
        
        const responseData = JSON.parse(jsonString);
        console.log(JSON.stringify(responseData, null, 2));

        // Analyze response
        if (responseData.code === 200) {
            console.log('\n🎉🎉🎉 SUCCESS! VIDEO GENERATED! 🎉🎉🎉');
            
            if (responseData.data) {
                console.log('\n📋 Video Data:');
                Object.entries(responseData.data).forEach(([key, value]) => {
                    console.log(`  • ${key}: ${value}`);
                });
                
                if (responseData.data.url || responseData.data.videoUrl) {
                    console.log('\n🎬 YOUR VIDEO URL:');
                    console.log(responseData.data.url || responseData.data.videoUrl);
                }
                
                if (responseData.data.taskId) {
                    console.log('\n📋 Task ID:', responseData.data.taskId);
                    console.log('You can use this to check generation status');
                }
            }
        } else if (responseData.message) {
            console.log('\n⚠️ API Response:', responseData.message);
            console.log('Code:', responseData.code);
        }

        return { success: true, data: responseData };

    } catch (error) {
        console.log('\n❌ Request failed');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error data:', error.response.data.toString());
        } else {
            console.log('Error:', error.message);
        }
        
        return { success: false, error: error.message };
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
🎬 AI Video Generator - Final Version

Usage:
  node pixelbin_final.js "Your prompt" [style]

Examples:
  node pixelbin_final.js "A beautiful sunset over mountains"
  node pixelbin_final.js "Cyberpunk city at night" cyberpunk
  node pixelbin_final.js "Ocean waves" realistic
`);
        process.exit(0);
    }

    const prompt = args[0] || "A beautiful sunset over mountains";
    const style = args[1] || "";

    await generateVideo(prompt, style);
}

main().catch(console.error);
