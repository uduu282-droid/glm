import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

/**
 * 🔄 NoteGPT Trial Rotation Test
 * 
 * Tests if we can reset the 3-free-trial limit by:
 * 1. Using 3 questions
 * 2. Clearing cookies/storage
 * 3. Trying 3 more questions
 * 4. Repeat...
 */

async function testTrialRotation() {
    console.log('🔄 Testing NoteGPT Trial Rotation\n');
    console.log('='.repeat(70));
    
    let browser = null;
    
    try {
        // Launch browser
        console.log('🚀 Launching fresh browser instance...\n');
        browser = await chromium.launch({
            headless: false,
            args: ['--disable-blink-features=AutomationControlled']
        });
        
        // Test multiple "sessions"
        for (let session = 1; session <= 3; session++) {
            console.log(`\n📊 TESTING SESSION ${session}`);
            console.log('-'.repeat(70));
            
            // Create fresh context (clean cookies/storage)
            const context = await browser.newContext({
                viewport: { width: 1920, height: 1080 },
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            });
            
            const page = await context.newPage();
            
            // Navigate to NoteGPT
            console.log('📍 Navigating to notegpt.io...');
            await page.goto('https://notegpt.io/ai-chat', {
                waitUntil: 'networkidle',
                timeout: 30000
            });
            
            console.log('✅ Page loaded');
            
            // Check if login is required
            const needsLogin = await page.isVisible('button:has-text("Sign In"), button:has-text("Sign Up")').catch(() => false);
            
            if (needsLogin) {
                console.log('❌ Login wall detected - must login first');
                console.log('💡 Strategy: Login manually once, then we can rotate cookies\n');
                
                // Wait for user to login
                console.log('⏳ Waiting for you to login... (60 seconds)');
                await page.waitForTimeout(60000);
            }
            
            // Try asking questions
            const questions = [
                `Session ${session} Question 1: What is 1+1?`,
                `Session ${session} Question 2: What is 2+2?`,
                `Session ${session} Question 3: What is 3+3?`
            ];
            
            let successCount = 0;
            
            for (const question of questions) {
                try {
                    console.log(`\n❓ Asking: ${question}`);
                    
                    // Find input
                    const input = await page.$('textarea, .chat-input, [contenteditable="true"]');
                    
                    if (!input) {
                        console.log('⚠️  No chat input found - may need to login');
                        break;
                    }
                    
                    // Type and send
                    await input.type(question, { delay: 10 });
                    await page.keyboard.press('Enter');
                    
                    // Wait for response
                    await page.waitForSelector('.message, .response', { timeout: 15000 });
                    
                    console.log('✅ Got response!');
                    successCount++;
                    
                    // Small delay between questions
                    await page.waitForTimeout(2000);
                    
                } catch (error) {
                    console.log(`❌ Failed: ${error.message}`);
                    break;
                }
            }
            
            console.log(`\n📈 Session ${session} Results: ${successCount}/${questions.length} successful`);
            
            // Close context (clears all data)
            await context.close();
            
            console.log('🧹 Context closed - cookies/storage cleared\n');
            
            // Wait before next "session"
            if (session < 3) {
                console.log('⏳ Waiting 5 seconds before next "session"...\n');
                await page.waitForTimeout(5000);
            }
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('🎯 TRIAL ROTATION TEST COMPLETE!\n');
        console.log('📊 Summary:');
        console.log('   - Tested 3 separate "sessions"');
        console.log('   - Each with fresh cookies/storage');
        console.log('   - Check if each got ~3 questions\n');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testTrialRotation().catch(console.error);
