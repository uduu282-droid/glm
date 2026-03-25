import fetch from 'node-fetch';
import fs from 'fs';

async function analyzeBundles() {
  console.log('🔍 Analyzing JavaScript Bundles for Model Information\n');
    
  const baseUrl = 'https://free-aichat.vercel.app';
    
    // First, get the homepage to find all bundles
  console.log('Step 1: Fetching homepage...');
  const homeResponse = await fetch(baseUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
  const html = await homeResponse.text();
  console.log('✅ Homepage fetched\n');
    
    // Extract all script URLs
  const scriptPattern = /<script[^>]*src=["']([^"']+)["'][^>]*>/gi;
  const scripts = [...html.matchAll(scriptPattern)].map(m => m[1]);
    
  console.log(`Found ${scripts.length} scripts to analyze\n`);
    
    // Download each script and search for model-related content
   for (const script of scripts) {
      try {
        console.log(`Analyzing: ${script}`);
        const scriptUrl = script.startsWith('http') ? script : `${baseUrl}${script}`;
         
        const response = await fetch(scriptUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
         });
         
         if (!response.ok) {
           console.log(`  ❌ Failed (${response.status})\n`);
           continue;
         }
         
        const jsContent = await response.text();
          fs.writeFileSync(`bundle_${script.replace(/[^a-zA-Z0-9]/g, '_')}.js`, jsContent);
         
        console.log(`  ✅ Downloaded (${(jsContent.length/ 1024).toFixed(2)} KB)`);
         
          // Search for model-related patterns
        const patterns = {
              'Model Names': /(gpt-?[\d.]*(-turbo|-o|-mini)?|claude-?[\w.-]*|llama-?[\d.]*b?|mistral-?[\w]*|mixtral-?[\w]*|gemini-?[\w.]*)/gi,
               'API Endpoints': /(\/api\/[\w/-]+|https?:\/\/[\w./-]+\/api[\w/-]*)/gi,
               'Provider Names': /(openai|anthropic|google|meta|mistralai|cohere)/gi
           };
         
          let foundSomething = false;
         
         Object.entries(patterns).forEach(([name, pattern]) => {
            const matches = jsContent.match(pattern);
              if (matches && matches.length > 0) {
                 foundSomething = true;
                const unique = [...new Set(matches.map(m => m.toLowerCase()))];
                 
               console.log(`\n  📦 ${name}: Found ${unique.length} match(es)`);
                 
                  if (name === 'Model Names' && unique.length <= 15) {
                    console.log(`     Models: ${unique.join(', ')}`);
                  } else if (name === 'Model Names' && unique.length > 15) {
                    console.log(`     Models: ${unique.slice(0, 10).join(', ')} ... (+${unique.length - 10})`);
                  } else if (name === 'API Endpoints') {
                    const endpointUnique = [...new Set(matches)];
                     console.log(`     Endpoints: ${[...new Set(endpointUnique)].slice(0, 5).join(', ')}`);
                  } else if (name === 'Provider Names') {
                    console.log(`     Providers: ${unique.join(', ')}`);
                  }
              }
          });
         
          // Look for arrays that might contain models
        const arrayPattern = /\[(?:\s*["'][\w-]+["']\s*,?){2,}\]/g;
        const arrays = jsContent.match(arrayPattern);
         
          if (arrays) {
             // Filter arrays that look like they could be model lists
            const potentialModelArrays = arrays.filter(arr => {
                return arr.includes('gpt') || arr.includes('claude') || 
                       arr.includes('llama') || arr.includes('model') ||
                       arr.includes('gemini') || arr.length > 30;
             });
             
              if (potentialModelArrays.length > 0) {
                console.log(`\n  🔍 Found ${potentialModelArrays.length} potential model array(s):`);
                  potentialModelArrays.slice(0, 3).forEach((arr, i) => {
                   console.log(`     Array ${i + 1}: ${arr.substring(0, 150)}...`);
                  });
              }
          }
         
         if (!foundSomething) {
           console.log(`  ℹ️  No obvious model references found\n`);
         } else {
           console.log();
         }
         
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}\n`);
      }
   }
    
  console.log('='.repeat(60));
  console.log('✅ Bundle analysis complete!');
  console.log('\n💡 Check the downloaded bundle_*.js files for detailed analysis');
}

analyzeBundles().catch(console.error);
