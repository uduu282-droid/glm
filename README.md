# 🤖 GLM AI Chat

Complete GLM AI implementation with Node.js and web interface, powered by FeatherLabs GLM API.

## ✨ Features

- **Multiple GLM Models**: Support for GLM-4.5, 4.6, 4.7, and vision models
- **Web Interface**: Beautiful, responsive chat UI
- **Node.js CLI**: Command-line interface for quick testing
- **Vision Support**: Image analysis with GLM-4.6v
- **Conversation History**: Maintains context across messages
- **Customizable**: Adjust temperature, max tokens, and model selection

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Test the API

```bash
npm test
```

### 3. Use CLI Mode

```bash
npm start
```

### 4. Launch Web Interface

```bash
npm run web
```

Then open http://localhost:3000 in your browser.

## 📁 Files

- `glm-chat.js` - Node.js implementation
- `glm-chat-web.html` - Web interface
- `package.json` - Dependencies
- `test_glm_api.js` - Original API tests

## 🔧 Configuration

Edit `glm-chat.js` to change:

```javascript
this.baseUrl = 'https://api-glm.featherlabs.online/v1';
this.apiKey = 'vtx-RUmIksxLD8Qf8njF3JsMXLqICnZEohaM';
this.defaultModel = 'glm-4.6';
```

## 🎯 Available Models

| Model | Description | Best For |
|-------|-------------|----------|
| `glm-4.7` | Latest flagship | General purpose |
| `glm-4.6` | Powerful & balanced | **Recommended** |
| `glm-4.6v` | Vision-capable | Image analysis |
| `glm-4.5` | High-performance (360B) | Complex tasks |
| `glm-4.5-air` | Fast & lightweight | Quick responses |

## 💻 Usage Examples

### Node.js

```javascript
import GLMChat from './glm-chat.js';

const glm = new GLMChat({
    model: 'glm-4.6'
});

// Simple chat
const result = await glm.chat('Hello!');
console.log(result.response);

// With image (vision model)
const visionResult = await glm.chat(
    'What is in this image?',
    { 
        model: 'glm-4.6v',
        image: 'https://example.com/image.jpg'
    }
);
console.log(visionResult.response);
```

### Web Interface

1. Open `glm-chat-web.html` in browser
2. Select model from dropdown
3. Adjust temperature if needed
4. Type message and press Send

## 🎨 Web Interface Features

- **Real-time chat** with smooth animations
- **Model selection** dropdown
- **Temperature control** slider
- **Max tokens** input
- **Conversation history** maintained
- **Responsive design** for all devices
- **Loading indicators** during API calls

## 🔑 API Key

The included API key is for demonstration. For production use, get your own key from FeatherLabs.

## 📝 Notes

- Conversation history is limited to last 10 messages
- Vision models require image URLs (not file uploads)
- Temperature: 0 = focused, 1 = creative
- Higher max_tokens = longer responses but slower

## 🐛 Troubleshooting

**"API Error: 401"** - Invalid API key  
**"API Error: 429"** - Rate limit exceeded  
**"Network error"** - Check internet connection  
**No response** - Try a different model

## 📄 License

MIT License - Feel free to use in your projects!

## 🙏 Credits

- GLM API by [FeatherLabs](https://featherlabs.online)
- Original tests by @uduu282

---

**Enjoy chatting with GLM! 🎉**
