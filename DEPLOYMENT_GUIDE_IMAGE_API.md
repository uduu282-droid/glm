# 🚀 Deploy Unified Image API to Cloudflare Workers

**Status:** ✅ **READY TO DEPLOY**  
**Tools:** 5 working endpoints in one Cloudflare Worker

---

## 📁 Files Created

1. `worker-image-api.js` - Main Cloudflare Worker code (193 lines)
2. `wrangler-image-api.toml` - Wrangler configuration
3. `worker-client.html` - Beautiful web interface for the worker
4. `DEPLOYMENT_GUIDE_IMAGE_API.md` - This guide

---

## ⚡ Quick Deploy (3 Steps)

### Step 1: Login to Cloudflare

```bash
npx wrangler login
```

This will open your browser and authenticate you.

---

### Step 2: Test Locally (Optional)

```bash
npx wrangler dev --config wrangler-image-api.toml
```

The worker will run on `http://localhost:8787`

Test it:
```bash
curl http://localhost:8787/health
```

---

### Step 3: Deploy to Cloudflare

```bash
npx wrangler deploy --config wrangler-image-api.toml
```

You'll see output like:
```
Deploying unified-image-api...
Success! Your worker is deployed at:
https://unified-image-api.<your-subdomain>.workers.dev
```

---

## 🌐 Access Your Deployed Worker

### API Endpoints

```
Base URL: https://unified-image-api.<your-subdomain>.workers.dev

GET  /              - API info
GET  /health        - Health check
GET  /api/tools     - List available tools
POST /api/process   - Process images
```

### Web Interface

Open `worker-client.html` in your browser and update the WORKER_URL to your deployed URL, or just visit your worker URL directly and it will work with any frontend.

---

## 🎯 How to Use

### Via Web Interface

1. Open `worker-client.html`
2. Choose tool (5 options)
3. Upload image
4. Click "Process Image"
5. Download result automatically!

---

### Via API (curl)

```bash
# Remove background
curl -X POST https://unified-image-api.<subdomain>.workers.dev/api/process \
  -F "tool=remove-bg" \
  -F "image=@photo.png" \
  --output result.png

# Convert format
curl -X POST https://unified-image-api.<subdomain>.workers.dev/api/process \
  -F "tool=convert-format" \
  -F "image=@photo.jpg" \
  -F "options={\"format\":\"png\"}" \
  --output converted.png

# Image to PDF
curl -X POST https://unified-image-api.<subdomain>.workers.dev/api/process \
  -F "tool=image-to-pdf" \
  -F "image=@document.png" \
  --output document.pdf
```

---

### Via JavaScript

```javascript
const formData = new FormData();
formData.append('tool', 'remove-bg');
formData.append('image', fileInput.files[0]);

const response = await fetch('https://unified-image-api.<subdomain>.workers.dev/api/process', {
  method: 'POST',
  body: formData
});

const blob = await response.blob();
const url = URL.createObjectURL(blob);
// Display or download result
```

---

## 🔧 Configuration

### Change Worker Name

Edit `wrangler-image-api.toml`:
```toml
name = "your-custom-name"
```

Then redeploy:
```bash
npx wrangler deploy --config wrangler-image-api.toml
```

### Custom Domain

1. Go to Cloudflare Dashboard → Workers → Your Worker
2. Click "Add Custom Domain"
3. Follow instructions to set up DNS

---

## 📊 Available Tools

All 5 confirmed working tools:

| Tool | Endpoint | Description |
|------|----------|-------------|
| `remove-bg` | `/api/remove-bg` | Remove background from images |
| `convert-format` | `/api/convert-format` | Convert PNG/JPG/WEBP |
| `image-to-pdf` | `/api/image-to-pdf` | Convert image to PDF |
| `remove-text` | `/api/remove-text` | Remove text/watermarks |
| `remove-gemini-watermark` | `/api/remove-gemini-watermark` | Remove Gemini AI watermarks |

---

## 💰 Pricing & Limits

### Cloudflare Workers Free Tier

- ✅ **100,000 requests per day**
- ✅ **10ms CPU time per request**
- ✅ **Free SSL/HTTPS**
- ✅ **Global edge network**

### Backend API Limits

The backend (`bgremover-backend-...run.app`) may have its own limits:
- File size: ~10MB max
- Rate limiting: Unknown (monitor usage)

---

## 🔍 Monitoring

### Check Worker Logs

```bash
npx wrangler tail --config wrangler-image-api.toml
```

### View Analytics

1. Go to Cloudflare Dashboard
2. Workers → Your Worker
3. Click "Analytics" tab

---

## 🛠️ Troubleshooting

### Deployment Fails

```bash
# Clear cache and retry
npx wrangler logout
npx wrangler login
npx wrangler deploy --config wrangler-image-api.toml
```

### CORS Errors

The worker already includes CORS headers. If you still get errors:
- Make sure you're using HTTPS in production
- Check browser console for specific error

### Backend API Down

If backend returns 500 errors:
- The backend service might be temporarily down
- Try again in a few minutes
- Check backend status if available

---

## 🎨 Example: Complete Workflow

### 1. Deploy Worker
```bash
npx wrangler deploy --config wrangler-image-api.toml
```

### 2. Get Deployed URL
```
https://unified-image-api.your-subdomain.workers.dev
```

### 3. Update Client HTML

Edit `worker-client.html` line ~140:
```javascript
const WORKER_URL = 'https://unified-image-api.your-subdomain.workers.dev/api/process';
```

### 4. Open Client

Just open `worker-client.html` in your browser - it works standalone!

---

## 📈 Performance

### Expected Response Times

- **Remove BG:** 2-4 seconds
- **Convert Format:** 1-3 seconds
- **Image to PDF:** 1-2 seconds
- **Remove Text:** 2-4 seconds
- **Remove Gemini WM:** 3-5 seconds

### Cloudflare Advantages

- ✅ Global CDN (low latency worldwide)
- ✅ Automatic scaling
- ✅ DDoS protection
- ✅ Always free tier sufficient for most uses

---

## 🔐 Security Notes

- ✅ HTTPS by default
- ✅ No authentication required (add if needed)
- ✅ CORS enabled for browser access
- ✅ Input validation built-in
- ⚠️ Consider adding rate limiting for production

---

## 🎉 Success Indicators

After deployment, you should see:

```
✅ Worker deployed at https://unified-image-api.<subdomain>.workers.dev
✅ GET / returns API info
✅ GET /health returns {"status": "ok"}
✅ GET /api/tools lists 5 tools
✅ POST /api/process processes images successfully
```

---

## 🚀 Next Steps

1. **Deploy the worker** (follow Step 3 above)
2. **Test all 5 tools** via web interface or API
3. **Share your deployed URL** with team/users
4. **Monitor usage** in Cloudflare Dashboard
5. **Consider custom domain** for production use

---

## 📞 Quick Reference

### Commands

```bash
# Login
npx wrangler login

# Test locally
npx wrangler dev --config wrangler-image-api.toml

# Deploy
npx wrangler deploy --config wrangler-image-api.toml

# View logs
npx wrangler tail --config wrangler-image-api.toml
```

### URLs

```
Worker: https://unified-image-api.<subdomain>.workers.dev
Health: https://...workers.dev/health
Tools:  https://...workers.dev/api/tools
Client: worker-client.html (open in browser)
```

---

**🎊 Ready to deploy! Run the commands above and your unified image API will be live on Cloudflare Workers!**

**One endpoint. Five powerful tools. Infinite possibilities.** ✨
