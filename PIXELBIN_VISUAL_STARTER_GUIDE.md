# 🎬 PIXELBIN.IO - VISUAL STARTER GUIDE

**Quick Start Guide for Beginners**  
**Date:** March 21, 2026

---

## 🚀 EASIEST WAY - ONE COMMAND!

### Step-by-Step:

```
┌─────────────────────────────────────────┐
│  STEP 1: Open Command Prompt/PowerShell │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  STEP 2: Navigate to project folder     │
│  cd "c:\Users\Ronit\Downloads\test models 2" │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  STEP 3: Run the magic command!          │
│  generate_video_one_step.bat            │
│  "Your prompt here"                      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  DONE! Video URL will appear! 🎉         │
└─────────────────────────────────────────┘
```

---

## 📋 QUICK REFERENCE CARD

### The Only 2 Commands You Need:

#### Command 1: Generate Video (One-Step)
```bash
generate_video_one_step.bat "A beautiful sunset"
```

#### Command 2: Download Video
```bash
curl -o my_video.mp4 "VIDEO_URL_HERE"
```

**That's it!** 🎊

---

## 🎯 EXAMPLE SESSION

### What You Type:
```bash
cd "c:\Users\Ronit\Downloads\test models 2"
generate_video_one_step.bat "A cyberpunk city with flying cars"
```

### What You'll See:
```
======================================================================
🎬 PIXELBIN.IO - ONE-STEP VIDEO GENERATOR
======================================================================

📝 Prompt: A cyberpunk city with flying cars

STEP 1/3: Capturing fresh authentication tokens...
============================================================
🌐 Opening Pixelbin.io...
✅ Browser opens automatically
✅ Enters your prompt
✅ Clicks Generate button
✅ Captures all tokens

STEP 2/3: Generating video with captured tokens...
============================================================
📤 Sending request...
✅ HTTP Status: 200
🎉 Video generation started!

STEP 3/3: Polling for completion...
============================================================
Poll #1... ⏳ processing
Poll #2... ⏳ processing
Poll #3... ✅ complete!

🎉 VIDEO READY!
🎬 VIDEO URL: https://cdn.pixelbin.io/videos/abc123.mp4

======================================================================
🎉 SUCCESS! YOUR VIDEO IS READY!
======================================================================

💡 Download it using:
curl -o video.mp4 "https://cdn.pixelbin.io/videos/abc123.mp4"
```

---

## 🖼️ WORKFLOW DIAGRAM

```
┌──────────────┐
│  YOU         │
│  Type prompt │
└──────┬───────┘
       │
       ↓
┌─────────────────────────────────────────┐
│  generate_video_one_step.bat            │
│  "Your prompt"                          │
└──────────────┬──────────────────────────┘
               │
               ↓
        ┌──────────────┐
        │  Puppeteer   │
        │  Opens browser│
        └──────┬───────┘
               │
               ↓
        ┌──────────────┐
        │  Goes to     │
        │  pixelbin.io │
        └──────┬───────┘
               │
               ↓
        ┌──────────────┐
        │  Auto-fills  │
        │  your prompt │
        └──────┬───────┘
               │
               ↓
        ┌──────────────┐
        │  Clicks      │
        │  Generate    │
        └──────┬───────┘
               │
               ↓
        ┌──────────────┐
        │  CAPTURES    │
        │  ALL TOKENS  │ ← Magic happens here!
        └──────┬───────┘
               │
               ↓
        ┌──────────────┐
        │  Sends API   │
        │  Request     │
        └──────┬───────┘
               │
               ↓
        ┌──────────────┐
        │  Polls every  │
        │  3 seconds   │
        └──────┬───────┘
               │
               ↓
        ┌──────────────┐
        │  VIDEO READY!│
        │  Shows URL   │
        └──────────────┘
```

---

## ⚠️ COMMON ISSUES & QUICK FIXES

