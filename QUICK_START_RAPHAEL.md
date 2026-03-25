# Raphael AI Image Editor - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### What You'll Learn
- How the Raphael AI image editor works
- How to capture its API calls
- How to build your own implementation
- Alternative approaches using official APIs

---

## 📋 Prerequisites

- Node.js 16+ installed
- Basic JavaScript knowledge
- A test image (JPG/PNG, under 20MB)
- Browser DevTools access

---

## 🔍 Step 1: Capture Real API Calls

### Option A: Automated Capture (Recommended)

```bash
# Install Puppeteer if you haven't already
npm install puppeteer

# Run the capture tool
node capture-raphael-api.js
```

This will:
1. Open a browser window
2. Navigate to raphael.app/ai-image-editor
3. Record all network requests
4. Save captured data for analysis

**What to do:**
- Upload an image
- Type an edit prompt (e.g., "change background to beach")
- Click generate
- Wait for completion
- Press Ctrl+C to save

### Option B: Manual Capture

1. Open Chrome/Edge DevTools (F12)
2. Go to **Network** tab
3. Filter by **Fetch/XHR**
4. Visit https://raphael.app/ai-image-editor
5. Perform an image edit
6. Look for API requests containing:
   - `api`
   - `graphql`
   - `upload`
   - `generate`
   - `edit`

---

## 📊 Step 2: Analyze Captured Data

After capturing, check these files:

```
raphael_capture/
├── captured_requests_TIMESTAMP.json    # All API requests
├── endpoints_TIMESTAMP.txt             # Unique domains
├── auth_tokens_TIMESTAMP.txt           # Authentication tokens
└── capture_summary_TIMESTAMP.md        # Human-readable summary
```

### Key Information to Extract:

1. **API Endpoint URL**
   ```json
   {
     "url": "https://api.raphael.app/v1/edit",
     "method": "POST"
   }
   ```

2. **Authentication Headers**
   ```json
   {
     "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR..."
   }
   ```

3. **Request Payload Structure**
   ```json
   {
     "image_id": "img_abc123",
     "prompt": "change background to sunset",
     "mode": "standard",
     "credits": 2
   }
   ```

4. **Response Format**
   ```json
   {
     "task_id": "task_xyz789",
     "status": "queued",
     "credits_used": 2,
     "credits_remaining": 8
   }
   ```

---

## 🛠️ Step 3: Test with Client

Use the provided client to interact with the API:

```javascript
const RaphaelAIClient = require('./raphael-ai-client');

// Initialize with your captured API key/token
const client = new RaphaelAIClient({
  apiKey: 'your-captured-token-here',
  baseUrl: 'https://api.raphael.app/v1' // Adjust based on findings
});

async function testEdit() {
  try {
    const result = await client.fullEdit(
      './test-image.jpg',
      'Convert to anime style',
      'standard',
      './output.jpg'
    );
    
    console.log('Success!', result);
  } catch (error) {
    console.error('Failed:', error.message);
  }
}

testEdit();
```

---

## 🎨 Step 4: Try the Web Interface

Open `raphael-editor-clone.html` in your browser for a demo interface.

**Features:**
- Drag & drop image upload
- Mode selection (Standard/Pro/Max)
- Example prompts
- Real-time preview
- Download results

**Note:** The included HTML is a demo. Connect it to real API by modifying the `simulateAPIProcessing` function.

---

## 🔄 Alternative Approaches

### Approach 1: Official FLUX.1 Kontext API

Instead of reverse-engineering, use official providers:

#### Replicate
```javascript
const Replicate = require('replicate');
const replicate = new Replicate({ auth: 'your-api-key' });

async function editImage() {
  const output = await replicate.run(
    "black-forest-labs/flux-kontext-max",
    {
      input: {
        image: "https://example.com/image.jpg",
        prompt: "change background to beach"
      }
    }
  );
  console.log(output);
}
```

#### Fal.ai
```javascript
import fal from "@fal-ai/client";

fal.config({
  credentials: "your-fal-key"
});

const result = await fal.subscribe("fal-ai/flux-kontext", {
  input: {
    image_url: "https://example.com/image.jpg",
    prompt: "convert to anime style"
  }
});
```

### Approach 2: Self-Hosted FLUX.1

Deploy on your own GPU:

```bash
# Using ComfyUI
git clone https://github.com/comfyanonymous/ComfyUI
cd ComfyUI
pip install -r requirements.txt
python main.py --listen
```

Then use their API directly.

---

## 💡 Pro Tips

### 1. Session Management
- Tokens may expire after some time
- Implement token refresh logic
- Store sessions securely

### 2. Credit Tracking
- Monitor credit balance before each request
- Handle insufficient credits gracefully
- Consider credit pooling strategies

### 3. Error Handling
```javascript
try {
  const result = await client.editImage(id, prompt, mode);
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired, re-authenticate
  } else if (error.response?.status === 402) {
    // Insufficient credits
  } else if (error.response?.status === 429) {
    // Rate limited, wait and retry
  }
}
```

### 4. Performance Optimization
- Use appropriate quality modes
- Batch multiple edits when possible
- Cache frequently used results

---

## ⚠️ Important Notes

### Legal Considerations
- ✅ OK: Learning, research, personal projects
- ❌ NOT OK: Commercial resale, bypassing payments, violating ToS

### Rate Limits
Based on typical patterns:
- Free tier: ~5-10 requests per day
- Pro tier: ~100-200 requests per hour
- Ultimate: Higher limits, priority processing

### Best Practices
1. Always check robots.txt
2. Respect terms of service
3. Don't overload servers
4. Attribute original service
5. Use for educational purposes

---

## 📚 File Reference

| File | Purpose | Usage |
|------|---------|-------|
| `capture-raphael-api.js` | Network traffic capture | `node capture-raphael-api.js` |
| `raphael-ai-client.js` | API client library | `require('./raphael-ai-client')` |
| `raphael-editor-clone.html` | Web interface demo | Open in browser |
| `RAPHAEL_AI_REVERSE_ENGINEERING.md` | Complete documentation | Read for deep dive |
| `QUICK_START_RAPHAEL.md` | This file | Follow step-by-step |

---

## 🎯 Next Steps

1. **Capture API calls** → Run capture tool
2. **Analyze requests** → Extract endpoints and tokens
3. **Test client** → Make your first API call
4. **Build custom app** → Integrate into your projects
5. **Explore alternatives** → Check official FLUX.1 APIs

---

## 🆘 Troubleshooting

### "No API requests captured"
- Ensure you're filtering correctly in DevTools
- Try manual method instead of automated
- Check if site uses WebSocket instead of HTTP

### "Authentication failed"
- Token may have expired
- Check if token includes full "Bearer " prefix
- Verify you're using correct endpoint

### "Insufficient credits"
- Free tier only allows ~5 edits/day
- Wait for daily refresh or use alternative APIs

### "Timeout error"
- Increase timeout in client config
- Check internet connection
- Verify API endpoint is accessible

---

## 📞 Resources

- **Official Site**: https://raphael.app
- **FLUX.1 Docs**: https://blackforestlabs.ai
- **Replicate API**: https://replicate.com/black-forest-labs/flux-kontext-max
- **Fal.ai**: https://fal.ai/models/flux-kontext

---

## ✨ Summary

You now have everything needed to reverse-engineer and implement a Raphael AI-like image editor:

1. ✅ Capture tools ready
2. ✅ Client library prepared
3. ✅ Web interface available
4. ✅ Documentation complete
5. ✅ Alternative APIs identified

**Start with**: `node capture-raphael-api.js`

Good luck! 🚀
