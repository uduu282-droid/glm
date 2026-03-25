import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

console.log('🧪 ZAI Math Question Test - Browser Automation');
console.log('===============================================\n');

// Load session
const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
let sessionData;

try {
    sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    console.log('✅ Session loaded\n');
} catch (error) {
    console.error('❌ No session data found.');
    console.log('💡 Run: node zai_login_explorer.js first\n');
    process.exit(1);
}

async function askMathQuestion() {
    const question = 'What is 59 x 55?';
    const expectedAnswer = 3245;
    
    console.log('📐 MATH QUESTION TEST');
    console.log('─'.repeat(60));
    console.log(`Question: ${question}`);
    console.log(`Expected Answer: ${expectedAnswer}`);
    console.log('─'.repeat(60));
    console.log('\n🎭 Opening browser with authenticated session...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--window-size=1280,900', '--disable-blink-features=AutomationControlled']
    });
    
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 900 }
    });
    
    // Load session cookies
    if (sessionData.cookies && sessionData.cookies.length > 0) {
        const cookies = sessionData.cookies.map(c => {
            let domain = c.domain;
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
        console.log('✅ Cookies loaded\n');
    }
    
    const page = await context.newPage();
    
    try {
        console.log('📍 Navigating to https://chat.z.ai/...');
        await page.goto('https://chat.z.ai/', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        console.log('✅ Page loaded!\n');
        
        // Wait for chat input
        console.log('💬 Looking for chat input field...');
        await page.waitForSelector('textarea, input[placeholder*="message"], input[placeholder*="type"]', { timeout: 10000 });
        console.log('✅ Found chat input!\n');
        
        // Get message count before sending
        const messagesBefore = await page.$$('div[class*="message"], div[class*="response"], .prose').then(m => m.length);
        console.log(`   Messages on page: ${messagesBefore}`);
        
        // Send the math question
        console.log(`\n📝 Sending question: "${question}"`);
        const inputSelector = 'textarea, input[placeholder*="message"], input[placeholder*="type"]';
        
        await page.fill(inputSelector, question);
        await page.press(inputSelector, 'Enter');
        
        // Wait for response
        console.log('⏳ Waiting for AI response...');
        
        let attempts = 0;
        const maxAttempts = 40; // 20 seconds with 500ms checks
        let newMessageFound = false;
        
        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const currentMessages = await page.$$('div[class*="message"], div[class*="response"], .prose').then(m => m.length);
            
            if (currentMessages > messagesBefore) {
                console.log(`   ✅ New message detected! (${currentMessages} total)`);
                newMessageFound = true;
                break;
            }
            attempts++;
            
            if (attempts % 10 === 0) {
                console.log(`   Still waiting... (${attempts * 0.5}s elapsed)`);
            }
        }
        
        if (!newMessageFound) {
            console.log('   ⚠️  No new message detected, trying to grab available content...');
        }
        
        // Get AI response
        let responseText = '';
        
        // Method 1: Look for assistant messages
        console.log('\n🔍 Extracting AI response...');
        const assistantMessages = await page.$$('div[class*="assistant"], div[class*="ai"], div[class*="bot"], [class*="response"]');
        
        if (assistantMessages.length > 0) {
            for (let i = assistantMessages.length - 1; i >= 0; i--) {
                const msg = assistantMessages[i];
                const text = await msg.textContent();
                const trimmed = text.trim();
                
                if (trimmed.length > 0 && 
                    trimmed.length < 1000 &&
                    !trimmed.includes(question) &&
                    !trimmed.includes('Todo Progress')) {
                    responseText = trimmed;
                    break;
                }
            }
        }
        
        // Method 2: Look in main content
        if (!responseText) {
            const paragraphs = await page.$$('main p, main div, article p, article div');
            for (let i = paragraphs.length - 1; i >= 0; i--) {
                const text = await paragraphs[i].textContent();
                const trimmed = text.trim();
                
                if (trimmed.length > 50 && 
                    !trimmed.includes(question) &&
                    !trimmed.includes('You:')) {
                    responseText = trimmed;
                    break;
                }
            }
        }
        
        // Method 3: JavaScript evaluation
        if (!responseText) {
            responseText = await page.evaluate(() => {
                const chatSelectors = [
                    '[class*="message"]',
                    '[class*="response"]', 
                    '[class*="assistant"]',
                    '.prose'
                ];
                
                for (const selector of chatSelectors) {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        const lastElement = elements[elements.length - 1];
                        const text = lastElement.textContent.trim();
                        if (text.length > 0 && text.length < 1000) {
                            return text;
                        }
                    }
                }
                return '';
            });
        }
        
        // Display results
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESULTS');
        console.log('='.repeat(60));
        
        if (responseText) {
            console.log('✅ AI RESPONSE RECEIVED!\n');
            console.log('🤖 AI Answer:');
            console.log('─'.repeat(60));
            console.log(responseText);
            console.log('─'.repeat(60));
            
            // Check if answer contains correct result
            const containsCorrectAnswer = responseText.includes('3245') || 
                                         responseText.includes('three thousand two hundred forty-five') ||
                                         responseText.toLowerCase().includes('thirty-two forty-five');
            
            console.log('\n🎯 VERIFICATION:');
            console.log(`Expected: ${expectedAnswer}`);
            console.log(`Found in response: ${containsCorrectAnswer ? '✅ YES' : '❌ NO'}`);
            
            if (containsCorrectAnswer) {
                console.log('\n🎉 SUCCESS! AI provided correct answer!');
            } else {
                console.log('\n⚠️  Answer may not contain expected result');
                console.log('   (but AI did respond to the question)');
            }
        } else {
            console.log('❌ NO RESPONSE EXTRACTED');
            console.log('\n💡 The AI is responding - check https://chat.z.ai/ to see it');
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ Test complete!');
        console.log('='.repeat(60) + '\n');
        
    } catch (error) {
        console.log('\n❌ Error:', error.message);
        console.log('\n💡 You can still chat at: https://chat.z.ai/\n');
    } finally {
        await browser.close();
    }
}

// Run the test
askMathQuestion().catch(console.error);
