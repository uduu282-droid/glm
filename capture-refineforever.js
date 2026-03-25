/**
 * RefineForever Image Editor - Network Capture Tool
 * 
 * This script uses Puppeteer to capture API requests when using the
 * RefineForever advanced image editor tool.
 * 
 * Usage: node capture-refineforever.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class RefineForeverCapture {
  constructor() {
    this.capturedRequests = [];
    this.apiEndpoints = new Set();
  }

  async captureNetworkTraffic() {
    console.log('🎯 Capturing RefineForever Network Traffic\n');
    console.log('=' .repeat(70));
    
    let browser;
    try {
      // Launch browser
      console.log('🌐 Launching browser...');
      browser = await puppeteer.launch({
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });

      const page = await browser.newPage();
      
      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });

      // Enable request interception
      await page.setRequestInterception(true);

      // Capture all requests
      page.on('request', request => {
        const url = request.url();
        
        // Filter for API requests (not static assets)
        if (url.includes('api') || 
            url.includes('graphql') || 
            url.includes('upload') || 
            url.includes('generate') ||
            url.includes('edit') ||
            url.includes('image')) {
          
          const requestData = {
            timestamp: Date.now(),
            url: url,
            method: request.method(),
            headers: request.headers(),
            postData: request.postData(),
            resourceType: request.resourceType()
          };
          
          this.capturedRequests.push(requestData);
          
          // Extract hostname for endpoint tracking
          try {
            const urlObj = new URL(url);
            this.apiEndpoints.add(urlObj.hostname);
          } catch (e) {}
          
          console.log(`\n📡 Captured: ${request.method()} ${url}`);
          if (request.postData) {
            try {
              const data = JSON.parse(request.postData);
              console.log('Payload:', JSON.stringify(data, null, 2).substring(0, 500));
            } catch (e) {
              console.log('Payload:', String(request.postData).substring(0, 200));
            }
          }
        }
        
        request.continue();
      });

      console.log('\n📍 Navigate to: https://refineforever.com/tool/advanced_edit_image');
      console.log('\n👉 INSTRUCTIONS:');
      console.log('   1. The browser will open in 3 seconds');
      console.log('   2. Upload an image and make edits');
      console.log('   3. Click "Generate" or "Apply" to see the magic');
      console.log('   4. I\'ll capture all API requests automatically');
      console.log('   5. Close the browser when done (or wait 60 seconds)\n');
      
      // Navigate to the tool
      await page.goto('https://refineforever.com/tool/advanced_edit_image', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for user interaction (up to 60 seconds)
      console.log('⏳ Waiting for user interaction (60 second timeout)...');
      await page.waitForTimeout(60000);

      // Save captured data
      await this.saveResults();

    } catch (error) {
      console.error('\n❌ Error during capture:', error.message);
    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
    }
  }

  async saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save full capture log
    const captureFile = `REFINEFOREVER_CAPTURE_${timestamp}.json`;
    await fs.writeFile(
      captureFile,
      JSON.stringify(this.capturedRequests, null, 2),
      'utf-8'
    );
    
    // Save summary
    const summary = {
      captureTime: timestamp,
      totalRequests: this.capturedRequests.length,
      apiEndpoints: Array.from(this.apiEndpoints),
      requestsByType: this.categorizeRequests(),
      instructions: this.generateInstructions()
    };
    
    const summaryFile = `REFINEFOREVER_SUMMARY_${timestamp}.md`;
    await fs.writeFile(
      summaryFile,
      this.formatSummary(summary),
      'utf-8'
    );
    
    console.log('\n✅ CAPTURE COMPLETE!');
    console.log('=' .repeat(70));
    console.log(`\n📄 Full capture saved to: ${captureFile}`);
    console.log(`📝 Summary saved to: ${summaryFile}`);
    console.log(`\n📊 Total API requests captured: ${this.capturedRequests.length}`);
    console.log(`🌐 API endpoints found: ${this.apiEndpoints.size}`);
  }

  categorizeRequests() {
    const categories = {};
    for (const req of this.capturedRequests) {
      const type = req.resourceType;
      categories[type] = (categories[type] || 0) + 1;
    }
    return categories;
  }

  generateInstructions() {
    const instructions = [];
    
    // Find POST requests (likely the main API calls)
    const postRequests = this.capturedRequests.filter(r => r.method === 'POST');
    
    if (postRequests.length > 0) {
      instructions.push({
        type: 'MAIN_API_ENDPOINT',
        url: postRequests[0].url,
        method: postRequests[0].method,
        note: 'This appears to be the main editing endpoint'
      });
    }
    
    // Find upload requests
    const uploadRequests = this.capturedRequests.filter(r => 
      r.url.includes('upload') || r.url.includes('image')
    );
    
    if (uploadRequests.length > 0) {
      instructions.push({
        type: 'IMAGE_UPLOAD',
        urls: [...new Set(uploadRequests.map(r => r.url))],
        note: 'Image upload endpoints detected'
      });
    }
    
    return instructions;
  }

  formatSummary(summary) {
    return `# 🔍 RefineForever API Capture Results

## 📊 Overview
- **Capture Time**: ${summary.captureTime}
- **Total Requests**: ${summary.totalRequests}
- **API Endpoints**: ${summary.apiEndpoints.join(', ')}

## 📈 Requests by Type
${Object.entries(summary.requestsByType)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

## 🎯 Key Findings

${summary.instructions.map((inst, i) => `### ${i + 1}. ${inst.type}
${inst.url ? `**URL**: ${inst.url}` : ''}
${inst.urls ? `**URLs**: ${inst.urls.join(', ')}` : ''}
**Note**: ${inst.note}
`).join('\n')}

## 🛠️ Next Steps

1. Review the full capture JSON file for detailed request/response data
2. Test the identified API endpoints directly
3. Check authentication requirements
4. Verify payload structure

---
*Generated by RefineForever Network Capture Tool*
`;
  }
}

// Run the capture
(async () => {
  const capturer = new RefineForeverCapture();
  await capturer.captureNetworkTraffic();
})();
