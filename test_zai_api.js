import fetch from 'node-fetch';

console.log('🧪 Testing Z.AI Local API\n');

async function testAPI() {
    // Test 1: Health check
    console.log('1️⃣ Health Check...');
    try {
        const health = await fetch('http://localhost:3000/health');
        const healthData = await health.json();
        console.log('   ✅ Status:', healthData.status);
        console.log('   🌐 Browser:', healthData.browser);
        console.log('');
    } catch (error) {
        console.log('   ❌ Error:', error.message);
        return;
    }

    // Test 2: Send message
    console.log('2️⃣ Send Message: "What is 2+2?"');
    try {
        const response = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'What is 2+2?' })
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('\n' + '='.repeat(60));
            console.log('✅ AI RESPONSE:');
            console.log('='.repeat(60));
            console.log(data.response);
            console.log('='.repeat(60));
            console.log('\n⏱️  Response time:', ((data.timestamp - Date.now()) / 1000).toFixed(2), 'seconds (server processing)');
        } else {
            console.log('\n❌ Error:', data.error);
        }
    } catch (error) {
        console.log('\n❌ Request failed:', error.message);
    }
}

testAPI();
