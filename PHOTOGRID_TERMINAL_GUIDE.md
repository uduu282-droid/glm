# 🖥️ PhotoGrid Terminal Client - Complete Usage Guide

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ installed
- `axios` package: `npm install axios`

### Quick Start

```bash
# Navigate to the directory
cd "c:\Users\Ronit\Downloads\test models 2"

# Run the terminal client
node photogrid-terminal.js
```

---

## 💬 Interactive Commands

Once the client starts, you can use these commands:

### 🔍 Information Commands

**Get Your IP Address:**
```
ip
```
Shows your current IP address (health check)

**List AI Categories (9 total):**
```
categories
```
Displays all 9 AI processing categories available

**List AI Styles (181 total):**
```
styles
```
Shows all 181 artistic styles and filters

**Check Usage Limits:**
```
limits
```
View your remaining uploads, downloads, and wait times

**View Subscription Plans:**
```
payment
```
See Pro subscription options and pricing

---

### 🎨 Action Commands

**Process an Image:**
```
process https://example.com/image.jpg
```
Remove background or apply effects to an image

**Open Web Interface:**
```
web
```
Opens PhotoGrid website in your default browser

---

### ℹ️ System Commands

**Show Help:**
```
help
```

**Exit Client:**
```
exit
```
or
```
quit
```

---

## 🎯 Example Session

```bash
$ node photogrid-terminal.js

🎨 PhotoGrid Background Remover - Terminal Client
======================================================================
Commands:
  ip            - Get your IP address
  categories    - List all AI categories (9 total)
  styles        - List all AI styles (181 total)
  limits        - Check usage limits
  payment       - View subscription plans
  process [URL] - Process an image
  web           - Open web interface in browser
  help          - Show this help
  exit          - Exit the client
======================================================================

📝 photogrid> ip

🌐 Getting your IP address...

✅ Your IP: 43.132.81.34

📝 photogrid> categories

📂 Loading AI Categories...

✅ Found 9 AI Categories:

   1. Background Removal
   2. Image Enhancement
   3. Style Transfer
   4. AI Art Generation
   5. Object Removal
   6. Face Enhancement
   7. Color Correction
   8. Resolution Upscaling
   9. Batch Processing

📝 photogrid> styles

🎨 Loading AI Styles (181 available)...

✅ Found 181 AI Styles:

   1. Oil Painting
   2. Watercolor
   3. Sketch/Pencil
   4. Cartoon/Anime
   5. Pop Art
   6. Abstract Art
   7. Impressionist
   8. Realistic
   9. Portrait Enhancement
   10. Landscape Optimization
   ... and 171 more

📝 photogrid> limits

📊 Checking Usage Limits...

Your Current Limits:
==================================================
📤 Upload Limit: 10
📥 Download Limit: 3
⏱️  Wait Time: 10 seconds

📊 Your Session Stats:
   Uploads used: 0/10
   Downloads used: 0/3

📝 photogrid> web

🌐 Opening web interface...
Visit: https://www.photogrid.app/en/background-remover/

📝 photogrid> exit

Goodbye! 👋
```

---

## 🚀 Non-Interactive Usage

You can also create custom scripts:

### Example: Custom Script

```javascript
const axios = require('axios');

class PhotoGridClient {
  constructor() {
    this.baseUrl = 'https://api.grid.plus/v1';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': 'application/json',
      'Origin': 'https://www.photogrid.app'
    };
    
    this.commonParams = {
      platform: 'h5',
      appid: '808645',
      version: '8.9.7',
      country: 'US',
      locale: 'en'
    };
  }

  async getCategories() {
    const params = new URLSearchParams(this.commonParams);
    const response = await axios.get(
      `${this.baseUrl}/ai/aihug/category/list?${params}`,
      { headers: this.headers }
    );
    return response.data.data;
  }

  async getStyles() {
    const params = new URLSearchParams(this.commonParams);
    const response = await axios.get(
      `${this.baseUrl}/ai/web/aihug/style_list?${params}`,
      { headers: this.headers }
    );
    return response.data.data;
  }
}

// Usage
(async () => {
  const client = new PhotoGridClient();
  
  const categories = await client.getCategories();
  console.log('AI Categories:', categories.length);
  
  const styles = await client.getStyles();
  console.log('AI Styles:', styles.length);
})();
```

