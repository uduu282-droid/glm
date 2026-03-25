# 🚀 Runware Image Worker - Quick Docs

## ✅ Deployed & Working!

**Your Worker URL**:  
**https://runware-image-worker.llamai.workers.dev**

---

## 📡 API Endpoint

```
POST https://runware-image-worker.llamai.workers.dev
Content-Type: application/json
```

---

## 📝 Request Format

```json
{
  "prompt": "A magical forest with glowing mushrooms",
  "model": "runware:100@1",
  "width": 1024,
  "height": 1024,
  "steps": 20,
  "CFGScale": 7.5,
  "numberResults": 1,
  "outputType": "URL"
}
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | ✅ Yes | - | Image description (3-2000 chars) |
| `model` | string | No | `runware:100@1` | Model ID (see below) |
| `width` | integer | No | 1024 | Image width (256-2048) |
| `height` | integer | No | 1024 | Image height (256-2048) |
| `steps` | integer | No | 20 | Inference steps (1-100) |
| `CFGScale` | float | No | 7.5 | Guidance scale (1-20) |
| `numberResults` | integer | No | 1 | Images to generate (1-10) |
| `outputType` | string | No | `"URL"` | Must be: `"URL"`, `"base64Data"`, or `"dataURI"` |

### Available Models

- `runware:100@1` - FLUX.1 Schnell (fast, ~2-3s)
- `runware:101@1` - FLUX.1 Dev (quality, ~3-5s)
- `runware:106@1` - FLUX.1 Kontext Dev
- `bfl:3@1` - FLUX.1 Kontext Pro

---

## 📤 Response Format

### Success (HTTP 200)

```json
{
  "success": true,
  "images": [
    { "url": "https://im.runware.ai/image/..." }
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

### Error (HTTP 4xx/5xx)

```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## 💻 Usage Examples

### cURL

```bash
curl -X POST https://runware-image-worker.llamai.workers.dev \
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

### PowerShell

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

$result = Invoke-RestMethod -Uri "https://runware-image-worker.llamai.workers.dev" `
                            -Method Post `
                            -ContentType "application/json" `
                            -Body $body

Write-Host "📷 Image URL: $($result.images[0].url)"
```

### Python

```python
import requests

response = requests.post(
    'https://runware-image-worker.llamai.workers.dev',
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
print(f"Image URL: {data['images'][0]['url']}")
```

### JavaScript (Browser)

```javascript
const response = await fetch('https://runware-image-worker.llamai.workers.dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        prompt: "A magical forest with glowing mushrooms",
        model: "runware:100@1",
        width: 1024,
        height: 1024,
        steps: 20,
        CFGScale: 7.5,
        numberResults: 1,
        outputType: "URL"
    })
});

const data = await response.json();
console.log(`Image URL: ${data.images[0].url}`);
```

---

## ⚠️ Important Notes

1. **outputType MUST be uppercase**: `"URL"` not `"url"`
2. **Prompt length**: 3-2000 characters
3. **Dimensions**: 256-2048 pixels
4. **No API key required** - proxies through ai-image-gen-zeta.vercel.app

---

## 🎯 Performance

- **Speed**: ~2-6 seconds per image
- **Quality**: High (FLUX.1 models)
- **Cost**: FREE (proxying through third-party)
- **Rate Limits**: Depends on upstream service

---

## 🐛 Troubleshooting

### Error: "Invalid outputType"
Make sure it's uppercase: `"URL"` not `"url"`

### Error: "Prompt is required"
Check that prompt is 3-2000 characters

### Error: "Invalid dimensions"
Width/height must be 256-2048

### Timeout Errors
Try reducing `steps` parameter or use faster model (`runware:100@1`)

---

## 📊 Supported Output Types

- `"URL"` - Returns direct image URLs (default)
- `"base64Data"` - Returns base64 encoded images
- `"dataURI"` - Returns data URI format

---

## 🎉 Features

✅ No API key required  
✅ FREE to use  
✅ CORS enabled for browser access  
✅ Multiple FLUX.1 models  
✅ Advanced parameters (steps, CFGScale)  
✅ Fast generation (~2-6s)  
✅ High-quality output  

---

**Deployed**: March 20, 2026  
**Status**: ✅ Live and working  
**Cost**: 💰 FREE
