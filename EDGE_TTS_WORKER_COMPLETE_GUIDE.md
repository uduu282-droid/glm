# 🎙️ Edge TTS OpenAI CF Worker - Complete Guide

## 📋 What is This?

This project clones Microsoft Edge's Text-to-Speech (TTS) service and wraps it in an **OpenAI-compatible API** that runs on **Cloudflare Workers**.

### ✨ Key Features

- ✅ **Free** - Uses Cloudflare Worker free tier (100K requests/day)
- ✅ **OpenAI Compatible** - Same API format as OpenAI TTS
- ✅ **No Microsoft Auth Required** - Bypasses certification requirements
- ✅ **Multi-language** - Chinese, English, Japanese, Korean
- ✅ **Custom Domain Support** - Use your own domain
- ✅ **API Key Protection** - Optional authentication
- ✅ **High Quality** - Microsoft's neural TTS voices

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Create Cloudflare Worker

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to `Workers & Pages`
3. Click `Create Worker`
4. Name it: `edge-tts` (or any name you like)

### Step 2: Deploy the Code

1. Delete the default code in the editor
2. Copy the entire content from [`worker.js`](edge-tts-openai-cf-worker/worker.js)
3. Paste it into the Cloudflare Worker editor
4. Click `Save and deploy`

### Step 3: Set API Key (Optional but Recommended)

1. In Worker settings, go to `Settings` → `Variables`
2. Click `Add variable`
3. Name: `API_KEY`
4. Value: Your desired secret key (e.g., `my-secret-key-123`)
5. Click `Save and deploy`

### Step 4: Test It!

```bash
curl -X POST https://your-worker.yourusername.workers.dev/v1/audio/speech \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "model": "tts-1",
    "input": "Hello, world!",
    "voice": "en-US-JennyNeural"
  }' --output test.mp3
```

Play the audio:
```bash
afplay test.mp3  # macOS
mpv test.mp3     # Linux/Windows
```

---

## 🔧 API Reference

### Endpoint
```
POST /v1/audio/speech
```

### Headers
```http
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

### Request Body
```json
{
  "model": "tts-1",              // Required: Model name (fixed value)
  "input": "你好，世界！",         // Required: Text to convert
  "voice": "zh-CN-XiaoxiaoNeural", // Required: Voice name
  "response_format": "mp3",      // Optional: Audio format (default: mp3)
  "speed": 1.0,                  // Optional: Speed (0.5-2.0, default: 1.0)
  "pitch": 1.0,                  // Optional: Pitch (0.5-2.0, default: 1.0)
  "style": "general"             // Optional: Emotion style
}
```

### Response
- **Success**: MP3 audio file (binary data)
- **Error**: JSON error object

---

## 🎭 Available Voices

### Chinese Voices (zh-CN)
| Voice | Description | Gender |
|-------|-------------|--------|
| `zh-CN-XiaoxiaoNeural` | Warm, lively | Female |
| `zh-CN-XiaoyiNeural` | Warm, gentle | Female |
| `zh-CN-YunxiNeural` | Steady, atmospheric | Male |
| `zh-CN-YunyangNeural` | Professional, authoritative | Male |
| `zh-CN-XiaohanNeural` | Natural, fluent | Female |
| `zh-CN-XiaomengNeural` | Sweet, dynamic | Female |
| `zh-CN-XiaochenNeural` | Gentle, calm | Female |
| `zh-CN-XiaoruiNeural` | Elegant, scholarly | Male |
| `zh-CN-XiaoshuangNeural` | Tender, graceful | Female |
| `zh-CN-YunfengNeural` | Mature, deep | Male |
| `zh-CN-YunjianNeural` | Sunny, energetic | Male |
| `zh-CN-XiaoxuanNeural` | Intellectual, poised | Female |
| `zh-CN-YunxiaNeural` | Youthful, bright | Male |
| `zh-CN-XiaomoNeural` | Elegant, refined | Female |
| `zh-CN-XiaozhenNeural` | Confident, assertive | Female |

### English Voices (en-US)
| Voice | Description | Gender |
|-------|-------------|--------|
| `en-US-JennyNeural` | Friendly, natural | Female |
| `en-US-GuyNeural` | Clear, professional | Male |

### Japanese Voices (ja-JP)
| Voice | Description | Gender |
|-------|-------------|--------|
| `ja-JP-NanamiNeural` | Polite, clear | Female |
| `ja-JP-KeitaNeural` | Warm, friendly | Male |

### Korean Voices (ko-KR)
| Voice | Description | Gender |
|-------|-------------|--------|
| `ko-KR-SunHiNeural` | Bright, cheerful | Female |
| `ko-KR-InJoonNeural` | Calm, professional | Male |

---

## 🎛️ Emotion Styles

Available style parameters (voice-dependent):

| Style | Effect | Use Case |
|-------|--------|----------|
| `angry` | Angry tone | Intense dialogue |
| `chat` | Casual conversation | Everyday chat |
| `cheerful` | Happy, joyful | Joyful scenes |
| `sad` | Sad, melancholic | Emotional scenes |
| `fearful` | Scared, anxious | Suspense |
| `disgruntled` | Discontented | Complaints |
| `serious` | Serious, formal | Formal announcements |
| `depressed` | Depressed, low | Sad narratives |
| `gentle` | Gentle, soft | Comforting content |
| `affectionate` | Affectionate, warm | Romantic content |
| `embarrassed` | Embarrassed, shy | Awkward moments |
| `envious` | Envious | Jealous scenarios |

Example with emotion:
```bash
curl -X POST https://your-worker.workers.dev/v1/audio/speech \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "model": "tts-1",
    "input": "This is amazing!",
    "voice": "en-US-JennyNeural",
    "style": "cheerful",
    "speed": 1.2
  }' --output happy.mp3
