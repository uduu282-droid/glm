import axios from 'axios';

console.log('🎬 VEO AI Free - Complete Working Test');
console.log('='.repeat(70));

// Configuration
const CONFIG = {
    baseUrl: 'https://veoaifree.com',
    ajaxUrl: 'https://veoaifree.com/wp-admin/admin-ajax.php',
    referer: 'https://veoaifree.com/3d-ai-video-generator/',
    action: 'veo_video_generator'  // DISCOVERED ACTION!
};

// Common headers
const COMMON_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': CONFIG.referer,
    'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"'
};

// Step 1: Get nonce from page
async function getNonce() {
    console.log('\n📝 Step 1: Getting nonce from page...');
    
    try {
        const response = await axios.get(CONFIG.baseUrl + '/3d-ai-video-generator/', {
            headers: COMMON_HEADERS,
            timeout: 15000
        });
        
        const html = response.data;
        
        // Look for ajax_object with nonce
        const noncePattern = /ajax_object\s*=\s*{\s*[^}]*nonce['"]\s*:\s*['"]([^'"]+)['"]/i;
        const match = html.match(noncePattern);
        
        if (match && match[1]) {
            console.log('✅ Nonce found:', match[1]);
            return match[1];
        } else {
            console.log('⚠️  Could not find nonce in page HTML');
            
            // Try alternative patterns
            const altPatterns = [
                /"nonce"\s*:\s*"([^"]+)"/i,
                /'nonce'\s*:\s*'([^']+)'/i,
                /data-nonce=["']([^"']+)["']/i
            ];
            
            for (const pattern of altPatterns) {
                const altMatch = html.match(pattern);
                if (altMatch && altMatch[1]) {
                    console.log('✅ Found nonce with alternative pattern:', altMatch[1]);
                    return altMatch[1];
                }
            }
            
            return null;
        }
        
    } catch (error) {
        console.log('❌ Failed to get nonce');
        console.log('Error:', error.message);
        return null;
    }
}

// Step 2: Generate video using discovered parameters
async function generateVideo(nonce, prompt, variations = 1, aspectRatio = '16:9') {
    console.log('\n🎬 Step 2: Generating video...');
    console.log('Prompt:', prompt);
    console.log('Variations:', variations);
    console.log('Aspect Ratio:', aspectRatio);
    console.log('Nonce:', nonce);
    
    // Build form data exactly as the website does
    const formData = new URLSearchParams();
    formData.append('action', CONFIG.action);
    formData.append('nonce', nonce);
    formData.append('prompt', prompt);
    formData.append('totalVariations', variations.toString());
    formData.append('aspectRatio', aspectRatio);
    
    try {
        console.log('\nSending request...');
        console.log('Payload:', formData.toString());
        
        const response = await axios.post(CONFIG.ajaxUrl, formData, {
            headers: COMMON_HEADERS,
            timeout: 60000  // Video generation takes time
        });
        
        console.log('\n✅ Response received!');
        console.log('Status:', response.status);
        
        const responseData = typeof response.data === 'string' 
            ? response.data 
            : JSON.stringify(response.data);
        
        console.log('\nResponse content:');
        console.log(responseData.substring(0, 1000));
        
        // Check for success indicators
        if (responseData.includes('success') || 
            responseData.includes('video') ||
            responseData.includes('url')) {
            console.log('\n🎉 POTENTIAL SUCCESS!');
            
            // Try to extract video URL or result
            const urlPattern = /https?:\/\/[^\s"'<>]+/gi;
            const urls = responseData.match(urlPattern);
            
            if (urls) {
                console.log('\n📹 Found URLs in response:');
                urls.forEach((url, i) => {
                    console.log(`  ${i + 1}. ${url}`);
                });
            }
        }
        
        return response.data;
        
    } catch (error) {
        console.log('\n❌ Video generation failed');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response:', 
                typeof error.response.data === 'string'
                    ? error.response.data.substring(0, 500)
                    : JSON.stringify(error.response.data).substring(0, 500)
            );
        } else {
            console.log('Error:', error.message);
        }
        
        return null;
    }
}

// Step 3: Alternative - Use FormData (as found in script)
async function generateVideoWithFormData(nonce, prompt) {
    console.log('\n\n🔄 Alternative: Using FormData approach...\n');
    
    const formData = new FormData();
    formData.append('action', CONFIG.action);
    formData.append('nonce', nonce);
    formData.append('prompt', prompt);
    formData.append('totalVariations', '1');
    
    try {
        const response = await axios.post(CONFIG.ajaxUrl, formData, {
            headers: {
                ...COMMON_HEADERS,
                'Content-Type': 'multipart/form-data'
            },
            timeout: 60000
        });
        
        console.log('✅ Status:', response.status);
        console.log('Response:', 
            typeof response.data === 'string'
                ? response.data.substring(0, 500)
                : JSON.stringify(response.data).substring(0, 500)
        );
        
        return response.data;
        
    } catch (error) {
        console.log('❌ Failed');
        console.log('Error:', error.response?.data || error.message);
        return null;
    }
}

// Main execution
async function runCompleteTest() {
    console.log('\n🚀 Starting Complete VEO AI Test\n');
    
    // Step 1: Get nonce
    const nonce = await getNonce();
    
    if (!nonce) {
        console.log('\n⚠️  No nonce found, trying without it...');
        
        // Try anyway without nonce (might work if not validated server-side)
        await generateVideo('', 'A beautiful sunset over mountains');
    } else {
        // Step 2: Generate video
        await generateVideo(
            nonce,
            'A beautiful sunset over mountains',
            1,
            '16:9'
        );
        
        // Wait between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try another prompt
        await generateVideo(
            nonce,
            'A cute robot dancing in the rain',
            1,
            '1:1'
        );
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🏁 Test Complete');
    console.log('='.repeat(70));
    
    console.log('\n📝 Summary:');
    console.log('✅ Discovered AJAX action: veo_video_generator');
    console.log('✅ Requires nonce: Yes (from ajax_object.nonce)');
    console.log('✅ Required fields:');
    console.log('   - action: veo_video_generator');
    console.log('   - nonce: (dynamic from page)');
    console.log('   - prompt: (your text)');
    console.log('   - totalVariations: (number)');
    console.log('   - aspectRatio: (e.g., 16:9, 1:1, 9:16)');
    
    console.log('\n💡 Next Steps:');
    console.log('1. Open browser DevTools on veoaifree.com');
    console.log('2. Go to Network tab');
    console.log('3. Click the generate button on the website');
    console.log('4. Watch the admin-ajax.php request');
    console.log('5. Copy exact parameters from that request');
}

// Run the test
runCompleteTest().catch(console.error);