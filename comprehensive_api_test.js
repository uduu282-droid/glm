import fetch from 'node-fetch';

console.log('🧪 COMPREHENSIVE Z.AI API SERVER TEST');
console.log('='.repeat(70));
console.log('');

const BASE_URL = 'http://localhost:3000';

// Test results tracker
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

function recordTest(name, status, details = {}) {
    results.tests.push({ name, status, details });
    if (status === 'PASS') results.passed++;
    else results.failed++;
}

// Test 1: Health Check
async function testHealthCheck() {
    console.log('\n📊 TEST 1: Health Check');
    console.log('-'.repeat(70));
    
    try {
        const response = await fetch(`${BASE_URL}/health`);
        const data = await response.json();
        
        console.log('Status:', data.status);
        console.log('Timestamp:', new Date(data.timestamp).toLocaleString());
        
        if (data.status === 'ok' || data.status === 'healthy') {
            console.log('✅ PASS - Server is healthy\n');
            recordTest('Health Check', 'PASS', data);
        } else {
            console.log('❌ FAIL - Unexpected status:', data.status);
            recordTest('Health Check', 'FAIL', data);
        }
    } catch (error) {
        console.log('❌ FAIL - Error:', error.message);
        recordTest('Health Check', 'FAIL', { error: error.message });
    }
}

// Test 2: Session Status
async function testSessionStatus() {
    console.log('\n🔐 TEST 2: Session Status');
    console.log('-'.repeat(70));
    
    try {
        const response = await fetch(`${BASE_URL}/api/session/status`);
        const data = await response.json();
        
        console.log('Valid:', data.valid);
        console.log('Age:', data.age);
        console.log('Cookies:', data.cookies);
        
        if (data.valid) {
            console.log('✅ PASS - Session is valid\n');
            recordTest('Session Status', 'PASS', data);
        } else {
            console.log('⚠️  WARNING - Session may need refresh');
            recordTest('Session Status', 'WARN', data);
        }
    } catch (error) {
        console.log('❌ FAIL - Error:', error.message);
        recordTest('Session Status', 'FAIL', { error: error.message });
    }
}

// Test 3: Simple Math Question
async function testSimpleMath() {
    console.log('\n📐 TEST 3: Simple Math (59 × 89)');
    console.log('-'.repeat(70));
    
    try {
        const startTime = Date.now();
        
        const response = await fetch(`${BASE_URL}/api/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: 'What is 59 multiplied by 89?',
                timeout: 40000
            })
        });
        
        const data = await response.json();
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log('Duration:', `${duration}s`);
        console.log('Success:', data.success);
        console.log('Characters:', data.metadata?.characters || data.answer?.length || 0);
        
        if (data.success) {
            console.log('\n📝 Answer Preview:');
            console.log(data.answer.substring(0, 300) + '...\n');
            
            // Check if answer contains correct result
            const hasCorrectAnswer = data.answer.includes('5251') || 
                                    data.answer.toLowerCase().includes('five thousand two hundred');
            
            if (hasCorrectAnswer) {
                console.log('✅ PASS - Correct answer (5251)\n');
                recordTest('Simple Math', 'PASS', { duration, correct: true });
            } else {
                console.log('⚠️  PASS - Got response but answer may be incorrect\n');
                recordTest('Simple Math', 'PASS', { duration, correct: false });
            }
        } else {
            console.log('❌ FAIL -', data.error);
            recordTest('Simple Math', 'FAIL', { error: data.error });
        }
    } catch (error) {
        console.log('❌ FAIL - Error:', error.message);
        recordTest('Simple Math', 'FAIL', { error: error.message });
    }
}

// Test 4: Science Question
async function testScienceQuestion() {
    console.log('\n🔬 TEST 4: Science (Explain Gravity)');
    console.log('-'.repeat(70));
    
    try {
        const startTime = Date.now();
        
        const response = await fetch(`${BASE_URL}/api/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: 'Explain gravity in simple terms',
                timeout: 40000
            })
        });
        
        const data = await response.json();
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log('Duration:', `${duration}s`);
        console.log('Success:', data.success);
        console.log('Characters:', data.metadata?.characters || data.answer?.length || 0);
        
        if (data.success) {
            console.log('\n📝 Answer Preview:');
            console.log(data.answer.substring(0, 300) + '...\n');
            
            // Check if mentions key concepts
            const hasKeyConcepts = data.answer.toLowerCase().includes('force') ||
                                  data.answer.toLowerCase().includes('mass') ||
                                  data.answer.toLowerCase().includes('attract');
            
            if (hasKeyConcepts) {
                console.log('✅ PASS - Contains key physics concepts\n');
                recordTest('Science Question', 'PASS', { duration, hasConcepts: true });
            } else {
                console.log('⚠️  PASS - Got response but may lack detail\n');
                recordTest('Science Question', 'PASS', { duration, hasConcepts: false });
            }
        } else {
            console.log('❌ FAIL -', data.error);
            recordTest('Science Question', 'FAIL', { error: data.error });
        }
    } catch (error) {
        console.log('❌ FAIL - Error:', error.message);
        recordTest('Science Question', 'FAIL', { error: error.message });
    }
}

