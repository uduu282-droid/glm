# 🚀 Quick Start Guide - Pixelbin Video Generator

Get started with AI video generation in minutes!

## ⚡ 3 Ways to Generate Videos

### 1️⃣ Interactive Mode (Recommended for Beginners)

```bash
node pixelbin_video_generator.js
```

**What you get:**
- Menu-driven interface
- Step-by-step guidance
- Style selector
- Preset scenarios
- Provider switching

**Example session:**
```
Enter your choice (1-6): 1
Enter your video description: A cute robot dancing in rain
Enter style (or type "list"): cyberpunk
Negative prompt: blurry, ugly
Duration: 3
Resolution: 1
Generate video? yes
```

---

### 2️⃣ Quick CLI (For Fast Generation)

```bash
# Basic usage
node pixelbin_cli.js "Your prompt here"

# With options
node pixelbin_cli.js "Cyberpunk city at night" --style=cyberpunk --duration=5

# Advanced
node pixelbin_cli.js "Ocean waves" --style=realistic --negative="people,text" --resolution=1024x1024
```

**Quick reference:**
```bash
# Short videos (3 seconds)
node pixelbin_cli.js "A beautiful sunset"

# Longer videos (5 seconds)
node pixelbin_cli.js "Space exploration" --duration=5

# Specific style
node pixelbin_cli.js "Magic forest" --style=fantasy

# High resolution
node pixelbin_cli.js "Future city" --resolution=1024x1024

# Use alternative provider
node pixelbin_cli.js "Dragon flying" --provider=grok
```

---

### 3️⃣ Batch Processing (For Multiple Videos)

```bash
# Run demo (3 preset videos)
node pixelbin_batch.js --demo

# Run with config file
node pixelbin_batch.js --config=batch_config_example.json

# Save results
node pixelbin_batch.js --demo --output=my_results.json
```

**Create your own batch config:**
```json
[
  {
    "prompt": "Your first video idea",
    "style": "cinematic",
    "duration": 5
  },
  {
    "prompt": "Your second video idea",
    "style": "realistic",
    "duration": 3
  }
]
```

---

## 📋 Complete Examples

### Example 1: Create a Cinematic Sunset

**Interactive:**
```bash
node pixelbin_video_generator.js
# Choose option 1
# Prompt: "Beautiful sunset over mountains with orange and purple sky"
# Style: cinematic
# Duration: 5
```

**CLI:**
```bash
node pixelbin_cli.js "Beautiful sunset over mountains with orange and purple sky" \
  --style=cinematic \
  --duration=5 \
  --resolution=1024x1024
```

---

### Example 2: Create Cyberpunk City Scene

**Interactive:**
```bash
node pixelbin_video_generator.js
# Choose option 1
# Prompt: "Futuristic city with flying cars, neon lights, rain at night"
# Style: cyberpunk
# Negative: daylight, sunny, nature
```

**CLI:**
```bash
node pixelbin_cli.js "Futuristic city with flying cars, neon lights, rain at night" \
  --style=cyberpunk \
  --negative="daylight,sunny,nature"
```

---

### Example 3: Batch Generate 8 Videos

```bash
# Using the included example config
node pixelbin_batch.js --config=batch_config_example.json --output=all_videos.json
```

This will generate:
1. Tropical sunset
2. Cyberpunk city
3. Ocean waves
4. Space scene
5. Magical forest
6. Dragon castle
7. Underwater reef
8. Japanese garden

---

## 🎨 Style Guide

**Popular styles and when to use them:**

| Style | Best For | Example Prompts |
|-------|----------|-----------------|
| `cinematic` | Dramatic scenes | Sunsets, landscapes, epic moments |
| `cyberpunk` | Sci-fi futures | Cities, technology, neon aesthetics |
| `realistic` | Real-world scenes | Nature, animals, everyday objects |
| `fantasy` | Magical scenes | Dragons, forests, fairy tales |
| `scifi` | Space/technology | Astronauts, robots, space stations |
| `anime` | Animated look | Characters, Japanese themes |
| `cartoon` | Fun/playful | Kids content, lighthearted scenes |

---

## ⚙️ Configuration Options

### Resolution Options

