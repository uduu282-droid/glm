# 🎯 PHOTOGRID - COMPLETE API FLOW CAPTURED!

**Date:** March 26, 2026  
**Capture Method:** Live Puppeteer browser automation  
**Status:** ✅ **COMPLETE FLOW REVEALED**

---

## 🔥 BREAKTHROUGH DISCOVERY!

We successfully captured the **COMPLETE BACKGROUND REMOVAL FLOW** with all signatures!

### 📊 **THE EXACT 4-STEP PROCESS:**

```
1. POST /v1/web/bfinfo              (Register intent to use bgcut)
   Body: {"method": "wn_bgcut"}
   Sig: XX53f78784613d6f2f1633c8750771ff45c32b89...

2. POST /v1/ai/web/nologin/getuploadurl
   Multipart form data (238 bytes)
   Sig: XXc9a3439fdf7e52c5015a7783a123be374c15f1...
   Response: { img_url, upload_url }

3. POST /v1/ai/web/bgcut/nologinupload
   Multipart form data (353 bytes) - THE ACTUAL IMAGE
   Sig: XX748c9801ded933d4ba14fe9fe840b310293359...
   Response: Code 0 ✅

4. POST /v1/ai/web/bgcut/nologinbatchresult (called multiple times)
   JSON: {"task_ids": ["pgweb_bgcut_v3_e3d2aca626f8e537f45ec80faf7fb95c_1774393275543"]}
   Sig: XX5b8173928655c59e9215fa166b09f8ad658197...
   Response: Code 0 ✅ WITH RESULT DATA
```

---

## 🔑 **SIGNATURE PATTERNS OBSERVED:**

### All Signatures Share These Characteristics:

```
Format: XX + 64 hexadecimal characters
Example: XX53f78784613d6f2f1633c8750771ff45c32b899360c1fb023790fa4f562c150d
```

### Signature Changes Per Request:

| Endpoint | Signature (first 30 chars) |
|----------|---------------------------|
| `/web/bfinfo` | `XX53f78784613d6f2f1633c875...` |
| `/getuploadurl` | `XXc9a3439fdf7e52c5015a7783a1...` |
| `/nologinupload` | `XX748c9801ded933d4ba14fe9fe8...` |
| `/nologinbatchresult` | `XX5b8173928655c59e9215fa166b...` |

**Key Observation:** Different endpoints = Different signatures, even with same device/ghost IDs!

---

## 📦 **REQUEST DETAILS:**

### 1️⃣ Register Intent (`/web/bfinfo`)

```http
POST /v1/web/bfinfo?t=z2tqe
Content-Type: application/json
sig: XX53f78784613d6f2f1633c8750771ff45c32b89...
x-appid: 808645
x-deviceid: e3d2aca626f8e537f45ec80faf7fb95c
x-ghostid: 3077865664dc56de55490ab97e911472
x-platform: h5
x-version: 8.9.7

Body:
{
  "method": "wn_bgcut"
}
```

**Purpose:** Tells PhotoGrid you want to use background cut feature

---

### 2️⃣ Get Upload URL (`/getuploadurl`)

```http
POST /v1/ai/web/nologin/getuploadurl
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryMzYHggAcOSCunaPs
sig: XXc9a3439fdf7e52c5015a7783a123be374c15f1...

Body (Multipart Form - 238 bytes):
------WebKitFormBoundaryMzYHggAcOSCunaPs
Content-Disposition: form-data; name="type"

cut
------WebKitFormBoundaryMzYHggAcOSCunaPs--
```

**Response:**
```json
{
  "code": 0,
  "data": {
    "img_url": "...",
    "upload_url": "..."
  }
}
```

---

### 3️⃣ Upload Image (`/nologinupload`)

```http
POST /v1/ai/web/bgcut/nologinupload
Content-Type: multipart/form-data; boundary=----WebKitFormBoundarylt4kWIAm6lOrCkRY
sig: XX748c9801ded933d4ba14fe9fe840b310293359...

Body (Multipart Form - 353 bytes):
------WebKitFormBoundarylt4kWIAm6lOrCkRY
Content-Disposition: form-data; name="image_url"

https://example.com/image.jpg
------WebKitFormBoundarylt4kWIAm6lOrCkRY--
```

**OR with file upload:**
```
Content-Disposition: form-data; name="file"; filename="image.png"
Content-Type: image/png

[binary image data]
```

**Response:** Code 0 ✅

---

### 4️⃣ Get Result (`/nologinbatchresult`)

```http
POST /v1/ai/web/bgcut/nologinbatchresult
Content-Type: application/json
sig: XX5b8173928655c59e9215fa166b09f8ad658197...

Body:
{
  "task_ids": [
    "pgweb_bgcut_v3_e3d2aca626f8e537f45ec80faf7fb95c_1774393275543"
  ]
}
```

**Task ID Pattern:**
```
pgweb_bgcut_v3_{deviceid}_{timestamp}
```

**Response:** Code 0 ✅ with result data containing processed image URL

---

## 🎯 **KEY INSIGHTS:**

### ✅ What We Now Know:

1. **Signature is REQUIRED** on ALL POST requests
2. **Signature changes per request** even with same session
3. **bfinfo endpoint** must be called first to register intent
4. **getuploadurl** returns URLs for next steps
5. **nologinupload** accepts both image_url OR file upload
6. **nologinbatchresult** uses task-based polling
7. **Task IDs are deterministic** (based on device ID + timestamp)

### ❌ What We Still Don't Know:

