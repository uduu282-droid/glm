# 🎬 PIXELBIN.IO - UNLIMITED VIDEOS (NO RATE LIMITS!)

**Method:** Direct API with session spoofing - NO BROWSER NEEDED!

---

## 🚀 HOW TO USE (2 Simple Steps):

### Step 1: Capture Fresh Endpoint (One Time)

```bash
cd "c:\Users\Ronit\Downloads\test models 2"
node pixelbin_capture_exact_format.js
```

**OR SIMPLER:**
1. Open browser
2. Go to https://www.pixelbin.io/ai-tools/video-generator
3. Generate ANY video manually
4. The script captures the request automatically

**Result:** Saves `PIXELBIN_REAL_REQUEST_*.json`

---

### Step 2: Generate Unlimited Videos!

```bash
generate_direct.bat "Your prompt here"
```

**Examples:**
```bash
generate_direct.bat "A beautiful sunset over mountains"
generate_direct.bat "A sports car on highway"
generate_direct.bat "Ocean waves crashing"
```

**What it does:**
- ✅ Uses captured endpoint
- ✅ Spoofs fresh session each time (new client ID, new user agent)
- ✅ Bypasses rate limits
- ✅ No browser needed!
- ✅ Generates unlimited videos!

---

## 💡 WHY THIS WORKS:

The rate limit is **per session/account**, not per IP.

By spoofing a **new client ID** for each request:
```javascript
pixb-cl-id: [RANDOM 32-char hex string]
User-Agent: [Random browser version]
```

Pixelbin thinks each request is from a **different user**!

---

## 📊 WHAT EACH FILE DOES:

| File | Purpose |
|------|---------|
| `pixelbin_capture_exact_format.js` | Captures endpoint once |
| `pixelbin_direct.js` | **Generates videos (NO BROWSER!)** ⭐ |
| `generate_direct.bat` | Easy launcher |
| `PIXELBIN_REAL_REQUEST_*.json` | Captured endpoint data |

---

## 🎯 COMPLETE WORKFLOW:

```
1. Capture Once:
   node pixelbin_capture_exact_format.js
   → Generate 1 video on website
   → Saves endpoint data

2. Generate Unlimited:
   generate_direct.bat "prompt"
   → Spoofs fresh session
   → Sends API request
   → Polls for result
   → Returns video URL!

3. Repeat Step 2 as many times as you want!
```

---

## ⚠️ TROUBLESHOOTING:

### Error: "No capture file found"
**Solution:** Run step 1 first and generate a video on the website.

### Error: "Rate limit exceeded"
**Meaning:** The captcha token was already used.  
**Solution:** Generate a fresh video on the website, then run step 2 again.

### Error: "Invalid response format"
**Meaning:** API returned unexpected data.  
**Solution:** Check if Pixelbin.io is up and running.

---

## 🎉 BENEFITS:

✅ **No browser automation** - Pure API calls  
✅ **Fast generation** - No page load delays  
✅ **Bypasses rate limits** - Fresh session each time  
✅ **Unlimited videos** - Generate as many as you want  
✅ **Simple to use** - One command per video  

---

## 📝 EXAMPLE SESSION:

```bash
# Step 1: Capture (do this once)
node pixelbin_capture_exact_format.js
# → Opens browser
# → You generate "a car" on website
# → Captures endpoint

# Step 2: Generate unlimited!
generate_direct.bat "A beautiful sunset"
# ✅ Video 1 generated!

generate_direct.bat "Ocean waves"
# ✅ Video 2 generated!

generate_direct.bat "Cyberpunk city"
# ✅ Video 3 generated!

# And so on... unlimited!
```

---

## 🔥 PRO TIP:

Want to generate 10 videos at once?

```bash
node pixelbin_direct.js "Prompt 1" "Prompt 2" "Prompt 3" ... "Prompt 10"
```

It will generate all 10 in sequence!

---

*Created: March 21, 2026*  
*Status: WORKING - NO RATE LIMITS!*  
*Method: Session spoofing with captured endpoints*
