import fetch from 'node-fetch';
import fs from 'fs';

class ComprehensiveAPITester {
    constructor() {
        this.allEndpoints = [];
        this.workingEndpoints = [];
        this.results = [];
        this.apiCategories = {
            image: [],
            chat: [],
            search: [],
            utility: []
        };
    }

    // Discover all endpoints from the project
    discoverEndpoints() {
        // Image Generation APIs
        this.apiCategories.image = [
            {
                name: 'Ashlynn Image API (Main)',
                url: 'https://image.itz-ashlynn.workers.dev/generate',
                method: 'GET',
                params: { prompt: 'a beautiful landscape', version: 'flux', size: '1024x1024' },
                category: 'image'
            },
            {
                name: 'Ashlynn Styles API',
                url: 'https://image.itz-ashlynn.workers.dev/styles',
                method: 'GET',
                params: {},
                category: 'image'
            },
            {
                name: 'Ashlynn Base API',
                url: 'https://image.itz-ashlynn.workers.dev/',
                method: 'GET',
                params: {},
                category: 'image'
            },
            {
                name: 'Text to Image API',
                url: 'https://text-to-img.apis-bj-devs.workers.dev/',
                method: 'GET',
                params: { prompt: 'cute girl' },
                category: 'image'
            },
            {
                name: 'SeaArt AI API',
                url: 'https://seaart-ai.apis-bj-devs.workers.dev/',
                method: 'GET',
                params: { Prompt: 'a cute boy' },
                category: 'image'
            },
            {
                name: 'AI Free Forever API',
                url: 'https://aifreeforever.com/api/generate-image',
                method: 'POST',
                params: {
                    prompt: 'A beautiful sunset over mountains',
                    resolution: '1024 × 1024 (Square)',
                    speed_mode: 'Unsqueezed 🍋 (highest quality)',
                    output_format: 'webp',
                    output_quality: 100,
                    seed: -1,
                    model_type: 'fast'
                },
                category: 'image'
            },
            {
                name: 'Magic Studio API',
                url: 'https://magic-studio.ziddi-beatz.workers.dev/',
                method: 'GET',
                params: { prompt: 'a cat' },
                category: 'image'
            },
            {
                name: 'Flux Demo API',
                url: 'https://fast-flux-demo.replicate.workers.dev/api/generate-image',
                method: 'GET',
                params: { text: 'A beautiful sunset' },
                category: 'image'
            },
            {
                name: 'Diffusion AI API',
                url: 'https://diffusion-ai.bjcoderx.workers.dev/',
                method: 'GET',
                params: { prompt: 'a cute baby' },
                category: 'image'
            }
        ];

        // Chat/LLM APIs
        this.apiCategories.chat = [
            {
                name: 'Mixhubai Chat API',
                url: 'https://mixhubai.com/api/chat',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_API_KEY_HERE'
                },
                params: {
                    messages: [{ role: "user", content: "Hello, test message" }],
                    model: "gpt-4"
                },
                category: 'chat'
            },
            {
                name: 'GLM Chat API',
                url: 'https://api.featherlabs.online/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer vtx-RUmIksxLD8Qf8njF3JsMXLqICnZEohaM',
                    'Content-Type': 'application/json'
                },
                params: {
                    model: "glm-4.7",
                    messages: [{ role: "user", content: "Hello" }]
                },
                category: 'chat'
            },
            {
                name: 'Orbit Provider API',
                url: 'https://api.orbit-provider.com/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer sk-orbit-6***3cba',
                    'Content-Type': 'application/json'
                },
                params: {
                    model: "claude-sonnet-4-5-20250929",
                    messages: [{ role: "user", content: "Hello" }]
                },
                category: 'chat'
            },
            {
                name: 'NVIDIA API',
                url: 'https://integrate.api.nvidia.com/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer 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',
                    'Content-Type': 'application/json'
                },
                params: {
                    model: "meta/llama-3.1-405b-instruct",
                    messages: [{ role: "user", content: "Hello" }],
                    temperature: 0.7,
                    max_tokens: 1024
                },
                category: 'chat'
            },
            {
                name: 'Chat100 API',
                url: 'https://api.chat100.ai/aimodels/api/v1/ai/chatAll/chat',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': 'Bearer YOUR_API_KEY_HERE',
                    'uniqueid': 'test-unique-id',
                    'verify': 'test-verify-token'
                },
                params: {
                    messages: [{ role: "user", content: "Hello" }]
                },
                category: 'chat'
            }
        ];

        // Search APIs
        this.apiCategories.search = [
            {
                name: 'Exa.ai Search API',
                url: 'https://api.exa.ai/search',
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-api-key': '96e0fcca-9781-4785-b71e-c77ed653f168'
                },
                params: {
                    query: "latest AI developments",
                    type: "neural"
                },
                category: 'search'
            },
            {
                name: 'Google Geocoding API',
                url: 'https://maps.googleapis.com/maps/api/geocode/json',
                method: 'GET',
                params: { 
                    address: 'New York',
                    key: 'AIzaSyAeU_ij0fhCNAjYiKbxyco-DmSib2hwuTI'
                },
                category: 'search'
            }
        ];

        // Utility APIs
        this.apiCategories.utility = [
            {
                name: 'Firebase Installations API',
                url: 'https://firebaseinstallations.googleapis.com/v1/projects/chatai-c30fc/installations',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                    'X-Android-Package': 'com.horsemen.ai.chat.gpt',
                    'X-Android-Cert': '6F9EC5DDB6C10EF65586CCBFFBFE8CF87785E389',
                    'x-goog-api-key': 'AIzaSyBQmhLBBmUHeZmzKQSgmiX17Izbbk-KBGs',
                    'User-Agent': 'Dalvik/2.1.0 (Linux; Android 12; SM-S9280)',
                    'Host': 'firebaseinstallations.googleapis.com',
                    'Connection': 'keep-alive'
                },
                params: {
                    "fid": "cKj9ZfM8R3S7W1A0",
                    "appId": "1:539313859520:android:0e4437f86ac2013becf625",
                    "authVersion": "FIS_v2",
                    "sdkVersion": "a:17.0.0"
                },
                category: 'utility'
            }
        ];

        // Flatten all endpoints
        Object.values(this.apiCategories).forEach(category => {
            this.allEndpoints.push(...category);
        });
    }

    async testEndpoint(endpoint) {
        console.log(`\n🧪 Testing: ${endpoint.name}`);
        console.log(`Category: ${endpoint.category}`);
        console.log(`URL: ${endpoint.url}`);
        
        try {
            let fullUrl = endpoint.url;
            let body = null;
            let headers = endpoint.headers || {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            };
            
            if (endpoint.method === 'GET' && Object.keys(endpoint.params).length > 0) {
                const queryParams = new URLSearchParams(endpoint.params);
                fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryParams.toString();
            } else if (endpoint.method === 'POST') {
                body = JSON.stringify(endpoint.params);
                if (!headers['Content-Type']) {
                    headers['Content-Type'] = 'application/json';
                }
            }
            
            console.log(`Full URL: ${fullUrl}`);
            
            const response = await fetch(fullUrl, {
                method: endpoint.method,
                headers: headers,
                body: body,
                timeout: 30000
            });
            
            const result = {
                name: endpoint.name,
                url: endpoint.url,
                category: endpoint.category,
                method: endpoint.method,
                status: response.status,
                success: response.ok,
                contentType: response.headers.get('content-type') || 'unknown'
            };
            
            console.log(`Status: ${response.status} ${response.statusText}`);
            console.log(`Content-Type: ${result.contentType}`);
            
            if (response.ok) {
                console.log('✅ SUCCESS');
                this.workingEndpoints.push(result);
                
                // Try to get response content for verification
                try {
                    if (result.contentType.includes('image')) {
                        const buffer = await response.buffer();
                        result.responseType = 'image';
                        result.size = buffer.length;
                        console.log(`Image size: ${buffer.length} bytes`);
                    } else {
                        const text = await response.text();
                        result.responseType = 'text/json';
                        result.preview = text.substring(0, 100);
                        console.log(`Response preview: ${result.preview}...`);
                    }
                } catch (e) {
                    result.responseType = 'unknown';
                }
            } else {
                console.log(`❌ FAILED: ${response.status}`);
                try {
                    const errorText = await response.text();
                    result.error = errorText.substring(0, 100);
                } catch (e) {
                    result.error = 'Could not read error response';
                }
            }
            
            this.results.push(result);
            return result;
            
        } catch (error) {
            console.log(`❌ REQUEST FAILED: ${error.message}`);
            const result = {
                name: endpoint.name,
                url: endpoint.url,
                category: endpoint.category,
                method: endpoint.method,
                success: false,
                error: error.message
            };
            this.results.push(result);
            return result;
        }
    }

    async testAllEndpoints() {
        console.log('🔍 Comprehensive API Testing Started');
        console.log('====================================\n');
        
        this.discoverEndpoints();
        
        console.log(`Total endpoints to test: ${this.allEndpoints.length}`);
        console.log(`Categories: Image(${this.apiCategories.image.length}), Chat(${this.apiCategories.chat.length}), Search(${this.apiCategories.search.length}), Utility(${this.apiCategories.utility.length})\n`);
        
        // Test all endpoints slowly
        for (let i = 0; i < this.allEndpoints.length; i++) {
            const endpoint = this.allEndpoints[i];
            await this.testEndpoint(endpoint);
            
            // Small delay between requests to be respectful
            if (i < this.allEndpoints.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }
        
        // Generate results files
        this.generateResultsFiles();
        this.displaySummary();
        
        return { results: this.results, workingEndpoints: this.workingEndpoints };
    }

    generateResultsFiles() {
        // Generate clean TXT file with only working endpoints
        const workingFile = 'ALL_WORKING_APIS.txt';
        let content = 'ALL WORKING API ENDPOINTS\n';
        content += '=========================\n\n';
        content += `Last Updated: ${new Date().toISOString()}\n`;
        content += `Total Working Endpoints: ${this.workingEndpoints.length}\n\n`;
        
        // Group by category
        const categories = {};
        this.workingEndpoints.forEach(endpoint => {
            if (!categories[endpoint.category]) {
                categories[endpoint.category] = [];
            }
            categories[endpoint.category].push(endpoint);
        });
        
        Object.keys(categories).forEach(category => {
            content += `\n${category.toUpperCase()} APIs (${categories[category].length} working):\n`;
            content += '='.repeat(50) + '\n';
            
            categories[category].forEach((endpoint, index) => {
                content += `${index + 1}. ${endpoint.name}\n`;
                content += `   URL: ${endpoint.url}\n`;
                content += `   Method: ${endpoint.method}\n`;
                content += `   Status: ${endpoint.status}\n`;
                if (endpoint.responseType === 'image') {
                    content += `   Response: Direct image data (${endpoint.size} bytes)\n`;
                } else if (endpoint.responseType === 'text/json') {
                    content += `   Response: ${endpoint.preview}...\n`;
                }
                content += '\n';
            });
        });
        
        fs.writeFileSync(workingFile, content);
        console.log(`\n💾 Working endpoints saved to: ${workingFile}`);
        
        // Generate full report
        const fullReport = 'FULL_API_TEST_REPORT.txt';
        let fullContent = 'FULL API TESTING REPORT\n';
        fullContent += '======================\n\n';
        fullContent += `Test Date: ${new Date().toISOString()}\n`;
        fullContent += `Total Endpoints Tested: ${this.results.length}\n`;
        fullContent += `Working Endpoints: ${this.workingEndpoints.length}\n`;
        fullContent += `Failed Endpoints: ${this.results.length - this.workingEndpoints.length}\n\n`;
        
        fullContent += 'DETAILED RESULTS:\n';
        fullContent += '================\n\n';
        
        this.results.forEach((result, index) => {
            fullContent += `${index + 1}. ${result.name}\n`;
            fullContent += `   Category: ${result.category}\n`;
            fullContent += `   URL: ${result.url}\n`;
            fullContent += `   Method: ${result.method}\n`;
            fullContent += `   Status: ${result.status || 'ERROR'}\n`;
            fullContent += `   Success: ${result.success ? '✅' : '❌'}\n`;
            if (result.error) {
                fullContent += `   Error: ${result.error}\n`;
            }
            if (result.preview) {
                fullContent += `   Response Preview: ${result.preview}...\n`;
            }
            fullContent += '\n';
        });
        
        fs.writeFileSync(fullReport, fullContent);
        console.log(`💾 Full report saved to: ${fullReport}`);
    }

    displaySummary() {
        console.log('\n' + '='.repeat(70));
        console.log('📊 COMPREHENSIVE API TESTING SUMMARY');
        console.log('='.repeat(70));
        
        console.log(`\nTotal endpoints tested: ${this.results.length}`);
        console.log(`Working endpoints: ${this.workingEndpoints.length}`);
        console.log(`Failed endpoints: ${this.results.length - this.workingEndpoints.length}`);
        
        // Show working endpoints by category
        console.log('\n✅ WORKING ENDPOINTS BY CATEGORY:');
        console.log('-'.repeat(50));
        
        const workingByCategory = {};
        this.workingEndpoints.forEach(endpoint => {
            if (!workingByCategory[endpoint.category]) {
                workingByCategory[endpoint.category] = [];
            }
            workingByCategory[endpoint.category].push(endpoint);
        });
        
        Object.keys(workingByCategory).forEach(category => {
            console.log(`\n${category.toUpperCase()} (${workingByCategory[category].length} working):`);
            workingByCategory[category].forEach(endpoint => {
                console.log(`  🟢 ${endpoint.name}`);
                console.log(`     URL: ${endpoint.url}`);
                console.log(`     Status: ${endpoint.status}`);
            });
        });
        
        // Show failed endpoints
        console.log('\n❌ FAILED ENDPOINTS:');
        console.log('-'.repeat(50));
        const failed = this.results.filter(r => !r.success);
        failed.forEach(endpoint => {
            console.log(`\n🔴 ${endpoint.name} (${endpoint.category})`);
            console.log(`   URL: ${endpoint.url}`);
            console.log(`   Error: ${endpoint.error || `${endpoint.status}`}`);
        });
    }
}

// Run the comprehensive test
const tester = new ComprehensiveAPITester();
tester.testAllEndpoints().then(({ results, workingEndpoints }) => {
    console.log('\n🎉 Comprehensive API testing complete!');
    console.log(`Found ${workingEndpoints.length} working endpoints out of ${results.length} total.`);
}).catch(error => {
    console.error('Testing failed:', error);
});