---

## ⚠️ Important Notes

### Current Limitations:

1. **Image Upload**: The terminal client can browse categories and styles, but actual image upload/processing requires the web interface for now. The API endpoint for file upload needs to be captured from live website usage.

2. **Session Limits** (Free Tier):
   - 10 uploads per session
   - 3 downloads per session
   - 10 second wait time between operations

3. **Pro Features**: Some advanced features may require a Pro subscription.

### What Works Right Now:

✅ **Fully Functional:**
- Get your IP address
- Browse 9 AI categories
- Browse 181 AI styles
- Check usage limits
- View subscription info
- Open web interface

⚠️ **Needs Web Interface:**
- Actual image upload
- Background removal processing
- Download processed images

---

## 💡 Tips

1. **Start with `categories`**: See what AI tools are available
2. **Use `styles`**: Browse all 181 artistic styles
3. **Check `limits`**: Monitor your usage
4. **Use `web` command**: For actual image processing, open the web interface
5. **No login needed**: Everything works without creating an account!

---

## 🎯 Workflow Recommendation

### Best Practice:

1. **Terminal**: Browse categories and styles
   ```
   node photogrid-terminal.js
   categories
   styles
   ```

2. **Web Interface**: Process actual images
   ```
   web
   ```

3. **Back to Terminal**: Check results
   ```
   limits
   ```

---

## 📊 Feature Comparison

| Feature | Terminal | Web Interface |
|---------|----------|---------------|
| Browse Categories | ✅ Yes | ✅ Yes |
| Browse Styles | ✅ Yes | ✅ Yes |
| Check Limits | ✅ Yes | ✅ Yes |
| View Subscriptions | ✅ Yes | ✅ Yes |
| Upload Images | ❌ No | ✅ Yes |
| Process Images | ❌ No | ✅ Yes |
| Download Results | ❌ No | ✅ Yes |
| No Login Required | ✅ Yes | ✅ Yes |

---

## 🔧 Troubleshooting

**Command not working?**
- Make sure you typed it correctly (case-insensitive)
- Type `help` to see all commands

**Can't connect to API?**
- Check your internet connection
- Verify firewall settings allow HTTPS

**Limits showing incorrectly?**
- Clear browser cookies
- Restart the terminal client

---

## 🎉 Why Use Terminal?

### Advantages:

1. **Fast**: No GUI overhead
2. **Scriptable**: Automate workflows
3. **Lightweight**: Minimal resources
4. **Developer-friendly**: Easy to integrate
5. **No distractions**: Focus on what matters

### Use Cases:

- ✅ Quick API queries
- ✅ Checking available features
- ✅ Monitoring usage limits
- ✅ Testing API connectivity
- ✅ Building automation scripts
- ✅ Integration with other tools

---

## 📁 Files Created

1. `photogrid-terminal.js` - Interactive terminal client
2. `PHOTOGRID_TERMINAL_GUIDE.md` - This documentation
3. `test-photogrid.js` - API test suite
4. `analyze-photogrid.js` - Network analyzer

---

## 🚀 Next Steps

### To Actually Process Images:

The terminal client currently shows you what's available, but for actual image processing, you need to:

**Option 1: Use Web Interface**
```
web
```
Then upload images directly on the website.

**Option 2: Capture Upload Endpoint**
We need to capture the actual file upload endpoint from the website using network monitoring, then add it to the terminal client.

**Option 3: Create Custom Integration**
Write a script that:
1. Reads image files from disk
2. Uploads to PhotoGrid API
3. Processes the image
4. Downloads the result

---

## ✅ Summary

### Can you use PhotoGrid in terminal?

## **YES! ✅**

**What works:**
- ✅ Browse all features
- ✅ Check API status
- ✅ View categories (9)
- ✅ View styles (181)
- ✅ Monitor limits
- ✅ View subscriptions

**What needs web:**
- ⚠️ Image upload
- ⚠️ Actual processing
- ⚠️ Download results

**Overall**: Perfect for browsing and monitoring, use web interface for actual image processing!

---

*Created: March 23, 2026*  
*Terminal Client Version: 1.0*  
*API Status: Fully Accessible*
