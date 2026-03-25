# DeepSeek Worker Proxy

OpenAI-compatible API for DeepSeek's models deployed on Cloudflare Workers with **multi-account support** and **automatic API key rotation**.

## Overview

This project provides a Cloudflare Worker that acts as an OpenAI-compatible proxy for DeepSeek AI models. It handles multi-account management, automatic failover, and provides standard OpenAI API endpoints.

## Features

- ✅ OpenAI-compatible API endpoints
- ✅ **Multi-account management** with automatic rotation
- ✅ **Intelligent account selection** based on availability
- ✅ **Automatic failover** on errors or rate limits
- ✅ Multiple models: `deepseek-chat`, `deepseek-coder`, `deepseek-v2`, `deepseek-v2.5`
- ✅ Streaming support
- ✅ Token usage tracking
- ✅ KV-based credential storage
- ✅ Admin health check endpoint

## Prerequisites

1. **Cloudflare Account** with Workers enabled
2. **DeepSeek API Keys** from https://platform.deepseek.com/api_keys
3. **Node.js** and npm installed

## Quick Start

### Step 1: Set up Cloudflare Workers

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create KV namespace:
   ```bash
   wrangler kv namespace create "DEEPSEEK_TOKEN_CACHE"
   ```

3. Update `wrangler.toml` with the KV namespace ID:
   ```toml
   kv_namespaces = [
     { binding = "DEEPSEEK_TOKEN_CACHE", id = "YOUR_KV_ID_HERE" }
   ]
   ```

4. Authenticate with Cloudflare:
   ```bash
   wrangler login
   ```

### Step 2: Add DeepSeek API Keys

Add one or more DeepSeek API keys:

```bash
# Add first account
npm run auth:add account1

# Add second account  
npm run auth:add account2

# List all accounts
npm run auth:list
```

**Note:** DeepSeek uses simple API key authentication (no OAuth). You'll be prompted to enter your API key directly.

### Step 3: Deploy Accounts to KV

Deploy your accounts to Cloudflare KV storage:

```bash
# Deploy all accounts at once
npm run setup:deploy-all

# Or deploy individually
npm run setup:deploy account1

# List accounts in KV
npm run setup:list-kv
```

### Step 4: Set Environment Variables

Set admin secret for health check endpoint:

```bash
wrangler secret put ADMIN_SECRET_KEY
# Enter a secure random string (e.g., sk-admin-xxxxxxxx)
```

### Step 5: Deploy Worker

```bash
npm run deploy
```

Your multi-account proxy is now live! 🎉

## Testing

### Health Check
```bash
curl https://your-worker.workers.dev/health
```

### List Models
```bash
curl https://your-worker.workers.dev/v1/models
```

### Chat Completion
```bash
curl -X POST https://your-worker.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Using Python OpenAI SDK
```python
from openai import OpenAI

client = OpenAI(
    base_url='https://your-worker.workers.dev/v1',
    api_key='sk-any-key-works'  # Any key works since auth is handled by worker
)

response = client.chat.completions.create(
    model='deepseek-chat',
    messages=[
        {'role': 'user', 'content': 'Explain recursion'}
    ]
)

print(response.choices[0].message.content)
```

## Multi-Account Management

### Account Commands

```bash
# Authentication
npm run auth:add <account-id>     # Add new account with API key
npm run auth:list                 # List all accounts
npm run auth:remove <account-id>  # Remove account credentials

# Deployment
npm run setup:deploy <account-id> # Deploy single account to KV
npm run setup:deploy-all          # Deploy all accounts to KV
npm run setup:list-kv             # List accounts in KV
npm run setup:remove-kv <account-id> # Remove account from KV

# Health Check
npm run setup:health              # Check status of all accounts
```

### Admin Health Check

Monitor all accounts via API endpoint:

```bash
curl https://your-worker.workers.dev/admin/health \
  -H "Authorization: Bearer your-admin-secret-key"
```

**Response:**
```
╔══════════════════════════════════════════════════════════════════╗
║              🏥 DEEPSEEK MULTI-ACCOUNT HEALTH CHECK              ║
╠══════════════════════════════════════════════════════════════════╣
║ 📊 SUMMARY                                                       ║
╟──────────────────────────────────────────────────────────────────╢
║ Total Accounts:        2                                         ║
║ ✅ Healthy:            2                                         ║
║ ❌ Error:              0                                         ║
║ ❓ Missing Creds:      0                                         ║
╟──────────────────────────────────────────────────────────────────╢
║ 📋 ACCOUNT STATUS DETAILS                                      ║
╟──────────────────────────────────────────────────────────────────╢
│ Account                         │ Status              │ Expires In │ API │
╠══════════════════════════════════════════════════════════════════╣
│ account1                       │ ✅ healthy            │ N/A        │ ✓ 200  │    
│ account2                       │ ✅ healthy            │ N/A        │ ✓ 200  │    
╚══════════════════════════════════════════════════════════════════╝
```

## Available Models

| Model ID | Description | Use Case |
|----------|-------------|----------|
| `deepseek-chat` | DeepSeek Chat V3 | General conversation, Q&A |
| `deepseek-coder` | DeepSeek Coder | Code generation, programming |
| `deepseek-v2` | DeepSeek V2 | Balanced performance |
| `deepseek-v2.5` | DeepSeek V2.5 | Latest version, best quality |

## How Multi-Account Works

1. **Automatic Account Selection**: Random selection from available accounts
2. **Automatic Failover**: If one account fails, automatically tries another
3. **Load Balancing**: Distributes requests across multiple accounts
4. **Health Monitoring**: Regular checks ensure accounts are working

## Troubleshooting

### Common Issues

- **KV Namespace Not Found**: Ensure you've created the KV namespace and updated `wrangler.toml`
- **Invalid API Key**: Verify your DeepSeek API key is correct and active
- **Deployment Fails**: Check Cloudflare account permissions and Wrangler authentication

### Debug Commands

```bash
# Check local accounts
npm run auth:list

# Check KV accounts
npm run setup:list-kv

# Test health
npm run setup:health
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/admin/health` | GET | Multi-account health status (requires admin key) |
| `/v1/models` | GET | List available models |
| `/v1/chat/completions` | POST | Create chat completion |
| `/v1/debug/token` | GET | Token info (dev only) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEYS` | ❌ | Comma-separated API keys for authentication |
| `ADMIN_SECRET_KEY` | ❌ | Admin key for health check endpoint |
| `OPENAI_API_KEY` | ❌ | Single API key (legacy, deprecated) |

## Local Development

Run locally for testing:

```bash
npm run dev
```

The worker will be available at `http://localhost:8787`

## Rate Limits

DeepSeek API has the following rate limits (check official docs for current limits):
- Requests per minute: Varies by account
- Tokens per minute: Varies by account

Using multiple accounts helps distribute the load and avoid rate limits.

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit `.deepseek/` directory** to Git (already in .gitignore)
2. **Keep API keys secure** - they provide access to your DeepSeek account
3. **Use separate accounts** for different environments
4. **Rotate keys periodically** for security
5. **Monitor usage** regularly via DeepSeek dashboard

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Cloudflare Workers documentation
3. Check DeepSeek API documentation: https://api-docs.deepseek.com/

---

**Enjoy your DeepSeek proxy! 🚀**
