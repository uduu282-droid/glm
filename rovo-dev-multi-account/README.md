# Rovo Dev Multi-Account Proxy

## 🚀 Overview

**Capacity:** 5 MILLION tokens/day per account  
**Model:** Claude Sonnet 4 (72.7% SWE-bench Verified)  
**Reset:** Daily at midnight UTC  
**Credit Card:** NOT required during beta

With 10 accounts: **50 MILLION tokens/day** of Claude Sonnet 4!

---

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Your First Account

```bash
npm run auth:add
```

You'll need:
- Atlassian account email
- Atlassian API token (get it at: https://id.atlassian.com/api-tokens)

### 3. Add More Accounts (Optional)

Repeat for each additional account:

```bash
npm run auth:add
```

Each account gives you 5M tokens/day!

### 4. List Your Accounts

```bash
npm run auth:list
```

### 5. Deploy to Cloudflare Workers

First, make sure you're logged into Cloudflare:

```bash
npx wrangler login
```

Then deploy:

```bash
npm run deploy
```

### 6. Test Your Proxy

```bash
curl -X POST https://your-worker.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## 📊 Capacity Planning

| Accounts | Daily Tokens | Hourly (avg) | Best For |
|----------|--------------|--------------|----------|
| 1 | 5,000,000 | 208,333 | Personal projects |
| 3 | 15,000,000 | 625,000 | Small apps |
| 5 | 25,000,000 | 1,041,667 | Medium production |
| 10 | 50,000,000 | 2,083,333 | Large scale apps |

**Note:** Average chat message = 100-500 tokens

---

## 🔧 Available Commands

```bash
# Authentication
npm run auth:add              # Add new account
npm run auth:list             # List all accounts
npm run auth:remove <id>      # Remove account

# Setup & Deployment
npm run setup:deploy-all      # Preview KV deployment
npm run setup:deploy-all-remote  # Deploy to Cloudflare KV
npm run setup:health          # Health check accounts
npm run deploy                # Deploy worker to Cloudflare
npm run dev                   # Run locally for testing

# Management
npm run secrets:update        # Update worker secrets
```

---

## 📝 Configuration Files

### wrangler.toml

Create `wrangler.toml` from template:

```bash
cp wrangler.toml.template wrangler.toml
```

Edit with your Cloudflare account details.

### .env

Copy `.env.example` to `.env` if needed for local testing.

---

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  Cloudflare Worker          │
│  (Rovo Dev Multi-Account)   │
│                             │
│  ┌───────────────────────┐  │
│  │  Account Rotation     │  │
│  │  - Weighted random    │  │
│  │  - Daily reset        │  │
│  │  - Auto-failover      │  │
│  └───────────────────────┘  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Cloudflare KV Storage      │
│  - Account credentials      │
│  - Token usage tracking     │
│  - Daily counters           │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Rovo Dev API               │
│  (Atlassian)                │
│  - Claude Sonnet 4          │
│  - 5M tokens/account/day    │
└─────────────────────────────┘
```

---

## 🔐 Security

- ✅ All credentials stored in Cloudflare KV (encrypted at rest)
- ✅ API tokens never exposed to client
- ✅ Automatic token rotation
- ✅ Daily usage tracking and limits
- ✅ Failed account detection and failover

---

## 🎯 API Endpoints

### POST /v1/chat/completions

OpenAI-compatible chat completions endpoint.

**Request:**
```json
{
  "model": "claude-sonnet-4",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```

**Response:**
```json
{
  "id": "chatcmpl-rovo-123456",
  "object": "chat.completion",
  "model": "claude-sonnet-4",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you today?"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 50,
    "total_tokens": 60
  }
}
```

### GET /v1/models

List available models.

### GET /health

Health check endpoint.

### GET /admin/accounts

View account status and usage (requires admin key).

---

## 💡 Tips

1. **Add accounts gradually**: Start with 1-2 accounts, test thoroughly, then scale up
2. **Monitor usage**: Use `/admin/accounts` to track token consumption
3. **Rotate regularly**: System automatically rotates accounts based on remaining capacity
4. **Handle failures**: If one account fails, automatically tries next available
5. **Daily reset**: All counters reset at midnight UTC automatically

---

## 🐛 Troubleshooting

### "No valid accounts available"

- Check if accounts are deployed: `npm run setup:health`
- Verify API tokens are still valid
- Ensure daily limits haven't been exceeded

### Rate limiting

- Each account has implicit rate limits from Rovo Dev
- System automatically spreads load across accounts
- Consider adding more accounts if consistently hitting limits

### Deployment issues

- Ensure Cloudflare authentication: `npx wrangler whoami`
- Check KV namespace is created
- Verify wrangler.toml configuration

---

## 📚 Resources

- [Rovo Dev CLI Docs](https://support.atlassian.com/rovo/docs/)
- [Atlassian API Tokens](https://id.atlassian.com/api-tokens)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [GitHub - Free AI Coding Tools](https://github.com/inmve/free-ai-coding)

---

## 🚨 Important Notes

- **Beta Program**: Rovo Dev free tier is currently in beta
- **Token Limits**: 5M tokens/day per account (20M on first day only)
- **Midnight UTC Reset**: All daily counters reset at 00:00 UTC
- **No Credit Card**: Required during beta period
- **Claude Sonnet 4**: Access confirmed during beta testing

---

## 📄 License

MIT License - See LICENSE file

---

## 🙏 Credits

Built with:
- [Hono](https://hono.dev/) - Ultra-fast web framework
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless deployment
- [Rovo Dev](https://www.atlassian.com/software/rovo) - Atlassian's AI platform

---

**Ready to start?** Run `npm run auth:add` now! 🚀
