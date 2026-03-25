import fetch from 'node-fetch';

async function simpleAnalysis() {
  console.log('🔍 Simple Analysis of free-aichat.vercel.app\n');
    
  const url = 'https://free-aichat.vercel.app';
    
    try {
     console.log('Fetching homepage...');
     const response = await fetch(url, {
         method: 'GET',
         headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
     console.log(`Status: ${response.status} ${response.statusText}\n`);
        
       if (response.ok) {
         const html = await response.text();
         console.log(`✅ Got HTML (${html.length} bytes)\n`);
            
            // Search for model-related content
          const lines = html.split('\n');
            
         console.log('Searching for "model" references...\n');
            
            let foundCount = 0;
            lines.forEach((line, index) => {
               if (line.toLowerCase().includes('model') && foundCount < 30) {
                   foundCount++;
                  console.log(`Line ${index}: ${line.substring(0, 200).trim()}`);
               }
            });
            
          console.log(`\nFound ${foundCount} lines with "model"\n`);
            
            // Look for specific patterns
          const patterns = [
                /gpt-[\w.-]+/gi,
                /claude/gi,
                /llama/gi,
                /mistral/gi,
                /gemini/gi
            ];
            
           patterns.forEach(pattern => {
              const matches = html.match(pattern);
               if (matches) {
                  console.log(`\n✓ Found "${pattern.source}": ${matches.length} times`);
                  const unique = [...new Set(matches.map(m => m.toLowerCase()))];
                   if (unique.length <= 10) {
                      console.log(`  Variants: ${unique.join(', ')}`);
                   }
               }
            });
            
        } else {
         console.log(`❌ Failed: ${await response.text()}`);
        }
    } catch (error) {
     console.log(`❌ Error: ${error.message}`);
    }
}

simpleAnalysis();
