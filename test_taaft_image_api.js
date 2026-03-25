const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

/**
 * TAAFT Image Generator API Reverse Engineering
 * Based on captured browser request headers
 */

async function testTaaftImageGenerator() {
    console.log('🔍 TAAFT Image Generator API Reverse Engineering');
    console.log('=' .repeat(60));
    
    const baseUrl = 'https://theresanaiforthat.com';
    const endpoint = '/api/generate/';
    const fullUrl = baseUrl + endpoint;
    
    // Test prompts
    const testPrompts = [
        "A beautiful sunset over mountains",
        "A cute cat sitting on a windowsill", 
        "Futuristic city with flying cars",
        "Serene lake surrounded by pine trees",
        "Anime character with red hair, Genshin Impact style"
    ];
    
    // Headers from captured request
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': `${baseUrl}/@taaft/image-generator/`,
        'Origin': baseUrl,
        'Sec-Ch-Ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'se_accept_encoding': 's64f8RMdS3G35ZsMA399mhl93m1O1kd35099mh7l93m1wTVyMzIcDlpbvQheAZ75',
        'se_initial_referrer': '',
    };
    
    const results = [];
    const successfulGenerations = [];
    
    for (let i = 0; i < testPrompts.length; i++) {
        const prompt = testPrompts[i];
        const testNum = i + 1;
        
        console.log(`\n🧪 Test ${testNum}: ${prompt}`);
        console.log('-'.repeat(60));
        
        try {
            // Create form data
            const formData = new FormData();
            formData.append('prompt', prompt);
            formData.append('aspect_ratio', '1:1');
            formData.append('width', '1024');
            formData.append('height', '1024');
            
            // Get form headers including boundary
            const formHeaders = formData.getHeaders();
            
            const response = await axios.post(fullUrl, formData, {
                headers: {
                    ...headers,
                    ...formHeaders,
                },
                timeout: 60000,
                maxRedirects: 0,
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
                // Check if it's an image
                if (result.content_type && result.content_type.includes('image')) {
                    console.log('✅ SUCCESS: Image received!');
                    result.image_data = true;
                    
                    // Save image
                    const filename = `taaft_generated_image_${testNum}_${Date.now()}.png`;
                    fs.writeFileSync(filename, Buffer.from(response.data));
                    result.saved_file = filename;
                    console.log(`💾 Image saved as: ${filename}`);
                    successfulGenerations.push(result);
                    
                } else if (result.content_type && result.content_type.includes('application/json')) {
                    console.log('✅ SUCCESS: JSON response received');
                    try {
                        const jsonResponse = JSON.parse(Buffer.from(response.data).toString());
                        result.json_response = jsonResponse;
                        console.log(`Response JSON: ${JSON.stringify(jsonResponse, null, 2).substring(0, 500)}...`);
                        
                        // Check for image URL in response
                        const imageUrlKeys = ['image_url', 'url', 'image', 'output'];
                        for (const key of imageUrlKeys) {
                            if (jsonResponse[key]) {
                                console.log(`📷 Found image URL in '${key}': ${jsonResponse[key]}`);
                                result.image_url = jsonResponse[key];
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
                console.log('⏳ Waiting 2 seconds before next request...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
        } catch (error) {
            console.log(`❌ REQUEST FAILED: ${error.message}`);
            if (error.response) {
                console.log(`Status: ${error.response.status}`);
                console.log(`Data: ${Buffer.from(error.response.data).toString('utf8', 0, 300)}`);
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
            }
            if (gen.image_url) {
                console.log(`   Image URL: ${gen.image_url}`);
            }
        });
    }
    
    // Save detailed results
    const saveResults = results.map(r => {
        const copy = { ...r };
        delete copy.image_data;
        return copy;
    });
    
    fs.writeFileSync(
        'taaft_api_test_results_js.json',
        JSON.stringify(saveResults, null, 2)
    );
    console.log('\n💾 Detailed results saved to: taaft_api_test_results_js.json');
    
    return successfulGenerations;
}

function analyzeApiRequirements() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 API REQUIREMENTS ANALYSIS');
    console.log('='.repeat(60));
    
    const requirements = {
        endpoint: 'https://theresanaiforthat.com/api/generate/',
        method: 'POST',
        content_type: 'multipart/form-data',
        required_headers: [
            'User-Agent',
            'Referer',
            'Origin',
            'se_accept_encoding (special token)',
        ],
        form_parameters: {
            prompt: '(required) Text description of the image',
            aspect_ratio: '(optional) Square(1:1), Landscape(16:9), Portrait(9:16), etc.',
            width: '(optional) Max 2000px',
            height: '(optional) Max 2000px',
            image: '(optional) Upload reference image (PNG, JPG, GIF up to 10MB)'
        },
        features: [
            'Unlimited free generations',
            'Commercial use allowed',
            'Multiple aspect ratios',
            'Image-to-image capability',
            'Various artistic styles'
        ],
        rate_limits: 'Unknown - needs testing',
        authentication: 'None detected (no API key required)'
    };
    
    console.log(JSON.stringify(requirements, null, 2));
    return requirements;
}

// Main execution
async function main() {
    console.log("Starting TAAFT Image Generator API Reverse Engineering...\n");
    
    // Analyze requirements first
    analyzeApiRequirements();
    
    console.log("\n" + '='.repeat(60));
    console.log("🚀 RUNNING API TESTS");
    console.log('='.repeat(60) + "\n");
    
    const successful = await testTaaftImageGenerator();
    
    console.log(`\n🎉 Testing complete! Generated ${successful.length} images successfully.`);
}

// Run if called directly
main().catch(console.error);
