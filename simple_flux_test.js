// Simple test for Flux Image Generator
import pkg from "gradio-client";
const { GradioClient } = pkg;

async function testFlux() {
    console.log('🧪 Testing FLUX.1-dev API...\n');
    
    try {
        // Create client instance
        console.log('Connecting to black-forest-labs/FLUX.1-dev...');
        const client = new GradioClient('black-forest-labs/FLUX.1-dev');
        console.log('✅ Connected!\n');
        
        // Test generation
        console.log('Generating image...');
        const prompt = 'a simple cat';
        
        const result = await client.request('/infer', {
            prompt: prompt,
            seed: 0,
            randomize_seed: true,
            width: 512,
            height: 512,
            guidance_scale: 3.5,
            num_inference_steps: 28
        });
        
        console.log('✅ SUCCESS!\n');
        console.log('Result:', JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('Stack:', error.stack);
    }
}

testFlux();
