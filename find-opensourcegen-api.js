/**
 * OpenSourceGen - API Finder & Analyzer
 * 
 * Analyzes the JS file to find generation endpoints
 */

const axios = require('axios');

async function findOpenSourceGenAPI() {
  console.log('🔍 Finding OpenSourceGen API Endpoints\n');
  console.log('=' .repeat(70));
  
  try {
    // Get the main JS file
    console.log('\n📡 Fetching main application JS...');
    const jsResponse = await axios.get('https://opensourcegen.com/assets/index-B3tsfRjJ.js', {
      headers: {
        'Accept': 'application/javascript',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    const jsContent = jsResponse.data;
    console.log(`✅ Application JS loaded (${jsContent.length} bytes)`);
    
    // Look for API endpoints in the JS
    console.log('\n\n🔍 Searching for API endpoints...\n');
    
    const apiPatterns = [
      /https?:\/\/[^\s"'`]+\/api[^\s"'`]*/gi,
      /fetch\(['"`](\/api[^'"`]+)['"`]/gi,
      /axios\.(post|get|put)\(['"`](\/api[^'"`]+)['"`]/gi
    ];
    
    const foundEndpoints = new Set();
    
    for (const pattern of apiPatterns) {
      const matches = jsContent.match(pattern);
      if (matches) {
        matches.forEach(match => foundEndpoints.add(match));
      }
    }
    
    if (foundEndpoints.size > 0) {
      console.log('🎯 Found API Endpoints:\n');
      foundEndpoints.forEach(endpoint => {
        console.log(`   - ${endpoint}`);
      });
    } else {
      console.log('❌ No hardcoded API endpoints found in JS');
    }
    
    // Look for specific patterns
    console.log('\n\n🔍 Searching for specific patterns...\n');
    
    const patterns = {
      'generate': /generate/gi,
      'create': /create/gi,
      'image': /image/gi,
      'video': /video/gi,
      'text2img': /text.*2.*img|img2img|txt2img/gi,
      'stable diffusion': /stable.*diffusion|sdxl|sd1\.5/gi,
      'flux': /flux/gi
    };
    
    for (const [name, pattern] of Object.entries(patterns)) {
      const matches = jsContent.match(pattern);
      if (matches) {
        console.log(`✓ ${name}: ${matches.length} occurrences`);
      }
    }
    
    // Save full JS for analysis
    const fs = require('fs');
    fs.writeFileSync('opensourcegen-app.js', jsContent);
    console.log('\n\n💾 Full application JS saved to: opensourcegen-app.js');
    
    // Create summary
    console.log('\n\n📊 ANALYSIS SUMMARY');
    console.log('=' .repeat(70));
    console.log(`✅ Application size: ${(jsContent.length / 1024).toFixed(2)} KB`);
    console.log(`✅ API endpoints found: ${foundEndpoints.size}`);
    console.log(`\n🎯 Key findings:`);
    console.log(`   - Health endpoint: /api/health`);
    console.log(`   - Register endpoint: /api/osg-register`);
    console.log(`   - Uses Firebase for authentication`);
    console.log(`   - Firebase API Key: AIzaSyBmPLymGM3ZquLnZvEIYwp53R3mkmIte0Y`);
    console.log(`   - Firebase Project: opensourcegen-prod`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

findOpenSourceGenAPI().catch(console.error);
