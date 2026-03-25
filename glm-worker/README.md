# 🚀 GLM-5 Worker Proxy - Deployment Guide

## 📋 **What is This?**

A Cloudflare Worker that provides **free, OpenAI-compatible access** to Zhipu AI's GLM-5 model through reverse-engineered API.

### ✨ Features:

- ✅ **OpenAI-Compatible API** - Works with any OpenAI client
- ✅ **Free Access** - No API keys required (guest authentication)
- ✅ **Persistent Sessions** - Maintains conversation history
- ✅ **Real-time Streaming** - Token-by-token SSE streaming
- ✅ **Browser Fingerprinting** - Mimics Firefox to avoid detection
- ✅ **Auto Authentication** - Automatic guest token generation

---

## 🛠️ **Prerequisites**

1. **Node.js** (v18 or higher)
2. **Cloudflare Account** (free tier works)
3. **Wrangler CLI** (will be installed automatically)

---

## ⚡ **Quick Start**

### Step 1: Install Dependencies

```bash
cd glm-worker
npm install
```

### Step 2: Deploy to Cloudflare

```bash
npm run deploy
```

That's it! Your worker will be deployed to:
```
https://glm-worker-proxy.<your-subdomain>.workers.dev
```

---

## 🧪 **Testing Your Worker**

### Option 1: Using curl

```bash
# Health check
curl https://glm-worker-proxy.your-subdomain.workers.dev/health

# List models
curl https://glm-worker-proxy.your-subdomain.workers.dev/v1/models

# Non-streaming chat
curl -X POST https://glm-worker-proxy.your-subdomain.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# Streaming chat
curl -X POST https://glm-worker-proxy.your-subdomain.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5",
    "messages": [{"role": "user", "content": "Tell me a story"}],
    "stream": true
  }'
```

### Option 2: Using Python OpenAI SDK

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://glm-worker-proxy.your-subdomain.workers.dev/v1",
    api_key="not-needed"  # Guest mode, no key required
)

# Non-streaming
response = client.chat.completions.create(
    model="glm-5",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)

# Streaming
stream = client.chat.completions.create(
    model="glm-5",
    messages=[{"role": "user", "content": "Tell me a joke"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### Option 3: Using Node.js

```javascript
const response = await fetch('https://glm-worker-proxy.your-subdomain.workers.dev/v1/chat/completions', {
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

---

## 🔧 **Local Development**

### Run Locally with Wrangler Dev

```bash
npm run dev
```

Your worker will run at: `http://localhost:8787`

### Test Local Worker

```bash
curl http://localhost:8787/health
curl http://localhost:8787/v1/models
```

---

## 📊 **API Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service info |
| `/health` | GET | Health check & session status |
| `/v1/models` | GET | List available models |
| `/v1/chat/completions` | POST | Generate responses (streaming/non-streaming) |
| `/v1/session/reset` | POST | Reset chat session |

---

## ⚙️ **Configuration**

### Environment Variables (Optional)

Edit `wrangler.toml` to add:

```toml
[vars]
RATE_LIMIT_ENABLED = true
RATE_LIMIT_REQUESTS = "10"
RATE_LIMIT_WINDOW = "60"
```

### Set Secrets (if needed)

```bash
wrangler secret put SOME_SECRET
```

---

## 🎯 **Usage Examples**

### Multi-turn Conversation

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://glm-worker-proxy.your-subdomain.workers.dev/v1",
    api_key="not-needed"
)

# Turn 1
response1 = client.chat.completions.create(
    model="glm-5",
    messages=[
        {"role": "system", "content": "You are helpful."},
        {"role": "user", "content": "I'm Bob"}
    ]
)
print(response1.choices[0].message.content)

# Turn 2 (conversation continues)
response2 = client.chat.completions.create(
    model="glm-5",
    messages=[
        {"role": "system", "content": "You are helpful."},
        {"role": "user", "content": "I'm Bob"},
        {"role": "assistant", "content": response1.choices[0].message.content},
        {"role": "user", "content": "What's my name?"}
    ]
)
print(response2.choices[0].message.content)  # Should say "Bob"
```

---

## ⚠️ **Important Notes**

### Rate Limits

- Depends on Z.ai's free tier policies
- Session-based tracking (not IP-based)
- May hit limits with heavy usage

### Stability

- Tied to Z.ai's web interface structure
- If they change their API, this breaks
- For personal/research use only

### Performance

- Single global session = serialized requests
- Latency depends on Z.ai servers (China-based)
- ~1-3 seconds per response typical

---

## 🐛 **Troubleshooting**

### Issue: "Secret extraction failed"

**Solution:** The RC4 decryption logic may have changed. Check for updates.

### Issue: "Authentication failed"

**Solution:** Z.ai may have changed their auth flow. Try resetting session:

```bash
curl -X POST https://glm-worker-proxy.your-subdomain.workers.dev/v1/session/reset
```

### Issue: "Rate limit exceeded"

**Solution:** Wait a few minutes or deploy multiple workers with different sessions.

### Issue: Worker not responding

**Check logs:**
```bash
wrangler tail
```

---

## 🔄 **Advanced Usage**

### Deploy Multiple Instances

Create separate environments for different use cases:

```bash
# Production
wrangler deploy --env production

# Development
wrangler deploy --env dev
```

### Custom Domain

In Cloudflare Dashboard:
1. Go to Workers → Your Worker
2. Click "Add Custom Domain"
3. Follow DNS setup instructions

### Monitoring

```bash
# View real-time logs
wrangler tail

# View specific environment
wrangler tail --env dev
```

---

## 📝 **Technical Details**

### How It Works

1. **Bootstrap**: Seeds cookies and gets guest auth token from Z.ai
2. **Session Creation**: Creates persistent chat session server-side
3. **Request Signing**: Generates HMAC-SHA256 signatures with rolling windows
4. **Browser Fingerprinting**: Mimics Firefox browser with 30+ parameters
5. **SSE Streaming**: Parses Server-Sent Events for real-time tokens
6. **History Management**: Maintains conversation context via UUID chains

### Architecture

```
Client Request
    ↓
Cloudflare Worker
    ↓
Auth Bootstrap (once)
    ↓
Chat Session Created
    ↓
Request Signed + Fingerprinted
    ↓
Z.ai API
    ↓
SSE Stream Parsed
    ↓
Tokens Streamed to Client
```

---

## 🎓 **Learning Resources**

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Hono Framework](https://hono.dev/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

---

## 📄 **License**

MIT License - Use at your own risk. This is for educational/personal use only.

---

## 🙏 **Credits**

Based on reverse-engineering of Z.ai's web interface. Not affiliated with Zhipu AI.

---

**Bottom Line:** Free GLM-5 access via Cloudflare Workers. Perfect for prototyping and development! 🚀
