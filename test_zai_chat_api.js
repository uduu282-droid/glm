import fetch from 'node-fetch';

async function testZaiChatAPI() {
    console.log('🧪 Testing Z.ai Chat API');
    console.log('=======================\n');
    
    const url = 'https://chat.z.ai/api/v1/chats/?page=1';
    
    // Using the headers and cookies structure you provided
    const headers = {
        'accept': 'application/json',
        'authorization': 'Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...', // Incomplete token as shown
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        'referer': 'https://chat.z.ai/',
    };
    
    console.log(`Testing URL: ${url}`);
    console.log('Headers included: accept, authorization, user-agent, referer');
    console.log('\nNote: Using placeholder tokens as provided in the example\n');
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });
        
        console.log(`Status Code: ${response.status} ${response.statusText}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        console.log(`Response Headers: ${Array.from(response.headers.entries()).map(([k,v]) => `${k}: ${v}`).join(', ')}`);
        
        const text = await response.text();
        console.log(`Response (first 500 chars): ${text.substring(0, 500)}...`);
        
        if (response.ok) {
            try {
                const data = JSON.parse(text);
                console.log('\n✅ SUCCESS: Received JSON response');
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

// Run the test
testZaiChatAPI().then((result) => {
    console.log('\n' + '='.repeat(50));
    if (result) {
        console.log('🎉 Z.ai Chat API Test: SUCCESS');
    } else {
        console.log('❌ Z.ai Chat API Test: FAILED');
    }
}).catch(error => {
    console.error('Test execution failed:', error);
});