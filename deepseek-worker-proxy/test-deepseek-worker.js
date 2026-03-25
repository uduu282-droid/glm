import axios from 'axios';
import fs from 'fs';

const WORKER_URL = 'https://deepseek-worker-proxy.ronitshrimankar1.workers.dev'; // Update with your worker URL
const ADMIN_KEY = 'sk-admin-test-key'; // Update with your admin key

async function testDeepSeekWorker() {
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║         DEEPSEEK WORKER PROXY - COMPREHENSIVE TEST               ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');
    
    const results = {
        timestamp: new Date().toISOString(),
        tests: []
    };

    // Test 1: Health Check
    console.log('🧪 Test 1: Health Check');
    try {
        const health = await axios.get(`${WORKER_URL}/health`);
        console.log('✅ Health:', health.data);
        results.tests.push({ name: 'Health', success: true, data: health.data });
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
        results.tests.push({ name: 'Health', success: false, error: error.message });
    }

    // Test 2: List Models
    console.log('\n🧪 Test 2: Available Models');
    try {
        const models = await axios.get(`${WORKER_URL}/v1/models`);
        console.log('✅ Models available:', models.data.data.length);
        models.data.data.forEach(model => {
            console.log(`   - ${model.id} (${model.owned_by})`);
        });
        results.tests.push({ name: 'Models', success: true, data: models.data });
    } catch (error) {
        console.log('❌ Models endpoint failed:', error.message);
        results.tests.push({ name: 'Models', success: false, error: error.message });
    }

    // Test 3: Chat with deepseek-chat
    console.log('\n🧪 Test 3: Chat (deepseek-chat)');
    try {
        const start = Date.now();
        const response = await axios.post(`${WORKER_URL}/v1/chat/completions`, {
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: 'Say "Hello" in exactly 3 words' }],
            max_tokens: 20
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });
        const duration = Date.now() - start;
        
        const content = response.data.choices[0]?.message?.content;
        console.log(`✅ Response (${duration}ms): "${content}"`);
        console.log('   Tokens:', response.data.usage);
        results.tests.push({ 
            name: 'Chat (deepseek-chat)', 
            success: true, 
            duration,
            data: response.data 
        });
    } catch (error) {
        console.log('❌ Chat failed:', error.response?.data || error.message);
        results.tests.push({ name: 'Chat (deepseek-chat)', success: false, error: error.message });
    }

    // Test 4: Chat with deepseek-coder
    console.log('\n🧪 Test 4: Code Generation (deepseek-coder)');
    try {
        const start = Date.now();
        const response = await axios.post(`${WORKER_URL}/v1/chat/completions`, {
            model: 'deepseek-coder',
            messages: [{ 
                role: 'user', 
                content: 'Write a Python function to add two numbers' 
            }],
            max_tokens: 100
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });
        const duration = Date.now() - start;
        
        const content = response.data.choices[0]?.message?.content;
        console.log(`✅ Response (${duration}ms):`);
        console.log('   ' + content.split('\n')[0].substring(0, 60) + '...');
        results.tests.push({ 
            name: 'Code (deepseek-coder)', 
            success: true, 
            duration,
            data: response.data 
        });
    } catch (error) {
        console.log('❌ Code generation failed:', error.response?.data || error.message);
        results.tests.push({ name: 'Code (deepseek-coder)', success: false, error: error.message });
    }

    // Test 5: Admin Health (if admin key provided)
    console.log('\n🧪 Test 5: Admin Health Check');
    try {
        const adminHealth = await axios.get(`${WORKER_URL}/admin/health`, {
            headers: { 'Authorization': `Bearer ${ADMIN_KEY}` }
        });
        console.log('✅ Admin health check passed');
        // Show summary only (full output is ASCII art)
        const lines = adminHealth.data.split('\n');
        lines.forEach(line => {
            if (line.includes('Total Accounts') || line.includes('Healthy')) {
                console.log('  ', line);
            }
        });
        results.tests.push({ name: 'Admin Health', success: true, data: 'Check passed' });
    } catch (error) {
        console.log('❌ Admin health failed:', error.response?.status || error.message);
        results.tests.push({ name: 'Admin Health', success: false, error: error.message });
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70));
    
    const successful = results.tests.filter(t => t.success).length;
    const total = results.tests.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${total - successful}`);
    console.log(`Success Rate: ${((successful / total) * 100).toFixed(1)}%`);
    
    if (results.tests.some(t => t.name.includes('Chat') && t.success)) {
        const chatTests = results.tests.filter(t => t.name.includes('Chat') || t.name.includes('Code'));
        const avgDuration = chatTests
            .filter(t => t.duration)
            .reduce((sum, t) => sum + t.duration, 0) / chatTests.length;
        console.log(`\n⏱️ Average Response Time: ${Math.round(avgDuration)}ms`);
    }
    
    // Save results
    fs.writeFileSync('deepseek_test_results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Results saved to: deepseek_test_results.json');
    
    return results;
}

// Run tests
testDeepSeekWorker().catch(console.error);
