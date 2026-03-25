// Comprehensive MU-Devs API Test Suite
import axios from 'axios';

class MUDevsTester {
    constructor() {
        this.baseUrl = 'https://mu-devs.vercel.app';
        this.endpoint = '/generate';
        this.results = [];
    }

    async testEndpoint(prompt, model = 'flux', testName = 'Test') {
        console.log(`\n🧪 ${testName}`);
        console.log(`Model: ${model} | Prompt: "${prompt}"`);
        
        const startTime = Date.now();
        
        try {
            const response = await axios.post(
                `${this.baseUrl}${this.endpoint}`,
                { prompt, model },
                { 
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 120000 // 2 minute timeout
                }
            );
            
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            const data = response.data;
            
            if (data.success) {
                console.log(`✅ SUCCESS (${duration}s)`);
                console.log(`   Image URL: ${data.image_url}`);
                
                this.results.push({
                    test: testName,
                    success: true,
                    model,
                    duration: parseFloat(duration),
                    imageUrl: data.image_url,
                    status: response.status
                });
                
                return { success: true, ...data, duration };
            } else {
                console.log(`❌ API Error (${duration}s): ${data.error}`);
                this.results.push({
                    test: testName,
                    success: false,
                    error: data.error,
                    duration: parseFloat(duration)
                });
                return { success: false, ...data, duration };
            }
            
        } catch (error) {
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`❌ Request Failed (${duration}s): ${error.message}`);
            
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Data: ${JSON.stringify(error.response.data)}`);
            }
            
            this.results.push({
                test: testName,
                success: false,
                error: error.message,
                duration: parseFloat(duration),
                status: error.response?.status
            });
            
            return { success: false, error: error.message, duration };
        }
    }

    async runAllTests() {
        console.log('🚀 Starting Comprehensive MU-Devs API Tests\n');
        console.log('=' .repeat(60));
        
        // Test 1: Basic functionality with flux model
        await this.testEndpoint(
            'A cute cat wearing sunglasses on a beach at sunset',
            'flux',
            'Test 1: Basic Functionality (Flux)'
        );
        
        await this.sleep(3000);
        
        // Test 2: Test fluxpro model
        await this.testEndpoint(
            'A futuristic cyberpunk city with neon lights at night',
            'fluxpro',
            'Test 2: Flux Pro Model'
        );
        
        await this.sleep(3000);
        
        // Test 3: Different art style
        await this.testEndpoint(
            'A magical forest with glowing mushrooms and fairies, digital art',
            'flux',
            'Test 3: Fantasy Art Style'
        );
        
        await this.sleep(3000);
        
        // Test 4: Portrait orientation concept
        await this.testEndpoint(
            'Portrait of a wise old wizard with long beard',
            'flux',
            'Test 4: Character Portrait'
        );
        
        await this.sleep(3000);
        
        // Test 5: Abstract concept
        await this.testEndpoint(
            'Abstract representation of time and space, surrealism',
            'fluxpro',
            'Test 5: Abstract Concept (Flux Pro)'
        );
        
        await this.sleep(3000);
        
        // Test 6: Landscape
        await this.testEndpoint(
            'Beautiful mountain landscape with lake reflection at sunrise',
            'flux',
            'Test 6: Landscape Photography Style'
        );
        
        await this.sleep(3000);
        
        // Test 7: Simple object
        await this.testEndpoint(
            'A red apple on a wooden table',
            'flux',
            'Test 7: Simple Object (Quick Test)'
        );
        
        // Generate summary
        await this.generateSummary();
        
        return this.results;
    }

    async generateSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 COMPREHENSIVE TEST SUMMARY');
        console.log('='.repeat(60));
        
        const totalTests = this.results.length;
        const successful = this.results.filter(r => r.success).length;
        const failed = totalTests - successful;
        const successRate = ((successful / totalTests) * 100).toFixed(1);
        
        const successfulTests = this.results.filter(r => r.success);
        const avgDuration = successfulTests.length > 0 
            ? (successfulTests.reduce((sum, r) => sum + r.duration, 0) / successfulTests.length).toFixed(2)
            : 0;
        
        const minDuration = successfulTests.length > 0 
            ? Math.min(...successfulTests.map(r => r.duration)).toFixed(2)
            : 0;
        
        const maxDuration = successfulTests.length > 0
            ? Math.max(...successfulTests.map(r => r.duration)).toFixed(2)
            : 0;
        
        // Model breakdown
        const fluxTests = this.results.filter(r => r.model === 'flux');
        const fluxProTests = this.results.filter(r => r.model === 'fluxpro');
        
        console.log(`\n📈 Overall Statistics:`);
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   Successful: ${successful} (${successRate}%)`);
        console.log(`   Failed: ${failed}`);
        console.log(`\n⏱️ Performance:`);
        console.log(`   Average Time: ${avgDuration}s`);
        console.log(`   Fastest: ${minDuration}s`);
        console.log(`   Slowest: ${maxDuration}s`);
        
        console.log(`\n🎨 Model Usage:`);
        console.log(`   Flux: ${fluxTests.length} tests (${fluxTests.filter(t => t.success).length} successful)`);
        console.log(`   Flux Pro: ${fluxProTests.length} tests (${fluxProTests.filter(t => t.success).length} successful)`);
        
        // Detailed results
        console.log(`\n📋 Detailed Results:`);
        this.results.forEach((r, i) => {
            const icon = r.success ? '✅' : '❌';
            console.log(`\n${i + 1}. ${icon} ${r.test}`);
            if (r.success) {
                console.log(`   Model: ${r.model} | Time: ${r.duration}s`);
                console.log(`   URL: ${r.imageUrl}`);
            } else {
                console.log(`   Error: ${r.error || 'Unknown error'}`);
            }
        });
        
        // Save to file
        const fs = await import('fs');
        const reportFile = 'mu_devs_detailed_results.json';
        fs.writeFileSync(reportFile, JSON.stringify({
            timestamp: new Date().toISOString(),
            summary: {
                totalTests,
                successful,
                failed,
                successRate: successRate + '%',
                averageTime: avgDuration + 's',
                minTime: minDuration + 's',
                maxTime: maxDuration + 's'
            },
            modelBreakdown: {
                flux: {
                    total: fluxTests.length,
                    successful: fluxTests.filter(t => t.success).length
                },
                fluxpro: {
                    total: fluxProTests.length,
                    successful: fluxProTests.filter(t => t.success).length
                }
            },
            results: this.results
        }, null, 2));
        
        console.log(`\n💾 Detailed results saved to: ${reportFile}`);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run tests
async function main() {
    const tester = new MUDevsTester();
    await tester.runAllTests();
}

main().catch(console.error);
