# ImgUpscaler AI - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Installation

```bash
npm install axios form-data
```

### Basic Usage

```javascript
import ImgUpscalerAPI from './imgupscaler_complete.js';

const upscaler = new ImgUpscalerAPI();

// Upscale an image
const result = await upscaler.upscaleImage(
  './input.png',      // Your image path
  'upscale',          // Enhancement type
  { scale: 2 }        // Options
);

console.log('Output:', result.outputPath);
```

### Test All Endpoints

```bash
node test_imgupscaler_all_endpoints.js
```

---

## 📋 API Endpoints (Quick Reference)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/common/upload/upload-image` | POST | Start upload process |
| `{Alibaba Cloud URL}` | PUT | Upload actual image data |
| `/api/common/upload/sign-object` | POST | Get final signed URL |
| `/api/image/enhance` | POST | Enhance/upscale image |
| `/api/image/sharpen` | POST | Sharpen image |
| `/api/image/restore` | POST | Restore old photos |
| `/api/image/edit` | POST | AI-powered editing |

---

## 🔑 Key Parameters

### Upload Image
```javascript
{
  file_name: "image.png",     // Required
  file_size: 12345            // Optional
}
```

### Enhance Image
```javascript
{
  image_url: "https://...",   // Required
  scale: 2,                   // Optional: 2x, 4x
  quality: "high"             // Optional: low, medium, high
}
```

---

## 💡 Pro Tips

1. **Always use valid PNG/JPEG** - The API validates image formats
2. **Include all required headers** - User-Agent, Referer, Origin
3. **Handle async operations** - Processing may take time
4. **Save intermediate URLs** - You'll need them for debugging

---

## 🐛 Troubleshooting

### Upload Fails
- ✅ Check file format (PNG, JPEG, WebP only)
- ✅ Verify file size is reasonable (< 10MB)
- ✅ Ensure all headers are correct

### Processing Fails
- ⚠️ May require authentication (try browser first)
- ⚠️ Endpoint might be different (run endpoint tester)
- ⚠️ Could be async (requires polling)

### Download Fails
- ✅ Check if result URL exists
- ✅ Verify URL hasn't expired (they have TTL)
- ✅ Try downloading immediately after processing

---

## 📊 What We Know

### ✅ Confirmed Working
- Upload initiation (`/upload-image`)
- Cloud storage upload (Alibaba OSS)
- Object signing (`/sign-object`)
- Response formats

### ⚠️ Needs Testing
- Exact processing endpoints
- Authentication requirements
- Rate limits
- File size limits

---

## 🎯 Next Actions

1. **Run the endpoint tester** to find working processing APIs
   ```bash
   node test_imgupscaler_all_endpoints.js
   ```

2. **Check the output** for successful endpoints

3. **Update `imgupscaler_complete.js`** with confirmed endpoints

4. **Test with real images** to verify quality

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `imgupscaler_complete.js` | Main implementation |
| `test_imgupscaler_all_endpoints.js` | Endpoint tester |
| `IMGUPSCALER_COMPLETE_API_DOCS.md` | Full documentation |
| `IMGUPSCALER_QUICK_START.md` | This guide |

---

## 🔗 Links

- **Main Site**: https://imgupscaler.ai/
- **AI Editor**: https://imgupscaler.ai/ai-photo-editor/
- **Full Docs**: See `IMGUPSCALER_COMPLETE_API_DOCS.md`

---

**Questions?** Check the full documentation or run the test scripts!
