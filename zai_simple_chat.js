import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Simple Header Spoofing
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

// Configuration
let DEEP_THINKING_ENABLED = false; // Disabled by default for fast responses

console.log('🎭 Z.AI Terminal Chat (Simple Mode)');
console.log('====================================\n');

// Load session
const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
let sessionData;

try {
    sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    console.log('✅ Session loaded\n');
} catch (error) {
    console.error('❌ No session data found.');
    console.log('💡 Run this first: node zai_login_explorer.js\n');
    process.exit(1);
}

// Generate spoofed headers
function generateHeaders() {
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const bearerToken = sessionData.localStorage?.token || '';
    const cookieHeader = sessionData.cookies?.map(c => `${c.name}=${c.value}`).join('; ') || '';

    return {
        'accept': 'application/json',
        'authorization': `Bearer ${bearerToken}`,
        'user-agent': userAgent,
        'referer': 'https://chat.z.ai/',
        'cookie': cookieHeader,
        'cache-control': 'no-cache'
    };
}

// Test the API endpoint
async function testAPI() {
    const url = 'https://chat.z.ai/api/v1/chats/?page=1';
    const headers = generateHeaders();

    console.log('🧪 Testing API endpoint...\n');
    console.log(`Using User-Agent: ${headers['user-agent'].substring(0, 60)}...\n`);

    try {
        const response = await fetch(url, { method: 'GET', headers });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API is accessible!');
            console.log(`Response: ${JSON.stringify(data).substring(0, 200)}...\n`);
            return true;
        } else {
            console.log(`❌ API returned: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}\n`);
        return false;
    }
}

