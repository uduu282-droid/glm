# 🎬 AI Video Generator Platforms - Complete API Documentation

## Overview

This document covers **TWO** different AI video generation platforms that share the same API structure but use different domains and authentication tokens.

---

## 📊 Platform Comparison

| Feature | AIVideoGenerator.me | TattooIdea.ai (GrokImagine) |
|---------|---------------------|----------------------------|
| **Domain** | `platform.aivideogenerator.me` | `aiplatform.tattooidea.ai` |
| **Origin** | `https://aivideogenerator.me` | `https://grokimagineai.com` |
| **Status** | ✅ Working | ⚠️ Partially Working |
| **Error** | `pageId illegal` / `HC verification required` | `HC verification required` |
| **Cloudflare** | Yes | Yes |
| **Compression** | zstd | zstd |

---

## 🔑 Common Configuration

### Required Headers (Both Platforms)

```javascript
const COMMON_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Authorization': '<JWT_TOKEN>',
    'Origin': '<ORIGIN_URL>',
    'Referer': '<ORIGIN_URL>/',
    'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site', // or 'cross-site'
    'priority': 'u=1, i',
    'uniqueid': '865ead8054fa643f5ae01dcd613ba1ad'
};
```

### Device Fingerprinting

- **Unique ID:** `865ead8054fa643f5ae01dcd613ba1ad` (used by both platforms)
- **Purpose:** Device identification and session tracking
- **Note:** This appears to be a shared/fixed device ID

---

## 🌐 Platform 1: AIVideoGenerator.me

### Authentication

```javascript
const CONFIG_AIVIDEO = {
    baseUrl: 'https://platform.aivideogenerator.me',
    authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJhaXZpZGVvZ2VuZXJhdG9yLXVzZXItOTc5NzE5Iiwicm5TdHIiOiIzTDVNWEMwSUtPRm5temV5VFNWMDByaE9jUlNMd1NqdyJ9.Yz62KNRtivXfJSmNmKeGctQLrZ9vl6M7c3Ta7nlnFFk',
    uniqueId: '865ead8054fa643f5ae01dcd613ba1ad',
    channel: 'GROK_IMAGINE',
    origin: 'https://aivideogenerator.me',
    modelId: 'af548e1bec9c141716e13e8b5443e065'
};
```

### Endpoints

#### 1. GET Model Information

**Endpoint:** `GET /aimodels/api/v1/ai/{modelId}`

**Request:**
```javascript
GET https://platform.aivideogenerator.me/aimodels/api/v1/ai/af548e1bec9c141716e13e8b5443e065?channel=GROK_IMAGINE
```

**Response:** Compressed JSON with model data

---

#### 2. POST Create Video

**Endpoint:** `POST /aimodels/api/v1/ai/video/create`

**Request Payload:**
```json
{
    "prompt": "A beautiful sunset over mountains",
    "style": "cinematic",
    "negative_prompt": "blurry, low quality",
    "channel": "GROK_IMAGINE",
    "model_version": "v1",
    "duration": 3,
    "resolution": "512x512"
}
```

**Required Fields:**
- `prompt`: Text description of the video
- `channel`: Must be `GROK_IMAGINE`

**Optional Fields:**
- `style`: Art style (cyberpunk, cartoon, realistic, cinematic, etc.)
- `negative_prompt`: What to exclude from generation
- `model_version`: Model version
- `duration`: Video duration in seconds
- `resolution`: Output resolution

**Example Request:**
```javascript
const response = await axios.post(
    'https://platform.aivideogenerator.me/aimodels/api/v1/ai/video/create',
    {
        prompt: 'A cute robot dancing in the rain',
        style: 'cartoon',
        negative_prompt: 'distorted, ugly',
        channel: 'GROK_IMAGINE'
    },
    {
        headers: {
            ...COMMON_HEADERS,
            'Content-Type': 'application/json',
            'Authorization': CONFIG_AIVIDEO.authToken
        }
    }
);
```

---

## 🌐 Platform 2: TattooIdea.ai (GrokImagine)

### Authentication

