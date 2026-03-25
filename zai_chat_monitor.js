import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

async function monitorZAIChats() {
    console.log('👁️  Z.AI Chat Monitor');
    console.log('====================\n');
    
    // Load session data
    const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
    let sessionData;
    
    try {
        sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
        console.log('✅ Session loaded\n');
    } catch (error) {
        console.error('❌ No session data. Run zai_login_explorer.js first\n');
        return;
    }
    
    const bearerToken = sessionData.localStorage.token;
    const cookieHeader = sessionData.cookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    const headers = {
        'accept': 'application/json',
        'authorization': `Bearer ${bearerToken}`,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        'referer': 'https://chat.z.ai/',
        'cookie': cookieHeader
    };
    
    let previousChats = [];
    let checkCount = 0;
    const maxChecks = 30; // Monitor for 30 checks (2.5 minutes with 5s interval)
    
    console.log('📊 Starting real-time monitoring...');
    console.log('Checking every 5 seconds for 2.5 minutes\n');
    console.log('Press Ctrl+C to stop early\n');
    
    const monitorInterval = setInterval(async () => {
        checkCount++;
        const timestamp = new Date().toLocaleTimeString();
        
        try {
            const response = await fetch('https://chat.z.ai/api/v1/chats/?page=1', {
                method: 'GET',
                headers: headers
            });
            
            if (!response.ok) {
                console.log(`[${timestamp}] ❌ Status: ${response.status} ${response.statusText}`);
                console.log('   ⚠️  Tokens may be expired. Run zai_login_explorer.js to refresh.\n');
                
                if (checkCount >= maxChecks) {
                    clearInterval(monitorInterval);
                    console.log('\n🏁 Monitoring complete.');
                }
                return;
            }
            
            const data = await response.json();
            const currentChats = Array.isArray(data) ? data : [];
            
            // Check for changes
            if (currentChats.length !== previousChats.length) {
                console.log(`[${timestamp}] 🔄 CHANGE DETECTED!`);
                console.log(`   Previous: ${previousChats.length} chats`);
                console.log(`   Current: ${currentChats.length} chats`);
                
                if (currentChats.length > 0) {
                    console.log('\n   Latest chats:');
                    currentChats.slice(0, 3).forEach((chat, i) => {
                        console.log(`   ${i + 1}. ${chat.title || 'Untitled'} (${chat.id})`);
                    });
                    console.log('');
                }
                
                previousChats = [...currentChats];
            } else {
                console.log(`[${timestamp}] ✅ No changes (${currentChats.length} chats)`);
            }
            
            // Show activity indicator
            const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
            process.stdout.write(`\r   ${spinner[checkCount % spinner.length]} Monitoring... (Check ${checkCount}/${maxChecks})`);
            
            if (checkCount >= maxChecks) {
                clearInterval(monitorInterval);
                console.log('\n\n🏁 Monitoring complete.');
                console.log(`\n📊 Final Summary:`);
                console.log(`   Total checks: ${checkCount}`);
                console.log(`   Final chat count: ${currentChats.length}`);
                console.log(`   Status: ${response.status} OK\n`);
            }
            
        } catch (error) {
            console.log(`[${timestamp}] ❌ Error: ${error.message}\n`);
            
            if (checkCount >= maxChecks) {
                clearInterval(monitorInterval);
            }
        }
    }, 5000); // Check every 5 seconds
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        clearInterval(monitorInterval);
        console.log('\n\n👋 Monitoring stopped by user.');
        process.exit(0);
    });
}

// Start the monitor
monitorZAIChats().catch(console.error);
