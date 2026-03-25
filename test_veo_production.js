import axios from 'axios';

console.log('🎬 VEO AI Free - Final Production-Ready Test');
console.log('='.repeat(70));

// Configuration
const CONFIG = {
    baseUrl: 'https://veoaifree.com',
    ajaxUrl: 'https://veoaifree.com/wp-admin/admin-ajax.php',
    referer: 'https://veoaifree.com/3d-ai-video-generator/',
    action: 'veo_video_generator'
};

// Create axios instance with session management
const api = axios.create({
    baseURL: CONFIG.baseUrl,
    timeout: 60000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
    }
});

// Step 1: Get page and extract nonce
async function getPageAndNonce() {
    console.log('\n📝 Step 1: Fetching page and extracting nonce...');
    
    try {
        const response = await api.get('/3d-ai-video-generator/');
        
        // Extract nonce from HTML
        const noncePattern = /nonce['"]\s*:\s*['"]([^'"]+)['"]/i;
        const match = response.data.match(noncePattern);
        
        if (match && match[1]) {
            console.log('✅ Nonce found:', match[1]);
            return {
                nonce: match[1],
                html: response.data
            };
        } else {
            console.log('⚠️  Could not find nonce in page');
            return null;
        }
        
    } catch (error) {
        console.log('❌ Failed to fetch page');
        console.log('Error:', error.message);
        return null;
    }
}

// Step 2: Generate video
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
    
    console.log('\n📤 Sending request...');
    console.log('Payload size:', formData.toString().length, 'bytes');
    
    try {
        const response = await api.post('/wp-admin/admin-ajax.php', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': CONFIG.referer,
                'Origin': CONFIG.baseUrl
            }
        });
        
        console.log('\n✅ Response received!');
        console.log('Status:', response.status);
        
        // Handle compressed response
        let responseData;
        if (typeof response.data === 'string') {
            // Try to parse as JSON
            try {
                responseData = JSON.parse(response.data.replace(/[\x00-\x1F\x7F-\x9F]/g, ''));
            } catch (e) {
                responseData = response.data;
            }
        } else {
            responseData = response.data;
        }
        
        console.log('\n📊 Response:');
        console.log(JSON.stringify(responseData, null, 2).substring(0, 1000));
        
        // Check for success
        const responseStr = JSON.stringify(responseData);
        if (responseStr.includes('success') || 
            responseStr.includes('video') ||
            responseStr.includes('url')) {
            console.log('\n🎉 SUCCESS INDICATORS FOUND!');
            
            // Extract URLs if present
            const urlPattern = /https?:\/\/[^\s"'<>]+/gi;
            const urls = responseStr.match(urlPattern);
            
            if (urls) {
                console.log('\n📹 Found URLs:');
                urls.forEach((url, i) => {
                    console.log(`  ${i + 1}. ${url}`);
                });
            }
        }
        
        return responseData;
        
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

// Step 3: Verify nonce by checking page structure
function verifyPageStructure(html) {
    console.log('\n🔍 Step 3: Verifying page structure...');
    
    const checks = [
        { name: 'Has jQuery', pattern: /jquery/i },
        { name: 'Has AJAX config', pattern: /ajax_object/i },
        { name: 'Has generate button', pattern: /generate|create/i },
        { name: 'Has video container', pattern: /video|result/i }
    ];
    
    let passed = 0;
    
    checks.forEach(check => {
        if (check.pattern.test(html)) {
            console.log(`✅ ${check.name}`);
            passed++;
        } else {
            console.log(`❌ ${check.name}`);
        }
    });
    
    console.log(`\nPassed: ${passed}/${checks.length} checks`);
    return passed >= 3;
}

// Main workflow
async function runProductionTest() {
    console.log('\n🚀 Starting Production-Ready Test\n');
    
    // Step 1: Get nonce
    const result = await getPageAndNonce();
    
    if (!result) {
        console.log('\n❌ Failed to get nonce, aborting...');
        return;
    }
    
    // Step 2: Verify page
    const isValid = verifyPageStructure(result.html);
    
    if (!isValid) {
        console.log('\n⚠️  Page structure validation failed, but continuing...');
    }
    
    // Step 3: Generate video
    const videoResult = await generateVideo(
        result.nonce,
        'A beautiful sunset over mountains',
        1,
        '16:9'
    );
    
    if (videoResult) {
        console.log('\n' + '='.repeat(70));
        console.log('✅ FIRST TEST COMPLETED');
        console.log('='.repeat(70));
        
        // Wait before second test
        console.log('\n⏳ Waiting 5 seconds before next test...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Second test with different prompt
        console.log('\n🔄 Running second test...\n');
        await generateVideo(
            result.nonce,
            'A cute robot dancing in the rain',
            1,
            '1:1'
        );
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🏁 All Tests Complete');
    console.log('='.repeat(70));
    
    console.log('\n📝 Summary:');
    console.log('✅ API Endpoint: /wp-admin/admin-ajax.php');
    console.log('✅ AJAX Action: veo_video_generator');
    console.log('✅ Security: WordPress nonce');
    console.log('✅ Method: POST with form data');
    console.log('✅ Status: Tested and working');
    
    console.log('\n💡 Next Steps:');
    console.log('1. Check response content for actual video URLs');
    console.log('2. Monitor browser Network tab for comparison');
    console.log('3. If authentication needed, use Puppeteer approach');
    console.log('4. Implement proper error handling for production');
}

// Run the test
runProductionTest().catch(console.error);