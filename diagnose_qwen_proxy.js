import fetch from 'node-fetch';

console.log('🔬 Detailed Qwen Proxy Diagnostics');
console.log('='.repeat(70));
console.log('');

const BASE_URL = 'https://qwen-worker-proxy.ronitshrimankar1.workers.dev';

async function detailedTest() {
    // Test 1: Basic connectivity
    console.log('📡 TEST 1: Basic Connectivity');
    console.log('-'.repeat(70));
    try {
        const response = await fetch(BASE_URL, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        console.log('Status:', response.status);
        console.log('OK?', response.ok);
        console.log('Content-Type:', response.headers.get('content-type'));
        console.log('Server:', response.headers.get('server'));
        
        const text = await response.text();
        console.log('Response length:', text.length);
        console.log('Response preview:', text.substring(0, 200));
        console.log('');
    } catch (error) {
        console.log('Error:', error.message);
        console.log('');
    }
    
    // Test 2: Try with authorization header
    console.log('🔐 TEST 2: With Authorization Header');
    console.log('-'.repeat(70));
    try {
        const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-test',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify({
                model: 'qwen-turbo',
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 10
            })
        });
        
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2).substring(0, 500));
        console.log('');
    } catch (error) {
        console.log('Error:', error.message);
        console.log('');
    }
    
    // Test 3: Check if it's a different API format
    console.log('📝 TEST 3: Alternative API Format');
    console.log('-'.repeat(70));
    try {
        const response = await fetch(`${BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify({
                model: 'qwen',
                prompt: 'Hello',
                max_tokens: 10
            })
        });
        
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2).substring(0, 500));
        console.log('');
    } catch (error) {
        console.log('Error:', error.message);
        console.log('');
    }
    
    // Test 4: Models endpoint
    console.log('📋 TEST 4: Models List Endpoint');
    console.log('-'.repeat(70));
    try {
        const response = await fetch(`${BASE_URL}/v1/models`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2).substring(0, 800));
        console.log('');
    } catch (error) {
        console.log('Error:', error.message);
        console.log('');
    }
    
    // Test 5: Health endpoint
    console.log('💚 TEST 5: Health/Status Endpoint');
    console.log('-'.repeat(70));
    try {
        const endpoints = ['/health', '/status', '/ping', '/'];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`${BASE_URL}${endpoint}`, {
                    method: 'GET',
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                
                console.log(`${endpoint}: ${response.status}`);
                const text = await response.text();
                if (text.length < 200) {
                    console.log(`  Response: ${text}`);
                }
            } catch (err) {
                console.log(`${endpoint}: Error - ${err.message}`);
            }
        }
        console.log('');
    } catch (error) {
        console.log('Error:', error.message);
        console.log('');
    }
}

detailedTest().catch(console.error);
