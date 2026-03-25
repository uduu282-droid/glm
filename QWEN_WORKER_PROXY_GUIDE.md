# 🤖 Qwen Worker Proxy - Complete Analysis & Setup Guide

## 📋 **What Is This Project?**

**Qwen Worker Proxy** is a **Cloudflare Worker** that acts as an **OpenAI-compatible API proxy** for Qwen's AI models. It allows you to use Qwen's free tier (2000 requests/day) through the familiar OpenAI API format.

### 🎯 **Key Features:**

- ✅ **OpenAI-Compatible API** - Works with OpenAI SDK and tools
- ✅ **Multi-Account Support** - Combine multiple Qwen accounts for higher limits
- ✅ **Automatic Failover** - Switches between accounts automatically
- ✅ **Daily Auto-Reset** - No manual intervention needed
- ✅ **Free Tier Access** - 2000 requests/day per account from QwenLM/qwen-code
- ✅ **Multiple Models**: `qwen3-coder-plus`, `qwen3-coder-flash`, `vision-model`
- ✅ **Streaming Support** - Real-time responses
- ✅ **Token Management** - Automatic OAuth2 token refresh

---

## 🏗️ **Architecture Overview**

```
Your App → Cloudflare Worker (Proxy) → Qwen API (qwen-code)
           ├─ OAuth2 Authentication
           ├─ Token Management
           ├─ Multi-Account Rotation
           └─ OpenAI-Compatible Response Format
```

### **How It Works:**

1. **User makes request** to your Cloudflare Worker endpoint
2. **Worker authenticates** with Qwen using OAuth2 tokens
3. **Worker forwards request** to Qwen's API
4. **Worker returns response** in OpenAI format
5. **Tokens auto-refresh** when expired

---

## 🚀 **Quick Start Guide**

### **Step 1: Install Dependencies**

✅ Already done! Dependencies installed.

### **Step 2: Set Up Cloudflare Workers**

```bash
# Login to Cloudflare
wrangler login

# Create KV namespace for token storage
wrangler kv namespace create "QWEN_TOKEN_CACHE"
```

**Output will look like:**
```
✨ Created kv namespace with id 'abc123def456'
```

**Save this ID!** You'll need it for wrangler.toml

### **Step 3: Configure wrangler.toml**

```bash
# Copy template
cp wrangler.toml.template wrangler.toml

# Edit wrangler.toml with your KV namespace ID
```

**Update line 10:**
```toml
kv_namespaces = [
  { binding = "QWEN_TOKEN_CACHE", id = "abc123def456" }  # Your actual ID
]
```

### **Step 4: Add Qwen Accounts (OAuth)**

This project uses **QR code authentication** to add Qwen accounts:

```bash
# Add first account
npm run auth:add account1

# Process:
# 1. QR code appears in terminal
# 2. Scan with phone or click link
# 3. Authenticate with qwen-code
# 4. Credentials saved to ./.qwen/oauth_creds_account1.json
```

**For Multiple Accounts (higher throughput):**
```bash
npm run auth:add account2
npm run auth:add account3
# etc...
```

### **Step 5: Deploy Accounts to KV**

```bash
# Deploy all accounts to Cloudflare KV (production)
npm run setup:deploy-all

# Or deploy individually
npm run setup:deploy account1
```

### **Step 6: Set API Keys (Optional)**

If you want to protect your proxy with API keys:

```bash
# Set one or more API keys (comma-separated)
wrangler secret put OPENAI_API_KEYS
# Enter: sk-key1,sk-key2,sk-key3

# Set admin key for health monitoring
wrangler secret put ADMIN_SECRET_KEY
# Enter: your-admin-secret
```

### **Step 7: Deploy Worker**

```bash
npm run deploy
```

**🎉 Done!** Your proxy is now live at:
```
https://qwen-worker-proxy.your-subdomain.workers.dev
```

---

## 🧪 **Testing Your Proxy**

### **Health Check**
```bash
curl https://your-worker.workers.dev/health
```

### **List Models**
```bash
curl https://your-worker.workers.dev/v1/models
```

**Expected Response:**
```json
{
  "data": [
    {"id": "qwen3-coder-plus"},
    {"id": "qwen3-coder-flash"},
    {"id": "vision-model"}
  ]
}
```

