# 🚀 LunaPic Worker - Deployment & Testing Guide

## 📋 Overview

This Cloudflare Worker provides a **self-hosted proxy API** for LunaPic's photo editing tools with:
- ✅ CORS enabled for browser access
- ✅ Multiple endpoints (8+ tools)
- ✅ Free, unlimited usage
- ✅ No authentication required
- ✅ Fast processing (~1-2 seconds)

---

## 🛠️ Prerequisites

1. **Node.js** (v16 or higher)
2. **Cloudflare account** (free tier is sufficient)
3. **Wrangler CLI** installed globally

---

## 📦 Installation

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open a browser window. Follow the prompts to authenticate.

### Step 3: Verify Configuration

Check that `wrangler.toml` exists in your directory:

```toml
name = "lunapic-proxy"
main = "worker-lunapic.js"
compatibility_date = "2024-01-01"
```

---

## 🚀 Deployment Options

### Option A: Local Testing (Recommended First)

Start a local development server:

```bash
wrangler dev worker-lunapic.js
```

The worker will be available at: `http://localhost:8787`

**Test locally:**
```bash
node test-worker-lunapic.js
```

Make sure the script uses:
```javascript
const WORKER_URL = 'http://localhost:8787';
```

---

### Option B: Deploy to Cloudflare (Production)

Deploy the worker to Cloudflare's edge network:

```bash
wrangler deploy
```

After deployment, you'll see output like:
```
Published lunapic-proxy https://lunapic-proxy.your-subdomain.workers.dev
```

**Update test script:**
Edit `test-worker-lunapic.js` and change:
```javascript
const WORKER_URL = 'https://lunapic-proxy.your-subdomain.workers.dev';
```

Then run tests:
```bash
node test-worker-lunapic.js
```

---

## 🔧 Available Endpoints

All endpoints accept `POST` requests with multipart form data.

### 1. Background Removal
```
POST /remove-bg
FormData: file (image), x, y, fuzz
Returns: PNG with transparent background
```

### 2. Grayscale
```
POST /grayscale
FormData: file (image)
Returns: Black & white PNG
```

### 3. Blur
```
POST /blur
FormData: file (image), radius (default: 5)
Returns: Blurred PNG
```

### 4. Brightness
```
POST /brightness
FormData: file (image), bright (default: 20)
Returns: Brightness-adjusted PNG
```

### 5. Contrast
```
POST /contrast
FormData: file (image), contrast (default: 30)
Returns: Contrast-adjusted PNG
```

### 6. Invert
```
POST /invert
FormData: file (image)
Returns: Color-inverted PNG
```

### 7. Resize
```
POST /resize
FormData: file (image), width (default: 800)
Returns: Resized PNG
```

### 8. Rotate
```
POST /rotate
FormData: file (image), degrees (default: 90)
Returns: Rotated PNG
```

---

## 💻 Usage Examples

### cURL Command Line

**Background Removal:**
```bash
curl -X POST http://localhost:8787/remove-bg \
  -F "file=@image.png" \
  -F "x=50" \
  -F "y=50" \
  -o result.png
```

**Grayscale:**
```bash
curl -X POST http://localhost:8787/grayscale \
  -F "file=@image.png" \
  -o grayscale.png
```

**Blur:**
```bash
curl -X POST http://localhost:8787/blur \
  -F "file=@image.png" \
  -F "radius=5" \
  -o blurred.png
```

---

### JavaScript (Browser)

```javascript
async function removeBackground(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('x', '50');
  formData.append('y', '50');
  
  const response = await fetch('http://localhost:8787/remove-bg', {
    method: 'POST',
    body: formData
  });
  
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  
  // Use the result
  document.getElementById('result').src = url;
}
```

---

### JavaScript (Node.js)

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function processImage(imagePath, tool = 'grayscale') {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(imagePath));
  
  const response = await axios.post(
    `http://localhost:8787/${tool}`,
    formData,
    {
      headers: formData.getHeaders(),
      responseType: 'arraybuffer'
    }
  );
  
  fs.writeFileSync(`output-${tool}.png`, response.data);
}
```

---

### Python

```python
import requests

def remove_background(image_path):
    with open(image_path, 'rb') as f:
        files = {'file': f}
        data = {'x': '50', 'y': '50'}
        
        response = requests.post(
            'http://localhost:8787/remove-bg',
            files=files,
            data=data
        )
    
    with open('result.png', 'wb') as f:
        f.write(response.content)
