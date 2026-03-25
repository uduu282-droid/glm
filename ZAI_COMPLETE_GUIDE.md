# 🎉 Z.AI API Complete Analysis & Features Guide

## ✅ WHAT'S WORKING

### **Confirmed Working Endpoint**
```
GET https://chat.z.ai/api/v1/chats/?page={pageNumber}
```

**Authentication Required:**
- Bearer Token (from localStorage.token)
- Session Cookies (8 cookies required)
- User-Agent header
- Referer header

**Response Format:**
```json
[]
```
Returns an array of chat conversations (currently empty for new accounts)

---

## 🔐 AUTHENTICATION STRUCTURE

### Required Components:

1. **Bearer Token** (JWT)
   - Location: `localStorage.token`
   - Format: `eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Used in: `Authorization: Bearer {token}`

2. **Session Cookies:**
   - `cdn_sec_tc` - CDN security token
   - `acw_tc` - Traffic control token
   - `token` - Authentication token (same as localStorage)
   - `ssxmod_itna` - Session tracking
   - `ssxmod_itna2` - Secondary session tracking
   - `_ga`, `_gcl_au`, `_ga_Z8QTHYBHP3` - Analytics cookies

3. **Required Headers:**
   ```javascript
   {
     'accept': 'application/json',
     'authorization': 'Bearer {token}',
     'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
     'referer': 'https://chat.z.ai/',
     'cookie': '{all_cookies_joined}'
   }
   ```

---

## ❌ ENDPOINTS THAT DON'T WORK

### Tested but Failed:

1. **Get Models** - `GET /api/v1/models`
   - Status: 403 Forbidden
   - Error: "Not authenticated"
   - Note: Even with valid tokens, this endpoint is not accessible

2. **User Profile** - `GET /api/v1/user/profile`
   - Status: 404 Not Found
   - Note: Endpoint doesn't exist or uses different path

3. **User Settings** - `GET /api/v1/user/settings`
   - Status: 404 Not Found
   - Note: Endpoint doesn't exist or uses different path

4. **Chat Completions** - `POST /api/v1/chat/completions`
   - Status: 404 Not Found
   - Note: OpenAI-compatible endpoint not available

5. **Create Chat** - `POST /api/v1/chats`
   - Status: Error
   - Note: Chat creation may only work through web interface

---

## 🛠️ AVAILABLE TOOLS

### 1. **Login Explorer** (`zai_login_explorer.js`)
- Opens browser for login
- Automatically extracts fresh session data
- Saves to `universal-ai-proxy/zai-session.json`
- Tests basic endpoints
- Expires in ~2 hours

**Usage:**
```bash
node zai_login_explorer.js
```

### 2. **Session Tester** (`test_zai_with_session.js`)
- Uses saved session data
- Tests the chats endpoint
- Validates authentication
- Quick status check

**Usage:**
```bash
node test_zai_with_session.js
```

### 3. **Feature Explorer** (`zai_feature_explorer.js`)
- Comprehensive endpoint testing
- Tests multiple pages
- Provides detailed analysis
- Saves results to JSON

**Usage:**
```bash
node zai_feature_explorer.js
```

---

## 📁 SESSION DATA LOCATION

**File:** `universal-ai-proxy/zai-session.json`

**Structure:**
```json
{
  "cookies": [ /* 8 cookie objects */ ],
  "localStorage": {
    "token": "eyJhbGci...",
    "_arms_uid": "uid_...",
    "locale": "en-US",
    "theme": "light"
  },
  "url": "https://chat.z.ai/",
  "timestamp": 1772889116626
}
```

---

## 🔄 TOKEN REFRESH STRATEGY

### When Tokens Expire:

1. **Signs of Expiration:**
   - Status 401 Unauthorized
   - Status 403 Forbidden
   - Empty responses when previously working

2. **How to Refresh:**
   ```bash
   node zai_login_explorer.js
   ```
   This will:
   - Open browser
   - Let you log in fresh
   - Extract new tokens
   - Save automatically

3. **Token Lifespan:**
   - Session cookies: ~2-4 hours
   - JWT token: May last longer
   - Best practice: Refresh every 2 hours for active use

---

## 💡 PRACTICAL USE CASES

### What You CAN Do:

1. **Monitor Chat History**
   - Check existing conversations
   - Track chat count
   - View chat metadata

2. **Session Management**
   - Validate active sessions
   - Extract credentials programmatically
   - Automate login workflows

3. **API Integration**
   - Use as authentication service
   - Build custom clients
   - Create monitoring tools

### What You CAN'T Do (Yet):

1. **Send Messages via API**
   - No confirmed endpoint for sending messages
   - Chat interaction only through web UI

2. **Get Model List**
   - `/api/v1/models` returns 403
   - Model info only visible in web interface

3. **Create/Delete Chats**
   - No working API endpoints found
   - Must use web interface

---

## 🔍 DISCOVERY STATUS

### Fully Analyzed:
- ✅ Authentication mechanism
- ✅ Session structure
- ✅ Chats listing endpoint
- ✅ Cookie requirements
- ✅ Header requirements

### Still Unknown:
- ❓ Message sending endpoint
- ❓ WebSocket connections (if any)
- ❓ Real-time communication protocol
- ❓ File upload endpoints
- ❓ Image generation endpoints (if available)

---

## 🚀 NEXT STEPS FOR DEEPER EXPLORATION

### 1. **Network Inspection**
Use browser DevTools → Network tab while using chat.z.ai to find:
- WebSocket connections
- Hidden API endpoints
- Message send/receive patterns
- File upload mechanisms

### 2. **Advanced Testing**
Test these potential patterns:
- `POST /api/v1/messages`
- `WebSocket wss://chat.z.ai/ws`
- `POST /api/v1/generate` (for AI responses)

