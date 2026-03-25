# 🚀 Deploy Runware AI Image Generator to Cloudflare Workers

## 📋 Overview

This Cloudflare Worker provides **direct access to Runware API** for high-quality AI image generation.

**Key Features**:
- ✅ **Only Runware provider** (no Pollinations)
- ✅ **Direct API integration** (no proxy)
- ✅ **Multiple models** supported
- ✅ **Advanced parameters** (steps, CFGScale, negative prompts)
- ✅ **CORS enabled** for browser apps
- ✅ **Input validation**
- ✅ **Error handling**

---

## ⚡ Quick Deployment (3 Steps)

### Step 1: Get Runware API Key

1. Go to https://runware.ai/
2. Sign up for an account
3. Get your API key from dashboard
4. **Important**: Runware uses credit-based system (check pricing)

### Step 2: Install Wrangler CLI

```bash
npm install -g wrangler
```

### Step 3: Deploy Worker

```bash
# Login to Cloudflare
wrangler login

# Set your Runware API key as secret
wrangler secret put RUNWARE_API_KEY
# (Paste your API key when prompted)

# Deploy the worker
wrangler deploy --config wrangler-runware.toml
```

Your worker will be live at:
```
https://runware-image-worker.<your-subdomain>.workers.dev
```

---

## 🧪 Testing Your Worker

### Basic Test (PowerShell)

```powershell
$body = @{
    prompt = "A magical forest with glowing mushrooms"
    model = "runware:100@1"
    width = 1024
    height = 1024
    steps = 20
    CFGScale = 7.5
    numberResults = 1
    outputType = "URL"
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "https://runware-image-worker.<your-subdomain>.workers.dev" `
                            -Method Post `
                            -ContentType "application/json" `
                            -Body $body

Write-Host "✅ Generated $($result.images.Count) images!"
foreach ($img in $result.images) {
    Write-Host "📷 URL: $($img.url)"
}
```

### Python Test

```python
import requests

response = requests.post(
    'https://runware-image-worker.<your-subdomain>.workers.dev',
    json={
        "prompt": "A magical forest with glowing mushrooms",
        "model": "runware:100@1",
        "width": 1024,
        "height": 1024,
        "steps": 20,
        "CFGScale": 7.5,
        "numberResults": 1,
        "outputType": "URL"
    }
)

data = response.json()
print(f"Generated {len(data['images'])} images")
for i, img in enumerate(data['images']):
    print(f"Image {i+1}: {img.get('url')}")
```

### cURL Test

```bash
curl -X POST https://runware-image-worker.<your-subdomain>.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A magical forest with glowing mushrooms",
    "model": "runware:100@1",
    "width": 1024,
    "height": 1024,
    "steps": 20,
    "CFGScale": 7.5,
    "numberResults": 1,
    "outputType": "URL"
  }'
```

---

## 📊 API Specification

### Endpoint

**URL**: `https://runware-image-worker.<your-subdomain>.workers.dev`  
**Method**: `POST`  
**Content-Type**: `application/json`

### Request Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | Yes | - | Text description of image |
| `model` | string | No | `runware:100@1` | Model ID (see below) |
| `width` | integer | No | 1024 | Image width (256-2048) |
| `height` | integer | No | 1024 | Image height (256-2048) |
| `steps` | integer | No | 20 | Inference steps (1-100) |
| `CFGScale` | float | No | 7.5 | Guidance scale (1-20) |
| `numberResults` | integer | No | 1 | Number of images (1-10) |
| `outputType` | string | No | `"URL"` | Must be: `"URL"`, `"base64Data"`, or `"dataURI"` |
| `seed` | integer | No | - | Random seed for reproducibility |
| `negativePrompt` | string | No | - | What to exclude from image |

### Allowed Models

- `runware:100@1` - FLUX.1 Schnell (fast)
- `runware:101@1` - FLUX.1 Dev (quality)
- `runware:106@1` - FLUX.1 Kontext Dev
- `bfl:3@1` - FLUX.1 Kontext Pro

### Response Format

**Success** (HTTP 200):
```json
{
    "success": true,
    "images": [
        { "url": "https://..." },
        { "base64": "..." },
        { "dataURI": "data:..." }
    ],
    "prompt": "your prompt",
    "model": "runware:100@1",
    "parameters": {
        "width": 1024,
        "height": 1024,
        "steps": 20,
        "CFGScale": 7.5,
        "numberResults": 1,
        "outputType": "URL"
    },
    "timestamp": "2026-03-20T..."
}
```

**Error** (HTTP 4xx/5xx):
```json
{
    "success": false,
    "error": "Error message here",
    "details": { ... }
}
```

---

## 💡 Example Usage

### Example 1: Quick Generation

```javascript
const response = await fetch(workerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        prompt: "A cute cat wearing a wizard hat",
        model: "runware:100@1",
        width: 1024,
        height: 1024
    })
});

const data = await response.json();
console.log('Image:', data.images[0].url);
```

### Example 2: High Quality with Negative Prompt

```python
import requests

response = requests.post(
    worker_url,
    json={
        "prompt": "A beautiful castle on a hill, detailed architecture, sunset lighting",
        "model": "runware:101@1",  # Higher quality model
        "width": 1024,
        "height": 1024,
        "steps": 50,  # More steps = better quality
        "CFGScale": 7.5,
        "negativePrompt": "blurry, low quality, distorted",
        "outputType": "URL"
    }
)

images = response.json()['images']
```

### Example 3: Multiple Images with Same Seed

```python
import requests

# Generate 4 variations
response = requests.post(
    worker_url,
    json={
        "prompt": "A futuristic city skyline",
        "model": "runware:100@1",
        "width": 1024,
        "height": 1024,
        "numberResults": 4,
        "seed": 42,  # Same seed for consistency
        "outputType": "URL"
    }
)

images = response.json()['images']
print(f"Generated {len(images)} images")
```

