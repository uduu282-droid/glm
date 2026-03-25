# 🚀 Quick Reference - Reverse Engineered APIs

## 📝 Text Generation (AIHubMix)

### Your Deployed Worker:
```
https://aihubmix-worker.llamai.workers.dev
```

### Usage:
```bash
# Simple request
curl https://aihubmix-worker.llamai.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o-free","messages":[{"role":"user","content":"Hello!"}]}'

# Check stats
curl https://aihubmix-worker.llamai.workers.dev/stats
```

### JavaScript:
```javascript
const response = await fetch(
  'https://aihubmix-worker.llamai.workers.dev/v1/chat/completions',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-free',
      messages: [{ role: 'user', content: 'Hello!' }]
    })
  }
);
const data = await response.json();
```

### Python:
```python
import requests

response = requests.post(
    'https://aihubmix-worker.llamai.workers.dev/v1/chat/completions',
    json={
        'model': 'gpt-4o-free',
        'messages': [{'role': 'user', 'content': 'Hello!'}]
    }
)
data = response.json()
```

---

## 🎨 Image Generation (Pollinations)

### FREE Direct API:
```
https://image.pollinations.ai/prompt/{your_prompt}
```

### Usage:
```bash
# Download image directly
curl "https://image.pollinations.ai/prompt/sunset?width=1024&height=1024" -o sunset.jpg

# With parameters
curl "https://image.pollinations.ai/prompt/cyberpunk_city?width=1024&height=768&model=flux&nologo=true" -o city.jpg
```

### JavaScript:
```javascript
// Get as blob
const response = await fetch(
  'https://image.pollinations.ai/prompt/sunset?width=1024&height=1024'
);
const blob = await response.blob();

// Display in browser
const imageUrl = URL.createObjectURL(blob);
document.getElementById('myImage').src = imageUrl;
```

### Python:
```python
import requests

response = requests.get(
    'https://image.pollinations.ai/prompt/sunset',
    params={'width': 1024, 'height': 1024, 'model': 'flux'}
)

with open('sunset.jpg', 'wb') as f:
    f.write(response.content)
```

---

## 🔑 Available Models

### Coding Models:
- `coding-glm-5-free`
- `coding-glm-5-turbo-free`
- `coding-minimax-m2.7-free` ⭐
- `minimax-m2.5-free`
- `coding-minimax-m2.5-free`
- `coding-minimax-m2.1-free`
- `coding-glm-4.7-free`
- `coding-glm-4.6-free`
- `coding-minimax-m2-free`
- `kimi-for-coding-free`

### General Models:
- `gpt-4.1-free` ⭐⭐⭐
- `gpt-4.1-mini-free`
- `gpt-4.1-nano-free`
- `gpt-4o-free` ⭐⭐⭐
- `glm-4.7-flash-free`
- `step-3.5-flash-free`
- `mimo-v2-flash-free`

### Vision Models:
- `gemini-3.1-flash-image-preview-free`
- `gemini-3-flash-preview-free`
- `gemini-2.0-flash-free`

---

## 📊 Rate Limits

### AIHubMix (Per Key):
- **5 requests/minute**
- **500 requests/day**

### With 10 Keys (Your Setup):
- **50 requests/minute** ✅
- **5,000 requests/day** ✅

### Pollinations Direct:
- **FREE** - No auth required
- Anonymous rate limits apply
- No account needed

---

## 🧪 Test Commands

### Test AIHubMix Worker:
```bash
node test-key-rotation.js
```

### Test 10 Rapid Requests:
```bash
node test-10-rapid-requests.js
```

### Test All 20 Models:
```bash
node test-all-models.js
```

### Test Pollinations API:
```bash
node pollinations-api-reverse.js
```

---

## 📁 File Locations

### AIHubMix Files:
- `worker-aihubmix.js` - Worker code (v3.0 with rotation)
- `wrangler-aihubmix.toml` - Deploy config
- `test-key-rotation.js` - Rotation test
- `test-10-rapid-requests.js` - Load test
- `test-all-models.js` - Model test

### Pollinations Files:
- `test-pollinations-api.js` - Basic test
- `pollinations-api-reverse.js` - Implementation
- `worker-pollinations.js` - Worker version
- `POLLINATIONS_API_DOCS.md` - Full docs

### Documentation:
- `REVERSE_ENGINEERING_SUMMARY.md` - Complete summary
- `QUICK_REFERENCE.md` - This file

---

## 💡 Pro Tips

### AIHubMix:
1. Always use your worker (not direct API) for automatic key rotation
2. Check `/stats` endpoint to monitor key usage
3. Auto-failover handles rate limits automatically
4. Best models: `gpt-4o-free`, `gpt-4.1-free`, `coding-minimax-m2.7-free`

### Pollinations:
1. Use direct API for free image generation
2. Add `nologo=true` to remove watermark
3. Try different models: `flux`, `stable-diffusion`, etc.
4. Custom dimensions supported up to 2048x2048

---

## 🆘 Troubleshooting

### Getting 429 (Rate Limit)?
- AIHubMix worker auto-retries with next key
- Wait a few seconds between requests to same model
- Rotate between different models

### Getting 402 (Payment Required)?
- anmixai proxy requires balance
- Use direct Pollinations API instead (FREE!)

### Worker Not Working?
- Check deployment: `wrangler deploy --config wrangler-aihubmix.toml`
- Verify API keys are correct in worker code
- Check Cloudflare dashboard for errors

---

## 🎯 Recommended Workflow

### For Text:
```bash
# Use your deployed worker
curl https://aihubmix-worker.llamai.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o-free","messages":[{"role":"user","content":"Hi!"}]}'
```

### For Images:
```bash
# Use direct free API
curl "https://image.pollinations.ai/prompt/your_idea?width=1024&height=1024" -o result.jpg
```

---

**Everything is tested, documented, and ready to use!** 🚀
