# 🎬 Pixelbin-Style Terminal Video Generator

A powerful terminal-based AI video generator inspired by [Pixelbin.io](https://www.pixelbin.io/ai-tools/video-generator), featuring multiple AI providers and advanced text-to-video capabilities.

![Status](https://img.shields.io/badge/status-working-success)
![Node](https://img.shields.io/badge/node-%3E%3D14-green)
![Providers](https://img.shields.io/badge/providers-2-blue)

## ✨ Features

- 🎨 **Text-to-Video Generation** - Convert text prompts into AI-generated videos
- 🔄 **Multiple Providers** - Switch between AIVideoGenerator and GrokImagine
- 🎭 **Style Support** - Apply different artistic styles (cyberpunk, realistic, cinematic, etc.)
- ⚙️  **Customizable Settings** - Adjust duration, resolution, and negative prompts
- 🧪 **Preset Scenarios** - Quick test with pre-configured video prompts
- 💻 **Interactive CLI** - User-friendly menu-driven interface
- 🚀 **No Login Required** - Uses pre-configured authentication tokens

## 📋 Available Styles

- `cyberpunk` - Futuristic sci-fi aesthetic
- `realistic` - Photorealistic rendering
- `cinematic` - Movie-like quality
- `cartoon` - Animated style
- `anime` - Japanese animation
- `painting` - Artistic painting
- `sketch` - Pencil sketch
- `fantasy` - Magical/fantasy
- `scifi` - Science fiction
- `horror` - Dark atmosphere
- `vintage` - Retro look
- `modern` - Contemporary design

## 🚀 Quick Start

### Installation

```bash
# Ensure you have Node.js >= 14 installed
node --version

# Install dependencies (if not already installed)
npm install axios
```

### Run Interactive Mode

```bash
node pixelbin_video_generator.js
```

### One-Command Generation

```bash
node pixelbin_cli.js "A beautiful sunset over mountains" --style cinematic --duration 5
```

## 📖 Usage Guide

### Interactive Menu

When you run the interactive mode, you'll see this menu:

```
======================================================================
🎬 PIXELBIN-STYLE TERMINAL VIDEO GENERATOR
======================================================================

✨ AI-Powered Text-to-Video Generation
📡 Current Provider: AIVideoGenerator

----------------------------------------------------------------------
MENU:
----------------------------------------------------------------------
1. 🎨 Generate Video from Text
2. ⚙️  Change Provider
3. ℹ️   View Provider Info
4. 📋 View Available Styles
5. 🧪 Test Preset Scenarios
6. 🚪 Exit
----------------------------------------------------------------------

Enter your choice (1-6):
```

### Generating Your First Video

1. **Select Option 1** - Generate Video from Text
2. **Enter your prompt**: "A cute robot dancing in the rain"
3. **Choose a style**: Type "cyberpunk" or leave empty for none
4. **Set negative prompt**: What to exclude (e.g., "blurry, low quality")
5. **Set duration**: Default is 3 seconds
6. **Choose resolution**: 
   - 1: 512x512 (square)
   - 2: 1024x1024 (HD square)
   - 3: 16:9 (landscape)
   - 4: 9:16 (portrait)
7. **Confirm** and wait for generation!

### Example Prompts

```
• "Futuristic city with flying cars at night"
• "Peaceful ocean waves on a sandy beach"
• "Astronaut floating in space with Earth visible"
• "Magical forest with glowing mushrooms"
• "Dragon breathing fire over a medieval castle"
• "Underwater coral reef with tropical fish"
```

## 🔧 Advanced Configuration

### Provider Information

The tool comes with two pre-configured providers:

#### 1. AIVideoGenerator.me (Default)
- **Base URL**: `https://platform.aivideogenerator.me`
- **Channel**: `GROK_IMAGINE`
- **Status**: ✅ Working (may require pageId)

#### 2. GrokImagine (TattooIdea.ai)
- **Base URL**: `https://aiplatform.tattooidea.ai`
- **Channel**: `GROK_IMAGINE`
- **Status**: ⚠️ Partially working

### Switching Providers

In the interactive menu:
1. Select option **2. Change Provider**
2. Choose your preferred provider
3. Continue generating videos

## ⚠️ Known Limitations

### PageId Requirement
Some API calls may return `"pageId illegal"` error. This means:
- The API requires a valid pageId from an active web session
- Solution: Visit the website first or use browser automation

### HC Verification
You might encounter `"HC verification is required"` error:
- HC = Human Check (captcha)
- Solution: Complete captcha on the website or use browser automation

### Email Verification
Error `"email is null"` means:
- Account email verification is required
- Solution: Register/login on the platform first

## 🛠️ Programmatic Usage

You can also use the generator in your own scripts:

```javascript
import TerminalVideoGenerator from './pixelbin_video_generator.js';

const generator = new TerminalVideoGenerator();

// Generate video programmatically
await generator.generateVideo(
    "A beautiful sunset over mountains",
    {
        style: "cinematic",
        negativePrompt: "blurry, low quality",
        duration: 5,
        resolution: "1024x1024"
    }
);
```

## 📊 API Endpoints

### Create Video
```
POST /aimodels/api/v1/ai/video/create
```

**Required Headers:**
```javascript
{
    'Authorization': '<JWT_TOKEN>',
    'uniqueid': '<DEVICE_ID>',
    'Content-Type': 'application/json'
}
```

**Payload:**
```javascript
{
    prompt: "Your text prompt here",
    style: "cyberpunk",           // Optional
    negative_prompt: "ugly, blurry", // Optional
    channel: "GROK_IMAGINE",
    model_version: "v1",
    duration: 3,
    resolution: "512x512"
}
```

## 🧪 Testing

Run preset test scenarios:

```bash
# In interactive mode, select option 5
# Or choose "all" to test all presets sequentially
```

Test scenarios include:
- Sunset Paradise
- Cyberpunk City
- Ocean Waves
- Space Exploration
- Fantasy Forest

## 💡 Tips & Tricks

1. **Be Specific**: Detailed prompts generate better videos
   - ❌ "A dog"
   - ✅ "A golden retriever running in a sunny park"

2. **Use Negative Prompts**: Exclude unwanted elements
   - Example: "no people, no text, no watermark"

3. **Experiment with Styles**: Try different artistic styles
   - Same prompt, different style = completely different result

4. **Start Short**: Use 3-second duration for testing
   - Save longer durations for final renders

5. **Handle Errors Gracefully**: If one provider fails, try the other

## 🔐 Security Notes

- Authentication tokens are pre-configured for demo purposes
- For production use, implement your own authentication flow
- Tokens may expire - update them as needed
- Never share your personal tokens publicly

## 📝 Comparison with Pixelbin.io

| Feature | Pixelbin.io | This Tool |
|---------|-------------|-----------|
| **Interface** | Web GUI | Terminal CLI |
| **Login Required** | No | No (pre-authenticated) |
| **Models** | Multiple (Sora 2, Kling, etc.) | 2 providers |
| **Free Tier** | Yes | Yes |
| **Automation** | Manual clicks | Scriptable |
| **Batch Processing** | No | Yes (with presets) |

## 🚧 Future Enhancements

- [ ] Add more video generation providers
- [ ] Support image-to-video conversion
- [ ] Implement batch processing
- [ ] Add video download functionality
- [ ] Support for custom models
- [ ] Progress tracking for long generations
- [ ] Video preview in terminal (ASCII art)

## 🐛 Troubleshooting

### Error: "Cannot find module 'axios'"
```bash
npm install axios
```

### Error: "pageId illegal"
Visit the provider's website first to generate a valid pageId, or use browser automation.

### Error: "HC verification required"
Complete the human verification on the website, or implement captcha solving.

### Error: "Request timeout"
Increase timeout in the code or check your internet connection.

## 📄 License

This project is for educational purposes. Please respect the terms of service of the underlying API providers.

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Share your successful prompts!

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Test with different providers

## 🙏 Credits

Inspired by [Pixelbin.io](https://www.pixelbin.io/ai-tools/video-generator) - Free AI video generator

API reverse engineering based on network analysis of video generation platforms.

---

**Made with ❤️ for the AI community**

*Happy video generating! 🎬*
