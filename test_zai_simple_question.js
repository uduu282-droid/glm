import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

console.log('🧪 ZAI Direct Question Test');
console.log('===========================\n');

// Load session
const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
let sessionData;

try {
    sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    console.log('✅ Session loaded\n');
} catch (error) {
    console.error('❌ No session data found.');
    process.exit(1);
}

async function askQuestion() {
    const question = 'What is 59 multiplied by 55?';
    
    console.log('Sending question:', question);
    console.log('Expected answer: 3245\n');
    
    const browser = await chromium.launch({ 
        headless: false,
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
    }
    
    const page = await context.newPage();
    
    try {
        console.log('Opening https://chat.z.ai/...\n');
        await page.goto('https://chat.z.ai/', { waitUntil: 'networkidle', timeout: 30000 });
        
        // Wait for input
        await page.waitForSelector('textarea[placeholder*="message"], textarea[placeholder*="type"]', { timeout: 10000 });
        
        // Clear any existing text and type new question
        await page.click('textarea');
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Delete');
        await page.type('textarea', question);
        
        console.log('✓ Question typed');
        
        // Press Enter
        await page.keyboard.press('Enter');
        console.log('✓ Message sent\n');
        
        // Wait for response (up to 30 seconds)
        console.log('Waiting for AI response...');
        
        // Wait for typing indicator to appear then disappear
        try {
            await page.waitForSelector('[class*="typing"], [class*="thinking"]', { timeout: 5000 });
            console.log('✓ AI is thinking...');
            await page.waitForFunction(() => {
                const typing = document.querySelector('[class*="typing"], [class*="thinking"]');
                return !typing;
            }, { timeout: 30000 });
            console.log('✓ AI finished thinking\n');
        } catch (e) {
            console.log('(No typing indicator detected, checking for response...)');
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
        
        // Get all message content
        const content = await page.evaluate(() => {
            const main = document.querySelector('main');
            return main ? main.innerText : document.body.innerText;
        });
        
        // Extract just the AI response (after our question)
        const lines = content.split('\n').filter(line => line.trim().length > 0);
        let aiResponse = '';
        let foundQuestion = false;
        
        for (const line of lines) {
            if (line.includes(question) || line.includes('You:')) {
                foundQuestion = true;
                continue;
            }
            if (foundQuestion && line.length > 50 && !line.includes('Todo') && !line.includes('搜索收集')) {
                aiResponse += line + '\n';
            }
        }
        
        console.log('='.repeat(60));
        console.log('AI RESPONSE:');
        console.log('='.repeat(60));
        
        if (aiResponse.trim()) {
            console.log(aiResponse.trim());
            console.log('='.repeat(60));
            
            // Check for correct answer
            const hasCorrectAnswer = aiResponse.includes('3245') || 
                                    aiResponse.toLowerCase().includes('three thousand');
            
            console.log('\n✓ Contains "3245":', hasCorrectAnswer ? 'YES ✅' : 'NO ❌');
            
            if (hasCorrectAnswer) {
                console.log('\n🎉 SUCCESS! AI answered correctly!\n');
            } else {
                console.log('\n⚠️  Response may not contain expected answer\n');
            }
        } else {
            console.log('No clear response extracted.');
            console.log('Check browser window at: https://chat.z.ai/\n');
        }
        
    } catch (error) {
        console.log('Error:', error.message);
    } finally {
        console.log('\nBrowser will remain open. Check https://chat.z.ai/ to see the conversation.\n');
        // Don't close browser so user can see the result
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

askQuestion().catch(console.error);
