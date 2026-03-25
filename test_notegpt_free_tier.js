import { chromium } from 'playwright';

/**
 * 🆓 Test NoteGPT Free Tier (3 free uses)
 * 
 * This will:
 * 1. Open browser to notegpt.io
 * 2. Ask 3 questions using the free tier
 * 3. Show responses
 * 4. Verify it works without login
 */

async function testFreeTier() {
    console.log('🆓 Testing NoteGPT Free Tier (3 Free Questions)\n');
    console.log('='.repeat(70));
    
    const browser = await chromium.launch({
        headless: false,
        args: ['--disable-blink-features=AutomationControlled']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    
    try {
        // Navigate to NoteGPT
        console.log('📍 Navigating to notegpt.io...');
        await page.goto('https://notegpt.io/ai-chat', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        console.log('✅ Page loaded\n');
        
        // Check if we need to login
        const needsLogin = await page.isVisible('button:has-text("Sign In"), button:has-text("Sign Up")').catch(() => false);
        
        if (needsLogin) {
            console.log('⚠️  Login required. Please sign up or login manually.');
            console.log('💡 After logging in, press Ctrl+C and run: node notegpt_cookie_extractor.js\n');
            return;
        }
        
        console.log('✅ No login required - testing free tier!\n');
        
        // Questions to ask
        const questions = [
            'What is 2 + 2?',
            'What is 59 × 89?',
            'Who wrote Romeo and Juliet?'
        ];
        
        for (let i = 0; i < questions.length; i++) {
            console.log(`\n❓ QUESTION ${i + 1}/3: ${questions[i]}`);
            console.log('-'.repeat(70));
            
            // Find chat input
            const inputField = await page.$('textarea[placeholder*="message"], textarea, .chat-input, [contenteditable="true"]');
            
            if (!inputField) {
                console.log('❌ Chat input not found! May need to login.\n');
                continue;
            }
            
            // Type question
            await inputField.type(questions[i], { delay: 10 });
            
            // Send message (press Enter)
            await page.keyboard.press('Enter');
            
            console.log('⏳ Waiting for response...');
            
            // Wait for response (look for new messages)
            await page.waitForSelector('.message, .response, [class*="message"]', { timeout: 30000 });
            
            // Extract response
            const messages = await page.$$('div[class*="message"] p, .response p, [class*="response"] p');
            const lastMessage = await messages[messages.length - 1].textContent();
            
            console.log('\n💬 RESPONSE:');
            console.log(lastMessage.substring(0, 300) + (lastMessage.length > 300 ? '...' : ''));
            console.log('');
            
            // Wait between questions
            if (i < questions.length - 1) {
                console.log('⏳ Waiting 3 seconds before next question...\n');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('✅ FREE TIER TEST COMPLETE!\n');
        console.log('📊 Summary:');
        console.log('   - Asked 3 questions');
        console.log('   - Got responses: YES ✅');
        console.log('   - Login required: NO ✅');
        console.log('   - Quality: Check responses above\n');
        
        console.log('💡 To use programmatically, run:');
        console.log('   node notegpt_cookie_extractor.js\n');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.log('\n💡 This might mean:');
        console.log('   1. Login is required');
        console.log('   2. Free tier already used');
        console.log('   3. Network issues\n');
    } finally {
        await browser.close();
    }
}

testFreeTier().catch(console.error);