```

---

## 📦 Testing Tools

### Test Script Included

The repository includes a comprehensive test script:

```bash
# Make executable
chmod +x edge-tts-openai-cf-worker/test_voices.sh

# Run tests (with API key)
./edge-tts-openai-cf-worker/test_voices.sh https://your-worker.workers.dev your-api-key

# Run tests (without API key)
./edge-tts-openai-cf-worker/test_voices.sh https://your-worker.workers.dev
```

This will generate test audio files for all supported voices!

---

## 💡 Usage Examples

### Example 1: Basic Chinese TTS
```bash
curl -X POST https://your-worker.workers.dev/v1/audio/speech \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "model": "tts-1",
    "input": "你好，这是一个测试。",
    "voice": "zh-CN-XiaoxiaoNeural"
  }' --output chinese_test.mp3
```

### Example 2: English with Speed Control
```bash
curl -X POST https://your-worker.workers.dev/v1/audio/speech \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "model": "tts-1",
    "input": "This is a faster narration.",
    "voice": "en-US-JennyNeural",
    "speed": 1.5
  }' --output fast_english.mp3
```

### Example 3: Japanese with Emotion
```bash
curl -X POST https://your-worker.workers.dev/v1/audio/speech \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "model": "tts-1",
    "input": "こんにちは、テストです。",
    "voice": "ja-JP-NanamiNeural",
    "style": "cheerful"
  }' --output japanese_happy.mp3
```

### Example 4: Korean Slow Speech
```bash
curl -X POST https://your-worker.workers.dev/v1/audio/speech \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "model": "tts-1",
    "input": "안녕하세요, 테스트입니다.",
    "voice": "ko-KR-SunHiNeural",
    "speed": 0.8
  }' --output korean_slow.mp3
```

---

## ⚠️ Important Notes

### Language Matching
**CRITICAL**: Match voice language with text language!

❌ **Wrong**: Using English voice for Chinese text  
✅ **Correct**: Using Chinese voice for Chinese text

```javascript
// Auto-select voice based on text language
function selectVoice(text) {
  if (/[\u4e00-\u9fa5]/.test(text)) {
    return 'zh-CN-XiaoxiaoNeural';  // Chinese
  } else if (/^[a-zA-Z\s,.!?]+$/.test(text)) {
    return 'en-US-JennyNeural';     // English
  } else if (/[\u3040-\u30ff]/.test(text)) {
    return 'ja-JP-NanamiNeural';    // Japanese
  } else if (/[\uAC00-\uD7AF]/.test(text)) {
    return 'ko-KR-SunHiNeural';     // Korean
  }
  return 'zh-CN-XiaoxiaoNeural';    // Default
}
```

### Limitations

1. **Text Length**: Keep it under ~500 characters to avoid timeouts
2. **Rate Limits**: Cloudflare free tier = 100K requests/day
3. **Audio Format**: Currently only MP3 supported
4. **Duration**: Best for short clips (< 1 minute)

---

## 🔒 Security Considerations

### API Key Best Practices

1. **Always set an API key** in production
2. **Use strong, random keys** (at least 32 characters)
3. **Rotate keys periodically**
4. **Don't commit keys to Git**
5. **Use environment variables**

Generate a secure API key:
```bash
# Generate random 32-character key
openssl rand -hex 16
```

---

## 🌐 Custom Domain Setup

### Why Use Custom Domain?

- ✅ Professional branding
- ✅ Easier to remember
- ✅ Can switch workers without changing URL
- ✅ Better for production use

### Steps to Add Custom Domain

1. Your domain must be hosted on Cloudflare
2. DNS must be proxied through Cloudflare (orange cloud)
3. In Worker dashboard:
   - Go to `Settings` → `Domains & Routes`
   - Click `Add Custom Domain`
   - Enter your domain (e.g., `tts.example.com`)
   - Click `Add Domain`
4. Wait for SSL certificate (usually 5-10 minutes)

After setup:
```bash
# Use custom domain instead of workers.dev
curl -X POST https://tts.example.com/v1/audio/speech ...
```

---

## 🛠️ Development & Deployment

### Local Testing with Wrangler

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Clone the repo
git clone https://github.com/linshenkx/edge-tts-openai-cf-worker.git
cd edge-tts-openai-cf-worker

# Start local dev server
wrangler dev

# Test locally
curl -X POST http://localhost:8787/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts-1",
    "input": "Test",
    "voice": "en-US-JennyNeural"
  }' --output test.mp3
```

