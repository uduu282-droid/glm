# ⚡ Quick Start Guide

## 1-Minute Setup

### Install & Deploy

```bash
# Navigate to project
cd glm-worker

# Install dependencies
npm install

# Deploy to Cloudflare
npm run deploy
```

That's it! Your worker is now live at:
```
https://glm-worker-proxy.<your-subdomain>.workers.dev
```

---

## Test Your Worker

### Option 1: Use the test script

```bash
# Test local worker (before deployment)
node test-worker.js http://localhost:8787

# Test deployed worker
node test-worker.js https://glm-worker-proxy.your-subdomain.workers.dev
```

### Option 2: Manual testing with curl

```bash
# Health check
curl https://glm-worker-proxy.your-subdomain.workers.dev/health

# Simple chat
curl -X POST https://glm-worker-proxy.your-subdomain.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "glm-5", "messages": [{"role": "user", "content": "Hello!"}]}'
```

---

## Local Development

```bash
# Start local dev server
npm run dev

# In another terminal, test it
node test-worker.js
```

---

## Use with OpenAI SDK

### Python

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://glm-worker-proxy.your-subdomain.workers.dev/v1",
    api_key="not-needed"
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
  baseURL: 'https://glm-worker-proxy.your-subdomain.workers.dev/v1',
  apiKey: 'not-needed'
});

const response = await client.chat.completions.create({
  model: 'glm-5',
  messages: [{ role: 'user', content: 'Hello!' }]
});

console.log(response.choices[0].message.content);
```

---

## Troubleshooting

### First deployment failing?

Make sure you're logged into Cloudflare:
```bash
npx wrangler login
```

### Want to use a custom name?

Edit `wrangler.toml`:
```toml
name = "my-custom-glm-worker"
```

### Check deployment status

```bash
npx wrangler tail
```

---

## Next Steps

1. ✅ Test all endpoints with `node test-worker.js`
2. ✅ Try multi-turn conversations
3. ✅ Integrate with your app using OpenAI SDK
4. ✅ Set up custom domain (optional)
5. ✅ Configure rate limiting (optional)

---

**That's it! You're ready to use GLM-5 for free! 🎉**

For detailed documentation, see [README.md](./README.md)
