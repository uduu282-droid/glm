import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

console.log('🎭 Z.AI Visible Browser Chat');
console.log('============================\n');

// Load session
const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
let sessionData;

try {
    sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    console.log('✅ Session loaded\n');
} catch (error) {
    console.error('❌ No session data found.');
    console.log('💡 Run this first: node zai_advanced_login.js\n');
    process.exit(1);
}

async function startVisibleChat() {
    console.log('🌐 Opening visible browser...');
    console.log('💡 You can see and interact with the chat directly!\n');
    
    const browser = await chromium.launch({
        headless: false,  // Visible browser
        args: ['--window-size=1280,900']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 900 }
    });
    
    const page = await context.newPage();
    
    // Load cookies
    if (sessionData.cookies && sessionData.cookies.length > 0) {
        const cookies = sessionData.cookies.map(c => {
            let domain = c.domain;
            if (domain.startsWith('.')) domain = domain.substring(1);
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
        console.log('✅ Cookies loaded\n');
    }
    
    console.log('📍 Navigating to https://chat.z.ai/...\n');
    await page.goto('https://chat.z.ai/', { waitUntil: 'domcontentloaded' });
    
    // Wait for interface and disable deep thinking
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
        console.log('🧠 Disabling deep thinking mode for fast responses...');
        const deepThinkingToggle = await page.$('[class*="deep"], [class*="think"], [class*="enhance"], button[aria-label*="deep"], button[aria-label*="think"]');
        if (deepThinkingToggle) {
            const isEnabled = await page.evaluate(el => el.classList.contains('active') || el.getAttribute('aria-pressed') === 'true', deepThinkingToggle);
            if (isEnabled) {
                await deepThinkingToggle.click();
                console.log('   ✅ Deep thinking disabled - you\'ll get fast responses now!\n');
            } else {
                console.log('   ℹ️  Deep thinking already disabled\n');
            }
        }
    } catch (error) {
        console.log('   ⚠️  Could not toggle deep thinking\n');
    }
    
    console.log('✨ Browser is ready!');
    console.log('=====================================\n');
    console.log('You can now:');
    console.log('  • Type messages in the browser window');
    console.log('  • See real-time responses');
    console.log('  • Use all Z.AI features visually');
    console.log('\nPress Ctrl+C in terminal when done.\n');
    
    // Keep running until user closes
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.on('close', async () => {
        console.log('\n👋 Closing browser...');
        await browser.close();
        process.exit(0);
    });
    
    // Simple menu
    setInterval(() => {
        console.log('\n💡 Commands:');
        console.log('  /save - Save current session');
        console.log('  /refresh - Refresh page');
        console.log('  /exit - Close browser\n');
    }, 30000);
    
    // Handle commands
    rl.question('', async (cmd) => {
        const command = cmd.trim().toLowerCase();
        
        if (command === '/save') {
            try {
                const cookies = await context.cookies();
                const localStorage = await page.evaluate(() => {
                    const data = {};
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        data[key] = localStorage.getItem(key);
                    }
                    return data;
                });
                
                const updatedSession = {
                    cookies: cookies.map(c => ({
                        name: c.name,
                        value: c.value,
                        domain: c.domain,
                        path: c.path || '/',
                        expires: c.expires || -1
                    })),
                    localStorage: localStorage,
                    url: page.url(),
                    timestamp: Date.now()
                };
                
                fs.writeFileSync(sessionPath, JSON.stringify(updatedSession, null, 2));
                console.log('✅ Session saved!\n');
            } catch (error) {
                console.log('❌ Could not save:', error.message, '\n');
            }
            rl.question('', arguments[0]);
        } else if (command === '/refresh') {
            console.log('🔄 Refreshing page...\n');
            await page.reload();
            rl.question('', arguments[0]);
        } else if (command === '/exit' || command === '/quit') {
            console.log('\n👋 Goodbye!\n');
            await browser.close();
            rl.close();
            process.exit(0);
        } else {
            rl.question('', arguments[0]);
        }
    });
}

startVisibleChat().catch(console.error);
