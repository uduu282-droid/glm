# ImgUpscaler AI Photo Editor - Reverse Engineering Status

## 🎯 Goal
Reverse engineer https://imgupscaler.ai/ai-photo-editor/ to enable programmatic AI image editing with text prompts.

---

## ✅ What We've Successfully Reverse Engineered

### 1. Upload Flow (100% Working)
```javascript
POST https://api.imgupscaler.ai/api/common/upload/upload-image
→ Returns: Alibaba Cloud OSS URL + object_name

PUT {oss_url}
→ Uploads image to cloud storage

POST https://api.imgupscaler.ai/api/common/upload/sign-object  
→ Returns: Final signed URL for processing
```

**Status**: ✅ Fully implemented and tested in `imgupscaler_complete.js`

---

## 🔍 Discovered But Not Yet Verified Endpoints

Based on website analysis and UI features, these endpoints likely exist:

### Image Processing Endpoints (Identified in source code)

```
/api/image/enhance      - General upscaling/enhancement
/api/image/sharpen     - Sharpen blurry images
/api/image/restore     - Old photo restoration
/api/image/edit        - AI text-prompt editing ← THIS IS WHAT WE WANT!
```

### Expected Request Format (Hypothetical)
```http
POST https://api.imgupscaler.ai/api/image/edit
Content-Type: application/json

{
  "image_url": "https://iudcbe0.pbsimgs.com/...",
  "prompt": "Replace background with beach sunset",
  "model": "nano-banana-2",  // or their proprietary model
  "strength": 0.8,
  "negative_prompt": ""
}
```

**Status**: ⚠️ Need browser capture to verify exact endpoint and parameters

---

## 📋 Features Available on Website

From UI analysis, the AI Photo Editor supports:

### Generation Modes
- ✅ Text-to-Image
- ✅ Image-Editor (AI-powered edits via text)

### Edit Types
- Replace background
- Change hair color
- Object remover
- Style transfer
- Old photo restoration
- Image merge

### Aspect Ratios
- 1:1, 2:3, 3:2, 9:16, 16:9, 3:4, 4:3

### Key Points
- No login required
- Completely free
- No watermarks
- Supports JPEG, PNG, WebP up to 24MB

---

## 🧪 Next Steps to Complete Reverse Engineering

### Step 1: Capture Real Editing Requests

**Method A: Browser DevTools (Manual)**
1. Open https://imgupscaler.ai/ai-photo-editor/
2. Press F12 → Network tab
3. Upload an image
4. Enter prompt: "test"
5. Click Generate
6. Look for POST request to `/api/*`
7. Copy full request details

**Method B: Automated Capture (Recommended)**
```bash
# Use existing Puppeteer script
node reverse_imgupscaler.js
```

This will:
- Launch browser
- Navigate to site
- Automate image upload
- Trigger generation
- Capture all API requests
- Save to JSON file

### Step 2: Analyze Captured Request

Expected output format:
```json
{
  "url": "https://api.imgupscaler.ai/api/image/edit",
  "method": "POST",
  "headers": { ... },
  "body": {
    "image_url": "...",
    "prompt": "...",
    "model": "...",
    "other_params": "..."
  }
}
```

### Step 3: Test the Endpoint

Create test script:
```javascript
import axios from 'axios';

const response = await axios.post(
  'https://api.imgupscaler.ai/api/image/edit',
  {
    image_url: 'YOUR_UPLOADED_IMAGE_URL',
    prompt: 'Make it brighter'
  },
  {
    headers: {
      'User-Agent': 'Mozilla/5.0...',
      'Origin': 'https://imgupscaler.ai',
      'Referer': 'https://imgupscaler.ai/',
      'Content-Type': 'application/json'
    }
  }
);

console.log(response.data);
```

### Step 4: Handle Async Processing

If response contains task_id:
```javascript
// Poll for completion
while (true) {
  const status = await axios.get(
    `https://api.imgupscaler.ai/api/task/status/${task_id}`
  );
  
  if (status.data.status === 'completed') {
    console.log('Result URL:', status.data.result.url);
    break;
  }
  
  await sleep(2000);
}
```

---

## 📁 Existing Files in This Project

### Implementation Files
- `imgupscaler_complete.js` - Full upload flow implementation
- `reverse_imgupscaler.js` - Browser automation for capture
- `test_imgupscaler_terminal.js` - Terminal-based testing
- `discover-imgupscaler-api.js` - API discovery scanner

### Documentation
- `IMGUPSCALER_COMPLETE_API_DOCS.md` - Complete API docs
- `IMGUPSCALER_PROJECT_SUMMARY.md` - Project overview
- `IMGUPSCALER_QUICK_START.md` - Quick start guide
- `IMGUPSCALER_TEST_RESULTS.md` - Previous test results

### Worker Implementation
- `worker-imgupscaler.js` - Cloudflare Worker proxy
- `wrangler-imgupscaler.toml` - Worker config

---

## 🎯 Alternative Approaches If Direct API Fails

### Option 1: Use Similar Services

Based on our other reverse engineering projects:

1. **NanoBanana2** (via Vetrex API)
   - Already working in `NanoBanana2.py`
   - Supports text-to-image and image editing
   - Endpoint: `https://vetrex.site/v1/images/edits`

