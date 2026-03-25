import fetch from 'node-fetch';
import fs from 'fs';

async function fullAnalysis() {
  console.log('🔍 Complete Analysis of free-aichat.vercel.app\n');
    
  const url = 'https://free-aichat.vercel.app';
    
    try {
      console.log('Step 1: Fetching homepage...');
      const response = await fetch(url, {
          method: 'GET',
           headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
            }
        });
        
      console.log(`Status: ${response.status} ${response.statusText}\n`);
        
        if (!response.ok) return;
        
      const html = await response.text();
       
       // Save to file for manual inspection
       fs.writeFileSync('aichat_homepage.html', html);
      console.log('✅ Saved HTML to aichat_homepage.html\n');
        
      console.log('Step 2: Searching for AI Model references...\n');
        
        // Comprehensive model search patterns
      const modelPatterns = {
            'GPT Models': /gpt-?[\d.]*(-turbo|-o|-mini)?/gi,
            'Claude Models': /claude(-[\w-]+)?/gi,
            'LLaMA Models': /llama(-?\d+(\.\d+)?(-\d+b)?)?/gi,
            'Mistral': /mistral(-[\w-]+)?/gi,
            'Mixtral': /mixtral(-[\w-]+)?/gi,
            'Gemini': /gemini(-[\w.]+)?/gi,
            'Phi': /phi(-?\d+(\.\d+)?)?/gi,
            'Command': /command(-[\w]+)?/gi,
            'Cohere': /cohere/gi,
            'PaLM': /palm(-[\w]+)?/gi
        };
        
       let totalFound = 0;
        
       Object.entries(modelPatterns).forEach(([name, pattern]) => {
          const matches = html.match(pattern);
            if (matches && matches.length > 0) {
              const unique = [...new Set(matches.map(m => m.toLowerCase()))];
               totalFound += unique.length;
              console.log(`✓ ${name}: Found ${unique.length} variant(s)`);
                if (unique.length <= 5) {
                  console.log(`    → ${unique.join(', ')}`);
                } else {
                  console.log(`    → ${unique.slice(0, 5).join(', ')} ... (+${unique.length - 5})`);
                }
            }
        });
        
      console.log(`\nTotal unique model families found: ${totalFound}\n`);
        
      console.log('Step 3: Looking for JavaScript bundles...\n');
        
        // Find script tags
      const scriptPattern = /<script[^>]*src=["']([^"']+)["'][^>]*>/gi;
      const scripts = [...html.matchAll(scriptPattern)].map(m => m[1]);
        
      console.log(`Found ${scripts.length} external scripts:`);
       scripts.forEach((src, i) => {
          console.log(`  ${i + 1}. ${src}`);
       });
        
      console.log('\n\nStep 4: Looking for inline configuration...\n');
        
        // Look for window.__ENV__ or similar configurations
      const configPatterns = [
            /window\.\w+\s*=\s*\{[^}]*\}/gi,
            /const\s+(config|settings|options)\s*=\s*\{[^}]*\}/gi,
            /"models?"\s*:\s*\[[^\]]*\]/gi
        ];
        
      configPatterns.forEach((pattern, idx) => {
          const matches = html.match(pattern);
            if (matches) {
              console.log(`Config pattern ${idx + 1}: Found ${matches.length} match(es)`);
               matches.forEach(match => {
                 console.log(`  ${match.substring(0, 150)}...`);
               });
            }
        });
        
      console.log('\n\nStep 5: Searching for dropdown/select elements...\n');
        
        // Look for select elements with options
      const selectPattern = /<select[^>]*>([\s\S]*?)<\/select>/gi;
      const selects = [...html.matchAll(selectPattern)];
        
       if (selects.length > 0) {
          console.log(`Found ${selects.length} select element(s):\n`);
           selects.forEach((select, i) => {
             console.log(`Select ${i + 1}:`);
              const options = select[1].match(/<option[^>]*value=["']([^"']+)["'][^>]*>([^<]*)<\/option>/gi);
               if (options) {
                   options.forEach(opt => {
                     const valueMatch = opt.match(/value=["']([^"']+)["']/);
                     const textMatch = opt.match(/>([^<]*)</);
                       if (valueMatch && textMatch) {
                         console.log(`    • ${valueMatch[1]} - "${textMatch[1].trim()}"`);
                       }
                   });
               }
             console.log();
           });
       } else {
          console.log('No traditional select dropdowns found (likely using custom UI components)\n');
       }
        
      console.log('='.repeat(60));
      console.log('✅ Analysis complete!');
      console.log('\n💡 Next steps:');
      console.log('   1. Open aichat_homepage.html in a text editor');
      console.log('   2. Search for "model", "provider", "api" keywords');
      console.log('   3. Check the JavaScript bundle files for model lists');
        
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      console.log(error.stack);
    }
}

fullAnalysis();
