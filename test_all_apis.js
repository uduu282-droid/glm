import fetch from 'node-fetch';

// Comprehensive API testing with all endpoints
class ComprehensiveAPITester {
    constructor() {
        this.results = [];
    }

    async testAPI(name, url, headers, payload, expectedModel = null) {
        console.log(`\n🚀 Testing ${name}`);
        console.log(`URL: ${url}`);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            const result = {
                name: name,
                url: url,
                status: response.status,
                statusText: response.statusText,
                success: response.ok,
                timestamp: new Date().toISOString()
            };

            console.log(`Status: ${response.status} ${response.statusText}`);
            
            const responseBody = await response.text();
            result.responseBody = responseBody;
            
            try {
                result.parsedResponse = JSON.parse(responseBody);
                console.log('Response:', JSON.stringify(result.parsedResponse, null, 2));
            } catch (e) {
                console.log('Raw response:', responseBody.substring(0, 200) + '...');
            }

            if (response.ok) {
                console.log(`✅ ${name} test successful!`);
            } else {
                console.log(`❌ ${name} returned error: ${response.status}`);
                if (result.parsedResponse?.error) {
                    console.log(`Error message: ${result.parsedResponse.error}`);
                }
            }

            this.results.push(result);
            return result;

        } catch (error) {
            const result = {
                name: name,
                url: url,
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            console.log(`❌ ${name} request failed: ${error.message}`);
            this.results.push(result);
            return result;
        }
    }

    // Test all APIs
    async runAllTests() {
        console.log('🤖 Starting comprehensive API testing with updated keys...\n');

        // 1. NVIDIA API with new key
        await this.testAPI(
            'NVIDIA API',
            'https://integrate.api.nvidia.com/v1/chat/completions',
            {
                'Authorization': 'Bearer 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',
                'Content-Type': 'application/json'
            },
            {
                "model": "moonshotai/kimi-k2-5",
                "messages": [{"role": "user", "content": "Hello"}]
            }
        );

        // 2. Orbit Provider API
        await this.testAPI(
            'Orbit Provider API',
            'https://api.orbit-provider.com/v1/chat/completions',
            {
                'Authorization': 'Bearer sk-orbit-6***3cba',
                'Content-Type': 'application/json'
            },
            {
                "model": "claude-sonnet-4-5-20250929",
                "messages": [{"role": "user", "content": "Hello"}]
            }
        );

        // 3. GLM API (using the working domain)
        await this.testAPI(
            'GLM API',
            'https://api.featherlabs.online/v1/chat/completions',
            {
                'Authorization': 'Bearer vtx-RUmIksxLD8Qf8njF3JsMXLqICnZEohaM',
                'Content-Type': 'application/json'
            },
            {
                "model": "glm-4.7",
                "messages": [{"role": "user", "content": "Hello"}]
            }
        );

        // 4. Mixhubai API
        await this.testAPI(
            'Mixhubai API',
            'https://mixhubai.com/api/chat',
            {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_API_KEY_HERE'
            },
            {
                "messages": [{"role": "user", "content": "Hello"}]
            }
        );

        // 5. Chat100 API
        await this.testAPI(
            'Chat100 API',
            'https://api.chat100.ai/aimodels/api/v1/ai/chatAll/chat',
            {
                'Content-Type': 'application/json',
                'authorization': 'Bearer YOUR_API_KEY_HERE',
                'uniqueid': 'test-unique-id',
                'verify': 'test-verify-token'
            },
            {
                "messages": [{"role": "user", "content": "Hello"}]
            }
        );

        // 6. Firebase Installations API (should work)
        await this.testAPI(
            'Firebase Installations API',
            'https://firebaseinstallations.googleapis.com/v1/projects/chatai-c30fc/installations',
            {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
                'X-Android-Package': 'com.horsemen.ai.chat.gpt',
                'X-Android-Cert': '6F9EC5DDB6C10EF65586CCBFFBFE8CF87785E389',
                'x-goog-api-key': 'AIzaSyBQmhLBBmUHeZmzKQSgmiX17Izbbk-KBGs',
                'User-Agent': 'Dalvik/2.1.0 (Linux; Android 12; SM-S9280)',
                'Host': 'firebaseinstallations.googleapis.com',
                'Connection': 'keep-alive',
            },
            {
                "fid": "cKj9ZfM8R3S7W1A0",
                "appId": "1:539313859520:android:0e4437f86ac2013becf625",
                "authVersion": "FIS_v2",
                "sdkVersion": "a:17.0.0"
            }
        );

        // Summary
        this.printSummary();
    }

    printSummary() {
        console.log('\n📊 === TEST SUMMARY ===');
        console.log(`Total APIs tested: ${this.results.length}`);
        
        const successful = this.results.filter(r => r.success).length;
        const failed = this.results.filter(r => !r.success).length;
        
        console.log(`Successful: ${successful}`);
        console.log(`Failed: ${failed}`);
        
        console.log('\nDetailed Results:');
        this.results.forEach((result, index) => {
            const status = result.success ? '✅' : '❌';
            console.log(`${index + 1}. ${result.name}: ${status} (${result.status || 'ERROR'})`);
        });
    }
}

// Run all tests
const tester = new ComprehensiveAPITester();
await tester.runAllTests();