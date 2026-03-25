# 🤖 Z.AI API TOOLS - Complete Toolkit

## 📚 OVERVIEW

This toolkit provides everything you need to work with Z.ai's API, from authentication to monitoring.

---

## 🚀 QUICK START (3 Steps)

### Step 1: Get Fresh Tokens (Do this first!)
```bash
node zai_login_explorer.js
```
- Opens browser automatically
- Logs you into chat.z.ai
- Extracts fresh session tokens
- Saves credentials for use

### Step 2: Test Connection
```bash
node test_zai_with_session.js
```
- Validates your session
- Tests API access
- Shows token status

### Step 3: Explore Features
```bash
node zai_feature_explorer.js
```
- Discovers all available endpoints
- Tests each one systematically
- Provides detailed report

---

## 🛠️ TOOL REFERENCE

### 1. 🔐 zai_login_explorer.js
**Purpose:** Login and get fresh authentication tokens

**What it does:**
- Opens Chrome browser
- Waits for you to log in
- Extracts cookies & localStorage
- Saves to `universal-ai-proxy/zai-session.json`
- Tests basic endpoints immediately

**When to use:**
- First time setup
- Every 2-3 hours (token refresh)
- When you see 401/403 errors

**Output:** Updates session file with fresh tokens

---

### 2. ✅ test_zai_with_session.js
**Purpose:** Quick connection test

**What it does:**
- Loads saved session
- Makes test API call
- Reports success/failure
- Shows token details

**When to use:**
- Before starting development
- To verify tokens are valid
- Quick health check

**Output:** Pass/Fail result with details

---

### 3. 🔍 zai_feature_explorer.js
**Purpose:** Discover and test all API features

**What it does:**
- Tests multiple endpoints
- Pages through chat lists
- Analyzes responses
- Saves results to JSON

**When to use:**
- Exploring API capabilities
- After getting new tokens
- Understanding what's possible

**Output:** Detailed feature report + JSON file

---

### 4. 👁️ zai_chat_monitor.js
**Purpose:** Real-time monitoring of your Z.ai account

**What it does:**
- Checks every 5 seconds
- Detects new chats
- Shows timestamps
- Runs for 2.5 minutes (or until Ctrl+C)

**When to use:**
- Watching for new conversations
- Testing chat creation
- Monitoring account activity

**Output:** Live updates in terminal

---

## 📁 FILES EXPLAINED

### Your Session Data
**Location:** `universal-ai-proxy/zai-session.json`

Contains:
- JWT authentication token
- 8 session cookies
- LocalStorage data
- Timestamp

**Important:** This file expires every 2-3 hours!

---

### Test Results
**Location:** `universal-ai-proxy/zai-feature-results.json`

Contains:
- All tested endpoints
- Success/failure status
- Response previews
- Error messages

---

### Documentation Files

| File | Content |
|------|---------|
| `ZAI_COMPLETE_GUIDE.md` | Full API analysis & documentation |
| `ZAI_WORKFLOW_SUMMARY.md` | Quick reference & workflows |
| `ZAI_TOOLS_README.md` | This file - tool overview |

---

## ⚡ COMMON WORKFLOWS

### Morning Setup (Fresh Start)
```bash
# 1. Get fresh tokens (valid for ~2-3 hours)
node zai_login_explorer.js

# 2. Verify connection works
node test_zai_with_session.js

# 3. Check what features are available
node zai_feature_explorer.js
```

### During Development
```bash
# Quick validation before testing
node test_zai_with_session.js
```

### Monitoring Activity
```bash
# Watch for changes in real-time
node zai_chat_monitor.js
# Press Ctrl+C to stop early
```

### Token Refresh (Every 2-3 Hours)
```bash
# When tokens expire, just run:
node zai_login_explorer.js
```

---

## 🎯 WHAT EACH TOOL SHOWS YOU

### Login Explorer Output:
```
✅ Login detected!
💾 Extracting session data...
📋 Session Details:
   Cookies: 8
   LocalStorage Items: 7
   Token: eyJhbGci...
🧪 Testing API Endpoints...
```

