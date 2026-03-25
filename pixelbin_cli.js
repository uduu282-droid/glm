#!/usr/bin/env node

import axios from 'axios';

/**
 * 🎬 Simple CLI Video Generator
 * Quick one-command video generation
 */

// Configuration
const CONFIG = {
    provider: process.argv.includes('--provider=grok') ? 'GROK' : 'AIVIDEO',
    // CAPTURED PAGEID FROM WEBSITE!
    capturedPageId: '1c66a54447ddb90e045b28c491a40ae3',
    providers: {
        AIVIDEO: {
            baseUrl: 'https://platform.aivideogenerator.me',
            authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJhaXZpZGVvZ2VuZXJhdG9yLXVzZXItOTc5NzE5Iiwicm5TdHIiOiIzTDVNWEMwSUtPRm5temV5VFNWMDByaE9jUlNMd1NqdyJ9.Yz62KNRtivXfJSmNmKeGctQLrZ9vl6M7c3Ta7nlnFFk',
            uniqueId: '865ead8054fa643f5ae01dcd613ba1ad',
            channel: 'GROK_IMAGINE',
            origin: 'https://aivideogenerator.me'
        },
        GROK: {
            baseUrl: 'https://aiplatform.tattooidea.ai',
            authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJncm9raW1hZ2luZWFpLmNvbS11c2VyLTc2MDg2MiIsInJuU3RyIjoid3JxVjNNUVR6QmNWTHBjMVJJMUJ0MnJHWjV4V0djbE4ifQ.lu79hPMu1eey_5tMB-gOUOryMvb4f3IT8lOXdX0Rrow',
            uniqueId: '865ead8054fa643f5ae01dcd613ba1ad',
            channel: 'GROK_IMAGINE',
            origin: 'https://grokimagineai.com'
        }
    }
};

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        prompt: '',
        style: '',
        negative: '',
        duration: 3,
        resolution: '512x512',
        output: null
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        if (!arg.startsWith('--')) {
            options.prompt = arg;
        } else if (arg.startsWith('--style=')) {
            options.style = arg.split('=')[1];
        } else if (arg.startsWith('--negative=')) {
            options.negative = arg.split('=')[1];
        } else if (arg.startsWith('--duration=')) {
            options.duration = parseInt(arg.split('=')[1]) || 3;
        } else if (arg.startsWith('--resolution=')) {
            options.resolution = arg.split('=')[1];
        } else if (arg.startsWith('--output=')) {
            options.output = arg.split('=')[1];
        } else if (arg === '--provider=grok') {
            CONFIG.provider = 'GROK';
        } else if (arg === '--help' || arg === '-h') {
            showHelp();
            process.exit(0);
        }
    }

    return options;
}

function showHelp() {
    console.log(`
🎬 PIXELBIN-STYLE CLI VIDEO GENERATOR

Usage:
  node pixelbin_cli.js "your prompt" [options]

Options:
  --style=<style>        Video style (cyberpunk, realistic, cinematic, etc.)
  --negative=<text>      Negative prompt (what to exclude)
  --duration=<seconds>   Video duration (default: 3)
  --resolution=<res>     Resolution: 512x512, 1024x1024, 1024x576, 576x1024
  --provider=<name>      Provider: aivideo (default) or grok
  --output=<file>        Save response to file
  --help, -h             Show this help message

Examples:
  node pixelbin_cli.js "A beautiful sunset"
  node pixelbin_cli.js "Cyberpunk city" --style=cyberpunk --duration=5
  node pixelbin_cli.js "Ocean waves" --style=realistic --negative="people,text"
  node pixelbin_cli.js "Space scene" --provider=grok

Available Styles:
  cyberpunk, realistic, cinematic, cartoon, anime, painting, sketch,
  fantasy, scifi, horror, vintage, modern
`);
}

function getHeaders(provider) {
    return {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Authorization': provider.authToken,
        'Origin': provider.origin,
        'Referer': `${provider.origin}/`,
        'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'priority': 'u=1, i',
        'uniqueid': provider.uniqueId
    };
}

async function generateVideo(options) {
    const provider = CONFIG.providers[CONFIG.provider];
    
    console.log('\n' + '='.repeat(70));
    console.log('🎬 GENERATING VIDEO');
    console.log('='.repeat(70));
    console.log(`Provider:  ${CONFIG.provider}`);
    console.log(`Prompt:    ${options.prompt}`);
    console.log(`Style:     ${options.style || 'None'}`);
    console.log(`Negative:  ${options.negative || 'None'}`);
    console.log(`Duration:  ${options.duration}s`);
    console.log(`Resolution: ${options.resolution}`);
    console.log('='.repeat(70));

    if (!options.prompt) {
        console.error('\n❌ Error: Prompt is required!');
        console.log('Use --help for usage information.');
        process.exit(1);
    }

    const url = `${provider.baseUrl}/aimodels/api/v1/ai/video/create`;
    
    const payload = {
        prompt: options.prompt,
        style: options.style || undefined,
        negative_prompt: options.negative || undefined,
        channel: provider.channel,
        pageId: CONFIG.capturedPageId,  // ✅ USING CAPTURED PAGEID!
        model_version: "v1",
        duration: options.duration,
        resolution: options.resolution
    };

    // Remove undefined fields
    Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) delete payload[key];
    });

    try {
        console.log('\n📤 Sending request...');
        
        const response = await axios.post(url, payload, {
            headers: {
                ...getHeaders(provider),
                'Content-Type': 'application/json'
            },
            timeout: 60000
        });

        console.log('\n✅ SUCCESS!');
        console.log('Status:', response.status);
        console.log('\nResponse:');
        console.log(JSON.stringify(response.data, null, 2));

        if (options.output) {
            const fs = await import('fs');
            fs.writeFileSync(options.output, JSON.stringify(response.data, null, 2));
            console.log(`\n💾 Response saved to: ${options.output}`);
        }

        return { success: true, data: response.data };

    } catch (error) {
        console.log('\n❌ FAILED');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error:', JSON.stringify(error.response.data, null, 2));
            
            if (error.response.data?.message?.includes('pageId')) {
                console.log('\n💡 TIP: pageId required. Visit the website first or use browser automation.');
            }
            if (error.response.data?.message?.includes('HC verification')) {
                console.log('\n💡 TIP: Human verification required. Consider using the web interface.');
            }
            if (error.response.data?.message?.includes('email')) {
                console.log('\n💡 TIP: Email verification required. Register/login first.');
            }
        } else {
            console.log('Error:', error.message);
        }
        
        return { success: false, error: error.message };
    }
}

// Main execution
async function main() {
    const options = parseArgs();
    
    if (process.argv.length < 3 || !options.prompt) {
        showHelp();
        process.exit(1);
    }

    await generateVideo(options);
}

main().catch(console.error);
