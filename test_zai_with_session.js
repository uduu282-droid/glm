import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

async function testZaiChatAPIWithSession() {
    console.log('🧪 Testing Z.ai Chat API with Session Data');
    console.log('============================================\n');
    
    const url = 'https://chat.z.ai/api/v1/chats/?page=1';
    
    // Load session data
    const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
    let sessionData;
    
    try {
        sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
        console.log('✅ Session data loaded successfully');
        console.log(`   URL: ${sessionData.url}`);
        console.log(`   Timestamp: ${new Date(sessionData.timestamp).toISOString()}\n`);
    } catch (error) {
        console.error('❌ Failed to load session data:', error.message);
        return null;
    }
    
    // Extract token from localStorage
    const bearerToken = sessionData.localStorage.token;
    
    // Build cookies from session data
    const cookies = sessionData.cookies.map(cookie => 
        `${cookie.name}=${cookie.value}`
    ).join('; ');
    
    console.log('📋 Authentication Setup:');
    console.log(`   Bearer Token: ${bearerToken.substring(0, 50)}...`);
    console.log(`   Cookies Count: ${sessionData.cookies.length}`);
    console.log(`   Cookie Names: ${sessionData.cookies.map(c => c.name).join(', ')}\n`);
    
    const headers = {
        'accept': 'application/json',
        'authorization': `Bearer ${bearerToken}`,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        'referer': 'https://chat.z.ai/',
        'cookie': cookies
    };
    
    console.log('🚀 Making API request...\n');
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });
        
        console.log('📊 Response Details:');
        console.log(`   Status Code: ${response.status} ${response.statusText}`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
        console.log(`   Set-Cookie: ${response.headers.get('set-cookie') ? 'Yes' : 'No'}`);
        
        const text = await response.text();
        console.log(`\n📝 Response (first 800 chars):`);
        console.log(text.substring(0, 800));
        
        if (response.ok) {
            try {
                const data = JSON.parse(text);
                console.log('\n✅ SUCCESS: Received valid JSON response');
                console.log('\nParsed Data Structure:');
                console.log(JSON.stringify(data, null, 2).substring(0, 1000));
                return data;
            } catch (e) {
                console.log('\n⚠️  Response received but not valid JSON');
                return text;
            }
        } else {
            console.log(`\n❌ FAILED: Status ${response.status}`);
            try {
                const errorData = JSON.parse(text);
                console.log('Error Details:', JSON.stringify(errorData, null, 2));
            } catch {
                console.log('Error Response:', text);
            }
            return null;
        }
        
    } catch (error) {
        console.log(`❌ Request failed: ${error.message}`);
        if (error.code) {
            console.log(`   Error Code: ${error.code}`);
        }
        return null;
    }
}

// Run the test
testZaiChatAPIWithSession().then((result) => {
    console.log('\n' + '='.repeat(60));
    if (result) {
        console.log('🎉 Z.ai Chat API Test: SUCCESS');
        console.log('✅ API is accessible with current session data');
    } else {
        console.log('❌ Z.ai Chat API Test: FAILED');
        console.log('⚠️  Session tokens may be expired or invalid');
    }
}).catch(error => {
    console.error('Test execution failed:', error);
});
