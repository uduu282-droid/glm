import fetch from 'node-fetch';

async function exploreMCPCoreAPI() {
    console.log('🔍 Exploring MCP Core API Endpoints');
    console.log('====================================\n');
    
    const baseUrl = 'https://t2i.mcpcore.xyz';
    
    // Based on the initial response, let's test the available endpoints
    const knownEndpoints = [
        '/docs',
        '/swagger', 
        '/health',
        '/stats'
    ];
    
    for (const endpoint of knownEndpoints) {
        console.log(`Testing endpoint: ${endpoint}`);
        
        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json, text/html, */*'
                }
            });
            
            console.log(`  Status: ${response.status} ${response.statusText}`);
            console.log(`  Content-Type: ${response.headers.get('content-type')}`);
            
            const text = await response.text();
            console.log(`  Response (first 300 chars): ${text.substring(0, 300)}...`);
            
        } catch (error) {
            console.log(`  ❌ Request Failed: ${error.message}`);
        }
        
        console.log('');
    }
    
    // Check if it has a generate endpoint that might require POST
    console.log('Testing potential image generation...');
    
    // Try to see if it accepts POST requests to the root
    try {
        console.log('Testing POST to root endpoint...');
        const postResponse = await fetch(`${baseUrl}`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                prompt: 'test image',
                model: 'default'
            })
        });
        
        console.log(`  POST Status: ${postResponse.status} ${postResponse.statusText}`);
        console.log(`  POST Content-Type: ${postResponse.headers.get('content-type')}`);
        
        const postText = await postResponse.text();
        console.log(`  POST Response (first 500 chars): ${postText.substring(0, 500)}...`);
        
    } catch (error) {
        console.log(`  ❌ POST Request Failed: ${error.message}`);
    }
}

// Run the exploration
exploreMCPCoreAPI().then(() => {
    console.log('\n' + '='.repeat(50));
    console.log('🔍 MCP Core API Exploration Complete!');
}).catch(error => {
    console.error('Exploration failed:', error);
});