# 🚀 DeepSeek Proxy - Quick Start Guide

## 📋 Prerequisites

- Node.js 18+ installed
- Playwright browsers installed (`npx playwright install`)
- Valid DeepSeek account credentials

## 🔐 Your Credentials (From Network Logs)

```
Email: eres3022@gmail.com
Password: ronit@5805
```

⚠️ **Keep these secure!** Don't share or commit to version control.

---

## 🎯 Step-by-Step Setup

### Option 1: Automated Login (Recommended)

#### Step 1: Login and Extract Session

```bash
node login-deepseek.js
```

**What it does:**
- Opens browser automatically
- Navigates to chat.deepseek.com
- Fills email/password automatically
- Extracts session cookies and tokens
- Saves to `sessions/deepseek_session.json`
- Handles PoW challenge preparation

**Expected Output:**
```
============================================================
🔐 DeepSeek Authentication System
============================================================

📧 Email: eres3022@gmail.com
🔑 Password: [HIDDEN]

1. 🌐 Launching browser...
2. 📍 Navigating to chat.deepseek.com...
3. 🔍 Checking for guest challenge...
4. ⌨️  Performing login...
5. ⏳ Verifying login success...
6. 🍪 Extracting session data...
7. ⚡ Preparing PoW challenge...

✅ Authentication completed successfully!

💾 Session saved to: sessions/deepseek_session.json
```

---

### Option 2: Manual Login with Network Capture

#### Step 1: Capture Network Traffic

```bash
node capture-deepseek-network.js
```

**What it does:**
- Monitors ALL network requests
- You login manually in browser
- Captures every API endpoint
- Analyzes which is the chat endpoint
- Saves session + network data

**When to use:**
- If auto-login fails
- To understand API structure
- For debugging issues

---

## 🚀 Start the Proxy

After successful login:

```bash
node start-deepseek.js
```

**This will:**
- Load saved session from file
- Restore all cookies and tokens
- Start proxy server on port 8787
- Handle authentication automatically

**Expected Output:**
```
🚀 Starting DeepSeek Proxy with Saved Session...

✅ Session loaded: https://chat.deepseek.com
🍪 Cookies: 15
💾 LocalStorage: 8 items
🕐 Created: 3/7/2026, 10:30:45 AM

🚀 Starting proxy server...

============================================================

✨ DeepSeek Proxy is LIVE!

📡 URL: http://localhost:8787

💡 Test it now:

curl http://localhost:8787/health

Or use the chat endpoint:

curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

============================================================
```

---

## 🧪 Testing the API

### Basic Health Check

```bash
curl http://localhost:8787/health
```

### Simple Chat Request

```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Streaming Response

```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Tell me a story"}],
    "stream": true
  }'
```

### Using Different Models

```bash
# DeepSeek Coder
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-coder",
    "messages": [{"role": "user", "content": "Write a Python function"}]
  }'

# DeepSeek Chat
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Explain quantum computing"}]
  }'
```

---

## 📁 File Structure

```
universal-ai-proxy/
├── login-deepseek.js              # Auto-login script
├── capture-deepseek-network.js    # Network capture tool
├── start-deepseek.js              # Proxy starter
├── src/
│   ├── deepseek-auth.js           # Authentication manager
│   ├── network-analyzer.js        # Network traffic analyzer
│   ├── browser-auth.js            # Generic browser auth
│   └── index.js                   # Main proxy server
├── sessions/
│   └── deepseek_session.json      # Saved session (auto-generated)
└── DEEPSEEK_AUTH_GUIDE.md         # Detailed documentation
```

---

## 🔧 Troubleshooting

### ❌ Login Failed

**Symptoms:**
- Error: "Authentication failed"
- Browser shows captcha
- Stuck on login page

**Solutions:**
1. Try manual login with `capture-deepseek-network.js`
2. Check if account requires email verification
3. Look for 2FA requirements
4. Verify credentials are correct

---

### ❌ Session Expired

**Symptoms:**
- Proxy returns 401 errors
- Authentication failures
- Redirected to login page

**Solution:**
```bash
# Re-run login to get fresh session
node login-deepseek.js
```

---

### ❌ PoW Challenge Failed

**Symptoms:**
- Chat completion returns error
- "Proof of Work required" message
- Requests rejected

**Solution:**
The proxy handles PoW automatically. Make sure:
1. You're using the latest session
2. WASM files are accessible
3. Network connection is stable

---

### ❌ Rate Limiting

**Symptoms:**
- "Too many requests" error
- 429 status code
- Requests blocked

**Solution:**
1. Wait a few minutes between requests
2. Reduce request frequency
3. Check DeepSeek's rate limit policy

---

## 📊 Understanding the Network Logs

Based on your captured logs, here's what each endpoint does:

### Authentication Flow

```
1. /api/v0/users/create_guest_challenge
   → Optional: Get guest access token

