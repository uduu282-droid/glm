const axios = require('axios');

async function analyzeRefineForever() {
  console.log('🔍 Analyzing RefineForever API Structure\n');
  console.log('=' .repeat(70));
  
  try {
    // Get tools.json
    console.log('\n📡 Fetching tools.json...');
    const toolsResponse = await axios.get('https://refineforever.com/tools.json', {
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    console.log('✅ Tools config loaded');
    console.log(JSON.stringify(toolsResponse.data, null, 2).substring(0, 1000));
    
    // Get the main JS file
    console.log('\n\n📡 Fetching main application JS...');
    const jsResponse = await axios.get('https://refineforever.com/assets/index-B-QYTy2U.js', {
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
      /https?:\/\/[^\s"'`]+\/v1[^\s"'`]*/gi,
      /https?:\/\/[^\s"'`]+\/generate[^\s"'`]*/gi,
      /https?:\/\/[^\s"'`]+\/edit[^\s"'`]*/gi,
      /https?:\/\/[^\s"'`]+\/process[^\s"'`]*/gi,
      /https?:\/\/[^\s"'`]+\/transform[^\s"'`]*/gi
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
    
    // Look for fetch calls
    console.log('\n\n🔍 Searching for fetch/XHR calls...\n');
    const fetchPattern = /fetch\(['"`](.*?)['"`]\)/g;
    const xhrPattern = /axios\.(get|post|put|delete)\(['"`](.*?)['"`]\)/g;
    
    const fetchMatches = [...jsContent.matchAll(fetchPattern)];
    const xhrMatches = [...jsContent.matchAll(xhrPattern)];
    
    if (fetchMatches.length > 0 || xhrMatches.length > 0) {
      console.log('📡 Found HTTP calls:\n');
      fetchMatches.forEach(([_, url]) => console.log(`   GET ${url}`));
      xhrMatches.forEach(([method, url]) => console.log(`   ${method.toUpperCase()} ${url}`));
    }
    
    // Save full JS for analysis
    const fs = require('fs');
    fs.writeFileSync('refineforever-app.js', jsContent);
    console.log('\n\n💾 Full application JS saved to: refineforever-app.js');
    
    // Create summary
    console.log('\n\n📊 ANALYSIS SUMMARY');
    console.log('=' .repeat(70));
    console.log(`\n✅ Tools config: ${JSON.stringify(Object.keys(toolsResponse.data)).substring(0, 200)}`);
    console.log(`✅ Application size: ${(jsContent.length / 1024).toFixed(2)} KB`);
    console.log(`✅ API endpoints found: ${foundEndpoints.size}`);
    console.log(`✅ Fetch calls: ${fetchMatches.length}`);
    console.log(`✅ XHR calls: ${xhrMatches.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

analyzeRefineForever().catch(console.error);
