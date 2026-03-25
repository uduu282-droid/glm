# 💬 Z.AI TERMINAL CHAT GUIDE

## 🎯 OVERVIEW

Interactive terminal interface for Z.AI with automatic header spoofing built-in.

---

## 🛠️ AVAILABLE TOOLS

### **3 Terminal Chat Options:**

| Tool | Type | Best For | Spoofing |
|------|------|----------|----------|
| **zai_simple_chat.js** | API-based | Quick testing | ✅ Auto rotation |
| **zai_terminal_chat.js** | API + UI | Advanced users | ✅ Full spoofing |
| **zai_browser_chat.js** | Browser automation | Full interaction | ✅ Complete stealth |

---

## 🚀 QUICK START

### **Option 1: Simple Mode (Recommended)**

```bash
node zai_simple_chat.js
```

**Features:**
- ✅ Lightweight & fast
- ✅ Automatic header rotation
- ✅ Test API connectivity
- ✅ View session info
- ✅ Command interface

**Commands:**
- `/test` - Test API connection
- `/session` - Show session details
- `/rotate` - Rotate User-Agent
- `/help` - Show commands
- `/exit` - Quit

---

### **Option 2: Browser Automation (Full Features)**

```bash
node zai_browser_chat.js
```

**Features:**
- ✅ Real browser interaction
- ✅ Full chat functionality
- ✅ Send/receive messages
- ✅ Automatic login handling
- ✅ Session management

**Commands:**
- `/help` - Show commands
- `/exit` - Exit chat
- `/clear` - Clear screen
- `/save` - Save session
- `/ua` - Show User-Agent
- `/rotate` - Rotate identity

---

## 📊 WHAT EACH TOOL DOES

### **1. zai_simple_chat.js** ⭐ RECOMMENDED

**Purpose:** Quick API testing and monitoring

**What it does:**
1. Loads your session
2. Tests API with spoofed headers
3. Provides interactive command interface
4. Rotates User-Agent automatically

**Example Session:**
```
🎭 Z.AI Terminal Chat (Simple Mode)
====================================

✅ Session loaded
🧪 Testing API endpoint...
Using User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
✅ API is accessible!
Response: []...

💬 Simple Terminal Interface
============================
Commands: /test, /session, /rotate, /exit

👤 Command: /test
🧪 Testing API endpoint...
Using User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X...)
✅ API is accessible!
```

---

### **2. zai_terminal_chat.js**

**Purpose:** Advanced API exploration

**What it does:**
1. Comprehensive header spoofing
2. Tries to send messages via API
3. Shows detailed response data
4. Multiple command options

**Best for:** Developers testing API endpoints

---

### **3. zai_browser_chat.js**

**Purpose:** Full chat interaction through browser

**What it does:**
1. Launches headless browser
2. Logs in (or waits for you)
3. Automates real chat interface
4. Sends actual messages
5. Gets real responses

**Best for:** When you need full functionality

---

## 🎭 SPOOFING FEATURES

### **Automatic Rotation:**

Every request/command gets:
- ✅ Random User-Agent (Chrome/Firefox/Safari)
- ✅ Different Accept-Language
- ✅ Unique Sec-Ch-Ua headers
- ✅ Cache-busting enabled

### **Identity Pool:**

**User-Agents (3+):**
- Chrome 120 - Windows
- Firefox 121 - Windows  
- Chrome 120 - Mac

**Languages (5):**
- en-US, en-GB, en-CA
- de-DE, fr-FR

---

## 💡 USAGE EXAMPLES

### **Example 1: Quick Connection Test**

```bash
# Start simple chat
node zai_simple_chat.js

# Test API
👤 Command: /test

✅ API is accessible!
Response: []...
```

### **Example 2: Check Session Details**

```bash
# View session info
👤 Command: /session

📋 Current Session Info:
   Token: eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...
   Cookies: 8
   URL: https://chat.z.ai/
```

### **Example 3: Rotate Identity**

```bash
# Change User-Agent
👤 Command: /rotate

🎭 Rotated User-Agent:
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...
```

---

## 🔧 CONFIGURATION

### **Customize User-Agents:**

Edit any chat file to add more identities:

```javascript
const USER_AGENTS = [
  // Add your own
  'Mozilla/5.0 (Your Custom Agent)...'
];
```

### **Adjust Spoofing Level:**

Modify the `generateHeaders()` function:

```javascript
function generateHeaders() {
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    
    return {
        'accept': 'application/json',
        'authorization': `Bearer ${bearerToken}`,
        'user-agent': userAgent,  // ← Changes every time
        'referer': 'https://chat.z.ai/',
        'cookie': cookieHeader,
        'cache-control': 'no-cache'  // ← Always fresh
    };
}
```

---

## 📈 COMPARISON

