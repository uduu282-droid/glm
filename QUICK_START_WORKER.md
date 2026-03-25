# 🖼️ Image World King Worker - Quick Start

## 🎯 Your Worker is LIVE!

**URL:** `https://image-world-king-proxy.llamai.workers.dev`

---

## ⚡ INSTANT USAGE (Copy & Paste)

### cURL
```bash
curl "https://image-world-king-proxy.llamai.workers.dev/api/generate?prompt=a%20cute%20cat"
```

### JavaScript
```javascript
const img = await fetch('https://image-world-king-proxy.llamai.workers.dev/api/generate?prompt=' + encodeURIComponent('a cat')).then(r => r.json());
console.log(img.image_url);
```

### Python
```python
import requests
data = requests.get('https://image-world-king-proxy.llamai.workers.dev/api/generate?prompt=a cat').json()
print(data['image_url'])
```

---

## 📊 RESPONSE FORMAT

```json
{
  "success": true,
  "image_url": "https://i.ibb.co/...",
  "thumbnail": "https://i.ibb.co/...",
  "prompt": "a cute cat",
  "size_bytes": 103892,
  "expires_in": "5 minutes",
  "proxied": true,
  "cache_key": "iwk:a cute cat"
}
```

---

## 🎨 EXAMPLE PROMPTS

```bash
# Animals
curl "https://image-world-king-proxy.llamai.workers.dev/api/generate?prompt=a%20majestic%20lion"

# Landscapes
curl "https://image-world-king-proxy.llamai.workers.dev/api/generate?prompt=sunset%20over%20mountains"

# Fantasy
curl "https://image-world-king-proxy.llamai.workers.dev/api/generate?prompt=magical%20castle%20in%20the%20clouds"

# Sci-Fi
curl "https://image-world-king-proxy.llamai.workers.dev/api/generate?prompt=futuristic%20city%20at%20night"
```

---

## 🔧 ENDPOINTS

| Endpoint | Description |
|----------|-------------|
| `GET /api/generate?prompt={text}` | Generate AI image |
| `GET /health` | Health check |
| `GET /stats` | Usage statistics |

---

## ⚠️ IMPORTANT

- ⏰ **Download images immediately** - URLs expire in 5 minutes
- 🐌 **Add delays** - Wait 5+ seconds between requests
- 📊 **Rate limited** - 10 requests/minute per IP
- 💾 **Save locally** - Don't rely on imgbb URLs permanently

---

## 📞 TROUBLESHOOTING

### Not Working?
```bash
# Check health
curl https://image-world-king-proxy.llamai.workers.dev/health

# Should return: {"status": "healthy", ...}
```

### Getting Errors?
- Check URL encoding (use `encodeURIComponent()`)
- Verify internet connection
- API may be temporarily down

---

## 💻 CODE SNIPPETS

### Full JavaScript Example
```javascript
async function generateAndSave(prompt, filename) {
  const url = `https://image-world-king-proxy.llamai.workers.dev/api/generate?prompt=${encodeURIComponent(prompt)}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error);
  }
  
  // Download image
  const imgResponse = await fetch(data.image_url);
  const buffer = await imgResponse.arrayBuffer();
  
  // Save to file
  fs.writeFileSync(filename, Buffer.from(buffer));
  console.log(`Saved: ${filename}`);
}

// Usage
generateAndSave('a beautiful sunset', 'sunset.jpg');
```

### Full Python Example
```python
import requests
import time

def generate_images(prompts):
    base_url = 'https://image-world-king-proxy.llamai.workers.dev'
    
    for i, prompt in enumerate(prompts):
        print(f"Generating {i+1}/{len(prompts)}: {prompt}")
        
        response = requests.get(f'{base_url}/api/generate?prompt={prompt}')
        data = response.json()
        
        if data['success']:
            # Download image
            img_response = requests.get(data['image_url'])
            
            # Save
            filename = f'image_{i+1}.jpg'
            with open(filename, 'wb') as f:
                f.write(img_response.content)
            
            print(f"✅ Saved: {filename}")
        else:
            print(f"❌ Failed: {data['error']}")
        
        # Be respectful - add delay
        if i < len(prompts) - 1:
            time.sleep(5)

# Usage
prompts = [
    'a mystical forest',
    'cyberpunk city',
    'cute anime character'
]
generate_images(prompts)
```

---

## 🌟 FEATURES

✅ Free to use  
✅ No authentication required  
✅ Rate limiting (10/min)  
✅ Caching (faster responses)  
✅ CORS enabled  
✅ Global CDN (fast)  
✅ Error handling  

---

## 📈 MONITORING

```bash
# View logs
wrangler tail

# Check dashboard
https://dash.cloudflare.com/workers
```

---

## 🔄 UPDATE WORKER

```bash
# Deploy changes
wrangler deploy worker-image-world-king.js --config wrangler-image-world-king.toml

# Rollback if needed
wrangler rollback
```

---

## 📁 FILES

- `worker-image-world-king.js` - Worker code
- `wrangler-image-world-king.toml` - Configuration
- `DEPLOYMENT_SUCCESS.md` - Full deployment report
- `README_IMAGE_WORLD_KING_WORKER.md` - Complete documentation

---

## ✨ YOU'RE READY!

Start generating AI images now! 🎨

**Your first image:**
```bash
curl "https://image-world-king-proxy.llamai.workers.dev/api/generate?prompt=a%20beautiful%20sunset"
```

---

*Quick Start Guide - Image World King Worker*  
*Status: ✅ LIVE*  
*URL: https://image-world-king-proxy.llamai.workers.dev*
