import { chromium } from 'playwright';
import inquirer from 'inquirer';
import { NetworkAnalyzer } from './network-analyzer.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Interactive Endpoint Finder
 * Watches your browser session and extracts all API endpoints
 */
async function findEndpoints() {
  console.log('\n🔍 Universal AI Proxy - Network Endpoint Finder\n');
  console.log('=' .repeat(60) + '\n');
  
  const analyzer = new NetworkAnalyzer();
  let browser;

  try {
    // Ask which website to analyze
    const { websiteUrl } = await inquirer.prompt([
      {
        type: 'input',
        name: 'websiteUrl',
        message: 'Enter chat website URL to analyze:',
        default: 'https://chat.deepseek.com'
      }
    ]);

    console.log(`\n🌐 Target: ${websiteUrl}\n`);
    
    // Launch browser with network monitoring
    console.log('1. 🚀 Launching browser with network monitor...\n');
    browser = await chromium.launch({ 
      headless: false,
      args: ['--window-size=1280,900']
    });

    const { context, page } = await analyzer.startMonitoring(browser);

    console.log('2. 📍 Navigating to website...\n');
    await page.goto(websiteUrl, { waitUntil: 'networkidle' });
    await sleep(2000);

    console.log('3. 👉 NOW USE THE WEBSITE NORMALLY:\n');
    console.log('   - Login if needed');
    console.log('   - Send a test message');
    console.log('   - Wait for response');
    console.log('   - Browse around a bit\n');
    console.log('   I\'ll capture ALL network traffic...\n');
    console.log('   Press ENTER when done (after ~30 seconds)\n');

    // Wait for user to interact with the site
    await waitForUserInteraction();

    console.log('\n4. 🔬 Analyzing captured network traffic...\n');

    // Print all captured endpoints
    analyzer.printCapturedEndpoints();

    // Find best chat endpoint
    const topEndpoints = await analyzer.findBestChatEndpoint();

    if (topEndpoints.length > 0) {
      console.log('\n🎯 TOP CHAT API CANDIDATES:\n');
      
      topEndpoints.forEach((ep, i) => {
        console.log(`${i + 1}. Score: ${ep.score}/150`);
        console.log(`   URL: ${ep.url}`);
        console.log(`   Method: ${ep.method}`);
        
        if (ep.reasons.length > 0) {
          console.log(`   Why:`);
          ep.reasons.forEach(reason => console.log(`      ✓ ${reason}`));
        }
        
        if (ep.bodyPreview) {
          console.log(`   Body preview: ${ep.bodyPreview}...`);
        }
        console.log('');
      });

      // Save results
      const resultsDir = path.join(__dirname, '../results/');
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }

      const domain = new URL(websiteUrl).hostname.replace(/\./g, '_');
      const outputFile = path.join(resultsDir, `${domain}_endpoints.json`);
      
      analyzer.saveToFile(outputFile);

      // Also save analyzed results
      const analysisFile = path.join(resultsDir, `${domain}_analysis.json`);
      fs.writeFileSync(analysisFile, JSON.stringify({
        website: websiteUrl,
        timestamp: Date.now(),
        topCandidates: topEndpoints,
        totalRequestsCaptured: analyzer.requests.length,
        recommendation: topEndpoints[0] ? topEndpoints[0].url : 'No candidates found'
      }, null, 2));

      console.log(`💾 Full analysis saved to: ${analysisFile}\n`);

      // Ask if user wants to use this endpoint
      if (topEndpoints[0] && topEndpoints[0].score > 50) {
        const { useEndpoint } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'useEndpoint',
            message: `Use "${topEndpoints[0].url}" as the chat endpoint?`,
            default: true
          }
        ]);

        if (useEndpoint) {
          // Create/update config file
          const configFile = path.join(__dirname, '../endpoint-config.json');
          const config = {
            [websiteUrl]: {
              apiUrl: topEndpoints[0].url,
              method: topEndpoints[0].method,
              detectedAt: Date.now(),
              confidence: topEndpoints[0].score
            }
          };

          // Merge with existing config
          let existingConfig = {};
          if (fs.existsSync(configFile)) {
            existingConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
          }

          const mergedConfig = { ...existingConfig, ...config };
          fs.writeFileSync(configFile, JSON.stringify(mergedConfig, null, 2));

          console.log(`✅ Endpoint configuration saved!\n`);
          console.log('Next time you use this website, it will use the detected endpoint automatically!\n');
        }
      }

    } else {
      console.log('⚠️  No obvious chat API endpoints detected.\n');
      console.log('This might mean:');
      console.log('   - The website uses WebSockets instead of HTTP');
      console.log('   - The API structure is non-standard');
      console.log('   - More interaction is needed\n');
    }

    console.log('='.repeat(60) + '\n');
    console.log('🎉 Analysis complete!\n');

    await sleep(3000);
    await browser.close();
    
    console.log('🔒 Browser closed\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    if (browser) await browser.close();
    process.exit(1);
  }
}

async function waitForUserInteraction() {
  return new Promise((resolve) => {
    process.stdin.once('data', () => {
      resolve();
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

findEndpoints();
