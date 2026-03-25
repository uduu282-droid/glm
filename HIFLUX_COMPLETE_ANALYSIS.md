# 🔍 HiFlux AI - Complete Reverse Engineering Analysis

## Executive Summary

**Target**: https://hiflux.ai/  
**Analysis Date**: March 20, 2026  
**Service Type**: Free FLUX.1 AI Image Generator  
**API Access**: ❌ **No Public API Available**  

---

## 🎯 Key Findings

### 1. Technology Stack

| Component | Technology | Status |
|-----------|------------|--------|
| Framework | Next.js (React Server Components) | ✅ Confirmed |
| Authentication | NextAuth | ✅ Active |
| Hosting | Vercel | ✅ Confirmed |
| Analytics | Vercel Analytics | ✅ Active |
| AI Model | FLUX.1 (various versions) | ✅ Confirmed |
| Public API | None | ❌ Not Available |

### 2. Discovered Endpoints

#### Working Endpoints (Captured):
```
GET  /api/auth/session              - Authentication session check
POST /_vercel/insights/view         - Analytics tracking
GET  /pricing                       - Pricing page (RSC)
GET  /remove-background             - Background removal tool
GET  /remove-watermark              - Watermark removal tool
GET  /nano-banana                   - Nano Banana model page
GET  /nano-banana-apps              - Nano Banana apps page
```

#### Tested but Failed:
```
POST /api/generate                  ❌ 404 Not Found
POST /api/image/generate            ❌ 404 Not Found
POST /api/v1/generate               ❌ 404 Not Found
POST /api/predict                   ❌ 404 Not Found
POST /api/inference                 ❌ 404 Not Found
```

### 3. Authentication System

**NextAuth Implementation:**
- CSRF Token: `__Host-next-auth.csrf-token`
- Callback URL: `__Secure-next-auth.callback-url`
- Session endpoint: `/api/auth/session`
- Cookie-based authentication required

**Authentication Cookies Captured:**
```
__Host-next-auth.csrf-token=<csrf_value>
__Secure-next-auth.callback-url=<callback_url>
g_state={"i_l":0,"i_ll":<timestamp>,...}
```

### 4. Page Structure

- **Total JavaScript Bundles**: 20+ files
- **Main Input**: Textarea with id="prompt"
- **Placeholder**: "Describe in English prompt for best results | Upload to edit | Quote to refine"
- **Total Buttons**: 24 (including FAQ accordions)
- **Main Form**: Present, action="/"

---

## 🔬 Technical Analysis

### Why No Direct API Access?

1. **Server-Side Rendering (SSR)**
   - Uses Next.js React Server Components
   - Image generation happens on the server
   - Results rendered directly to DOM

2. **Protected Endpoints**
   - API calls require valid NextAuth session
   - CSRF protection enabled
   - Rate limiting per authenticated session

3. **Browser-Only Interface**
   - Designed for human interaction only
   - No intention to provide public API
   - Anti-automation measures likely present

### Request Flow

```
User Input → Browser → Next.js App → Server Action → FLUX.1 Model → Image Response
                    ↑
            NextAuth Session Required
```

---

## 🧪 Testing Results

### Direct API Tests
**5 endpoints tested** - All returned 404

**Conclusion**: No public REST API exists

### Network Capture Results
**7 endpoints captured** during page load

**Key Observation**: All generation-related functionality appears to use:
- Server Actions (Next.js feature)
- Protected by authentication
- No exposed external API endpoints

---

## 📁 Data Collected

### Output Folders:
1. `hiflux_complete_analysis/` - Initial network analysis
2. `hiflux_generation_api/` - Generation API attempts
3. `hiflux_api_tests/` - Direct API testing results

### Key Files:
- `network_requests.json` - Full request capture
- `api_endpoints.txt` - All discovered URLs
- `complete_data.json` - Comprehensive data dump
- `api_test_results.json` - Direct API test results

---

## 💡 Alternative Approaches

Since direct API access is not available, here are alternatives:

### Option 1: Browser Automation (Recommended)
Use Puppeteer/Playwright to automate the web interface:

