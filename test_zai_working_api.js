import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

console.log('🧪 Z.AI Simple API Test - Math Question');
console.log('========================================\n');

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
    const question = 'What is 59 multiplied by 55?';
    const expectedAnswer = 3245;
    
    console.log(`Question: ${question}`);
    console.log(`Expected: ${expectedAnswer}\n`);
    
    console.log('🚀 Launching browser...');
    const browser = await chromium.launch({ 
        headless: false, // Visible so you can see what's happening
        args: ['--window-size=1280,720']
    });
    
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    // Load cookies
    if (sessionData.cookies) {
        const cookies = sessionData.cookies.map(c => ({
            name: c.name,
            value: c.value,
            domain: c.domain.startsWith('.') ? c.domain.substring(1) : c.domain,
            path: c.path || '/'
        }));
        await context.addCookies(cookies);
        console.log('✅ Cookies loaded\n');
    }
    
    const page = await context.newPage();
    
    try {
        console.log('📍 Going to https://chat.z.ai/...');
        
        // Use domcontentloaded instead of networkidle for faster load
        await page.goto('https://chat.z.ai/', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        console.log('✅ Page loaded\n');
        
        // Wait a bit for JavaScript to initialize
        console.log('⏳ Waiting for interface to initialize...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Find chat input
        console.log('💬 Looking for chat input...');
        const inputSelector = 'textarea[placeholder*="message"], textarea[placeholder*="type"], input[type="text"]';
        
        try {
            await page.waitForSelector(inputSelector, { timeout: 10000 });
            console.log('✅ Found chat input\n');
        } catch (e) {
            console.log('❌ Chat input not found!');
            console.log('Taking screenshot...');
            await page.screenshot({ path: 'zai_error.png' });
            console.log('📸 Check zai_error.png');
            return;
        }
        
        // Type question
        console.log(`📝 Typing: "${question}"`);
        await page.click(inputSelector);
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Delete');
        await page.type(inputSelector, question, { delay: 20 });
        console.log('✓ Question typed\n');
        
        // Send message
        console.log('📤 Sending message...');
        await page.keyboard.press('Enter');
        console.log('✓ Message sent\n');
        
        // Wait for response
        console.log('⏳ Waiting for AI response (up to 30 seconds)...');
        
        const messagesBefore = 0; // We'll just wait for any new content
        let responseFound = false;
        
        for (let attempt = 0; attempt < 60; attempt++) { // 30 seconds
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Check if there's new content
            const allText = await page.evaluate(() => document.body.innerText);
            
            if (allText.length > 500 && !allText.includes(question)) {
                console.log('✓ Response detected!\n');
                responseFound = true;
                break;
            }
            
            if (attempt % 10 === 0 && attempt > 0) {
                console.log(`   Still waiting... (${(attempt * 0.5).toFixed(1)}s)`);
            }
        }
        
        // Extract response
        console.log('🔍 Extracting AI response...\n');
        
        const fullContent = await page.evaluate(() => {
            const main = document.querySelector('main');
            return main ? main.innerText : document.body.innerText;
        });
        
        // Try to find the AI's answer
        const lines = fullContent.split('\n')
            .filter(line => line.trim().length > 50)
            .filter(line => !line.includes('Todo Progress'))
            .filter(line => !line.includes('搜索收集'))
            .filter(line => !line.includes(question));
        
        console.log('='.repeat(60));
        console.log('🤖 AI RESPONSE:');
        console.log('='.repeat(60));
        
        if (lines.length > 0) {
            const aiResponse = lines.slice(-5).join('\n');
            console.log(aiResponse);
            console.log('='.repeat(60));
            
            // Check for correct answer
            const hasCorrectAnswer = aiResponse.includes('3245') || 
                                    aiResponse.toLowerCase().includes('three thousand');
            
            console.log('\n📊 VERIFICATION:');
            console.log(`Expected: ${expectedAnswer}`);
            console.log(`Found "3245": ${hasCorrectAnswer ? 'YES ✅' : 'NO ❌'}`);
            
            if (hasCorrectAnswer) {
                console.log('\n🎉 SUCCESS! AI answered correctly!\n');
            } else {
                console.log('\n⚠️  Response may not contain expected number\n');
            }
        } else {
            console.log('Could not extract clear response.');
            console.log('Check the browser window to see the answer.\n');
        }
        
        console.log('='.repeat(60));
        console.log('✅ Test complete!');
        console.log('='.repeat(60));
        console.log('\n💬 Browser will stay open. Visit https://chat.z.ai/ to see the conversation.\n');
        
        // Keep browser open for a while so user can see result
        await new Promise(resolve => setTimeout(resolve, 10000));
        
    } catch (error) {
        console.log('\n❌ Error:', error.message);
        console.log('\n💡 You can still visit https://chat.z.ai/ to chat manually.\n');
    } finally {
        await browser.close();
    }
}

askMathQuestion().catch(console.error);
