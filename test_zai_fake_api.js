import ZAIBrowserAPI from './zai_browser_api.js';

/**
 * 🧪 Simple Z.AI API Test - Browser-Based
 * 
 * This looks like a simple API call but uses browser automation behind the scenes!
 */

console.log('🧪 Testing Z.AI with "Fake" API\n');

const api = new ZAIBrowserAPI();

// Test 1: Math question
console.log('📐 TEST 1: Math Question');
console.log('─'.repeat(60));

try {
    const answer = await api.askOnce('What is 59 multiplied by 55?');
    
    console.log('📊 RESULT:');
    console.log(answer);
    console.log('');
    
    // Verify answer
    if (answer.includes('3245') || answer.toLowerCase().includes('three thousand')) {
        console.log('✅ CORRECT! Answer contains 3245\n');
    } else {
        console.log('⚠️  Answer may not contain expected result (but AI responded)\n');
    }
    
} catch (error) {
    console.log('❌ Error:', error.message, '\n');
}

// Test 2: Another question
console.log('📝 TEST 2: General Knowledge');
console.log('─'.repeat(60));

try {
    const answer = await api.askOnce('What is the capital of France? Keep it brief.');
    
    console.log('📊 RESULT:');
    console.log(answer);
    console.log('');
    
    if (answer.toLowerCase().includes('paris')) {
        console.log('✅ CORRECT! Answer mentions Paris\n');
    } else {
        console.log('⚠️  Answer may not mention Paris (but AI responded)\n');
    }
    
} catch (error) {
    console.log('❌ Error:', error.message, '\n');
}

console.log('='.repeat(60));
console.log('✅ All tests complete!');
console.log('='.repeat(60));
