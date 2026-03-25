// Test the aifreeforever AI chat API
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

const headers = {
    'authority': 'aifreeforever.com',
    'accept': '*/*',
    'accept-language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7',
    'content-type': 'application/json',
    'origin': 'https://aifreeforever.com',
    'sec-ch-ua': '"Chromium";v="107", "Not=A?Brand";v="24"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36'
};

async function aiAsk(prompt) {
    const jsonData = {
        'question': prompt,
        'tone': 'friendly',
        'format': 'paragraph',
        'file': null,
        'conversationHistory': [],
    };
    
    try {
        const response = await fetch('https://aifreeforever.com/api/generate-ai-answer', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(jsonData)
        });
        
        console.log('Response status:', response.status);
        
        const result = await response.json();
        console.log('Answer =>', result.answer);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Test with a sample question
console.log('Testing AI chat API...');
await aiAsk('Hello, how are you?');