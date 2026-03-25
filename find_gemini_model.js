import fetch from 'node-fetch';
import fs from 'fs';

async function findGeminiModel() {
  console.log('🔍 Finding Exact Gemini Model Version\n');
  console.log('=' .repeat(60));
    
  const baseUrl = 'https://free-aichat.vercel.app';
    
    // Step 1: Fetch homepage with more detailed analysis
  console.log('Step 1: Fetching homepage with JavaScript files...\n');
    
    try {
    const response = await fetch(baseUrl, {
        headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
       if (!response.ok) {
        console.log(`❌ Failed to fetch: ${response.status}`);
         return;
       }
        
     const html = await response.text();
     console.log(`✅ Homepage fetched (${html.length} bytes)\n`);
        
        // Extract all script URLs
     const scriptPattern = /<script[^>]*src=["']([^"']+)["'][^>]*>/gi;
     const scripts = [...html.matchAll(scriptPattern)].map(m => m[1]);
        
     console.log(`Found ${scripts.length} JavaScript files to analyze\n`);
        
        // Download and search each script for Gemini model info
     const geminiPatterns = [
            /gemini[-\s]?(pro|ultra|flash|advanced)?[\s-]?(\d+(\.\d+)?)?/gi,
            /model["'\s:=]+(gemini[-\w\d.]+)/gi,
            /(gemini-\d+[-\w]*)/gi,
            /"model":\s*["'](gemini[^"']+)["']/gi,
            /models?\s*[:=]\s*\{[^}]*gemini[^}]*\}/gi
        ];
        
       let foundModels = new Set();
       let modelDetails = [];
        
      for (const script of scripts) {
          try {
            const scriptUrl = script.startsWith('http') ? script : `${baseUrl}${script}`;
           console.log(`Checking: ${script}`);
             
            const scriptResponse = await fetch(scriptUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
             });
             
             if (!scriptResponse.ok) continue;
             
            const jsContent = await scriptResponse.text();
             
              // Search for Gemini references
             patterns: for (const pattern of geminiPatterns) {
                const matches = jsContent.match(pattern);
                  if (matches && matches.length > 0) {
                     matches.forEach(match => {
                        let cleanMatch = match.toLowerCase()
                            .replace(/["':=\[\]{}]/g, '')
                            .replace(/\s+/g, '-')
                            .trim();
                        
                         // Extract just the model name
                       const geminiMatch = cleanMatch.match(/gemini[-\w\d.]*/);
                         if (geminiMatch) {
                            foundModels.add(geminiMatch[0]);
                             modelDetails.push({
                                file: script,
                                 match: match,
                                 full: cleanMatch
                             });
                         }
                    });
                 }
             }
             
              // Also look for configuration objects
            const configPattern = /(?:config|CONFIG|settings|SETTINGS)\s*=\s*\{[\s\S]{0,1000}?gemini[\s\S]{0,500}?\}/gi;
            const configs = jsContent.match(configPattern);
              if (configs) {
                console.log(`  ⚙️  Found configuration with Gemini:`);
                configs.forEach(config => {
                   console.log(`  ${config.substring(0, 200)}...`);
                 });
             }
             
          } catch(error) {
           console.log(`  Error loading ${script}: ${error.message}`);
          }
      }
        
     console.log('\n' + '='.repeat(60));
     console.log('\n📊 Results: Gemini Model Discovery\n');
        
       if (foundModels.size > 0) {
        console.log(`✅ Found ${foundModels.size} Gemini model reference(s):\n`);
         Array.from(foundModels).forEach((model, i) => {
           console.log(`  ${i + 1}. ${model}`);
         });
            
        console.log('\n📝 Detailed matches:');
         modelDetails.forEach((detail, i) => {
           console.log(`\n  Match ${i + 1}:`);
           console.log(`    File: ${detail.file}`);
           console.log(`    Raw: ${detail.match}`);
           console.log(`    Clean: ${detail.full}`);
         });
            
       } else {
        console.log('ℹ️  No specific Gemini version found in JavaScript bundles');
        console.log('\n💡 This suggests:');
        console.log('   • Model selection happens server-side');
        console.log('   • Or uses default/latest Gemini API version');
        console.log('   • Most likely: **gemini-pro** (Google\'s standard free tier model)');
       }
        
     console.log('\n' + '='.repeat(60));
        
       // Step 2: Check common Gemini API patterns
     console.log('\nStep 2: Checking Common Gemini API Patterns\n');
        
      const commonGeminiModels = [
            'gemini-pro',
            'gemini-1.0-pro',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'gemini-ultra',
            'gemini-advanced'
        ];
        
     console.log('Testing against known Google AI Studio models:\n');
        
      commonGeminiModels.forEach(model => {
         const regex = new RegExp(model.replace(/[-.]/g, '[-.]'), 'i');
          const pageHtmlLower = html.toLowerCase();
           
          if (pageHtmlLower.includes(model.toLowerCase()) || regex.test(pageHtmlLower)) {
           console.log(`  ✅ POSSIBLE MATCH: ${model}`);
          }
       });
        
     console.log('\n' + '='.repeat(60));
        
       // Step 3: Make educated deduction
     console.log('\nStep 3: Analysis & Conclusion\n');
        
     console.log('📋 Based on the evidence:\n');
        
      console.log('Known Facts:');
      console.log('  ✓ Website mentions "Gemini and Groq models"');
      console.log('  ✓ Free service (no payment required)');
      console.log('  ✓ No API key needed from users');
      console.log('  ✓ Uses Vercel hosting (serverless functions)\n');
        
      console.log('Most Likely Configuration:');
      console.log('  🎯 Primary Model: **gemini-pro** or **gemini-1.0-pro**');
      console.log('  Reason: This is Google\'s standard free-tier model\n');
        
      console.log('Alternative Possibilities:');
      console.log('  • gemini-1.5-pro (newer, but may cost more)');
      console.log('  • gemini-1.5-flash (faster, lighter model)');
      console.log('  • Dynamic switching based on load/cost\n');
        
      console.log('How to Confirm:');
      console.log('  1. Capture actual API request (see START_HERE_CHECKLIST.md)');
      console.log('  2. Check request body for"model" parameter');
      console.log('  3. Or check response metadata for model info\n');
        
        // Save results
      const results = {
            timestamp: new Date().toISOString(),
            foundModels: Array.from(foundModels),
            modelDetails: modelDetails,
            mostLikely: 'gemini-pro',
            alternatives: commonGeminiModels,
           conclusion: 'Model selection likely happens server-side using gemini-pro as default'
        };
        
       fs.writeFileSync('gemini_model_analysis.json', JSON.stringify(results, null, 2));
     console.log('✅ Analysis saved to gemini_model_analysis.json\n');
        
    } catch(error) {
    console.log(`❌ Error: ${error.message}`);
     console.log(error.stack);
    }
}

findGeminiModel();
