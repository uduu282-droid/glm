import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Header Spoofing System
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.2; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
];

const ACCEPT_LANGUAGES = ['en-US,en;q=0.9', 'en-GB,en;q=0.9', 'en-CA,en;q=0.9', 'de-DE,de;q=0.9', 'fr-FR,fr;q=0.9'];

class ChatSpoofing {
    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    generateHeaders(sessionData) {
        const userAgent = this.getRandomItem(USER_AGENTS);
        const acceptLanguage = this.getRandomItem(ACCEPT_LANGUAGES);
        const bearerToken = sessionData.localStorage?.token || '';
        const cookieHeader = sessionData.cookies?.map(c => `${c.name}=${c.value}`).join('; ') || '';

        return {
            'accept': 'application/json',
            'authorization': `Bearer ${bearerToken}`,
            'user-agent': userAgent,
            'referer': 'https://chat.z.ai/',
            'origin': 'https://chat.z.ai',
            'cookie': cookieHeader,
            'accept-language': acceptLanguage,
            'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'cache-control': 'no-cache',
            'pragma': 'no-cache',
            'content-type': 'application/json'
        };
    }
}

class ZAIChat {
    constructor() {
        this.sessionData = null;
        this.spoofing = new ChatSpoofing();
        this.baseUrl = 'https://chat.z.ai/api/v1';
        this.conversationId = null;
    }

    async initialize() {
        console.log('🎭 Z.AI Terminal Chat with Header Spoofing');
        console.log('===========================================\n');

        // Load session
        const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
        try {
            this.sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
            console.log('✅ Session loaded\n');
        } catch (error) {
            console.error('❌ No session data found.');
            console.log('💡 Run: node zai_login_explorer.js or node zai_advanced_login.js\n');
            process.exit(1);
        }

        // Check existing chats
        await this.getChats();
    }

    async getChats() {
        try {
            const headers = this.spoofing.generateHeaders(this.sessionData);
            const response = await fetch(`${this.baseUrl}/chats/?page=1`, {
                method: 'GET',
                headers: headers
            });

            if (response.ok) {
                const chats = await response.json();
                if (Array.isArray(chats) && chats.length > 0) {
                    console.log(`📋 Found ${chats.length} existing chat(s)\n`);
                    return chats;
                }
            }
            return [];
        } catch (error) {
            console.log('⚠️  Could not fetch chats:', error.message);
            return [];
        }
    }

    async sendMessage(message) {
        const headers = this.spoofing.generateHeaders(this.sessionData);
        
        console.log('\n🎭 Sending with spoofed identity:');
        console.log(`   Browser: ${headers['user-agent'].includes('Chrome') ? 'Chrome' : headers['user-agent'].includes('Firefox') ? 'Firefox' : 'Safari'}`);
        console.log(`   Language: ${headers['accept-language']}`);

        try {
            // Try to send message to API
            const payload = {
                messages: [{ role: 'user', content: message }],
                model: 'default'
            };

            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, response: data };
            } else {
                return { 
                    success: false, 
                    error: `Status ${response.status}: ${await response.text()}` 
                };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    startInteractiveChat() {
        console.log('\n💬 Interactive Chat Mode');
        console.log('========================');
        console.log('Type your message and press Enter');
        console.log('Commands: /help, /exit, /clear, /spoof\n');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const askQuestion = () => {
            rl.question('👤 You: ', async (message) => {
                const trimmed = message.trim().toLowerCase();

                // Handle commands
                if (trimmed === '/exit' || trimmed === '/quit') {
                    console.log('\n👋 Goodbye!\n');
                    rl.close();
                    return;
                }

                if (trimmed === '/help') {
                    console.log('\n📖 Commands:');
                    console.log('  /help   - Show this help');
                    console.log('  /exit   - Exit chat');
                    console.log('  /clear  - Clear screen');
                    console.log('  /spoof  - Show current spoofing config');
                    console.log('');
                    askQuestion();
                    return;
                }

                if (trimmed === '/clear') {
                    console.clear();
                    this.startInteractiveChat();
                    return;
                }

                if (trimmed === '/spoof') {
                    const headers = this.spoofing.generateHeaders(this.sessionData);
                    console.log('\n🎭 Current Spoofed Headers:');
                    console.log(`   User-Agent: ${headers['user-agent'].substring(0, 60)}...`);
                    console.log(`   Accept-Language: ${headers['accept-language']}`);
                    console.log(`   Platform: ${headers['sec-ch-ua-platform']}`);
                    console.log('');
                    askQuestion();
                    return;
                }

                // Send message
                console.log('\n⏳ Thinking...\n');
                const result = await this.sendMessage(message);

                if (result.success) {
                    console.log('\n✅ Response received!');
                    console.log(JSON.stringify(result.response, null, 2).substring(0, 500));
                    console.log('\n');
                } else {
                    console.log('\n❌ Error:', result.error);
                    console.log('\n💡 Note: Z.AI may not support direct message API yet.');
                    console.log('   The web interface works at: https://chat.z.ai/\n');
                }

                askQuestion();
            });
        };

        askQuestion();
    }
}

// Main execution
async function main() {
    const chat = new ZAIChat();
    await chat.initialize();
    chat.startInteractiveChat();
}

main().catch(console.error);
