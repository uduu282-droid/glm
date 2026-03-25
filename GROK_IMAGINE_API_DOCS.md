# GrokImagine AI Platform - Reverse Engineered API Documentation

## 🔍 Overview

This document contains the reverse-engineered API endpoints and usage for the GrokImagine AI video generation platform.

**Base URL:** `https://aiplatform.tattooidea.ai`  
**Origin:** `https://grokimagineai.com`

---

## 🔑 Authentication & Headers

### Required Headers

```javascript
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Authorization': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJncm9raW1hZ2luZWFpLmNvbS11c2VyLTc2MDg2MiIsInJuU3RyIjoid3JxVjNNUVR6QmNWTHBjMVJJMUJ0MnJHWjV4V0djbE4ifQ.lu79hPMu1eey_5tMB-gOUOryMvb4f3IT8lOXdX0Rrow',
    'Origin': 'https://grokimagineai.com',
    'Referer': 'https://grokimagineai.com/',
    'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'priority': 'u=1, i',
    'uniqueid': '865ead8054fa643f5ae01dcd613ba1ad'
};
```

### Key Authentication Values

- **Auth Token:** `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJncm9raW1hZ2luZWFpLmNvbS11c2VyLTc2MDg2MiIsInJuU3RyIjoid3JxVjNNUVR6QmNWTHBjMVJJMUJ0MnJHWjV4V0djbE4ifQ.lu79hPMu1eey_5tMB-gOUOryMvb4f3IT8lOXdX0Rrow`
- **Unique ID:** `865ead8054fa643f5ae01dcd613ba1ad`
- **Channel:** `GROK_IMAGINE`

---

## 📡 API Endpoints

### 1. GET User Information

**Endpoint:** `GET /user/api/v1/user/getUserInfo`

**Description:** Retrieves user account information and credits

**Request:**
```javascript
GET https://aiplatform.tattooidea.ai/user/api/v1/user/getUserInfo
Headers: {
    Authorization: '<token>',
    uniqueid: '<device_id>'
}
```

**Response:** Compressed JSON with user data

---

### 2. GET AI Model Information

**Endpoint:** `GET /aimodels/api/v1/ai/ad7be746bd7898647c69321a69f7a93b`

**Query Parameters:**
- `channel` (required): Channel identifier (e.g., `GROK_IMAGINE`)

**Request:**
```javascript
GET https://aiplatform.tattooidea.ai/aimodels/api/v1/ai/ad7be746bd7898647c69321a69f7a93b?channel=GROK_IMAGINE
Headers: {
    Authorization: '<token>',
    uniqueid: '<device_id>'
}
```

**Response:** Compressed JSON with model information

---

### 3. POST Create Video (Main Endpoint)

**Endpoint:** `POST /aimodels/api/v1/ai/video/create`

**Description:** Creates an AI-generated video from text prompt

**Request Payload:**
```json
{
    "prompt": "A beautiful sunset over mountains",
    "style": "cyberpunk",
    "negative_prompt": "blurry, low quality",
    "channel": "GROK_IMAGINE",
    "model_version": "v1",
    "duration": 3,
    "resolution": "512x512"
}
```

**Required Fields:**
- `prompt`: Text description of the video to generate
- `channel`: Must be `GROK_IMAGINE` or other valid channel

**Optional Fields:**
- `style`: Art style (e.g., "cyberpunk", "cartoon", "realistic")
- `negative_prompt`: What to exclude from the generation
- `model_version`: Model version to use
- `duration`: Video duration in seconds
- `resolution`: Output resolution (e.g., "512x512", "1024x1024")

**Example Request:**
```javascript
const response = await axios.post(
    'https://aiplatform.tattooidea.ai/aimodels/api/v1/ai/video/create',
    {
        prompt: 'A cute robot dancing in the rain',
        style: 'cartoon',
        negative_prompt: 'distorted, ugly',
        channel: 'GROK_IMAGINE'
    },
    {
        headers: {
            ...COMMON_HEADERS,
            'Content-Type': 'application/json'
        }
    }
);
```

**Response Codes:**
- `200`: Success (may contain video URL or task ID)
- `400000`: Bad request (missing parameters)
- `100002`: HC verification required (additional security check needed)

---

### 4. POST Create Image

**Endpoint:** `POST /aimodels/api/v1/ai/image/create`

**Description:** Creates an AI-generated image from text prompt

