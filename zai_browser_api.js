import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

/**
 * 🤖 Z.AI Browser-Based API Wrapper
 * 
 * This creates a "fake API" that actually uses browser automation
 * to interact with chat.z.ai website behind the scenes.
 * 
 * Usage: const answer = await askZAI("What is 59 x 55?");
 */

class ZAIBrowserAPI {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.sessionData = null;
        this.initialized = false;
    }

    // Initialize browser and load session
    async initialize() {
        if (this.initialized) return true;

        console.log('🚀 Initializing Z.AI Browser API...');

        // Load session data
        const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
        
        try {
            this.sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
            console.log('✅ Session loaded');
        } catch (error) {
            throw new Error('No session data found. Run: node zai_login_explorer.js');
        }

        // Launch browser
        this.browser = await chromium.launch({
            headless: true, // Keep it hidden
            args: [
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--no-sandbox'
            ]
        });

        this.context = await this.browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 720 },
            locale: 'en-US'
        });

        // Load cookies from session
        if (this.sessionData.cookies && this.sessionData.cookies.length > 0) {
            const cookies = this.sessionData.cookies.map(c => ({
                name: c.name,
                value: c.value,
                domain: c.domain.startsWith('.') ? c.domain.substring(1) : c.domain,
                path: c.path || '/',
                expires: c.expires === -1 ? undefined : Math.floor(c.expires)
            }));
            await this.context.addCookies(cookies);
            console.log(`✅ Loaded ${cookies.length} cookies`);
        }

        this.page = await this.context.newPage();
        
        // Navigate to Z.AI
        console.log('📍 Opening https://chat.z.ai/...');
        
        try {
            // Try with domcontentloaded first (faster)
            await this.page.goto('https://chat.z.ai/', { 
                waitUntil: 'domcontentloaded',
                timeout: 30000 
            });
            console.log('   Page loaded (DOM ready)');
        } catch (gotoError) {
            console.log('⚠️  Standard navigation failed, trying alternative approach...');
            
            // If that fails, try without waiting
            await this.page.goto('https://chat.z.ai/', { 
                waitUntil: 'commit',
                timeout: 10000 
            });
        }
        

        console.log('   Waiting for chat interface...');
        
        // Wait for page to fully load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Try multiple possible selectors for the chat input
        const possibleSelectors = [
            'textarea[placeholder*="message"]',
            'textarea[placeholder*="type"]',
            'textarea[placeholder*="Ask"]',
            'textarea[placeholder*="Type"]',
            'input[type="text"]',
            'input[placeholder*="message"]',
            'input[placeholder*="type"]',
            '[contenteditable="true"]',
            'textarea',
            'input[type="text"]'
        ];
        
        let foundSelector = null;
        
        for (const selector of possibleSelectors) {
            try {
                const element = await this.page.$(selector);
                if (element) {
                    console.log(`   ✓ Found input field: ${selector}`);
                    foundSelector = selector;
                    break;
                }
            } catch (e) {
                // Try next selector
            }
        }
        
        if (!foundSelector) {
            console.log('⚠️  Chat input not found, taking screenshot for debug...');
            await this.page.screenshot({ path: 'zai_debug_screenshot.png' });
            console.log('📸 Screenshot saved as zai_debug_screenshot.png');
            
            // Also save page HTML for debugging
            const html = await this.page.content();
            fs.writeFileSync('zai_page_source.html', html);
            console.log('💾 Page HTML saved as zai_page_source.html');
            
            throw new Error('Chat interface not loaded. Check screenshot and HTML file for details.');
        }
        
        console.log('✅ Chat interface ready\n');
        this.initialized = true;
        return true;
    }

    // Send message and get response
    async ask(question, options = {}) {
        const {
            timeout = 30000,
            waitForResponse = true,
            clearContext = false
        } = options;

        if (!this.initialized) {
            await this.initialize();
        }

        console.log(`💬 Asking: "${question}"`);

        try {
            // Get message count before sending
            const messagesBefore = await this.page.$$('div[class*="message"], div[class*="response"], .prose, [class*="assistant"]').then(m => m.length);

            // Find input field using the same selector search as initialize
            const possibleSelectors = [
                'textarea[placeholder*="message"]',
                'textarea[placeholder*="type"]',
                'textarea[placeholder*="Ask"]',
                'textarea[placeholder*="Type"]',
                'input[type="text"]',
                'input[placeholder*="message"]',
                'input[placeholder*="type"]',
                '[contenteditable="true"]',
                'textarea'
            ];
            
            let inputField = null;
            let usedSelector = null;
            
            for (const selector of possibleSelectors) {
                inputField = await this.page.$(selector);
                if (inputField) {
                    usedSelector = selector;
                    break;
                }
            }
            
            if (!inputField) {
                throw new Error('Could not find chat input field. Page structure may have changed.');
            }
            
            console.log(`   Using selector: ${usedSelector}`);
            
            if (!inputField) {
                throw new Error('Chat input field not found. Page may have changed.');
            }

            // Clear existing text
            await inputField.click();
            await this.page.keyboard.press('Control+A');
            await this.page.keyboard.press('Delete');

            // Type new question
            await inputField.type(question, { delay: 10 });

            // Press Enter to send
            await this.page.keyboard.press('Enter');
            console.log('✓ Message sent');

            // Wait for AI response
            if (waitForResponse) {
                console.log('⏳ Waiting for AI response...');
                
                const startTime = Date.now();
                let attempts = 0;
                const maxAttempts = timeout / 500; // Check every 500ms
                let lastMessageCount = messagesBefore;
                let stableCount = 0;
                
                while (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    const currentMessages = await this.page.$$('div[class*="message"], div[class*="response"], .prose, [class*="assistant"]').then(m => m.length);
                    
                    if (currentMessages > messagesBefore) {
                        if (currentMessages !== lastMessageCount) {
                            // Message count changed - still updating
                            lastMessageCount = currentMessages;
                            stableCount = 0;
                            console.log(`   Response updating... (${currentMessages} messages)`);
                        } else {
                            // Message count stable - might be complete
                            stableCount++;
                            if (stableCount >= 4) { // Stable for 2 seconds
                                console.log(`✓ Response complete (${currentMessages} messages)`);
                                break;
                            }
                        }
                    }
                    
                    attempts++;
                    
                    // Progress indicator
                    if (attempts % 20 === 0 && attempts > 0) {
                        const elapsed = ((attempts * 500) / 1000).toFixed(1);
                        console.log(`   Still waiting... (${elapsed}s)`);
                    }
                }

                // Additional wait for content to fully render
                await new Promise(resolve => setTimeout(resolve, 1500));
            }

            // Extract AI response
            const response = await this.extractResponse(question);
            
            console.log(`✓ Response extracted (${response.length} chars)\n`);
            return response;

        } catch (error) {
            console.error('❌ Error:', error.message);
            throw error;
        }
    }

    // Extract AI response from page
    async extractResponse(userQuestion) {
        // Wait a bit more for complete response
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Method 1: Look for assistant/ai messages specifically
        const assistantMessages = await this.page.$$eval(
            'div[class*="assistant"], div[class*="ai"], div[class*="bot"], [class*="response"]:not([class*="user"]), .prose',
            elements => elements.map(el => el.textContent.trim()).filter(text => text.length > 0)
        );

        if (assistantMessages.length > 0) {
            // Get the last assistant message that's not the user's question
            for (let i = assistantMessages.length - 1; i >= 0; i--) {
                const text = assistantMessages[i];
                // Filter out thinking indicators and user's question
                const cleanText = text
                    .replace(/Thinking\.\.\./gi, '')
                    .replace(/Skip/gi, '')
                    .trim();
                
                if (!cleanText.includes(userQuestion) && 
                    !cleanText.includes('You:') && 
                    !cleanText.includes('Todo Progress') &&
                    cleanText.length > 20) {
                    return cleanText;
                }
            }
        }

        // Method 2: Evaluate JavaScript to find latest response
        const jsExtracted = await this.page.evaluate((question) => {
            // Try common chat UI selectors
            const selectors = [
                '[class*="message"]:last-of-type',
                '[class*="response"]:last-of-type',
                '.prose:last-of-type',
                'main p:last-of-type',
                'article p:last-of-type'
            ];

            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) {
                    let text = element.textContent.trim();
                    // Clean up thinking indicators
                    text = text.replace(/Thinking\.\.\./gi, '').replace(/Skip/gi, '').trim();
                    
                    // Exclude user's question and UI elements
                    if (text.length > 50 && 
                        !text.includes(question) &&
                        !text.includes('Todo Progress') &&
                        !text.includes('搜索收集')) {
                        return text;
                    }
                }
            }

            // Last resort: get all paragraphs in main content
            const main = document.querySelector('main');
            if (main) {
                const paragraphs = Array.from(main.querySelectorAll('p'));
                const relevantTexts = paragraphs
                    .map(p => {
                        let text = p.textContent.trim();
                        text = text.replace(/Thinking\.\.\./gi, '').replace(/Skip/gi, '').trim();
                        return text;
                    })
                    .filter(text => 
                        text.length > 50 && 
                        !text.includes('Todo') &&
                        !text.includes('搜索收集')
                    );
                
                if (relevantTexts.length > 0) {
                    return relevantTexts.slice(-3).join('\n');
                }
            }

            return '';
        }, userQuestion);

        if (jsExtracted) {
            return jsExtracted;
        }

        // Method 3: Get entire main content area
        const mainContent = await this.page.$eval('main', el => el.innerText).catch(() => '');
        
        if (mainContent && mainContent.length > 100) {
            // Try to extract meaningful parts
            const lines = mainContent.split('\n')
                .filter(line => line.trim().length > 50)
                .filter(line => !line.includes('Todo Progress'))
                .filter(line => !line.includes('搜索收集'))
                .filter(line => !line.includes(userQuestion))
                .map(line => line.replace(/Thinking\.\.\./gi, '').replace(/Skip/gi, '').trim());
            
            if (lines.length > 0) {
                return lines.slice(-5).join('\n');
            }
        }

        return '⚠️ Could not extract clear response. Check https://chat.z.ai/ manually.';
    }

    // Close browser
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.initialized = false;
            console.log('👋 Browser closed\n');
        }
    }

    // Quick one-time ask (auto initialzes and closes)
    async askOnce(question, keepOpen = false) {
        try {
            await this.initialize();
            const response = await this.ask(question);
            
            if (!keepOpen) {
                await this.close();
            }
            
            return response;
        } catch (error) {
            await this.close();
            throw error;
        }
    }
}

// Export for use
export default ZAIBrowserAPI;

// If run directly
if (process.argv[1]?.includes('zai_browser_api.js')) {
    const api = new ZAIBrowserAPI();
    
    // Test with math question
    api.askOnce('What is 59 multiplied by 55?', true)
        .then(response => {
            console.log('='.repeat(60));
            console.log('🤖 AI RESPONSE:');
            console.log('='.repeat(60));
            console.log(response);
            console.log('='.repeat(60));
            
            // Check if correct
            const hasCorrectAnswer = response.includes('3245') || 
                                    response.toLowerCase().includes('three thousand two hundred');
            
            console.log('\n✓ Contains "3245":', hasCorrectAnswer ? 'YES ✅' : 'NO ❌');
            console.log('\nBrowser kept open. Check https://chat.z.ai/ to see conversation.\n');
        })
        .catch(console.error);
}
