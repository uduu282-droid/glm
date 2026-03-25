import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

/**
 * 🔐 NoteGPT Cookie Extractor
 * 
 * Automates login and cookie extraction from notegpt.io
 */

async function extractNoteGPTCookies() {
    console.log('🔐 NoteGPT Cookie Extractor\n');
    console.log('='.repeat(70));
    
    let browser = null;
    
    try {
        // Launch browser
        console.log('🚀 Launching browser...');
        browser = await chromium.launch({
            headless: false, // Show browser so user can login
            args: [
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox'
            ]
        });
        
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
        });
        
        const page = await context.newPage();
        
        // Navigate to NoteGPT
        console.log('📍 Navigating to notegpt.io...');
        await page.goto('https://notegpt.io', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('✅ Page loaded\n');
        
        // Instructions for user
        console.log('📋 INSTRUCTIONS:');
        console.log('-'.repeat(70));
        console.log('1. If you see a login/signup screen, complete the login process');
        console.log('2. If already logged in, just ask one question in the chat');
        console.log('3. After you see a response, I\'ll extract the cookies');
        console.log('4. Press Ctrl+C if you want to cancel\n');
        console.log('⏳ Waiting for you to interact with the page...\n');
        
        // Wait for user to login and ask a question
        // We'll check for chat activity
        let cookiesExtracted = false;
        
        while (!cookiesExtracted) {
            // Check if chat interface is visible
            const chatVisible = await page.isVisible('textarea[placeholder*="message"], .chat-input, [contenteditable="true"]').catch(() => false);
            
            if (chatVisible) {
                console.log('💬 Chat interface detected!\n');
                
                // Give user time to ask a question
                console.log('💡 Please type and send a test message in the chat...');
                console.log('⏳ Waiting 30 seconds for you to ask a question...\n');
                
                await new Promise(resolve => setTimeout(resolve, 30000));
                
                // Now extract cookies
                console.log('📥 Extracting cookies...');
                const cookies = await context.cookies();
                
                // Convert to our format
                const cookieObj = {};
                cookies.forEach(cookie => {
                    cookieObj[cookie.name] = cookie.value;
                });
                
                // Save to file
                const outputPath = path.join(process.cwd(), 'notegpt-cookies.json');
                fs.writeFileSync(outputPath, JSON.stringify(cookieObj, null, 2));
                
                console.log('✅ Cookies extracted successfully!\n');
                console.log(`💾 Saved to: ${outputPath}\n`);
                
                // Show summary
                console.log('📊 Cookie Summary:');
                console.log('-'.repeat(70));
                console.log(`Total cookies: ${Object.keys(cookieObj).length}`);
                console.log('\nKey cookies found:');
                ['anonymous_user_id', 'sbox-guid', '_ga', '_gid', 'g_state'].forEach(key => {
                    if (cookieObj[key]) {
                        console.log(`  ✅ ${key}: ${cookieObj[key].substring(0, 50)}...`);
                    }
                });
                
                cookiesExtracted = true;
                
                // Test the cookies immediately
                console.log('\n' + '='.repeat(70));
                console.log('🧪 Testing extracted cookies...\n');
                
                await testCookies(cookieObj);
                
                break;
            }
            
            // Wait and check again
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.log('\n💡 Make sure you:');
        console.log('   1. Have a NoteGPT account');
        console.log('   2. Complete the login process');
        console.log('   3. Ask at least one question in chat\n');
    } finally {
        if (browser) {
            console.log('\n👋 Closing browser...');
            await browser.close();
        }
    }
}

/**
 * Test if extracted cookies work
 */
async function testCookies(cookies) {
    const cookieString = Object.entries(cookies)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');
    
    try {
        const response = await fetch('https://notegpt.io/api/v2/chat/stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Cookie': cookieString,
                'Origin': 'https://notegpt.io',
                'Referer': 'https://notegpt.io/ai-chat',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({
                message: 'Hello, this is a test!',
                model: 'gpt-4o-mini',
                stream: false
            })
        });
        
        const data = await response.json();
        
        if (response.ok && !data.code) {
            console.log('✅ COOKIES ARE VALID! Working perfectly!\n');
            console.log('📝 Test response received:\n');
            console.log(data.choices?.[0]?.message?.content || JSON.stringify(data, null, 2));
            console.log('\n🎉 You can now use the API client!\n');
        } else {
            console.log('⚠️  Cookies may not be fully valid yet');
            console.log('Response:', JSON.stringify(data, null, 2));
            console.log('\n💡 Try asking another question in the browser, then run again\n');
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        console.log('\n💡 The cookies might need refreshing\n');
    }
}

// Run the extractor
extractNoteGPTCookies().catch(console.error);
