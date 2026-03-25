import axios from 'axios';

console.log('🔍 VEO AI Free - WordPress AJAX Reverse Engineering');
console.log('='.repeat(70));

// Configuration
const CONFIG = {
    baseUrl: 'https://veoaifree.com',
    ajaxUrl: 'https://veoaifree.com/wp-admin/admin-ajax.php',
    referer: 'https://veoaifree.com/3d-ai-video-generator/'
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

// Step 1: Get the page to find action parameters
async function getPageContent() {
    console.log('\n📄 Step 1: Getting page content to find AJAX actions...');
    
    try {
        const response = await axios.get(CONFIG.baseUrl + '/3d-ai-video-generator/', {
            headers: COMMON_HEADERS,
            timeout: 15000
        });
        
        console.log('✅ Page retrieved successfully');
        console.log('Status:', response.status);
        console.log('Content length:', response.data.length, 'bytes');
        
        // Look for AJAX actions in the HTML
        const html = response.data;
        
        // Search for common WordPress AJAX patterns
        const patterns = [
            /action=['"]([^'"]+)['"]/gi,
            /data-action=['"]([^'"]+)['"]/gi,
            /ajax_action['"]:\s*['"]([^'"]+)['"]/gi,
            /admin_ajax_url['"]:\s*['"]([^'"]+)['"]/gi
        ];
        
        console.log('\n🔍 Searching for AJAX actions in HTML...');
        
        const foundActions = new Set();
        
        patterns.forEach((pattern, index) => {
            const matches = html.matchAll(pattern);
            for (const match of matches) {
                if (match[1] && !match[1].startsWith('http')) {
                    foundActions.add(match[1]);
                }
            }
        });
        
        if (foundActions.size > 0) {
            console.log('\n✨ Found potential AJAX actions:');
            Array.from(foundActions).forEach((action, i) => {
                console.log(`  ${i + 1}. ${action}`);
            });
            return Array.from(foundActions);
        } else {
            console.log('⚠️  No AJAX actions found in HTML');
            return [];
        }
        
    } catch (error) {
        console.log('❌ Failed to get page');
        if (error.response) {
            console.log('Status:', error.response.status);
        } else {
            console.log('Error:', error.message);
        }
        return [];
    }
}

// Step 2: Test AJAX endpoint with different actions
async function testAjaxActions(actions) {
    console.log('\n\n🧪 Step 2: Testing AJAX actions...\n');
    
    // Common WordPress AJAX action names for video generation
    const commonActions = [
        'generate_video',
        'create_video',
        'ai_generate',
        'video_create',
        'generate_ai_video',
        'process_video',
        'render_video',
        'submit_prompt'
    ];
    
    // Combine found actions with common ones
    const allActions = [...new Set([...actions, ...commonActions])];
    
    for (const action of allActions) {
        console.log(`\n--- Testing action: "${action}" ---`);
        
        // Test with form data (WordPress standard)
        const formData = new URLSearchParams();
        formData.append('action', action);
        formData.append('prompt', 'A beautiful sunset over mountains');
        
        try {
            const response = await axios.post(CONFIG.ajaxUrl, formData, {
                headers: COMMON_HEADERS,
                timeout: 15000
            });
            
            console.log('✅ Status:', response.status);
            
            const responseData = typeof response.data === 'string' 
                ? response.data.substring(0, 300)
                : JSON.stringify(response.data).substring(0, 300);
            
            console.log('Response:', responseData);
            
            // Check if we got a meaningful response
            if (response.data && 
                (JSON.stringify(response.data).includes('video') ||
                 JSON.stringify(response.data).includes('url') ||
                 JSON.stringify(response.data).includes('success'))) {
                console.log('🎉 POTENTIAL MATCH FOUND!');
                return { action, response: response.data };
            }
            
        } catch (error) {
            if (error.response) {
                const errorMsg = typeof error.response.data === 'string'
                    ? error.response.data.substring(0, 200)
                    : JSON.stringify(error.response.data).substring(0, 200);
                console.log('❌ Status:', error.response.status);
                console.log('Error:', errorMsg);
            } else {
                console.log('❌ Error:', error.message);
            }
        }
    }
    
    return null;
}

// Step 3: Try direct POST with different payloads
async function testDirectPayloads() {
    console.log('\n\n🎯 Step 3: Testing direct payload variations...\n');
    
    const payloads = [
        {
            name: 'Standard WordPress AJAX',
            data: {
                action: 'generate_video',
                prompt: 'Test prompt'
            }
        },
        {
            name: 'With nonce (if public)',
            data: {
                action: 'generate_video',
                prompt: 'Test prompt',
                nonce: ''
            }
        },
        {
            name: 'JSON format',
            data: {
                action: 'generate_video',
                prompt: 'Test prompt',
                format: 'json'
            }
        },
        {
            name: 'Video parameters',
            data: {
                action: 'create_video',
                prompt: 'A cute robot dancing',
                style: '3d',
                duration: '5'
            }
        }
    ];
    
    for (const payload of payloads) {
        console.log(`\nTesting: ${payload.name}`);
        
        const formData = new URLSearchParams();
        Object.keys(payload.data).forEach(key => {
            formData.append(key, payload.data[key]);
        });
        
        try {
            const response = await axios.post(CONFIG.ajaxUrl, formData, {
                headers: COMMON_HEADERS,
                timeout: 15000
            });
            
            console.log('✅ Status:', response.status);
            const responseData = typeof response.data === 'string'
                ? response.data.substring(0, 300)
                : JSON.stringify(response.data).substring(0, 300);
            console.log('Response:', responseData);
            
        } catch (error) {
            console.log('❌ Status:', error.response?.status || 'Connection error');
            const errorMsg = typeof error.response?.data === 'string'
                ? error.response.data.substring(0, 200)
                : JSON.stringify(error.response?.data).substring(0, 200);
            console.log('Error:', errorMsg || error.message);
        }
    }
}

// Step 4: Analyze JavaScript files for clues
async function analyzeJavaScript() {
    console.log('\n\n📜 Step 4: Looking for JavaScript files...\n');
    
    try {
        const response = await axios.get(CONFIG.baseUrl + '/3d-ai-video-generator/', {
            headers: COMMON_HEADERS,
            timeout: 15000
        });
        
        const html = response.data;
        
        // Find script tags
        const scriptMatches = html.matchAll(/<script[^>]*src=['"]([^'"]+)['"][^>]*>/gi);
        const scripts = Array.from(scriptMatches).map(m => m[1]);
        
        console.log('Found external scripts:');
        scripts.forEach((script, i) => {
            if (script.includes('veoaifree.com')) {
                console.log(`  ${i + 1}. ${script}`);
            }
        });
        
        // Look for inline scripts with AJAX calls
        const inlineScriptPattern = /<script>([\s\S]*?)<\/script>/gi;
        const inlineScripts = Array.from(html.matchAll(inlineScriptPattern))
            .map(m => m[1])
            .filter(script => script.includes('ajax') || script.includes('fetch'));
        
        if (inlineScripts.length > 0) {
            console.log('\n📝 Inline scripts with AJAX/fetch:');
            inlineScripts.forEach((script, i) => {
                console.log(`\n--- Script ${i + 1} ---`);
                // Extract relevant parts
                const lines = script.split('\n')
                    .filter(line => line.includes('ajax') || 
                                   line.includes('action') || 
                                   line.includes('url:') ||
                                   line.includes('data:'))
                    .slice(0, 10);
                console.log(lines.join('\n').substring(0, 500));
            });
        }
        
        return { scripts, inlineScripts };
        
    } catch (error) {
        console.log('❌ Failed to analyze JavaScript');
        console.log('Error:', error.message);
        return { scripts: [], inlineScripts: [] };
    }
}

// Main execution
async function runCompleteAnalysis() {
    console.log('\n🚀 Starting Complete VEO AI Analysis\n');
    
    // Step 1: Get page and find actions
    const actions = await getPageContent();
    
    // Step 2: Test found actions
    const result = await testAjaxActions(actions);
    
    if (result) {
        console.log('\n\n🎉 SUCCESS! Found working AJAX action:');
        console.log('Action:', result.action);
        console.log('Response:', JSON.stringify(result.response, null, 2));
    } else {
        // Step 3: Try direct payloads
        await testDirectPayloads();
        
        // Step 4: Analyze JavaScript
        await analyzeJavaScript();
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🏁 Analysis Complete');
    console.log('='.repeat(70));
    
    console.log('\n📝 Next Steps:');
    console.log('1. Check browser DevTools Network tab while using the website');
    console.log('2. Look for the exact "action" parameter being sent');
    console.log('3. Check if there\'s a nonce/security token required');
    console.log('4. Monitor wp-admin/admin-ajax.php requests specifically');
    
    console.log('\n💡 Pro Tip:');
    console.log('In browser console on veoaifree.com, run:');
    console.log('document.documentElement.innerHTML');
    console.log('Then search for "action" or "ajax"');
}

// Run the analysis
runCompleteAnalysis().catch(console.error);