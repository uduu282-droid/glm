import axios from 'axios';

/**
 * 🎬 Enhanced Video Generator with PageId Handling
 * Attempts multiple strategies to generate videos
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
        'uniqueid': CONFIG.uniqueId,
        'Content-Type': 'application/json'
    };
}

// Try common pageId patterns
const TEST_PAGE_IDS = [
    'test-page-001',
    'default-page',
    'main-page',
    'video-generator',
    'home-page',
    Math.random().toString(36).substring(2, 15), // Random string
    Date.now().toString(36), // Timestamp-based
    'page-' + Date.now()
];

async function tryGetPageRecordList() {
    console.log('\n📋 Attempting to get valid pageId from pageRecordList...\n');
    
    try {
        const response = await axios.post(
            `${CONFIG.baseUrl}/aimodels/api/v1/ai/pageRecordList`,
            { page: 1, pageSize: 10 },
            {
                headers: getHeaders(),
                timeout: 15000
            }
        );
        
        console.log('✅ pageRecordList Response:', JSON.stringify(response.data, null, 2));
        
        // Try to extract a valid pageId from response
        if (response.data && response.data.data) {
            const records = response.data.data.records || response.data.data;
            if (Array.isArray(records) && records.length > 0) {
                const pageId = records[0].pageId || records[0].id;
                if (pageId) {
                    console.log(`\n✨ Found valid pageId: ${pageId}`);
                    return pageId;
                }
            }
        }
        
        return null;
    } catch (error) {
        console.log('❌ pageRecordList failed:', error.response?.data?.message || error.message);
        return null;
    }
}

async function tryVideoWithPageId(prompt, pageId, style = '') {
    console.log(`\n🎬 Trying with pageId: ${pageId}`);
    
    const payload = {
        prompt: prompt,
        style: style || undefined,
        channel: CONFIG.channel,
        pageId: pageId,
        model_version: "v1",
        duration: 3,
        resolution: "512x512"
    };

    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    try {
        const response = await axios.post(
            `${CONFIG.baseUrl}/aimodels/api/v1/ai/video/create`,
            payload,
            {
                headers: getHeaders(),
                timeout: 60000
            }
        );

        console.log('✅ SUCCESS with pageId!');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        return { success: true, data: response.data, pageId };
    } catch (error) {
        console.log('❌ Failed with this pageId:', error.response?.data?.message || error.message);
        return { success: false, error: error.message, pageId };
    }
}

async function tryVideoWithoutPageId(prompt, style = '') {
    console.log('\n🎬 Trying WITHOUT pageId (basic attempt)...');
    
    const payload = {
        prompt: prompt,
        style: style || undefined,
        channel: CONFIG.channel,
        model_version: "v1",
        duration: 3,
        resolution: "512x512"
    };

    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    try {
        const response = await axios.post(
            `${CONFIG.baseUrl}/aimodels/api/v1/ai/video/create`,
            payload,
            {
                headers: getHeaders(),
                timeout: 60000
            }
        );

        console.log('✅ Response received!');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        // Check if we got actual video data
        if (response.data && response.data.code === 200) {
            console.log('\n🎉 VIDEO GENERATION SUCCESSFUL!');
            return { success: true, data: response.data };
        } else {
            console.log('\n⚠️ API returned error:', response.data?.message);
            return { success: false, error: response.data?.message };
        }
    } catch (error) {
        console.log('❌ Request failed:', error.response?.data?.message || error.message);
        return { success: false, error: error.message };
    }
}

async function enhancedGenerate(prompt, style = '') {
    console.log('='.repeat(70));
    console.log('🎬 ENHANCED VIDEO GENERATION - MULTI-STRATEGY TEST');
    console.log('='.repeat(70));
    console.log(`Prompt: ${prompt}`);
    console.log(`Style: ${style}`);
    console.log('='.repeat(70));

    // Strategy 1: Try to get pageId from pageRecordList
    console.log('\n--- STRATEGY 1: Fetch pageId from API ---');
    let validPageId = await tryGetPageRecordList();
    
    if (validPageId) {
        console.log('\n--- STRATEGY 1B: Use fetched pageId ---');
        const result = await tryVideoWithPageId(prompt, validPageId, style);
        if (result.success) {
            console.log('\n✅ SUCCESS! Video generated with fetched pageId.');
            return result;
        }
    }

    // Strategy 2: Try common pageId patterns
    console.log('\n--- STRATEGY 2: Try common pageId patterns ---');
    for (const testPageId of TEST_PAGE_IDS) {
        const result = await tryVideoWithPageId(prompt, testPageId, style);
        if (result.success) {
            console.log(`\n✅ SUCCESS! Video generated with pageId: ${testPageId}`);
            return result;
        }
        // Wait 1 second between attempts
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Strategy 3: Try without pageId (in case it's optional sometimes)
    console.log('\n--- STRATEGY 3: Basic attempt without pageId ---');
    const basicResult = await tryVideoWithoutPageId(prompt, style);
    if (basicResult.success) {
        console.log('\n✅ SUCCESS! Video generated without explicit pageId.');
        return basicResult;
    }

    // All strategies failed
    console.log('\n' + '='.repeat(70));
    console.log('❌ ALL STRATEGIES FAILED');
    console.log('='.repeat(70));
    console.log('\n💡 CONCLUSION:');
    console.log('   This API strictly requires a valid pageId from an active web session.');
    console.log('\n📋 RECOMMENDED SOLUTIONS:');
    console.log('   1. Visit https://aivideogenerator.me in browser');
    console.log('   2. Complete any required registration/login');
    console.log('   3. Use browser DevTools to capture a valid pageId');
    console.log('   4. Or use browser automation (Puppeteer) to maintain session');
    console.log('='.repeat(70));

    return { success: false, error: 'All strategies failed - pageId required' };
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
🎬 Enhanced Video Generator - Multi-Strategy Test

Usage:
  node pixelbin_enhanced_test.js [prompt] [style]

Examples:
  node pixelbin_enhanced_test.js "A beautiful sunset" cinematic
  node pixelbin_enhanced_test.js "Cyberpunk city" cyberpunk
`);
        process.exit(0);
    }

    const prompt = args[0] || "A beautiful sunset over mountains";
    const style = args[1] || "";

    await enhancedGenerate(prompt, style);
}

main().catch(console.error);