### Feature Explorer Output:
```
✅ CONFIRMED WORKING ENDPOINTS:
  1. Chats Page 1
     URL: https://chat.z.ai/api/v1/chats/?page=1
     Status: 200

  2. Chats Page 2
     URL: https://chat.z.ai/api/v1/chats/?page=2
     Status: 200
```

### Chat Monitor Output:
```
[1:23:45 PM] ✅ No changes (0 chats)
[1:23:50 PM] 🔄 CHANGE DETECTED!
   Previous: 0 chats
   Current: 1 chats
   
   Latest chats:
   1. My Conversation (abc-123)
```

---

## ⚠️ IMPORTANT NOTES

### Token Lifespan
- **Duration:** 2-4 hours typically
- **Signs of Expiry:** 401 Unauthorized, 403 Forbidden
- **Solution:** Run `zai_login_explorer.js` again

### Rate Limits
- **Unknown:** Z.ai hasn't published rate limits
- **Recommendation:** Test carefully, don't spam requests

### Best Practices
1. Always start with fresh tokens
2. Test before heavy usage
3. Monitor token age during long sessions
4. Keep session file private (contains credentials)

---

## 🔧 TROUBLESHOOTING

### Problem: "No session data found"
**Solution:** Run `zai_login_explorer.js` to get tokens

### Problem: "401 Unauthorized"
**Solution:** Tokens expired - run `zai_login_explorer.js`

### Problem: "403 Forbidden"
**Solution:** Some endpoints require different auth or aren't accessible

### Problem: Browser won't open
**Solution:** Make sure Playwright is installed:
```bash
npm install playwright
```

---

## 📊 CAPABILITIES SUMMARY

### What You CAN Do:
✅ View chat history  
✅ Monitor account activity  
✅ Validate sessions programmatically  
✅ Extract credentials for automation  
✅ Track conversation metadata  

### What You CAN'T Do (Yet):
❌ Send messages via API  
❌ Get list of available models  
❌ Create/delete chats via API  
❌ Access user profile/settings  

---

## 🎓 LEARNING RESOURCES

### For Beginners:
1. Start with `test_zai_with_session.js` - simplest tool
2. Read `ZAI_COMPLETE_GUIDE.md` - understand the API
3. Try `zai_feature_explorer.js` - see what's possible

### For Advanced Users:
1. Study `zai_login_explorer.js` - learn session extraction
2. Check `universal-ai-proxy/zai-session.json` - understand auth structure
3. Build your own tools using the patterns shown

---

## 🚀 NEXT LEVEL OPTIONS

### Want More Features?

**Option 1: Network Analysis**
- Open chat.z.ai in browser
- Press F12 → Network tab
- Send a message
- Look for API calls in network traffic
- Discover hidden endpoints

**Option 2: UI Automation**
```javascript
// Use Playwright to automate the web interface
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://chat.z.ai/');
// Automate interactions...
```

**Option 3: Try Alternative APIs**
You have other working APIs:
- NVIDIA (full-featured)
- AICC (multiple GPT-4 variants)
- Nano-GPT (pay-per-use)

---

## 🏆 SUCCESS CHECKLIST

- [ ] Logged in successfully
- [ ] Got fresh tokens
- [ ] Tested connection
- [ ] Explored features
- [ ] Understood limitations
- [ ] Know how to refresh tokens
- [ ] Can monitor activity
- [ ] Read the documentation

---

## 📞 QUICK COMMAND CHEAT SHEET

```bash
# Get tokens (do first, then every 2-3 hours)
node zai_login_explorer.js

# Test connection
node test_zai_with_session.js

# Explore features
node zai_feature_explorer.js

# Monitor in real-time
node zai_chat_monitor.js

# Check session file manually
cat universal-ai-proxy/zai-session.json
```

---

## 🎉 FINAL THOUGHTS

You now have a complete Z.ai API toolkit! 

**Key Takeaways:**
- Authentication works but requires frequent refresh
- Limited API compared to alternatives
- Great for learning and experimentation
- Best combined with other AI APIs

**Recommended Workflow:**
1. Use Z.ai for testing/learning
2. Use NVIDIA/AICC for production
3. Refresh tokens proactively
4. Monitor your usage

---

*Toolkit Version: 1.0*  
*Created: March 7, 2026*  
*Last Updated: March 7, 2026*
