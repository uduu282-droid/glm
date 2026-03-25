import ZAIBrowserAPI from './zai_browser_api.js';

console.log('🧪 Testing Z.AI API with: 59 × 89\n');
console.log('Expected answer: 5251\n');
console.log('='.repeat(60));

const api = new ZAIBrowserAPI();

try {
    // Initialize and ask the question
    await api.initialize();
    
    const question = 'What is 59 multiplied by 89? Show step-by-step work.';
    console.log(`\n❓ Asking: ${question}\n`);
    
    const answer = await api.ask(question, { timeout: 40000 });
    
    console.log('\n' + '='.repeat(60));
    console.log('🤖 AI RESPONSE:');
    console.log('='.repeat(60));
    console.log(answer);
    console.log('='.repeat(60));
    
    // Check if correct
    const hasCorrectAnswer = answer.includes('5251') || 
                            answer.toLowerCase().includes('five thousand two hundred fifty-one') ||
                            answer.includes('5,251');
    
    console.log('\n📊 VERIFICATION:');
    console.log(`Expected: 5251`);
    console.log(`Found "5251": ${hasCorrectAnswer ? 'YES ✅' : 'NO ❌'}`);
    
    if (hasCorrectAnswer) {
        console.log('\n🎉 SUCCESS! AI got the correct answer!\n');
    } else {
        console.log('\n⚠️  Answer may not contain expected result\n');
    }
    
    await api.close();
    
} catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Make sure your session is valid. Run: node zai_login_explorer.js\n');
}