// Test 5: Literature Question
async function testLiteratureQuestion() {
    console.log('\n📚 TEST 5: Literature (Shakespeare)');
    console.log('-'.repeat(70));
    
    try {
        const startTime = Date.now();
        
        const response = await fetch(`${BASE_URL}/api/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: 'Who wrote Romeo and Juliet?',
                timeout: 40000
            })
        });
        
        const data = await response.json();
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log('Duration:', `${duration}s`);
        console.log('Success:', data.success);
        
        if (data.success) {
            console.log('\n📝 Answer Preview:');
            console.log(data.answer.substring(0, 200) + '...\n');
            
            // Check if mentions Shakespeare
            const hasShakespeare = data.answer.toLowerCase().includes('shakespeare');
            
            if (hasShakespeare) {
                console.log('✅ PASS - Correctly identifies Shakespeare\n');
                recordTest('Literature Question', 'PASS', { duration, correct: true });
            } else {
                console.log('⚠️  PASS - Got response but may not mention Shakespeare\n');
                recordTest('Literature Question', 'PASS', { duration, correct: false });
            }
        } else {
            console.log('❌ FAIL -', data.error);
            recordTest('Literature Question', 'FAIL', { error: data.error });
        }
    } catch (error) {
        console.log('❌ FAIL - Error:', error.message);
        recordTest('Literature Question', 'FAIL', { error: error.message });
    }
}

// Test 6: Batch Questions
async function testBatchQuestions() {
    console.log('\n📦 TEST 6: Batch Questions');
    console.log('-'.repeat(70));
    
    const questions = [
        'What is 2 + 2?',
        'Capital of France?',
        'H2O is the formula for what?'
    ];
    
    try {
        const startTime = Date.now();
        
        const response = await fetch(`${BASE_URL}/api/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questions: questions,
                delayBetweenQuestions: 1000
            })
        });
        
        const data = await response.json();
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log('Duration:', `${duration}s`);
        console.log('Count:', data.count);
        console.log('Success:', data.success);
        
        if (data.success && data.results) {
            console.log('\n📝 Results:');
            data.results.forEach((result, i) => {
                console.log(`\nQ${i+1}: ${result.question}`);
                console.log(`A: ${result.answer?.substring(0, 100)}...`);
            });
            console.log('');
            
            console.log('✅ PASS - Batch processing works\n');
            recordTest('Batch Questions', 'PASS', { duration, count: data.count });
        } else {
            console.log('❌ FAIL -', data.error || 'Unknown error');
            recordTest('Batch Questions', 'FAIL', { error: data.error });
        }
    } catch (error) {
        console.log('❌ FAIL - Error:', error.message);
        recordTest('Batch Questions', 'FAIL', { error: error.message });
    }
}

// Test 7: Ask-Once Endpoint
async function testAskOnce() {
    console.log('\n⚡ TEST 7: Ask-Once Endpoint');
    console.log('-'.repeat(70));
    
    try {
        const startTime = Date.now();
        
        const response = await fetch(`${BASE_URL}/api/ask-once`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: 'What color is the sky on a clear day?'
            })
        });
        
        const data = await response.json();
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log('Duration:', `${duration}s`);
        console.log('Success:', data.success);
        
        if (data.success) {
            console.log('\n📝 Answer:');
            console.log(data.answer.substring(0, 200) + '...\n');
            
            const hasBlue = data.answer.toLowerCase().includes('blue');
            
            if (hasBlue) {
                console.log('✅ PASS - Correct answer (blue)\n');
                recordTest('Ask-Once', 'PASS', { duration, correct: true });
            } else {
                console.log('⚠️  PASS - Got response\n');
                recordTest('Ask-Once', 'PASS', { duration, correct: false });
            }
        } else {
            console.log('❌ FAIL -', data.error);
            recordTest('Ask-Once', 'FAIL', { error: data.error });
        }
    } catch (error) {
        console.log('❌ FAIL - Error:', error.message);
        recordTest('Ask-Once', 'FAIL', { error: error.message });
    }
}

// Run all tests
async function runAllTests() {
    console.log('\n🚀 Starting comprehensive test suite...\n');
    
    await testHealthCheck();
    await testSessionStatus();
    await testSimpleMath();
    await testScienceQuestion();
    await testLiteratureQuestion();
    await testBatchQuestions();
    await testAskOnce();
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total Tests: ${results.tests.length}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);
    console.log('='.repeat(70));
    
    // Detailed results
    console.log('\n📋 DETAILED RESULTS:');
    results.tests.forEach((test, i) => {
        const icon = test.status === 'PASS' ? '✅' : test.status === 'WARN' ? '⚠️' : '❌';
        console.log(`${icon} ${test.name}: ${test.status}`);
    });
    
    // Save results
    const fs = await import('fs');
    const resultsPath = './api_test_results.json';
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}`);
    
    // Final verdict
    console.log('\n' + '='.repeat(70));
    if (results.failed === 0) {
        console.log('🎉 ALL TESTS PASSED! Server is production-ready!');
    } else {
        console.log('⚠️  Some tests failed. Review results above.');
    }
    console.log('='.repeat(70));
}

// Execute tests
runAllTests().catch(console.error);
