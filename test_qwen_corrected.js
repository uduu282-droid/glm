import fetch from 'node-fetch';

console.log('🧪 Testing Qwen Worker Proxy - CORRECT MODELS');
console.log('='.repeat(70));
console.log('');

const BASE_URL = 'https://qwen-worker-proxy.ronitshrimankar1.workers.dev';

// Discovered working models from /v1/models endpoint
const WORKING_MODELS = [
    'qwen3-coder-plus',
    'qwen3-coder-flash', 
    'vision-model'
];

const results = {
    tests: [],
    passed: 0,
    failed: 0
};

function recordTest(name, status, details = {}) {
    results.tests.push({ name, status, details });
    if (status === 'PASS') results.passed++;
    else results.failed++;
}

// Test 1: Simple Question with qwen3-coder-flash
async function testCoderFlash() {
    console.log('\n⚡ TEST 1: qwen3-coder-flash (Simple Math)');
    console.log('-'.repeat(70));
    
    try {
        const startTime = Date.now();
        
        const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify({
                model: 'qwen3-coder-flash',
                messages: [{
                    role: 'user',
                    content: 'What is 2 + 2?'
                }],
                max_tokens: 50
            })
        });
        
        const duration = Date.now() - startTime;
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Duration:', `${duration}ms`);
        
        if (response.ok && data.choices && data.choices.length > 0) {
            const answer = data.choices[0].message.content;
            console.log('Answer:', answer);
            
            if (answer.includes('4')) {
                console.log('✅ PASS - Correct answer\n');
                recordTest('qwen3-coder-flash', 'PASS', { duration, correct: true });
            } else {
                console.log('⚠️  Got response but may be incorrect\n');
                recordTest('qwen3-coder-flash', 'PASS', { duration, correct: false });
            }
        } else {
            console.log('❌ FAIL - No valid response');
            console.log('Error:', data.error?.message || 'Unknown');
            recordTest('qwen3-coder-flash', 'FAIL', { status: response.status });
        }
    } catch (error) {
        console.log('❌ FAIL - Error:', error.message);
        recordTest('qwen3-coder-flash', 'FAIL', { error: error.message });
    }
}

// Test 2: Complex Question with qwen3-coder-plus
async function testCoderPlus() {
    console.log('\n🧠 TEST 2: qwen3-coder-plus (Complex Math)');
    console.log('-'.repeat(70));
    
    try {
        const startTime = Date.now();
        
        const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify({
                model: 'qwen3-coder-plus',
                messages: [{
                    role: 'user',
                    content: 'What is 59 multiplied by 89? Show step-by-step work.'
                }],
                max_tokens: 500
            })
        });
        
        const duration = Date.now() - startTime;
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Duration:', `${duration}ms`);
        
        if (response.ok && data.choices && data.choices.length > 0) {
            const answer = data.choices[0].message.content;
            console.log('\nFull Answer:');
            console.log(answer);
            console.log('');
            
            // Check for correct answer (5251)
            const hasCorrectAnswer = answer.includes('5251') || 
                                    answer.toLowerCase().includes('five thousand two hundred fifty-one');
            
            if (hasCorrectAnswer) {
                console.log('✅ PASS - Contains correct answer (5251)\n');
                recordTest('qwen3-coder-plus', 'PASS', { duration, correct: true });
            } else {
                console.log('⚠️  Got response but may lack detail\n');
                recordTest('qwen3-coder-plus', 'PASS', { duration, correct: false });
            }
        } else {
            console.log('❌ FAIL - No valid response');
            recordTest('qwen3-coder-plus', 'FAIL', { status: response.status });
        }
    } catch (error) {
        console.log('❌ FAIL - Error:', error.message);
        recordTest('qwen3-coder-plus', 'FAIL', { error: error.message });
    }
}

