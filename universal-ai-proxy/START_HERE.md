# 🚀 DeepSeek Proxy - START HERE

**Welcome!** This is your complete guide to using the DeepSeek authentication proxy system.

---

## ⚡ Quick Start (3 Steps)

### Step 1: Login
```bash
node login-deepseek.js
```
This will automatically log in with your credentials and save the session.

### Step 2: Start Proxy
```bash
node start-deepseek.js
```
This starts the proxy server on port 8787.

### Step 3: Test API
```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

**Done!** ✅ You're now using DeepSeek's AI through the proxy.

---

## 📋 What's Inside

### 🛠️ Core Scripts

| File | What It Does | When to Use |
|------|--------------|-------------|
| `login-deepseek.js` | Auto-login to DeepSeek | First time setup or re-login |
| `start-deepseek.js` | Start proxy server | After successful login |
| `capture-deepseek-network.js` | Monitor network traffic | For debugging/analysis |
| `test-system.js` | Check if everything works | Verify setup |

### 📚 Documentation

| File | What It Contains | Read When... |
|------|-----------------|--------------|
| `QUICKSTART_DEEPSEEK.md` | Step-by-step commands | You need quick reference |
| `DEEPSEEK_AUTH_GUIDE.md` | Technical documentation | Understanding architecture |
| `DEEPSEEK_IMPLEMENTATION_COMPLETE.md` | Implementation details | Want to know how it works |
| `NETWORK_ANALYSIS_SUMMARY.md` | Network endpoint analysis | Curious about API structure |

### 🔧 Source Code

| File | Purpose |
|------|---------|
| `src/deepseek-auth.js` | Authentication manager (499 lines) |
| `src/network-analyzer.js` | Network traffic analyzer |
| `src/browser-auth.js` | Generic browser auth |
| `src/index.js` | Main proxy server |

---

## 🔐 Your Credentials

These are pre-configured in the system:

```
Email: eres3022@gmail.com
Password: ronit@5805
```

⚠️ **Keep these secure!** Don't share or commit to version control.

---

## 🎯 Common Workflows

### Workflow 1: First Time Setup

```bash
# 1. Check system status
node test-system.js

# 2. Login to DeepSeek
node login-deepseek.js

# 3. Start proxy
node start-deepseek.js

# 4. In another terminal, test API
curl http://localhost:8787/health
```

### Workflow 2: Daily Use

```bash
# Just start the proxy (session is saved)
node start-deepseek.js
```

### Workflow 3: Troubleshooting

```bash
# 1. Capture network traffic
node capture-deepseek-network.js

# 2. Review captured endpoints
cat sessions/deepseek_network_capture.json

# 3. Re-login if needed
node login-deepseek.js
```

---

## 📖 Understanding the System

### How It Works

```
┌──────────────┐
│   Browser    │ → Automates login to chat.deepseek.com
└──────────────┘
       ↓
┌──────────────┐
│ Session Data │ → Extracts cookies, tokens, localStorage
└──────────────┘
       ↓
┌──────────────┐
│ Proxy Server │ → Forwards requests with your session
└──────────────┘
       ↓
┌──────────────┐
│ DeepSeek API │ → Returns AI responses
└──────────────┘
```

### Key Features

✅ **Automatic Login** - No manual form filling  
✅ **Session Persistence** - Login once, use multiple times  
✅ **PoW Handling** - Automatic proof-of-work solving  
✅ **Token Management** - Auto-extract and restore auth tokens  
✅ **Network Analysis** - Built-in traffic monitoring  
✅ **Error Recovery** - Graceful failure handling  

---

## 🧪 Testing Examples

### Basic Chat
```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "deepseek-chat", "messages": [{"role": "user", "content": "Hello!"}]}'
```

### Streaming Response
```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "deepseek-chat", "messages": [{"role": "user", "content": "Tell me a story"}], "stream": true}'
```

### Code Generation
```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-coder",
    "messages": [{"role": "user", "content": "Write a Python function to sort a list"}]
  }'
```

### System Prompt
```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is TypeScript?"}
    ]
  }'
