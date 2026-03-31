# 🤖 GLM-5 OpenAI-Compatible API Server

Free GLM-5 access through an OpenAI-compatible API server. No API key required!

## 🚀 Quick Start

### Local Usage

```bash
# Install dependencies
pip install -r requirements.txt

# Start server
python glm_server.py

# Server runs on http://127.0.0.1:8000
```

### Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Fork this repository
2. Connect to Render
3. Deploy automatically with `render.yaml`

Your API will be live at: `https://your-service.onrender.com/v1`

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET/POST | Health check (uptime bot friendly) |
| `/v1/models` | GET | List available models |
| `/v1/chat/completions` | POST | Chat completions (streaming & non-streaming) |
| `/v1/session/reset` | POST | Reset chat session |

## � Usage Examples

### Python (OpenAI SDK)

```python
import openai

client = openai.OpenAI(
    base_url="http://127.0.0.1:8000/v1",
    api_key="glm-local"  # any value works
)

response = client.chat.completions.create(
    model="glm-5",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)
```

### Node.js

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
    baseURL: 'http://127.0.0.1:8000/v1',
    apiKey: 'glm-local'
});

const response = await client.chat.completions.create({
    model: 'glm-5',
    messages: [{ role: 'user', content: 'Hello!' }]
});

console.log(response.choices[0].message.content);
```

### cURL

```bash
curl http://127.0.0.1:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer glm-local" \
  -d '{
    "model": "glm-5",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## 🔧 Configuration

### Environment Variables

- `PORT` - Server port (default: 8000, auto-set by Render)

### Command Line Options

```bash
python glm_server.py --host 0.0.0.0 --port 8000 --eager-boot
```

Options:
- `--host` - Host to bind to (default: 127.0.0.1)
- `--port` - Port to listen on (default: 8000)
- `--eager-boot` - Pre-boot GLM session on startup

## 🤖 Uptime Monitoring

The `/health` endpoint supports both GET and POST for uptime bots:

```bash
# GET request
curl https://your-service.onrender.com/health

# POST request (for bots that use POST)
curl -X POST https://your-service.onrender.com/health
```

Response:
```json
{
  "status": "ok",
  "service": "GLM-5 Chat",
  "session": "active",
  "turns": 5,
  "chat_id": "abc-123",
  "timestamp": 1711872000.123
}
```

### Recommended Uptime Bots

- [UptimeRobot](https://uptimerobot.com/) - Free, 5-minute intervals
- [Cron-job.org](https://cron-job.org/) - Free, customizable schedules
- [Better Uptime](https://betteruptime.com/) - Free tier available

## 🎯 Features

- ✅ OpenAI-compatible API
- ✅ No API key required
- ✅ Streaming support
- ✅ Session persistence
- ✅ Browser spoofing (Firefox impersonation)
- ✅ Automatic retry on rate limits
- ✅ Health endpoints for monitoring
- ✅ Free to use

## 📝 How It Works

This server uses reverse-engineered access to Z.ai's GLM-5 service:

1. **Browser Impersonation**: Uses `curl_cffi` to impersonate Firefox
2. **Guest Authentication**: Automatically creates guest accounts
3. **HMAC Signatures**: Generates valid authentication signatures
4. **Session Management**: Maintains conversation history server-side
5. **OpenAI Compatibility**: Translates between OpenAI and GLM-5 formats

## ⚠️ Limitations

- **Rate Limits**: Z.ai's free tier has concurrency limits
- **Stability**: Reverse-engineered, may break if Z.ai changes their API
- **Guest Accounts**: No persistent user accounts
- **Free Tier**: Subject to Z.ai's free tier limitations

## 🛠️ Tech Stack

- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **curl_cffi** - Browser impersonation
- **Pydantic** - Data validation

## 📄 License

MIT License - Free to use and modify

## 🙏 Credits

- GLM-5 by [ZhipuAI](https://www.zhipuai.cn/)
- Z.ai service by [Z.ai](https://chat.z.ai/)
- Reverse engineering by community contributors

## 🔗 Links

- [Deployment Guide](RENDER_DEPLOYMENT.md)
- [GitHub Repository](https://github.com/uduu282-droid/glm)

---

**Enjoy free GLM-5 access! 🎉**
