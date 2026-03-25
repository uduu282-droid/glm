import fetch from 'node-fetch';

async function testMCPCoreWithSupportedModels() {
    console.log('🧪 Testing MCP Core with Supported Models');
    console.log('=========================================\n');
    
    const baseUrl = 'https://t2i.mcpcore.xyz';
    
    // Based on the error response, the supported models are: turbo, flux, flux-schnell, magic, wan
    const supportedModels = ['turbo', 'flux', 'flux-schnell', 'magic', 'wan'];
    
    for (const model of supportedModels) {
        console.log(`Testing POST /generate with model: ${model}...`);
        
        try {
            const response = await fetch(`${baseUrl}/generate`, {
                method: 'POST',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    prompt: 'a beautiful landscape',
                    model: model
                })
            });
            
            console.log(`  ${model.toUpperCase()} Status: ${response.status} ${response.statusText}`);
            console.log(`  ${model.toUpperCase()} Content-Type: ${response.headers.get('content-type')}`);
            
            const text = await response.text();
            console.log(`  ${model.toUpperCase()} Response (first 500 chars): ${text.substring(0, 500)}...`);
            
            if (response.ok && response.headers.get('content-type')?.includes('image')) {
                console.log(`  ✅ ${model.toUpperCase()} SUCCESS: Image response received!`);
            } else if (response.ok) {
                console.log(`  ✅ ${model.toUpperCase()} SUCCESS: API response received`);
            } else {
                console.log(`  ❌ ${model.toUpperCase()} FAILED: Request unsuccessful`);
            }
            
        } catch (error) {
            console.log(`  ❌ ${model.toUpperCase()} Request Failed: ${error.message}`);
        }
        
        // Wait a bit between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('');
    }
}

// Run the model-specific test
testMCPCoreWithSupportedModels().then(() => {
    console.log('\n' + '='.repeat(50));
    console.log('🧪 MCP Core Model Testing Complete!');
}).catch(error => {
    console.error('Model testing failed:', error);
});