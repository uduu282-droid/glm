# HiFlux.xyz Reverse Engineering - Quick Start Guide

## 🎯 Objective
Reverse-engineer the https://www.hiflux.xyz/ AI image generation website to discover and document its API endpoints.

## 📋 Prerequisites
- Node.js installed (v16+)
- Puppeteer already installed ✓
- Chrome/Chromium browser

## 🚀 Quick Start

### Option 1: Comprehensive Analysis (Recommended)
This will capture network requests, analyze page structure, and identify API endpoints.

```bash
node reverse_hiflux_comprehensive.js
```

**What it does:**
- ✅ Opens the website in a real browser
- ✅ Captures all API calls (XHR/fetch requests)
- ✅ Identifies potential image generation endpoints
- ✅ Analyzes response formats
- ✅ Saves detailed reports

**Duration:** ~2-3 minutes

---

### Option 2: Network Traffic Only
Faster, focuses only on capturing network requests.

```bash
node analyze_hiflux_network.js
```

**What it does:**
- ✅ Intercepts all network traffic
- ✅ Filters for API endpoints
- ✅ Captures request/response data
- ✅ Saves to `hiflux_analysis/` folder

**Duration:** ~1-2 minutes

---

### Option 3: Bundle Analysis Only
Downloads and analyzes JavaScript bundles to find hardcoded endpoints.

```bash
node analyze_hiflux_bundles.js
```

**What it does:**
- ✅ Downloads JS bundles from the site
- ✅ Scans for API URL patterns
- ✅ Extracts endpoint configurations
- ✅ Saves findings to `hiflux_analysis/` folder

**Duration:** ~2 minutes

---

## 📁 Output Files

After running any analysis, you'll find:

### From Comprehensive Analysis:
- `hiflux_complete_analysis/api_endpoints.txt` - Discovered API URLs
- `hiflux_complete_analysis/network_requests.json` - Full request details
- `hiflux_complete_analysis/ANALYSIS_REPORT.md` - Detailed findings
- `hiflux_complete_analysis/complete_analysis.json` - Complete data dump

### From Network Analysis:
- `hiflux_analysis/captured_requests.json` - Request data
- `hiflux_analysis/api_endpoints.txt` - Unique endpoints
- `hiflux_analysis/page_source.html` - Page HTML

### From Bundle Analysis:
- `hiflux_analysis/bundles/` - Downloaded JS files
- `hiflux_analysis/bundle_findings.txt` - Extracted endpoints

---

## 🔍 What We're Looking For

### Key Indicators:
1. **API Endpoints** containing:
   - `/api/generate`
   - `/api/image`
   - `/api/create`
   - `/api/predict`
   - `/api/inference`

2. **Request Format**:
   - POST requests with prompt data
   - Headers (Authorization, Content-Type)
   - Request body structure

3. **Response Format**:
   - JSON with image URLs
   - Base64 encoded images
   - Generation task IDs

---

## 🛠️ Next Steps After Discovery

Once you have the API endpoints:

1. **Test Direct Access**
   ```bash
   # Use curl or create test script
   curl -X POST <endpoint> -H "Content-Type: application/json" -d '{"prompt":"test"}'
   ```

2. **Analyze Authentication**
   - Check if API keys are required
   - Look for session tokens
   - Identify rate limiting

3. **Create Wrapper/Proxy**
   - Implement discovered endpoint
   - Handle authentication
   - Add error handling

4. **Document Findings**
   - Endpoint URL
   - Required headers
   - Request format
   - Response format
   - Rate limits

---

## ⚠️ Important Notes

### Ethical Considerations:
- ✅ Use for learning and research
- ✅ Respect terms of service
- ✅ Don't overload their servers
- ⚠️ Check if API access is allowed
- ⚠️ Be aware of rate limits

### Potential Challenges:
- Cloudflare bot protection
- Rate limiting per IP
- Session-based authentication
- CORS restrictions
- JavaScript challenge-response

---

## 🐛 Troubleshooting

### If Puppeteer fails to launch:
```bash
# Install Chromium dependencies (Windows should be fine)
npm install puppeteer --save
```

### If no requests are captured:
- Increase wait times in the script
- Try interacting with the page manually when browser opens
- Check if site uses WebSocket instead of HTTP

### If blocked by Cloudflare:
- The site may require manual interaction first
- Try accessing from a different IP
- Use longer delays between actions

---

## 📊 Expected Results

After running the comprehensive analysis, you should see:

```
🚀 Starting Comprehensive HiFlux.xyz Reverse Engineering

🌐 Loading https://www.hiflux.xyz/...

📡 [POST] https://www.hiflux.xyz/api/generate
✅ API Response from https://www.hiflux.xyz/api/generate...
   Status: 200, Type: application/json
   Response keys: success, imageUrl, id
   ⭐ POTENTIAL IMAGE GENERATION API!

📊 Extracting page structure...
Found:
   - 15 JavaScript files
   - 2 forms
   - 8 input fields
   - 12 buttons

✅ Analysis Complete!

📊 FINAL SUMMARY:
   Network Requests Captured: 25
   Unique API Endpoints: 3
   JavaScript Files: 15
   Forms Found: 2
   Buttons Found: 12

⭐ DISCOVERED API ENDPOINTS:

   → https://www.hiflux.xyz/api/generate
   → https://www.hiflux.xyz/api/image
   → https://www.hiflux.xyz/api/styles
```

---

## 🎓 Learning Resources

Based on your existing projects, you have experience with:
- API reverse-engineering ✓
- Puppeteer automation ✓
- Network request interception ✓
- Bundle analysis ✓

This follows the same pattern as your previous work with TAAFT, VEO AI, and other image generation APIs.

---

## 📞 Ready to Start?

Run the comprehensive analysis:
```bash
node reverse_hiflux_comprehensive.js
```

Watch the browser open and interact with the site. The script will automatically capture all API calls and save detailed results.

Good luck! 🚀
