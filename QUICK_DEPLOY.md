# 🚀 Quick Deploy: MU-Devs Flux API Worker

## ⚡ 3-Step Deployment

### Step 1: Install Wrangler
```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare
```bash
wrangler login
```

### Step 3: Deploy
```bash
cd "c:\Users\Ronit\Downloads\test models 2"
wrangler deploy
```

That's it! Your worker will be live at:
```
https://flux-api-proxy.<your-subdomain>.workers.dev
```

---

## 🧪 Test It

### PowerShell
```powershell
$body = @{ prompt = "A cat in space" } | ConvertTo-Json
$result = Invoke-RestMethod -Uri "https://flux-api-proxy.<your-subdomain>.workers.dev" `
                            -Method Post `
                            -ContentType "application/json" `
                            -Body $body
Write-Host "Image URL: $($result.imageUrl)"
```

### cURL
```bash
curl -X POST https://flux-api-proxy.<your-subdomain>.workers.dev \
  -H "Content-Type: application/json" \
  -d "{\"prompt\":\"A cat in space\"}"
```

---

## 📋 What You Get

✅ **Your own API endpoint**  
✅ **CORS support** (works in browsers)  
✅ **Input validation**  
✅ **Error handling**  
✅ **Request logging**  
✅ **FREE hosting** (100K requests/day)  

---

## 🔐 Add Authentication (Optional)

Set API key secret:
```bash
wrangler secret put API_KEY
```

Then users must include:
```bash
-H "Authorization: Bearer YOUR_API_KEY"
```

---

## 📊 Monitor Usage

View logs:
```bash
wrangler tail
```

Check analytics:
```
https://dash.cloudflare.com/workers
```

---

## 💰 Cost

**Free tier**: 100,000 requests/day ✅  
**Paid plan**: $5/month for 10M requests/month  

---

**Full guide**: [`DEPLOYMENT_GUIDE.md`](file:///c:/Users/Ronit/Downloads/test%20models%202/DEPLOYMENT_GUIDE.md)
