import https from 'https';

// Test the OPTIONS request (CORS preflight)
function testOptionsRequest() {
    const options = {
        hostname: 'api.chat100.ai',
        port: 443,
        path: '/aimodels/api/v1/ai/chatAll/chat',
        method: 'OPTIONS',
        headers: {
            'Origin': 'https://chat100.ai',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'authorization,content-type,uniqueid,verify',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    };

    console.log('Testing OPTIONS request (CORS preflight)...');
    
    const req = https.request(options, (res) => {
        console.log('Status Code:', res.statusCode);
        console.log('Headers:');
        Object.keys(res.headers).forEach(key => {
            console.log(`  ${key}: ${res.headers[key]}`);
        });
        
        // Test actual POST request if OPTIONS succeeds
        if (res.statusCode === 200) {
            testPostRequest();
        }
    });

    req.on('error', (error) => {
        console.error('OPTIONS request failed:', error.message);
    });

    req.end();
}

// Test the actual POST request
function testPostRequest() {
    const postData = JSON.stringify({
        messages: [
            {
                role: "user",
                content: "Hello, this is a test message"
            }
        ],
        model: "gpt-3.5-turbo" // or whatever model is available
    });

    const options = {
        hostname: 'api.chat100.ai',
        port: 443,
        path: '/aimodels/api/v1/ai/chatAll/chat',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'Origin': 'https://chat100.ai',
            'authorization': 'Bearer your-api-key-here', // You'll need to add your actual API key
            'uniqueid': 'test-unique-id',
            'verify': 'test-verify-token'
        }
    };

    console.log('\nTesting POST request...');
    
    const req = https.request(options, (res) => {
        console.log('POST Status Code:', res.statusCode);
        console.log('POST Headers:');
        Object.keys(res.headers).forEach(key => {
            console.log(`  ${key}: ${res.headers[key]}`);
        });
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('Response Body:', data);
            try {
                const jsonData = JSON.parse(data);
                console.log('Parsed JSON Response:', JSON.stringify(jsonData, null, 2));
            } catch (e) {
                console.log('Raw response (not JSON):', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('POST request failed:', error.message);
    });

    req.write(postData);
    req.end();
}

// Run the tests
console.log('Starting chat100.ai API tests...\n');
testOptionsRequest();