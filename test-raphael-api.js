/**
 * Raphael AI - Comprehensive API Testing Suite
 * 
 * Tests all potential endpoints and methods
 * to understand the complete API structure.
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class RaphaelAPITester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || 'https://api.raphael.app/v1';
    this.results = [];
    this.authToken = null;
  }

  async testEndpoint(method, endpoint, description, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`   ${method} ${url}`);
    
    const config = {
      method: method.toLowerCase(),
      url: url,
      timeout: options.timeout || 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
        ...options.headers
      }
    };

    if (options.data) {
      config.data = options.data;
      if (options.data instanceof FormData) {
        config.headers = {
          ...config.headers,
          ...options.data.getHeaders()
        };
      }
    }

    try {
      const response = await axios(config);
      
      console.log(`✅ Status: ${response.status}`);
      console.log(`⏱️  Time: ${response.headers['x-response-time'] || 'N/A'}`);
      
      // Log relevant headers
      const importantHeaders = ['content-type', 'x-ratelimit-remaining', 'x-credits-remaining'];
      importantHeaders.forEach(header => {
        if (response.headers[header]) {
          console.log(`📋 ${header}: ${response.headers[header]}`);
        }
      });

      // Log response body (truncated)
      if (response.data) {
        const bodyStr = JSON.stringify(response.data);
        console.log(`📦 Response: ${bodyStr.substring(0, 300)}${bodyStr.length > 300 ? '...' : ''}`);
      }

      this.results.push({
        endpoint,
        method,
        status: response.status,
        success: true,
        responseTime: response.headers['x-response-time'],
        data: response.data
      });

      return response.data;
    } catch (error) {
      const status = error.response?.status || 'N/A';
      const message = error.response?.data || error.message;
      
      console.log(`❌ Status: ${status}`);
      console.log(`💥 Error: ${JSON.stringify(message).substring(0, 200)}`);

      this.results.push({
        endpoint,
        method,
        status,
        success: false,
        error: message
      });

      return null;
    }
  }

  async discoverEndpoints() {
    console.log('\n🚀 Starting API Discovery...\n');
    console.log(`Base URL: ${this.baseUrl}`);
    console.log('='.repeat(60));

    // Test common endpoints
    const endpoints = [
      // Health & Status
      { method: 'GET', path: '/health', desc: 'Health check' },
      { method: 'GET', path: '/status', desc: 'API status' },
      { method: 'GET', path: '/ping', desc: 'Ping endpoint' },
      
      // Authentication
      { method: 'POST', path: '/auth/login', desc: 'User login' },
      { method: 'POST', path: '/auth/register', desc: 'User registration' },
      { method: 'POST', path: '/auth/refresh', desc: 'Refresh token' },
      { method: 'GET', path: '/auth/me', desc: 'Current user' },
      
      // Credits & Billing
      { method: 'GET', path: '/credits', desc: 'Get credit balance' },
      { method: 'GET', path: '/billing/plans', desc: 'Available plans' },
      { method: 'GET', path: '/usage', desc: 'Usage statistics' },
      
      // Image Upload
      { method: 'POST', path: '/upload', desc: 'Upload image' },
      { method: 'POST', path: '/images/upload', desc: 'Upload image (alt)' },
      { method: 'POST', path: '/v1/upload', desc: 'Upload v1' },
      
      // Image Editing
      { method: 'POST', path: '/edit', desc: 'Edit image' },
      { method: 'POST', path: '/generate', desc: 'Generate edit' },
      { method: 'POST', path: '/transform', desc: 'Transform image' },
      { method: 'POST', path: '/process', desc: 'Process image' },
      { method: 'POST', path: '/enhance', desc: 'Enhance image' },
      
      // Task Management
      { method: 'GET', path: '/tasks', desc: 'List tasks' },
      { method: 'GET', path: '/result/:id', desc: 'Get result by ID' },
      { method: 'GET', path: '/status/:id', desc: 'Check task status' },
      
      // User Data
      { method: 'GET', path: '/history', desc: 'Edit history' },
      { method: 'GET', path: '/gallery', desc: 'User gallery' },
      { method: 'DELETE', path: '/images/:id', desc: 'Delete image' }
    ];

    for (const ep of endpoints) {
      await this.testEndpoint(ep.method, ep.path, ep.desc);
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
    }
  }

  async testWithRealImage(imagePath) {
    console.log('\n\n🎨 Testing with Real Image...\n');
    console.log(`Image: ${imagePath}`);
    console.log('='.repeat(60));

    if (!fs.existsSync(imagePath)) {
      console.error(`❌ Image not found: ${imagePath}`);
      return;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const fileName = path.basename(imagePath);

    // Test upload with different formats
    console.log('\n📤 Testing Upload Endpoints...\n');

    // Format 1: Multipart form data
    const form1 = new FormData();
    form1.append('file', imageBuffer, fileName);
    form1.append('type', 'image');

    await this.testEndpoint('POST', '/upload', 'Upload (multipart)', {
      data: form1
    });

    // Format 2: Base64 encoded
    const base64Image = imageBuffer.toString('base64');
    await this.testEndpoint('POST', '/upload', 'Upload (base64)', {
      data: {
        image: base64Image,
        filename: fileName
      },
      headers: { 'Content-Type': 'application/json' }
    });

    // Format 3: Binary data
    await this.testEndpoint('POST', '/upload', 'Upload (binary)', {
      data: imageBuffer,
      headers: { 
        'Content-Type': 'image/jpeg',
        'Content-Length': imageBuffer.length
      }
    });
  }

  async testEditOperations(imageId, prompt) {
    console.log('\n\n✏️  Testing Edit Operations...\n');
    console.log(`Image ID: ${imageId}`);
    console.log(`Prompt: ${prompt}`);
    console.log('='.repeat(60));

    const editTests = [
      {
        mode: 'standard',
        credits: 2,
        payload: {
          image_id: imageId,
          prompt: prompt,
          mode: 'standard',
          credits: 2
        }
      },
      {
        mode: 'pro',
        credits: 12,
        payload: {
          image_id: imageId,
          prompt: prompt,
          mode: 'pro',
          quality: 'high',
          credits: 12
        }
      },
      {
        mode: 'max',
        credits: 24,
        payload: {
          image_id: imageId,
          prompt: prompt,
          mode: 'max',
          quality: 'maximum',
          credits: 24
        }
      }
    ];

    for (const test of editTests) {
      console.log(`\nTesting ${test.mode} mode...`);
      await this.testEndpoint('POST', '/edit', `Edit (${test.mode})`, {
        data: test.payload,
        headers: { 'Content-Type': 'application/json' }
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async testAuthentication(email, password) {
    console.log('\n\n🔐 Testing Authentication...\n');
    console.log('='.repeat(60));

    // Try login
    const loginResult = await this.testEndpoint('POST', '/auth/login', 'User Login', {
      data: { email, password },
      headers: { 'Content-Type': 'application/json' }
    });

    if (loginResult && loginResult.token) {
      this.authToken = loginResult.token;
      console.log('\n✅ Authenticated successfully!');
      console.log(`Token: ${this.authToken.substring(0, 50)}...`);

      // Test authenticated endpoints
      await this.testEndpoint('GET', '/auth/me', 'Get Current User');
      await this.testEndpoint('GET', '/credits', 'Get Credits');
    }
  }

  generateReport() {
    const timestamp = Date.now();
    const reportDir = './raphael_test_reports';
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportFile = path.join(reportDir, `api_test_report_${timestamp}.json`);
    const summaryFile = path.join(reportDir, `api_test_summary_${timestamp}.md`);

    // Save full report
    fs.writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Full report saved to: ${reportFile}`);

    // Generate summary
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const total = this.results.length;

    let summary = `# Raphael AI API Test Summary\n\n`;
    summary += `**Test Date**: ${new Date().toISOString()}\n`;
    summary += `**Base URL**: ${this.baseUrl}\n\n`;
    summary += `## Results Overview\n\n`;
    summary += `- ✅ Successful: ${successful}\n`;
    summary += `- ❌ Failed: ${failed}\n`;
    summary += `- 📊 Total: ${total}\n`;
    summary += `- 📈 Success Rate: ${((successful / total) * 100).toFixed(1)}%\n\n`;

    summary += `## Working Endpoints\n\n`;
    this.results.filter(r => r.success).forEach(r => {
      summary += `- **${r.method}** \`${r.endpoint}\` (Status: ${r.status})\n`;
    });

    summary += `\n## Failed Endpoints\n\n`;
    this.results.filter(r => !r.success).forEach(r => {
      summary += `- **${r.method}** \`${r.endpoint}\` (Status: ${r.status || 'N/A'})\n`;
      if (r.error) {
        summary += `  - Error: ${JSON.stringify(r.error).substring(0, 100)}...\n`;
      }
    });

    fs.writeFileSync(summaryFile, summary);
    console.log(`💾 Summary saved to: ${summaryFile}`);

    return { reportFile, summaryFile };
  }
}

// Main execution
async function main() {
  const tester = new RaphaelAPITester(process.env.RAPHAEL_API_URL);

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║     Raphael AI - Comprehensive API Tester       ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // Step 1: Discover endpoints
  await tester.discoverEndpoints();

  // Step 2: Test with real image (if provided)
  const testImage = process.argv[2] || './test-image.jpg';
  if (fs.existsSync(testImage)) {
    await tester.testWithRealImage(testImage);
  } else {
    console.log(`\n⚠️  Test image not found: ${testImage}`);
    console.log('   Skipping image upload tests.\n');
  }

  // Step 3: Generate report
  const { reportFile, summaryFile } = tester.generateReport();

  console.log('\n✅ Testing complete!');
  console.log(`\n📄 Review your results:`);
  console.log(`   - Full Report: ${reportFile}`);
  console.log(`   - Summary: ${summaryFile}`);
  console.log('\n💡 Tip: Check the summary for working endpoints!\n');
}

// Export for programmatic use
module.exports = RaphaelAPITester;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

/*
 * USAGE EXAMPLES:
 * 
 * 1. Basic discovery:
 *    node test-raphael-api.js
 * 
 * 2. With test image:
 *    node test-raphael-api.js ./my-photo.jpg
 * 
 * 3. Programmatic use:
 *    const RaphaelAPITester = require('./test-raphael-api');
 *    const tester = new RaphaelAPITester('https://api.raphael.app/v1');
 *    await tester.discoverEndpoints();
 *    const report = tester.generateReport();
 */
