# 🚀 Render Deployment Guide - GLM-5 Chat

## Quick Deploy

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy GLM-5 OpenAI-compatible server"
   git push origin main
   ```

2. **Create Render Service**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect `render.yaml`
   - Click "Apply" to deploy

3. **Done!** Your service will be live at:
   ```
   https://glm-5-chat.onrender.com
   ```

### Option 2: Manual Configuration

If you don't have `render.yaml`, configure manually:

1. **Create New Web Service**
   - Name: `glm-5-chat`
   - Environment: `Python 3`
   - Region: `Oregon (US West)`
   - Branch: `main`

2. **Build & Start Commands**
   ```
   Build Command: pip install -r requirements.txt
   Start Command: python glm_server.py --host 0.0.0.0 --port $PORT
   ```

3. **Environment Variables**
   ```
   PORT = 10000  (Render sets this automatically)
   ```

4. **Health Check**
   ```
   Health Check Path: /health
   ```

---

## 🔍 Health Endpoints

The server provides health endpoints for uptime monitoring:

### GET /health
```bash
curl https://glm-5-chat.onrender.com/health
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

### POST /health
```bash
curl -X POST https://glm-5-chat.onrender.com/health
```

Same response as GET. This is for uptime bots that use POST.

---

## 🤖 Uptime Bot Configuration

### UptimeRobot
1. Add New Monitor
2. Monitor Type: `HTTP(s)`
3. URL: `https://glm-5-chat.onrender.com/health`
4. Monitoring Interval: `5 minutes`
5. HTTP Method: `GET` or `POST`

### Cron-job.org
1. Create New Cronjob
2. URL: `https://glm-5-chat.onrender.com/health`
3. Schedule: `*/5 * * * *` (every 5 minutes)
4. Request Method: `GET`

### Better Uptime
1. Add New Monitor
2. URL: `https://glm-5-chat.onrender.com/health`
3. Check Frequency: `5 minutes`
4. Expected Status Code: `200`

### Koyeb (Alternative to Render)
Free tier with no sleep:
```bash
koyeb service create glm-5-chat \
  --git github.com/yourusername/glm-ai-chat \
  --git-branch main \
  --ports 8000:http \
  --routes /:8000 \
  --instance-type free
```

---

## 📊 Service Endpoints

Once deployed, your service provides:

### Base URL
```
https://glm-5-chat.onrender.com/v1
```

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET/POST | Health check |
| `/v1/models` | GET | List models |
| `/v1/chat/completions` | POST | Chat (streaming & non-streaming) |
| `/v1/session/reset` | POST | Reset chat session |
| `/v1/debug` | POST | Debug echo |

---

## 🔧 Testing Deployment

### 1. Test Health
```bash
curl https://glm-5-chat.onrender.com/health
```

### 2. Test Models
```bash
curl https://glm-5-chat.onrender.com/v1/models
```

### 3. Test Chat
```bash
curl https://glm-5-chat.onrender.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer glm-local" \
  -d '{
    "model": "glm-5",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### 4. Test with OpenAI Client
```python
import openai

client = openai.OpenAI(
    base_url="https://glm-5-chat.onrender.com/v1",
    api_key="glm-local"
)

response = client.chat.completions.create(
    model="glm-5",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)
```

---

## ⚙️ Configuration Files

### render.yaml
```yaml
services:
- type: web
  name: glm-5-chat
  env: python
  region: oregon
  plan: free
  branch: main
  rootDir: .
  buildCommand: pip install -r requirements.txt
  startCommand: python glm_server.py --host 0.0.0.0 --port $PORT
  healthCheckPath: /health
  envVars:
  - key: PORT
    value: 10000
```

### requirements.txt
```
fastapi==0.109.0
uvicorn==0.27.0
curl_cffi==0.6.2
pydantic==2.5.3
```

---

## 🎯 Render Free Tier Limits

- **Sleep after 15 minutes** of inactivity
- **750 hours/month** of runtime
- **100 GB bandwidth/month**
- **512 MB RAM**

### Keeping Service Awake

Use an uptime bot to ping every 5-14 minutes:

```bash
# Example cron job
*/10 * * * * curl https://glm-5-chat.onrender.com/health
```

**Important**: Don't ping more frequently than every 5 minutes to avoid rate limits.

---

## 🔄 Auto-Deploy on Git Push

Render automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update server"
git push origin main
```

Render will:
1. Detect changes
2. Run build command
3. Deploy new version
4. Health check passes
5. Switch traffic to new version

---

## 📝 Environment Variables (Optional)

You can add these in Render dashboard:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 10000 | Server port (auto-set by Render) |
| `EAGER_BOOT` | false | Pre-boot session on startup |

To enable eager boot:
```yaml
envVars:
- key: EAGER_BOOT
  value: "true"
```

Then update start command:
```
python glm_server.py --host 0.0.0.0 --port $PORT --eager-boot
```

---

## 🐛 Troubleshooting

### Service won't start
Check logs in Render dashboard:
- Build logs: Check if dependencies installed
- Deploy logs: Check for Python errors

### Health check failing
```bash
# Test locally first
python glm_server.py --host 0.0.0.0 --port 10000

# Then test health endpoint
curl http://localhost:10000/health
```

### Rate limiting
Z.ai may rate limit. The server handles this with retries, but you may see delays.

### Service sleeping
Add uptime bot to ping every 10 minutes.

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Build successful
- [ ] Health check passing
- [ ] Can access `/health` endpoint
- [ ] Can access `/v1/models` endpoint
- [ ] Chat completions working
- [ ] Uptime bot configured (optional)

---

## 📞 Support

### Render Support
- Docs: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

### Project Issues
- Check server logs in Render dashboard
- Test locally first
- Review error messages

---

## 🚀 Next Steps

1. **Deploy**: Push to GitHub and deploy on Render
2. **Test**: Verify all endpoints work
3. **Monitor**: Set up uptime bot
4. **Use**: Configure your IDE/tools to use the API

---

**Your GLM-5 server will be live at:**
```
https://glm-5-chat.onrender.com/v1
```

**Use with any OpenAI-compatible client!** 🎉