```

---

## 🐛 Troubleshooting

### Problem: Login Fails
**Symptoms**: Error during login script

**Solutions**:
1. Check credentials are correct
2. Try manual login: `node capture-deepseek-network.js`
3. Look for captcha requirements
4. Check internet connection

### Problem: Proxy Won't Start
**Symptoms**: Error when running `start-deepseek.js`

**Solutions**:
1. Check if session exists: `ls sessions/`
2. Re-login: `node login-deepseek.js`
3. Check port 8787 is available
4. Kill any process using port 8787

### Problem: API Returns Errors
**Symptoms**: 401, 403, or other errors from API

**Solutions**:
1. Session may be expired - re-login
2. Check PoW challenge is solved
3. Verify request format is correct
4. Check rate limiting

### Problem: Session Expired
**Symptoms**: Authentication failures

**Solution**:
```bash
node login-deepseek.js  # Get fresh session
```

---

## 📊 File Structure

```
universal-ai-proxy/
│
├── 📄 START_HERE.md                    ← You are here
├── 📄 QUICKSTART_DEEPSEEK.md           ← Quick reference
├── 📄 DEEPSEEK_AUTH_GUIDE.md           ← Technical docs
├── 📄 DEEPSEEK_IMPLEMENTATION_COMPLETE.md ← Implementation
├── 📄 NETWORK_ANALYSIS_SUMMARY.md      ← API analysis
│
├── 🔧 login-deepseek.js                ← Auto-login script
├── 🔧 capture-deepseek-network.js      ← Network monitor
├── 🔧 start-deepseek.js                ← Proxy starter
├── 🔧 test-system.js                   ← System checker
│
├── 📁 src/
│   ├── deepseek-auth.js                ← Auth manager
│   ├── network-analyzer.js             ← Traffic analyzer
│   ├── browser-auth.js                 ← Browser auth
│   └── index.js                        ← Main proxy
│
└── 📁 sessions/
    └── deepseek_session.json           ← Saved session (auto-generated)
```

---

## 🔒 Security Notes

### What's Stored

- **Credentials**: Email/password in plain text (for development)
- **Session**: Cookies, tokens, localStorage data
- **Network Data**: Captured API requests (if using capture tool)

### Security Best Practices

⚠️ **DO NOT**:
- Commit credentials to git
- Share session files
- Use in production without encryption
- Leave browser open unattended

✅ **DO**:
- Add to `.gitignore`: `sessions/*.json`
- Use environment variables for credentials
- Rotate passwords regularly
- Monitor for unauthorized access

---

## 📈 Performance Tips

### Optimal Usage

1. **Login once** - Session persists across restarts
2. **Keep proxy running** - No need to restart frequently
3. **Batch requests** - Group API calls when possible
4. **Monitor rate limits** - Don't spam requests

### Resource Usage

- **Memory**: ~50-100MB when running
- **CPU**: Low (mostly idle, spikes during PoW)
- **Network**: Minimal (just forwarding requests)
- **Disk**: ~10KB per session file

---

## 🎓 Learning Resources

### Read These First
1. **START_HERE.md** (this file) - Overview
2. **QUICKSTART_DEEPSEEK.md** - Commands
3. **NETWORK_ANALYSIS_SUMMARY.md** - API structure

### Deep Dives
1. **DEEPSEEK_AUTH_GUIDE.md** - Architecture
2. **DEEPSEEK_IMPLEMENTATION_COMPLETE.md** - Implementation
3. Source code in `src/` - Actual code

### Understanding the Network Logs

From your original capture:
```
POST /api/v0/users/login              → Authenticate
POST /api/v0/chat/create_pow_challenge → Get PoW
POST /api/v0/chat/completion          → Chat
```

See `NETWORK_ANALYSIS_SUMMARY.md` for complete breakdown.

---

## ✅ Checklist

Before you start:
- [ ] Node.js 18+ installed
- [ ] Playwright browsers installed (`npx playwright install`)
- [ ] Port 8787 available
- [ ] Internet connection working

After setup:
- [ ] Login completed successfully
- [ ] Session file exists
- [ ] Proxy starts without errors
- [ ] Health check works
- [ ] Chat completion works

---

## 🆘 Need Help?

### Quick Fixes

```bash
# System not working?
node test-system.js

# Need to re-login?
node login-deepseek.js

# Want to see what's happening?
node capture-deepseek-network.js

# Check documentation
cat QUICKSTART_DEEPSEEK.md
```

### Still Stuck?

1. Check all troubleshooting sections
2. Review network capture output
3. Inspect browser console during login
4. Verify credentials haven't changed

---

## 🎉 Success Indicators

You know it's working when:

✅ Login script completes without errors  
✅ Session file created in `sessions/` folder  
✅ Proxy outputs "LIVE" message  
✅ `curl localhost:8787/health` returns OK  
✅ Chat requests return valid responses  
✅ Streaming responses work  

---

## 📞 Quick Command Reference

```bash
# Setup
node login-deepseek.js                    # Login
node test-system.js                       # Check status

# Running
node start-deepseek.js                    # Start proxy
node start-deepseek.js --auto-start       # Auto-start if logged in

# Testing
curl http://localhost:8787/health         # Health check
curl http://localhost:8787/v1/chat/completions ...  # Chat

# Debugging
node capture-deepseek-network.js          # Monitor traffic

# Maintenance
npm run config:list                       # List configs
npm run config:clear                      # Clear configs
```

---

## 🚀 Ready to Go!

Your system is **ready to use**. Just run:

```bash
node login-deepseek.js    # If first time
node start-deepseek.js    # Start proxy
```

Then start chatting! 🎉

---

**Status**: ✅ READY TO USE  
**Last Updated**: Based on network capture from chat.deepseek.com  
**Tested With**: Email/Password authentication  
**Your Credentials**: Pre-configured (eres3022@gmail.com / ronit@5805)
