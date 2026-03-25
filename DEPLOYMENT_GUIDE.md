# 🚀 Deploy MU-Devs Flux API to Cloudflare Workers

## 📋 Overview

This Cloudflare Worker proxies the MU-Devs Flux API, giving you:
- ✅ **Your own dedicated endpoint**
- ✅ **Better reliability and error handling**
- ✅ **CORS support for browser apps**
- ✅ **Input validation**
- ✅ **Request logging and monitoring**
- ✅ **Free hosting** (Cloudflare Workers free tier: 100K requests/day)

---

## 🎯 What It Does

```
User Request → Your Cloudflare Worker → MU-Devs API → Returns Image URL
                    ↓
              - Validates input
              - Handles errors
              - Adds CORS headers
              - Logs requests
              - Returns clean JSON
```

---

## 🛠️ Prerequisites

1. **Node.js** (v16 or higher)
2. **Cloudflare Account** (free is fine)
3. **Wrangler CLI** (we'll install it)

---

## 🚀 Quick Deployment Guide

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

Or if you don't have admin rights:
```bash
npm install wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open your browser and authenticate you automatically.

### Step 3: Deploy the Worker

Navigate to this directory and run:

```bash
wrangler deploy
```

That's it! Your worker will be deployed to:
```
https://flux-api-proxy.<your-subdomain>.workers.dev
```

---

## 🧪 Testing Your Deployed Worker

### Option 1: cURL

```bash
curl -X POST https://flux-api-proxy.<your-subdomain>.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A cute cat wearing sunglasses on a beach"}'
```

### Option 2: PowerShell

```powershell
$body = @{
    prompt = "A cute cat wearing sunglasses on a beach"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://flux-api-proxy.<your-subdomain>.workers.dev" `
                  -Method Post `
                  -ContentType "application/json" `
                  -Body $body
```

### Option 3: JavaScript (Browser)

```javascript
const response = await fetch('https://flux-api-proxy.<your-subdomain>.workers.dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        prompt: 'A magical forest with glowing mushrooms'
    })
});

const data = await response.json();
console.log('Image URL:', data.imageUrl);
```

### Option 4: Python

```python
import requests

response = requests.post(
    'https://flux-api-proxy.<your-subdomain>.workers.dev',
    json={'prompt': 'A wizard casting spells'}
)

print(response.json())
```

---

## 📊 API Specification

### Endpoint

**URL**: `https://flux-api-proxy.<your-subdomain>.workers.dev`  
**Method**: `POST`  
**Content-Type**: `application/json`

### Request

```json
{
    "prompt": "Describe the image you want",
    "model": "flux"  // Optional, defaults to "flux"
}
```

**Validation**:
- ✅ Prompt is required
- ✅ Must be 3-1000 characters
- ✅ Only "flux" model is supported (fluxpro returns error)

### Response (Success)

```json
{
    "success": true,
    "imageUrl": "http://tmpfiles.org/dl/xxxxx/flux_image.jpg",
    "prompt": "Your prompt here",
    "model": "flux",
    "timestamp": "2026-03-18T12:34:56.789Z"
}
```

### Response (Error)

```json
{
    "success": false,
    "error": "Error message here"
}
```

---

## 🔍 Local Testing

Before deploying, test locally:

```bash
wrangler dev
```

This starts a local server at `http://localhost:8787`

Then test with:
```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test prompt"}'
```

---

## 💡 Advanced Features

### 1. Custom Domain

Add to `wrangler.toml`:
```toml
routes = [
  { pattern = "flux.yourdomain.com", zone_name = "yourdomain.com" }
]
```

Then deploy again:
```bash
wrangler deploy
```

### 2. Environment Variables

Add secrets:
```bash
wrangler secret put MY_SECRET_KEY
```

Access in worker:
```javascript
export default {
  async fetch(request, env) {
    const key = env.MY_SECRET_KEY;
    // ...
  }
};
```

### 3. Rate Limiting (Future Enhancement)

Add rate limiting with Cloudflare's built-in features:
```javascript
// In worker.js
const limit = 100; // requests per day
const remaining = await env.RATE_LIMITER.limit(1);

if (!remaining.success) {
  return jsonResponse({
    success: false,
    error: 'Rate limit exceeded'
  }, 429);
}
```

---

## 📈 Monitoring & Analytics

### Cloudflare Dashboard

View your worker analytics at:
```
https://dash.cloudflare.com/?to=/:account/workers-and-pages/view/:worker-name/analytics
```

**Metrics available**:
- Requests per day
- Errors
- Response times
- Geographic distribution

### Logging

View logs in real-time:
```bash
wrangler tail
```

Or filter logs:
```bash
wrangler tail --status error
```

---

## 🔐 Security Considerations

### Current Implementation

✅ **What's Protected**:
- Input validation (prompt length, type checking)
- Method restriction (POST only)
- Model restriction (only flux allowed)
- CORS headers configured

⚠️ **What's NOT Protected**:
- No authentication (anyone can call your worker)
- No rate limiting (users can spam requests)
- No IP blocking