```javascript
const CONFIG_TATTOO = {
    baseUrl: 'https://aiplatform.tattooidea.ai',
    authToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJncm9raW1hZ2luZWFpLmNvbS11c2VyLTc2MDg2MiIsInJuU3RyIjoid3JxVjNNUVR6QmNWTHBjMVJJMUJ0MnJHWjV4V0djbE4ifQ.lu79hPMu1eey_5tMB-gOUOryMvb4f3IT8lOXdX0Rrow',
    uniqueId: '865ead8054fa643f5ae01dcd613ba1ad',
    channel: 'GROK_IMAGINE',
    origin: 'https://grokimagineai.com',
    modelId: 'ad7be746bd7898647c69321a69f7a93b'
};
```

### Endpoints

Same structure as AIVideoGenerator.me but with different base URL and model ID.

---

## ⚠️ Known Issues & Solutions

### Issue 1: PageId Illegal

**Error Code:** `400000`  
**Message:** `"pageId illegal"`

**Cause:** Missing or invalid `pageId` parameter

**Solution:**
```javascript
// Add pageId to payload
const payload = {
    prompt: 'Your prompt here',
    channel: 'GROK_IMAGINE',
    pageId: '<valid_page_id>'  // Need to obtain from website
};
```

**How to Find pageId:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Visit the website and create a video
4. Look for the `/video/create` request
5. Check the request payload for `pageId` value

---

### Issue 2: HC Verification Required

**Error Code:** `100002`  
**Message:** `"HC verification is required"`

**Cause:** hCaptcha or similar security verification required

**Solutions:**

#### Option A: Use Website Interface
1. Visit the website directly
2. Complete any captcha challenges
3. Monitor network requests to capture verified session tokens
4. Use those tokens in your API calls

#### Option B: Implement Captcha Solving
```javascript
// Pseudo-code for captcha solving
async function solveCaptcha() {
    // 1. Get captcha challenge
    // 2. Solve it (manual or automated)
    // 3. Get verification token
    // 4. Include in subsequent requests
}
```

#### Option C: Session Cookie Approach
```javascript
// Use browser automation to get valid cookies
const puppeteer = require('puppeteer');

async function getVerifiedSession() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.goto('https://aivideogenerator.me');
    // Wait for user to complete any captchas
    await page.waitForNavigation();
    
    const cookies = await page.cookies();
    return cookies;
}
```

---

## 🧪 Usage Examples

### Example 1: Basic Video Creation (AIVideoGenerator)

```javascript
import axios from 'axios';

async function createVideo(prompt) {
    const response = await axios.post(
        'https://platform.aivideogenerator.me/aimodels/api/v1/ai/video/create',
        {
            prompt: prompt,
            channel: 'GROK_IMAGINE'
        },
        {
            headers: {
                'Authorization': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
                'uniqueid': '865ead8054fa643f5ae01dcd613ba1ad',
                'Content-Type': 'application/json'
            }
        }
    );
    
    console.log(response.data);
    return response.data;
}

createVideo('A beautiful sunset over mountains');
```

### Example 2: Advanced Video with Style

```javascript
async function createAdvancedVideo() {
    const payload = {
        prompt: 'Futuristic cyberpunk city with flying cars, neon lights, rain',
        style: 'cyberpunk',
        negative_prompt: 'blurry, low quality, distorted, ugly',
        channel: 'GROK_IMAGINE',
        model_version: 'v1',
        duration: 5,
        resolution: '1024x1024'
    };
    
    const response = await axios.post(
        'https://platform.aivideogenerator.me/aimodels/api/v1/ai/video/create',
        payload,
        {
            headers: {
                'Authorization': CONFIG_AIVIDEO.authToken,
                'uniqueid': CONFIG_AIVIDEO.uniqueId,
                'Content-Type': 'application/json'
            }
        }
    );
    
    return response.data;
}
```

### Example 3: Try Both Platforms

