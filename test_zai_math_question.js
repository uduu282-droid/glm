import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

console.log('🧪 Testing ZAI API with Math Question');
console.log('======================================\n');

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

const token = sessionData.localStorage.token;
const cookies = sessionData.cookies.map(c => `${c.name}=${c.value}`).join('; ');

// TEST 1: Try direct chat completions endpoint (expected to fail)
async function testChatCompletions() {
    console.log('📋 TEST 1: POST /api/v1/chat/completions');
    console.log('─'.repeat(60));
    
    const url = 'https://chat.z.ai/api/v1/chat/completions';
    const headers = {
        'accept': 'application/json',
        'authorization': `Bearer ${token}`,
        'content-type': 'application/json'
    };
    
    const payload = {
        messages: [
            { role: 'user', content: 'What is 59 x 55?' }
        ],
        model: 'default',
        stream: false
    };
    
    console.log('Question: "What is 59 x 55?"\n');
    console.log('Sending request...\n');
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });
        
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        
        const text = await response.text();
        
        if (response.ok) {
            const data = await response.json();
            console.log('\n✅ SUCCESS! Got response:');
            console.log(JSON.stringify(data, null, 2));
            return data;
        } else {
            console.log('\n❌ Failed:');
            console.log(text);
            return null;
        }
    } catch (error) {
        console.log(`\n❌ Error: ${error.message}`);
        return null;
    }
}

// TEST 2: Try creating a new chat
async function testCreateChat() {
    console.log('\n\n📋 TEST 2: POST /api/v1/chats (Create new chat)');
    console.log('─'.repeat(60));
    
    const url = 'https://chat.z.ai/api/v1/chats';
    const headers = {
        'accept': 'application/json',
        'authorization': `Bearer ${token}`,
        'content-type': 'application/json',
        'referer': 'https://chat.z.ai/',
        'origin': 'https://chat.z.ai',
        'cookie': cookies
    };
    
    const payload = {
        title: 'Math Test',
        messages: [
            { role: 'user', content: 'What is 59 x 55?' }
        ]
    };
    
    console.log('Question: "What is 59 x 55?"\n');
    console.log('Sending request...\n');
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });
        
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        const text = await response.text();
        
        if (response.ok) {
            const data = await response.json();
            console.log('\n✅ SUCCESS! Created chat:');
            console.log(JSON.stringify(data, null, 2));
            return data;
        } else {
            console.log('\n❌ Failed:');
            console.log(text);
            return null;
        }
    } catch (error) {
        console.log(`\n❌ Error: ${error.message}`);
        return null;
    }
}

// TEST 3: Try sending message to existing chat
async function testSendMessageToChat() {
    console.log('\n\n📋 TEST 3: POST to existing chat endpoint');
    console.log('─'.repeat(60));
    
    // First get existing chats
    const getChatsUrl = 'https://chat.z.ai/api/v1/chats/?page=1';
    const getHeaders = {
        'accept': 'application/json',
        'authorization': `Bearer ${token}`
    };
    
    console.log('Getting existing chats...\n');
    
    try {
        const chatsResponse = await fetch(getChatsUrl, { headers: getHeaders });
        const chats = await chatsResponse.json();
        
        if (Array.isArray(chats) && chats.length > 0) {
            const chatId = chats[0].id;
            console.log(`Using chat ID: ${chatId}`);
            console.log(`Chat Title: ${chats[0].title}\n`);
            
            // Try to send message to this chat
            const sendMessageUrl = `https://chat.z.ai/api/v1/chats/${chatId}/messages`;
            const postHeaders = {
                'accept': 'application/json',
                'authorization': `Bearer ${token}`,
                'content-type': 'application/json',
                'referer': 'https://chat.z.ai/',
                'origin': 'https://chat.z.ai',
                'cookie': cookies
            };
            
            const payload = {
                content: 'What is 59 x 55?',
                role: 'user'
            };
            
            console.log('Question: "What is 59 x 55?"\n');
            console.log('Sending message...\n');
            
            const response = await fetch(sendMessageUrl, {
                method: 'POST',
                headers: postHeaders,
                body: JSON.stringify(payload)
            });
            
            console.log(`Status: ${response.status} ${response.statusText}`);
            
            const text = await response.text();
            
            if (response.ok) {
                const data = await response.json();
                console.log('\n✅ SUCCESS! Got response:');
                console.log(JSON.stringify(data, null, 2));
                return data;
            } else {
                console.log('\n❌ Failed:');
                console.log(text);
                return null;
            }
        } else {
            console.log('No existing chats found');
            return null;
        }
    } catch (error) {
        console.log(`\n❌ Error: ${error.message}`);
        return null;
    }
}

// TEST 4: Check what endpoints might work
async function testOtherEndpoints() {
    console.log('\n\n📋 TEST 4: Trying alternative endpoints');
    console.log('─'.repeat(60));
    
    const endpoints = [
        {
            name: 'Generate endpoint',
            url: 'https://chat.z.ai/api/v1/generate',
            method: 'POST',
            payload: { prompt: 'What is 59 x 55?' }
        },
        {
            name: 'Messages endpoint',
            url: 'https://chat.z.ai/api/v1/messages',
            method: 'POST',
            payload: { message: 'What is 59 x 55?' }
        },
        {
            name: 'Ask endpoint',
            url: 'https://chat.z.ai/api/v1/ask',
            method: 'POST',
            payload: { question: 'What is 59 x 55?' }
        }
    ];
    
    const headers = {
        'accept': 'application/json',
        'authorization': `Bearer ${token}`,
        'content-type': 'application/json',
        'referer': 'https://chat.z.ai/',
        'origin': 'https://chat.z.ai',
        'cookie': cookies
    };
    
    for (const endpoint of endpoints) {
        console.log(`\nTrying: ${endpoint.name}`);
        console.log(`URL: ${endpoint.url}`);
        
        try {
            const response = await fetch(endpoint.url, {
                method: endpoint.method,
                headers: headers,
                body: JSON.stringify(endpoint.payload)
            });
            
            console.log(`Status: ${response.status} ${response.statusText}`);
            
            const text = await response.text();
            
            if (response.ok) {
                console.log('✅ Response received:');
                console.log(text.substring(0, 300));
            } else {
                console.log('❌ Failed');
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting math question test...\n');
    console.log('Question: What is 59 x 55?');
    console.log('Expected answer: 3245\n');
    
    await testChatCompletions();
    await testCreateChat();
    await testSendMessageToChat();
    await testOtherEndpoints();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log('If all tests failed, Z.AI doesn\'t have a direct message API.');
    console.log('The web interface works at: https://chat.z.ai/');
    console.log('\nFor guaranteed AI responses, use browser automation:');
    console.log('node zai_simple_chat.js\n');
}

runAllTests().catch(console.error);
