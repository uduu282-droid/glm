import axios from 'axios';
import { createInterface } from 'readline';

// Create readline interface for user input
const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to get user input
function getUserInput(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function testImageGenerationAPI() {
    const url = "https://aifreeforever.com/api/generate-image";
    
    console.log('🎨 Testing Image Generation API');
    console.log('URL:', url);
    console.log('='.repeat(50));

    // Get user prompt
    const prompt = await getUserInput("Enter your prompt: ");
    
    // Close readline interface
    rl.close();

    // Setup axios with headers similar to the Python script
    const client = axios.create({
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
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
        },
        timeout: 30000
    });

    // Request payload
    const payload = {
        "prompt": prompt,
        "resolution": "1024 × 1024 (Square)",
        "speed_mode": "Unsqueezedhighest quality)",
        "output_format": "webp",
        "output_quality": 100,
        "seed": -1,
        "model_type": "fast"
    };

    console.log('\n📝 Request payload:');
    console.log(JSON.stringify(payload, null, 2));

    try {
        console.log('\n🚀 Sending request...');
        const response = await client.post(url, payload);
        
        console.log('✅ Request SUCCESS');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        // Check for image URLs in response
        const result = response.data;
        
        if (result.images && result.images.length > 0) {
            console.log('\n🖼️  Generated images:');
            result.images.forEach((image, index) => {
                console.log(`${index + 1}. ${image}`);
            });
        } else if (result.imageUrl) {
            console.log('\n🖼️  Generated image:');
            console.log(result.imageUrl);
        } else {
            console.log('\n⚠️  No image URLs found in response');
            console.log('Full response:', JSON.stringify(result, null, 2));
        }
        
        return response.data;

    } catch (error) {
        console.log('❌ Request FAILED');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Status Text:', error.response.statusText);
            console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.log('No response received:', error.message);
        } else {
            console.log('Error:', error.message);
        }
        
        throw error;
    }
}

// Run the test
testImageGenerationAPI()
    .then(() => {
        console.log('\n✅ Image generation test completed');
    })
    .catch((error) => {
        console.log('\n❌ Image generation test failed:', error.message);
    });