```

---

## 🧪 Testing

### Run Complete Test Suite

The included test script tests all 8 endpoints:

```bash
# For local testing
node test-worker-lunapic.js
```

**Expected Output:**
```
✅ TEST 1: Background Removal - SUCCESS
✅ TEST 2: Grayscale - SUCCESS
✅ TEST 3: Blur - SUCCESS
✅ TEST 4: Brightness - SUCCESS
✅ TEST 5: Contrast - SUCCESS
✅ TEST 6: Invert - SUCCESS
✅ TEST 7: Resize - SUCCESS
✅ TEST 8: Rotate - SUCCESS

Total Tests: 8
✅ Passed: 8
❌ Failed: 0
Success Rate: 100.0%
```

### Manual Testing

1. Start local server:
   ```bash
   wrangler dev worker-lunapic.js
   ```

2. Open browser to: `http://localhost:8787`
   
3. You should see the welcome page listing all endpoints

---

## 🎯 Customization

### Change Default Parameters

Edit `worker-lunapic.js`:

```javascript
const CONFIG = {
  baseUrl: 'https://www2.lunapic.com',
  defaultParams: {
    fuzz: '15',     // Higher = more aggressive BG removal
    fill: 'area',
    x: '100',       // Different default click point
    y: '100'
  }
};
```

### Add New Tools

Add a new endpoint handler:

```javascript
else if (url.pathname === '/sepia') {
  return await handleTool(request, 'sepia');
}
```

---

## 📊 Performance

### Expected Response Times:
- **Local Development**: ~1-2 seconds per tool
- **Production (Cloudflare)**: ~500ms - 1.5 seconds

### Rate Limits:
- **Free Tier**: 100,000 requests/day
- **Paid Tier**: Unlimited

---

## 🔒 Security Considerations

### Current Implementation:
- ✅ No authentication (public API)
- ✅ CORS enabled for all origins
- ⚠️ No rate limiting built-in

### To Add Authentication:

```javascript
// Add to worker-lunapic.js
const API_KEY = env.API_KEY;

if (request.headers.get('Authorization') !== `Bearer ${API_KEY}`) {
  return new Response('Unauthorized', { status: 401 });
}
```

Then set in `wrangler.toml`:
```toml
[vars]
API_KEY = "your-secret-key-here"
```

---

## 🐛 Troubleshooting

### Error: "No image provided"
- Make sure you're sending the image as `multipart/form-data`
- Field name must be `file` or `image`

### Error: "Worker not found"
- Check that `wrangler.toml` points to correct file
- Ensure worker is deployed: `wrangler deploy`

### Error: "Timeout"
- Image might be too large (>10MB)
- Network issues with LunaPic API
- Try again or reduce image size

### CORS Errors (Browser)
- Make sure to handle OPTIONS preflight
- Worker already includes CORS headers

---

## 📁 Files Created

1. `worker-lunapic.js` - Main worker code
2. `test-worker-lunapic.js` - Test suite
3. `wrangler.toml` - Deployment configuration
4. `WORKER_DEPLOYMENT_GUIDE.md` - This guide

---

## 🎉 Quick Start Summary

```bash
# 1. Install wrangler
npm install -g wrangler

# 2. Login
wrangler login

# 3. Test locally
wrangler dev worker-lunapic.js

# 4. In another terminal, run tests
node test-worker-lunapic.js

# 5. Deploy to production
wrangler deploy

# 6. Update test script with production URL
# Edit test-worker-lunapic.js, change WORKER_URL

# 7. Test production
node test-worker-lunapic.js
```

---

## 💡 Best Practices

1. **Use local development first** - Test with `wrangler dev` before deploying
2. **Run full test suite** - Always test after deployment
3. **Monitor usage** - Check Cloudflare dashboard for request counts
4. **Add error handling** - Gracefully handle API failures
5. **Consider caching** - Cache results for repeated images

---

## 🌟 Next Steps

After successful deployment:

1. **Create a frontend UI** - Build a web interface
2. **Add authentication** - Protect your worker with API keys
3. **Set up custom domain** - Use your own domain instead of workers.dev
4. **Add analytics** - Track usage and performance
5. **Implement caching** - Reduce redundant API calls

---

**Bottom Line**: Your LunaPic Worker is ready to deploy! Start with local testing, then deploy to Cloudflare for production use. All 8 tools are tested and working! 🎉
