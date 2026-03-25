# 🚀 DeepSeek Worker Proxy - Quick Setup Guide

## Complete Setup in 10 Minutes!

### Step-by-Step Instructions

#### 1. Install Dependencies (1 min)
```bash
cd deepseek-worker-proxy
npm install
```

#### 2. Create KV Namespace (1 min)
```bash
wrangler kv namespace create "DEEPSEEK_TOKEN_CACHE"
```

**Copy the ID** from the output (looks like: `9d2ac113be264ad2bcab2faf67bef3a7`)

#### 3. Update wrangler.toml (1 min)
Open `wrangler.toml` and replace the KV ID:
```toml
kv_namespaces = [
  { binding = "DEEPSEEK_TOKEN_CACHE", id = "PASTE_YOUR_ID_HERE" }
]
```

#### 4. Login to Cloudflare (1 min)
```bash
wrangler login
```

#### 5. Add Your DeepSeek API Keys (2 min)

Get your API keys from: https://platform.deepseek.com/api_keys

Then add them:
```bash
# Add first account
npm run auth:add account1
# Enter your API key when prompted

# Add more accounts (optional, for higher limits)
npm run auth:add account2
npm run auth:add account3
```

#### 6. Deploy Accounts to KV (2 min)
```bash
npm run setup:deploy-all
```

#### 7. Set Admin Key (1 min)
```bash
wrangler secret put ADMIN_SECRET_KEY
# Enter any secure string, e.g.: sk-admin-secret-123
```

#### 8. Deploy Worker (1 min)
```bash
npm run deploy
```

**🎉 DONE!** Your worker is live!

---

## Test It Works (1 min)

### Option 1: Quick Curl Test
```bash
curl https://deepseek-worker-proxy.YOUR_SUBDOMAIN.workers.dev/health
```

Expected response:
```json
{"status":"ok","timestamp":"...","service":"DeepSeek Worker Multi-Account"}
```

### Option 2: Test Chat
```bash
curl -X POST https://deepseek-worker-proxy.YOUR_SUBDOMAIN.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Say hello in 3 words"}]
  }'
```

### Option 3: Check Health
```bash
curl https://deepseek-worker-proxy.YOUR_SUBDOMAIN.workers.dev/admin/health \
  -H "Authorization: Bearer sk-admin-secret-123"
```

---

## Available Models

Test with different models:

```bash
# DeepSeek Chat V3
curl -X POST ... -d '{"model": "deepseek-chat", ...}'

# DeepSeek Coder
curl -X POST ... -d '{"model": "deepseek-coder", ...}'

# DeepSeek V2.5 (Latest)
curl -X POST ... -d '{"model": "deepseek-v2.5", ...}'
```

---

## Using with OpenAI SDK (Python)

```python
from openai import OpenAI

client = OpenAI(
    base_url='https://deepseek-worker-proxy.YOUR_SUBDOMAIN.workers.dev/v1',
    api_key='sk-any-key-works'  # Any key works
)

response = client.chat.completions.create(
    model='deepseek-chat',
    messages=[
        {'role': 'user', 'content': 'Hello!'}
    ]
)

print(response.choices[0].message.content)
```

---

## Management Commands

### Check Account Status
```bash
# Local accounts
npm run auth:list

# KV accounts  
npm run setup:list-kv

# Health check
npm run setup:health
```

### Add More Accounts
```bash
npm run auth:add account4
npm run setup:deploy account4
```

### Remove Accounts
```bash
npm run auth:remove account1
npm run setup:remove-kv account1
```

---

## Troubleshooting

### ❌ "KV namespace not found"
- Did you create the KV namespace?
- Did you update `wrangler.toml` with the correct ID?

### ❌ "Invalid API key"
- Check your DeepSeek API key is correct
- Verify it's active on https://platform.deepseek.com/

### ❌ "Deployment failed"
- Run `wrangler login` again
- Check your Cloudflare account has Workers enabled

### ❌ "No valid accounts available"
- Deploy accounts to KV: `npm run setup:deploy-all`
- Check health: `npm run setup:health`

---

## Next Steps

1. ✅ **Test all models** to see which you prefer
2. ✅ **Add multiple accounts** for higher rate limits
3. ✅ **Set up monitoring** with the admin health endpoint
4. ✅ **Integrate** with your applications!

---

## Your Worker URL

Find your worker URL:
```bash
wrangler whoami
# or check your Cloudflare dashboard
```

It will be: `https://deepseek-worker-proxy.YOUR_SUBDOMAIN.workers.dev`

---

**Need Help?**

Check the full README.md for detailed documentation.

**Enjoy your DeepSeek proxy! 🎉**
