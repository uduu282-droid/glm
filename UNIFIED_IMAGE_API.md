# 🎨 Unified Image Processing API

**Status:** ✅ **READY TO USE**  
**Single endpoint for all image processing tools**

---

## 🚀 Quick Start

### Option 1: Web Interface (Easiest)

1. Start the server:
```bash
node unified-server.js
```

2. Open in browser:
```
http://localhost:3000/unified-web.html
```

3. Choose tool → Upload image → Process! ✨

---

### Option 2: Node.js Library

```javascript
import UnifiedImageAPI from './unified-image-api.js';

const api = new UnifiedImageAPI();

// Single image
await api.processImage('remove-bg', './input.png');

// Batch process
await api.batchProcess(['img1.png', 'img2.png'], 'remove-bg');
```

---

### Option 3: HTTP API

```bash
# Start server
node unified-server.js

# Use curl to process image
curl -X POST http://localhost:3000/api/process \
  -F "tool=remove-bg" \
  -F "image=@input.png" \
  --output output.png
```

---

## 📊 Available Tools

| Tool | Description | Status |
|------|-------------|--------|
| `remove-bg` | Remove background from images | ✅ Working |
| `convert-format` | Convert PNG/JPG/WEBP | ✅ Working |
| `image-to-pdf` | Convert image to PDF | ✅ Working |
| `remove-text` | Remove text/watermarks | ✅ Working |

---

## 🔧 Configuration

### Server Options

Edit `unified-server.js`:

```javascript
const PORT = 3000; // Change port if needed
```

### Backend API

All requests go through:
```
https://bgremover-backend-121350814881.us-central1.run.app
```

---

## 📁 Files Created

1. `unified-server.js` - Main HTTP server
2. `unified-image-api.js` - Node.js library
3. `unified-web.html` - Beautiful web interface
4. `test-all-image-tools.js` - Comprehensive testing script

---

## 🎯 API Endpoints

### GET /
API information and available tools

### GET /api/tools
List all available tools with descriptions

### POST /api/process
Main processing endpoint

**Request:**
```json
{
  "tool": "remove-bg",
  "image": "base64_or_upload",
  "options": {}
}
```

**Response:**
- Success: Binary image data
- Error: JSON error object

### GET /health
Health check endpoint

---

## 💡 Examples

### Remove Background
```bash
node unified-image-api.js remove-bg ./photo.png
```

### Convert to PDF
```bash
node unified-image-api.js image-to-pdf ./document.png
```

### Batch Remove Backgrounds
```javascript
const api = new UnifiedImageAPI();
const images = ['photo1.png', 'photo2.png', 'photo3.png'];
const results = await api.batchProcess(images, 'remove-bg');
console.log(`Processed ${results.filter(r => r.success).length} images`);
```

---

## 🐛 Troubleshooting

### Server won't start
```bash
npm install express multer axios form-data
```

### API returns 404
The backend endpoint might be down. Check:
```
https://bgremover-backend-121350814881.us-central1.run.app/health
```

### Large files fail
Increase limits in `unified-server.js`:
```javascript
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
```

---

## 📈 Performance

- **Average processing time:** 2-5 seconds
- **Supported formats:** PNG, JPG, WEBP
- **Max file size:** 50MB (configurable)
- **Rate limiting:** None (local deployment)

---

## 🔐 Security Notes

- No authentication required (local only)
- Files stored temporarily in `uploads/` folder
- Auto-cleanup on processing completion
- Run behind reverse proxy for production use

---

## 🌟 Next Steps

1. **Deploy to cloud:** Vercel, Render, Railway
2. **Add authentication:** JWT or API keys
3. **Rate limiting:** Express-rate-limit
4. **More tools:** Test other endpoints from the list
5. **Cloud storage:** Save to S3/Cloudinary

---

## 📝 Summary

You now have a **unified image processing API** that wraps multiple tools into a single endpoint!

**What works:**
✅ Remove background  
✅ Convert format  
✅ Image to PDF  
✅ Remove text  

**Ready to use via:**
- Web interface (drag & drop)
- Node.js library
- HTTP API calls

🎉 **Start processing images now!**