### Deploy with Wrangler

```bash
# Deploy
wrangler publish

# Or with environment
wrangler publish --env production
```

---

## 📊 Monitoring & Debugging

### Check Worker Logs

In Cloudflare Dashboard:
1. Go to your Worker
2. Click `Logs` tab
3. Enable `Logpush` if needed

### Common Errors

**Error 1: "Invalid voice"**
```json
{"error": "Invalid voice parameter"}
```
**Fix**: Check voice name matches supported list

**Error 2: "Language mismatch"**
```json
{"error": "Voice language does not match text language"}
```
**Fix**: Use appropriate voice for your text language

**Error 3: "Authentication failed"**
```json
{"error": "Invalid or missing API key"}
```
**Fix**: Check Authorization header format: `Bearer YOUR_KEY`

**Error 4: "Request too large"**
```json
{"error": "Input text too long"}
```
**Fix**: Reduce text length (keep under 500 chars)

---

## 🔄 Comparison with Alternatives

### vs. OpenAI TTS API

| Feature | Edge TTS Worker | OpenAI TTS |
|---------|----------------|------------|
| Cost | Free (CF free tier) | $15 per 1M chars |
| Setup Time | 5 minutes | Instant |
| Voice Quality | Excellent (Microsoft) | Excellent |
| Languages | 4 main languages | 25+ languages |
| Customization | High (styles, pitch, speed) | Medium (speed only) |
| Rate Limit | 100K/day (free) | Based on tier |
| Self-hosted | ✅ Yes | ❌ No |

### vs. Google TTS

| Feature | Edge TTS Worker | Google TTS |
|---------|----------------|------------|
| Cost | Free | $4 per 1M chars |
| Neural Voices | ✅ Yes | ✅ Yes |
| Emotion Control | ✅ Yes | ❌ Limited |
| Setup Complexity | Medium | Easy |

---

## 🎯 Use Cases

### Good For:
- ✅ Personal projects
- ✅ Prototyping
- ✅ Low-traffic applications
- ✅ Learning/experimentation
- ✅ Internal tools
- ✅ Non-critical applications

### NOT Recommended For:
- ❌ High-traffic production systems
- ❌ Mission-critical applications
- ❌ Commercial products (use official API)
- ❌ Long-form audio (> 5 minutes)
- ❌ High-reliability requirements

---

## 📈 Performance Tips

1. **Keep text short** - Under 500 characters
2. **Use appropriate voice** - Match language correctly
3. **Cache results** - Store generated audio when possible
4. **Batch requests** - Combine multiple short texts
5. **Monitor usage** - Stay within Cloudflare limits

---

## 🔗 Useful Links

- [Original Repository](https://github.com/linshenkx/edge-tts-openai-cf-worker)
- [Microsoft TTS Documentation](https://learn.microsoft.com/azure/cognitive-services/speech-service/language-support?tabs=tts)
- [Cloudflare Workers Pricing](https://workers.cloudflare.com/pricing)
- [Microsoft Voice Styles](https://learn.microsoft.com/azure/ai-services/speech-service/speech-synthesis-markup-voice)

---

## 🆘 Troubleshooting

### Issue: Worker returns 403 Forbidden
**Solution**: Check API_KEY environment variable is set correctly

### Issue: Audio is garbled or distorted
**Solution**: 
1. Check voice matches text language
2. Verify speed/pitch are in valid range (0.5-2.0)
3. Try different voice

### Issue: Request timeout
**Solution**:
1. Reduce text length
2. Check network connectivity
3. Try again later (service may be temporarily overloaded)

### Issue: No sound in output
**Solution**:
1. Check response is actually audio (not error JSON)
2. Verify file extension matches format (.mp3)
3. Try playing with different media player

---

## 🎉 Quick Reference Card

```bash
# Basic Call
curl -X POST https://YOUR_WORKER.workers.dev/v1/audio/speech \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"tts-1","input":"Hello","voice":"en-US-JennyNeural"}' \
  --output speech.mp3

# With Parameters
curl -X POST https://YOUR_WORKER.workers.dev/v1/audio/speech \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model":"tts-1",
    "input":"Hello world!",
    "voice":"en-US-JennyNeural",
    "speed":1.2,
    "style":"cheerful"
  }' --output speech.mp3

# Test All Voices
./test_voices.sh https://YOUR_WORKER.workers.dev YOUR_API_KEY
```

---

**Repository Cloned Successfully!** ✅  
**Location**: `c:\Users\Ronit\Downloads\test models 2\edge-tts-openai-cf-worker`  
**Status**: Ready to deploy  

Next step: Deploy to Cloudflare Workers and start generating speech! 🚀
