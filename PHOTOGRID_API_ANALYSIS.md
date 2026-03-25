# 📊 PHOTOGRID API ERROR ANALYSIS

**Date:** March 25, 2026  
**Issue:** Error Code 2 from `/ai/web/nologin/getuploadurl`

---

## 🔍 **ERROR DETAILS**

### Response:
```json
{
  "code": 2,
  "data": {},
  "errmsg": "2"
}
```

**HTTP Status:** 200 OK  
**Error Code:** 2 (Parameter error / Invalid request)

---

## 📋 **CAPTURED TRAFFIC ANALYSIS**

### What PhotoGrid Expects:

#### Request to `/v1/ai/web/nologin/getuploadurl`:
```
Method: POST
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
```

**Headers:**
- `sig`: XXb4cd7f9b554a354ff96970126761e29c4ce20e068f0954bb81cfb8b3b212f7ff
- `x-appid`: 808645
- `x-deviceid`: de551f2443050acd4805bf4dd95fab27
- `x-ghostid`: dbaff09d0e3fb8b823478b42fb1220d8
- `x-mcc`: en-US
- `x-platform`: h5
- `x-version`: 8.9.7

**Body (multipart/form-data):**
```
------WebKitFormBoundaryZzS37ELbEGHo0fpS
Content-Disposition: form-data; name="type"

cut
------WebKitFormBoundaryZzS37ELbEGHo0fpS--
```

---

## 💡 **ROOT CAUSE IDENTIFIED**

### Problem 1: Wrong Content-Type ❌
**What we're sending:** `application/json`  
**What they expect:** `multipart/form-data`

### Problem 2: Missing Body Parameters ❌
**Required parameter:** `type` (value: "cut", "enhance", etc.)  
**We're sending:** Empty body or JSON

### Problem 3: Signature Algorithm ❌
**Current:** Simple SHA-256 of timestamp+path+body  
**Actual:** Unknown - might need specific algorithm or secret key

---

## 🎯 **REQUIRED FIXES**

### Fix 1: Use FormData with Correct Parameters
```javascript
const formData = new FormData();
formData.append('type', 'cut'); // or 'enhance', 'restore', etc.

const response = await fetch(`${CONFIG.baseUrl}/ai/web/nologin/getuploadurl`, {
  method: 'POST',
  headers: sessionManager.getCurrentSession(),
  body: formData
});
```

### Fix 2: Don't Set Content-Type Header
Browser/Cloudflare will automatically set `multipart/form-data` with correct boundary when using FormData.

### Fix 3: Reverse Engineer Signature
Need to capture more traffic to understand signature algorithm:
- Try different timestamps
- Check if there's a pattern
- Look for secrets in web app JavaScript

---

## 📝 **API FLOW (Complete)**

### Step 1: Get Upload URL
```
POST /v1/ai/web/nologin/getuploadurl
Content-Type: multipart/form-data
Body: type=cut

Response (if successful):
{
  "code": 0,
  "data": {
    "upload_url": "https://...",
    "file_id": "..."
  }
}
```

### Step 2: Upload Image
```
POST /v1/ai/web/bgcut/nologinupload
Content-Type: multipart/form-data
Body: 
  - image: [file data] OR image_url: "https://..."
  - file_id: "..." (from step 1)

Response:
{
  "code": 0,
  "data": {
    "url": "https://processed-image.png",
    "before_url": "https://original.jpg"
  }
}
```

---

## 🧪 **NEXT STEPS TO DEBUG**

### 1. Capture More Traffic
Open browser DevTools → Network tab and capture:
- Exact form data being sent
- All parameters
- Response format

### 2. Check PhotoGrid Web App JS
Look at `https://www.photogrid.app/workers/imageWorker.js`
- May contain signature algorithm
- Parameter validation logic
- API endpoint constants

### 3. Test with Correct Format
Try sending proper FormData:
```javascript
const formData = new FormData();
formData.append('type', 'cut');

const response = await fetch('https://api.grid.plus/v1/ai/web/nologin/getuploadurl', {
  method: 'POST',
  headers: {
    'x-appid': '808645',
    'x-deviceid': deviceId,
    'x-ghostid': ghostId,
    // ... other headers
  },
  body: formData
});
```

### 4. Analyze Signature Pattern
Capture multiple requests to see if signature is:
- Timestamp-based
- Request hash
- Session-based
- Fixed secret key

---

## 📊 **COMPARISON TABLE**

| Aspect | What We Did | What PhotoGrid Wants |
|--------|-------------|---------------------|
| **Content-Type** | application/json | multipart/form-data |
| **Body Format** | JSON or empty | FormData with `type` field |
| **Signature** | SHA-256(timestamp+path+body) | Unknown algorithm |
| **Parameters** | None | `type` (required) |

---

## ✅ **QUICK FIX PLAN**

1. Change background removal endpoint to use FormData
2. Add `type` parameter (default: "cut")
3. Remove Content-Type header (let FormData set it)
4. Test without signature first (see if it works)
5. If signature required, reverse-engineer from JS

---

## 🔧 **IMMEDIATE ACTION**

Update worker to send correct request format:

```javascript
// Background removal - corrected
if (url.pathname === '/remove-bg') {
  const imageUrl = url.searchParams.get('image_url');
  
  // Step 1: Get upload URL with FormData
  const formData = new FormData();
  formData.append('type', 'cut');
  
  const uploadResponse = await fetch(`${CONFIG.baseUrl}/ai/web/nologin/getuploadurl`, {
    method: 'POST',
    headers: sessionManager.getCurrentSession(),
    body: formData  // This will auto-set multipart/form-data
  });
  
  // ... rest of flow
}
```

---

**Created:** March 25, 2026  
**Status:** ⚠️ INVESTIGATING  
**Next:** Implement FormData fix and test