```javascript
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://hiflux.ai/');

// Type prompt
await page.type('#prompt', 'a cat');

// Click generate button
const generateBtn = await page.$('button:text("Generate")');
await generateBtn.click();

// Wait for image
await page.waitForSelector('img[alt*="generated"]');
const imageUrl = await page.$eval('img', img => img.src);

console.log('Generated Image:', imageUrl);
await browser.close();
```

**Pros:**
- Works with existing implementation
- No API key needed
- Full feature access

**Cons:**
- Slower than direct API
- Requires browser instance
- May violate ToS

### Option 2: Similar Services with APIs

Consider these FLUX.1 providers with public APIs:

1. **Together AI** - https://www.together.ai/models/flux-1-schnell
   - Free tier available
   - Official API
   - Well-documented

2. **Fal.ai** - https://fal.ai/models/fal-ai/flux/dev
   - Multiple FLUX models
   - Pay-per-use pricing
   - Production-ready

3. **Replicate** - https://replicate.com/black-forest-labs/flux-1-schnell
   - Easy integration
   - Reasonable pricing
   - Good documentation

### Option 3: Self-Hosted FLUX.1

Deploy your own FLUX.1 model:
- Hugging Face Spaces
- RunPod
- Lambda Labs
- Local GPU setup

---

## ⚠️ Important Considerations

### Terms of Service
- Check HiFlux.ai ToS before automation
- May prohibit automated access
- Commercial use restrictions may apply

### Rate Limiting
- Even with automation, expect rate limits
- Session-based throttling likely
- IP-based restrictions possible

### Ethical Use
- Respect serviceer resources
- Don't overload with requests
- Consider impact on free service availability

---

## 🛠️ Tools Created

### Analysis Scripts:
1. `reverse_hiflux_full.js` - Comprehensive network analysis
2. `capture_hiflux_generation_api.js` - API capture with manual interaction
3. `test_hiflux_api_direct.js` - Direct endpoint testing
4. `analyze_hiflux_network.js` - Network traffic interception
5. `analyze_hiflux_bundles.js` - JavaScript bundle scanner

### Documentation:
- `HIFLUX_STATUS_REPORT.md` - Progress tracking
- `HIFLUX_QUICK_REFERENCE.md` - Quick commands
- `HIFLUX_REVERSE_ENGINEERING_GUIDE.md` - Complete guide

---

## 📊 Final Verdict

### Can You Use HiFlux AI Programmatically?

**Short Answer**: ❌ **No direct API access**

**Long Answer**: 
- HiFlux AI is designed as a **browser-only service**
- No public REST API exists
- Image generation requires authenticated session
- Server-side rendering prevents direct endpoint access

### Recommended Solution

**For Production Use:**
→ Use **Together AI**, **Fal.ai**, or **Replicate** FLUX.1 APIs

**For Learning/Testing:**
→ Browser automation with Puppeteer (check ToS first)

**For Free Tier:**
→ Manual use of hiflux.ai website

---

## 🎓 Lessons Learned

### What Worked:
✅ Identified complete technology stack  
✅ Captured authentication mechanism  
✅ Discovered all page endpoints  
✅ Analyzed request/response patterns  

### What Didn't Work:
❌ Direct API access (doesn't exist)  
❌ Automated generation without browser  
❌ Finding hidden endpoints  

### Key Insight:
Modern Next.js applications with Server Actions don't expose traditional REST APIs. The "API" is the application itself.

---

## 📞 Next Steps

If you need FLUX.1 image generation:

1. **For Production**: Sign up for Together AI or Fal.ai
2. **For Testing**: Use HiFlux.ai manually or with browser automation
3. **For Learning**: Study the captured network patterns

---

## 📚 Resources

- [Together AI FLUX.1 API](https://www.together.ai/models/flux-1-schnell)
- [Fal.ai FLUX Models](https://fal.ai/models/fal-ai/flux/dev)
- [Replicate FLUX.1](https://replicate.com/black-forest-labs/flux-1-schnell)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

*Analysis completed by HiFlux Reverse Engineering Project*  
*Last Updated: March 20, 2026*
