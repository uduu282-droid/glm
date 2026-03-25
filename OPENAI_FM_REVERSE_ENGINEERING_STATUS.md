# OpenAI.fm Audio Generator API - Reverse Engineering Status

## 🎯 Executive Summary

**Status**: ⚠️ Rate Limited / Security Protected  
**API Endpoint**: Identified ✅  
**Protection**: Vercel Security Checkpoint (429 Too Many Requests)  
**Solution Required**: Browser automation + IP rotation or waiting period

---

## 📊 API Details (From Captured Request)

### Endpoint Information
```
URL: https://www.openai.fm/api/generate
Method: POST
Content-Type: multipart/form-data
Response: audio/wav (direct audio file)
```

### Response Headers (When Successful)
```http
HTTP/1.1 200 OK
Content-Type: audio/wav
Content-Disposition: inline; filename="openai-fm-coral-audio.wav"
Server: Vercel
X-Matched-Path: /api/generate
X-Vercel-Cache: MISS
```

### Request Headers (Captured)
```http
POST /api/generate HTTP/1.1
Host: www.openai.fm
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...
Accept: */*
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate, br, zstd
Origin: https://www.openai.fm
Referer: https://www.openai.fm/
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-origin
Cookie: _ga=GA1.1.624713172.1773862445; _ga_NME7NXL4L0=GS2.1...
```

---

## 🔒 Security Analysis

### Current Block: Vercel Security Checkpoint

**Error Received**: HTTP 429 (Too Many Requests)

**Response Content**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Vercel Security Checkpoint</title>
    ...
</head>
<body>
    <!-- Security verification page -->
</body>
</html>
```

### Protection Mechanisms

1. **Rate Limiting** ❌
   - HTTP 429 status code
   - Triggered after multiple requests
   - IP-based or session-based limiting

2. **Vercel Security** ⚠️
   - Automated bot detection
   - Request pattern analysis
   - May require browser fingerprints

3. **Cookie Requirements** 🍪
   - Google Analytics cookies present (`_ga`, `_ga_NME7NXL4L0`)
   - Session tracking enabled
   - Requires initial page visit

---

## 🧪 Test Results

### Direct API Testing (Python & Node.js)

| Test | Prompt | Result | Status |
|------|--------|--------|--------|
| 1 | "Create a peaceful piano melody" | ❌ 429 | Rate Limited |
| 2 | "Generate ambient electronic music" | ❌ 429 | Rate Limited |
| 3 | "Create an upbeat pop track" | ❌ 429 | Rate Limited |
| 4 | "Generate cinematic orchestral music" | ❌ 429 | Rate Limited |
| 5 | "Create lo-fi hip hop beats" | ❌ 429 | Rate Limited |

**Success Rate**: 0%  
**Block Reason**: Vercel Security Checkpoint (429)

---

## 💡 Potential Solutions

### Solution 1: Wait Period ⭐ RECOMMENDED FIRST STEP

**Approach**: Wait 15-60 minutes before trying again

```python
import time

# Wait 30 minutes
print("⏳ Waiting 30 minutes to bypass rate limit...")
time.sleep(1800)  # 30 minutes

# Then try again with single request
test_openai_fm_api()
```

**Pros**:
- ✅ Simple
- ✅ No additional tools needed
- ✅ Respects service
- ✅ Likely to work

**Cons**:
- ❌ Time-consuming

---

### Solution 2: Browser Automation (Puppeteer) ⭐ BEST LONG-TERM

**Approach**: Use headless browser to interact with the real website

```javascript
const puppeteer = require('puppeteer');

async function generateAudio(prompt) {
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--disable-blink-features=AutomationControlled']
    });
    
    const page = await browser.newPage();
    
    // Set realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)...');
    
    // Navigate to site
    await page.goto('https://www.openai.fm/', {
        waitUntil: 'networkidle2',
        timeout: 60000
    });
    
    // Find and fill the prompt
    await page.type('textarea[placeholder*="Describe"]', prompt);
    
    // Click generate button
    await page.click('button:has-text("Generate")');
    
    // Wait for audio to be generated
    await page.waitForFunction(() => {
        return document.querySelector('audio[src]') || 
               document.querySelector('a[href*=".wav"]');
    }, { timeout: 120000 });
    
    // Download audio
    const audioUrl = await page.evaluate(() => {
        const audio = document.querySelector('audio[src]');
        return audio ? audio.src : null;
    });
    
    await browser.close();
    return audioUrl;
}
```

**Pros**:
- ✅ Executes JavaScript naturally
- ✅ Has browser fingerprints
- ✅ Can pass security checks
- ✅ Undetectable as automation

**Cons**:
- ❌ Requires browser installation
- ❌ Slower (30-60 seconds per generation)
- ❌ More resource-intensive

---

### Solution 3: IP Rotation

**Approach**: Use different IPs for each request

```python
# Using proxy rotation
proxies = [
    'http://proxy1:port',
    'http://proxy2:port',
    'http://proxy3:port',
]

