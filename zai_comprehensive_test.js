import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

async function testAllZAIFeatures() {
    console.log('🧪 Z.AI Complete API Feature Test');
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
    
    const baseHeaders = {
        'accept': 'application/json',
        'authorization': `Bearer ${bearerToken}`,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        'referer': 'https://chat.z.ai/',
        'cookie': cookieHeader
    };
    
    // Comprehensive list of potential endpoints
    const endpoints = [
        // Chat & Conversation
        { name: 'Get Chats List', url: 'https://chat.z.ai/api/v1/chats/?page=1', method: 'GET' },
        { name: 'Get Chats List (Page 2)', url: 'https://chat.z.ai/api/v1/chats/?page=2', method: 'GET' },
        
        // Discovery endpoints
        { name: 'API Base', url: 'https://chat.z.ai/api/v1/', method: 'GET' },
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
        console.log(`Testing: ${endpoint.name}`);
        console.log(`${endpoint.method} ${endpoint.url}`);
        
        try {
            const options = {
                method: endpoint.method,
                headers: baseHeaders
            };
            
            if (endpoint.body) {
                options.headers['content-type'] = 'application/json';
                options.body = JSON.stringify(endpoint.body);
            }
            
            const response = await fetch(endpoint.url, options);
            
            console.log(`Status: ${response.status} ${response.statusText}`);
            console.log(`Content-Type: ${response.headers.get('content-type')}`);
            
            const text = await response.text();
            
            if (response.ok) {
                try {
                    const data = JSON.parse(text);
                    console.log('✅ SUCCESS');
                    console.log(`Response: ${JSON.stringify(data, null, 2).substring(0, 500)}...\n`);
                    results.push({ ...endpoint, status: response.status, success: true, preview: JSON.stringify(data).substring(0, 200) });
                } catch {
                    console.log('✅ SUCCESS (Non-JSON)');
                    console.log(`Response: ${text.substring(0, 200)}...\n`);
                    results.push({ ...endpoint, status: response.status, success: true, preview: text.substring(0, 200) });
                }
            } else {
                console.log('❌ FAILED');
                try {
                    const errorData = JSON.parse(text);
                    console.log(`Error: ${JSON.stringify(errorData, null, 2)}\n`);
                } catch {
                    console.log(`Error: ${text.substring(0, 200)}...\n`);
                }
                results.push({ ...endpoint, status: response.status, success: false, error: text.substring(0, 100) });
            }
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}\n`);
            results.push({ ...endpoint, status: 0, success: false, error: error.message });
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    console.log(`\nTotal Endpoints Tested: ${results.length}`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    
    console.log('\n📋 Working Endpoints:');
    results.filter(r => r.success).forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.name} (${r.status})`);
    });
    
    // Save results
    const resultsPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-api-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Full results saved to: ${resultsPath}\n`);
}

// Run the comprehensive test
testAllZAIFeatures().catch(console.error);
