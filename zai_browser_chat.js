import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Header Spoofing for Browser
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.2; rv:121.0) Gecko/20100101 Firefox/121.0'
];

class ZAITerminalBrowserChat {
    constructor() {
        this.browser = null;
        this.page = null;
        this.context = null;
        this.spoofedUA = null;
    }

    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    async initialize() {
        console.log('🎭 Z.AI Terminal Chat with Browser Automation');
        console.log('==============================================\n');

        // Load session to check if logged in
        const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
        let hasSession = false;
        
        try {
            const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
            hasSession = true;
            console.log('✅ Session found\n');
        } catch (error) {
            console.log('⚠️  No session found - will need to login\n');
        }

        // Launch browser with spoofed User-Agent
        this.spoofedUA = this.getRandomItem(USER_AGENTS);
        console.log(`🎭 Using Spoofed Identity:`);
        console.log(`   Browser: ${this.spoofedUA.includes('Chrome') ? 'Chrome' : this.spoofedUA.includes('Firefox') ? 'Firefox' : 'Safari'}`);
        console.log(`   UA: ${this.spoofedUA.substring(0, 60)}...\n`);

        this.browser = await chromium.launch({
            headless: true,
            args: ['--disable-blink-features=AutomationControlled']
        });

        this.context = await this.browser.newContext({
            userAgent: this.spoofedUA,
            viewport: { width: 1280, height: 900 },
            locale: 'en-US',
            timezoneId: 'America/New_York'
        });

        this.page = await this.context.newPage();
        
        // Navigate to Z.ai
        console.log('📍 Navigating to https://chat.z.ai...');
        await this.page.goto('https://chat.z.ai/', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });

        console.log('✅ Page loaded\n');

        // Check if already logged in
        const isLogged = await this.checkIfLoggedIn();
        
        if (!isLogged) {
            console.log('⚠️  Not logged in!');
            console.log('👉 Please login in the browser window...');
            
            // Wait for login (max 2 minutes)
            await this.waitForLogin();
        } else {
            console.log('✅ Already logged in!\n');
        }

        // Save fresh session
        await this.saveSession();
    }

    async checkIfLoggedIn() {
        try {
            const content = await this.page.content();
            const url = this.page.url();
            
            return (url.includes('/chat') || 
                   content.includes('textarea') || 
                   content.includes('message')) &&
                   !content.includes('login') && 
                   !content.includes('sign in');
        } catch {
            return false;
        }
    }

    async waitForLogin() {
        const maxAttempts = 60;
        let attempts = 0;

        while (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 2000));
            attempts++;

            if (await this.checkIfLoggedIn()) {
                console.log('\n✅ Login detected!\n');
                
                // Save session after login
                await this.saveSession();
                return;
            }

            if (attempts % 10 === 0) {
                console.log(`⏳ Waiting... (${attempts * 2}s)`);
            }
        }

        console.log('\n❌ Login timeout!\n');
    }

    async saveSession() {
        try {
            const cookies = await this.context.cookies();
            const localStorage = await this.page.evaluate(() => {
                const data = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    data[key] = localStorage.getItem(key);
                }
                return data;
            });

            const sessionData = {
                cookies: cookies.map(cookie => ({
                    name: cookie.name,
                    value: cookie.value,
                    domain: cookie.domain,
                    path: cookie.path || '/',
                    expires: cookie.expires || -1
                })),
                localStorage: localStorage,
                url: this.page.url(),
                timestamp: Date.now()
            };

            const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
            fs.writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));
            console.log('💾 Session saved\n');
        } catch (error) {
            console.log('⚠️  Could not save session:', error.message);
        }
    }

    async sendMessage(message) {
        try {
            // Find chat input
            const inputSelector = 'textarea, input[placeholder*="message"], input[placeholder*="type"]';
            await this.page.waitForSelector(inputSelector, { timeout: 5000 });
            
            // Type message
            await this.page.fill(inputSelector, message);
            
            // Press Enter or find send button
            await this.page.press(inputSelector, 'Enter');
            
            // Wait for response (look for new message appearing)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Try to get response
            const messages = await this.page.$$('div[class*="message"], div[class*="response"], .message, .response');
            
            if (messages.length > 0) {
                const lastMessage = messages[messages.length - 1];
                const text = await lastMessage.textContent();
                return { success: true, response: text.trim() };
            }

            return { success: true, response: 'Message sent! (Check browser for response)' };
            
        } catch (error) {
            return { 
                success: false, 
                error: `Could not send message: ${error.message}` 
            };
        }
    }

    startInteractiveChat() {
        console.log('\n💬 Interactive Chat Mode');
        console.log('========================');
        console.log('Type your message and press Enter');
        console.log('Commands: /help, /exit, /clear, /save, /ua\n');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const askQuestion = async () => {
            rl.question('👤 You: ', async (message) => {
                const trimmed = message.trim().toLowerCase();

                // Handle commands
                if (trimmed === '/exit' || trimmed === '/quit') {
                    console.log('\n👋 Goodbye! Closing browser...\n');
                    rl.close();
                    await this.browser.close();
                    return;
                }

                if (trimmed === '/help') {
                    console.log('\n📖 Commands:');
                    console.log('  /help   - Show this help');
                    console.log('  /exit   - Exit chat');
                    console.log('  /clear  - Clear screen');
                    console.log('  /save   - Save current session');
                    console.log('  /ua     - Show current User-Agent');
                    console.log('  /rotate - Rotate to new User-Agent');
                    console.log('');
                    askQuestion();
                    return;
                }

                if (trimmed === '/clear') {
                    console.clear();
                    this.startInteractiveChat();
                    return;
                }

                if (trimmed === '/save') {
                    await this.saveSession();
                    askQuestion();
                    return;
                }

                if (trimmed === '/ua') {
                    console.log(`\n🎭 Current User-Agent:\n${this.spoofedUA}\n`);
                    askQuestion();
                    return;
                }

                if (trimmed === '/rotate') {
                    this.spoofedUA = this.getRandomItem(USER_AGENTS);
                    console.log(`\n✅ Rotated to new identity:\n${this.spoofedUA}\n`);
                    askQuestion();
                    return;
                }

                // Send message
                console.log('\n⏳ Sending message...\n');
                const result = await this.sendMessage(message);

                if (result.success) {
                    console.log('\n✅ Response:');
                    console.log(result.response);
                    console.log('');
                } else {
                    console.log('\n❌ Error:', result.error);
                    console.log('\n💡 Make sure you\'re logged in at https://chat.z.ai/\n');
                }

                askQuestion();
            });
        };

        askQuestion();
    }
}

// Main execution
async function main() {
    const chat = new ZAITerminalBrowserChat();
    await chat.initialize();
    chat.startInteractiveChat();
}

main().catch(console.error);