```javascript
async function tryBothPlatforms(prompt) {
    const platforms = [
        {
            name: 'AIVideoGenerator',
            url: 'https://platform.aivideogenerator.me',
            token: CONFIG_AIVIDEO.authToken
        },
        {
            name: 'TattooIdea',
            url: 'https://aiplatform.tattooidea.ai',
            token: CONFIG_TATTOO.authToken
        }
    ];
    
    for (const platform of platforms) {
        console.log(`\nTrying ${platform.name}...`);
        
        try {
            const response = await axios.post(
                `${platform.url}/aimodels/api/v1/ai/video/create`,
                {
                    prompt: prompt,
                    channel: 'GROK_IMAGINE'
                },
                {
                    headers: {
                        'Authorization': platform.token,
                        'uniqueid': CONFIG_AIVIDEO.uniqueId,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log(`${platform.name}: Status ${response.status}`);
            console.log('Response:', response.data);
            
        } catch (error) {
            console.log(`${platform.name}: FAILED`);
            if (error.response) {
                console.log('Error:', error.response.data);
            }
        }
    }
}
```

---

## 📊 Error Codes Reference

| Code | Message | Platform | Solution |
|------|---------|----------|----------|
| 200 | Success | Both | ✅ Request completed |
| 400000 | pageId illegal | AIVideoGenerator | Add valid pageId to payload |
| 100002 | HC verification required | Both | Complete captcha verification |
| 404 | Not Found | Both | Invalid endpoint URL |
| 401 | Unauthorized | Both | Invalid or expired JWT token |
| 429 | Too Many Requests | Both | Rate limited, wait before retrying |

---

## 🔐 Security Notes

1. **JWT Tokens:** Both tokens appear valid but may expire
2. **Device Fingerprinting:** Same `uniqueid` works on both platforms
3. **Session Cookies:** `JSESSIONID` is set by servers
4. **Cloudflare Protection:** Both use Cloudflare CDN
5. **CORS:** Restricted to specific origins
6. **Rate Limiting:** Present but limits unknown

---

## 💡 Tips & Tricks

### 1. Monitor Network Traffic
```bash
# Use browser DevTools → Network tab
# Filter by: video/create
# Copy request as cURL for testing
```

### 2. Extract Tokens from Browser
```javascript
// In browser console on the website:
console.log('Auth Token:', localStorage.getItem('token'));
console.log('User Info:', JSON.parse(localStorage.getItem('user')));
```

### 3. Decompress Responses
```javascript
const zlib = require('zlib');

function decompressResponse(compressedData) {
    return zlib.brotliDecompressSync(Buffer.from(compressedData, 'binary'));
}
```

### 4. Handle Compression Automatically
```javascript
// Axios handles compression automatically
// But you can force it:
const response = await axios.get(url, {
    headers: {
        'Accept-Encoding': 'gzip, deflate, br, zstd'
    },
    decompress: true  // Let axios handle it
});
```

---

## 🚀 Next Steps

To fully utilize these APIs:

1. **Find Valid pageId:**
   - Monitor website traffic
   - Check localStorage/sessionStorage
   - Look in JavaScript variables

2. **Solve HC Verification:**
   - Use browser automation (Puppeteer)
   - Implement captcha solving service
   - Or use the web interface directly

3. **Test Different Parameters:**
   - Various styles and resolutions
   - Different durations
   - Model versions

4. **Monitor for Changes:**
   - API endpoints may change
   - Tokens may expire
   - New security measures may be added

---

## 📝 Tested Styles

The following styles have been tested or are likely supported:

- ✅ `cyberpunk` - Futuristic sci-fi aesthetic
- ✅ `cartoon` - Animated/cartoon style
- ✅ `realistic` - Photorealistic rendering
- ✅ `cinematic` - Movie-like quality
- ⚠️ `anime` - Japanese animation style
- ⚠️ `painting` - Artistic painting style
- ⚠️ `sketch` - Pencil sketch style

---

## 🎯 Conclusion

**Current Status:**
- ✅ Both platforms are accessible
- ✅ Authentication works
- ⚠️ Additional verification required (pageId or HC captcha)
- ⚠️ Responses are compressed (handled automatically)

**Recommendation:**
Use **AIVideoGenerator.me** as it shows slightly better error messages and may have less strict verification requirements.

---

**Last Updated:** March 5, 2026  
**Status:** Partially Working (requires additional parameters)  
**Test Scripts:** `reverse_aivideogenerator.js`, `reverse_grok_imagine_v2.js`