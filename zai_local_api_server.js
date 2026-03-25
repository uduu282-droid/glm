import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import http from 'http';

console.log('🚀 Z.AI Local API Server');
console.log('========================\n');

// Load session
const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
let sessionData;

try {
    sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    console.log('✅ Session loaded\n');
} catch (error) {
    console.error('❌ No session data found.');
    console.log('💡 Run: node zai_advanced_login.js first\n');
    process.exit(1);
}

let browserInstance = null;
let contextInstance = null;
let pageInstance = null;

// Initialize browser once
async function initBrowser() {
    if (!browserInstance) {
        console.log('🎭 Starting browser...');
        browserInstance = await chromium.launch({
            headless: true,
            args: ['--disable-blink-features=AutomationControlled']
        });
        
        contextInstance = await browserInstance.newContext({
            viewport: { width: 1280, height: 900 }
        });
        
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
            await contextInstance.addCookies(cookies);
            console.log('✅ Cookies loaded\n');
        }
        
        pageInstance = await contextInstance.newPage();
        await pageInstance.goto('https://chat.z.ai/', { waitUntil: 'domcontentloaded' });
        console.log('✅ Browser ready\n');
    }
}

// Send message API
async function sendMessage(message) {
    try {
        await initBrowser();
        
        // Get current message count
        const messagesBefore = await pageInstance.$$('div[class*="message"], div[class*="response"], .prose').then(m => m.length);
        console.log(`   Messages before: ${messagesBefore}`);
        
        // Find and fill input
        const inputSelector = 'textarea, input[placeholder*="message"], input[placeholder*="type"]';
        await pageInstance.fill(inputSelector, message);
        await pageInstance.press(inputSelector, 'Enter');
        console.log('   Message sent, waiting for response...');
        
        // Wait for response (wait for NEW message to appear)
        let attempts = 0;
        const maxAttempts = 30; // 15 seconds
        
        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const currentMessages = await pageInstance.$$('div[class*="message"], div[class*="response"], .prose').then(m => m.length);
            
            if (currentMessages > messagesBefore) {
                console.log(`   New message detected! (${currentMessages} total)`);
                
                // Give it a moment to fully render
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Extract ALL messages and find the newest one that isn't user's message
                const allMessages = await pageInstance.$$('div[class*="message"], div[class*="response"], .prose');
                
                console.log(`   Checking ${allMessages.length} messages...`);
                
                // Check from newest to oldest
                for (let i = allMessages.length - 1; i >= 0; i--) {
                    const text = await allMessages[i].textContent();
                    const trimmed = text.trim();
                    
                    console.log(`   Message ${i}: ${trimmed.substring(0, 50)}... (${trimmed.length} chars)`);
                    
                    // Look for assistant response (not user message, not todo list)
                    if (trimmed.length > 20 && 
                        !trimmed.includes('You:') &&
                        !trimmed.startsWith(message.substring(0, 10)) &&
                        !trimmed.includes('Todo Progress') && 
                        !trimmed.includes('搜索收集')) {
                        console.log(`   ✅ Found valid response!`);
                        return {
                            success: true,
                            response: trimmed,
                            timestamp: Date.now()
                        };
                    }
                }
            }
            attempts++;
        }
        
        return {
            success: false,
            error: 'Timeout - no response received',
            timestamp: Date.now()
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message,
            timestamp: Date.now()
        };
    }
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // GET /health - Health check
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            browser: browserInstance ? 'running' : 'stopped',
            timestamp: Date.now()
        }));
        return;
    }
    
    // POST /chat - Send message
    if (req.method === 'POST' && req.url === '/chat') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                const { message } = JSON.parse(body);
                
                if (!message) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Message is required' }));
                    return;
                }
                
                console.log(`\n💬 Received: ${message}`);
                const result = await sendMessage(message);
                
                if (result.success) {
                    console.log(`✅ Response: ${result.response.substring(0, 100)}...`);
                } else {
                    console.log(`❌ Error: ${result.error}`);
                }
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
                
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
        return;
    }
    
    // 404 for other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🌐 Server running on http://localhost:${PORT}`);
    console.log('\n📖 API Endpoints:');
    console.log(`   GET  http://localhost:${PORT}/health - Check server status`);
    console.log(`   POST http://localhost:${PORT}/chat - Send message`);
    console.log('\n💡 Example usage:');
    console.log(`   curl -X POST http://localhost:${PORT}/chat \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{"message":"hello"}'\n`);
});