| Code | Resolution | Aspect Ratio | Best For |
|------|------------|--------------|----------|
| `512x512` | 512×512 | 1:1 (square) | Social media posts |
| `1024x1024` | 1024×1024 | 1:1 (HD square) | High-quality squares |
| `1024x576` | 1024×576 | 16:9 (landscape) | YouTube, widescreen |
| `576x1024` | 576×1024 | 9:16 (portrait) | TikTok, Instagram Stories |

### Duration

- **3 seconds**: Quick tests, simple scenes
- **4 seconds**: Standard length
- **5+ seconds**: Complex scenes, detailed motion

### Negative Prompts

**Common negative prompts to improve quality:**
- `"blurry, low quality, distorted"` - General quality issues
- `"ugly, deformed, mutated"` - Unwanted distortions
- `"text, watermark, signature"` - Remove text artifacts
- `"people, humans, faces"` - Avoid human subjects
- `"cartoon, anime"` - Keep it realistic

---

## 🔄 Provider Comparison

### AIVideoGenerator (Default)
- ✅ More stable
- ✅ Better error messages
- ⚠️ May require pageId

### GrokImagine (Alternative)
- ⚠️ Sometimes less restrictive
- ✅ Good backup option
- ⚠️ Similar limitations

**Switch providers:**
```bash
# In interactive mode
# Select option 2 → Choose provider

# In CLI mode
node pixelbin_cli.js "Prompt" --provider=grok
```

---

## 🐛 Common Issues & Solutions

### Issue: "pageId illegal"

**What it means:** API needs a valid pageId from website session

**Solutions:**
1. Visit https://aivideogenerator.me first
2. Use browser automation (Puppeteer)
3. Try the alternative provider (GrokImagine)

---

### Issue: "HC verification required"

**What it means:** Human captcha verification needed

**Solutions:**
1. Complete captcha on website
2. Use web interface directly
3. Try different provider

---

### Issue: "email is null"

**What it means:** Account email verification required

**Solutions:**
1. Register/login on platform
2. Verify email address
3. Use fresh authentication token

---

### Issue: Request timeout

**Solutions:**
1. Check internet connection
2. Increase timeout in code
3. Try again later (server might be busy)

---

## 💡 Pro Tips

### Write Better Prompts

**Bad:**
```
"A dog"
```

**Good:**
```
"A golden retriever running happily in a sunny park with green grass and blue sky"
```

**Key elements to include:**
- Subject (what/who)
- Action (what's happening)
- Setting (where)
- Atmosphere (lighting, mood)
- Details (colors, textures)

---

### Optimize for Success

1. **Start simple**: Test with basic prompts first
2. **Short duration**: Use 3s for testing
3. **One concept**: Don't overcrowd prompts
4. **Clear style**: Specify artistic style
5. **Use negatives**: Exclude unwanted elements

---

### Batch Processing Strategy

```bash
# 1. Test individual prompts first
node pixelbin_cli.js "Test prompt" --duration=3

# 2. Create config with working prompts
# Edit batch_config.json

# 3. Run batch with delays
node pixelbin_batch.js --config=batch_config.json --delay=5000

# 4. Review results
cat batch_results.json
```

---

## 📊 Expected Output

**Successful response:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "videoUrl": "https://...",
    "taskId": "...",
    "status": "processing"
  }
}
```

**Typical errors:**
```json
{
  "code": 400000,
  "message": "pageId illegal"
}
```

---

## 🎯 Next Steps

1. **Try interactive mode** - Get familiar with the tool
2. **Test different styles** - See what works best
3. **Create custom prompts** - Experiment with descriptions
4. **Batch process** - Generate multiple videos
5. **Share results** - Help others learn!

---

## 📞 Need Help?

```bash
# Show help
node pixelbin_cli.js --help
node pixelbin_batch.js --help

# Check if dependencies installed
npm list axios

# Test connection
node pixelbin_cli.js "test" --duration=1
```

---

## 🔗 Related Files

- `pixelbin_video_generator.js` - Interactive mode
- `pixelbin_cli.js` - Command-line mode
- `pixelbin_batch.js` - Batch processing
- `batch_config_example.json` - Sample batch config
- `README_PIXELBIN_VIDEO_GENERATOR.md` - Full documentation

---

**Ready to create amazing AI videos? Let's go! 🎬✨**
