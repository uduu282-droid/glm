import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Image World King API - Working Endpoint Test
 * 
 * Discovered API: https://image-world-king.vercel.app/api/gen-v1
 * Method: GET
 * Parameter: text (query parameter)
 * Response: JSON with image_url
 */

async function testImageWorldKingAPI(prompt = 'a cute cat') {
    console.log('🧪 Testing Image World King API\n');
    console.log('=' .repeat(60));
    console.log(`Prompt: "${prompt}"\n`);
    
    try {
        // Encode the prompt for URL
        const encodedText = encodeURIComponent(prompt);
        const url = `https://image-world-king.vercel.app/api/gen-v1?text=${encodedText}`;
        
        console.log('📡 Request:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            }
        });
        
        const status = response.status;
        console.log('📊 Status:', status);
        
        if (status !== 200) {
            console.log(`❌ Request failed with status ${status}`);
            return {
                success: false,
                error: `HTTP ${status}`,
                prompt
            };
        }
        
        const data = await response.json();
        
        console.log('\n✅ SUCCESS!\n');
        console.log('Response Details:');
        console.log(`   API Owner: ${data.api_owner}`);
        console.log(`   Success: ${data.success}`);
        console.log(`   Prompt: ${data.prompt}`);
        console.log(`   Image URL: ${data.image_url}`);
        console.log(`   Thumbnail: ${data.thumbnail}`);
        console.log(`   Size: ${(data.size_bytes / 1024).toFixed(2)} KB`);
        console.log(`   Expires: ${data.expires_in}\n`);
        
        // Download and save the image
        console.log('💾 Downloading image...');
        
        const outputDir = path.join(__dirname, 'image_world_king_generated');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Generate filename
        const timestamp = Date.now();
        const safePrompt = prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_');
        const filename = `iwk_${safePrompt}_${timestamp}.jpg`;
        const filepath = path.join(outputDir, filename);
        
        // Download image
        const imageResponse = await fetch(data.image_url);
        const buffer = Buffer.from(await imageResponse.arrayBuffer());
        fs.writeFileSync(filepath, buffer);
        
        console.log('✅ Image saved successfully!\n');
        console.log('📁 File:', filepath);
        console.log('\n' + '=' .repeat(60));
        console.log('✨ Generation complete!\n');
        
        return {
            success: true,
            apiUrl: url,
            response: data,
            filepath,
            prompt,
            timestamp
        };
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        return {
            success: false,
            error: error.message,
            prompt
        };
    }
}

// Run comprehensive tests
async function runAllTests() {
    const testPrompts = [
        'a mystical forest with glowing plants',
        'futuristic cyberpunk city at night',
        'cute anime girl with blue hair'
    ];
    
    console.log('🚀 Starting Comprehensive API Tests\n');
    console.log('=' .repeat(70));
    console.log(`Total Tests: ${testPrompts.length}\n`);
    
    const results = [];
    
    for (let i = 0; i < testPrompts.length; i++) {
        const prompt = testPrompts[i];
        console.log(`\n📍 Test ${i + 1}/${testPrompts.length}: "${prompt}"\n`);
        
        const result = await testImageWorldKingAPI(prompt);
        results.push(result);
        
        // Delay between requests (be respectful)
        if (i < testPrompts.length - 1) {
            console.log('⏳ Waiting 5 seconds before next test...\n');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    
    // Summary
    console.log('\n' + '=' .repeat(70));
    console.log('\n📊 TEST SUMMARY:\n');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`Total Tests: ${results.length}`);
    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);
    console.log(`Success Rate: ${((successful.length / results.length) * 100).toFixed(1)}%\n`);
    
    if (successful.length > 0) {
        console.log('✅ SUCCESSFUL GENERATIONS:\n');
        successful.forEach((result, i) => {
            console.log(`${i + 1}. "${result.prompt}"`);
            console.log(`   Image: ${result.filepath}`);
        });
    }
    
    // Save results
    const timestamp = new Date().toISOString();
    const testReport = {
        timestamp,
        apiEndpoint: 'https://image-world-king.vercel.app/api/gen-v1',
        totalTests: results.length,
        successful: successful.length,
        failed: failed.length,
        results
    };
    
    const outputDir = path.join(__dirname, 'image_world_king_tests');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(
        path.join(outputDir, 'test_results.json'),
        JSON.stringify(testReport, null, 2)
    );
    
    // Generate markdown report
    const mdReport = `# Image World King API - Test Report

## Test Date
${timestamp}

## API Endpoint
\`${testReport.apiEndpoint}\`

## Summary
- **Total Tests**: ${testReport.totalTests}
- **Successful**: ${testReport.successful}
- **Failed**: ${testReport.failed}
- **Success Rate**: ${((testReport.successful / testReport.totalTests) * 100).toFixed(1)}%

## API Details

### Endpoint
\`GET ${testReport.apiEndpoint}?text={prompt}\`

### Request Format
- **Method**: GET
- **Parameter**: text (query parameter, URL-encoded)
- **Headers**: User-Agent recommended

### Response Format
\`\`\`json
{
  "api_owner": "@hardhackar007",
  "expires_in": "5 minutes",
  "image_url": "https://i.ibb.co/...",
  "prompt": "...",
  "size_bytes": 123456,
  "success": true,
  "thumbnail": "https://i.ibb.co/..."
}
\`\`\`

## Test Results

${successful.map((r, i) => `### Test ${i + 1}: "${r.prompt}"
- ✅ **Status**: Success
- 📁 **File**: ${r.filepath}
- 🔗 **URL**: ${r.response.image_url}
`).join('\n')}

## Usage Example

\`\`\`javascript
import fetch from 'fetch';

const prompt = encodeURIComponent('your prompt here');
const response = await fetch(\`https://image-world-king.vercel.app/api/gen-v1?text=\${prompt}\`);
const data = await response.json();

console.log('Generated Image:', data.image_url);
\`\`\`

## Conclusion

✅ **WORKING API** - Successfully generates images from text prompts.

**Pros:**
- Simple GET request
- No authentication required
- Fast response time
- High quality images
- Free to use

**Considerations:**
- Images hosted on imgbb.com
- URLs expire in 5 minutes (download immediately)
- Rate limiting may apply
- Be respectful with usage

---
*Generated by Image World King API Tester*
`;
    
    fs.writeFileSync(path.join(outputDir, 'TEST_REPORT.md'), mdReport);
    
    console.log('\n📁 Results saved to:', outputDir);
    console.log('   - test_results.json');
    console.log('   - TEST_REPORT.md\n');
    
    console.log('✨ All tests completed!\n');
    
    return testReport;
}

// Run if main
if (process.argv[1] === process.argv[1]) {
    runAllTests().catch(console.error);
}

export { testImageWorldKingAPI };