### **Chat Completion Test**
```bash
curl -X POST https://your-worker.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3-coder-plus",
    "messages": [{"role": "user", "content": "Write hello world in Python"}],
    "max_tokens": 100
  }'
```

**Expected Response (OpenAI format):**
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "qwen3-coder-plus",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "print('Hello, World!')"
    }
  }],
  "usage": {...}
}
```

### **Using Python OpenAI SDK**
```python
from openai import OpenAI

client = OpenAI(
    base_url='https://your-worker.workers.dev/v1',
    api_key='sk-your-api-key'  # Optional if no API keys set
)

response = client.chat.completions.create(
    model='qwen3-coder-plus',
    messages=[
        {'role': 'user', 'content': 'Explain recursion'}
    ]
)

print(response.choices[0].message.content)
```

---

## 💻 **Local Development**

### **Setup Local Environment**

```bash
# Copy example dev vars
cp .dev.vars.example .dev.vars

# Edit .dev.vars (optional, for single-account mode)
# Add your QWEN_OAUTH_CREDS JSON string
```

### **Deploy Accounts to Local KV**
```bash
npm run setup:deploy-all-dev
```

### **Start Development Server**
```bash
npm run dev
```

Server runs on: `http://localhost:8787`

### **Test Locally**
```bash
# Health check
curl http://localhost:8787/health

# Chat completion
curl -X POST http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3-coder-plus",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 50
  }'
```

---

## 📊 **Multi-Account Management**

### **Account Commands**

```bash
# Authentication
npm run auth:add <account-id>     # Add new OAuth account
npm run auth:list                 # List all local accounts
npm run auth:remove <account-id>  # Remove account

# Deployment (Production)
npm run setup:deploy <account-id> # Deploy single account
npm run setup:deploy-all          # Deploy all accounts
npm run setup:list-kv             # List accounts in KV
npm run setup:remove-kv <account-id> # Remove from KV

# Local Development
npm run setup:deploy-all-dev      # Deploy to local KV
npm run setup:list-kv-dev         # List local KV
npm run setup:health-dev          # Check local health

# Admin Health Check (Production)
npm run setup:health
```

### **Admin Health Monitoring**

Check status of all accounts via API:

```bash
curl https://your-worker.workers.dev/admin/health \
  -H "Authorization: Bearer your-admin-secret"
```

**Response:**
```json
{
  "summary": {
    "total_accounts": 3,
    "healthy_accounts": 2,
    "failed_accounts": 1
  },
  "accounts": [
    {
      "account": "account1",
      "status": "healthy",
      "expiresIn": "45 min"
    },
    {
      "account": "account2",
      "status": "quota_exceeded",
      "expiresIn": "12 min"
    }
  ]
}
```

---

## 🔄 **How Multi-Account System Works**

### **Account Selection Strategy:**

1. **Probability-Based Selection** - Fresher tokens have higher priority
2. **Automatic Failover** - If one fails, tries next account
3. **Daily Auto-Reset** - Failed accounts reset at UTC midnight
4. **No Cron Needed** - Lazy checking on each request

### **Account Lifecycle:**

**Scenario 1: Quota Exhausted (429 Error)**
- Account added to `FAILED_ACCOUNTS` list
- Automatically resets at UTC midnight
- Available again next day

**Scenario 2: Dead Account (Invalid Token)**
- Added to `FAILED_ACCOUNTS` list
- Auto-reset at midnight
- Fails again on next use
- Admin must manually remove: `npm run setup:remove-kv <account-id>`

---

## 🔐 **Security Features**

### **Authentication Methods:**

1. **OAuth2 Tokens** (Primary) - From Qwen accounts
2. **API Key Protection** (Optional) - Protect your proxy

