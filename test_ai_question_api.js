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

// Generate realistic user agent (simplified version)
function generateUserAgent() {
    const browsers = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
    ];
    return browsers[Math.floor(Math.random() * browsers.length)];
}

async function testAIQuestionAPI() {
    const url = 'https://aifreeforever.com/api/generate-ai-answer';
    
    console.log('🤖 Testing AI Question Answering API');
    console.log('URL:', url);
    console.log('='.repeat(50));

    // Setup headers similar to the Python script
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
        'user-agent': generateUserAgent()
    };

    console.log('Headers configured successfully');
    console.log('User-Agent:', headers['user-agent']);

    // AI ask function
    async function aiAsk(prompt) {
        const jsonData = {
            'question': prompt,
            'tone': 'friendly',
            'format': 'paragraph',
            'file': null,
            'conversationHistory': []
        };

        try {
            console.log(`\n📝 Sending question: "${prompt}"`);
            const response = await axios.post(url, jsonData, { headers, timeout: 30000 });
            
            console.log('✅ Request SUCCESS');
            console.log('Status:', response.status);
            
            if (response.data && response.data.answer) {
                console.log(`الاجابة => ${response.data.answer}`);
                return response.data.answer;
            } else {
                console.log('⚠️  No answer found in response');
                console.log('Full response:', JSON.stringify(response.data, null, 2));
                return null;
            }

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

    // Interactive loop
    console.log('\n💬 Starting interactive AI session (type "exit" to quit)');
    console.log('-'.repeat(50));

    while (true) {
        try {
            const prompt = await getUserInput("سؤالك => ");
            
            // Exit condition
            if (prompt.toLowerCase() === 'exit' || prompt.toLowerCase() === 'quit') {
                console.log('👋 Goodbye!');
                break;
            }
            
            // Skip empty prompts
            if (!prompt.trim()) {
                console.log('Please enter a valid question.');
                continue;
            }
            
            // Get AI response
            await aiAsk(prompt);
            
        } catch (error) {
            console.log('❌ Error processing request:', error.message);
            console.log('Continuing to next question...');
        }
        
        console.log('\n' + '-'.repeat(50));
    }

    rl.close();
}

// Run the test
testAIQuestionAPI()
    .then(() => {
        console.log('\n✅ AI question answering test completed');
    })
    .catch((error) => {
        console.log('\n❌ AI question answering test failed:', error.message);
        rl.close();
    });