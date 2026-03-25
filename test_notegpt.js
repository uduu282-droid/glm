import NoteGPTClient from './notegpt_client.js';

console.log('🧪 Testing NoteGPT API\n');
console.log('='.repeat(70));

async function testNoteGPT() {
    const client = new NoteGPTClient();

    // Test 1: Simple question (streaming)
    console.log('\n📝 TEST 1: Simple Question (Streaming)');
    console.log('-'.repeat(70));
    
    try {
        console.log('Asking: "What is 2 + 2?"\n');
        
        const result = await client.chat('What is 2 + 2?', {
            model: 'gpt-4o-mini',
            stream: true,
            onChunk: (chunk, fullText) => {
                process.stdout.write(chunk);
            }
        });
        
        console.log('\n\n✅ Complete!');
        console.log(`Response length: ${result.text.length} characters`);
        console.log(`Chunks received: ${result.chunks.length}`);
        
    } catch (error) {
        console.log('\n❌ Error:', error.message);
    }

    // Test 2: Complex question
    console.log('\n' + '='.repeat(70));
    console.log('\n🧠 TEST 2: Complex Question (Math Explanation)');
    console.log('-'.repeat(70));
    
    try {
        console.log('Asking: "What is 59 multiplied by 89? Show step-by-step work."\n');
        
        const result = await client.chat('What is 59 multiplied by 89? Show step-by-step work.', {
            model: 'gpt-4o-mini',
            stream: true,
            onChunk: (chunk, fullText) => {
                process.stdout.write(chunk);
            }
        });
        
        console.log('\n\n✅ Complete!');
        console.log(`Response length: ${result.text.length} characters`);
        
        // Check if answer is correct
        const hasCorrectAnswer = result.text.includes('5251') || 
                                result.text.toLowerCase().includes('five thousand two hundred');
        console.log(`Contains correct answer (5251): ${hasCorrectAnswer ? 'YES ✅' : 'NO ❌'}`);
        
    } catch (error) {
        console.log('\n❌ Error:', error.message);
    }

    // Test 3: Non-streaming (simple ask)
    console.log('\n' + '='.repeat(70));
    console.log('\n⚡ TEST 3: Non-Streaming (Simple Ask)');
    console.log('-'.repeat(70));
    
    try {
        console.log('Asking: "Who wrote Romeo and Juliet?"\n');
        
        const answer = await client.ask('Who wrote Romeo and Juliet?', {
            model: 'gpt-4o-mini'
        });
        
        console.log(answer);
        console.log('\n✅ Complete!');
        
        const hasShakespeare = answer.toLowerCase().includes('shakespeare');
        console.log(`Mentions Shakespeare: ${hasShakespeare ? 'YES ✅' : 'NO ❌'}`);
        
    } catch (error) {
        console.log('\n❌ Error:', error.message);
    }

    // Test 4: Different model
    console.log('\n' + '='.repeat(70));
    console.log('\n🔄 TEST 4: Different Model (if available)');
    console.log('-'.repeat(70));
    
    try {
        console.log('Asking: "Explain gravity in simple terms"\n');
        
        const result = await client.chat('Explain gravity in simple terms', {
            model: 'gpt-3.5-turbo', // Try different model
            stream: true,
            onChunk: (chunk, fullText) => {
                process.stdout.write(chunk);
            }
        });
        
        console.log('\n\n✅ Complete!');
        console.log(`Response length: ${result.text.length} characters`);
        
    } catch (error) {
        console.log('⚠️  Model may not be available:', error.message);
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 TESTING COMPLETE!\n');
}

// Run tests
testNoteGPT().catch(console.error);
