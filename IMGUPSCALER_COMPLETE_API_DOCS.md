# ImgUpscaler AI - Complete API Documentation

## Overview

Complete reverse-engineered documentation for **ImgUpscaler.ai** - a free AI-powered image enhancement service.

**Target URL**: https://imgupscaler.ai/ai-photo-editor/

---

## 📡 Discovered API Endpoints

### Core Upload Flow

#### 1. Initiate Upload
```http
POST https://api.imgupscaler.ai/api/common/upload/upload-image
Content-Type: multipart/form-data

Parameters:
- file_name (required): Name of the file
- file_size (optional): File size in bytes

Response:
{
  "code": 100000,
  "result": {
    "url": "https://iudcbe0.pbsimgs.com/datarm/common_upload/2026-03-20/input/{uuid}.png?OSSAccessKeyId=...&Expires=...&Signature=...",
    "object_name": "datarm/common_upload/2026-03-20/input/{uuid}.png"
  },
  "message": {
    "en": "Request Success",
    "zh": "请求成功"
  }
}
```

#### 2. Upload to Cloud Storage (Alibaba Cloud OSS)
```http
PUT {url_from_step_1}
Content-Type: image/png

[Binary image data]

Response: 200 OK (no body)
```

#### 3. Sign Object
```http
POST https://api.imgupscaler.ai/api/common/upload/sign-object
Content-Type: multipart/form-data

Parameters:
- object_name (required): Full object path from step 1

Response:
{
  "code": 100000,
  "result": {
    "url": "https://iudcbe0.pbsimgs.com/datarm/common_upload/2026-03-20/input/{uuid}.png?OSSAccessKeyId=...&Expires=...&Signature=..."
  },
  "message": {
    "en": "Request Success",
    "zh": "请求成功"
  }
}
```

### Image Processing Endpoints (Discovered)

These endpoints were identified but require further testing:

```
/api/image/enhance    - General enhancement/upscaling
/api/image/sharpen   - Sharpening
/api/image/restore   - Old photo restoration
/api/image/edit      - AI editing with text prompts
```

**Expected Request Format:**
```http
POST https://api.imgupscaler.ai/api/image/enhance
Content-Type: application/json

{
  "image_url": "https://iudcbe0.pbsimgs.com/...",
  "scale": 2,           // Optional: upscaling factor
  "quality": "high"     // Optional: quality level
}
```

---

## 🔧 Required Headers

All API requests should include these headers:

```javascript
{
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://imgupscaler.ai',
  'Referer': 'https://imgupscaler.ai/',
  'Accept': '*/*'
}
```

---

## 📊 Complete Workflow

```
┌─────────────────┐
│  1. Create/Load │
│     Image       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. Initiate    │
│     Upload      │
│  (Get OSS URL)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. Upload to   │
│  Alibaba Cloud  │
│      OSS        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  4. Sign Object │
│(Get Final URL)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  5. Process/    │
│   Enhance       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  6. Download    │
│    Result       │
└─────────────────┘
```

---

## 💻 Usage Example

### JavaScript (Node.js)

```javascript
import ImgUpscalerAPI from './imgupscaler_complete.js';

const upscaler = new ImgUpscalerAPI();

// Complete workflow
const result = await upscaler.upscaleImage(
  './my_image.png',     // Input path
  'upscale',            // Enhancement type
  { scale: 2, quality: 'high' }  // Options
);

console.log(result);
// Output: { success: true, outputPath: '...', resultUrl: '...' }
```

### Python Example

```python
import requests
from pathlib import Path

BASE_URL = 'https://api.imgupscaler.ai'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Origin': 'https://imgupscaler.ai',
    'Referer': 'https://imgupscaler.ai/'
}

def initiate_upload(file_name):
    files = {'file_name': (None, file_name)}
    response = requests.post(
        f'{BASE_URL}/api/common/upload/upload-image',
        files=files,
        headers=HEADERS
    )
    return response.json()

def upload_to_cloud(url, image_path):
    with open(image_path, 'rb') as f:
        response = requests.put(url, data=f.read())
    return response.status_code == 200

def sign_object(object_name):
    files = {'object_name': (None, object_name)}
    response = requests.post(
        f'{BASE_URL}/api/common/upload/sign-object',
        files=files,
        headers=HEADERS
    )
    return response.json()

# Usage
upload_info = initiate_upload('test.png')
upload_to_cloud(upload_info['result']['url'], 'test.png')
signed_info = sign_object(upload_info['result']['object_name'])
print(f"Ready to process: {signed_info['result']['url']}")
```