2. /api/v0/users/create_email_verification_code
   → Send verification code to email

3. /api/v0/users/check_email_code
   → Verify the code

4. /api/v0/users/register OR /api/v0/users/login
   → Create account or login

5. /api/v0/client/settings?did={DEVICE_ID}
   → Get client configuration
```

### Chat Flow

```
1. /api/v0/chat_session/fetch_page
   → Load chat history

2. /api/v0/chat_session/create
   → Start new chat session

3. /api/v0/chat/create_pow_challenge
   → Get PoW challenge (required!)

4. /api/v0/chat/completion
   → Send messages and get response
```

---

## 🔐 Security Best Practices

### Protect Your Credentials

```bash
# NEVER commit credentials to git
echo "sessions/*.json" >> .gitignore

# Use environment variables in production
export DEEPSEEK_EMAIL="your@email.com"
export DEEPSEEK_PASSWORD="your-password"
```

### Session Management

- Sessions expire - re-login periodically
- Don't share session files
- Store securely with proper permissions

---

## 📈 Advanced Usage

### Custom Model Parameters

```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello!"}],
    "temperature": 0.7,
    "max_tokens": 1000,
    "top_p": 0.9,
    "frequency_penalty": 0.5,
    "presence_penalty": 0.5
  }'
```

### System Messages

```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {"role": "system", "content": "You are a helpful coding assistant."},
      {"role": "user", "content": "Write a JavaScript function to sort arrays"}
    ]
  }'
```

### Multi-Turn Conversations

```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {"role": "user", "content": "What is TypeScript?"},
      {"role": "assistant", "content": "TypeScript is a typed superset of JavaScript..."},
      {"role": "user", "content": "How do I install it?"}
    ]
  }'
```

---

## 🛠️ Development Commands

```bash
# Run in development mode with auto-reload
npm run dev

# List saved configurations
npm run config:list

# Clear all saved configs
npm run config:clear

# Run tests
npm test
```

---

## 📚 Additional Resources

- [DEEPSEEK_AUTH_GUIDE.md](./DEEPSEEK_AUTH_GUIDE.md) - Complete auth documentation
- [NETWORK_ANALYZER_GUIDE.md](./NETWORK_ANALYZER_GUIDE.md) - Network analysis tools
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Project overview

---

## ✅ Quick Checklist

Before running the proxy:

- [ ] Node.js 18+ installed
- [ ] Playwright browsers installed
- [ ] Valid DeepSeek account
- [ ] Credentials ready
- [ ] Port 8787 available

After setup:

- [ ] Session saved successfully
- [ ] Proxy starts without errors
- [ ] Health check returns OK
- [ ] Chat completion works
- [ ] Streaming responses work

---

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review [DEEPSEEK_AUTH_GUIDE.md](./DEEPSEEK_AUTH_GUIDE.md)
3. Run network capture to debug: `node capture-deepseek-network.js`
4. Check browser console for errors during login

---

**Status**: ✅ Ready to use  
**Last Updated**: Based on network capture from chat.deepseek.com  
**Tested With**: Email/Password authentication
