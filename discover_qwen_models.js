import fetch from 'node-fetch';

console.log('🔍 Discovering Available Qwen Models');
console.log('='.repeat(70));
console.log('');

const BASE_URL = 'https://qwen-worker-proxy.ronitshrimankar1.workers.dev';

// Test different models
const modelsToTest = [
    'qwen-turbo',
    'qwen-max',
    'qwen-long-context',
    'qwen-vl-max',
    'qwen-vl-plus',
    'qwq-32b-preview',
    'qwen2.5-vl-72b-instruct',
    'qwen2.5-coder-32b-instruct',
    'qwen2.5-72b-instruct'
];

async function testModel(modelName) {
    try {
        const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify({
                model: modelName,
                messages: [{
                    role: 'user',
                    content: 'Hi'
                }],
                max_tokens: 10
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.choices && data.choices.length > 0) {
            console.log(`✅ ${modelName} - WORKING`);
            return { name: modelName, status: 'WORKING', latency: 'fast' };
        } else {
            const errorMsg = data.error?.message || 'Unknown error';
            if (errorMsg.includes('not supported') || errorMsg.includes('not found')) {
                console.log(`❌ ${modelName} - Not available`);
                return { name: modelName, status: 'NOT_AVAILABLE' };
            } else {
                console.log(`⚠️  ${modelName} - Error: ${errorMsg.substring(0, 50)}`);
                return { name: modelName, status: 'ERROR', message: errorMsg };
            }
        }
    } catch (error) {
        console.log(`❌ ${modelName} - ${error.message}`);
        return { name: modelName, status: 'ERROR', message: error.message };
    }
}

async function discoverModels() {
    console.log('Testing available models...\n');
    
    const results = [];
    
    for (const model of modelsToTest) {
        const result = await testModel(model);
        results.push(result);
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 DISCOVERY SUMMARY');
    console.log('='.repeat(70));
    
    const working = results.filter(r => r.status === 'WORKING');
    const notAvailable = results.filter(r => r.status === 'NOT_AVAILABLE');
    const errors = results.filter(r => r.status === 'ERROR');
    
    console.log(`\n✅ Working Models (${working.length}):`);
    working.forEach(m => console.log(`   - ${m.name}`));
    
    console.log(`\n❌ Not Available (${notAvailable.length}):`);
    notAvailable.forEach(m => console.log(`   - ${m.name}`));
    
    console.log(`\n⚠️  Errors (${errors.length}):`);
    errors.forEach(m => console.log(`   - ${m.name}: ${m.message?.substring(0, 50)}`));
    
    console.log('\n' + '='.repeat(70));
    
    if (working.length > 0) {
        console.log('\n💡 RECOMMENDATION: Use these working models:');
        working.forEach(m => console.log(`   • ${m.name}`));
    }
    
    return results;
}

discoverModels().catch(console.error);
