const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);
        
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`✓ Downloaded: ${outputPath}`);
                    resolve();
                });
            } else {
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        }).on('error', (err) => {
            fs.unlink(outputPath, () => reject(err));
        });
    });
}

async function extractAndAnalyzeBundles() {
    console.log('🔍 Starting HiFlux.xyz bundle analysis...\n');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--disable-blink-features=AutomationControlled']
    });
    
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        
        console.log('🌐 Loading page...');
        await page.goto('https://www.hiflux.xyz/', { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });
        
        await page.waitForTimeout(3000);
        
        // Extract all JavaScript files
        const jsFiles = await page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            return scripts.map(s => s.src).filter(src => src.includes('_next') || src.includes('.js'));
        });
        
        console.log(`\n📦 Found ${jsFiles.length} JavaScript bundles\n`);
        
        // Create output directory
        const outputDir = path.join(__dirname, 'hiflux_analysis', 'bundles');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Download and analyze each bundle
        let downloadedCount = 0;
        for (const jsUrl of jsFiles) {
            try {
                const filename = path.basename(jsUrl.split('?')[0]);
                const outputPath = path.join(outputDir, filename);
                
                // Convert relative URLs to absolute
                const fullUrl = jsUrl.startsWith('http') ? jsUrl : `https://www.hiflux.xyz${jsUrl}`;
                
                await downloadFile(fullUrl, outputPath);
                downloadedCount++;
                
                // Limit to first 20 files to avoid overwhelming
                if (downloadedCount >= 20) {
                    console.log('\n⚠️ Limited to 20 files for initial analysis\n');
                    break;
                }
            } catch (error) {
                console.log(`⚠️ Failed to download ${jsUrl}: ${error.message}`);
            }
        }
        
        // Analyze downloaded bundles for API endpoints
        console.log('\n🔎 Analyzing bundles for API endpoints...\n');
        
        const apiPatterns = [
            /https?:\/\/[^\s"'`]+\/api\/[^\s"'`]*/gi,
            /\/api\/[a-zA-Z0-9\/_-]+/gi,
            /fetch\(['"`](.*?)['"`]\)/gi,
            /axios\.(get|post|put|delete)\(['"`](.*?)['"`]\)/gi,
            /endpoint[:\s]+['"`](.*?)['"`]/gi,
            /url[:\s]+['"`](.*?image.*?|.*?generate.*?|.*?create.*?)['"`]/gi
        ];
        
        const foundEndpoints = new Set();
        const files = fs.readdirSync(outputDir);
        
        for (const file of files) {
            if (file.endsWith('.js')) {
                const content = fs.readFileSync(path.join(outputDir, file), 'utf-8');
                
                for (const pattern of apiPatterns) {
                    const matches = content.match(pattern);
                    if (matches) {
                        matches.forEach(match => {
                            // Clean up the match
                            let endpoint = match.replace(/^(fetch|axios\.[a-z]+|endpoint|url)[:\s'"]+/i, '')
                                              .replace(/['"\)]+$/, '')
                                              .trim();
                            
                            if (endpoint && (endpoint.includes('/api/') || endpoint.includes('image') || endpoint.includes('generate'))) {
                                foundEndpoints.add(endpoint);
                            }
                        });
                    }
                }
            }
        }
        
        // Save findings
        const findingsFile = path.join(__dirname, 'hiflux_analysis', 'bundle_findings.txt');
        const findings = [
            'HiFlux.xyz Bundle Analysis Findings',
            '=' .repeat(50),
            `\nTotal JS Bundles: ${jsFiles.length}`,
            `Downloaded: ${downloadedCount}`,
            `\nPotential API Endpoints Found: ${foundEndpoints.size}`,
            '\n--- Endpoints ---\n',
            ...Array.from(foundEndpoints)
        ];
        
        fs.writeFileSync(findingsFile, findings.join('\n'));
        
        console.log('✅ Analysis complete!');
        console.log(`\n📊 Summary:`);
        console.log(`   - Downloaded ${downloadedCount} JavaScript bundles`);
        console.log(`   - Found ${foundEndpoints.size} potential API endpoints`);
        console.log(`\n📁 Results saved to: ${path.join(__dirname, 'hiflux_analysis')}`);
        console.log(`\n📄 Detailed findings: ${findingsFile}\n`);
        
        if (foundEndpoints.size > 0) {
            console.log('🔍 Key endpoints discovered:');
            Array.from(foundEndpoints).slice(0, 10).forEach(ep => console.log(`   ${ep}`));
            console.log('');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the analysis
extractAndAnalyzeBundles().catch(console.error);
