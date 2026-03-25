import AIApiTester from './ai_api_tester.js';

// Example usage
async function runTests() {
    const tester = new AIApiTester();
    
    const apisToTest = [
        {
            name: "featherlabs.online",
            url: "https://api.featherlabs.online/v1/chat/completions",
            description: "AI chat API with Bearer token auth",
            request: {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer sk-mWdmd2RtRTNm2ndAtceylQ'
                },
                body: {
                    "model": "GLM-5",
                    "messages": [
                        {
                            "role": "user",
                            "content": "test"
                        }
                    ]
                }
            }
        },
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

// Run the tests
runTests();