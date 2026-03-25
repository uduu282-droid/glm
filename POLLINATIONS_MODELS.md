# 🎨 Pollinations API - Complete Models List

## ✅ Worker Deployed Successfully!

**Worker URL:** `https://pollinations-image-worker.llamai.workers.dev`

---

## 📊 Available Models (2026)

### 🖼️ **Image Generation Models**

#### 1. **FLUX.1** ⭐ RECOMMENDED
```
Model ID: flux
Quality: Highest
Speed: Normal (~30-60 seconds per image)
Best For: Professional quality images, detailed artwork
```

**Usage:**
```bash
curl "https://image.pollinations.ai/prompt/cat?model=flux&width=1024&height=1024" -o cat.jpg

# Via your worker
curl "https://pollinations-image-worker.llamai.workers.dev/generate?prompt=cat&model=flux" -o cat.jpg
```

**Features:**
- ✅ Best quality output
- ✅ Excellent prompt adherence
- ✅ Good for complex scenes
- ✅ Supports up to 2048x2048 resolution
- ⏳ Slower generation time

---

#### 2. **Turbo**
```
Model ID: turbo
Quality: Good
Speed: Fast (~10-20 seconds per image)
Best For: Quick iterations, testing prompts
```

**Usage:**
```bash
curl "https://image.pollinations.ai/prompt/cat?model=turbo&width=512&height=512" -o cat-fast.jpg
```

**Features:**
- ✅ Fast generation
- ✅ Good for prototyping
- ⚠️ Lower quality than FLUX
- ⚠️ Less detail in complex scenes

---

#### 3. **Stable Diffusion**
```
Model ID: stable-diffusion
Quality: Very Good
Speed: Normal
Best For: General purpose, artistic styles
```

**Usage:**
```bash
curl "https://image.pollinations.ai/prompt/cat?model=stable-diffusion" -o cat-sd.jpg
```

**Features:**
- ✅ Proven reliable model
- ✅ Good artistic quality
- ✅ Large community support
- ✅ Many style variations available

---

### 📝 **Text Generation Models**

Access via: `https://gen.pollinations.ai/v1/chat/completions`

#### OpenAI-Compatible API
```
Endpoint: gen.pollinations.ai/v1/chat/completions
Format: OpenAI-compatible
Authentication: API key required (pk_...)
```

**Usage:**
```bash
curl https://gen.pollinations.ai/v1/chat/completions \
  -H "Authorization: Bearer pk_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai-compatible",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## 🎯 Model Comparison Table

| Model | Quality | Speed | Best Use Case | Recommended For |
|-------|---------|-------|---------------|-----------------|
| **flux** ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Professional work | Production images |
| **turbo** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Testing/prototyping | Quick iterations |
| **stable-diffusion** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Artistic projects | General purpose |

---

## 📐 Supported Parameters

### All Models Support:

```javascript
{
  "prompt": "Your description",        // Required
  "width": 1024,                       // Optional, default: 1024
  "height": 1024,                      // Optional, default: 1024
  "seed": 12345,                       // Optional, random if not provided
  "model": "flux",                     // Optional, default: "flux"
  "nologo": true                       // Optional, remove watermark
}
```

### Dimension Options:

```javascript
// Square
512x512
1024x1024
2048x2048 (max)

// Portrait
768x1024
1024x1536

// Landscape
1024x768
1536x1024
```

---

## 💡 Model Selection Guide

### Choose **FLUX** when:
- ✅ You need highest quality
- ✅ Creating final production images
- ✅ Complex scenes with multiple elements
- ✅ Professional/artistic work
- ⏳ You can wait 30-60 seconds

### Choose **TURBO** when:
- ✅ Rapid prototyping
- ✅ Testing different prompts
- ✅ Need quick results
- ✅ Iterating on ideas
- ⚡ Speed is priority

### Choose **STABLE DIFFUSION** when:
- ✅ Artistic/stylized images
- ✅ General purpose use
- ✅ Balanced quality/speed
- ✅ Experimenting with styles

---

## 🔥 Popular Prompts by Model

### For FLUX (High Detail):
```
"A cyberpunk city at night with neon lights and flying cars, highly detailed, 8k"
"Portrait of a warrior princess with intricate armor, dramatic lighting, photorealistic"
"Mystical forest with glowing mushrooms and fairy lights, magical atmosphere, ultra detailed"
```

### For TURBO (Quick Tests):
```
"cat sitting"
"red car"
"sunset beach"
"mountain landscape"
```

### For STABLE DIFFUSION (Artistic):
```
"watercolor painting of a cottage garden"
"oil portrait in renaissance style"
"anime character, studio ghibli style"
"art deco poster design"
```

---

## 🎨 Advanced Features

### Seed Control (Reproducible Results):
```javascript
// Same seed = same image composition
const seed = 42;