---

## 🔐 Security & Authentication

### Setting API Key Secret

The worker requires your Runware API key as a secret:

```bash
wrangler secret put RUNWARE_API_KEY
```

This encrypts the key and makes it available only to your worker.

### Adding Optional Auth (Recommended for Production)

Add API key authentication to your worker:

```javascript
// In worker-runware.js, add this after parsing request
const authHeader = request.headers.get('Authorization');
const expectedKey = env.YOUR_API_KEY; // Set with: wrangler secret put YOUR_API_KEY

if (!authHeader || !authHeader.startsWith('Bearer ') || 
    authHeader.slice(7) !== expectedKey) {
  return jsonResponse({
    success: false,
    error: 'Unauthorized: Invalid API key'
  }, 401);
}
```

Then set your secret:
```bash
wrangler secret put YOUR_API_KEY
```

Usage with auth:
```bash
curl -X POST https://your-worker.workers.dev \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"..."}'
```

---

## 📈 Monitoring & Logs

### View Logs in Real-Time

```bash
wrangler tail
```

### Filter by Status

```bash
wrangler tail --status error
```

### Check Analytics

Visit Cloudflare Dashboard:
```
https://dash.cloudflare.com/workers
```

View metrics:
- Requests per day
- Errors
- Response times
- Geographic distribution

---

## 💰 Cost Estimation

### Cloudflare Workers

**Free Tier**:
- ✅ 100,000 requests/day
- ✅ 10ms CPU time per request
- ✅ Enough for ~3,000 images/month

**Paid Plan**: $5/month
- 10 million requests/month
- Much more CPU time

### Runware API Costs

Runware uses credit-based pricing. Check current rates at https://runware.ai/pricing

**Estimated Costs** (as of 2026):
- FLUX.1 Schnell: ~$0.005-0.01 per image
- FLUX.1 Dev: ~$0.01-0.02 per image
- FLUX.1.1 Pro: ~$0.02-0.04 per image

**Example Monthly Cost** (1000 images/day):
- Cloudflare: $0 (free tier)
- Runware: ~$150-300/month (depending on model)
- **Total**: ~$150-300/month

---

## 🎯 Production Recommendations

### For Low Traffic (<100 images/day)

✅ Use free tier of Cloudflare Workers  
✅ Monitor Runware credit usage  
✅ Implement basic caching  

### For Medium Traffic (100-1000 images/day)

✅ Upgrade to paid Cloudflare plan ($5/mo)  
✅ Add request queuing  
✅ Implement smarter caching  
✅ Add rate limiting per IP  

### For High Traffic (>1000 images/day)

✅ Add multiple fallback providers  
✅ Implement advanced caching strategies  
✅ Use custom domain with SSL  
✅ Add comprehensive monitoring  
✅ Consider bulk credits purchase for discounts  

---

## 🔧 Advanced Features

### Add Caching

Cache identical prompts to save API calls:

```javascript
// Add to worker
const cache = caches.default;
const cacheKey = new Request(request.url, request);
let response = await cache.match(cacheKey);

if (!response) {
    // Generate image...
    
    // Cache the response
    const cacheResponse = new Response(JSON.stringify(result), {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=86400' // 24 hours
        }
    });
    
    ctx.waitUntil(cache.put(cacheKey, cacheResponse.clone()));
    return cacheResponse;
}

return response;
```

### Add Rate Limiting

Use Cloudflare's built-in rate limiting:

```javascript
// In wrangler-runware.toml, add:
[[limits]]
type = "rate_limit"
route = "runware-image-worker.*"
zone_name = "yourdomain.com"
key = "ip.src"  # Rate limit by IP
requests_per_unit = 100  # per minute
action = "block"
```

Or implement simple in-memory rate limiting:
```javascript
const rateLimitMap = new Map();

function checkRateLimit(ip) {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 10;
    
    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, []);
    }
    
    const requests = rateLimitMap.get(ip).filter(time => now - time < windowMs);
    
    if (requests.length >= maxRequests) {
        return false; // Rate limited
    }
    
    requests.push(now);
    rateLimitMap.set(ip, requests);
    return true;
}
```

### Add Watermarking

Process images before returning:
```javascript
// After getting image URL, you could:
// 1. Download the image
// 2. Apply watermark using canvas
// 3. Upload to your storage
// 4. Return watermarked URL
```

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| [`worker-runware.js`](file:///c:/Users/Ronit/Downloads/test%20models%202/worker-runware.js) | Main worker code |
| [`wrangler-runware.toml`](file:///c:/Users/Ronit/Downloads/test%20models%202/wrangler-runware.toml) | Configuration file |
| This file | Deployment guide |

---

## 🎉 Ready to Deploy!

### Quick Start Commands:

```bash
# 1. Install Wrangler
npm install -g wrangler

# 2. Login
wrangler login

# 3. Set API key
wrangler secret put RUNWARE_API_KEY

# 4. Deploy
wrangler deploy --config wrangler-runware.toml
```

**Your Runware worker will be live in under 30 seconds!** ⚡

---

## 🆚 Comparison: Proxy vs Direct

### Using ai-image-gen-zeta.vercel.app (Proxy)

❌ Depends on third-party staying online  
❌ No control over parameters  
❌ Could add rate limits anytime  
❌ Limited debugging  
❌ Shared infrastructure  

### Your Own Worker (Direct Integration)

✅ Full control  
✅ Direct API access  
✅ Custom parameters  
✅ Better monitoring  
✅ Professional setup  
✅ Can add your own features  

---

**Ready to deploy!** 🚀  
**Questions?** Check the logs with `wrangler tail` after deployment!
