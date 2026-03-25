import axios from 'axios';

/**
 * 🎬 PageId Pattern Tester
 * Test various pageId formats to find working ones
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

// More realistic pageId patterns based on common web conventions
const PAGE_ID_PATTERNS = [
    // UUID format
    '550e8400-e29b-41d4-a716-446655440000',
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    
    // Hash format
    'a1b2c3d4e5f6',
    'abc123def456',
    
    // Timestamp-based
    Date.now().toString(),
    (Date.now() - 86400000).toString(), // Yesterday
    
    // Alphanumeric
    'page_abc123',
    'video_page_001',
    'gen_page_xyz789',
    
    // Simple numeric
    '12345',
    '1000000',
    '999999999',
    
    // Previous working attempt
    'test-page-001',
    'test-page-002',
    'default-001',
    
    // Realistic session IDs
    'sess_' + Math.random().toString(36).substring(2, 15),
    'sid_' + Date.now().toString(36),
];

async function testPageId(pageId, prompt) {
    const payload = {
        prompt: prompt,
        channel: CONFIG.channel,
        pageId: pageId,
        model_version: "v1",
        duration: 3,
        resolution: "512x512"
    };

    try {
        const response = await axios.post(
            `${CONFIG.baseUrl}/aimodels/api/v1/ai/video/create`,
            payload,
            {
                headers: getHeaders(),
                timeout: 30000
            }
        );

        const code = response.data?.code;
        const message = response.data?.message || 'Unknown';

        return {
            pageId,
            status: response.status,
            code,
            message,
            success: code === 200
        };
    } catch (error) {
        return {
            pageId,
            status: error.response?.status || 0,
            code: error.response?.data?.code || 0,
            message: error.response?.data?.message || error.message,
            success: false
        };
    }
}

async function runPageIdTests() {
    console.log('='.repeat(70));
    console.log('🔍 PAGEID PATTERN TESTING');
    console.log('='.repeat(70));
    console.log(`Testing ${PAGE_ID_PATTERNS.length} different pageId patterns...\n`);

    const results = [];
    const prompt = "A simple test";

    for (let i = 0; i < PAGE_ID_PATTERNS.length; i++) {
        const pageId = PAGE_ID_PATTERNS[i];
        console.log(`[${i + 1}/${PAGE_ID_PATTERNS.length}] Testing: ${pageId}`);
        
        const result = await testPageId(pageId, prompt);
        results.push(result);

        // Show result
        if (result.success) {
            console.log(`  ✅ SUCCESS! Code: ${result.code}, Message: ${result.message}`);
        } else {
            console.log(`  ❌ Failed - Code: ${result.code}, Message: ${result.message}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70));

    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);

    console.log(`\nTotal Tested: ${results.length}`);
    console.log(`✅ Successful: ${successes.length}`);
    console.log(`❌ Failed: ${failures.length}`);

    if (successes.length > 0) {
        console.log('\n🎉 WORKING PAGE IDs:');
        successes.forEach(r => {
            console.log(`  • ${r.pageId} (Code: ${r.code})`);
        });
    }

    // Group failure reasons
    const failureReasons = {};
    failures.forEach(r => {
        const key = r.message || 'Unknown error';
        failureReasons[key] = (failureReasons[key] || 0) + 1;
    });

    if (Object.keys(failureReasons).length > 0) {
        console.log('\n❌ FAILURE REASONS:');
        Object.entries(failureReasons).forEach(([reason, count]) => {
            console.log(`  • ${reason} (${count} occurrences)`);
        });
    }

    console.log('\n' + '='.repeat(70));
}

runPageIdTests().catch(console.error);
