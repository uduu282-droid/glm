import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

async function loginAndExploreZAI() {
    console.log('🔐 Z.AI Login & Feature Explorer');
    console.log('================================\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--window-size=1280,900']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // Navigate to Z.ai
        console.log('📍 Navigating to https://chat.z.ai...');
        await page.goto('https://chat.z.ai/', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        console.log('✅ Page loaded!\n');
        
        // Wait for user to log in
        console.log('👉 Please log in to your Z.ai account');
        console.log('   You have 2 minutes to complete login...\n');
        
        // Wait for login - check every 2 seconds for up to 2 minutes
        let loggedIn = false;
        let maxAttempts = 60;
        let attempts = 0;
        
        while (!loggedIn && attempts < maxAttempts) {
            await page.waitForTimeout(2000);
            attempts++;
            
            // Check if we're on the chat page (not login page)
            const currentUrl = page.url();
            const content = await page.content();
            
            // Check for signs of being logged in
            if (currentUrl.includes('/chat') || 
                content.includes('textarea') || 
                content.includes('message') ||
                !content.includes('login') && !content.includes('sign in')) {
                
                console.log('\n✅ Login detected!\n');
                loggedIn = true;
                break;
            }
            
            if (attempts % 10 === 0) {
                console.log(`⏳ Still waiting... (${attempts * 2}s)`);
            }
        }
        
        if (!loggedIn) {
            console.log('\n⚠️  Login timeout. Please run again to try.\n');
            await browser.close();
            return;
        }
        
        // Extract session data
        console.log('💾 Extracting session data...');
        
        const cookies = await context.cookies();
        const localStorage = await page.evaluate(() => {
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
            url: page.url(),
            timestamp: Date.now()
        };
        
        // Save session data
        const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
        fs.writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));
        console.log(`✅ Session saved to: ${sessionPath}\n`);
        
        // Display session info
        console.log('📋 Session Details:');
        console.log(`   Cookies: ${cookies.length}`);
        console.log(`   LocalStorage Items: ${Object.keys(localStorage).length}`);
        console.log(`   Current URL: ${page.url()}`);
        console.log(`   Token: ${localStorage.token ? localStorage.token.substring(0, 50) + '...' : 'Not found'}\n`);
        
        // Test API endpoints
        console.log('🧪 Testing API Endpoints...\n');
        
        const bearerToken = localStorage.token;
        const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
        
        const endpoints = [
            { name: 'Get Chats', url: 'https://chat.z.ai/api/v1/chats/?page=1', method: 'GET' },
            { name: 'Get Models', url: 'https://chat.z.ai/api/v1/models', method: 'GET' },
            { name: 'User Profile', url: 'https://chat.z.ai/api/v1/user/profile', method: 'GET' }
        ];
        
        for (const endpoint of endpoints) {
            console.log(`Testing: ${endpoint.name}`);
            console.log(`URL: ${endpoint.url}`);
            
            try {
                const response = await fetch(endpoint.url, {
                    method: endpoint.method,
                    headers: {
                        'accept': 'application/json',
                        'authorization': `Bearer ${bearerToken}`,
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
                        'referer': 'https://chat.z.ai/',
                        'cookie': cookieHeader
                    }
                });
                
                console.log(`Status: ${response.status} ${response.statusText}`);
                
                const text = await response.text();
                if (response.ok) {
                    try {
                        const data = JSON.parse(text);
                        console.log('✅ Success!');
                        console.log(`Response preview: ${JSON.stringify(data).substring(0, 300)}...\n`);
                    } catch {
                        console.log('✅ Success! (Non-JSON response)\n');
                    }
                } else {
                    console.log(`❌ Failed\n`);
                }
            } catch (error) {
                console.log(`❌ Error: ${error.message}\n`);
            }
        }
        
        // Explore UI features
        console.log('🔍 Exploring UI Features...\n');
        
        const features = {
            'Chat Input': await page.$('textarea, input[placeholder*="message"], input[placeholder*="type"]'),
            'New Chat Button': await page.$('button:has-text("New"), button:has-text("+"), .new-chat'),
            'Settings': await page.$('button:has-text("Settings"), .settings, [aria-label*="settings"]'),
            'History/Sidebar': await page.$('.sidebar, aside, [class*="history"], [class*="sidebar"]')
        };
        
        Object.entries(features).forEach(([name, element]) => {
            console.log(`${element ? '✅' : '❌'} ${name}`);
        });
        
        console.log('\n✨ Ready to use Z.ai!\n');
        console.log('Press ENTER to close browser...\n');
        await new Promise(r => process.stdin.once('data', r));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the login explorer
loginAndExploreZAI().catch(console.error);
