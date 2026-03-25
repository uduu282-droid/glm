import axios from 'axios';

async function testCloudflareBypass() {
    const bypassUrl = 'https://cf.zvx.workers.dev/';
    const apiKey = 'pk_live_Px9T7cai';
    const targetUrl = 'https://geminigen.ai';
    const bypassKey = '0x4AAAAAACDBydnKT0zYzh2H';
    
    console.log('🛡️ Testing Cloudflare Bypass Service');
    console.log('Bypass URL:', bypassUrl);
    console.log('Target URL:', targetUrl);
    console.log('API Key:', apiKey);
    console.log('Bypass Key:', bypassKey);
    console.log('='.repeat(50));

    // Test 1: Basic bypass request
    console.log('\n📝 Test 1: Basic bypass request');
    
    try {
        const bypassResponse = await axios.get(bypassUrl, {
            params: {
                apikey: apiKey,
                url: targetUrl,
                key: bypassKey
            },
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        console.log('✅ Bypass request SUCCESS');
        console.log('Status:', bypassResponse.status);
        console.log('Response headers:', Object.keys(bypassResponse.headers));
        console.log('Response data length:', bypassResponse.data?.length || 'No data');
        
        // Log first 500 characters of response
        if (bypassResponse.data) {
            console.log('Response preview:', 
                typeof bypassResponse.data === 'string' 
                    ? bypassResponse.data.substring(0, 500) 
                    : JSON.stringify(bypassResponse.data, null, 2).substring(0, 500)
            );
        }
        
    } catch (error) {
        console.log('❌ Bypass request FAILED');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Status Text:', error.response.statusText);
            console.log('Response Data:', 
                typeof error.response.data === 'string' 
                    ? error.response.data.substring(0, 500)
                    : JSON.stringify(error.response.data, null, 2)
            );
        } else if (error.request) {
            console.log('No response received:', error.message);
        } else {
            console.log('Error:', error.message);
        }
    }

    // Test 2: Test with different target URLs
    console.log('\n📝 Test 2: Testing different target URLs');
    
    const testUrls = [
        'https://httpbin.org/get',
        'https://api.github.com',
        'https://jsonplaceholder.typicode.com/posts/1'
    ];
    
    for (const testUrl of testUrls) {
        try {
            console.log(`\nTesting: ${testUrl}`);
            
            const response = await axios.get(bypassUrl, {
                params: {
                    apikey: apiKey,
                    url: testUrl,
                    key: bypassKey
                },
                timeout: 15000
            });
            
            console.log(`✅ ${testUrl}: SUCCESS`);
            console.log(`Status: ${response.status}`);
            console.log(`Response size: ${response.data?.length || 0} characters`);
            
        } catch (error) {
            if (error.response) {
                console.log(`❌ ${testUrl}: ${error.response.status}`);
                if (error.response.data) {
                    const errorData = typeof error.response.data === 'string' 
                        ? error.response.data.substring(0, 200)
                        : JSON.stringify(error.response.data, null, 2).substring(0, 200);
                    console.log(`Error preview: ${errorData}`);
                }
            } else {
                console.log(`❌ ${testUrl}: Connection error`);
            }
        }
    }

    // Test 3: Test POST request through bypass
    console.log('\n📝 Test 3: POST request through bypass');
    
    try {
        const postResponse = await axios.post(bypassUrl, 
            { test: 'data', message: 'Hello from bypass test' },
            {
                params: {
                    apikey: apiKey,
                    url: 'https://httpbin.org/post',
                    key: bypassKey
                },
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 20000
            }
        );
        
        console.log('✅ POST bypass SUCCESS');
        console.log('Status:', postResponse.status);
        console.log('Response data type:', typeof postResponse.data);
        
    } catch (error) {
        console.log('❌ POST bypass FAILED');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }

    // Test 4: Test with custom headers
    console.log('\n📝 Test 4: Bypass with custom headers');
    
    try {
        const headerResponse = await axios.get(bypassUrl, {
            params: {
                apikey: apiKey,
                url: 'https://httpbin.org/headers',
                key: bypassKey
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'X-Custom-Header': 'test-value'
            },
            timeout: 15000
        });
        
        console.log('✅ Custom headers test SUCCESS');
        console.log('Status:', headerResponse.status);
        
    } catch (error) {
        console.log('❌ Custom headers test FAILED');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }

    // Test 5: Check if we can bypass Cloudflare-protected sites
    console.log('\n📝 Test 5: Testing Cloudflare-protected sites');
    
    const cfSites = [
        'https://aifreeforever.com', // From previous tests
        'https://chatlyai.app'       // From previous tests
    ];
    
    for (const site of cfSites) {
        try {
            console.log(`\nTesting Cloudflare bypass for: ${site}`);
            
            const response = await axios.get(bypassUrl, {
                params: {
                    apikey: apiKey,
                    url: site,
                    key: bypassKey
                },
                timeout: 20000
            });
            
            console.log(`✅ ${site}: SUCCESS`);
            console.log(`Status: ${response.status}`);
            console.log(`Response indicates bypass: ${response.data ? 'Yes' : 'No'}`);
            
        } catch (error) {
            if (error.response) {
                console.log(`❌ ${site}: ${error.response.status}`);
                // Check if it's still Cloudflare protected
                if (error.response.status === 403 || error.response.status === 503) {
                    console.log('Site still Cloudflare protected');
                }
            } else {
                console.log(`❌ ${site}: Connection error`);
            }
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🏁 Cloudflare bypass testing completed');
}

// Run the test
testCloudflareBypass()
    .then(() => console.log('✅ All bypass tests completed'))
    .catch(error => console.log('❌ Bypass test suite failed:', error.message));