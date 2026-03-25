# Raphael AI - Quick Reference Card

## 🎯 Main API Endpoint

```http
POST https://raphael.app/api/ai-image-editor
Content-Type: application/json

{
  "input_image_base64": "<base64_webp>",
  "input_image_mime_type": "image/webp",
  "input_image_extension": "webp",
  "width": 720,
  "height": 480,
  "mode": "standard|pro|max",
  "client_request_id": "uuid-v4"
}

Response:
{
  "output_image_url": "https://raphael.app/api/proxy-image/{uuid}.webp?wm=1",
  "credits_used": 2,
  "credits_remaining": 8
}
```

---

## ⚡ Quick Commands

### Test Direct API
```bash
node test-direct-raphael.js ./image.jpg standard ./output.webp
```

### Capture Network Traffic
```bash
node capture-raphael-api.js
```

### Run Full Test Suite
```bash
node test-raphael-api.js ./test-image.jpg
```

---

## 💰 Credit System

| Mode | Cost | Quality | Time |
|------|------|---------|------|
| Standard | 2 credits | Basic | ~15s |
| Pro | 12 credits | High | ~9s |
| Max | 24 credits | Maximum | Instant |

**Free Tier:** 10 credits/day = 5 standard edits daily

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `test-direct-raphael.js` | Direct API client |
| `raphael-ai-client.js` | Full client library |
| `raphael-editor-clone.html` | Web UI demo |
| `RAPHAEL_API_CAPTURE_RESULTS.md` | Analysis docs |
| `SUCCESS_SUMMARY_RAPHAEL.md` | Complete summary |

---

## 📝 Code Snippet

```javascript
const axios = require('axios');
const fs = require('fs');

async function edit(imagePath) {
  const image = fs.readFileSync(imagePath).toString('base64');
  
  const response = await axios.post(
    'https://raphael.app/api/ai-image-editor',
    {
      input_image_base64: image,
      input_image_mime_type: 'image/webp',
      input_image_extension: 'webp',
      width: 720,
      height: 480,
      mode: 'standard',
      client_request_id: crypto.randomUUID()
    }
  );
  
  console.log('Result:', response.data.output_image_url);
}
```

---

## ⚠️ Important Notes

- ✅ **No authentication required** for edit endpoint
- ⚠️ **Rate limits likely apply** (unknown threshold)
- ✅ **Synchronous processing** (~15-30 seconds)
- ✅ **WebP format only** for output
- ⚠️ **Respect ToS** - use ethically

---

## 🆘 Troubleshooting

**429 Error:** Rate limited - wait between requests  
**Timeout:** Increase timeout to 120s  
**401/403:** May need browser automation fallback  
**Large files:** Resize to 720x480 before sending  

---

## 📞 Documentation Links

- [Complete Guide](./RAPHAEL_AI_REVERSE_ENGINEERING.md)
- [Quick Start](./QUICK_START_RAPHAEL.md)
- [API Analysis](./RAPHAEL_API_CAPTURE_RESULTS.md)
- [Success Summary](./SUCCESS_SUMMARY_RAPHAEL.md)

---

**🚀 Start here:** `node test-direct-raphael.js ./your-image.jpg`
