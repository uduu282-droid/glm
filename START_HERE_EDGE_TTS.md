# 🎙️ Edge TTS Worker - START HERE

**5-minute guide to deploying your own free TTS API**

---

## ⚡ What You Just Cloned

This repository ([`edge-tts-openai-cf-worker`](edge-tts-openai-cf-worker/)) contains code to run Microsoft Edge's **Text-to-Speech** service on Cloudflare Workers with an **OpenAI-compatible API**.

### Why This is Awesome

- ✅ **100% Free** (Cloudflare free tier: 100K requests/day)
- ✅ **No Microsoft Account** needed
- ✅ **OpenAI Compatible** - Drop-in replacement
- ✅ **High Quality** - Microsoft neural TTS
- ✅ **Multi-language** - Chinese, English, Japanese, Korean
- ✅ **5 Minutes** to deploy

---

## 🚀 Deploy in 3 Steps

### Step 1: Create Worker (2 minutes)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click `Workers & Pages` → `Create Worker`
3. Name it: `edge-tts`
4. Click `Deploy`

### Step 2: Add Code (1 minute)

1. Delete the default code
2. Open [`worker.js`](edge-tts-openai-cf-worker/worker.js) from this folder
3. Copy ALL the code
4. Paste into Cloudflare editor
5. Click `Save and deploy`

### Step 3: Set API Key (1 minute)

1. In Worker settings → `Settings` → `Variables`
2. Click `Add variable`
3. Name: `API_KEY`
4. Value: `your-secret-key-here` (make it strong!)
5. Click `Save and deploy`

**Done!** 🎉

---

## 🧪 Test It NOW

```bash
curl -X POST https://your-worker.yourusername.workers.dev/v1/audio/speech \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-key-here" \
  -d '{
    "model": "tts-1",
    "input": "Hello, this is a test!",
    "voice": "en-US-JennyNeural"
  }' --output test.mp3

# Play it
afplay test.mp3  # macOS
mpv test.mp3     # Linux/Windows
```

---

## 🎭 Quick Voice Reference

### Chinese Voices
- `zh-CN-XiaoxiaoNeural` - Female, warm & lively ⭐ Most popular
- `zh-CN-YunxiNeural` - Male, steady & atmospheric
- `zh-CN-YunyangNeural` - Male, professional

### English Voices
- `en-US-JennyNeural` - Female, friendly & natural ⭐ Most popular
- `en-US-GuyNeural` - Male, clear & professional

### Japanese Voices
- `ja-JP-NanamiNeural` - Female, polite & clear
- `ja-JP-KeitaNeural` - Male, warm & friendly

### Korean Voices
- `ko-KR-SunHiNeural` - Female, bright & cheerful
- `ko-KR-InJoonNeural` - Male, calm & professional

---

## 📋 API Parameters

### Required
```json
{
  "model": "tts-1",              // Fixed value
  "input": "Your text here",     // Text to speak
  "voice": "en-US-JennyNeural"   // Voice name
}
```

### Optional
```json
{
  "speed": 1.0,        // 0.5 (slow) to 2.0 (fast)
  "pitch": 1.0,        // 0.5 (low) to 2.0 (high)
  "style": "cheerful", // Emotion: angry, chat, cheerful, sad, etc.
  "response_format": "mp3"  // Audio format
}
```

---

## 🎯 Example Usage

### Basic English TTS
```bash
curl -X POST https://YOUR_WORKER/v1/audio/speech \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"tts-1","input":"Hello world!","voice":"en-US-JennyNeural"}' \
  --output hello.mp3
```

### Chinese with Emotion
```bash
curl -X POST https://YOUR_WORKER/v1/audio/speech \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model":"tts-1",
    "input":"你好，这是一个测试！",
    "voice":"zh-CN-XiaoxiaoNeural",
    "style":"cheerful",
    "speed":1.2
  }' --output chinese_happy.mp3
```

### Fast Narration
```bash
curl -X POST https://YOUR_WORKER/v1/audio/speech \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model":"tts-1",
    "input":"This is a faster narration.",
    "voice":"en-US-JennyNeural",
    "speed":1.5
  }' --output fast.mp3
```

---

## ⚠️ Important Rules

### 1. Match Voice Language to Text
❌ **Wrong**: English voice + Chinese text  
✅ **Right**: Chinese voice + Chinese text

### 2. Keep Text Short
- Max recommended: ~500 characters
- Longer texts may timeout

### 3. Use Valid Parameters
- Speed: 0.5 to 2.0
- Pitch: 0.5 to 2.0
- Style: Depends on voice (angry, chat, cheerful, sad, etc.)

---

## 🧪 Test All Voices

The repo includes a test script:

```bash
# Make executable
chmod +x edge-tts-openai-cf-worker/test_voices.sh

# Run tests
./edge-tts-openai-cf-worker/test_voices.sh https://YOUR_WORKER YOUR_KEY
```

This will generate test audio for ALL available voices!

---

## 🔧 Troubleshooting

### Error: "Invalid voice"
**Fix**: Check voice name is correct (e.g., `en-US-JennyNeural`)

### Error: "Language mismatch"
**Fix**: Use matching voice for your text language

### Error: "Authentication failed"
**Fix**: Check Authorization header: `Bearer YOUR_KEY`

### Error: "Request timeout"
**Fix**: Shorten your text (keep under 500 chars)

---

## 📁 Files in This Repo

| File | Purpose |
|------|---------|
| `worker.js` | ⭐ Main code - copy this to Cloudflare |
| `wrangler.toml` | Wrangler CLI config (for local dev) |
| `test_voices.sh` | Test script to try all voices |
| `readme.md` | Original documentation (Chinese) |
| `readme-dev.md` | Developer notes |

---

## 🆘 Need More Help?

Read the complete guide: [`EDGE_TTS_WORKER_COMPLETE_GUIDE.md`](EDGE_TTS_WORKER_COMPLETE_GUIDE.md)

---

## 🎉 Next Steps

1. ✅ Deploy to Cloudflare (5 minutes)
2. ✅ Test with curl command above
3. ✅ Try different voices and styles
4. ✅ Integrate into your projects!

---

**Repository Location**: `c:\Users\Ronit\Downloads\test models 2\edge-tts-openai-cf-worker`  
**Deployment Time**: ~5 minutes  
**Cost**: FREE (100K requests/day)  

**Ready to create speech?** 🚀

```bash
# Your first TTS call:
curl -X POST https://YOUR_WORKER.workers.dev/v1/audio/speech \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"tts-1","input":"Hello from Edge TTS!","voice":"en-US-JennyNeural"}' \
  --output speech.mp3
```
