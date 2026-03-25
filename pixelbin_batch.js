import axios from 'axios';
import fs from 'fs';

/**
 * 🎬 Batch Video Generator
 * Generate multiple videos from a JSON configuration file
 */

class BatchVideoGenerator {
    constructor() {
        this.provider = {
            baseUrl: 'https://platform.aivideogenerator.me',
            authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJhaXZpZGVvZ2VuZXJhdG9yLXVzZXItOTc5NzE5Iiwicm5TdHIiOiIzTDVNWEMwSUtPRm5temV5VFNWMDByaE9jUlNMd1NqdyJ9.Yz62KNRtivXfJSmNmKeGctQLrZ9vl6M7c3Ta7nlnFFk',
            uniqueId: '865ead8054fa643f5ae01dcd613ba1ad',
            channel: 'GROK_IMAGINE',
            origin: 'https://aivideogenerator.me'
        };
        
        this.results = [];
        this.delay = 3000; // 3 seconds between requests
    }

    getHeaders() {
        return {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Authorization': this.provider.authToken,
            'Origin': this.provider.origin,
            'Referer': `${this.provider.origin}/`,
            'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'priority': 'u=1, i',
            'uniqueid': this.provider.uniqueId
        };
    }

    async generateVideo(config, index, total) {
        const {
            prompt,
            style = '',
            negative_prompt = '',
            duration = 3,
            resolution = '512x512',
            output_file = null
        } = config;

        console.log(`\n${'='.repeat(70)}`);
        console.log(`🎬 VIDEO ${index}/${total}`);
        console.log('='.repeat(70));
        console.log(`Prompt:     ${prompt}`);
        console.log(`Style:      ${style || 'None'}`);
        console.log(`Negative:   ${negative_prompt || 'None'}`);
        console.log(`Duration:   ${duration}s`);
        console.log(`Resolution: ${resolution}`);
        console.log('='.repeat(70));

        const url = `${this.provider.baseUrl}/aimodels/api/v1/ai/video/create`;
        
        const payload = {
            prompt,
            style: style || undefined,
            negative_prompt: negative_prompt || undefined,
            channel: this.provider.channel,
            model_version: "v1",
            duration,
            resolution
        };

        // Remove undefined fields
        Object.keys(payload).forEach(key => {
            if (payload[key] === undefined) delete payload[key];
        });

        try {
            console.log('\n📤 Sending request...');
            
            const response = await axios.post(url, payload, {
                headers: {
                    ...this.getHeaders(),
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            });

            console.log('\n✅ SUCCESS!');
            console.log('Status:', response.status);

            const result = {
                success: true,
                prompt,
                config,
                response: response.data,
                timestamp: new Date().toISOString()
            };

            if (output_file) {
                fs.writeFileSync(output_file, JSON.stringify(response.data, null, 2));
                console.log(`💾 Saved to: ${output_file}`);
            }

            return result;

        } catch (error) {
            console.log('\n❌ FAILED');
            
            if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Error:', error.response.data);
            } else {
                console.log('Error:', error.message);
            }

            return {
                success: false,
                prompt,
                config,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async processBatch(jobs) {
        console.log('\n' + '='.repeat(70));
        console.log('🚀 BATCH VIDEO GENERATION');
        console.log('='.repeat(70));
        console.log(`Total jobs: ${jobs.length}`);
        console.log(`Delay between requests: ${this.delay}ms`);
        console.log('='.repeat(70));

        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];
            const result = await this.generateVideo(job, i + 1, jobs.length);
            this.results.push(result);

            if (i < jobs.length - 1) {
                console.log(`\n⏳ Waiting ${this.delay/1000}s before next video...`);
                await new Promise(resolve => setTimeout(resolve, this.delay));
            }
        }

        return this.results;
    }

    saveResults(filename) {
        const report = {
            summary: {
                total: this.results.length,
                successful: this.results.filter(r => r.success).length,
                failed: this.results.filter(r => !r.success).length,
                generated_at: new Date().toISOString()
            },
            results: this.results
        };

        fs.writeFileSync(filename, JSON.stringify(report, null, 2));
        console.log(`\n📊 Results saved to: ${filename}`);
        
        return report;
    }

    printSummary() {
        const successful = this.results.filter(r => r.success).length;
        const failed = this.results.filter(r => !r.success).length;

        console.log('\n' + '='.repeat(70));
        console.log('📊 BATCH GENERATION SUMMARY');
        console.log('='.repeat(70));
        console.log(`Total Videos:    ${this.results.length}`);
        console.log(`Successful:      ✅ ${successful}`);
        console.log(`Failed:          ❌ ${failed}`);
        console.log(`Success Rate:    ${((successful / this.results.length) * 100).toFixed(1)}%`);
        console.log('='.repeat(70));

        if (failed > 0) {
            console.log('\n❌ Failed Prompts:');
            this.results.filter(r => !r.success).forEach((r, i) => {
                console.log(`  ${i + 1}. "${r.prompt}" - ${r.error}`);
            });
        }

        if (successful > 0) {
            console.log('\n✅ Successful Prompts:');
            this.results.filter(r => r.success).forEach((r, i) => {
                console.log(`  ${i + 1}. "${r.prompt}"`);
            });
        }

        console.log('\n' + '='.repeat(70));
    }
}

// Example usage and CLI interface
async function main() {
    const args = process.argv.slice(2);
    const generator = new BatchVideoGenerator();

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
🎬 BATCH VIDEO GENERATOR

Usage:
  node pixelbin_batch.js [options]

Options:
  --config=<file>     JSON file with video generation tasks
  --demo              Run with demo scenarios
  --output=<file>     Save results to JSON file
  --delay=<ms>        Delay between requests (default: 3000ms)

Example Config File (batch_config.json):
[
  {
    "prompt": "A beautiful sunset over mountains",
    "style": "cinematic",
    "negative_prompt": "blurry, low quality",
    "duration": 5,
    "resolution": "1024x1024",
    "output_file": "video1.json"
  },
  {
    "prompt": "Cyberpunk city at night",
    "style": "cyberpunk",
    "duration": 3
  }
]
`);
        process.exit(0);
    }

    // Demo mode
    if (args.includes('--demo')) {
        const demoJobs = [
            {
                prompt: "A beautiful sunset over tropical mountains",
                style: "cinematic",
                negative_prompt: "blurry, low quality",
                duration: 3,
                resolution: "512x512"
            },
            {
                prompt: "Futuristic cyberpunk city with neon lights",
                style: "cyberpunk",
                negative_prompt: "daylight, sunny",
                duration: 3,
                resolution: "512x512"
            },
            {
                prompt: "Peaceful ocean waves on sandy beach",
                style: "realistic",
                negative_prompt: "cartoon, anime, people",
                duration: 3,
                resolution: "512x512"
            }
        ];

        await generator.processBatch(demoJobs);
        generator.printSummary();
        
        const outputFile = args.find(a => a.startsWith('--output='))?.split('=')[1] || 'batch_results.json';
        generator.saveResults(outputFile);
        
        return;
    }

    // Config file mode
    const configFile = args.find(a => a.startsWith('--config='))?.split('=')[1];
    
    if (configFile) {
        if (!fs.existsSync(configFile)) {
            console.error(`❌ Config file not found: ${configFile}`);
            process.exit(1);
        }

        const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
        
        // Custom delay
        const delayArg = args.find(a => a.startsWith('--delay='))?.split('=')[1];
        if (delayArg) {
            generator.delay = parseInt(delayArg) || 3000;
        }

        await generator.processBatch(config);
        generator.printSummary();
        
        const outputFile = args.find(a => a.startsWith('--output='))?.split('=')[1] || 'batch_results.json';
        generator.saveResults(outputFile);
        
        return;
    }

    console.log('❌ No action specified. Use --demo for demo mode or --config=<file> for batch processing.');
    console.log('Use --help for more information.');
}

main().catch(console.error);
