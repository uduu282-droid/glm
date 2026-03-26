# GLM-5 Chat API - Python Version

## 🚀 Quick Deploy on Render

### 1. Push to GitHub
First, push your code to a GitHub repository.

### 2. Deploy on Render
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `glm-5-chat` (or your preferred name)
   - **Region**: Oregon (closest to Z.ai servers)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (or specify if in subfolder)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python glm_server.py`
   - **Instance Type**: `Free`

5. Click **"Create Web Service"**

### 3. Add Environment Variables (Optional)
In Render dashboard → Environment tab:
```
PORT=8000
```

That's it! Your GLM-5 API will be live at `https://your-service-name.onrender.com`

---

## 📡 API Endpoints

### Health Check
```bash
GET /health
```
Response:
```json
{"status": "ok", "turns": 0, "chat_id": null}
```

### List Models
```bash
GET /v1/models
```
Response:
```json
{
  "object": "list",
  "data": [{
    "id": "glm-5",
    "object": "model",
    "created": 1700000000,
    "owned_by": "zhipuai"
  }]
}
```

### Chat Completions (OpenAI-compatible)
```bash
POST /v1/chat/completions
Content-Type: application/json

{
  "model": "glm-5",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```

Response:
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1700000000,
  "model": "glm-5",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you today?"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 0,
    "completion_tokens": 10,
    "total_tokens": 10
  }
}
```

### Reset Session
```bash
POST /v1/session/reset
```
Response:
```json
{"status": "reset", "message": "Session cleared"}
```

---

## 🧪 Testing Locally

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run Server
```bash
python glm_server.py
```

### Test with cURL
```bash
# Health check
curl http://localhost:8000/health

# Chat completion
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Test with Python
```python
import requests

# Health check
response = requests.get('http://localhost:8000/health')
print(response.json())

# Chat completion
response = requests.post(
    'http://localhost:8000/v1/chat/completions',
    json={
        'model': 'glm-5',
        'messages': [{'role': 'user', 'content': 'Hello!'}]
    }
)
print(response.json())
```

---

## 🔧 Files Included

- `glm.py` - Core GLM-5 client (direct Z.ai integration)
- `glm_server.py` - Flask API server (OpenAI-compatible)
- `requirements.txt` - Python dependencies
- `render.yaml` - Render deployment configuration

---

## 💡 Features

✅ **Direct Z.ai Integration** - Uses official GLM-5 API  
✅ **OpenAI-Compatible Format** - Drop-in replacement for OpenAI APIs  
✅ **Streaming Support** - Real-time response streaming  
✅ **Session Management** - Maintains conversation context  
✅ **No API Key Required** - Uses Z.ai free tier authentication  
✅ **Production Ready** - Includes error handling and logging  

---

## 🎯 Usage Examples

### JavaScript/Node.js
```javascript
const response = await fetch('https://your-render-url.onrender.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'glm-5',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

### Python
```python
import requests

url = 'https://your-render-url.onrender.com/v1/chat/completions'
data = {
    'model': 'glm-5',
    'messages': [{'role': 'user', 'content': 'Hello!'}]
}

response = requests.post(url, json=data)
result = response.json()
print(result['choices'][0]['message']['content'])
```

---

## ⚠️ Important Notes

1. **Cold Starts**: Free tier services may have cold starts (~30 seconds)
2. **Session Persistence**: Each instance maintains its own session
3. **Rate Limits**: Z.ai may have rate limits for free tier usage
4. **Auto-Sleep**: Render free services sleep after 15 minutes of inactivity

---

## 🐛 Troubleshooting

### Server Not Starting
Check Render logs in dashboard → Logs tab

### Chat Not Working
- Verify Z.ai is accessible from Render region
- Check server logs for authentication errors
- Ensure no firewall blocking outbound connections

### High Latency
- Consider upgrading to paid Render plan
- Deploy in Oregon region (closest to Z.ai servers)

---

## 📞 Support

For issues with GLM-5 API itself, refer to Z.ai documentation.
For deployment issues, check Render documentation.

---

**Status**: ✅ Working & Production Ready  
**Last Updated**: March 26, 2026
