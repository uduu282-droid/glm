import axios from 'axios';

/**
 * 🎬 Test with Browser-like Headers
 * Maybe the website sends additional data we're missing
 */

const CONFIG = {
    capturedPageId: '1c66a54447ddb90e045b28c491a40ae3',
    baseUrl: 'https://platform.aivideogenerator.me',
    authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJhaXZpZGVvZ2VuZXJhdG9yLXVzZXItOTc5NzE5Iiwicm5TdHIiOiIzTDVNWEMwSUtPRm5temV5VFNWMDByaE9jUlNMd1NqdyJ9.Yz62KNRtivXfJSmNmKeGctQLrZ9vl6M7c3Ta7nlnFFk',
    uniqueId: '865ead8054fa643f5ae01dcd613ba1ad',
    channel: 'GROK_IMAGINE',
    origin: 'https://aivideogenerator.me'
};

async function testWithBrowserHeaders() {
    console.log('='.repeat(70));
    console.log('🎬 TESTING WITH BROWSER-LIKE HEADERS');
    console.log('='.repeat(70));
    
    const prompt = "A beautiful sunset over mountains";
    const style = "cinematic";
    
    const url = `${CONFIG.baseUrl}/aimodels/api/v1/ai/video/create`;
    
    const payload = {
        prompt: prompt,
        style: style,
        channel: CONFIG.channel,
        pageId: CONFIG.capturedPageId,
        model_version: "v1",
        duration: 3,
        resolution: "512x512"
    };
    
    // Try with different header combinations
    const testCases = [
        {
            name: 'Current Headers (Our Standard)',
            headers: {
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
            }
        },
        {
            name: 'Simplified Headers (Like Real Browser)',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Authorization': CONFIG.authToken,
                'Origin': CONFIG.origin,
                'Referer': `${CONFIG.origin}/`,
                'Content-Type': 'application/json',
                'uniqueid': CONFIG.uniqueId
            }
        },
        {
            name: 'Minimal Headers (Just Essentials)',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
                'Authorization': CONFIG.authToken,
                'Content-Type': 'application/json',
                'uniqueid': CONFIG.uniqueId
            }
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n--- Testing: ${testCase.name} ---`);
        
        try {
            const response = await axios.post(url, payload, {
                headers: testCase.headers,
                timeout: 60000,
                transformResponse: [(data) => data]
            });
            
            console.log('Status:', response.status);
            
            try {
                const data = JSON.parse(response.data);
                console.log('Response:', JSON.stringify(data, null, 2));
                
                if (data.code === 200 || (data.data && data.data.url)) {
                    console.log('✅ SUCCESS! Got video URL!');
                    if (data.data.url) {
                        console.log('🎬 VIDEO:', data.data.url);
                    }
                    return true;
                } else if (data.code === 410003) {
                    console.log('⚠️  Backend error (same as before)');
                } else {
                    console.log('ℹ️  Different response code:', data.code);
                }
            } catch (e) {
                console.log('Raw response:', response.data.toString().substring(0, 200));
            }
            
        } catch (error) {
            console.log('Error:', error.message);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay between tests
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('Testing complete. No video URL received.');
    console.log('='.repeat(70));
    
    return false;
}

testWithBrowserHeaders().catch(console.error);
