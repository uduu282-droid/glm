// MU-Devs API Test - Node.js Implementation
// Reverse engineered from https://mu-devs.vercel.app/

import axios from 'axios';

class MUDevsImageGenerator {
    constructor() {
        this.baseUrl = 'https://mu-devs.vercel.app';
        this.endpoint = '/generate';
    }

    async generate(prompt, options = {}) {
        const defaults = {
            model: 'flux'  // or 'fluxpro'
        };
        
        const params = { ...defaults, ...options };
        
        try {
            console.log(`🎨 Generating image for prompt: "${prompt}"`);
            console.log(`Model: ${params.model}`);
            
            const response = await axios.post(
                `${this.baseUrl}${this.endpoint}`,
                {
                    prompt: prompt,
                    model: params.model
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const data = response.data;
            
            if (data.success) {
                console.log('✅ SUCCESS!');
                console.log(`📷 Image URL: ${data.image_url}`);
                return {
                    success: true,
                    imageUrl: data.image_url
                };
            } else {
                console.error('❌ API Error:', data.error);
                return {
                    success: false,
                    error: data.error
                };
            }
            
        } catch (error) {
            console.error('❌ Request Failed:', error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            }
            return {
                success: false,
                error: error.message
            };
        }
    }

    async batchGenerate(prompts, options = {}) {
        console.log(`🚀 Batch generating ${prompts.length} images...\n`);
        const results = [];
        
        for (let i = 0; i < prompts.length; i++) {
            console.log(`\n[${i + 1}/${prompts.length}]`);
            const result = await this.generate(prompts[i], options);
            results.push(result);
            
            // Wait between requests to avoid rate limiting
            if (i < prompts.length - 1) {
                console.log('⏳ Waiting 3 seconds...');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        
        return results;
    }
}

// CLI Usage
async function main() {
    const generator = new MUDevsImageGenerator();
    
    // Single generation
    const prompt = process.argv[2] || 'A futuristic cyberpunk city at night with neon lights';
    const model = process.argv[3] || 'flux';
    
    await generator.generate(prompt, { model });
}

// Export for programmatic use
export { MUDevsImageGenerator };

// Run if called directly
if (process.argv[1].includes('mu_devs_generator.js')) {
    main().catch(console.error);
}
