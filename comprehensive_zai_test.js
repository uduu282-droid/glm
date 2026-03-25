import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

console.log('🧪 Comprehensive ZAI API Test Suite');
console.log('====================================\n');

// Load session data
const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
let sessionData;

try {
    sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    console.log('✅ Session data loaded successfully');
    console.log(`   Timestamp: ${new Date(sessionData.timestamp).toISOString()}`);
    console.log(`   URL: ${sessionData.url}\n`);
} catch (error) {
    console.error('❌ Failed to load session data:', error.message);
    console.log('\n💡 Solution: Run this first to get fresh tokens:');
    console.log('   node zai_login_explorer.js\n');
    process.exit(1);
}

// Extract authentication credentials
const bearerToken = sessionData.localStorage.token;
const cookies = sessionData.cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

console.log('📋 Authentication Summary:');
console.log(`   Bearer Token: ${bearerToken.substring(0, 50)}...`);
console.log(`   Cookie Count: ${sessionData.cookies.length}`);
console.log(`   LocalStorage Keys: ${Object.keys(sessionData.localStorage).join(', ')}\n`);

// Helper function to create headers
function createHeaders(customHeaders = {}) {
    return {
        'accept': 'application/json',
        'authorization': `Bearer ${bearerToken}`,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        'referer': 'https://chat.z.ai/',
        'origin': 'https://chat.z.ai',
        'cookie': cookies,
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        ...customHeaders
    };
}

// Test results tracker
const testResults = {
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: []
};

function recordTest(name, status, details = {}) {
    testResults.tests.push({ name, status, details });
    if (status === 'PASS') testResults.passed++;
    else if (status === 'FAIL') testResults.failed++;
    else if (status === 'SKIP') testResults.skipped++;
}