### Adding Authentication (Recommended)

#### Option A: Simple API Key

Update `worker.js`:
```javascript
// Add this after parsing request
const authHeader = request.headers.get('Authorization');
const expectedKey = env.API_KEY; // Set with: wrangler secret put API_KEY

if (!authHeader || !authHeader.startsWith('Bearer ') || 
    authHeader.slice(7) !== expectedKey) {
  return jsonResponse({
    success: false,
    error: 'Unauthorized: Invalid API key'
  }, 401);
}
```

Set your API key:
```bash
wrangler secret put API_KEY
# Enter a secure random string
```

Usage with auth:
```bash
curl -X POST https://your-worker.workers.dev \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"prompt":"Test"}'
```

#### Option B: CORS Restriction

Restrict to specific domains:
```javascript
function handleCORS() {
  const allowedOrigin = 'https://yourdomain.com';
  
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
```

---

## 💰 Cost Estimation

### Free Tier (Perfect for Starting)

- **100,000 requests per day** ✅
- **10ms CPU time per request**
- **Enough for**: ~3,000 images/month

### Paid Plan ($5/month)

- **10 million requests per month**
- **Much more CPU time**
- **Enough for**: ~300,000 images/month

**Note**: MU-Devs itself is free, so your only cost is Cloudflare Workers!

---

## 🎯 Production Use Cases

### ✅ Good For:

1. **Personal Projects** - Free tier is plenty
2. **Small Websites** (<100 daily users)
3. **Prototypes/MVPs** - Test before investing
4. **Internal Tools** - Team use
5. **Learning/Experimentation**

### ⚠️ Consider Alternatives If:

1. **High Traffic** (>1000 daily users)
2. **Mission Critical** - Need SLA
3. **Commercial Product** - Should have direct API access
4. **Need Advanced Features** - Upscaling, multiple models, etc.

---

## 🔄 Architecture Comparison

### Before (Direct MU-Devs Access)

```
Your App → mu-devs.vercel.app → Flux API
           ❌ No control
           ❌ Could be blocked
           ❌ No monitoring
```

### After (Your Cloudflare Worker)

```
Your App → Your Worker → mu-devs.vercel.app → Flux API
           ✅ Full control
           ✅ Add auth/rate limits
           ✅ Monitor everything
           ✅ Better error handling
```

---

## 🛠️ Troubleshooting

### Error: "wrangler: command not found"

**Solution**:
```bash
npm install -g wrangler
# Or
npm install wrangler
npx wrangler deploy
```

### Error: "You need to login"

**Solution**:
```bash
wrangler login
```

### Error: "Worker name already exists"

**Solution**: Change worker name in `wrangler.toml`:
```toml
name = "my-flux-proxy-unique"
```

### Deployment Fails

**Check**:
1. Are you logged in? (`wrangler whoami`)
2. Is `wrangler.toml` valid?
3. Is `worker.js` syntax correct?

**Debug**:
```bash
wrangler deploy --dry-run
```

---

## 📁 Files You Have

| File | Purpose |
|------|---------|
| [`worker.js`](file:///c:/Users/Ronit/Downloads/test%20models%202/worker.js) | Main worker code |
| [`wrangler.toml`](file:///c:/Users/Ronit/Downloads/test%20models%202/wrangler.toml) | Configuration file |
| This file | Deployment guide |

---

## 🎉 Next Steps

1. **Install Wrangler**: `npm install -g wrangler`
2. **Login**: `wrangler login`
3. **Deploy**: `wrangler deploy`
4. **Test**: Use curl or browser to test
5. **Monitor**: Check Cloudflare dashboard
6. **Optional**: Add authentication

---

## 💡 Pro Tips

### 1. Add Request Logging

The worker already logs to Cloudflare. View with:
```bash
wrangler tail
```

### 2. Add Custom Error Messages

Edit `worker.js` to add friendly error messages in different languages.

### 3. Cache Responses

Cache identical prompts to save API calls:
```javascript
// Add caching logic
const cache = caches.default;
const cacheKey = new Request(request.url, request);
let response = await cache.match(cacheKey);

if (!response) {
  // Generate image...
  // Then cache it
  response = new Response(JSON.stringify(result), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400' // 24 hours
    }
  });
}
```

### 4. Add Watermarking

Process the image URL to add your watermark before returning.

### 5. Multiple Backends

Add fallback to other APIs if MU-Devs is down:
```javascript
try {
  // Try MU-Devs first
  result = await callMUDevs(prompt);
} catch {
  try {
    // Fallback to Hugging Face
    result = await callHuggingFace(prompt);
  } catch {
    // Final fallback to Replicate
    result = await callReplicate(prompt);
  }
}
```

---

## 🎊 Ready to Deploy!

Your worker is ready to go. Just run:

```bash
wrangler deploy
```

And you'll have your own Flux image generation API endpoint! 🚀

**Questions?** Check the [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

---

**Good luck!** 🌟