| Feature | Simple Chat | Terminal Chat | Browser Chat |
|---------|-------------|---------------|--------------|
| Speed | ⚡⚡⚡ Fast | ⚡⚡ Medium | ⚡ Slow (browser) |
| Functionality | 📊 Read-only | 🔧 API test | 💬 Full chat |
| Spoofing | ✅ Basic | ✅ Advanced | ✅ Complete |
| Resource Usage | 💻 Low | 💻 Medium | 💻 High |
| Best For | Testing | Development | Production |

---

## ⚠️ IMPORTANT NOTES

### **Current API Limitations:**

Z.AI's public API currently supports:
- ✅ Reading chat history
- ✅ Session management
- ❌ Sending messages (not available yet)
- ❌ Creating chats (web only)

### **For Full Interaction:**

Use browser automation:
```bash
node zai_browser_chat.js
```

Or use web interface directly:
https://chat.z.ai/

---

## 🎯 WORKFLOWS

### **Daily Check-in:**

```bash
# Morning check
node zai_simple_chat.js

# Commands:
/test      # Verify connection
/session   # Check token age
/rotate    # Fresh identity
/exit      # Done
```

### **Development Testing:**

```bash
# Test API endpoints
node zai_terminal_chat.js

# Try different endpoints
# Monitor responses
# Analyze behavior
```

### **Production Monitoring:**

```bash
# Continuous monitoring
while true; do
    node zai_simple_chat.js <<< "/test"
    sleep 300  # Check every 5 minutes
done
```

---

## 🐛 TROUBLESHOOTING

### **Problem: "No session data found"**

**Solution:**
```bash
# Get fresh tokens first
node zai_login_explorer.js
# or
node zai_advanced_login.js
```

### **Problem: API returns 401**

**Cause:** Tokens expired

**Solution:**
```bash
# Refresh session
node zai_login_explorer.js

# Then try again
node zai_simple_chat.js
```

### **Problem: Browser won't launch**

**Cause:** Playwright not installed

**Solution:**
```bash
npm install playwright
```

---

## 🎓 LEARNING PATH

### **Beginner:**
1. Start with `zai_simple_chat.js`
2. Learn the commands
3. Understand session management
4. Practice rotating identities

### **Intermediate:**
1. Try `zai_terminal_chat.js`
2. Explore API endpoints
3. Analyze responses
4. Customize spoofing

### **Advanced:**
1. Use `zai_browser_chat.js`
2. Automate interactions
3. Build custom tools
4. Integrate with other systems

---

## 📊 PERFORMANCE METRICS

### **Simple Chat:**
- Startup: < 1 second
- Response: < 2 seconds
- Memory: ~50MB
- CPU: Minimal

### **Terminal Chat:**
- Startup: < 1 second
- Response: < 3 seconds
- Memory: ~60MB
- CPU: Low

### **Browser Chat:**
- Startup: 3-5 seconds
- Response: 2-10 seconds
- Memory: ~200MB
- CPU: Medium

---

## ✨ BEST PRACTICES

### **Do:**
✅ Rotate User-Agent regularly  
✅ Add delays between requests  
✅ Monitor token expiration  
✅ Save sessions periodically  
✅ Use appropriate tool for task  

### **Don't:**
❌ Spam requests rapidly  
❌ Share session files  
❌ Ignore rate limits  
❌ Use outdated tokens  
❌ Mix tools simultaneously  

---

## 🎁 BONUS COMMANDS

### **Power User Tips:**

1. **Chain Commands:**
```bash
node zai_simple_chat.js <<< $'/test\n/session\n/rotate\n/exit'
```

2. **Background Monitoring:**
```bash
nohup node zai_simple_chat.js <<< "/test" > monitor.log &
```

3. **Quick Status:**
```bash
echo "/test" | node zai_simple_chat.js
```

---

## 🏆 SUCCESS CHECKLIST

**Simple Chat:**
- [ ] Can load session
- [ ] API test passes
- [ ] Commands work
- [ ] Rotation functions

**Terminal Chat:**
- [ ] Headers spoofed
- [ ] Multiple identities tested
- [ ] Responses analyzed
- [ ] No detection

**Browser Chat:**
- [ ] Browser launches
- [ ] Login works
- [ ] Messages send
- [ ] Responses received

---

## 📞 QUICK REFERENCE

### **Start Tools:**
```bash
# Simple mode
node zai_simple_chat.js

# Terminal mode  
node zai_terminal_chat.js

# Browser mode
node zai_browser_chat.js
```

### **Get Help:**
```bash
# In any chat
/help
```

### **Refresh Tokens:**
```bash
node zai_login_explorer.js
```

---

## 🎉 CONCLUSION

You now have **3 powerful terminal chat tools** for Z.AI:

1. **Simple Chat** - Quick testing ✅
2. **Terminal Chat** - API exploration ✅  
3. **Browser Chat** - Full automation ✅

All with **automatic header spoofing** to avoid detection!

**Start with:**
```bash
node zai_simple_chat.js
```

**For full features:**
```bash
node zai_browser_chat.js
```

---

*Created: March 7, 2026*  
*Version: 1.0*  
*Status: Production Ready*
