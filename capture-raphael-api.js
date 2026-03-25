/**
 * Raphael AI Image Editor - Network Capture Tool
 * 
 * This script helps capture and analyze network requests
 * when using the Raphael AI image editor.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class RaphaelNetworkCapture {
  constructor() {
    this.capturedRequests = [];
    this.apiEndpoints = new Set();
    this.authTokens = [];
  }

  async startCapture(url = 'https://raphael.app/ai-image-editor') {
    console.log('🚀 Starting Raphael AI network capture...');
    console.log(`Target URL: ${url}`);
    
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Enable request interception
    await page.setRequestInterception(true);
    
    page.on('request', request => {
      const url = request.url();
      
      // Filter for API requests
      if (url.includes('api') || url.includes('graphql') || url.includes('upload') || url.includes('generate')) {
        const requestData = {
          timestamp: Date.now(),
          url: url,
          method: request.method(),
          headers: request.headers(),
          postData: request.postData(),
          resourceType: request.resourceType()
        };
        
        this.capturedRequests.push(requestData);
        this.apiEndpoints.add(new URL(url).hostname);
        
        console.log('\n📡 Captured API Request:');
        console.log(`   Method: ${request.method()}`);
        console.log(`   URL: ${url}`);
        console.log(`   Type: ${request.resourceType()}`);
        
        // Extract auth tokens
        const authHeader = request.headers()['authorization'];
        if (authHeader) {
          this.authTokens.push(authHeader);
          console.log(`   🔑 Auth Token: ${authHeader}`);
        }
        
        if (request.postData()) {
          try {
            const data = JSON.parse(request.postData());
            console.log(`   Payload:`, JSON.stringify(data, null, 2));
          } catch (e) {
            console.log(`   Payload: ${request.postData().substring(0, 200)}...`);
          }
        }
      }
      
      request.continue();
    });

    page.on('response', async response => {
      const url = response.url();
      
      if (url.includes('api') || url.includes('graphql')) {
        try {
          const status = response.status();
          const headers = response.headers();
          
          console.log(`✅ Response: ${status} ${url}`);
          
          // Try to get response body
          if (status === 200) {
            try {
              const text = await response.text();
              if (text.length < 5000) {
                console.log(`   Response Body: ${text.substring(0, 500)}`);
              }
            } catch (e) {
              // Binary response, skip
            }
          }
        } catch (error) {
          console.error('Error capturing response:', error.message);
        }
      }
    });

    console.log('\n📖 Navigate to Raphael AI and perform an image edit...');
    console.log('💡 Tip: Upload an image and apply an edit to capture the API calls');
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Keep browser open for user interaction
    console.log('\n⏳ Browser is open. Perform your actions now...');
    console.log('Press Ctrl+C when done to save captured data.');
    
    return { browser, page };
  }

  saveCapturedData(outputDir = './raphael_capture') {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = Date.now();
    
    // Save all requests
    const requestsFile = path.join(outputDir, `captured_requests_${timestamp}.json`);
    fs.writeFileSync(requestsFile, JSON.stringify(this.capturedRequests, null, 2));
    console.log(`\n💾 Saved ${this.capturedRequests.length} requests to ${requestsFile}`);

    // Save endpoints
    const endpointsFile = path.join(outputDir, `endpoints_${timestamp}.txt`);
    fs.writeFileSync(endpointsFile, Array.from(this.apiEndpoints).join('\n'));
    console.log(`💾 Saved ${this.apiEndpoints.size} endpoints to ${endpointsFile}`);

    // Save auth tokens
    if (this.authTokens.length > 0) {
      const tokensFile = path.join(outputDir, `auth_tokens_${timestamp}.txt`);
      fs.writeFileSync(tokensFile, Array.from(new Set(this.authTokens)).join('\n'));
      console.log(`💾 Saved ${this.authTokens.length} auth tokens to ${tokensFile}`);
    }

    // Generate summary report
    const summary = this.generateSummary();
    const summaryFile = path.join(outputDir, `capture_summary_${timestamp}.md`);
    fs.writeFileSync(summaryFile, summary);
    console.log(`💾 Saved summary to ${summaryFile}`);

    return outputDir;
  }

  generateSummary() {
    let summary = '# Raphael AI Network Capture Summary\n\n';
    summary += `**Capture Time**: ${new Date().toISOString()}\n\n`;
    summary += `**Total Requests Captured**: ${this.capturedRequests.length}\n\n`;
    
    summary += '## API Endpoints Found\n\n';
    this.apiEndpoints.forEach(endpoint => {
      summary += `- ${endpoint}\n`;
    });
    
    summary += '\n## Authentication Tokens\n\n';
    if (this.authTokens.length > 0) {
      const uniqueTokens = [...new Set(this.authTokens)];
      uniqueTokens.forEach((token, index) => {
        summary += `### Token ${index + 1}\n`;
        summary += `\`\`\`
${token}
\`\`\`

`;
      });
    } else {
      summary += 'No authentication tokens detected.\n\n';
    }
    
    summary += '## Request Breakdown\n\n';
    const byMethod = this.capturedRequests.reduce((acc, req) => {
      acc[req.method] = (acc[req.method] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(byMethod).forEach(([method, count]) => {
      summary += `- **${method}**: ${count} requests\n`;
    });
    
    summary += '\n## Key Requests\n\n';
    this.capturedRequests.slice(0, 10).forEach((req, index) => {
      summary += `### Request ${index + 1}\n`;
      summary += `- **URL**: ${req.url}\n`;
      summary += `- **Method**: ${req.method}\n`;
      summary += `- **Type**: ${req.resourceType}\n`;
      
      if (req.headers['authorization']) {
        summary += `- **Auth**: ${req.headers['authorization']}\n`;
      }
      
      if (req.postData) {
        try {
          const data = JSON.parse(req.postData);
          summary += `- **Payload**: \`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n`;
        } catch (e) {
          summary += `- **Payload**: ${req.postData.substring(0, 200)}...\n`;
        }
      }
      
      summary += '\n';
    });
    
    return summary;
  }

  async close() {
    console.log('\n🛑 Stopping capture...');
  }
}

// Interactive mode
async function main() {
  const capture = new RaphaelNetworkCapture();
  
  try {
    const { browser } = await capture.startCapture();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await capture.close();
      capture.saveCapturedData();
      await browser.close();
      console.log('\n✅ Capture completed successfully!');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error during capture:', error.message);
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = RaphaelNetworkCapture;

// Run if called directly
if (require.main === module) {
  main();
}
