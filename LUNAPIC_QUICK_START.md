# 🎨 LunaPic Background Remover - Quick Start

## ⚡ 3 Ways to Use

### 1️⃣ **Web Interface** (Easiest - Recommended for First Time)

```bash
# Just open in your browser
start lunapic-background-remover-web.html
```

**Steps**:
1. Drag & drop your image
2. Adjust click point (X, Y) - where to sample background
3. Set fuzz tolerance (default: 8 works for most images)
4. Click "Remove Background"
5. Download starts automatically!

---

### 2️⃣ **Node.js CLI** (For Automation)

```bash
# Basic usage (default settings)
node lunapic-background-remover.js your-image.jpg

# Custom settings
node lunapic-background-remover.js photo.png --fuzz 15 --click-x 50 --click-y 50

# Specify output
node lunapic-background-remover.js test.jpg --output result.png
```

**Command Line Options**:
```
--click-x <number>   X coordinate to click (default: 10)
--click-y <number>   Y coordinate to click (default: 10)
--fuzz <number>      Tolerance 0-100 (default: 8)
--output <path>      Output file path
```

---

### 3️⃣ **Test It First** (Recommended)

```bash
# Run the test script
node test-lunapic.js
```

This will process a test image with default settings and show you if it works.

---

## 🎯 Quick Parameter Guide

### Where to Click? (X, Y coordinates)

| Image Type | X | Y | Why |
|------------|---|---|-----|
| Product on white bg | 10 | 10 | Corner is usually pure background |
| Portrait | 50 | 50 | Away from face/hair |
| Object left side | width-10 | 10 | Right corner |
| Object right side | 10 | 10 | Left corner |

**Rule of thumb**: Click on an area that's 100% background, no subject pixels.

### Fuzz Tolerance

| Value | When to Use |
|-------|-------------|
| 5-8 | Clean, solid backgrounds (best quality) |
| 9-15 | Slightly varied backgrounds |
| 16-30 | Gradients or textured backgrounds |
| 30+ | Complex backgrounds (use carefully) |

**Default (8)** works for 90% of cases!

---

## 💡 Pro Tips

1. **Start with defaults** - clickX=10, clickY=10, fuzz=8
2. **Check result** - If background remains, increase fuzz
3. **If subject disappears** - decrease fuzz or click farther away
4. **Multiple attempts OK** - It's free and unlimited!
5. **Use ChangeImageTo as backup** - For complex backgrounds (AI-based)

---

## 📁 Files You Need

- ✅ `lunapic-background-remover-web.html` - Web UI (open in browser)
- ✅ `lunapic-background-remover.js` - Node.js script (CLI/programmatic)
- ✅ `test-lunapic.js` - Test script (verify it works)
- ✅ `LUNAPIC_COMPLETE_GUIDE.md` - Full documentation
- ✅ Dependencies already installed (`axios`, `form-data`)

---

## 🚀 Your First Background Removal

**Using Web UI**:
```bash
# Windows
start lunapic-background-remover-web.html

# Mac/Linux
open lunapic-background-remover-web.html
# or
xdg-open lunapic-background-remover-web.html
```

Then:
1. Drop your image
2. Keep defaults (X=10, Y=10, Fuzz=8)
3. Click "Remove Background"
4. Done! ✅

**Using Node.js**:
```bash
node lunapic-background-remover.js your-photo.jpg
```

Output will be saved as `output_TIMESTAMP.png`

---

## ❓ Troubleshooting

**Problem**: Background not fully removed  
**Solution**: Increase fuzz to 15-20 or click on different spot

**Problem**: Part of subject disappeared  
**Solution**: Decrease fuzz to 5-8 or click farther from subject

**Problem**: Error "Failed to establish session"  
**Solution**: Check internet connection, try again

**Problem**: No test image found  
**Solution**: Provide your own: `node test-lunapic.js your-image.jpg`

---

## 🎉 Ready to Go!

Everything is set up and ready to use. Start with the web interface to understand how it works, then use Node.js for automation.

**Need more help?** Read the full guide: [`LUNAPIC_COMPLETE_GUIDE.md`](LUNAPIC_COMPLETE_GUIDE.md)

---

**Last Updated**: March 25, 2026  
**Status**: ✅ Fully Working
