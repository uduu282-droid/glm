# 🚀 Quick Start Guide - Gemini Multi-Account Proxy

## Step-by-Step Setup (15 minutes)

### 1️⃣ Install Dependencies (2 min)
```bash
cd gemini-cli-multi-account
npm install
```

### 2️⃣ Cloudflare Setup (3 min)

**Login to Cloudflare:**
```bash
wrangler login
```

**Create KV Namespace:**
```bash
wrangler kv namespace create "GEMINI_TOKEN_CACHE"
```

Copy the namespace ID and update `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "GEMINI_TOKEN_CACHE"
id = "YOUR_COPIED_NAMESPACE_ID"  # Replace with actual ID
```

### 3️⃣ Add Gemini Accounts (5 min)

Add your first account:
```bash
npm run auth:add gemini1
```

**What happens:**
1. Browser opens automatically
2. Sign in with your Google account
3. Grant permissions to Gemini CLI
4. You'll be redirected to localhost:8085/callback
5. Copy the `code` parameter from the URL
6. Paste it in the terminal
7. Tokens saved automatically! ✅

**Repeat for more accounts** (target: 10 accounts):
```bash
npm run auth:add gemini2
npm run auth:add gemini3
# ... continue until gemini10
```

Each account = **1,000 requests/day**
10 accounts = **10,000 requests/day** 🎯

### 4️⃣ Deploy Accounts to KV (2 min)

```bash
npm run setup:deploy-all
```

This uploads all account credentials to Cloudflare KV storage.

Verify deployment:
```bash
npm run setup:list-kv
```

### 5️⃣ Configure Secrets (2 min)

Create `.env` file:
```bash
cp .env.example .env
nano .env  # Edit with your values
```

Fill in your secrets:
```env
OPENAI_API_KEYS=sk-your-secret-key-here
ADMIN_SECRET_KEY=your-admin-secret-here
```

Update secrets in Cloudflare:
```bash
npm run secrets:update
```

### 6️⃣ Deploy Worker (1 min)

```bash
npm run deploy
```

You'll see output like:
```
Deployed gemini-cli-multi-account triggers
https://gemini-cli-multi-account.yourname.workers.dev
```

🎉 **DONE!** Your proxy is live!

---

## ✅ Testing Your Deployment

### Health Check
```bash
curl https://gemini-cli-multi-account.yourname.workers.dev/health
```

### List Models
```bash
curl https://gemini-cli-multi-account.yourname.workers.dev/v1/models
```

### Test Chat Completion
```bash
curl -X POST https://gemini-cli-multi-account.yourname.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-pro",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Using Python OpenAI SDK
```python
from openai import OpenAI

client = OpenAI(
    base_url='https://gemini-cli-multi-account.yourname.workers.dev/v1',
    api_key='sk-your-secret-key-here'
)

response = client.chat.completions.create(
    model='gemini-2.5-pro',
    messages=[{'role': 'user', 'content': 'Explain quantum computing'}]
)

print(response.choices[0].message.content)
```

---

## 🔧 Management Commands

### Check Account Status
```bash
# List local accounts
npm run auth:list

# Check health of all accounts in KV
npm run setup:health

# List accounts in KV
npm run setup:list-kv
```

### Add More Accounts
```bash
npm run auth:add gemini11
npm run setup:deploy-all  # Redeploy all accounts
```

### Remove an Account
```bash
# Remove from local files
npm run auth:remove gemini5

# Remove from KV
npm run setup:remove-kv gemini5
```

---

## 📊 Expected Results

After adding 10 accounts:
- ✅ **10,000 requests/day capacity**
- ✅ Automatic rotation between accounts
- ✅ Auto-failover on quota limits
- ✅ Daily reset at UTC midnight
- ✅ Zero maintenance required

---

## ⚠️ Troubleshooting

### "No accounts found in KV"
```bash
# Make sure you deployed accounts
npm run setup:deploy-all

# Verify
npm run setup:list-kv
```

### "KV namespace not found"
1. Create KV namespace: `wrangler kv namespace create "GEMINI_TOKEN_CACHE"`
2. Copy the ID to `wrangler.toml`
3. Redeploy: `npm run deploy`

### "OAuth code expired"
Just restart the auth process:
```bash
npm run auth:add gemini1  # Try again
```

### "Invalid API key"
Make sure you set the secrets:
```bash
npm run secrets:update
```

---

## 🎯 Next Steps

1. **Monitor usage**: Check `/admin/health` endpoint regularly
2. **Scale as needed**: Add more accounts when approaching limits
3. **Set up monitoring**: Use Cloudflare Workers analytics
4. **Enjoy free AI!**: Your 10K req/day system is ready! 🚀

---

**Questions?** Check the full [README.md](./README.md) for detailed documentation.