### 3. **Automation Options**
Consider:
- Playwright/Puppeteer for UI automation
- Reverse engineering web traffic
- Monitoring network requests during usage

---

## 📊 COMPARISON WITH OTHER APIs

| Feature | Z.AI | DeepSeek | NVIDIA |
|---------|------|----------|--------|
| Chat API | ✅ Limited | ✅ Full | ✅ Full |
| Models API | ❌ (403) | ✅ | ✅ |
| Auth Type | JWT + Cookies | Browser Session | Bearer Token |
| Token Life | ~2-4 hours | ~1 hour | Days/Weeks |
| OpenAI Compatible | ❌ | ⚠️ Partial | ✅ |

---

## ⚠️ IMPORTANT NOTES

1. **Rate Limits:** Unknown - test carefully
2. **Terms of Service:** Check chat.z.ai ToS before production use
3. **Privacy:** Don't share your session tokens
4. **Stability:** API may change without notice
5. **Best Practice:** Use for personal projects/testing only

---

## 🎯 QUICK START GUIDE

### First Time Setup:
```bash
# 1. Login and get fresh tokens
node zai_login_explorer.js

# 2. Test the connection
node test_zai_with_session.js

# 3. Explore all features
node zai_feature_explorer.js
```

### Daily Workflow:
```bash
# Morning: Get fresh tokens
node zai_login_explorer.js

# During development: Quick test
node test_zai_with_session.js

# Before tokens expire: Refresh
node zai_login_explorer.js
```

---

## 📞 SUPPORT & RESOURCES

**Files Created:**
- `zai_login_explorer.js` - Login helper
- `test_zai_with_session.js` - Connection tester  
- `zai_feature_explorer.js` - Feature discovery
- `zai-session.json` - Your session data
- `zai-feature-results.json` - Test results

**Documentation:**
- This file (`ZAI_COMPLETE_GUIDE.md`)
- `ZAI_CHAT_API_ANALYSIS.md` - Initial analysis
- `ALL_WORKING_APIS.txt` - All your working APIs

---

## ✨ CONCLUSION

**Current Status:** ✅ PARTIALLY WORKING

**What Works:**
- Authentication system
- Chat history retrieval
- Session management

**What's Missing:**
- Message sending API
- Model information
- Advanced features

**Recommendation:**
Use Z.AI as a supplementary AI service. The API provides basic access but lacks full functionality compared to alternatives like NVIDIA or DeepSeek. Best suited for:
- Testing/experimentation
- Personal automation
- Learning API integration

For production use, consider combining with other AI APIs that offer more complete endpoints.

---

*Last Updated: March 7, 2026*
*Session Data Valid: ~2-4 hours from login*
*Guide Version: 1.0*
