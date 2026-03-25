// Flux Image Generator - Node.js Implementation
// Reverse engineered from https://test2img.vercel.app/

import pkg from "gradio-client";
const { GradioClient } = pkg;

class FluxImageGenerator {
    constructor() {
        this.client = null;
        this.spaceId = "black-forest-labs/FLUX.1-dev";
    }

    async init() {
        if (!this.client) {
            console.log("🔌 Connecting to FLUX.1-dev space...");
            this.client = await GradioClient.connect(this.spaceId);
            console.log("✅ Connected!");
        }
    }

    async generate(prompt, options = {}) {
        await this.init();

        // Default parameters (same as test2img.vercel.app)
        const defaults = {
            seed: 0,
            randomize_seed: true,
            width: 512,
            height: 512,
            guidance_scale: 3.5,
            num_inference_steps: 28
        };

        const params = { ...defaults, ...options };

        console.log(`\n🎨 Generating image...`);
        console.log(`   Prompt: ${prompt}`);
        console.log(`   Size: ${params.width}x${params.height}`);
        console.log(`   Steps: ${params.num_inference_steps}`);
        console.log(`   Guidance: ${params.guidance_scale}`);

        try {
            const startTime = Date.now();
            
            const result = await this.client.predict("/infer", {
                prompt: prompt,
                seed: params.seed,
                randomize_seed: params.randomize_seed,
                width: params.width,
                height: params.height,
                guidance_scale: params.guidance_scale,
                num_inference_steps: params.num_inference_steps
            });

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            console.log(`✅ Generated in ${duration}s`);
            console.log(`   URL: ${result.data[0].url}`);

            return {
                success: true,
                imageUrl: result.data[0].url,
                metadata: {
                    duration: result.duration,
                    averageDuration: result.average_duration,
                    generationTime: duration
                }
            };
        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async download(imageUrl, filename = null) {
        const fs = require('fs');
        const https = require('https');
        
        if (!filename) {
            filename = `flux_generated_${Date.now()}.webp`;
        }

        console.log(`\n💾 Downloading image to: ${filename}`);

        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(filename);
            
            https.get(imageUrl, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download: ${response.statusCode}`));
                    return;
                }
                
                response.pipe(file);
                
                file.on('finish', () => {
                    file.close();
                    console.log(`✅ Saved to: ${filename}`);
                    resolve(filename);
                });
            }).on('error', (err) => {
                fs.unlink(filename, () => {}); // Delete partially written file
                reject(err);
            });
        });
    }

    async batchGenerate(prompts, outputFilePrefix = 'flux_batch') {
        console.log(`📦 Batch generating ${prompts.length} images...\n`);
        
        const results = [];
        
        for (let i = 0; i < prompts.length; i++) {
            console.log(`\n[${i + 1}/${prompts.length}]`);
            const result = await this.generate(prompts[i]);
            results.push({
                index: i,
                prompt: prompts[i],
                ...result
            });
            
            // Wait between generations to avoid rate limiting
            if (i < prompts.length - 1) {
                console.log('⏳ Waiting 2 seconds...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        // Save results summary
        const summaryFile = `${outputFilePrefix}_results.json`;
        const fs = require('fs');
        fs.writeFileSync(summaryFile, JSON.stringify(results, null, 2));
        console.log(`\n📊 Results saved to: ${summaryFile}`);
        
        return results;
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Flux Image Generator - Reverse Engineered from test2img.vercel.app');
        console.log('\nUsage:');
        console.log('  node flux_image_generator.js "your prompt here"');
        console.log('  node flux_image_generator.js --batch');
        console.log('  node flux_image_generator.js --download "prompt"');
        console.log('\nExamples:');
        console.log('  node flux_image_generator.js "a cat holding a sign that says hello world"');
        console.log('  node flux_image_generator.js --download "futuristic city" output.webp');
        process.exit(0);
    }

    const generator = new FluxImageGenerator();

    if (args[0] === '--batch') {
        // Batch mode with predefined prompts
        const prompts = [
            "a cat holding a sign that says hello world",
            "a futuristic cyberpunk city at night with neon lights",
            "a serene mountain landscape with lake reflection at sunset",
            "an astronaut riding a horse on Mars, photorealistic",
            "a magical forest with glowing mushrooms and fairy lights"
        ];
        
        await generator.batchGenerate(prompts);
    } else if (args[0] === '--download') {
        // Generate and download
        const prompt = args.slice(1).join(' ');
        const result = await generator.generate(prompt);
        
        if (result.success) {
            await generator.download(result.imageUrl);
        } else {
            process.exit(1);
        }
    } else {
        // Single generation
        const prompt = args.join(' ');
        const result = await generator.generate(prompt);
        
        if (result.success) {
            console.log('\n✅ Success! Image generated.');
            console.log(`Open in browser: ${result.imageUrl}`);
        } else {
            console.log('\n❌ Failed to generate image.');
            process.exit(1);
        }
    }
}

// Export for use as module
export { FluxImageGenerator };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
