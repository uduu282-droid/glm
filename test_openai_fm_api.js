const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

/**
 * OpenAI.fm Audio Generator API Reverse Engineering
 * Based on captured browser request headers
 */

async function testOpenaiFmApi() {
    console.log('🔍 OpenAI.fm Audio Generator API Reverse Engineering');
    console.log('=' .repeat(60));
    
    const baseUrl = 'https://www.openai.fm';
    const endpoint = '/api/generate';
    const fullUrl = baseUrl + endpoint;
    
    // Test prompts for audio generation
    const testPrompts = [
        "Create a peaceful piano melody",
        "Generate ambient electronic music",
        "Create an upbeat pop track",
        "Generate cinematic orchestral music",
        "Create lo-fi hip hop beats"
    ];
    
    // Headers from captured request
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://www.openai.fm',
        'Referer': 'https://www.openai.fm/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
    };
    
    const results = [];
    const successfulGenerations = [];
    
    // Create axios instance with cookie jar
    const axiosInstance = axios.create({
        maxRedirects: 0,
        timeout: 120000,
    });
    
    // First, get cookies from main page
    console.log("📡 Fetching initial cookies from main page...");
    try {
        const mainResponse = await axiosInstance.get('https://www.openai.fm/', {
            headers: {
                ...headers,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            }
        });
        
        console.log(`✅ Main page loaded (status: ${mainResponse.status})`);
        
        // Extract cookies from response headers
        const setCookieHeaders = mainResponse.headers['set-cookie'];
        if (setCookieHeaders) {
            const cookies = {};
            setCookieHeaders.forEach(cookie => {
                const parts = cookie.split(';')[0].split('=');
                if (parts.length === 2) {
                    cookies[parts[0]] = parts[1];
                }
            });
            
            // Add cookies to subsequent requests
            const cookieString = Object.entries(cookies)
                .map(([key, value]) => `${key}=${value}`)
                .join('; ');
            
            headers['Cookie'] = cookieString;
            console.log(`🍪 Cookies received and added to requests`);
        }
        
    } catch (error) {
        console.log(`⚠️ Warning: Could not fetch main page: ${error.message}`);
    }
    
    for (let i = 0; i < testPrompts.length; i++) {
        const prompt = testPrompts[i];
        const testNum = i + 1;
        
        console.log(`\n🧪 Test ${testNum}: ${prompt}`);
        console.log('-'.repeat(60));
        
        try {
            // Create form data
            const formData = new FormData();
            formData.append('prompt', prompt);
            formData.append('duration', '30');
            formData.append('genre', 'ambient');
            formData.append('tempo', 'medium');
            
            // Get form headers including boundary
            const formHeaders = formData.getHeaders();
            
            const response = await axiosInstance.post(fullUrl, formData, {
                headers: {
                    ...headers,
                    ...formHeaders,
                },
                responseType: 'arraybuffer'
            });
            
            const result = {
                test_number: testNum,
                prompt: prompt,
                url: fullUrl,
                status_code: response.status,
                content_type: response.headers['content-type'],
                response_size: response.data.length,
                success: response.status === 200,
                timestamp: new Date().toISOString()
            };
            
            console.log(`Status Code: ${response.status}`);
            console.log(`Content-Type: ${result.content_type}`);
            console.log(`Response Size: ${result.response_size} bytes`);
            
            if (response.status === 200) {
                const contentType = result.content_type.toLowerCase();
                
                // Check if it's audio
                if (contentType.includes('audio') || contentType.includes('audio/wav')) {
                    console.log('✅ SUCCESS: Audio file received!');
                    result.audio_data = true;
                    
                    // Save audio
                    const filename = `openai_fm_generated_audio_${testNum}_${Date.now()}.wav`;
                    fs.writeFileSync(filename, Buffer.from(response.data));
                    result.saved_file = filename;
                    console.log(`💾 Audio saved as: ${filename}`);
                    console.log(`🎵 Audio size: ${result.response_size} bytes`);
                    successfulGenerations.push(result);
                    
                } else if (contentType.includes('application/json')) {
                    console.log('✅ SUCCESS: JSON response received');
                    try {
                        const jsonResponse = JSON.parse(Buffer.from(response.data).toString());
                        result.json_response = jsonResponse;
                        console.log(`Response JSON: ${JSON.stringify(jsonResponse, null, 2).substring(0, 500)}...`);
                        
                        // Check for audio URL in response
                        const audioKeys = ['audio_url', 'url', 'audio', 'output', 'file'];
                        for (const key of audioKeys) {
                            if (jsonResponse[key]) {
                                console.log(`🎵 Found audio in '${key}': ${typeof jsonResponse[key] === 'string' ? jsonResponse[key].substring(0, 100) : jsonResponse[key]}`);
                                result.audio_info = jsonResponse[key];
                                successfulGenerations.push(result);
                                break;
                            }
                        }
                    } catch (e) {
                        result.raw_response = Buffer.from(response.data).toString('utf8', 0, 300);
                        console.log(`Raw response: ${result.raw_response}...`);
                    }
                } else {
                    console.log('⚠️ Response received but not sure what it is');
                    result.raw_response = Buffer.from(response.data).toString('utf8', 0, 300);
                    console.log(`Response preview: ${result.raw_response}`);
                }
            } else {
                console.log(`❌ FAILED: HTTP ${response.status}`);
                const errorText = Buffer.from(response.data).toString('utf8', 0, 500);
                result.error = errorText;
                console.log(`Error response: ${errorText}...`);
            }
            
            results.push(result);
            
            // Rate limiting - wait between requests
            if (i < testPrompts.length - 1) {
                console.log('⏳ Waiting 3 seconds before next request...');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
            
        } catch (error) {
            console.log(`❌ REQUEST FAILED: ${error.message}`);
            if (error.response) {
                console.log(`Status: ${error.response.status}`);
                const data = Buffer.from(error.response.data).toString('utf8', 0, 300);
                console.log(`Data: ${data}`);
            }
            
            results.push({
                test_number: testNum,
                prompt: prompt,
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total tests: ${testPrompts.length}`);
    console.log(`Successful: ${successfulGenerations.length}`);
    console.log(`Failed: ${results.length - successfulGenerations.length}`);
    console.log(`Success rate: ${(successfulGenerations.length / testPrompts.length * 100).toFixed(1)}%`);
    
    if (successfulGenerations.length > 0) {
        console.log('\n✅ SUCCESSFUL GENERATIONS:');
        successfulGenerations.forEach(gen => {
            console.log(`\n🟢 Test ${gen.test_number}: ${gen.prompt}`);
            console.log(`   Status: ${gen.status_code}`);
            console.log(`   Content-Type: ${gen.content_type}`);
            if (gen.saved_file) {
                console.log(`   Saved File: ${gen.saved_file}`);
                console.log(`   File Size: ${gen.response_size} bytes`);
            }
            if (gen.audio_info) {
                console.log(`   Audio Info: ${gen.audio_info}`);
            }
        });
    }
    
    // Save detailed results
    const saveResults = results.map(r => {
        const copy = { ...r };
        delete copy.audio_data;
        return copy;
    });
    
    fs.writeFileSync(
        'openai_fm_api_test_results_js.json',
        JSON.stringify(saveResults, null, 2)
    );
    console.log('\n💾 Detailed results saved to: openai_fm_api_test_results_js.json');
    
    return successfulGenerations;
}

function analyzePotentialParameters() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 POTENTIAL API PARAMETERS');
    console.log('='.repeat(60));
    
    const parameters = {
        endpoint: 'https://www.openai.fm/api/generate',
        method: 'POST',
        content_type: 'multipart/form-data',
        required: {
            prompt: 'Text description of the audio to generate'
        },
        optional: {
            duration: 'Length in seconds (e.g., 30, 60, 120)',
            genre: 'Music genre (ambient, classical, electronic, pop, rock, jazz)',
            tempo: 'Speed (slow, medium, fast)',
            mood: 'Emotion (happy, sad, energetic, calm, dramatic)',
            instruments: 'Preferred instruments (piano, guitar, drums, strings)',
            format: 'Output format (wav, mp3, ogg)',
            seed: 'Random seed for reproducibility'
        },
        response: {
            content_type: 'audio/wav (direct audio file)',
            content_disposition: 'inline; filename="openai-fm-coral-audio.wav"'
        }
    };
    
    console.log(JSON.stringify(parameters, null, 2));
    return parameters;
}

// Main execution
async function main() {
    console.log("Starting OpenAI.fm Audio Generator API Reverse Engineering...\n");
    
    // Analyze potential parameters first
    analyzePotentialParameters();
    
    console.log("\n" + '='.repeat(60));
    console.log("🚀 RUNNING API TESTS");
    console.log('='.repeat(60) + "\n");
    
    const successful = await testOpenaiFmApi();
    
    console.log(`\n🎉 Testing complete! Generated ${successful.length} audio files successfully.`);
}

// Run if called directly
main().catch(console.error);
