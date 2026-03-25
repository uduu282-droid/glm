import axios from 'axios';

/**
 * 🔍 Quick API Test
 * Verify the video generation API is accessible
 */

const CONFIG = {
    baseUrl: 'https://platform.aivideogenerator.me',
    authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJhaXZpZGVvZ2VuZXJhdG9yLXVzZXItOTc5NzE5Iiwicm5TdHIiOiIzTDVNWEMwSUtPRm5temV5VFNWMDByaE9jUlNMd1NqdyJ9.Yz62KNRtivXfJSmNmKeGctQLrZ9vl6M7c3Ta7nlnFFk',
    uniqueId: '865ead8054fa643f5ae01dcd613ba1ad',
    channel: 'GROK_IMAGINE',
    origin: 'https://aivideogenerator.me'
};

function getHeaders() {
    return {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Authorization': CONFIG.authToken,
        'Origin': CONFIG.origin,
        'Referer': `${CONFIG.origin}/`,
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'uniqueid': CONFIG.uniqueId
    };
}

async function testAPI() {
    console.log('🔍 Testing Pixelbin Video Generator API...\n');
    
    // Test 1: Simple video creation
    console.log('Test 1: Basic API connectivity');
    console.log('-'.repeat(50));
    
    try {
        const response = await axios.post(
            `${CONFIG.baseUrl}/aimodels/api/v1/ai/video/create`,
            {
                prompt: 'A simple test',
                channel: CONFIG.channel,
                duration: 1,
                resolution: '512x512'
            },
            {
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ SUCCESS!');
        console.log('Status:', response.status);
        console.log('Response received:', typeof response.data);
        console.log('\nFirst 200 chars of response:');
        console.log(JSON.stringify(response.data).substring(0, 200) + '...');
        
        return true;
        
    } catch (error) {
        console.log('❌ FAILED');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error message:', error.response.data?.message || 'Unknown error');
            
            // Analyze the error
            if (error.response.data?.message?.includes('pageId')) {
                console.log('\n💡 Analysis: API requires pageId parameter');
                console.log('   This is expected - the API needs a valid session from the website.');
            } else if (error.response.data?.message?.includes('HC verification')) {
                console.log('\n💡 Analysis: Human verification required');
                console.log('   The API requires captcha completion on the website.');
            } else if (error.response.data?.message?.includes('email')) {
                console.log('\n💡 Analysis: Email verification needed');
                console.log('   Account registration/login required.');
            }
        } else if (error.code === 'ECONNABORTED') {
            console.log('❌ Request timed out');
            console.log('   Check your internet connection');
        } else {
            console.log('Error:', error.message);
        }
        
        return false;
    }
}

async function testAlternativeProvider() {
    console.log('\n' + '='.repeat(50));
    console.log('Test 2: Alternative provider (GrokImagine)');
    console.log('-'.repeat(50));
    
    const altConfig = {
        baseUrl: 'https://aiplatform.tattooidea.ai',
        authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJncm9raW1hZ2luZWFpLmNvbS11c2VyLTc2MDg2MiIsInJuU3RyIjoid3JxVjNNUVR6QmNWTHBjMVJJMUJ0MnJHWjV4V0djbE4ifQ.lu79hPMu1eey_5tMB-gOUOryMvb4f3IT8lOXdX0Rrow',
        uniqueId: '865ead8054fa643f5ae01dcd613ba1ad',
        channel: 'GROK_IMAGINE',
        origin: 'https://grokimagineai.com'
    };
    
    try {
        const response = await axios.post(
            `${altConfig.baseUrl}/aimodels/api/v1/ai/video/create`,
            {
                prompt: 'A simple test',
                channel: altConfig.channel,
                duration: 1,
                resolution: '512x512'
            },
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': '*/*',
                    'Authorization': altConfig.authToken,
                    'Origin': altConfig.origin,
                    'Referer': `${altConfig.origin}/`,
                    'uniqueid': altConfig.uniqueId,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ Alternative provider accessible!');
        console.log('Status:', response.status);
        
        return true;
        
    } catch (error) {
        console.log('❌ Alternative provider also failed');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error:', error.response.data?.message);
        } else {
            console.log('Error:', error.message);
        }
        
        return false;
    }
}

async function main() {
    console.log('='.repeat(50));
    console.log('🎬 PIXELBIN VIDEO GENERATOR - API TEST');
    console.log('='.repeat(50));
    console.log();
    
    const result1 = await testAPI();
    const result2 = await testAlternativeProvider();
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Main provider (AIVideoGenerator): ${result1 ? '⚠️ Accessible (may need pageId)' : '❌ Failed'}`);
    console.log(`Alt provider (GrokImagine):      ${result2 ? '⚠️ Accessible (may need pageId)' : '❌ Failed'}`);
    console.log();
    
    if (!result1 && !result2) {
        console.log('💡 RECOMMENDATION:');
        console.log('   Both providers require additional authentication.');
        console.log('   You may need to:');
        console.log('   1. Visit the websites to generate valid sessions');
        console.log('   2. Use browser automation (Puppeteer)');
        console.log('   3. Implement proper login flow');
    } else {
        console.log('✅ APIs are accessible!');
        console.log('💡 Note: You may still need pageId or email verification for actual video generation.');
    }
    
    console.log('='.repeat(50));
    console.log('\nTry the interactive tool:');
    console.log('  node pixelbin_video_generator.js\n');
}

main().catch(console.error);
