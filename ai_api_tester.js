import fetch from 'node-fetch';
import https from 'https';

// Disable SSL certificate validation for testing purposes (not recommended for production)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

class AIApiTester {
    constructor() {
        this.results = [];
    }

    // Test CORS preflight
    async testCorsPreflight(url, options = {}) {
        console.log(`\n🧪 Testing CORS preflight for: ${url}`);
        
        const urlObj = new URL(url);
        const optionsConfig = {
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: 'OPTIONS',
            headers: {
                'Origin': options.origin || 'https://localhost',
                'Access-Control-Request-Method': options.method || 'POST',
                'Access-Control-Request-Headers': options.headers || 'content-type,authorization',
                'User-Agent': 'Mozilla/5.0 (compatible; AI API Tester)'
            }
        };

        return new Promise((resolve, reject) => {
            const req = https.request(optionsConfig, (res) => {
                const corsResult = {
                    url,
                    method: 'OPTIONS',
                    statusCode: res.statusCode,
                    headers: res.headers,
                    success: res.statusCode === 200 || res.statusCode === 204,
                    corsEnabled: res.headers['access-control-allow-origin'] ? true : false
                };
                
                console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
                console.log(`   CORS Enabled: ${corsResult.corsEnabled}`);
                console.log(`   Allow-Origin: ${res.headers['access-control-allow-origin'] || 'None'}`);
                
                resolve(corsResult);
            });

            req.on('error', (error) => {
                console.error(`   ❌ Request failed:`, error.message);
                reject(error);
            });

            req.end();
        });
    }

