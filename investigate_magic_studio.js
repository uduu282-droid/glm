import fetch from 'node-fetch';

async function investigateMagicStudioAPI() {
    console.log('🔍 Investigating Magic Studio API Structure');
    console.log('=========================================\n');
    
    const baseUrl = 'https://magic-studio.ziddi-beatz.workers.dev';
    
    // Check what the root endpoint returns
    console.log('1. Checking root endpoint HTML content...\n');
    
    try {
        const response = await fetch(baseUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const html = await response.text();
        console.log('HTML Response (first 500 chars):');
        console.log('--------------------------------');
        console.log(html.substring(0, 500));
        console.log('--------------------------------\n');
        
        // Look for API endpoints in the HTML
        const apiMatches = html.match(/\/api\/[^\s"']+/g) || [];
        const endpointMatches = html.match(/\/[a-zA-Z0-9_-]+\/generate/g) || [];
        const jsMatches = html.match(/src=["']([^"']*\.js)["']/g) || [];
        
        console.log('Found potential API patterns:');
        if (apiMatches.length > 0) {
            console.log('API paths:', [...new Set(apiMatches)]);
        }
        if (endpointMatches.length > 0) {
            console.log('Generate endpoints:', [...new Set(endpointMatches)]);
        }
        if (jsMatches.length > 0) {
            console.log('JavaScript files:', [...new Set(jsMatches.map(m => m.match(/src=["']([^"']*)["']/)[1]))]);
        }
        
    } catch (error) {
        console.log('Failed to fetch HTML:', error.message);
    }
    
    // Test if there's a specific API endpoint structure
    console.log('\n2. Testing common API patterns...\n');
    
    const apiPatterns = [
        '/api/image/generate',
        '/api/v1/image/generate', 
        '/v1/image/generate',
        '/image/generate',
        '/generate/image',
        '/api/generate-image',
        '/api/create-image'
    ];
    
    for (const pattern of apiPatterns) {
        const url = `${baseUrl}${pattern}`;
        try {
            console.log(`Testing: ${url}`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: 'a cat'
                })
            });
            
            console.log(`Status: ${response.status}`);
            console.log(`Content-Type: ${response.headers.get('content-type')}`);
            
            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('image')) {
                    console.log('✅ FOUND WORKING API ENDPOINT!');
                    const buffer = await response.buffer();
                    const fs = await import('fs');
                    const fileName = `magic_studio_api_${Date.now()}.png`;
                    fs.writeFileSync(fileName, buffer);
                    console.log(`💾 Image saved: ${fileName}`);
                    console.log(`🎯 Exact endpoint: ${url}`);
                    return url;
                } else {
                    const text = await response.text();
                    console.log(`Response: ${text.substring(0, 200)}...`);
                }
            } else {
                console.log(`Failed: ${response.status}`);
            }
        } catch (error) {
            console.log(`Error: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Check if it requires specific headers or authentication
    console.log('\n3. Testing with various authentication headers...\n');
    
    const authHeaders = [
        { name: 'No auth', headers: {} },
        { name: 'Bearer token', headers: { 'Authorization': 'Bearer test-token' } },
        { name: 'API Key', headers: { 'X-API-Key': 'test-key' } },
        { name: 'Custom auth', headers: { 'X-Auth-Token': 'test' } }
    ];
    
    for (const auth of authHeaders) {
        const url = `${baseUrl}/api/generate`;
        try {
            console.log(`Testing ${auth.name}: ${url}`);
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Content-Type': 'application/json',
                ...auth.headers
            };
            
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    prompt: 'a cat'
                })
            });
            
            console.log(`Status: ${response.status}`);
            if (!response.ok) {
                const errorText = await response.text();
                console.log(`Error: ${errorText.substring(0, 100)}...`);
            }
        } catch (error) {
            console.log(`Request failed: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n4. Checking if it uses form data instead of JSON...\n');
    
    // Try form data approach
    const formData = new URLSearchParams();
    formData.append('prompt', 'a cat');
    
    try {
        const response = await fetch(`${baseUrl}/generate`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });
        
        console.log(`Form data POST status: ${response.status}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        
        if (response.ok && response.headers.get('content-type')?.includes('image')) {
            console.log('✅ Form data approach works!');
            const buffer = await response.buffer();
            const fs = await import('fs');
            const fileName = `magic_studio_form_${Date.now()}.png`;
            fs.writeFileSync(fileName, buffer);
            console.log(`💾 Image saved: ${fileName}`);
            return `${baseUrl}/generate (form data)`;
        }
    } catch (error) {
        console.log(`Form data failed: ${error.message}`);
    }
    
    console.log('\n❌ Could not determine the exact working endpoint');
    console.log('The API might be:');
    console.log('- Temporarily down');
    console.log('- Requiring specific undocumented headers');
    console.log('- Using a completely different approach than standard REST APIs');
    console.log('- Serving images through a web interface rather than direct API calls');
    
    return null;
}

// Run the investigation
investigateMagicStudioAPI().then(result => {
    if (result) {
        console.log(`\n🎉 SUCCESS: ${result}`);
    } else {
        console.log('\n🔧 Investigation complete - no working endpoint found');
    }
}).catch(error => {
    console.error('Investigation failed:', error);
});