**Request Payload:**
```json
{
    "prompt": "A futuristic city at sunset",
    "pageId": "<required_page_id>"
}
```

**Error:** Returns `"pageId illegal"` if pageId is missing or invalid

---

## ⚠️ Known Issues & Limitations

### 1. HC Verification Required

**Error Code:** `100002`  
**Message:** `"HC verification is required"`

**Cause:** Additional security verification (likely hCaptcha or similar) is required before generating content.

**Possible Solutions:**
- Complete hCaptcha challenge on the website first
- Obtain HC verification token from browser session
- Use the official web interface to authenticate

### 2. Response Compression

All responses are compressed using **zstd** encoding. You need to decompress them to see the actual JSON content.

**Decompression:**
```javascript
// Axios automatically handles compression
// But if you're working with raw responses:
const zlib = require('zlib');
const decompressed = zlib.brotliDecompressSync(compressedData);
```

### 3. Channel Parameter

The `channel` parameter is **REQUIRED** in all video creation requests. Without it, you'll get error `400000: "channel is required"`.

---

## 🔧 Usage Examples

### Example 1: Basic Video Creation

```javascript
import axios from 'axios';

async function createVideo(prompt) {
    const response = await axios.post(
        'https://aiplatform.tattooidea.ai/aimodels/api/v1/ai/video/create',
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

### Example 2: Advanced Video Creation

```javascript
async function createAdvancedVideo() {
    const payload = {
        prompt: 'A futuristic cyberpunk city with flying cars, neon lights, rain',
        style: 'cyberpunk',
        negative_prompt: 'blurry, low quality, distorted, ugly, deformed',
        channel: 'GROK_IMAGINE',
        model_version: 'v1',
        duration: 5,
        resolution: '1024x1024'
    };
    
    const response = await axios.post(
        'https://aiplatform.tattooidea.ai/aimodels/api/v1/ai/video/create',
        payload,
        {
            headers: COMMON_HEADERS
        }
    );
    
    return response.data;
}
```

### Example 3: Check User Credits

```javascript
async function getUserInfo() {
    const response = await axios.get(
        'https://aiplatform.tattooidea.ai/user/api/v1/user/getUserInfo',
        {
            headers: {
                'Authorization': AUTH_TOKEN,
                'uniqueid': UNIQUE_ID
            }
        }
    );
    
    // Decompress and parse response
    return response.data;
}
```

---

## 🎯 Tested Channels

The following channel values have been tested:

- ✅ `GROK_IMAGINE` - Primary channel
- ✅ `GROK_VIDEO` - Video-specific channel
- ✅ `DEFAULT` - Default channel
- ✅ `WEB` - Web platform
- ✅ `MOBILE` - Mobile platform

**Note:** All channels return `"HC verification is required"` error, suggesting this is a universal requirement.

---

## 📊 Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 200 | Success | Request completed successfully |
| 400000 | channel is required | Missing channel parameter |
| 100002 | HC verification is required | Additional verification needed |
| 404 | Not Found | Invalid endpoint |

---

## 🔐 Security Notes

1. **JWT Token:** The auth token appears to be valid but may expire
2. **Device Fingerprinting:** The `uniqueid` header is used for device identification
3. **Session Cookies:** `JSESSIONID` cookie is set by the server
4. **Rate Limiting:** Cloudflare protection is active
5. **CORS:** Only allows requests from `https://grokimagineai.com`

---

## 💡 Tips & Tricks

1. **Use Browser DevTools:** Monitor network requests to see exact payloads
2. **Copy as cURL:** Right-click requests in DevTools → Copy → Copy as cURL
3. **Check Console:** Look for JavaScript variables that might contain tokens
4. **LocalStorage:** Check browser localStorage for additional authentication data
5. **WebSocket:** Some features might use WebSocket for real-time updates

---

## 🚀 Next Steps

To fully utilize this API:

1. **Solve HC Verification:** Implement hCaptcha solving or obtain verification token
2. **Monitor Session:** Track how the web app obtains and uses verification tokens
3. **Reverse Engineer Frontend:** Analyze the JavaScript to find verification logic
4. **Test Different Models:** Try different model versions and parameters
5. **Check Rate Limits:** Determine API call limits per user/session

---

## 📝 Disclaimer

This documentation is for educational purposes only. Use responsibly and respect the service's terms of service. Do not abuse or overload the API.

**Last Updated:** March 5, 2026  
**Status:** Partially Working (requires HC verification)