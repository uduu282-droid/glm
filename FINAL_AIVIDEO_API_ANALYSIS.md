# 🎬 AIVideoGenerator.me - FINAL API Documentation & Analysis

## 🔍 Executive Summary

**Platform:** AIVideoGenerator.me  
**Status:** ⚠️ **REQUIRES EMAIL VERIFICATION + HC CAPTCHA**  
**API Quality:** ✅ Well-structured, professional API  
**Accessibility:** Limited - requires authenticated session with verified email

---

## 📊 Complete Endpoint Discovery

### 1. GET User Information
**Endpoint:** `GET /api/auth/user-info`  
**Base URL:** `https://api.aivideogenerator.me`  
**Status:** ✅ Working (returns compressed user data)

```javascript
GET https://api.aivideogenerator.me/api/auth/user-info
Headers: {
    Authorization: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
    uniqueid: 'bb09b988ce3c0247dff49dc8cd5a39d1'
}
```

---

### 2. POST Page Record List
**Endpoint:** `POST /aimodels/api/v1/ai/pageRecordList`  
**Base URL:** `https://platform.aivideogenerator.me`  
**Status:** ⚠️ Returns `"email is null"` error

**Request Payload:**
```json
{
    "page": 1,
    "pageSize": 10
}
```

**Error Response:**
```json
{
    "code": 400000,
    "message": "email is null",
    "data": null
}
```

**Solution:** Need to provide email in request or have email associated with account

---

### 3. POST Create Video
**Endpoint:** `POST /aimodels/api/v1/ai/video/create`  
**Status:** ⚠️ Returns `"HC verification is required"`

**Required Parameters:**
- `prompt`: Video description
- `channel`: `GROK_IMAGINE`
- `pageId`: Valid page ID (from pageRecordList)

**Optional Parameters:**
- `style`: Art style
- `negative_prompt`: What to exclude
- `model_version`, `duration`, `resolution`

---

## 🔐 Authentication Requirements

### JWT Token Structure
```javascript
const authConfig = {
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJhaXZpZGVvZ2VuZXJhdG9yLXVzZXItOTc5NzE5Iiwicm5TdHIiOiIzTDVNWEMwSUtPRm5temV5VFNWMDByaE9jUlNMd1NqdyJ9.Yz62KNRtivXfJSmNmKeGctQLrZ9vl6M7c3Ta7nlnFFk',
    userId: 'aivideogenerator-user-979719',
    rnStr: '3L5MXC0IKOFnmzeyTSV00rhOcRSLwSjw'
};
```

### Device Fingerprinting
```javascript
const deviceIds = {
    primary: '865ead8054fa643f5ae01dcd613ba1ad',  // Main device ID
    secondary: 'bb09b988ce3c0247dff49dc8cd5a39d1'  // Auth endpoint ID
};
```

---

## ⚠️ Current Blockers

### Blocker 1: Email Verification Required
**Error:** `"email is null"` from pageRecordList endpoint

**Cause:** 
- API requires email address in request
- Or email must be associated with the JWT token
- Likely need to register/login with email first

**Solution Path:**
```javascript
// Option 1: Include email in payload
const payload = {
    page: 1,
    pageSize: 10,
    email: 'user@example.com'  // Need valid email
};

// Option 2: Use authenticated session with verified email
// Login/register on website first
```

### Blocker 2: HC Verification Required
**Error Code:** `100002`  
**Message:** `"HC verification is required"`

**Cause:** hCaptcha or similar security challenge

**Solution Paths:**

#### A. Manual Approach (Recommended)
1. Visit `https://aivideogenerator.me`
2. Register/login with email
3. Complete any captcha challenges
4. Create a test video on the website
5. Monitor network requests to capture:
   - Verified session cookies
   - Valid pageId values
   - HC verification tokens

#### B. Browser Automation
```javascript
const puppeteer = require('puppeteer');

async function getVerifiedSession() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // Navigate to site
    await page.goto('https://aivideogenerator.me');
    
    // Wait for user to complete registration/captcha
    console.log('Complete registration and captcha manually...');
    
    // Get cookies after verification
    const cookies = await page.cookies();
    
    // Get localStorage data
    const authToken = await page.evaluate(() => 
        localStorage.getItem('token')
    );
    
    return { cookies, authToken };
}
```

#### C. Find Email Parameter
The email might be sent as:
- Request header: `X-User-Email`
- Query parameter: `?email=user@example.com`
- Payload field: `{ email: 'user@example.com' }`
- JWT token claim (already encoded)

---

## 🧪 Tested Approaches & Results

### Test 1: Direct Video Creation (No pageId)
```javascript
POST /aimodels/api/v1/ai/video/create
Payload: { prompt: 'Test', channel: 'GROK_IMAGINE' }
Result: ❌ "HC verification is required"
```

### Test 2: With Empty pageId
```javascript
Payload: { prompt: 'Test', channel: 'GROK_IMAGINE', pageId: '' }
Result: ❌ "HC verification is required"
```

### Test 3: Get Page Records
```javascript
POST /aimodels/api/v1/ai/pageRecordList
Payload: { page: 1, pageSize: 10 }
Result: ❌ "email is null"
```

### Test 4: Different Device IDs
```javascript
Device ID 1: 865ead8054fa643f5ae01dcd613ba1ad
Device ID 2: bb09b988ce3c0247dff49dc8cd5a39d1
Result: ✅ Both work for different endpoints
```

---

## 📋 Complete API Configuration

### Headers (All Requests)
```javascript
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Authorization': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
    'Origin': 'https://aivideogenerator.me',
    'Referer': 'https://aivideogenerator.me/',
    'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'priority': 'u=1, i',
    'uniqueid': '865ead8054fa643f5ae01dcd613ba1ad'
};
```

