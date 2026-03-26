import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Network Traffic Analyzer
 * Captures all API requests during login and extracts chat endpoints
 */
export class NetworkAnalyzer {
  constructor() {
    this.requests = [];
    this.responses = [];
    this.apiEndpoints = new Set();
  }

  /**
   * Launch browser with network monitoring enabled
   */
  async startMonitoring(browser) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 }
    });

    const page = await context.newPage();

    // Enable request interception
    await context.route('**/*', (route, request) => {
      // Capture all requests
      this.requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
        resourceType: request.resourceType(),
        timestamp: Date.now()
      });

      // Look for potential API endpoints
      if (this.isPotentialAPIEndpoint(request.url())) {
        console.log(`🔍 Found API request: ${request.url()}`);
        
        // Store endpoint details
        this.apiEndpoints.add({
          url: request.url(),
          method: request.method(),
          hasBody: !!request.postData()
        });
      }

      route.continue();
    });

    return { context, page };
  }

  /**
   * Check if URL looks like an API endpoint
   */
  isPotentialAPIEndpoint(url) {
    const apiPatterns = [
      /\/api\//i,
      /\/v\d+\//i,  // /v1/, /v2/, etc.
      /\/chat\//i,
      /\/conversation/i,
      /\/completion/i,
      /\/generate/i,
      /\/message/i,
      /graphql/i,
      /gql\//i
    ];

    // Skip static resources
    const skipPatterns = [
      /\.(png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)/i,
      /hotjar\.com/i,
      /google-analytics/i,
      /analytics/i,
      /cdn\./i
    ];

    // Check if should skip
    for (const pattern of skipPatterns) {
      if (pattern.test(url)) return false;
    }

    // Check if matches API patterns
    return apiPatterns.some(pattern => pattern.test(url));
  }

  /**
   * Analyze captured requests and find the best chat endpoint
   */
  async findBestChatEndpoint() {
    console.log('\n📊 Analyzing captured network traffic...\n');
    
    // Filter for POST/PUT requests (likely to be mutation operations)
    const mutationRequests = this.requests.filter(r => 
      ['POST', 'PUT'].includes(r.method) &&
      r.url.includes('/api/') || r.url.includes('/v')
    );

    console.log(`Found ${mutationRequests.length} potential API mutations\n`);

    // Score each endpoint based on likelihood it's the chat API
    const scoredEndpoints = mutationRequests.map(req => {
      let score = 0;
      const reasons = [];

      // URL patterns
      if (/chat|message|conversation|completion/i.test(req.url)) {
        score += 30;
        reasons.push('URL contains chat keywords');
      }

      // Has JSON body
      if (req.postData) {
        try {
          const body = JSON.parse(req.postData);
          
          // Check for common chat message patterns
          if (body.messages || body.prompt || body.input || body.content) {
            score += 40;
            reasons.push('Body contains message/prompt fields');
          }

          if (body.model || body.max_tokens || body.temperature) {
            score += 30;
            reasons.push('Body contains AI model parameters');
          }

          if (Array.isArray(body.messages) && body.messages.length > 0) {
            score += 50;
            reasons.push('Body has messages array (definitely chat API!)');
          }
        } catch (e) {
          // Not JSON or parse failed
        }
      }

      // Response analysis would need actual response data
      // For now, just score based on request

      return {
        url: req.url,
        method: req.method,
        score,
        reasons,
        hasBody: !!req.postData,
        bodyPreview: req.postData ? req.postData.substring(0, 200) : null
      };
    });

    // Sort by score
    scoredEndpoints.sort((a, b) => b.score - a.score);

    // Return top candidates
    return scoredEndpoints.slice(0, 5);
  }

  /**
   * Print all captured API endpoints
   */
  printCapturedEndpoints() {
    console.log('\n' + '='.repeat(60));
    console.log('📡 CAPTURED API ENDPOINTS:\n');

    const grouped = {};
    
    this.requests.forEach(req => {
      if (this.isPotentialAPIEndpoint(req.url)) {
        const domain = new URL(req.url).hostname;
        if (!grouped[domain]) grouped[domain] = [];
        
        grouped[domain].push({
          url: req.url,
          method: req.method,
          hasBody: !!req.postData
        });
      }
    });

    Object.keys(grouped).forEach(domain => {
      console.log(`\n🌐 ${domain}:`);
      
      const unique = [];
      const seen = new Set();
      
      grouped[domain].forEach(req => {
        if (!seen.has(req.url)) {
          seen.add(req.url);
          unique.push(req);
        }
      });

      unique.forEach((req, i) => {
        console.log(`   ${i + 1}. ${req.method.padEnd(6)} ${req.url}`);
        if (req.hasBody) {
          console.log(`      📦 Has request body`);
        }
      });
    });

    console.log('\n' + '='.repeat(60) + '\n');
  }

  /**
   * Save captured data to file
   */
  saveToFile(filePath) {
    const data = {
      timestamp: Date.now(),
      totalRequests: this.requests.length,
      apiEndpoints: Array.from(this.apiEndpoints),
      allRequests: this.requests,
      analyzedEndpoints: [] // Will be filled after analysis
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`💾 Network data saved to: ${filePath}\n`);
  }

  /**
   * Clear captured data
   */
  clear() {
    this.requests = [];
    this.responses = [];
    this.apiEndpoints.clear();
  }
}

export default NetworkAnalyzer;
