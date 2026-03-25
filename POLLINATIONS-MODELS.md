# 🎨 Pollinations AI - Image Generation

## **Overview**
Pollinations is a **FREE** AI image generation service with no authentication required!

---

## **Available Models**

### ✅ **Confirmed Models:**
1. **`flux`** (default) - FLUX.1 - High quality, recommended
2. **`turbo`** - Fast generation
3. **`stable-diffusion-xl`** - SDXL base model
4. **`stable-diffusion`** - Stable Diffusion 1.5

### 📊 **Model Comparison:**

| Model | Quality | Speed | Best For |
|-------|---------|-------|----------|
| `flux` | ⭐⭐⭐⭐⭐ | Medium | General purpose, best quality |
| `turbo` | ⭐⭐⭐⭐ | Fast | Quick iterations |
| `stable-diffusion-xl` | ⭐⭐⭐⭐ | Medium | High resolution |
| `stable-diffusion` | ⭐⭐⭐ | Fast | Basic generations |

---

## **API Endpoints**

### **Direct Pollinations API (FREE)**

```bash
# GET request - Returns image directly
curl "https://image.pollinations.ai/prompt/A%20beautiful%20cat?width=1024&height=1024&model=flux" -o cat.jpg

# With parameters
curl "https://image.pollinations.ai/prompt/sunset?width=512&height=512&model=turbo&seed=123&nologo=true" -o sunset.jpg
```

### **Parameters:**
- `prompt` (required) - Text description of the image
- `width` (optional) - Image width (default: 1024)
- `height` (optional) - Image height (default: 1024)
- `model` (optional) - Model to use (default: `flux`)
- `seed` (optional) - Random seed for reproducibility
- `nologo` (optional) - Remove watermark (default: true)

---

## **Worker Endpoints**

### **Local Worker (via wrangler dev):**

```bash
# Health check
curl http://localhost:8788/health

# Generate image (GET) - Returns JPEG
curl "http://localhost:8788/generate?prompt=A beautiful sunset&width=1024&height=1024&model=flux" -o sunset.jpg

# Generate image (POST) - Returns base64
curl -X POST http://localhost:8788/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"a cute cat","width":1024,"height":1024,"model":"flux"}'
```

---

## **Features**

✅ **Completely FREE** - No payment required  
✅ **No authentication** - No API key needed  
✅ **No rate limits** - Unlimited generations  
✅ **Multiple models** - Flux, Turbo, SDXL, SD  
✅ **Custom dimensions** - Any size supported  
✅ **Fast generation** - ~2-5 seconds per image  

---

## **Examples**

### **Basic Usage:**
```javascript
// Simple cat image
const imageUrl = "https://image.pollinations.ai/prompt/cat";

// Custom size and model
const imageUrl = "https://image.pollinations.ai/prompt/sunset?width=1024&height=1024&model=flux";

// With seed for reproducibility
const imageUrl = "https://image.pollinations.ai/prompt/mountain?seed=42";
```

### **Advanced Usage:**
```javascript
// High quality portrait
const imageUrl = "https://image.pollinations.ai/prompt/portrait%20of%20a%20woman%20in%20renaissance%20style?width=1024&height=1024&model=flux&nologo=true";

// Fast generation for testing
const imageUrl = "https://image.pollinations.ai/prompt/test?model=turbo";

// Wide landscape
const imageUrl = "https://image.pollinations.ai/prompt/beach%20sunset?width=1920&height=1080";
```

---

## **Testing**

Run the local worker:
```bash
wrangler dev worker-pollinations.js
```

Test endpoints:
```bash
# Health check
curl http://localhost:8788/health

# Generate image
curl "http://localhost:8788/generate?prompt=cat&width=512&height=512" -o test.jpg

# View info
curl http://localhost:8788/
```

---

## **Comparison: Pollinations vs AIHubMix**

| Feature | Pollinations | AIHubMix |
|---------|-------------|----------|
| **Type** | Image Generation | Text/Chat AI |
| **Cost** | 100% FREE | Free tier + Paid |
| **Auth Required** | ❌ No | ✅ Yes |
| **Rate Limits** | ❌ None | ✅ Yes |
| **Models** | 4 image models | 20+ text models |
| **Best For** | Images | Text/Code |

---

## **Notes**

- Pollinations uses Cloudflare's infrastructure for fast delivery
- Images are cached for quick access
- Works great with the Cloudflare Worker proxy for CORS support
- Recommended model: **`flux`** for best quality