### Issue 1: "No captured tokens"

**What you see:**
```
❌ No captured request files found!
```

**Quick Fix:**
```bash
node pixelbin_capture_exact_format.js
```
Then try again!

---

### Issue 2: "Captcha token expired"

**What you see:**
```
❌ Authentication failed
```

**Quick Fix:**
Just run the one-step version again - it captures fresh tokens automatically!
```bash
generate_video_one_step.bat "Your new prompt"
```

---

### Issue 3: "Server exception"

**What you see:**
```
Error 410003: Server exception
```

**What it means:** Their server has issues (not your fault!)

**Quick Fix:**
- Try a different prompt
- Wait a few minutes
- Try again later

---

## 🎨 PROMPT IDEAS

### Beginner Prompts (Simple):
```
"A cat sitting"
"Ocean waves"
"Mountain sunset"
"City street"
"Forest path"
```

### Intermediate Prompts (Descriptive):
```
"A beautiful sunset over mountains"
"Cyberpunk city at night with neon lights"
"Dragon flying over medieval castle"
"Underwater scene with coral reef"
```

### Advanced Prompts (Detailed):
```
"A cyberpunk city with flying cars, neon lights, rain, reflective streets, cinematic lighting"
"Majestic dragon breathing fire over fantasy castle, magical atmosphere, dramatic sky"
"Peaceful Japanese garden with cherry blossoms, koi pond, traditional bridge, spring time"
```

---

## 📥 DOWNLOADING YOUR VIDEO

### After you get the video URL:

**Copy the URL:**
```
https://cdn.pixelbin.io/videos/abc123xyz.mp4
```

**Download with curl:**
```bash
curl -o my_video.mp4 "https://cdn.pixelbin.io/videos/abc123xyz.mp4"
```

**Or download with PowerShell:**
```powershell
Invoke-WebRequest -Uri "VIDEO_URL" -OutFile "my_video.mp4"
```

**Or just paste URL in browser!**

---

## ✅ SUCCESS CHECKLIST

You know it's working when you see:

- ✅ "HTTP Status: 200"
- ✅ "Video generation started!"
- ✅ Poll numbers increasing (#1, #2, #3...)
- ✅ "VIDEO READY!"
- ✅ A video URL appears

**Then download and enjoy!** 🎉

---

## 🎓 LEARN MORE

Want to understand how it works?

Read these files:
1. `PIXELBIN_COMPLETE_WORKING_SOLUTION.md` - Complete overview
2. `README_PIXELBIN_FINAL.md` - Full documentation
3. `REAL_PIXELBIN_WORKING.md` - Working guide

---

## 💡 PRO TIPS

### Tip 1: Use Fresh Tokens
Always use the one-step version - it auto-captures fresh tokens!

### Tip 2: Keep It Simple
Start with short prompts (3-5 words), then get more complex.

### Tip 3: Save Good Prompts
When you find a prompt that works well, save it!

### Tip 4: Download Immediately
Videos might not stay online forever - download right away!

---

## 🆘 STILL NEED HELP?

### Check These Files:
- `README_PIXELBIN_FINAL.md` - Detailed troubleshooting
- `PIXELBIN_TEST_RESULTS_COMPLETE.md` - Test results
- `PIXELBIN_FIX_ANALYSIS.md` - Technical analysis

### Or Just Try Again:
Sometimes the simplest fix is to just run it again!
```bash
generate_video_one_step.bat "Try again"
```

---

## 🎉 THAT'S IT!

You now have everything you need:

✅ **Easy one-command solution**  
✅ **Automatic token capture**  
✅ **Production-ready code**  
✅ **Complete documentation**  

**Just run:**
```bash
generate_video_one_step.bat "Your video idea!"
```

**And watch the magic happen! ✨🎬**

---

*Visual Guide Created: March 21, 2026*  
*For: Complete Beginners*  
*Status: Ready to Use!*
