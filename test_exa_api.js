import fetch from 'node-fetch';

// Test the Exa.ai search API with JavaScript
async function testExaAPI() {
    console.log('🔍 Testing Exa.ai Search API (JavaScript)\n');
    
    const url = 'https://api.exa.ai/search';
    const apiKey = '96e0fcca-9781-4785-b71e-c77ed653f168';
    
    const headers = {
        'content-type': 'application/json',
        'x-api-key': apiKey
    };
    
    const payload = {
        "query": "Latest news on Nvidia",
        "numResults": 10,
        "type": "auto",
        "contents": {
            "highlights": {
                "maxCharacters": 4000
            }
        }
    };
    
    console.log('Request Details:');
    console.log(`URL: ${url}`);
    console.log(`API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
    console.log(`Query: ${payload.query}`);
    console.log(`Number of results: ${payload.numResults}`);
    console.log();
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });
        
        console.log(`Status Code: ${response.status}`);
        console.log(`Status Text: ${response.statusText}`);
        
        if (response.ok) {
            console.log('✅ Success! API is working');
            const data = await response.json();
            
            // Analyze the response
            if (data.results && Array.isArray(data.results)) {
                console.log(`Number of results returned: ${data.results.length}`);
                
                if (data.results.length > 0) {
                    console.log('\nFirst result preview:');
                    const firstResult = data.results[0];
                    console.log(`Title: ${firstResult.title || 'N/A'}`);
                    console.log(`URL: ${firstResult.url || 'N/A'}`);
                    console.log(`Score: ${firstResult.score || 'N/A'}`);
                    
                    if (firstResult.highlights) {
                        const highlights = firstResult.highlights;
                        console.log(`Highlights: ${highlights.length > 200 ? highlights.substring(0, 200) + '...' : highlights}`);
                    }
                } else {
                    console.log('No results found');
                }
            } else {
                console.log('Unexpected response format:');
                console.log(JSON.stringify(data, null, 2).substring(0, 500));
            }
            
        } else {
            console.log(`❌ API Error: ${response.status}`);
            const errorText = await response.text();
            console.log(`Error message: ${errorText.substring(0, 200)}`);
        }
        
    } catch (error) {
        console.error(`❌ Request failed: ${error.message}`);
    }
}

// Run the test
await testExaAPI();