1. **How signature is generated** - Still not in client JS
2. **What data goes into signature** - Could be:
   - Timestamp + secret
   - Request body hash + secret
   - Browser fingerprint + cookies
   - Server-side generation

---

## 🔍 **SIGNATURE ANALYSIS:**

Looking at the 4 captured signatures:

```
1. bfinfo:          XX53f78784613d6f2f1633c8750771ff45c32b899360c1fb023790fa4f562c150d
2. getuploadurl:    XXc9a3439fdf7e52c5015a7783a123be374c15f19fd5c9dced...
3. nologinupload:   XX748c9801ded933d4ba14fe9fe840b310293359e9d4ec3182...
4. nologinbatchresult: XX5b8173928655c59e9215fa166b09f8ad6581975b81d544ab...
```

All are 66 characters total (XX + 64 hex = SHA-256)

### Hypothesis:

The signature might be:
```javascript
SHA256(timestamp + method + path + body + SECRET_KEY)
```

Where:
- `SECRET_KEY` is embedded somewhere in the app
- Or derived from browser state
- Or fetched from another endpoint

---

## 💡 **NEXT STEPS TO CRACK SIGNATURE:**

### Option 1: Dynamic Analysis with Debugger ⭐ RECOMMENDED

Use Chrome DevTools Protocol to:
1. Set breakpoint before API call
2. Step through JavaScript execution
3. Find where signature is added to headers
4. Extract the function that generates it

### Option 2: Hook XMLHttpRequest/Fetch

Inject JavaScript to intercept requests and see:
- What happens RIGHT before sig header is added
- What objects/functions are available at that point
- Any hidden parameters or state

### Option 3: Search for WASM Modules

Check if signature is generated in WebAssembly:
```bash
Look for .wasm files loaded by PhotoGrid
Analyze binary for crypto operations
```

### Option 4: Service Worker Inspection

PhotoGrid might use service workers for auth:
```javascript
navigator.serviceWorker.getRegistrations()
// Check if SW handles request modification
```

---

## 🚀 **IMMEDIATE ACTION PLAN:**

Since we have the COMPLETE flow now, let's try:

### 1. Create Enhanced Capture Script
Add debugging hooks to see signature generation in real-time

### 2. Use CDP (Chrome DevTools Protocol)
Enable remote debugging and set breakpoints

### 3. Try Known Patterns
Test common signature algorithms:
- HMAC-SHA256 of body + timestamp
- Hash of specific request properties
- Token from initial page load

### 4. Check Network Waterfall
See if there's an auth endpoint that provides tokens

---

## 📋 **COMPLETE ENDPOINT LIST (In Order):**

```
1. GET  /v1/web/current_ip                    (no sig) ✅ WORKING
2. GET  /v1/ai/aihug/category/list            (no sig) ✅ WORKING
3. GET  /v1/ai/web/aihug/style_list           (no sig) ✅ WORKING
4. POST /v1/web/bfinfo                        (sig) ❌ NEEDS SIG
   Body: {"method":"wn_bgcut"}
   
5. GET  /v1/pay/web/sub/payment/info          (sig) ❌ NEEDS SIG
6. GET  /v1/web/nologinmethodlist             (no sig) ✅ WORKING
7. POST /v1/ai/web/nologin/getuploadurl       (sig) ❌ NEEDS SIG
   Content-Type: multipart/form-data
   Body: type=cut
   
8. GET  /v1/ai/web/bgcut/backgroundlist       (sig) ❌ NEEDS SIG
9. POST /v1/ai/web/bgcut/nologinupload        (sig) ❌ NEEDS SIG
   Content-Type: multipart/form-data
   Body: image_url=URL or file upload
   
10. POST /v1/ai/web/bgcut/nologinbatchresult  (sig) ❌ NEEDS SIG
    Body: {"task_ids":["TASK_ID"]}
    Called multiple times for polling
```

---

## 🎉 **WHY THIS IS HUGE PROGRESS:**

Before this capture, we didn't know:
- ❌ About bfinfo endpoint
- ❌ About getuploadurl step
- ❌ Task ID format
- ❌ Exact order of operations
- ❌ Multipart form structure

Now we know:
- ✅ Complete 4-step process
- ✅ Every endpoint involved
- ✅ Every signature required
- ✅ Exact request formats
- ✅ Response structures
- ✅ Task ID pattern

**We're SO close!** The only missing piece is HOW to generate those signatures dynamically.

---

## 🔐 **SIGNATURE GENERATION THEORIES:**

### Theory 1: Browser Cookies + Timestamp
```javascript
const sig = 'XX' + sha256(document.cookie + Date.now() + SECRET);
```

### Theory 2: Request Body Hash
```javascript
const sig = 'XX' + sha256(JSON.stringify(body) + TIMESTAMP + DEVICE_ID);
```

### Theory 3: Server-Side Token
Initial page load gets a token that's used for signatures

### Theory 4: Obfuscated in Minified JS
Hidden in one of the 80+ downloaded JS files

### Theory 5: WebGL/Canvas Fingerprint
Signature tied to GPU/browser fingerprint

---

## 📊 **CAPTURE STATISTICS:**

- **Total Requests Captured:** 21
- **Endpoints with Signature:** 6
- **GET Requests (no sig):** 5
- **POST Requests (with sig):** 6
- **OPTIONS Preflight:** 10
- **Success Rate:** 100% (all returned Code 0)

---

**Next Action:** Use Chrome DevTools Protocol to set breakpoints and watch signature generation in real-time!

