import axios from 'axios';
import readline from 'readline';

/**
 * 🎬 Pixelbin-Style Terminal Video Generator
 * 
 * A terminal-based AI video generator inspired by Pixelbin.io
 * Supports multiple video generation models and providers
 */

// Configuration for different video generation providers
const PROVIDERS = {
    // AIVideoGenerator.me - Text to Video
    AIVIDEO: {
        name: 'AIVideoGenerator',
        baseUrl: 'https://platform.aivideogenerator.me',
        authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJhaXZpZGVvZ2VuZXJhdG9yLXVzZXItOTc5NzE5Iiwicm5TdHIiOiIzTDVNWEMwSUtPRm5temV5VFNWMDByaE9jUlNMd1NqdyJ9.Yz62KNRtivXfJSmNmKeGctQLrZ9vl6M7c3Ta7nlnFFk',
        uniqueId: '865ead8054fa643f5ae01dcd613ba1ad',
        channel: 'GROK_IMAGINE',
        origin: 'https://aivideogenerator.me',
        modelId: 'af548e1bec9c141716e13e8b5443e065'
    },
    
    // TattooIdea.ai (GrokImagine) - Alternative provider
    GROKIMAGINE: {
        name: 'GrokImagine',
        baseUrl: 'https://aiplatform.tattooidea.ai',
        authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJncm9raW1hZ2luZWFpLmNvbS11c2VyLTc2MDg2MiIsInJuU3RyIjoid3JxVjNNUVR6QmNWTHBjMVJJMUJ0MnJHWjV4V0djbE4ifQ.lu79hPMu1eey_5tMB-gOUOryMvb4f3IT8lOXdX0Rrow',
        uniqueId: '865ead8054fa643f5ae01dcd613ba1ad',
        channel: 'GROK_IMAGINE',
        origin: 'https://grokimagineai.com',
        modelId: 'ad7be746bd7898647c69321a69f7a93b'
    }
};

