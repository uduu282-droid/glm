# Gemini CLI Multi-Account Proxy

OpenAI-compatible API for Gemini models (gemini-2.5-pro, gemini-2.5-flash) deployed on Cloudflare Workers with **multi-account rotation** for **10,000 requests/day**.

## Overview

This project extends the [gemini-cli-proxy](https://github.com/ubaltaci/gemini-cli-proxy) concept with multi-account support, allowing you to scale from 1,000 req/day (single account) to **10,000 req/day** (10 accounts) using the same free tier pattern.

## Features

- ✅ OpenAI-compatible API endpoints
- ✅ **Multi-account management** with automatic rotation (10 accounts = 10K req/day)
- ✅ **Automatic daily reset** at UTC midnight
- ✅ **Intelligent account selection** based on token freshness
- ✅ **Automatic failover** on quota exhaustion or errors
- ✅ OAuth2 authentication with automatic token refresh
- ✅ Global edge deployment via Cloudflare Workers
- ✅ Multiple models: `gemini-2.5-pro`, `gemini-2.5-flash`
- ✅ Token usage tracking
- ✅ KV-based token caching
- ✅ Admin health check endpoint

## Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Authenticate with Cloudflare

```bash
wrangler login
```

### Step 3: Create KV Namespace

```bash
wrangler kv namespace create "GEMINI_TOKEN_CACHE"
```

Update the namespace ID in `wrangler.toml`.

### Step 4: Add Gemini Accounts (10 Accounts Target)

Add accounts one by one. Each account gives 1,000 requests/day.

```bash
# Add first account
npm run auth:add gemini1

# The script will:
# 1. Open browser for Google OAuth
# 2. You authenticate with your Google account
# 3. Authorization code is exchanged for tokens
# 4. Tokens saved to ./.gemini/oauth_creds_gemini1.json

# Add more accounts (target: 10 total)
npm run auth:add gemini2
npm run auth:add gemini3
# ... continue until gemini10

# List all accounts
npm run auth:list
```

### Step 5: Deploy Accounts to KV

```bash
# Deploy all accounts to Cloudflare KV storage
npm run setup:deploy-all

# Or deploy individually
npm run setup:deploy gemini1

# List accounts in KV
npm run setup:list-kv
```

### Step 6: Set Environment Secrets

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```
OPENAI_API_KEYS=sk-your-key-1,sk-your-key-2
ADMIN_SECRET_KEY=your-admin-secret-here
```

Update secrets in Cloudflare:

```bash
npm run secrets:update
```

### Step 7: Deploy Worker

```bash
npm run deploy
```

Your multi-account Gemini proxy is now live! 🎉

## Testing

### Health Check
```bash
curl https://your-worker.workers.dev/health
```

### List Models
```bash
curl https://your-worker.workers.dev/v1/models
```

### Chat Completion (OpenAI Format)
```bash
curl -X POST https://your-worker.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-pro",
    "messages": [{"role": "user", "content": "Write hello world in Python"}]
  }'
```

### With API Key Authentication
```bash
curl -X POST https://your-worker.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-api-key" \
  -d '{
    "model": "gemini-2.5-pro",
    "messages": [{"role": "user", "content": "Explain recursion"}]
  }'
```

### Using Python OpenAI SDK
```python
from openai import OpenAI

client = OpenAI(
    base_url='https://your-worker.workers.dev/v1',
    api_key='sk-your-api-key-here'
)

response = client.chat.completions.create(
    model='gemini-2.5-pro',
    messages=[
        {'role': 'user', 'content': 'Explain quantum computing'}
    ]
)

print(response.choices[0].message.content)
```

## Management Commands

```bash
# Authentication
npm run auth:add <account-id>     # Add new account with OAuth
npm run auth:list                 # List all local accounts
npm run auth:remove <account-id>  # Remove account credentials

# Deployment
npm run setup:deploy <account-id> # Deploy single account to KV
npm run setup:deploy-all          # Deploy all accounts to KV
npm run setup:list-kv             # List accounts in KV
npm run setup:remove-kv <account-id> # Remove account from KV

# Health Check
npm run setup:health              # Check status of all accounts

# Secrets Management
npm run secrets:update            # Update all secrets from .env file
npm run secrets:list              # List all configured secrets
```

## How Multi-Account Works

### Account Selection
1. **Probability-Based Selection** - Fresher tokens have higher priority (85% chance)
2. **Automatic Failover** - If one account fails, tries another instantly
3. **Daily Auto-Reset** - Failed accounts reset at UTC midnight (no cron needed)
4. **Proactive Refresh** - Expired tokens refreshed before use (10% trigger rate)

### Account Lifecycle

**Quota Exhausted (429 Error):**
- Added to `FAILED_ACCOUNTS` list
- Auto-reset at UTC midnight
- Available again next day when quota resets

**Dead Account (Invalid Token):**
- Added to `FAILED_ACCOUNTS` list  
- Auto-reset at midnight
- Fails again on next use
- Admin removes manually: `npm run setup:remove-kv <account-id>`

## Capacity Planning

| Accounts | Daily Capacity | Use Case |
|----------|---------------|----------|
| 1 account | 1,000 req/day | Personal testing |
| 3 accounts | 3,000 req/day | Small projects |
| 5 accounts | 5,000 req/day | Medium apps |
| **10 accounts** | **10,000 req/day** | Production apps |

**Recommendation:** Start with 5 accounts, scale to 10 as needed.

## Troubleshooting

### KV Namespace Not Found
```bash
# Create KV namespace
wrangler kv namespace create "GEMINI_TOKEN_CACHE"

# Update wrangler.toml with actual ID
```

### OAuth Credentials Invalid
```bash
# Re-authenticate account
npm run auth:add gemini1
```

### Deployment Fails
```bash
# Ensure logged into Cloudflare
wrangler login

# Verify KV namespace exists
wrangler kv namespace list
```

### No Accounts in KV
```bash
# Deploy accounts first
npm run setup:deploy-all

# Verify deployment
npm run setup:list-kv
```

## Comparison: gemini-cli-proxy vs This Project

| Feature | gemini-cli-proxy | This Project |
|---------|------------------|--------------|
| Accounts | 1 | **10** |
| Daily Capacity | 1,000 req | **10,000 req** |
| Auto Rotation | ❌ | ✅ |
| Auto Failover | Model only | **Account + Model** |
| Auto Reset | ❌ Manual | ✅ UTC midnight |
| Deployment | Local server | **Cloudflare Edge** |
| Maintenance | Manual | **Zero** |

## License

MIT

## Credits

Based on the excellent work by:
- [gemini-cli-proxy](https://github.com/ubaltaci/gemini-cli-proxy) - Original single-account proxy
- [Qwen Worker Proxy](../qwen-worker-proxy) - Multi-account architecture pattern

---

**Ready to scale?** Add your first account with `npm run auth:add gemini1`! 🚀