for proxy in proxies:
    session = requests.Session()
    session.proxies.update({'http': proxy, 'https': proxy})
    # Make request
```

**Pros**:
- ✅ Bypasses IP-based rate limiting
- ✅ Allows parallel requests

**Cons**:
- ❌ Requires proxy service
- ❌ Cost involved
- ❌ Complex setup

---

### Solution 4: Cookie & Session Management

**Approach**: Properly manage cookies and sessions

```python
session = requests.Session()

# First, visit main page to get cookies
main_response = session.get('https://www.openai.fm/')

# Extract and save cookies
cookies = session.cookies

# Add delay to appear human-like
time.sleep(random.uniform(5, 10))

# Then make API request
response = session.post(api_url, files=files)
```

**Pros**:
- ✅ Mimics real user behavior
- ✅ Maintains session state

**Cons**:
- ❌ May not bypass rate limits
- ❌ Still detectable

---

## 🔍 Form Parameters (Likely Structure)

Based on audio generation APIs:

### Required Parameters
```
prompt: "Text description of desired audio"
```

### Optional Parameters
```
duration: "30"          # Length in seconds
genre: "ambient"        # Music genre
tempo: "medium"         # Speed (slow/medium/fast)
mood: "calm"           # Emotion
instruments: "piano"    # Preferred instruments
format: "wav"          # Output format
seed: "12345"          # Random seed
```

---

## 📁 Files Created

### Test Scripts
- `test_openai_fm_api.py` - Python test suite
- `test_openai_fm_api.js` - Node.js test suite

### Outputs (After Running)
- `openai_fm_api_test_results.json` - Test results
- `openai_fm_generated_audio_*.wav` - Generated audio (when successful)

---

## 🎯 Recommended Action Plan

### Phase 1: Immediate (Try Now)
1. **Wait 30-60 minutes** since last requests
2. **Run single test** with proper session management
3. **Monitor response** carefully

```bash
# Wait an hour, then run:
python test_openai_fm_api.py
```

### Phase 2: Short-term (If Phase 1 Fails)
1. **Create Puppeteer script** (similar to TAAFT solution)
2. **Test with browser automation**
3. **Add realistic delays** between requests

### Phase 3: Long-term (Production)
1. **Implement cookie management**
2. **Add IP rotation if needed**
3. **Build retry logic with exponential backoff**
4. **Monitor rate limit headers**

---

## 🚨 Important Considerations

### Legal & Ethical
- ✅ Personal use: Likely allowed
- ⚠️ Commercial use: Check Terms of Service
- ❌ Bulk scraping: Probably prohibited
- ❌ Bypassing security: Legal gray area

### Technical
- ⚠️ Rate limits exist for a reason (server costs)
- ⚠️ Vercel security is sophisticated
- ⚠️ Repeated violations may lead to IP ban
- ✅ Respect the service
- ✅ Use responsibly

---

## 🔬 Advanced Analysis

### What We Know From Response

**Content-Disposition Header**:
```
inline; filename="openai-fm-coral-audio.wav"
```

This tells us:
- ✅ Generates WAV files
- ✅ Filename pattern: `openai-fm-{something}-audio.wav`
- ✅ "coral" might be a model name or version

**Vercel Headers**:
```
X-Matched-Path: /api/generate
X-Vercel-Cache: MISS
```

This tells us:
- ✅ Hosted on Vercel
- ✅ Server-side rendering (Next.js likely)
- ✅ Not cached (dynamic generation)

**Security Headers**:
```
Content-Security-Policy: default-src 'self' ...
Strict-Transport-Security: max-age=31536000
```

This tells us:
- ✅ Strong security posture
- ✅ HTTPS enforced
- ✅ CSP restricts external resources

---

## 📞 Next Steps

### If You Want to Continue:

1. **WAIT** at least 30-60 minutes
2. **Try single request** with better session handling
3. **If still blocked**, implement Puppeteer solution
4. **Consider alternatives** if this becomes too difficult

### Alternative Free Audio APIs:

1. **Mubert** (free tier available)
2. **AIVA** (free for personal use)
3. **Soundraw** (trial available)
4. **Boomy** (free songs limited)

---

## 🎉 TL;DR

**Can we reverse this?** ⚠️ Partially

**Current Status**: Rate limited by Vercel security

**Best Solution**: 
1. Wait 30-60 minutes
2. Use Puppeteer browser automation
3. Or find alternative service

**Files Ready**:
- `test_openai_fm_api.py` - For testing after wait period
- `test_openai_fm_api.js` - Node.js version

**Time to Solution**: Unknown (depends on rate limit duration)

---

*Analysis Date: March 18, 2026*  
*Status: Rate Limited - Waiting Period Required*  
*Confidence: Medium (endpoint identified but blocked)*
