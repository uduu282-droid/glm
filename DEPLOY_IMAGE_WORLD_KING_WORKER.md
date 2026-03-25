# 🚀 Deploy Image World King Proxy to Cloudflare Workers

## ✅ COMPLETE DEPLOYMENT GUIDE

This will deploy a production-ready proxy for the Image World King API with:
- ✅ CORS support
- ✅ Rate limiting (10 requests/minute per IP)
- ✅ Caching (5 minutes TTL)
- ✅ Error handling
- ✅ Health checks
- ✅ Usage statistics

---

## 📋 PREREQUISITES

### 1. Cloudflare Account
- Sign up at https://dash.cloudflare.com/sign-up
- Free tier is sufficient

### 2. Node.js Installed
```bash
node --version  # Should be v16+
npm --version   # Should be v8+
```

### 3. Wrangler CLI
```bash
npm install -g wrangler
```

---

## 🔧 DEPLOYMENT STEPS

### Step 1: Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser window. Log in and authorize Wrangler.

### Step 2: Create KV Namespaces (Optional but Recommended)

```bash
# Cache namespace
wrangler kv:namespace create "CACHE_KV"

# Stats namespace
wrangler kv:namespace create "STATS_KV"

# Rate limit namespace
wrangler kv:namespace create "RATE_LIMIT_KV"
```

Copy the namespace IDs from the output!

### Step 3: Update wrangler.toml

Edit `wrangler-image-world-king.toml` and add your KV namespace IDs:

```toml
kv_namespaces = [
  { binding = "CACHE_KV", id = "YOUR_CACHE_KV_ID" },
  { binding = "STATS_KV", id = "YOUR_STATS_KV_ID" },
  { binding = "RATE_LIMIT_KV", id = "YOUR_RATE_LIMIT_KV_ID" }
]
```

### Step 4: Test Locally

```bash
wrangler dev worker-image-world-king.js --local --port=8787
```

Test the local endpoint:
```bash
curl "http://localhost:8787/api/generate?prompt=a%20cute%20cat"
```

Expected response:
```json
{
  "success": true,
  "image_url": "https://i.ibb.co/...",
  ...
}
```

### Step 5: Deploy to Production

```bash
wrangler deploy worker-image-world-king.js --config wrangler-image-world-king.toml
```

You'll see output like:
```
Deploying worker to 1 region...
Published image-world-king-proxy
https://image-world-king-proxy.<your-subdomain>.workers.dev
```

### Step 6: Test Production Endpoint

```bash
curl "https://image-world-king-proxy.<your-subdomain>.workers.dev/api/generate?prompt=a%20sunset"
```

---

## 🎯 USAGE EXAMPLES

### JavaScript/Node.js

```javascript
const WORKER_URL = 'https://your-worker.your-subdomain.workers.dev';

async function generateImage(prompt) {
  const response = await fetch(`${WORKER_URL}/api/generate?prompt=${encodeURIComponent(prompt)}`);
  const data = await response.json();
  
  if (data.success) {
    console.log('Generated:', data.image_url);
    return data.image_url;
  } else {
    throw new Error(data.error || 'Generation failed');
  }
}

// Usage
generateImage('a beautiful landscape');
```

### Python

```python
import requests

WORKER_URL = 'https://your-worker.your-subdomain.workers.dev'

def generate_image(prompt):
    response = requests.get(f'{WORKER_URL}/api/generate?prompt={prompt}')
    data = response.json()
    
    if data['success']:
        print(f"Generated: {data['image_url']}")
        return data['image_url']
    else:
        raise Exception(data['error'])

# Usage
generate_image('a beautiful landscape')
```

### cURL

```bash
# Generate image
curl "https://your-worker.your-subdomain.workers.dev/api/generate?prompt=a%20cute%20cat"

# Check health
curl "https://your-worker.your-subdomain.workers.dev/health"

# View stats
curl "https://your-worker.your-subdomain.workers.dev/stats"
```

---

## 📊 ENDPOINTS

### POST /api/generate
Generate an AI image from text prompt.

**Parameters:**
- `prompt` (required): Text description of the image

**Response:**
```json
{
  "success": true,
  "image_url": "https://i.ibb.co/...",
  "thumbnail": "https://i.ibb.co/...",
  "prompt": "a cute cat",
  "size_bytes": 123456,
  "expires_in": "5 minutes",
  "api_owner": "@hardhackar007",
  "proxied": true,
  "timestamp": "2026-03-20T...",
  "cache_key": "iwk:a cute cat"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-20T...",
  "version": "1.0.0",
  "config": {
    "rate_limit": 10,
    "cache_ttl": 300,
    "target_api": "..."
  }
}
```

### GET /stats
Usage statistics.

**Response:**
```json
{
  "total_requests": 42,
  "successful_requests": 40,
  "failed_requests": 2,
  "last_reset": "2026-03-20T..."
}
```

---

## ⚙️ CONFIGURATION OPTIONS

