import axios from 'axios';
import zlib from 'zlib';
import util from 'util';

const CONFIG = {
    baseUrl: 'https://platform.aivideogenerator.me',
    authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJhaXZpZGVvZ2VuZXJhdG9yLXVzZXItOTc5NzE5Iiwicm5TdHIiOiIzTDVNWEMwSUtPRm5temV5VFNWMDByaE9jUlNMd1NqdyJ9.Yz62KNRtivXfJSmNmKeGctQLrZ9vl6M7c3Ta7nlnFFk',
    uniqueId: '865ead8054fa643f5ae01dcd613ba1ad',
    channel: 'GROK_IMAGINE',
    origin: 'https://aivideogenerator.me',
    capturedPageId: '1c66a54447ddb90e045b28c491a40ae3'
};

function getHeaders() {
    return {
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
        'uniqueid': CONFIG.uniqueId,
        'Content-Type': 'application/json'
    };
}

async function generateVideoWithDecompression(prompt, style = '') {
    console.log('='.repeat(70));
    console.log('🎬 GENERATING VIDEO WITH DECOMPRESSION');
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

    try {
        console.log('\n📤 Sending request...');
        
        const response = await axios.post(url, payload, {
            headers: getHeaders(),
            timeout: 60000,
            responseType: 'arraybuffer', // Get raw binary data
            decompress: true // Let axios try to decompress
        });

        console.log('\n✅ HTTP Status:', response.status);
        console.log('Response Headers:', JSON.stringify(response.headers, null, 2));
        
        // Try to decompress manually if needed
        let responseData;
        const rawData = response.data;
        
        console.log('\nRaw data size:', rawData.byteLength, 'bytes');
        
        // Try different decompression methods
        try {
            // Try zstd first (what the API uses)
            console.log('\nAttempting zstd decompression...');
            const decompressed = zlib.brotliDecompressSync(rawData); // zstd uses brotli in Node.js
            responseData = JSON.parse(decompressed.toString());
            console.log('✅ ZSTD Decompression successful!');
        } catch (e1) {
            try {
                // Try gzip
                console.log('Attempting gzip decompression...');
                const decompressed = zlib.gunzipSync(rawData);
                responseData = JSON.parse(decompressed.toString());
                console.log('✅ Gzip decompression successful!');
            } catch (e2) {
                try {
                    // Try deflate
                    console.log('Attempting deflate decompression...');
                    const decompressed = zlib.inflateRawSync(rawData);
                    responseData = JSON.parse(decompressed.toString());
                    console.log('✅ Deflate decompression successful!');
                } catch (e3) {
                    // Maybe it's already JSON
                    console.log('Attempting direct JSON parse...');
                    responseData = JSON.parse(rawData.toString());
                    console.log('✅ Already JSON (no decompression needed)!');
                }
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('📊 DECOMPRESSED RESPONSE');
        console.log('='.repeat(70));
        console.log(JSON.stringify(responseData, null, 2));

        // Check if we got a video URL or task ID
        if (responseData.code === 200 || responseData.data) {
            console.log('\n🎉 SUCCESS! Video generation initiated!');
            
            if (responseData.data && responseData.data.url) {
                console.log('\n🎬 VIDEO URL:', responseData.data.url);
            }
            if (responseData.data && responseData.data.taskId) {
                console.log('📋 Task ID:', responseData.data.taskId);
            }
        } else {
            console.log('\n⚠️ API returned:', responseData.message || responseData.code);
        }

        return { success: true, data: responseData };

    } catch (error) {
        console.log('\n❌ Request failed');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Headers:', JSON.stringify(error.response.headers, null, 2));
            
            if (error.response.data) {
                console.log('\nError response (raw):', error.response.data);
                
                // Try to decompress error response
                try {
                    const decompressed = zlib.brotliDecompressSync(error.response.data);
                    console.log('\nDecompressed error:', decompressed.toString());
                } catch (e) {
                    console.log('Could not decompress error response');
                }
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

    await generateVideoWithDecompression(prompt, style);
}

main().catch(console.error);