---

## 🎯 Enhancement Types

Based on UI analysis, the following enhancement types are available:

| Type | Endpoint | Description |
|------|----------|-------------|
| `upscale` | `/api/image/enhance` | Increase resolution (2x, 4x) |
| `sharpen` | `/api/image/sharpen` | Enhance clarity |
| `restore` | `/api/image/restore` | Fix old/damaged photos |
| `edit` | `/api/image/edit` | AI-powered edits via text |

---

## 📁 Supported Features

From UI analysis:

### Image Tools
- ✅ Text-to-Image generation
- ✅ Image Editor (AI-powered)
- ✅ Batch processing
- ✅ Replace background
- ✅ Change hair color
- ✅ Object remover
- ✅ Style transfer
- ✅ Old photo restoration
- ✅ Image merge

### Aspect Ratios
- 1:1 (Square)
- 2:3, 3:2
- 9:16, 16:9
- 3:4, 4:3

### Key Features
- ✅ 100% Free
- ✅ No sign-up required
- ✅ High quality output
- ✅ No watermark
- ✅ Multiple file formats (JPEG, PNG, WebP)

---

## 🔍 Technical Details

### Cloud Storage Provider
**Alibaba Cloud OSS** (Object Storage Service)
- Region: US West 1
- Bucket: `pbsimgs.com`
- Uses temporary signed URLs with expiration

### Authentication
Currently appears to be **browser-based only** with:
- Session cookies
- Product serial numbers
- Authorization tokens (for logged-in users)

### Rate Limits
Unknown - requires further testing

---

## 🚨 Known Limitations

1. **Processing Endpoint**: The exact processing/enhancement endpoint still needs verification
2. **Async Processing**: May require polling for task completion
3. **Authentication**: Some features may require login
4. **File Size Limits**: Unknown maximum file size

---

## 🧪 Testing Recommendations

To fully test and verify all endpoints:

1. **Browser Automation First**
   - Use Puppeteer to capture real processing requests
   - Monitor network tab during actual enhancement
   - Extract any additional required parameters

2. **Incremental Testing**
   - Test upload flow (confirmed working)
   - Test each processing endpoint separately
   - Verify response formats

3. **Error Handling**
   - Test with various image sizes
   - Test with different formats
   - Check rate limiting behavior

---

## 📝 Implementation Files

Created in this project:

1. **`imgupscaler_complete.js`** - Full Node.js implementation
2. **`reverse_imgupscaler.js`** - Initial reverse engineering script
3. **`test_imgupscaler_fixed.js`** - Corrected terminal-based test
4. **`test_imgupscaler_upload.js`** - Upload flow with Puppeteer
5. **`test_imgupscaler_terminal.js`** - Pure terminal implementation

Analysis outputs:
- `imgupscaler_analysis/complete_data.json`
- `imgupscaler_upload_analysis/upload_analysis.json`

---

## 🎓 Learning & Best Practices

### What Worked Well
✅ Upload flow completely reverse-engineered  
✅ Cloud storage integration identified  
✅ All required headers captured  
✅ Response formats documented  

### What Needs More Work
⚠️ Processing endpoint verification  
⚠️ Async task polling mechanism  
⚠️ Authentication requirements  
⚠️ Rate limit testing  

---

## 📞 Next Steps

To make this fully production-ready:

1. **Capture Processing Request**
   ```bash
   # Run browser automation while actually enhancing an image
   node reverse_imgupscaler.js
   ```

2. **Test All Enhancement Types**
   - Try each endpoint with sample images
   - Document exact request/response formats

3. **Implement Task Polling** (if async)
   - Add status checking endpoint
   - Implement retry logic

4. **Add Error Recovery**
   - Handle failed uploads
   - Retry mechanisms
   - Timeout handling

---

## 🔗 Related Resources

- **Main Site**: https://imgupscaler.ai/
- **AI Photo Editor**: https://imgupscaler.ai/ai-photo-editor/
- **API Domain**: https://api.imgupscaler.ai
- **CDN**: https://cdn.imgupscaler.ai

---

## 📄 License & Disclaimer

This documentation is for **educational purposes only**. 

- Use responsibly and ethically
- Respect the service's terms of use
- Do not abuse or overload the API
- Consider implementing your own solution for production use

---

**Last Updated**: March 20, 2026  
**Status**: Upload flow confirmed, processing endpoints need verification
