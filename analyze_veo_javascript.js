import axios from 'axios';

console.log('🔍 VEO AI Free - Deep JavaScript Analysis');
console.log('='.repeat(70));

const SCRIPTS = [
    'https://veoaifree.com/wp-content/themes/really-simple-child/logic.js?ver=181',
    'https://veoaifree.com/wp-content/themes/really-simple-child/editor-data/editor-assets/init.js',
    'https://veoaifree.com/wp-content/themes/really-simple-child/editor-data/editor-assets/plugins.js'
];

// Download and analyze each script
async function downloadScript(url) {
    console.log(`\n📥 Downloading: ${url.split('/').pop()}`);
    
    try {
        const response = await axios.get(url, {
            timeout: 15000
        });
        
        console.log('✅ Downloaded successfully');
        console.log('Size:', response.data.length, 'bytes');
        
        return response.data;
        
    } catch (error) {
        console.log('❌ Failed to download');
        console.log('Error:', error.message);
        return null;
    }
}

// Search for AJAX-related patterns
function analyzeScript(content, scriptName) {
    console.log(`\n🔍 Analyzing ${scriptName}...\n`);
    
    const patterns = {
        'AJAX URL': /ajax.*url['"]\s*[:=]\s*['"]([^'"]+)['"]/gi,
        'Action Names': /action['"]\s*[:=]\s*['"]([^'"]+)['"]/gi,
        'admin-ajax.php': /admin-ajax\.php/gi,
        'jQuery AJAX': /\$\.ajax\s*\(\s*{[\s\S]*?}/g,
        'Fetch Calls': /fetch\s*\(['"][^'"]+['"]\)/g,
        'WordPress Nonce': /nonce['"]\s*[:=]\s*['"]([^'"]+)['"]/gi,
        'Video Generation': /(video|generate|create|ai)[\w]*(?:_|=|\()[\s\S]{0,100}/gi
    };
    
    let foundAnything = false;
    
    for (const [name, pattern] of Object.entries(patterns)) {
        const matches = Array.from(content.matchAll(pattern));
        
        if (matches.length > 0) {
            foundAnything = true;
            console.log(`\n✨ Found ${name}:`);
            
            matches.forEach((match, i) => {
                if (i < 3) { // Show first 3 matches
                    const context = match[0].replace(/\s+/g, ' ').substring(0, 200);
                    console.log(`  ${i + 1}. ${context}`);
                }
            });
        }
    }
    
    // Look for FormData usage
    const formDataMatches = Array.from(content.matchAll(/FormData|append\s*\([^)]+\)/gi));
    if (formDataMatches.length > 0) {
        console.log(`\n📋 Found FormData usage (${formDataMatches.length} occurrences)`);
        
        // Get surrounding context
        const formDataContexts = [];
        let index = 0;
        
        while ((index = content.indexOf('FormData', index)) !== -1) {
            const start = Math.max(0, index - 100);
            const end = Math.min(content.length, index + 200);
            formDataContexts.push(content.substring(start, end));
            index++;
        }
        
        console.log('\nContext examples:');
        formDataContexts.slice(0, 2).forEach((ctx, i) => {
            console.log(`\nExample ${i + 1}:`);
            console.log(ctx.replace(/\s+/g, ' '));
        });
    }
    
    // Look for event listeners
    const eventListeners = Array.from(content.matchAll(/addEventListener\s*\(\s*['"]click['"][\s\S]{0,500}/gi));
    if (eventListeners.length > 0) {
        console.log(`\n🖱️ Found click event handlers (${eventListeners.length})`);
        eventListeners.slice(0, 2).forEach((handler, i) => {
            console.log(`\nHandler ${i + 1}:`);
            console.log(handler[0].replace(/\s+/g, ' ').substring(0, 300));
        });
    }
    
    return foundAnything;
}

// Main analysis
async function runDeepAnalysis() {
    console.log('\n🚀 Starting Deep JavaScript Analysis\n');
    
    for (const scriptUrl of SCRIPTS) {
        console.log('\n' + '='.repeat(70));
        console.log(`Analyzing: ${scriptUrl.split('/').pop()}`);
        console.log('='.repeat(70));
        
        const content = await downloadScript(scriptUrl);
        
        if (content) {
            const scriptName = scriptUrl.split('/').pop().split('?')[0];
            analyzeScript(content, scriptName);
        }
        
        // Wait between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🏁 Deep Analysis Complete');
    console.log('='.repeat(70));
    
    console.log('\n💡 Next Steps:');
    console.log('1. Look for the exact "action" parameter in the scripts above');
    console.log('2. Check if there\'s a nonce/security token being sent');
    console.log('3. Find the button click handler that triggers generation');
    console.log('4. Monitor what data is sent to admin-ajax.php');
    
    console.log('\n🎯 What to look for:');
    console.log('- jQuery $.ajax() calls with url containing "admin-ajax.php"');
    console.log('- data.action parameter in AJAX requests');
    console.log('- FormData.append() calls showing what fields are sent');
    console.log('- Click event handlers on generate/submit buttons');
}

// Run the analysis
runDeepAnalysis().catch(console.error);