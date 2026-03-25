# 🚀 Quick Deploy: Runware AI Image Worker

## ⚡ 3-Step Deployment

### Step 1: Get Runware API Key
1. Go to https://runware.ai/
2. Sign up and get your API key
3. Note: Uses credit-based system

### Step 2: Install Wrangler
```bash
npm install -g wrangler
```

### Step 3: Deploy
```bash
# Login
wrangler login

# Set API key
wrangler secret put RUNWARE_API_KEY

# Deploy
wrangler deploy --config wrangler-runware.toml
```

Your worker will be live at:
```
https://runware-image-worker.<your-subdomain>.workers.dev
```

---

## 🧪 Test It

### PowerShell
```powershell
$body = @{
    prompt = "A magical forest"
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

### Python
```python
import requests

response = requests.post(
    'https://runware-image-worker.<your-subdomain>.workers.dev',
    json={
        "prompt": "A magical forest",
        "model": "runware:100@1",
        "width": 1024,
        "height": 1024,
        "steps": 20,
        "CFGScale": 7.5,
        "numberResults": 1,
        "outputType": "URL"
    }
)

print(f"Generated {len(response.json()['images'])} images")
```

---

## 📋 Features

✅ **Only Runware** (no Pollinations)  
✅ **Direct API integration**  
✅ **Multiple models** (FLUX.1 Schnell, Dev, etc.)  
✅ **Advanced parameters** (steps, CFGScale, negative prompts)  
✅ **CORS support**  
✅ **Input validation**  
✅ **FREE hosting** (100K requests/day)  

---

## 💰 Cost

**Cloudflare Workers**: FREE (100K requests/day)  
**Runware API**: Credit-based (~$0.01-0.02 per image)  

Example: 1000 images/day ≈ $300-600/month in Runware credits

---

## 🔐 Security

Worker requires `RUNWARE_API_KEY` secret (set with `wrangler secret put`)

Optional: Add your own API key auth:
```bash
wrangler secret put YOUR_API_KEY
```

Then clients must include:
```bash
-H "Authorization: Bearer YOUR_SECRET_KEY"
```

---

## 📊 Monitor

View logs:
```bash
wrangler tail
```

Check analytics:
```
https://dash.cloudflare.com/workers
```

---

## 🎯 Supported Models

- `runware:100@1` - FLUX.1 Schnell (fast)
- `runware:101@1` - FLUX.1 Dev (quality)
- `runware:106@1` - FLUX.1 Kontext Dev
- `bfl:3@1` - FLUX.1 Kontext Pro

---

**Full guide**: [`DEPLOYMENT_GUIDE_RUNWARE.md`](file:///c:/Users/Ronit/Downloads/test%20models%202/DEPLOYMENT_GUIDE_RUNWARE.md)
