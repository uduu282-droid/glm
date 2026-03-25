import fetch from 'node-fetch';

console.log('🧪 Testing Z.AI API Server\n');
console.log('='.repeat(60));

async function testServer() {
    try {
        // Test 1: Health check
        console.log('\n📊 Test 1: Health Check');
        const healthResponse = await fetch('http://localhost:3000/health');
        const health = await healthResponse.json();
        console.log('Health:', health);
        
        // Test 2: Ask a question
        console.log('\n📐 Test 2: Math Question (59 × 89)');
        const askResponse = await fetch('http://localhost:3000/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: 'What is 59 multiplied by 89? Show your work.',
                timeout: 40000
            })
        });
        
        const data = await askResponse.json();
        
        if (data.success) {
            console.log('\n✅ SUCCESS!');
            console.log('\nQuestion:', data.question);
            console.log('\nAnswer:');
            console.log(data.answer);
            console.log('\nMetadata:', data.metadata);
        } else {
            console.log('\n❌ Error:', data.error);
        }
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.log('\n💡 Make sure server is running: node zai_api_server.js');
    }
}

testServer();
