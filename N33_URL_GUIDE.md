# N33 AI Worker - URL Reference Guide

## ✅ Working Endpoints

### Base URL
```
https://n33-ai.qwen4346.workers.dev
```
**Status**: ⚠️ Returns 404 (This is NORMAL for Cloudflare Workers)

### API Endpoints (All Working ✅)

#### 1. List All Models
```bash
GET https://n33-ai.qwen4346.workers.dev/v1/models
```
**Response**: JSON list of all 9 available models

#### 2. Chat Completions
```bash
POST https://n33-ai.qwen4346.workers.dev/v1/chat/completions
Content-Type: application/json
Authorization: Bearer test

{
  "model": "claude-sonnet-4.5",
  "messages": [{"role": "user", "content": "Hello!"}]
}
```

#### 3. Alternative Route (if available)
```bash
POST https://n33-ai.qwen4346.workers.dev/chat/completions
```

---

## 🔍 Why Base URL Returns 404

This is **completely normal** for Cloudflare Workers! 

The worker is configured to only respond to specific API routes:
- ✅ `/v1/models` - Lists models
- ✅ `/v1/chat/completions` - Chat endpoint
- ❌ `/` (base) - No handler defined = 404

**This is NOT a bug** - it's by design! The worker is an API service, not a website.

---

## 📋 Correct Usage

### ✅ DO THIS:
```bash
# Test models endpoint
curl https://n33-ai.qwen4346.workers.dev/v1/models

# Test chat endpoint
curl -X POST https://n33-ai.qwen4346.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test" \
  -d '{
    "model": "claude-sonnet-4.5",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### ❌ DON'T DO THIS:
```bash
# Don't open base URL in browser expecting a website
https://n33-ai.qwen4346.workers.dev/
# This will return {"error":"Not found"} - which is CORRECT behavior
```

---

## 🌐 Browser Testing

### If you want to test in browser:

**✅ This works:**
```
https://n33-ai.qwen4346.workers.dev/v1/models
```
(Will show raw JSON response)

**❌ This won't work:**
```
https://n33-ai.qwen4346.workers.dev/
```
(Will show 404 error page)

---

## 💻 Quick Test Commands

### PowerShell
```powershell
# Test models
Invoke-RestMethod -Uri "https://n33-ai.qwen4346.workers.dev/v1/models" | ConvertTo-Json

# Test chat
$body = @{
    model = "claude-sonnet-4.5"
    messages = @(@{role="user"; content="Hello"})
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://n33-ai.qwen4346.workers.dev/v1/chat/completions" `
  -Method Post `
  -Headers @{"Authorization"="Bearer test"; "Content-Type"="application/json"} `
  -Body $body
```

### Command Prompt (Windows)
```cmd
REM Test models
curl https://n33-ai.qwen4346.workers.dev/v1/models

REM Test chat (use a tool like Postman instead - curl on Windows is tricky)
```

### Git Bash / WSL
```bash
# Test models
curl https://n33-ai.qwen4346.workers.dev/v1/models

# Test chat
curl -X POST https://n33-ai.qwen4346.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test" \
  -d '{"model":"claude-sonnet-4.5","messages":[{"role":"user","content":"Hello"}]}'
```

---

## 🎯 Summary

| URL | Status | Expected? |
|-----|--------|-----------|
| `https://n33-ai.qwen4346.workers.dev/` | ❌ 404 | ✅ YES (normal) |
| `https://n33-ai.qwen4346.workers.dev/v1/models` | ✅ 200 OK | ✅ YES |
| `https://n33-ai.qwen4346.workers.dev/v1/chat/completions` | ✅ 200 OK | ✅ YES |

**The worker is working correctly!** The 404 on the base URL is intentional design.

---

## 🔧 For Claude Code CLI Setup

```powershell
# Set environment variables
$env:ANTHROPIC_BASE_URL="https://n33-ai.qwen4346.workers.dev/v1"
$env:ANTHROPIC_API_KEY="not-needed"

# Use Claude CLI
claude --model claude-sonnet-4.5
claude --model gemini-3-flash
claude --model grok-4.1-fast
```

**Note**: Point to `/v1` subdirectory, NOT the base URL!

---

## 🆘 Troubleshooting

### "I get 404 on base URL"
✅ **This is normal!** Use `/v1/models` or `/v1/chat/completions` instead.

### "All endpoints return 404"
❌ Check if worker is deployed:
```bash
curl https://n33-ai.qwen4346.workers.dev/v1/models
```
If this fails, the worker might be down.

### "I get authentication errors"
✅ Add the Authorization header:
```
Authorization: Bearer test
```
(Any value works - the worker doesn't validate it)

---

**Last Verified**: March 23, 2026  
**Status**: ✅ All API endpoints working correctly  
**Note**: Base URL 404 is expected behavior
