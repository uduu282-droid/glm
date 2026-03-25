# HiFlux.xyz Reverse Engineering - Quick Reference

## 🚀 Quick Start Commands

### Run Comprehensive Analysis
```bash
node reverse_hiflux_comprehensive.js
```
Captures network traffic, page structure, and API endpoints.

### Capture Generation API (Requires Manual Interaction)
```bash
node capture_hiflux_generation_api.js
```
Opens browser for you to generate an image and capture the API call.

### Analyze JavaScript Bundles
```bash
node analyze_hiflux_bundles.js
```
Downloads and scans JS files for hardcoded endpoints.

---

## 📁 Output Folders

- `hiflux_complete_analysis/` - Main analysis results
- `hiflux_generation_api/` - Generation API captures
- `hiflux_analysis/` - Network/bundle analysis

---

## 🔑 Key Files

### Reports
- `HIFLUX_STATUS_REPORT.md` - Current progress and next steps
- `HIFLUX_REVERSE_ENGINEERING_GUIDE.md` - Complete guide
- `hiflux_complete_analysis/ANALYSIS_REPORT.md` - Initial findings

### Data
- `hiflux_complete_analysis/api_endpoints.txt` - Discovered endpoints
- `hiflux_complete_analysis/network_requests.json` - Request details
- `hiflux_complete_analysis/complete_analysis.json` - Full data dump

---

## 🎯 Discovered Endpoints (So Far)

```
GET  /api/auth/session          - Authentication check
POST /_vercel/insights/view     - Analytics
GET  /pricing                   - Pricing page
GET  /remove-background         - BG removal feature
GET  /remove-watermark          - Watermark removal
GET  /nano-banana               - Nano Banana model
GET  /nano-banana-apps          - Nano Banana apps
```

**Still Need**: Image generation endpoint (run capture script with manual interaction)

---

## 🔍 What to Look For

When running capture scripts, watch for:
- POST requests with prompt text in body
- Responses containing image URLs or base64 data
- Headers with authorization tokens
- Rate limit headers (X-RateLimit-*)

---

## 💻 Technology Summary

| Component | Technology |
|-----------|-----------|
| Framework | Next.js (RSC) |
| Auth | NextAuth |
| Hosting | Vercel |
| AI Model | FLUX.1 |
| Language | JavaScript/React |

---

## ⚡ Quick Test Commands

After capturing the generation endpoint:

```bash
# Test with curl (replace ENDPOINT with actual URL)
curl -X POST <ENDPOINT> \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'

# Or use the captured request format from network_requests.json
```

---

## 🐛 Troubleshooting

### Puppeteer won't launch
```bash
npm install puppeteer --save
```

### No API calls captured
- Increase wait times in script
- Manually interact with page when browser opens
- Check if site uses WebSockets instead

### Blocked by Cloudflare
- Site may require manual captcha first
- Try longer delays
- Use residential IP

---

## 📊 Current Status

✅ Phase 1: Discovery - COMPLETE  
🔄 Phase 2: Deep Analysis - IN PROGRESS  
⏳ Phase 3: Testing - PENDING  
⏳ Phase 4: Implementation - PENDING  

**Next Action**: Run `capture_hiflux_generation_api.js` and manually generate an image to capture the actual generation API endpoint.

---

*For detailed information, see HIFLUX_STATUS_REPORT.md*