    // Generic API test
    async testApi(url, config = {}) {
        console.log(`\n📡 Testing API: ${url}`);
        
        const defaultConfig = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; AI API Tester)',
            },
            body: JSON.stringify({
                messages: [{
                    role: "user",
                    content: "Hello, this is a test message"
                }],
                model: config.model || "gpt-3.5-turbo"
            }),
            timeout: 10000
        };
        
        const finalConfig = { ...defaultConfig, ...config };
        
        if (typeof finalConfig.body === 'object') {
            finalConfig.body = JSON.stringify(finalConfig.body);
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeout);

            const response = await fetch(url, {
                ...finalConfig,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const result = {
                url,
                method: finalConfig.method,
                statusCode: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                success: response.ok,
                contentType: response.headers.get('content-type'),
                responseTime: Date.now() - Date.now() // Placeholder - would need to measure properly
            };

            // Handle different response types
            if (result.contentType && result.contentType.includes('text/event-stream')) {
                console.log(`   Status: ${response.status} (Streaming response)`);
                result.isStreaming = true;
                
                // For streaming responses, just read a bit to confirm it works
                const reader = response.body.getReader();
                const { value, done } = await reader.read();
                if (!done) {
                    const chunk = new TextDecoder().decode(value);
                    result.sampleResponse = chunk.substring(0, 200) + '...';
                }
                reader.releaseLock();
            } else {
                const responseBody = await response.text();
                result.responseBody = responseBody;
                
                try {
                    result.parsedResponse = JSON.parse(responseBody);
                } catch (e) {
                    // Response is not JSON
                }
                
                console.log(`   Status: ${response.status} ${response.statusText}`);
                console.log(`   Type: ${result.contentType || 'unknown'}`);
            }

            console.log(`   Success: ${result.success ? '✅' : '❌'}`);
            
            if (!result.success) {
                console.log(`   Error: ${result.parsedResponse?.error || result.responseBody || 'Unknown error'}`);
            }

            return result;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log(`   ⏱️  Timeout after ${finalConfig.timeout}ms`);
            } else {
                console.log(`   ❌ Request failed:`, error.message);
            }
            
            return {
                url,
                success: false,
                error: error.message,
                timedOut: error.name === 'AbortError'
            };
        }
    }

    // Comprehensive test for an API endpoint
    async comprehensiveTest(apiConfig) {
        console.log(`\n🚀 Starting comprehensive test for: ${apiConfig.name || apiConfig.url}`);
        console.log(`   URL: ${apiConfig.url}`);
        console.log(`   Description: ${apiConfig.description || 'No description'}`);

        const results = {
            api: apiConfig,
            cors: null,
            apiCall: null,
            timestamp: new Date().toISOString()
        };

        try {
            // Test CORS preflight
            if (apiConfig.testCors !== false) {
                results.cors = await this.testCorsPreflight(apiConfig.url);
            }

            // Test API call
            results.apiCall = await this.testApi(apiConfig.url, apiConfig.request || {});

            // Analyze results
            this.analyzeResults(results);

            return results;
        } catch (error) {
            console.error(`   ❌ Test failed:`, error.message);
            return { ...results, error: error.message };
        }
    }

    // Analyze test results and provide recommendations
    analyzeResults(results) {
        console.log(`\n📋 Analysis for ${results.api.name || results.api.url}:`);

        if (results.cors) {
            if (results.cors.success) {
                console.log(`   ✅ CORS: Configured properly`);
            } else {
                console.log(`   ❌ CORS: Issues detected (${results.cors.statusCode})`);
            }
        }

        if (results.apiCall) {
            if (results.apiCall.success) {
                console.log(`   ✅ API: Accessible (${results.apiCall.statusCode})`);
                
                // Check for common authentication errors
                const responseBody = results.apiCall.responseBody || '';
                const parsed = results.apiCall.parsedResponse;
                
                if (parsed?.error?.toLowerCase().includes('auth') || 
                    responseBody.toLowerCase().includes('auth') ||
                    results.apiCall.statusCode === 401 || 
                    results.apiCall.statusCode === 403) {
                    console.log(`   🚨 Authentication required - need API key or tokens`);
                } else if (parsed?.error?.toLowerCase().includes('turn') || 
                          responseBody.toLowerCase().includes('turnstile')) {
                    console.log(`   🚨 Browser verification required - Cloudflare Turnstile detected`);
                } else if (results.apiCall.statusCode === 200) {
                    console.log(`   🎯 API working correctly!`);
                }
            } else {
                console.log(`   ❌ API: Not accessible (${results.apiCall.statusCode})`);
                
                if (results.apiCall.error) {
                    console.log(`      Error: ${results.apiCall.error}`);
                }
            }
        }

        // Provide specific recommendations based on response
        if (results.apiCall?.statusCode === 401 || results.apiCall?.statusCode === 403) {
            console.log(`   💡 Recommendation: API requires authentication. Try adding API keys to headers.`);
        } else if (results.apiCall?.parsedResponse?.error?.toLowerCase().includes('turnstile')) {
            console.log(`   💡 Recommendation: API requires browser verification. May need to use browser automation.`);
        } else if (results.apiCall?.statusCode >= 500) {
            console.log(`   💡 Recommendation: Server error. API might be temporarily unavailable.`);
        } else if (results.apiCall?.statusCode === 429) {
            console.log(`   💡 Recommendation: Rate limited. Add delays between requests.`);
        }
    }

    // Run tests on multiple APIs
    async runMultipleTests(apiConfigs) {
        console.log('🤖 Starting batch API testing...\n');
        
        const results = [];
        for (const config of apiConfigs) {
            const result = await this.comprehensiveTest(config);
            results.push(result);
            
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        return results;
    }
}

// Example usage
async function runTests() {
    const tester = new AIApiTester();
    
    const apisToTest = [
        {
            name: "chat100.ai",
            url: "https://api.chat100.ai/aimodels/api/v1/ai/chatAll/chat",
            description: "AI chat API with Turnstile protection",
            request: {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': 'Bearer YOUR_API_KEY_HERE',
                    'uniqueid': 'test-unique-id',
                    'verify': 'test-verify-token'
                }
            }
        },
        {
            name: "mixhubai.com",
            url: "https://mixhubai.com/api/chat",
            description: "AI chat API with API key auth",
            request: {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_API_KEY_HERE'
                }
            }
        }
    ];
    
    await tester.runMultipleTests(apisToTest);
}

export default AIApiTester;

// Export for direct use
if (typeof require !== 'undefined' && require.main === module) {
    runTests();
}