// Send message using browser automation
async function sendMessage(message) {
    const { chromium } = await import('playwright');
    
    console.log('\n🎭 Opening browser with spoofed identity...');
    const browser = await chromium.launch({ 
        headless: false,  // Make it VISIBLE so you can see what's happening
        args: ['--window-size=1280,900', '--disable-blink-features=AutomationControlled']
    });
    
    const context = await browser.newContext({
        userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
        viewport: { width: 1280, height: 900 }
    });
    
    const page = await context.newPage();
    
    try {
        // Load session cookies
        if (sessionData.cookies && sessionData.cookies.length > 0) {
            const cookies = sessionData.cookies.map(c => {
                let domain = c.domain;
                // Fix domain format - remove leading dots and http
                if (domain.startsWith('.')) {
                    domain = domain.substring(1);
                }
                if (domain.startsWith('http')) {
                    const url = new URL(domain);
                    domain = url.hostname;
                }
                
                return {
                    name: c.name,
                    value: c.value,
                    domain: domain,
                    path: c.path || '/',
                    expires: c.expires === -1 ? undefined : c.expires
                };
            });
            await context.addCookies(cookies);
        }
        
        console.log('📍 Navigating to https://chat.z.ai/...');
        await page.goto('https://chat.z.ai/', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        console.log('✅ Page loaded!');
        console.log('   You can see the browser window - watch what happens!\n');
        
        // Wait for chat input
        console.log('💬 Looking for chat input...');
        await page.waitForSelector('textarea, input[placeholder*="message"], input[placeholder*="type"]', { timeout: 10000 });
        console.log('   ✅ Found chat input!\n');
        
        // Disable deep thinking if configured
        if (!DEEP_THINKING_ENABLED) {
            try {
                console.log('🧠 Disabling deep thinking mode...');
                const deepThinkingToggle = await page.$('[class*="deep"], [class*="think"], [class*="enhance"], button[aria-label*="deep"], button[aria-label*="think"]');
                if (deepThinkingToggle) {
                    const isEnabled = await page.evaluate(el => el.classList.contains('active') || el.getAttribute('aria-pressed') === 'true', deepThinkingToggle);
                    if (isEnabled) {
                        await deepThinkingToggle.click();
                        console.log('   ✅ Deep thinking disabled');
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } else {
                        console.log('   ℹ️  Deep thinking already disabled');
                    }
                } else {
                    console.log('   ℹ️  No deep thinking toggle found');
                }
            } catch (error) {
                console.log('   ⚠️  Could not toggle deep thinking:', error.message);
            }
        }
        
        // Get current message count before sending
        const messagesBefore = await page.$$('div[class*="message"], div[class*="response"], .prose').then(m => m.length);
        console.log(`   Messages on page: ${messagesBefore}`);
        
        // Get your message text to exclude it later
        const userMessageText = message;
        
        console.log('💬 Sending message...');
        const inputSelector = 'textarea, input[placeholder*="message"], input[placeholder*="type"]';
        
        await page.fill(inputSelector, message);
        await page.press(inputSelector, 'Enter');
        
        // Wait for response (wait longer and look for NEW messages)
        console.log('⏳ Waiting for response...');
        
        // Wait for message count to increase or timeout after 10 seconds
        let attempts = 0;
        const maxAttempts = 20; // 10 seconds with 500ms checks
        let newMessageFound = false;
        
        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const currentMessages = await page.$$('div[class*="message"], div[class*="response"], .prose').then(m => m.length);
            
            if (currentMessages > messagesBefore) {
                console.log(`   New message detected! (${currentMessages} total)`);
                newMessageFound = true;
                break;
            }
            attempts++;
        }
        
        if (!newMessageFound) {
            console.log('   ⚠️  No new message container found, trying to grab any available content...');
        }
        
        // Get all text content from the page to find NEW messages
        let responseText = '';
        
        // Method 1: Look for assistant/ai response specifically
        console.log('   Trying method 1: Assistant messages...');
        const allMessages = await page.$$('div[class*="message"], div[class*="response"], .prose, div[class*="assistant"]');
        console.log(`   Found ${allMessages.length} total message containers`);
        
        // Log all messages to see what's there
        for (let i = 0; i < allMessages.length; i++) {
            const msg = allMessages[i];
            const text = await msg.textContent();
            const trimmed = text.trim();
            console.log(`   Message ${i}: ${trimmed.substring(0, 100)} (${trimmed.length} chars)`);
        }
        
        const assistantMessages = await page.$$('div[class*="assistant"], div[class*="ai"], div[class*="bot"], [class*="assistant"], [class*="response"]');
        
        if (assistantMessages.length > 0) {
            // Get the last assistant message
            for (let i = assistantMessages.length - 1; i >= 0; i--) {
                const msg = assistantMessages[i];
                const text = await msg.textContent();
                const trimmed = text.trim();
                
                console.log(`   Checking assistant message ${i}: ${trimmed.length} chars`);
                
                // Make sure it's not user's message, todo, or page title
                if (trimmed.length > 0 && 
                    trimmed.length < 500 &&  // Not too long (avoid full page text)
                    !trimmed.includes(userMessageText) &&
                    !trimmed.includes('Todo Progress') && 
                    !trimmed.includes('搜索收集') &&
                    !trimmed.startsWith('Z.ai -') &&  // Exclude page title
                    !trimmed.includes('Free AI Chatbot')) {  // Exclude page title
                    responseText = trimmed;
                    console.log(`   ✅ Found valid assistant response (${responseText.length} chars)`);
                    break;
                }
            }
        }
        
        // Method 2: If still nothing, look for paragraphs in main content area
        if (!responseText) {
            console.log('   Trying method 2: Main content areas...');
            const paragraphs = await page.$$('main p, main div, article p, article div, [class*="content"] p, [class*="content"] div');
            for (let i = paragraphs.length - 1; i >= 0; i--) {
                const text = await paragraphs[i].textContent();
                if (text && text.trim().length > 50 && 
                    !text.includes(userMessageText) &&  // Exclude user's message
                    !text.includes('You:') && 
                    !text.includes('Todo Progress') && 
                    !text.includes('搜索收集') &&
                    !text.startsWith('Z.ai -') &&  // Exclude page title
                    !text.includes('Free AI Chatbot')) {  // Exclude page title
                    responseText = text.trim();
                    console.log(`   Found response in content area (${responseText.length} chars)`);
                    break;
                }
            }
        }
        
        // Method 3: Evaluate JavaScript to find chat messages specifically
        if (!responseText) {
            console.log('   Trying method 3: JavaScript evaluation...');
            responseText = await page.evaluate((userMsg) => {
                // Look for common chat UI patterns but exclude todo lists
                const chatSelectors = [
                    '[class*="message"]',
                    '[class*="response"]', 
                    '[class*="assistant"]',
                    '.prose',
                    '[data-message]',
                    '[class*="bubble"]',
                    '[class*="chat"]'
                ];
                
                for (const selector of chatSelectors) {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        // Check last 3 elements
                        for (let i = Math.max(0, elements.length - 3); i < elements.length; i++) {
                            const text = elements[i].textContent.trim();
                            // Exclude user's message and todo lists
                            if (text.length > 0 && 
                                !text.includes(userMsg) && 
                                !text.includes('Todo Progress') && 
                                !text.includes('搜索收集')) {
                                return text;
                            }
                        }
                    }
                }
                return '';
            }, userMessageText);
            
            if (responseText) {
                console.log(`   Found response via JS evaluation (${responseText.length} chars)`);
            }
        }
        
        // Method 4: Last resort - get entire body text and extract meaningful parts
        if (!responseText) {
            console.log('   Trying method 4: Full page text extraction...');
            const fullText = await page.evaluate(() => document.body.innerText);
            
            // Try to extract meaningful response (avoid navigation, buttons, etc.)
            const lines = fullText.split('\n').filter(line => {
                const trimmed = line.trim();
                return trimmed.length > 50 && 
                       trimmed.length < 300 &&  // Not too long
                       !trimmed.includes('Sign In') && 
                       !trimmed.includes('Log In') &&
                       !trimmed.includes('Navigation') &&
                       !trimmed.includes('Todo Progress') &&
                       !trimmed.includes('搜索收集') &&
                       !trimmed.startsWith('Z.ai -') &&  // Exclude page title
                       !trimmed.includes('Free AI Chatbot') &&  // Exclude page title
                       !trimmed.includes('Terms') &&
                       !trimmed.includes('Privacy');
            });
            
            if (lines.length > 0) {
                // Take the last few meaningful lines
                responseText = lines.slice(-5).join(' ').trim();
                console.log(`   Extracted from page text (${responseText.length} chars)`);
            }
        }
        
        if (responseText && responseText.length > 0) {
            console.log('\n' + '='.repeat(60));
            console.log('✅ AI RESPONSE:');
            console.log('='.repeat(60));
            console.log(responseText);
            console.log('='.repeat(60) + '\n');
        } else {
            console.log('\n✅ Message sent successfully!');
            console.log('💡 The AI is responding - check https://chat.z.ai/ to see it\n');
            console.log('⚠️  Tip: Use visible browser mode for guaranteed results:\n   node zai_visible_chat.js\n');
        }
        
    } catch (error) {
        console.log('\n❌ Error:', error.message);
        console.log('\n💡 You can still chat at: https://chat.z.ai/\n');
    } finally {
        await browser.close();
    }
}

