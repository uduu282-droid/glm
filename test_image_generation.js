// Test the aifreeforever image generation API
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

// Generate a random user agent
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
];

async function testImageGeneration() {
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    const headers = {
        'User-Agent': randomUserAgent,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
        'Content-Type': 'application/json',
        'Origin': 'https://aifreeforever.com',
        'Referer': 'https://aifreeforever.com/image-generators',
        'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin'
    };

    const url = 'https://aifreeforever.com/api/generate-image';
    const prompt = 'A beautiful sunset over mountains';

    const requestBody = {
        prompt: prompt,
        resolution: '1024 × 1024 (Square)',
        speed_mode: 'Unsqueezed 🍋 (highest quality)',
        output_format: 'webp',
        output_quality: 100,
        seed: -1,
        model_type: 'fast'
    };

    try {
        console.log('Sending request to generate image...');
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        
        const result = await response.json();
        console.log('Response data:', result);
        
        if (result.images && result.images.length > 0) {
            console.log('Generated images:', result.images);
        } else if (result.imageUrl) {
            console.log('Image URL:', result.imageUrl);
        } else {
            console.log('Unexpected response format:', result);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testImageGeneration();