### Environment Variables (in wrangler.toml)

```toml
[vars]
# Requests per minute per IP
RATE_LIMIT = "10"

# Cache duration in seconds
CACHE_TTL = "300"

# Target API URL
TARGET_API = "https://image-world-king.vercel.app/api/gen-v1"
```

### Customize Rate Limit

Change in worker code:
```javascript
const CONFIG = {
  RATE_LIMIT: 20, // Increase to 20 requests/minute
  ...
};
```

### Enable Custom Domain

1. Go to Cloudflare Dashboard → Workers → Your Worker
2. Click "Add Custom Domain"
3. Enter your domain (e.g., `api.yoursite.com`)
4. Follow DNS configuration steps

---

## 💰 COST ESTIMATE

### Free Tier Includes:
- ✅ 100,000 requests/day
- ✅ 100,000 CPU ms/day
- ✅ KV Storage: 100,000 reads/day, 1,000 writes/day

### Estimated Monthly Cost:
- **Free tier**: Up to ~3 million requests/month
- **Paid plan**: $5/month + usage overages

For most personal projects: **$0/month** ✅

---

## 🔒 SECURITY FEATURES

### Built-in Protection:
- ✅ Rate limiting per IP
- ✅ Request validation
- ✅ Prompt length limits (500 chars max)
- ✅ Error handling
- ✅ CORS headers

### Additional Security (Optional):

Add API key authentication:

```javascript
// Add to worker code
function validateApiKey(request) {
  const apiKey = request.headers.get('X-API-Key');
  return apiKey === env.API_KEY;
}
```

Then set API key:
```bash
wrangler secret put API_KEY
```

---

## 🐛 TROUBLESHOOTING

### Issue: Deployment fails
```bash
# Update wrangler
npm install -g wrangler@latest

# Re-login
wrangler logout
wrangler login
```

### Issue: Rate limiting not working
Make sure KV namespaces are created and configured:
```bash
wrangler kv:namespace list
```

### Issue: CORS errors in browser
Check that CORS headers are set correctly:
```bash
curl -I "https://your-worker.workers.dev/health"
# Should see: Access-Control-Allow-Origin: *
```

### Issue: High latency
- Enable caching (already configured)
- Use Cloudflare's global network (automatic)
- Check target API status

---

## 📈 MONITORING

### Cloudflare Dashboard
1. Go to Workers & Pages
2. Select your worker
3. View analytics and logs

### Real-time Logs
```bash
wrangler tail
```

### Custom Analytics
Add more detailed tracking in the worker:
```javascript
console.log('Request:', {
  path: url.pathname,
  method: request.method,
  clientId: getClientId(request)
});
```

---

## 🔄 AUTOMATIC DEPLOYMENT (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Worker

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install Wrangler
      run: npm install -g wrangler
    
    - name: Deploy
      env:
        CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
      run: wrangler deploy --config wrangler-image-world-king.toml
```

---

## 🎓 BEST PRACTICES

### Do's ✅
- Monitor usage regularly
- Adjust rate limits based on needs
- Use KV storage for production
- Set up custom domains for branding
- Implement error logging
- Test locally before deploying

### Don'ts ❌
- Don't expose without rate limiting
- Don't use for high-volume without monitoring
- Don't rely on without backup plan
- Don't forget to check Cloudflare bills

---

## 📞 QUICK COMMANDS REFERENCE

```bash
# Login
wrangler login

# Local development
wrangler dev worker-image-world-king.js --local

# Deploy
wrangler deploy worker-image-world-king.js --config wrangler-image-world-king.toml

# View logs
wrangler tail

# Create KV namespace
wrangler kv:namespace create "NAME"

# List KV namespaces
wrangler kv:namespace list

# Check worker status
wrangler status

# Rollback deployment
wrangler rollback
```

---

## ✨ SUCCESS CHECKLIST

- [ ] Wrangler installed globally
- [ ] Authenticated with Cloudflare (`wrangler login`)
- [ ] KV namespaces created (optional)
- [ ] wrangler.toml configured with KV IDs
- [ ] Local testing successful
- [ ] Worker deployed to production
- [ ] Production endpoint tested
- [ ] Rate limiting verified
- [ ] CORS working
- [ ] Monitoring enabled

---

## 🎉 YOU'RE DONE!

Your Image World King proxy is now running on Cloudflare Workers!

**Your endpoints:**
- Production: `https://image-world-king-proxy.<your-subdomain>.workers.dev/api/generate`
- Health: `https://image-world-king-proxy.<your-subdomain>.workers.dev/health`
- Stats: `https://image-world-king-proxy.<your-subdomain>.workers.dev/stats`

**Next steps:**
1. Test with various prompts
2. Monitor usage in Cloudflare dashboard
3. Share with your team
4. Build awesome applications!

---

*Deployment Guide - Image World King Worker Proxy*  
*Last Updated: March 20, 2026*  
*Status: ✅ Production Ready*