// Use consistent seed across tests
curl "https://image.pollinations.ai/prompt/cat?seed=42&width=1024" -o cat1.jpg
curl "https://image.pollinations.ai/prompt/dog?seed=42&width=1024" -o dog1.jpg
// Both will have similar composition/style
```

### Custom Dimensions:
```javascript
// Portrait for人物
curl ".../prompt/portrait?width=768&height=1024"

// Landscape for scenery
curl ".../prompt/landscape?width=1536&height=1024"

// Ultra HD (if supported)
curl ".../prompt/detail?width=2048&height=2048"
```

### Negative Prompts (Some Models):
```javascript
// Note: Not all models support negative prompts
// Check current API docs for latest features
```

---

## 📊 Performance Benchmarks

### Generation Time (Average):

| Model | 512x512 | 1024x1024 | 2048x2048 |
|-------|---------|-----------|-----------|
| **flux** | ~30s | ~45s | ~90s |
| **turbo** | ~10s | ~15s | ~30s |
| **stable-diffusion** | ~20s | ~30s | ~60s |

*Times vary based on server load and complexity*

---

## 🆘 Troubleshooting

### Issue: Getting 500 Errors
```
Problem: Server errors from Pollinations
Solution: 
1. Wait 5-10 seconds and retry
2. Try different model (e.g., switch from flux to turbo)
3. Reduce image dimensions
4. Use simpler prompts
```

### Issue: Rate Limiting
```
Problem: Getting placeholder images or 429 errors
Solution:
1. Add 15-20 second delays between requests
2. Use API key (Spore tier or higher)
3. Implement retry logic with exponential backoff
```

### Issue: Poor Image Quality
```
Problem: Images look blurry or distorted
Solution:
1. Switch to FLUX model for better quality
2. Increase dimensions (try 1024x1024 instead of 512x512)
3. Add more descriptive prompt details
4. Try different seed values
```

---

## 🚀 Your Deployed Worker

### Endpoints:

**1. GET /generate**
```
Returns: JPEG image directly
Example: https://pollinations-image-worker.llamai.workers.dev/generate?prompt=cat&width=512
```

**2. POST /generate**
```
Returns: JSON with base64 image
Example: 
curl https://pollinations-image-worker.llamai.workers.dev/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"cat","model":"flux"}'
```

**3. /health**
```
Returns: Worker health status
Example: https://pollinations-image-worker.llamai.workers.dev/health
```

**4. Root /**
```
Returns: Worker info and documentation
Example: https://pollinations-image-worker.llamai.workers.dev/
```

---

## 📚 Resources

### Official Links:
- **Main Site:** https://pollinations.ai
- **API Docs:** https://enter.pollinations.ai/api/docs
- **GitHub:** https://github.com/pollinations/pollinations
- **Discord:** Join for support and updates

### Community Resources:
- **Showcase:** See what others are creating
- **Prompt Library:** Share and discover prompts
- **Model Updates:** Stay informed about new models

---

## 🎯 Quick Reference

### Most Common Usage:
```bash
# Best quality (FLUX model)
curl "https://pollinations-image-worker.llamai.workers.dev/generate?prompt=your_prompt&model=flux" -o output.jpg

# Fast test (Turbo model)
curl "https://pollinations-image-worker.llamai.workers.dev/generate?prompt=your_prompt&model=turbo" -o output.jpg

# Custom size
curl "https://pollinations-image-worker.llamai.workers.dev/generate?prompt=your_prompt&width=1536&height=1024" -o output.jpg

# With seed for reproducibility
curl "https://pollinations-image-worker.llamai.workers.dev/generate?prompt=your_prompt&seed=42" -o output.jpg
```

---

## ✨ Summary

**Your worker provides:**
- ✅ FREE access to Pollinations models
- ✅ No authentication required
- ✅ Multiple model choices (flux, turbo, stable-diffusion)
- ✅ Custom dimensions support
- ✅ CORS enabled for browser use
- ✅ Both GET and POST endpoints
- ✅ Base64 or direct image output

**Recommended workflow:**
1. Start with **turbo** for quick testing
2. Switch to **flux** for final production images
3. Use custom seeds for reproducible results
4. Add 15-20s delays for anonymous usage
5. Consider API key registration for higher limits

---

**Last Updated:** March 21, 2026  
**Worker Version:** 1.0.0  
**Status:** ✅ Deployed and operational
