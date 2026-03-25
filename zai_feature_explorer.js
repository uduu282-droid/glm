import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

async function exploreZAIFeatures() {
    console.log('🚀 Z.AI Complete Feature Explorer');
    console.log('==================================\n');
    
    // Load session data
    const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
    let sessionData;
    
    try {
        sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
        console.log('✅ Session loaded\n');
    } catch (error) {
        console.error('❌ No session data found. Please run zai_login_explorer.js first\n');
        return;
    }
    
    const bearerToken = sessionData.localStorage.token;
    const cookieHeader = sessionData.cookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    console.log('📋 Current Session Info:');
    console.log(`   Token: ${bearerToken.substring(0, 60)}...`);
    console.log(`   Cookies: ${sessionData.cookies.length}`);
    console.log(`   URL: ${sessionData.url}\n`);
    
    const baseHeaders = {
        'accept': 'application/json',
        'authorization': `Bearer ${bearerToken}`,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        'referer': 'https://chat.z.ai/',
        'cookie': cookieHeader
    };
    
    // Test the working endpoint
    console.log('🧪 Testing Confirmed Working Endpoints:\n');
    
    const endpoints = [
        { name: 'Chats Page 1', url: 'https://chat.z.ai/api/v1/chats/?page=1', method: 'GET' },
        { name: 'Chats Page 2', url: 'https://chat.z.ai/api/v1/chats/?page=2', method: 'GET' },
        { name: 'Chats Page 3', url: 'https://chat.z.ai/api/v1/chats/?page=3', method: 'GET' },
        { name: 'API Base', url: 'https://chat.z.ai/api/v1/', method: 'GET' },
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
        console.log(`Testing: ${endpoint.name}`);
        console.log(`${endpoint.method} ${endpoint.url}`);
        
        try {
            const response = await fetch(endpoint.url, {
                method: endpoint.method,
                headers: baseHeaders
            });
            
            console.log(`Status: ${response.status} ${response.statusText}`);
            console.log(`Content-Type: ${response.headers.get('content-type')}`);
            
            const text = await response.text();
            
            if (response.ok) {
                try {
                    const data = JSON.parse(text);
                    console.log('✅ SUCCESS');
                    
                    if (Array.isArray(data)) {
                        console.log(`Response: Array with ${data.length} items`);
                        if (data.length > 0) {
                            console.log('First item:', JSON.stringify(data[0], null, 2));
                        }
                    } else {
                        console.log(`Response: ${JSON.stringify(data, null, 2).substring(0, 300)}...`);
                    }
                    
                    results.push({ ...endpoint, status: response.status, success: true, data: data });
                } catch {
                    console.log('✅ SUCCESS (Non-JSON)');
                    console.log(`Response: ${text.substring(0, 200)}...\n`);
                    results.push({ ...endpoint, status: response.status, success: true, rawData: text.substring(0, 200) });
                }
            } else {
                console.log('❌ FAILED');
                try {
                    const errorData = JSON.parse(text);
                    console.log(`Error: ${JSON.stringify(errorData, null, 2)}\n`);
                } catch {
                    console.log(`Error: ${text.substring(0, 200)}...\n`);
                }
                results.push({ ...endpoint, status: response.status, success: false });
            }
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}\n`);
            results.push({ ...endpoint, status: 0, success: false, error: error.message });
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 FEATURE SUMMARY');
    console.log('='.repeat(60));
    
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    console.log(`\nTotal Endpoints Tested: ${results.length}`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (successful > 0) {
        console.log('\n✅ CONFIRMED WORKING ENDPOINTS:');
        results.filter(r => r.success).forEach((r, i) => {
            console.log(`  ${i + 1}. ${r.name}`);
            console.log(`     URL: ${r.url}`);
            console.log(`     Status: ${r.status}\n`);
        });
    }
    
    // Save results
    const resultsPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-feature-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`💾 Full results saved to: ${resultsPath}\n`);
    
    // Next steps
    console.log('💡 WHAT YOU CAN DO NOW:');
    console.log('   1. Use test_zai_with_session.js to monitor your chats');
    console.log('   2. Run zai_login_explorer.js anytime to refresh session');
    console.log('   3. Check universal-ai-proxy/zai-session.json for your credentials\n');
    
    console.log('⚠️  API LIMITATIONS DISCOVERED:');
    console.log('   • /api/v1/models returns 403 (not accessible via API)');
    console.log('   • User profile/settings endpoints don\'t exist or require different auth');
    console.log('   • Chat creation/modification may only work through web interface\n');
}

// Run the feature explorer
exploreZAIFeatures().catch(console.error);
