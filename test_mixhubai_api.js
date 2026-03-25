import fetch from 'node-fetch';

// Test the mixhubai.com API
async function testMixHubAPI() {
    console.log('Testing mixhubai.com API...\n');
    
    // The API expects a stream response (text/event-stream)
    // but we'll send a standard JSON payload first to see the response
    
    const requestBody = {
        messages: [
            {
                role: "user",
                content: "Hello, this is a test message for mixhubai API"
            }
        ],
        model: "gpt-4", // or whatever model they support
        // Adding common headers that might be expected
        stream: true // Based on the original request, this API likely streams responses
    };

    try {
        console.log('Sending POST request to https://mixhubai.com/api/chat...');
        
        const response = await fetch('https://mixhubai.com/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
                'Referer': 'https://mixhubai.com/ai-chat',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Sec-Ch-Ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                // Authentication headers - these would need to be replaced with actual credentials
                'Authorization': 'Bearer YOUR_API_KEY_HERE', // Replace with actual API key
                'X-API-Key': 'YOUR_API_KEY_HERE'           // Alternative header
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Status Code:', response.status);
        console.log('Status Text:', response.statusText);
        
        console.log('\nHeaders:');
        for (const [key, value] of response.headers.entries()) {
            console.log(`  ${key}: ${value}`);
        }

        console.log('\nResponse Content-Type:', response.headers.get('content-type'));
        
        // Check if it's an event stream or JSON response
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('text/event-stream')) {
            console.log('\nResponse is a stream (text/event-stream). Reading stream...');
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    break;
                }
                
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                
                // Process each line in the chunk
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep last incomplete line in buffer
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6); // Remove 'data: ' prefix
                        
                        if (data === '[DONE]') {
                            console.log('Stream ended.');
                            break;
                        }
                        
                        try {
                            const parsed = JSON.parse(data);
                            console.log('Stream data:', parsed);
                        } catch (e) {
                            console.log('Stream raw data:', data);
                        }
                    } else if (line.trim() !== '') {
                        console.log('Stream line:', line);
                    }
                }
            }
            
            // Process remaining buffer
            if (buffer.trim() !== '' && buffer.startsWith('data: ')) {
                const data = buffer.slice(6);
                try {
                    const parsed = JSON.parse(data);
                    console.log('Final stream data:', parsed);
                } catch (e) {
                    console.log('Final stream raw data:', data);
                }
            }
        } else {
            // Regular JSON response
            const text = await response.text();
            console.log('\nResponse Body:', text);
            
            try {
                const jsonData = JSON.parse(text);
                console.log('\nParsed JSON Response:', JSON.stringify(jsonData, null, 2));
            } catch (e) {
                console.log('\nResponse is not JSON format');
            }
        }
    } catch (error) {
        console.error('Error making request to mixhubai API:', error.message);
    }
}

// Run the test
testMixHubAPI();