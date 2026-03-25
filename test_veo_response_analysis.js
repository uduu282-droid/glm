import axios from 'axios';
import * as zlib from 'zlib';

console.log('🔍 VEO AI - Deep Response Analysis');
console.log('='.repeat(70));

const CONFIG = {
    baseUrl: 'https://veoaifree.com',
    ajaxUrl: 'https://veoaifree.com/wp-admin/admin-ajax.php',
    referer: 'https://veoaifree.com/3d-ai-video-generator/',
    action: 'veo_video_generator'
};

async function getDetailedResponse() {
    console.log('\n📝 Step 1: Getting nonce...');
    
    const pageResponse = await axios.get(CONFIG.baseUrl + '/3d-ai-video-generator/');
    const nonce = pageResponse.data.match(/nonce['"]\s*:\s*['"]([^'"]+)['"]/)[1];
    console.log('✅ Nonce:', nonce);
    
    console.log('\n🎬 Step 2: Sending request with detailed response capture...\n');
    
    const formData = new URLSearchParams();
    formData.append('action', CONFIG.action);
    formData.append('nonce', nonce);
    formData.append('prompt', 'A beautiful sunset over mountains');
    formData.append('totalVariations', '1');
    formData.append('aspectRatio', '16:9');
    
    try {
        // Use axios with response type set to arraybuffer to get raw data
        const response = await axios.post(CONFIG.ajaxUrl, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': CONFIG.referer,
                'Origin': CONFIG.baseUrl,
                'Accept-Encoding': 'gzip, deflate, br, zstd'
            },
            responseType: 'arraybuffer',
            timeout: 60000,
            transformResponse: [(data) => data] // Don't transform, get raw buffer
        });
        
        console.log('✅ Status:', response.status);
        console.log('✅ Headers:', JSON.stringify(response.headers, null, 2));
        
        // Get raw buffer
        const rawData = response.data;
        console.log('\n📊 Raw Data Info:');
        console.log('Type:', typeof rawData);
        console.log('Is Buffer:', Buffer.isBuffer(rawData));
        console.log('Length:', rawData.length, 'bytes');
        
        // Try to decompress based on content-encoding
        const encoding = response.headers['content-encoding'];
        console.log('\n📦 Content-Encoding:', encoding || 'none');
        
        let decompressedData;
        
        if (encoding === 'zstd') {
            console.log('\n🔄 Attempting zstd decompression...');
            try {
                // Note: Node.js doesn't have built-in zstd, show raw data instead
                console.log('⚠️  zstd decompression not available in standard Node.js');
                console.log('Raw bytes (first 500):', rawData.toString('hex').substring(0, 500));
            } catch (e) {
                console.log('Decompression failed:', e.message);
            }
        } else if (encoding === 'gzip') {
            console.log('\n🔄 Attempting gzip decompression...');
            decompressedData = zlib.gunzipSync(rawData);
        } else if (encoding === 'br') {
            console.log('\n🔄 Attempting brotli decompression...');
            decompressedData = zlib.brotliDecompressSync(rawData);
        } else {
            console.log('\nℹ️  No compression detected, using raw data');
            decompressedData = rawData;
        }
        
        // Convert to string and display
        if (decompressedData) {
            const textData = decompressedData.toString('utf8');
            console.log('\n📄 Decompressed Content:');
            console.log('Length:', textData.length, 'characters');
            console.log('─'.repeat(70));
            console.log(textData.substring(0, 2000));
            console.log('─'.repeat(70));
            
            // Check if it's JSON
            try {
                const json = JSON.parse(textData);
                console.log('\n✅ Valid JSON detected!');
                console.log('Parsed JSON:', JSON.stringify(json, null, 2).substring(0, 1000));
            } catch (e) {
                console.log('\n❌ Not valid JSON');
                
                // Check if it's HTML
                if (textData.trim().startsWith('<')) {
                    console.log('\nℹ️  Content appears to be HTML');
                    console.log('HTML preview:', textData.substring(0, 500));
                }
            }
        }
        
        return response.data;
        
    } catch (error) {
        console.log('\n❌ Request failed');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Headers:', JSON.stringify(error.response.headers, null, 2));
            console.log('Data:', error.response.data.toString('utf8').substring(0, 500));
        } else {
            console.log('Error:', error.message);
        }
        return null;
    }
}

// Also try with different approach - maybe it returns data asynchronously
async function testWithPolling() {
    console.log('\n\n🔄 Testing Polling Approach (if async)\n');
    
    const pageResponse = await axios.get(CONFIG.baseUrl + '/3d-ai-video-generator/');
    const nonce = pageResponse.data.match(/nonce['"]\s*:\s*['"]([^'"]+)['"]/)[1];
    
    const formData = new URLSearchParams();
    formData.append('action', CONFIG.action);
    formData.append('nonce', nonce);
    formData.append('prompt', 'Test prompt for polling');
    formData.append('totalVariations', '1');
    formData.append('aspectRatio', '16:9');
    
    const response = await axios.post(CONFIG.ajaxUrl, formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': CONFIG.referer
        },
        timeout: 60000
    });
    
    console.log('Initial Response Status:', response.status);
    console.log('Initial Response:', JSON.stringify(response.data).substring(0, 200));
    
    // Maybe we need to poll for results?
    console.log('\n⏳ Waiting 5 seconds then checking for results...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Try same request again to see if status changed
    const checkResponse = await axios.post(CONFIG.ajaxUrl, formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': CONFIG.referer
        },
        timeout: 60000
    });
    
    console.log('Check Response Status:', checkResponse.status);
    console.log('Check Response:', JSON.stringify(checkResponse.data).substring(0, 200));
}

// Main execution
async function runAnalysis() {
    console.log('\n🚀 Starting Deep Response Analysis\n');
    
    // Get detailed response
    await getDetailedResponse();
    
    // Test polling approach
    await testWithPolling();
    
    console.log('\n' + '='.repeat(70));
    console.log('🏁 Analysis Complete');
    console.log('='.repeat(70));
    
    console.log('\n📝 Findings:');
    console.log('✅ API accepts requests (Status 200)');
    console.log('⚠️  Response is empty or compressed in non-standard way');
    console.log('💡 Possible reasons:');
    console.log('   1. Response uses zstd compression (not supported in Node.js natively)');
    console.log('   2. API may return data via WebSocket or different endpoint');
    console.log('   3. May need to poll for results asynchronously');
    console.log('   4. Could require browser session/cookies');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Monitor browser Network tab while generating video');
    console.log('2. Look for additional requests after initial POST');
    console.log('3. Check if video appears via WebSocket or SSE');
    console.log('4. Try with Puppeteer to capture full browser behavior');
}

runAnalysis().catch(console.error);