// TEST 1: Basic Chats Endpoint
async function testChatsEndpoint() {
    console.log('\n📋 TEST 1: GET /api/v1/chats/?page=1');
    console.log('─'.repeat(60));
    
    const url = 'https://chat.z.ai/api/v1/chats/?page=1';
    const headers = createHeaders();
    
    try {
        const response = await fetch(url, { method: 'GET', headers });
        
        console.log(`   Status: ${response.status} ${response.statusText}`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
        
        const text = await response.text();
        
        if (response.ok) {
            try {
                const data = JSON.parse(text);
                console.log(`   ✅ PASS - Valid JSON response`);
                console.log(`   Response Type: ${Array.isArray(data) ? 'Array' : typeof data}`);
                if (Array.isArray(data)) {
                    console.log(`   Chat Count: ${data.length}`);
                    if (data.length > 0) {
                        console.log(`   Sample Chat: ${JSON.stringify(data[0]).substring(0, 100)}...`);
                    }
                }
                recordTest('Chats Endpoint', 'PASS', { chats: data.length });
                return true;
            } catch (e) {
                console.log(`   ⚠️  WARNING - Response received but not valid JSON`);
                recordTest('Chats Endpoint', 'SKIP', { reason: 'Invalid JSON' });
                return false;
            }
        } else {
            console.log(`   ❌ FAIL - Status ${response.status}`);
            console.log(`   Response: ${text.substring(0, 200)}`);
            recordTest('Chats Endpoint', 'FAIL', { status: response.status });
            return false;
        }
    } catch (error) {
        console.log(`   ❌ FAIL - Request error: ${error.message}`);
        recordTest('Chats Endpoint', 'FAIL', { error: error.message });
        return false;
    }
}

// TEST 2: Multiple Chat Pages
async function testMultiplePages() {
    console.log('\n📋 TEST 2: Pagination Testing (Pages 1-3)');
    console.log('─'.repeat(60));
    
    const results = [];
    
    for (let page = 1; page <= 3; page++) {
        const url = `https://chat.z.ai/api/v1/chats/?page=${page}`;
        const headers = createHeaders();
        
        try {
            const response = await fetch(url, { method: 'GET', headers });
            console.log(`   Page ${page}: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`           → ${Array.isArray(data) ? data.length : 'N/A'} chats`);
                results.push({ page, status: response.status, count: Array.isArray(data) ? data.length : 0 });
            } else {
                results.push({ page, status: response.status, error: await response.text() });
            }
        } catch (error) {
            console.log(`           → Error: ${error.message}`);
            results.push({ page, error: error.message });
        }
    }
    
    const successfulPages = results.filter(r => r.status === 200).length;
    if (successfulPages > 0) {
        console.log(`   ✅ PASS - ${successfulPages}/3 pages responded successfully`);
        recordTest('Pagination', 'PASS', { successfulPages, totalPages: 3 });
    } else {
        console.log(`   ❌ FAIL - No pages responded successfully`);
        recordTest('Pagination', 'FAIL', { successfulPages, totalPages: 3 });
    }
}

// TEST 3: Models Endpoint (Expected to fail based on docs)
async function testModelsEndpoint() {
    console.log('\n📋 TEST 3: GET /api/v1/models (Expected: 403)');
    console.log('─'.repeat(60));
    
    const url = 'https://chat.z.ai/api/v1/models';
    const headers = createHeaders();
    
    try {
        const response = await fetch(url, { method: 'GET', headers });
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`   🎉 SURPRISE! Models endpoint is accessible!`);
            console.log(`   Models: ${JSON.stringify(data, null, 2).substring(0, 300)}`);
            recordTest('Models Endpoint', 'PASS', { unexpected: true });
        } else {
            console.log(`   ✅ Expected behavior - Status ${response.status}`);
            const text = await response.text();
            console.log(`   Response: ${text.substring(0, 150)}`);
            recordTest('Models Endpoint', 'SKIP', { status: response.status, expected: true });
        }
    } catch (error) {
        console.log(`   ❌ Request error: ${error.message}`);
        recordTest('Models Endpoint', 'FAIL', { error: error.message });
    }
}

// TEST 4: Chat Completions (POST - Expected to fail)
async function testChatCompletions() {
    console.log('\n📋 TEST 4: POST /api/v1/chat/completions');
    console.log('─'.repeat(60));
    
    const url = 'https://chat.z.ai/api/v1/chat/completions';
    const headers = createHeaders({
        'content-type': 'application/json'
    });
    
    const payload = {
        messages: [
            { role: 'user', content: 'Hello, this is a test message!' }
        ],
        model: 'default',
        stream: false
    };
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });
        
        console.log(`   Status: ${response.status} ${response.statusText}`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
        
        const text = await response.text();
        
        if (response.ok) {
            try {
                const data = await response.json();
                console.log(`   🎉 SUCCESS! Chat completions work!`);
                console.log(`   Response: ${JSON.stringify(data, null, 2).substring(0, 300)}`);
                recordTest('Chat Completions', 'PASS', { unexpected: true });
            } catch (e) {
                console.log(`   ⚠️  Success but invalid JSON`);
                recordTest('Chat Completions', 'SKIP', { reason: 'Invalid JSON' });
            }
        } else {
            console.log(`   ❌ Expected failure - Status ${response.status}`);
            console.log(`   Response: ${text.substring(0, 200)}`);
            recordTest('Chat Completions', 'SKIP', { status: response.status, expected: true });
        }
    } catch (error) {
        console.log(`   ❌ Request error: ${error.message}`);
        recordTest('Chat Completions', 'FAIL', { error: error.message });
    }
}

// TEST 5: Header Validation
async function testHeaderValidation() {
    console.log('\n📋 TEST 5: Header Spoofing Validation');
    console.log('─'.repeat(60));
    
    // Test with minimal headers (should fail)
    const url = 'https://chat.z.ai/api/v1/chats/?page=1';
    const minimalHeaders = {
        'accept': 'application/json',
        'authorization': `Bearer ${bearerToken}`
    };
    
    try {
        const response = await fetch(url, { method: 'GET', headers: minimalHeaders });
        console.log(`   Minimal Headers: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            console.log(`   ✅ Confirmed: Full headers required`);
            recordTest('Header Validation', 'PASS', { fullHeadersRequired: true });
        } else {
            console.log(`   ⚠️  Works with minimal headers!`);
            recordTest('Header Validation', 'PASS', { fullHeadersRequired: false });
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        recordTest('Header Validation', 'FAIL', { error: error.message });
    }
}

// TEST 6: Session Data Integrity
async function testSessionIntegrity() {
    console.log('\n📋 TEST 6: Session Data Integrity Check');
    console.log('─'.repeat(60));
    
    const checks = {
        hasCookies: Array.isArray(sessionData.cookies) && sessionData.cookies.length > 0,
        hasToken: !!sessionData.localStorage?.token,
        hasTimestamp: !!sessionData.timestamp,
        hasUrl: !!sessionData.url,
        cookieCount: sessionData.cookies.length,
        tokenLength: sessionData.localStorage?.token?.length || 0
    };
    
    console.log(`   Has Cookies: ${checks.hasCookies ? '✅' : '❌'}`);
    console.log(`   Has Token: ${checks.hasToken ? '✅' : '❌'}`);
    console.log(`   Has Timestamp: ${checks.hasTimestamp ? '✅' : '❌'}`);
    console.log(`   Has URL: ${checks.hasUrl ? '✅' : '❌'}`);
    console.log(`   Cookie Count: ${checks.cookieCount}`);
    console.log(`   Token Length: ${checks.tokenLength}`);
    
    const allPassed = Object.values(checks).every(v => typeof v === 'boolean' ? v : v > 0);
    
    if (allPassed) {
        console.log(`   ✅ PASS - All integrity checks passed`);
        recordTest('Session Integrity', 'PASS', checks);
    } else {
        console.log(`   ❌ FAIL - Some integrity checks failed`);
        recordTest('Session Integrity', 'FAIL', checks);
    }
}

// TEST 7: Rate Limit Test (Quick consecutive requests)
async function testRateLimit() {
    console.log('\n📋 TEST 7: Rate Limit Detection (3 rapid requests)');
    console.log('─'.repeat(60));
    
    const url = 'https://chat.z.ai/api/v1/chats/?page=1';
    const headers = createHeaders();
    const results = [];
    
    for (let i = 0; i < 3; i++) {
        const startTime = Date.now();
        
        try {
            const response = await fetch(url, { method: 'GET', headers });
            const duration = Date.now() - startTime;
            
            console.log(`   Request ${i + 1}: ${response.status} (${duration}ms)`);
            results.push({ 
                request: i + 1, 
                status: response.status, 
                duration,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.log(`   Request ${i + 1}: ERROR - ${error.message}`);
            results.push({ request: i + 1, error: error.message });
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const rateLimited = results.some(r => r.status === 429);
    if (rateLimited) {
        console.log(`   ⚠️  Rate limit detected (429 status)`);
        recordTest('Rate Limit', 'FAIL', { rateLimited: true, results });
    } else {
        console.log(`   ✅ PASS - No rate limiting detected`);
        recordTest('Rate Limit', 'PASS', { rateLimited: false, results });
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting comprehensive test suite...\n');
    
    await testChatsEndpoint();
    await testMultiplePages();
    await testModelsEndpoint();
    await testChatCompletions();
    await testHeaderValidation();
    await testSessionIntegrity();
    await testRateLimit();
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${testResults.tests.length}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⚠️  Skipped: ${testResults.skipped}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));
    
    // Save detailed results
    const resultsPath = path.join(process.cwd(), 'zai-test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
    console.log(`\n💾 Detailed results saved to: ${resultsPath}`);
    
    // Final verdict
    console.log('\n' + '='.repeat(60));
    if (testResults.passed >= testResults.tests.length * 0.7) {
        console.log('🎉 OVERALL: ZAI API is working well!');
        console.log('✅ Core functionality is operational');
    } else if (testResults.passed >= testResults.tests.length * 0.4) {
        console.log('⚠️  OVERALL: ZAI API has partial functionality');
        console.log('ℹ️  Some features work, others may be limited');
    } else {
        console.log('❌ OVERALL: ZAI API has significant issues');
        console.log('💡 Try refreshing session tokens');
    }
    console.log('='.repeat(60));
}

// Execute tests
runAllTests().catch(console.error);