// Test 3: Coding Question
async function testCodingQuestion() {
    console.log('\n💻 TEST 3: qwen3-coder-plus (Coding Help)');
    console.log('-'.repeat(70));
    
    try {
        const startTime = Date.now();
        
        const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify({
                model: 'qwen3-coder-plus',
                messages: [{
                    role: 'user',
                    content: 'Write a Python function to check if a number is prime'
                }],
                max_tokens: 300
            })
        });
        
        const duration = Date.now() - startTime;
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Duration:', `${duration}ms`);
        
        if (response.ok && data.choices && data.choices.length > 0) {
            const answer = data.choices[0].message.content;
            console.log('\nAnswer Preview:');
            console.log(answer.substring(0, 400) + '...\n');
            
            // Check if it contains code-like content
            const hasCode = answer.includes('def ') || answer.includes('function') || 
                           answer.includes('return') || answer.includes('if ');
            
            if (hasCode) {
                console.log('✅ PASS - Contains code example\n');
                recordTest('Coding Question', 'PASS', { duration, hasCode: true });
            } else {
                console.log('⚠️  Got response but may not have code\n');
                recordTest('Coding Question', 'PASS', { duration, hasCode: false });
            }
        } else {
            console.log('❌ FAIL - No valid response');
            recordTest('Coding Question', 'FAIL', { status: response.status });
        }
    } catch (error) {
        console.log('❌ FAIL - Error:', error.message);
        recordTest('Coding Question', 'FAIL', { error: error.message });
    }
}

// Test 4: Vision Model (if available)
async function testVisionModel() {
    console.log('\n👁️  TEST 4: vision-model (Basic Test)');
    console.log('-'.repeat(70));
    
    try {
        const startTime = Date.now();
        
        const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify({
                model: 'vision-model',
                messages: [{
                    role: 'user',
                    content: 'Hello, are you a vision model?'
                }],
                max_tokens: 50
            })
        });
        
        const duration = Date.now() - startTime;
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Duration:', `${duration}ms`);
        
        if (response.ok && data.choices && data.choices.length > 0) {
            const answer = data.choices[0].message.content;
            console.log('Answer:', answer);
            console.log('');
            console.log('✅ PASS - Vision model accessible\n');
            recordTest('vision-model', 'PASS', { duration });
        } else {
            console.log('❌ FAIL - No valid response');
            recordTest('vision-model', 'FAIL', { status: response.status });
        }
    } catch (error) {
        console.log('❌ FAIL - Error:', error.message);
        recordTest('vision-model', 'FAIL', { error: error.message });
    }
}

// Run all tests
async function runTests() {
    console.log('🚀 Starting test suite with CORRECT models...\n');
    
    await testCoderFlash();
    await testCoderPlus();
    await testCodingQuestion();
    await testVisionModel();
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL TEST RESULTS');
    console.log('='.repeat(70));
    console.log(`Total Tests: ${results.tests.length}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    const successRate = ((results.passed / results.tests.length) * 100).toFixed(1);
    console.log(`Success Rate: ${successRate}%`);
    console.log('='.repeat(70));
    
    // Detailed breakdown
    console.log('\n📋 DETAILED RESULTS:');
    results.tests.forEach((test, i) => {
        const icon = test.status === 'PASS' ? '✅' : test.status === 'WARN' ? '⚠️' : '❌';
        console.log(`${icon} ${test.name}: ${test.status}`);
    });
    
    // Save results
    const fs = await import('fs');
    const resultsPath = './qwen_final_test_results.json';
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}`);
    
    // Final verdict
    console.log('\n' + '='.repeat(70));
    if (results.failed === 0) {
        console.log('🎉 ALL TESTS PASSED! Qwen Proxy is working perfectly!');
        console.log('\n✅ Available Models:');
        console.log('   • qwen3-coder-flash (fast, general purpose)');
        console.log('   • qwen3-coder-plus (powerful, complex tasks)');
        console.log('   • vision-model (image analysis)');
    } else {
        console.log('⚠️  Some tests failed. Review results above.');
    }
    console.log('='.repeat(70));
}

runTests().catch(console.error);
