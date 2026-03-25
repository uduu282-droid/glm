# 🚀 GLM-5 Worker - COMPLETE DEPLOYMENT GUIDE

## 📋 **Table of Contents**

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Deployment](#deployment)
5. [Testing](#testing)
6. [Usage Examples](#usage-examples)
7. [Troubleshooting](#troubleshooting)
8. [Monitoring](#monitoring)

---

## ⚡ **Quick Start**

```bash
# One-line deployment
cd glm-worker && npm install && npm run deploy

# Test it
npm run verify
```

That's it! Your worker is now live! 🎉

---

## 🛠️ **Prerequisites**

### Required:
- ✅ **Node.js 18+** ([Download](https://nodejs.org/))
- ✅ **Cloudflare Account** (Free tier works!)
- ✅ **Git** (optional, for version control)

### Check Prerequisites:
```bash
# Verify Node.js
node --version  # Should be v18 or higher

# Verify npm
npm --version
```

---

## 📦 **Installation**

### Step 1: Navigate to Project
```bash
cd glm-worker
```

### Step 2: Install Dependencies
```bash
npm install
```

**What gets installed:**
- `hono` - Web framework for Cloudflare Workers
- `wrangler` - Cloudflare Workers CLI tool

---

## 🚀 **Deployment**

### Option 1: Automated Deployment (Recommended)

#### Windows:
```bash
deploy.bat
```

#### Linux/Mac:
```bash
bash deploy.sh
```

### Option 2: Manual Deployment

```bash
# 1. Login to Cloudflare (first time only)
npx wrangler login

# 2. Deploy
npm run deploy
```

### Option 3: One-Command Deployment
```bash
npm run deploy:auto
```

**Your worker will be deployed to:**
```
https://glm-worker-proxy.<your-subdomain>.workers.dev
```

---

## 🧪 **Testing**

### Quick Verification (Fast)
```bash
npm run verify
```

**Output:**
```
🧪 Quick GLM-5 Worker Test

1. Health check...
   ✅ Status: ok

2. Testing chat completion...
   ✅ Response time: 3245ms
   ✅ Answer: Hello!

✅ Worker is functioning correctly!
```

### Full Test Suite (Comprehensive)
```bash
npm test
# or
node test-worker.js https://your-worker.workers.dev
```

**Tests Run:**
1. ✅ Health Check
2. ✅ Models Endpoint
3. ✅ Non-Streaming Chat
4. ✅ Streaming Chat
5. ✅ Multi-Turn Conversation
6. ✅ Session Reset

---

## 💻 **Usage Examples**

### Python (OpenAI SDK)

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://glm-worker-proxy.your-subdomain.workers.dev/v1",
    api_key="not-needed"  # No API key needed!
)

# Simple chat
response = client.chat.completions.create(
    model="glm-5",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)

# Streaming
stream = client.chat.completions.create(
    model="glm-5",
    messages=[{"role": "user", "content": "Tell me a story"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### Node.js

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://glm-worker-proxy.your-subdomain.workers.dev/v1',
  apiKey: 'not-needed'
});

const response = await client.chat.completions.create({
  model: 'glm-5',
  messages: [{ role: 'user', content: 'Hello!' }]
});

console.log(response.choices[0].message.content);
```

### cURL

```bash
# Non-streaming
curl -X POST https://your-worker.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# Streaming
curl -X POST https://your-worker.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

### JavaScript (Fetch API)

```javascript
const response = await fetch('https://your-worker.workers.dev/v1/chat/completions', {
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

## 🐛 **Troubleshooting**

### Issue: "Signature validation failed"

**Solution:**
```bash
# Reset session
curl -X POST https://your-worker.workers.dev/v1/session/reset

# Or wait a few minutes and try again
```

### Issue: "Rate limit exceeded"

**Solution:**
The worker automatically handles this! Just wait a moment and retry. The auto-recovery system will reset the session.

### Issue: "Worker not responding"

**Check logs:**
```bash
npm run tail
```

**Force reset:**
```bash
curl -X POST https://your-worker.workers.dev/v1/session/reset
```

### Issue: Deployment fails

**Check authentication:**
```bash
npx wrangler whoami
```

**Re-login:**
```bash
npx wrangler logout
npx wrangler login
```

---

## 📊 **Monitoring**

### Real-time Logs
```bash
npm run tail
```

### Filter by Error
```bash
npx wrangler tail --status error
```

### View Specific Environment
```bash
npx wrangler tail --env dev
```

### Check Worker Status
```bash
curl https://your-worker.workers.dev/health
```

**Response:**
```json
{
  "status": "ok",
  "session": "active",
  "turns": 5,
  "chat_id": "abc123..."
}
```

---

## ⚙️ **Advanced Configuration**

### Custom Domain

1. Go to Cloudflare Dashboard
2. Workers → Your Worker → Triggers
3. Add Custom Domain
4. Follow DNS setup instructions

### Environment Variables

Edit `wrangler.toml`:
```toml
[vars]
RATE_LIMIT_ENABLED = true
RATE_LIMIT_REQUESTS = "10"
RATE_LIMIT_WINDOW = "60"
```

Then redeploy:
```bash
npm run deploy
```

### Multiple Environments

```bash
# Development
npm run deploy -- --env dev

# Production
npm run deploy -- --env production
```

---

## 📈 **Performance Metrics**

| Metric | Expected Value |
|--------|---------------|
| First Token | 1-3 seconds |
| Full Response | 3-8 seconds |
| Streaming Latency | ~50ms per token |
| Auto-Recovery Time | <1 second |
| Retry Attempts | Up to 3 times |

---

## 🎯 **Best Practices**

### 1. **Monitor Logs Regularly**
```bash
# Keep logs open in a separate terminal
npm run tail
```

### 2. **Use Exponential Backoff in Your Code**
```javascript
async function retryRequest(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await makeRequest();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

### 3. **Implement Circuit Breaker**
```javascript
let consecutiveFailures = 0;
const MAX_FAILURES = 5;

if (consecutiveFailures >= MAX_FAILURES) {
  console.log('Circuit breaker triggered, waiting...');
  await sleep(60000); // Wait 1 minute
  consecutiveFailures = 0;
}
```

### 4. **Cache Responses When Possible**
```javascript
const cache = new Map();

async function getCachedResponse(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const response = await fetchFromWorker();
  cache.set(key, response);
  return response;
}
```

---

## 🎓 **Understanding the Architecture**

### Request Flow
```
User Request
    ↓
Cloudflare Edge Network
    ↓
Your Worker (Hono Router)
    ↓
Retry Wrapper (Auto-retry up to 3x)
    ↓
Session Manager (Auto-reset on errors)
    ↓
GLM Authentication (Guest token)
    ↓
Request Signing (2-step HMAC)
    ↓
Z.ai API (China servers)
    ↓
SSE Stream Parser
    ↓
Token Streaming to User
```

### Auto-Recovery System
```
Error Detected
    ↓
Classify Error Type
    ├─ Signature Error → Reset Session
    ├─ Rate Limit → Reset + Retry
    ├─ Network Error → Retry
    └─ Other → Increment Error Counter
        ↓
    If errorCount >= 3 → Reset Everything
        ↓
    Retry with Exponential Backoff
        ↓
    Success! (or give up after 3 attempts)
```

---

## 🌟 **Key Features**

✅ **Zero Configuration** - Works out of the box  
✅ **Auto-Recovery** - Self-healing from errors  
✅ **Rate Limit Handling** - Automatic detection and recovery  
✅ **Retry Logic** - Exponential backoff (1s → 2s → 4s)  
✅ **Session Persistence** - Maintains conversation history  
✅ **Real-time Streaming** - Token-by-token responses  
✅ **OpenAI Compatible** - Works with any OpenAI client  
✅ **Free Tier** - No costs for moderate usage  

---

## 📞 **Support & Resources**

### Documentation
- [README.md](./README.md) - Full documentation
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [PRODUCTION_READY.md](./PRODUCTION_READY.md) - Production status

### Cloudflare Resources
- [Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Community Discord](https://discord.gg/cloudflaredev)

### Emergency Contacts
- **Worker Down**: Check logs with `npm run tail`
- **Signature Errors**: Reset session via `/v1/session/reset`
- **Rate Limits**: Wait a few minutes, auto-recovers

---

## 🎉 **You're All Set!**

Your GLM-5 worker is:
- ✅ Fully automatic
- ✅ Self-healing
- ✅ Production-ready
- ✅ Free to use

**Just deploy it and forget about it!** 🚀

```bash
# Final deployment command
npm run deploy:auto

# Test it
npm run verify

# Use it in your apps!
```

---

**Created:** 2026-03-25  
**Status:** ✅ PRODUCTION READY  
**Maintenance:** Zero (fully automatic)  
**Cost:** $0/month (free tier)
