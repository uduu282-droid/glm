import fetch from 'node-fetch';

async function testMCPCoreGeneration() {
    console.log('🧪 Testing MCP Core Image Generation Endpoint');
    console.log('===============================================\n');
    
    const baseUrl = 'https://t2i.mcpcore.xyz';
    
    // Based on the API info showing it supports MitraAi, Pollinations, MagicStudio
    // Let's try the /generate endpoint
    console.log('Testing /generate endpoint...');
    
    // Try GET request first
    try {
        console.log('Testing GET /generate...');
        const getResponse = await fetch(`${baseUrl}/generate`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });
        
        console.log(`  GET Status: ${getResponse.status} ${getResponse.statusText}`);
        console.log(`  GET Content-Type: ${getResponse.headers.get('content-type')}`);
        
        const getText = await getResponse.text();
        console.log(`  GET Response (first 500 chars): ${getText.substring(0, 500)}...`);
        
    } catch (error) {
        console.log(`  ❌ GET Request Failed: ${error.message}`);
    }
    
    // Try POST request to /generate with sample data
    console.log('\nTesting POST /generate...');
    try {
        const postResponse = await fetch(`${baseUrl}/generate`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                prompt: 'a beautiful landscape',
                provider: 'mitraai', // Try one of the mentioned providers
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
    
    // Try with different providers
    const providers = ['mitraai', 'pollinations', 'magicstudio'];
    
    for (const provider of providers) {
        console.log(`\nTesting POST /generate with ${provider} provider...`);
        
        try {
            const providerResponse = await fetch(`${baseUrl}/generate`, {
                method: 'POST',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    prompt: 'a beautiful landscape',
                    provider: provider
                })
            });
            
            console.log(`  ${provider.toUpperCase()} Status: ${providerResponse.status} ${providerResponse.statusText}`);
            console.log(`  ${provider.toUpperCase()} Content-Type: ${providerResponse.headers.get('content-type')}`);
            
            const providerText = await providerResponse.text();
            console.log(`  ${provider.toUpperCase()} Response (first 500 chars): ${providerText.substring(0, 500)}...`);
            
        } catch (error) {
            console.log(`  ❌ ${provider.toUpperCase()} Request Failed: ${error.message}`);
        }
    }
}

// Run the generation test
testMCPCoreGeneration().then(() => {
    console.log('\n' + '='.repeat(50));
    console.log('🧪 MCP Core Generation Testing Complete!');
}).catch(error => {
    console.error('Generation testing failed:', error);
});