import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

console.log('🚀 Z.AI Pure API Chat (No Browser)');
console.log('===================================\n');

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

// Header spoofing
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
];

function generateHeaders() {
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const bearerToken = sessionData.localStorage?.token || '';
    const cookieHeader = sessionData.cookies?.map(c => `${c.name}=${c.value}`).join('; ') || '';

    return {
        'accept': 'application/json',
        'authorization': `Bearer ${bearerToken}`,
        'user-agent': userAgent,
        'referer': 'https://chat.z.ai/',
        'origin': 'https://chat.z.ai',
        'cookie': cookieHeader,
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json'
    };
}

async function getChats() {
    const headers = generateHeaders();
    
    try {
        const response = await fetch('https://chat.z.ai/api/v1/chats/?page=1', {
            method: 'GET',
            headers: headers
        });

        if (response.ok) {
            const chats = await response.json();
            console.log('\n' + '='.repeat(60));
            console.log('📋 YOUR CHATS:');
            console.log('='.repeat(60));
            
            if (Array.isArray(chats) && chats.length > 0) {
                chats.forEach((chat, index) => {
                    console.log(`\n${index + 1}. ${chat.title || 'Untitled Chat'}`);
                    console.log(`   ID: ${chat.id}`);
                    console.log(`   Created: ${new Date(chat.created_at * 1000).toLocaleString()}`);
                    console.log(`   Updated: ${new Date(chat.updated_at * 1000).toLocaleString()}`);
                });
                console.log('\n' + '='.repeat(60));
                console.log(`Total: ${chats.length} chat(s)`);
                console.log('='.repeat(60) + '\n');
            } else {
                console.log('No chats found');
            }
            
            return { success: true, chats: chats };
        } else {
            const errorText = await response.text();
            console.log(`\n❌ API Error: ${response.status}`);
            console.log('Response:', errorText);
            return { success: false, error: `Status ${response.status}` };
        }
    } catch (error) {
        console.log(`\n❌ Request failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

console.log('\n⚠️  IMPORTANT: Z.AI does not expose a public SEND MESSAGE API');
console.log('💡 We can only READ your existing chats via API\n');

// Interactive chat
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('💬 Z.AI API Chat Reader');
console.log('======================');
console.log('View your existing chats via API');
console.log('Commands: /chats, /refresh, /exit\n');

const askQuestion = async () => {
    rl.question('👤 Command: ', async (cmd) => {
        const trimmed = cmd.trim().toLowerCase();

        if (trimmed === '/exit' || trimmed === '/quit') {
            console.log('\n👋 Goodbye!\n');
            rl.close();
            return;
        }

        if (trimmed === '/chats' || trimmed === '/refresh') {
            await getChats();
            askQuestion();
            return;
        }

        console.log('\n⚠️  Unknown command. Type /help for available commands\n');
        askQuestion();
    });
};

console.log('Type /chats to view your existing conversations\n');

askQuestion();
