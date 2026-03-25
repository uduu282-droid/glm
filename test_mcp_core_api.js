import fetch from 'node-fetch';

async function testMCPCoreAPI() {
    console.log('🧪 Testing MCP Core API: t2i.mcpcore.xyz');
    console.log('========================================\n');
    
    const baseUrl = 'https://t2i.mcpcore.xyz';
    
    // First, test the base URL
    console.log('Testing base URL...');
    try {
        const baseResponse = await fetch(baseUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json, text/html, */*'
            }
        });
        
        console.log(`Base URL Status: ${baseResponse.status} ${baseResponse.statusText}`);
        console.log(`Base URL Content-Type: ${baseResponse.headers.get('content-type')}`);
        
        const baseText = await baseResponse.text();
        console.log(`Base URL Response (first 500 chars): ${baseText.substring(0, 500)}...`);
        
    } catch (error) {
        console.log(`❌ Base URL Request Failed: ${error.message}`);
    }
    
    // Check for potential endpoints based on common patterns
    const potentialEndpoints = [
        '/generate',
        '/api/generate',
        '/image',
        '/api/image',
        '/create',
        '/api/create'
    ];
    
    for (const endpoint of potentialEndpoints) {
        console.log(`\nTesting endpoint: ${endpoint}`);
        
        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json, */*'
                }
            });
            
            console.log(`  Status: ${response.status} ${response.statusText}`);
            console.log(`  Content-Type: ${response.headers.get('content-type')}`);
            
            const text = await response.text();
            console.log(`  Response (first 300 chars): ${text.substring(0, 300)}...`);
            
        } catch (error) {
            console.log(`  ❌ Request Failed: ${error.message}`);
        }
    }
    
    // Try with a sample prompt to see if it accepts query parameters
    console.log('\nTesting with sample prompt...');
    try {
        const promptResponse = await fetch(`${baseUrl}?prompt=test`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json, */*'
            }
        });
        
        console.log(`Prompt URL Status: ${promptResponse.status} ${promptResponse.statusText}`);
        console.log(`Prompt URL Content-Type: ${promptResponse.headers.get('content-type')}`);
        
        const promptText = await promptResponse.text();
        console.log(`Prompt URL Response (first 500 chars): ${promptText.substring(0, 500)}...`);
        
    } catch (error) {
        console.log(`❌ Prompt URL Request Failed: ${error.message}`);
    }
}

// Run the test
testMCPCoreAPI().then(() => {
    console.log('\n' + '='.repeat(50));
    console.log('🎉 MCP Core API Testing Complete!');
}).catch(error => {
    console.error('Test execution failed:', error);
});