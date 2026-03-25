# 🐍 GLM-5 Chat - Python Deployment Guide

## ✅ What Changed

We switched from Node.js to **Python** because:
- ✅ The real GLM implementation is in Python (`glm.py`)
- ✅ No API key needed (uses guest authentication)
- ✅ Proper signature generation with HMAC-SHA256
- ✅ Talks to actual `chat.z.ai` endpoint
- ✅ Supports conversation history

---

## 🚀 Deploy to Render (Python)

### Step 1: Go to Render
Visit: https://dashboard.render.com

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect GitHub
3. Select **"glm"** repository
4. Click **"Connect"**

### Step 3: Configure (Auto-Detected)

Render should auto-detect these settings:

```yaml
Name: glm-5-chat
Region: Oregon
Branch: main
Root Directory: (blank)
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: python glm_server.py
```

### Step 4: Environment Variables (Optional)

Click "Advanced" → Add:

```
Key: PORT
Value: 10000
```

That's it! No API key needed! 🎉

### Step 5: Deploy
Click **"Create Web Service"** and wait ~2 minutes.

---

## 📊 Configuration Files

### `render.yaml`
```yaml
services:
- type: web
  name: glm-5-chat
  env: python
  region: oregon
  plan: free
  branch: main
  buildCommand: pip install -r requirements.txt
  startCommand: python glm_server.py
```

### `requirements.txt`
```txt
flask==3.0.0
flask-cors==4.0.0
curl_cffi==0.6.2
```

### `glm_server.py`
- Flask server with reverse-engineered GLM API
- Guest authentication (no key needed)
- Signature generation for each request
- Conversation history support

---

## 🧪 Test Locally

```bash
cd glm-ai-chat

# Install dependencies
pip install -r requirements.txt

# Run server
python glm_server.py

# Open browser to http://localhost:10000
```

---

## 🔑 How It Works

### Authentication Flow:

1. **Seed Cookies** - Visits chat.z.ai to get browser cookies
2. **Get Guest JWT** - Calls `/api/v1/auths` for temporary token
3. **Generate Signature** - Complex HMAC-SHA256 with rolling window
4. **Chat Request** - POST to `/api/v2/chat/completions` with signature

### Key Components:

```python
# 1. Extract secret from obfuscated array
_SECRET = _get_secret()

# 2. Generate signature for each request
sig = sign(ts_ms, message, user_id, request_id)

# 3. Get guest auth
session, auth = _boot()  # Returns JWT token

# 4. Make authenticated chat request
headers = {
    "Authorization": f"Bearer {auth['token']}",
    "X-Signature": sig,
}
```

---

## ✅ Advantages Over Node.js Version

| Feature | Node.js | Python |
|---------|---------|--------|
| API Key Required | ❌ Yes (sk-) | ✅ No (guest auth) |
| Signature Generation | ❌ No | ✅ Yes |
| Real Reverse Engineering | ❌ No | ✅ Yes |
| Conversation History | ❌ Limited | ✅ Full support |
| Endpoint | ❌ api.featherlabs | ✅ chat.z.ai |
| Cost | 💰 Need paid key | 🆓 Free |

---

## 🎯 Your Live URL

After deployment, you'll get:
```
https://glm-5-chat-xxxx.onrender.com
```

Replace `xxxx` with random characters Render assigns.

---

## 🛠️ Troubleshooting

### Build Failed
```bash
# Check Render logs
Dashboard → Logs tab

# Common issues:
# - Missing requirements.txt
# - Wrong Python version
# - Syntax errors in glm_server.py
```

### Runtime Error
```bash
# Test locally first
python glm_server.py

# Should see:
# 🚀 GLM-5 Chat Server starting on port 10000...
```

### Chat Not Working
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Verify server logs in Render dashboard

### 401 Unauthorized
- Should NOT happen with this implementation
- If it does, check if guest auth is working
- Test locally first

### Timeout
- Free tier sleeps after 15 min
- First request takes ~30 seconds
- Upgrade to paid plan for always-on

---

## 📈 Performance

| Metric | Value |
|--------|-------|
| Cold Start | ~30 seconds |
| Warm Response | ~2-5 seconds |
| Concurrent Users | ~5-10 |
| Rate Limit | Unknown (depends on z.ai) |

---

## 💡 Tips

### For Best Performance:
1. Test locally before deploying
2. Keep sessions short (free tier sleeps)
3. Monitor Render logs
4. Use Oregon region (closest to API)

### For Production:
1. Upgrade to paid Render plan ($7/month)
2. Add custom domain
3. Implement rate limiting
4. Add error retry logic
5. Enable compression

---

## 🎓 Technical Details

### Secret Extraction:
```python
_OB = [...]  # Obfuscated strings
_SECRET = _get_secret()  # RC4 decryption
```

### Signature Generation:
```python
def sign(ts_ms, prompt, user_id, request_id):
    sp = f"requestId,{request_id},timestamp,{ts_ms},user_id,{user_id}"
    b64 = base64.b64encode(prompt.encode()).decode()
    d = f"{sp}|{b64}|{ts_ms}"
    iv = str(math.floor(ts_ms / 300_000))
    dk = hmac.new(_SECRET.encode(), iv.encode(), hashlib.sha256).hexdigest()
    return hmac.new(dk.encode(), d.encode(), hashlib.sha256).hexdigest()
```

### Chat Session:
```python
class ChatSession:
    def __init__(self, session, auth):
        self.http = session
        self.auth = auth  # JWT token
        self.chat_id = None
        self.history_messages = {}
    
    def send(self, message):
        # Generates signature
        # Sends to chat.z.ai
        # Returns response
```

---

## 📝 API Endpoints

### Client → Server

#### POST `/api/chat`
```json
Request:
{
  "message": "Hello",
  "session_id": "abc123"
}

Response:
{
  "response": "Hi there!",
  "turn": 2,
  "chat_id": "xyz789"
}
```

#### GET `/health`
```json
{
  "status": "ok",
  "service": "GLM-5 Chat",
  "model": "glm-5",
  "timestamp": "2026-03-25T19:00:00.000Z"
}
```

### Server → External

#### GET `https://chat.z.ai/api/v1/auths`
Returns guest JWT token

#### POST `https://chat.z.ai/api/v1/chats/new`
Creates new chat session

#### POST `https://chat.z.ai/api/v2/chat/completions`
Sends message and gets response

---

## 🆘 Support

### Render:
- Docs: https://render.com/docs
- Community: https://community.render.com

### GLM/z.ai:
- Website: https://chat.z.ai
- API changes may break this implementation

---

## ⚠️ Important Notes

1. **This is reverse-engineered** - not official API
2. **May break** if z.ai changes their implementation
3. **For educational purposes** - use responsibly
4. **Rate limits unknown** - don't abuse
5. **Guest tokens expire** - sessions may need refresh

---

## 🎉 Success Checklist

- [ ] ✅ Code pushed to GitHub
- [ ] ✅ Render service created
- [ ] ✅ Build succeeds
- [ ] ✅ Health check passes
- [ ] ✅ Chat works locally
- [ ] ✅ Chat works on Render
- [ ] ✅ Ready to share!

---

**Last Updated**: March 25, 2026  
**Status**: ✅ Ready to Deploy  
**Difficulty**: ⭐⭐☆☆☆ (Easy)  
**Cost**: 🆓 Free (no API key needed!)  

🚀 **Happy Chatting!** 🚀