// Interactive chat
function startChat() {
    console.log('💬 Terminal Chat Interface');
    console.log('==========================');
    console.log('Type your message and press Enter to chat!');
    console.log('Commands: /test, /session, /rotate, /help, /exit\n');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askQuestion = async () => {
        rl.question('👤 You: ', async (input) => {
            const command = input.trim().toLowerCase();

            if (command === '/exit' || command === '/quit') {
                console.log('\n👋 Goodbye!\n');
                rl.close();
                return;
            }

            if (command === '/test') {
                await testAPI();
                askQuestion();
                return;
            }

            if (command === '/session') {
                console.log('\n📋 Current Session Info:');
                console.log(`   Token: ${sessionData.localStorage.token.substring(0, 60)}...`);
                console.log(`   Cookies: ${sessionData.cookies.length}`);
                console.log(`   URL: ${sessionData.url}\n`);
                askQuestion();
                return;
            }

            if (command === '/rotate') {
                const newUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
                console.log(`\n🎭 Rotated User-Agent:\n${newUA}\n`);
                askQuestion();
                return;
            }

            if (command === '/help') {
                console.log('\n📖 Commands:');
                console.log('  /test     - Test API connection');
                console.log('  /session  - Show session info');
                console.log('  /rotate   - Rotate User-Agent');
                console.log('  /help     - Show this help');
                console.log('  /exit     - Exit program');
                console.log('  /think    - Toggle deep thinking mode');
                console.log('  Or just type your message to chat!\n');
                askQuestion();
                return;
            }

            if (command === '/think') {
                DEEP_THINKING_ENABLED = !DEEP_THINKING_ENABLED;
                console.log(`\n🧠 Deep thinking mode: ${DEEP_THINKING_ENABLED ? '✅ ENABLED' : '❌ DISABLED'}`);
                console.log('   Fast responses:', DEEP_THINKING_ENABLED ? 'No (slow)' : 'Yes (fast)');
                console.log('   Todo lists:', DEEP_THINKING_ENABLED ? 'Yes' : 'No');
                console.log('');
                askQuestion();
                return;
            }

            // Not a command - send as message!
            if (input.trim().length > 0) {
                await sendMessage(input);
                askQuestion();
                return;
            }

            // Empty input
            askQuestion();
        });
    };

    askQuestion();
}

// Run
testAPI().then(() => {
    startChat();
}).catch(console.error);