### Platform URLs
```javascript
const PLATFORM = {
    platform: 'https://platform.aivideogenerator.me',  // Main API
    api: 'https://api.aivideogenerator.me',            // Auth API
    origin: 'https://aivideogenerator.me'               // Web origin
};
```

---

## 🎯 Step-by-Step Solution Guide

### Phase 1: Email Registration
1. **Visit Website:**
   - Go to `https://aivideogenerator.me`
   
2. **Register Account:**
   - Click "Sign Up" or "Register"
   - Provide valid email address
   - Complete email verification if required

3. **Login:**
   - Login with credentials
   - Ensure JWT token is updated in browser

### Phase 2: Capture Required Data
1. **Open DevTools:**
   - Press F12 in browser
   - Go to Network tab

2. **Create Test Video:**
   - Use the website's interface
   - Fill in prompt and settings
   - Click "Generate" or "Create"

3. **Monitor Requests:**
   - Look for `/video/create` request
   - Check request headers for:
     - Updated Authorization token
     - Session cookies
     - Any new headers
   - Check request payload for:
     - `pageId` value
     - `email` field
     - Any verification tokens

4. **Copy as cURL:**
   - Right-click the request
   - Select "Copy" → "Copy as cURL"
   - This gives you exact headers and payload

### Phase 3: Use Captured Data
```javascript
// Replace with your captured values
const YOUR_CONFIG = {
    authToken: '<YOUR_CAPTURED_TOKEN>',
    pageId: '<YOUR_CAPTURED_PAGE_ID>',
    sessionId: '<YOUR_SESSION_COOKIE>',
    email: '<YOUR_REGISTERED_EMAIL>'
};

// Now use in requests
const response = await axios.post(
    'https://platform.aivideogenerator.me/aimodels/api/v1/ai/video/create',
    {
        prompt: 'Your prompt here',
        channel: 'GROK_IMAGINE',
        pageId: YOUR_CONFIG.pageId,
        email: YOUR_CONFIG.email
    },
    {
        headers: {
            ...HEADERS,
            'Authorization': YOUR_CONFIG.authToken,
            'Cookie': `JSESSIONID=${YOUR_CONFIG.sessionId}`
        }
    }
);
```

---

## 🔧 Alternative Solutions

### Solution 1: Use TattooIdea.ai Instead
- Similar API structure
- Only requires HC verification (no email)
- Might be easier to bypass

### Solution 2: Implement Full Browser Flow
```javascript
const puppeteer = require('puppeteer');

async function createVideoAutomated() {
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--disable-blink-features=AutomationControlled']
    });
    
    const page = await browser.newPage();
    
    // 1. Visit site
    await page.goto('https://aivideogenerator.me');
    
    // 2. User completes login/captcha manually
    console.log('Please login and complete captcha...');
    await page.waitForSelector('.video-generator'); // Wait for logged-in state
    
    // 3. Create video through UI
    await page.type('[name="prompt"]', 'A beautiful sunset');
    await page.click('.generate-button');
    
    // 4. Monitor for completion
    await page.waitForResponse(r => r.url().includes('/video/create'));
    
    // 5. Extract result
    const videoUrl = await page.$eval('.video-result', el => el.src);
    console.log('Video created:', videoUrl);
    
    await browser.close();
}
```

### Solution 3: Reverse Engineer Further
Look for these in browser storage:
```javascript
// In browser console:
console.log('LocalStorage:', localStorage);
console.log('SessionStorage:', sessionStorage);
console.log('Cookies:', document.cookie);

// Look for:
// - userEmail
// - user_email  
// - verified_email
// - hc_token
// - captcha_token
```

---

## 📊 Error Code Reference

| Code | Message | Meaning | Solution |
|------|---------|---------|----------|
| 200 | Success | Request completed | ✅ All good |
| 400000 | email is null | Missing email parameter | Add email to request or account |
| 100002 | HC verification required | Captcha needed | Complete hCaptcha challenge |
| 401 | Unauthorized | Invalid/expired token | Refresh token or re-login |
| 404 | Not Found | Invalid endpoint | Check URL |
| 429 | Too Many Requests | Rate limited | Wait and retry |

---

## 💡 Pro Tips

### 1. Decompress Responses
Axios handles this automatically, but for manual decompression:
```javascript
const zlib = require('zlib');
const decompressed = zlib.brotliDecompressSync(compressedBuffer);
```

### 2. Extract Clean JSON
```javascript
function cleanResponse(dirtyString) {
    // Remove control characters
    const clean = dirtyString.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    return JSON.parse(clean);
}
```

### 3. Monitor All Endpoints
```javascript
// In browser DevTools Console:
performance.getEntriesByType('resource').forEach(entry => {
    if (entry.name.includes('aivideogenerator')) {
        console.log('API Call:', entry.name);
    }
});
```

---

## 🎯 Final Recommendations

**Best Approach:**
1. ✅ Register on the website with a real email
2. ✅ Complete one video generation manually
3. ✅ Capture all request parameters from DevTools
4. ✅ Use those exact parameters in your code

**Why This Works:**
- You'll have a verified email in the system
- Your session will have completed HC verification
- You'll get valid pageId values
- You can see the exact API format used

**Alternative:**
If you just need AI video generation, consider:
- **Runway ML** - Professional AI video tools
- **Stable Diffusion Video** - Open source alternative
- **Deforum** - Free Google Colab notebooks
- **Pika Labs** - Free tier available

---

**Last Updated:** March 5, 2026  
**Status:** Documented but requires email + captcha verification  
**Next Action:** Register on website and capture verified session data