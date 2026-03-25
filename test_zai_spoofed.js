import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// User-Agent pool for rotation
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.2; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
];

const ACCEPT_LANGUAGES = [
    'en-US,en;q=0.9', 'en-GB,en;q=0.9', 'en-CA,en;q=0.9', 
    'de-DE,de;q=0.9', 'fr-FR,fr;q=0.9', 'es-ES,es;q=0.9'
];

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateSpoofedHeaders(sessionData) {
    const userAgent = getRandomItem(USER_AGENTS);
    const acceptLanguage = getRandomItem(ACCEPT_LANGUAGES);
    const bearerToken = sessionData.localStorage?.token || '';
    const cookieHeader = sessionData.cookies?.map(c => `${c.name}=${c.value}`).join('; ') || '';

    return {
        'accept': 'application/json',
        'authorization': `Bearer ${bearerToken}`,
        'user-agent': userAgent,
        'referer': 'https://chat.z.ai/',
        'origin': 'https://chat.z.ai',
        'cookie': cookieHeader,
        'accept-language': acceptLanguage,
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'cache-control': 'no-cache',
        'pragma': 'no-cache'
    };
}

async function testZAIWithSpoofing() {
    console.log('🎭 Z.AI Test with Auto Header Spoofing');
    console.log('=======================================\n');
    
    const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
    let sessionData;
    
    try {
        sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
        console.log('✅ Session loaded\n');
    } catch (error) {
        console.error('❌ No session data. Run zai_login_explorer.js first\n');
        return null;
    }
    
    const url = 'https://chat.z.ai/api/v1/chats/?page=1';
    
    // Generate spoofed headers
    const headers = generateSpoofedHeaders(sessionData);
    
    console.log('📋 Spoofed Headers:');
    console.log(`   User-Agent: ${headers['user-agent'].substring(0, 60)}...`);
    console.log(`   Accept-Language: ${headers['accept-language']}`);
    console.log(`   Cache-Control: ${headers['cache-control']}\n`);
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });
        
        console.log('📊 Response Details:');
        console.log(`   Status Code: ${response.status} ${response.statusText}`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
        
        const text = await response.text();
        console.log(`\n📝 Response: ${text.substring(0, 500)}${text.length > 500 ? '...' : ''}`);
        
        if (response.ok) {
            try {
                const data = JSON.parse(text);
                console.log('\n✅ SUCCESS: Received valid JSON response');
                console.log('✅ Headers spoofed successfully!');
                return data;
            } catch (e) {
                console.log('\n⚠️  Response received but not valid JSON');
                return text;
            }
        } else {
            console.log(`\n❌ FAILED: Status ${response.status}`);
            return null;
        }
        
    } catch (error) {
        console.log(`❌ Request failed: ${error.message}`);
        return null;
    }
}

// Export for reuse
export { generateSpoofedHeaders, USER_AGENTS, ACCEPT_LANGUAGES };

// Run the test
testZAIWithSpoofing().then((result) => {
    console.log('\n' + '='.repeat(60));
    if (result) {
        console.log('🎉 Z.ai API Test with Spoofing: SUCCESS');
        console.log('✅ Headers rotated - appears as different client');
    } else {
        console.log('❌ Z.ai API Test with Spoofing: FAILED');
    }
}).catch(error => {
    console.error('Test execution failed:', error);
});