class TerminalVideoGenerator {
    constructor() {
        this.currentProvider = PROVIDERS.AIVIDEO;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    /**
     * Get common headers for API requests
     */
    getCommonHeaders() {
        return {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Authorization': this.currentProvider.authToken,
            'Origin': this.currentProvider.origin,
            'Referer': `${this.currentProvider.origin}/`,
            'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'priority': 'u=1, i',
            'uniqueid': this.currentProvider.uniqueId
        };
    }

    /**
     * Display main menu
     */
    showMainMenu() {
        console.log('\n' + '='.repeat(70));
        console.log('🎬 PIXELBIN-STYLE TERMINAL VIDEO GENERATOR');
        console.log('='.repeat(70));
        console.log('\n✨ AI-Powered Text-to-Video Generation');
        console.log(`📡 Current Provider: ${this.currentProvider.name}`);
        console.log('\n' + '-'.repeat(70));
        console.log('MENU:');
        console.log('-'.repeat(70));
        console.log('1. 🎨 Generate Video from Text');
        console.log('2. ⚙️  Change Provider');
        console.log('3. ℹ️   View Provider Info');
        console.log('4. 📋 View Available Styles');
        console.log('5. 🧪 Test Preset Scenarios');
        console.log('6. 🚪 Exit');
        console.log('-'.repeat(70));
    }

    /**
     * Display available styles
     */
    showStyles() {
        console.log('\n' + '='.repeat(70));
        console.log('🎨 AVAILABLE VIDEO STYLES');
        console.log('='.repeat(70));
        console.log(`
• cyberpunk    - Futuristic sci-fi aesthetic with neon lights
• realistic    - Photorealistic rendering
• cinematic    - Movie-like quality with dramatic lighting
• cartoon      - Animated/cartoon style
• anime        - Japanese animation style
• painting     - Artistic painting style
• sketch       - Pencil sketch style
• fantasy      - Magical/fantasy aesthetic
• scifi        - Science fiction theme
• horror       - Dark, spooky atmosphere
• vintage      - Retro/old-fashioned look
• modern       - Contemporary, clean design
        `);
        console.log('='.repeat(70));
    }

    /**
     * Switch provider
     */
    switchProvider() {
        console.log('\n' + '='.repeat(70));
        console.log('🔄 SELECT PROVIDER');
        console.log('='.repeat(70));
        
        const providers = Object.keys(PROVIDERS);
        providers.forEach((key, index) => {
            console.log(`${index + 1}. ${PROVIDERS[key].name}`);
        });
        console.log('-'.repeat(70));
        
        return new Promise((resolve) => {
            this.rl.question('\nEnter choice (number): ', (answer) => {
                const choice = parseInt(answer);
                if (choice >= 1 && choice <= providers.length) {
                    const selectedKey = providers[choice - 1];
                    this.currentProvider = PROVIDERS[selectedKey];
                    console.log(`\n✅ Switched to ${this.currentProvider.name}`);
                } else {
                    console.log('\n⚠️  Invalid choice, keeping current provider');
                }
                resolve();
            });
        });
    }

    /**
     * Show provider information
     */
    showProviderInfo() {
        console.log('\n' + '='.repeat(70));
        console.log(`ℹ️   ${this.currentProvider.name} - INFORMATION`);
        console.log('='.repeat(70));
        console.log(`Base URL:    ${this.currentProvider.baseUrl}`);
        console.log(`Origin:      ${this.currentProvider.origin}`);
        console.log(`Channel:     ${this.currentProvider.channel}`);
        console.log(`Model ID:    ${this.currentProvider.modelId}`);
        console.log(`Unique ID:   ${this.currentProvider.uniqueId}`);
        console.log(`Auth Token:  ${this.currentProvider.authToken.substring(0, 50)}...`);
        console.log('='.repeat(70));
    }

    /**
     * Generate video from text prompt
     */
    async generateVideo(prompt, options = {}) {
        const {
            style = '',
            negativePrompt = '',
            duration = 3,
            resolution = '512x512',
            modelVersion = 'v1'
        } = options;

        console.log('\n' + '='.repeat(70));
        console.log('🎬 GENERATING VIDEO');
        console.log('='.repeat(70));
        console.log(`Provider:  ${this.currentProvider.name}`);
        console.log(`Prompt:    ${prompt}`);
        console.log(`Style:     ${style || 'None'}`);
        console.log(`Negative:  ${negativePrompt || 'None'}`);
        console.log(`Duration:  ${duration}s`);
        console.log(`Resolution: ${resolution}`);
        console.log('='.repeat(70));

        const url = `${this.currentProvider.baseUrl}/aimodels/api/v1/ai/video/create`;
        
        const payload = {
            prompt: prompt,
            style: style || undefined,
            negative_prompt: negativePrompt || undefined,
            channel: this.currentProvider.channel,
            model_version: modelVersion,
            duration: duration,
            resolution: resolution
        };

        // Remove undefined fields
        Object.keys(payload).forEach(key => {
            if (payload[key] === undefined) delete payload[key];
        });

        try {
            console.log('\n📤 Sending request...');
            
            const response = await axios.post(url, payload, {
                headers: {
                    ...this.getCommonHeaders(),
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            });

            console.log('\n✅ SUCCESS!');
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(response.data, null, 2));
            
            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            console.log('\n❌ FAILED');
            
            if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Error:', JSON.stringify(error.response.data, null, 2));
                
                // Provide helpful error messages
                if (error.response.data?.message?.includes('pageId')) {
                    console.log('\n💡 TIP: This API requires a valid pageId. You may need to:');
                    console.log('   1. Visit the website first to generate a pageId');
                    console.log('   2. Check localStorage for existing pageId values');
                    console.log('   3. Use browser automation to obtain a valid session');
                }
                
                if (error.response.data?.message?.includes('HC verification')) {
                    console.log('\n💡 TIP: HC (Human Check) verification required.');
                    console.log('   Consider using the web interface directly or implementing captcha solving.');
                }
                
                if (error.response.data?.message?.includes('email')) {
                    console.log('\n💡 TIP: Email verification required.');
                    console.log('   You may need to register/login on the platform first.');
                }
            } else {
                console.log('Error:', error.message);
            }
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Interactive video generation
     */
    async interactiveGenerate() {
        console.log('\n' + '='.repeat(70));
        console.log('🎨 TEXT-TO-VIDEO GENERATION');
        console.log('='.repeat(70));

        return new Promise(async (resolve) => {
            let prompt, style, negativePrompt, duration, resolution;

            // Get prompt
            prompt = await this.askQuestion('\nEnter your video description (prompt): ');
            
            if (!prompt.trim()) {
                console.log('⚠️  Prompt cannot be empty. Returning to menu...');
                resolve();
                return;
            }

            // Get style (optional)
            style = await this.askQuestion('Enter style (leave empty for none, or type "list" to see styles): ');
            
            if (style.toLowerCase() === 'list') {
                this.showStyles();
                style = await this.askQuestion('Enter style: ');
            }

            // Get negative prompt (optional)
            negativePrompt = await this.askQuestion('Enter negative prompt (what to exclude, leave empty for none): ');

            // Get duration
            duration = await this.askQuestion('Enter duration in seconds (default: 3): ');
            duration = parseInt(duration) || 3;

            // Get resolution
            console.log('\nAvailable resolutions:');
            console.log('1. 512x512 (square)');
            console.log('2. 1024x1024 (HD square)');
            console.log('3. 16:9 (landscape)');
            console.log('4. 9:16 (portrait)');
            const resChoice = await this.askQuestion('Choose resolution (1-4, default: 1): ');
            
            const resolutions = ['512x512', '1024x1024', '1024x576', '576x1024'];
            resolution = resolutions[parseInt(resChoice) - 1] || '512x512';

            // Confirm generation
            console.log('\n' + '-'.repeat(70));
            console.log('CONFIGURATION SUMMARY:');
            console.log('-'.repeat(70));
            console.log(`Prompt:         ${prompt}`);
            console.log(`Style:          ${style || 'None'}`);
            console.log(`Negative:       ${negativePrompt || 'None'}`);
            console.log(`Duration:       ${duration}s`);
            console.log(`Resolution:     ${resolution}`);
            console.log(`Provider:       ${this.currentProvider.name}`);
            console.log('-'.repeat(70));

            const confirm = await this.askQuestion('\nGenerate video? (yes/no): ');
            
            if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
                await this.generateVideo(prompt, {
                    style,
                    negativePrompt,
                    duration,
                    resolution
                });
            } else {
                console.log('\n⚠️  Generation cancelled.');
            }

            resolve();
        });
    }

    /**
     * Test preset scenarios
     */
    async testPresets() {
        console.log('\n' + '='.repeat(70));
        console.log('🧪 PRESET TEST SCENARIOS');
        console.log('='.repeat(70));

        const presets = [
            {
                name: 'Sunset Paradise',
                prompt: 'A beautiful sunset over tropical mountains with palm trees',
                style: 'cinematic',
                negative: 'blurry, low quality'
            },
            {
                name: 'Cyberpunk City',
                prompt: 'Futuristic city with flying cars, neon lights, rain at night',
                style: 'cyberpunk',
                negative: 'daylight, sunny'
            },
            {
                name: 'Ocean Waves',
                prompt: 'Peaceful ocean waves crashing on sandy beach',
                style: 'realistic',
                negative: 'cartoon, anime, people'
            },
            {
                name: 'Space Exploration',
                prompt: 'Astronaut floating in space with Earth and stars in background',
                style: 'scifi',
                negative: 'blurry, distorted'
            },
            {
                name: 'Fantasy Forest',
                prompt: 'Magical forest with glowing mushrooms and fairy lights',
                style: 'fantasy',
                negative: 'modern, urban'
            }
        ];

        presets.forEach((preset, index) => {
            console.log(`\n${index + 1}. ${preset.name}`);
            console.log(`   Prompt: ${preset.prompt}`);
            console.log(`   Style: ${preset.style}`);
        });

        console.log('\n' + '-'.repeat(70));
        const choice = await this.askQuestion('\nSelect preset (1-5) or "all" to test all: ');

        if (choice.toLowerCase() === 'all') {
            for (let i = 0; i < presets.length; i++) {
                console.log(`\n\n${'='.repeat(70)}`);
                console.log(`Testing Preset ${i + 1}/${presets.length}: ${presets[i].name}`);
                console.log('='.repeat(70));
                
                await this.generateVideo(presets[i].prompt, {
                    style: presets[i].style,
                    negativePrompt: presets[i].negative,
                    duration: 3,
                    resolution: '512x512'
                });

                if (i < presets.length - 1) {
                    console.log('\n⏳ Waiting 3 seconds before next test...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }
        } else {
            const index = parseInt(choice) - 1;
            if (index >= 0 && index < presets.length) {
                const preset = presets[index];
                await this.generateVideo(preset.prompt, {
                    style: preset.style,
                    negativePrompt: preset.negative,
                    duration: 3,
                    resolution: '512x512'
                });
            } else {
                console.log('\n⚠️  Invalid choice.');
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('✅ Testing complete!');
        console.log('='.repeat(70));
    }

    /**
     * Ask question helper
     */
    askQuestion(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    }

    /**
     * Main application loop
     */
    async run() {
        console.clear();
        
        while (true) {
            this.showMainMenu();
            
            const choice = await this.askQuestion('\nEnter your choice (1-6): ');

            switch (choice) {
                case '1':
                    await this.interactiveGenerate();
                    break;
                case '2':
                    await this.switchProvider();
                    break;
                case '3':
                    this.showProviderInfo();
                    break;
                case '4':
                    this.showStyles();
                    break;
                case '5':
                    await this.testPresets();
                    break;
                case '6':
                case 'exit':
                case 'quit':
                    console.log('\n👋 Goodbye! Thank you for using Terminal Video Generator.\n');
                    this.rl.close();
                    process.exit(0);
                    break;
                default:
                    console.log('\n⚠️  Invalid choice. Please enter a number between 1 and 6.\n');
            }

            // Wait for user to continue
            if (choice !== '6') {
                await this.askQuestion('\nPress Enter to continue...');
                console.clear();
            }
        }
    }
}

// Run the application
const app = new TerminalVideoGenerator();
app.run().catch(console.error);