### **Environment Variables:**

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEYS` | ❌ | Comma-separated API keys for proxy access |
| `ADMIN_SECRET_KEY` | ❌ | Admin key for health monitoring |
| `QWEN_OAUTH_CREDS` | ❌ | Legacy single-account OAuth (deprecated) |

---

## 📦 **Available Models**

| Model | Description | Use Case |
|-------|-------------|----------|
| `qwen3-coder-plus` | Most capable | Complex coding tasks |
| `qwen3-coder-flash` | Fast & efficient | Quick responses, simple tasks |
| `vision-model` | Image understanding | Image analysis (if supported) |

---

## 🎯 **Use Cases**

### **1. Free AI Access**
- 2000 requests/day per account
- No credit card required
- Completely free tier

### **2. High-Volume Applications**
- Multiple accounts = higher limits
- Example: 5 accounts = 10,000 requests/day
- Automatic rotation and failover

### **3. OpenAI Compatibility**
- Use existing OpenAI SDK code
- Drop-in replacement for testing
- No code changes needed

### **4. Global Deployment**
- Cloudflare edge network
- Low latency worldwide
- Automatic scaling

---

## ⚠️ **Important Notes**

### **Rate Limits:**
- **Per Account:** 2000 requests/day (free tier)
- **With N Accounts:** N × 2000 requests/day
- **Auto-Reset:** UTC midnight daily

### **Costs:**
- **Qwen API:** FREE (2000 req/day/account)
- **Cloudflare Workers:** FREE (up to 100k requests/month)
- **Total Cost:** $0 for moderate usage!

### **Limitations:**
- Requires Qwen OAuth authentication
- Rate limited by Qwen's free tier
- Cloudflare Worker limitations apply

---

## 🛠️ **Troubleshooting**

### **Common Issues:**

**1. KV Namespace Not Found**
```bash
# Create KV namespace
wrangler kv namespace create "QWEN_TOKEN_CACHE"

# Update wrangler.toml with actual ID
```

**2. OAuth Credentials Invalid**
- Re-authenticate: `npm run auth:add <account-id>`
- Check credentials file: `./.qwen/oauth_creds_<account-id>.json`

**3. Deployment Fails**
```bash
# Ensure logged into Cloudflare
wrangler login

# Verify KV namespace exists
wrangler kv namespace list
```

**4. No Accounts in KV**
```bash
# Deploy accounts first
npm run setup:deploy-all

# Verify deployment
npm run setup:list-kv
```

---

## 📈 **Performance Optimization**

### **Best Practices:**

1. **Use Multiple Accounts** - Higher throughput, better reliability
2. **Monitor Health** - Regular checks with admin endpoint
3. **Cache Tokens** - KV storage prevents unnecessary refreshes
4. **Enable Logging** - Observability for debugging

### **Advanced Configuration:**

Edit `src/config.ts` to customize:
- Token refresh thresholds
- Account selection weights
- Error handling behavior

---

## 🎓 **Learning Resources**

- **Main Docs:** README.md
- **Local Dev:** LOCAL_DEVELOPMENT.md
- **Source Code:** src/ directory
- **Examples:** test-example.js, test-local.js

---

## 🚀 **Next Steps**

### **To Get Started:**

1. ✅ **Login to Cloudflare** - `wrangler login`
2. ✅ **Create KV Namespace** - Save the ID
3. ✅ **Configure wrangler.toml** - Add KV ID
4. ✅ **Add Qwen Accounts** - `npm run auth:add account1`
5. ✅ **Deploy Accounts** - `npm run setup:deploy-all`
6. ✅ **Deploy Worker** - `npm run deploy`
7. ✅ **Test Endpoint** - curl /health

### **For Production:**

1. Add API key protection
2. Set up monitoring/alerts
3. Configure custom domain (optional)
4. Scale with multiple accounts

---

## 💡 **Pro Tips**

### **Maximize Free Tier:**
- Add 3-5 accounts for 6000-10000 req/day
- Monitor quota with health endpoint
- Rotate accounts evenly

### **Development Workflow:**
```bash
# Local testing
npm run setup:deploy-all-dev && npm run dev

# Production deployment
npm run setup:deploy-all && npm run deploy
```

### **Monitoring:**
```bash
# Quick health check
curl https://your-worker.workers.dev/health

# Detailed status (with admin key)
curl https://your-worker.workers.dev/admin/health \
  -H "Authorization: Bearer your-admin-secret"
```

---

## 🎉 **Summary**

**What You Have:**
- ✅ Fully functional OpenAI-compatible proxy
- ✅ Multi-account support for scale
- ✅ Automatic token management
- ✅ Global Cloudflare deployment
- ✅ Free tier access (2000 req/day/account)

**What You Can Do:**
- Replace OpenAI API calls with your worker
- Use any OpenAI SDK or client
- Scale with multiple Qwen accounts
- Deploy globally with Cloudflare

**Cost:** $0 for moderate usage! 🎊

---

**Last Updated:** March 5, 2026  
**Status:** Ready to Configure & Deploy  
**Next Action:** Run `wrangler login` and follow setup steps