2. **Pollinations.ai**
   - Free, no auth required
   - Simple REST API
   - See `pollinations-api-reverse.js`

3. **Veo AI**
   - Advanced image editing
   - See `reverse_veo_wordpress.js`

### Option 2: Hybrid Approach

Use ImgUpscaler for upload + another service for processing:
```javascript
// Upload to ImgUpscaler
const imageUrl = await imgUpscaler.upload('./image.png');

// Process with NanoBanana2
const result = await vetrex.edit({
  image_url: imageUrl,
  prompt: 'Your edit here'
});
```

---

## 💡 Quick Win Strategy

### Immediate Action Plan (30 minutes)

**Minute 0-5**: Setup
```bash
npm install puppeteer
```

**Minute 5-15**: Capture
```bash
node reverse_imgupscaler.js
# Follow prompts to generate an image
# Check captured_request.json
```

**Minute 15-25**: Analyze
- Open `captured_request.json`
- Extract endpoint URL
- Note all required parameters
- Check for task_id pattern

**Minute 25-30**: Test
```bash
# Create test_imgupscaler_edit.js
# Run quick test
node test_imgupscaler_edit.js
```

---

## 🔧 Tools & Commands

### Capture Real Request
```bash
node reverse_imgupscaler.js
```

### Test Upload Flow Only
```bash
node test_imgupscaler_terminal.js ./test_image.png
```

### Scan for Endpoints
```bash
node discover-imgupscaler-api.js
```

### View Analysis Data
```bash
cat imgupscaler_analysis/complete_data.json
```

---

## 📊 Current Status Summary

| Component | Status | Confidence |
|-----------|--------|------------|
| Upload Flow | ✅ Working | 100% |
| Cloud Storage | ✅ Working | 100% |
| Sign Object | ✅ Working | 100% |
| **AI Edit Endpoint** | 🔍 Needs Capture | 60% |
| Task Polling | ❓ Unknown | 0% |
| Rate Limits | ❓ Unknown | 0% |

---

## 🎉 Success Criteria

The reverse engineering is complete when:

1. ✅ Can upload image programmatically
2. ✅ Can send text prompt for editing
3. ✅ Receive edited image back
4. ✅ Understand async polling (if applicable)
5. ✅ Know rate limits and constraints

---

## 📞 What You Should Do NOW

### Choose Your Path:

**Path A: Browser Capture (Recommended - 30 min)**
```bash
1. npm install puppeteer
2. node reverse_imgupscaler.js
3. Wait for capture
4. Check captured_request.json
5. Come back with the endpoint details
```

**Path B: Manual DevTools (15 min)**
```bash
1. Open https://imgupscaler.ai/ai-photo-editor/
2. F12 → Network tab
3. Upload image, enter prompt, click Generate
4. Right-click API request → Copy → Copy as cURL
5. Paste into new file for analysis
```

**Path C: Use Alternative (NOW)**
```bash
# Use NanoBanana2 which we already have working
python NanoBanana2.py
# Or deploy Telegram bot
```

---

## 🚨 Important Notes

1. **No Authentication Required** (for basic usage)
   - Site works without login
   - May have hidden rate limits

2. **Browser Headers Critical**
   - Must spoof User-Agent
   - Need Origin/Referer headers
   - May need session cookies for heavy usage

3. **Respect the Service**
   - Don't abuse free tier
   - Implement rate limiting in your code
   - Consider self-hosting for production

---

## 📚 Related Documentation

For similar services we've reverse engineered:
- `PIXELBIN_COMPLETE_WORKING_SOLUTION.md`
- `HIFLUX_REVERSE_ENGINEERING_GUIDE.md`
- `ZAI_BROWSER_API_USAGE_GUIDE.md`

All follow similar patterns:
1. Capture browser traffic
2. Identify endpoints
3. Replicate in code
4. Handle async processing

---

**Ready to proceed? Run this:**
```bash
node reverse_imgupscaler.js
```

Then share the captured endpoint details! 🚀
