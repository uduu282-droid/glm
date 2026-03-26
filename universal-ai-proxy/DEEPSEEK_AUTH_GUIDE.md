# DeepSeek Authentication Flow Guide

Based on network traffic analysis from `chat.deepseek.com`

## 📡 Captured API Endpoints

### Authentication Flow

```
1. Guest Challenge (Optional)
   POST https://chat.deepseek.com/api/v0/users/create_guest_challenge

2. Email Verification
   POST https://chat.deepseek.com/api/v0/users/create_email_verification_code
   POST https://chat.deepseek.com/api/v0/users/check_email_code

3. Registration/Login
   POST https://chat.deepseek.com/api/v0/users/register
   POST https://chat.deepseek.com/api/v0/users/login
   POST https://chat.deepseek.com/api/v0/users/email_reset_password

4. Session Management
   GET  https://chat.deepseek.com/api/v0/client/settings?did={DEVICE_ID}
   GET  https://chat.deepseek.com/api/v0/client/settings?did=&scope=banner
   
5. Chat Operations
   GET  https://chat.deepseek.com/api/v0/chat_session/fetch_page?lte_cursor.pinned=false
   POST https://chat.deepseek.com/api/v0/chat_session/create
   POST https://chat.deepseek.com/api/v0/chat/create_pow_challenge
   POST https://chat.deepseek.com/api/v0/chat/completion
```

## 🔐 Key Components

### Device ID (DID)
- Format: UUID v4
- Example: `d827459b-8988-4a59-9688-34fdcaf0fdf6`
- Used in client settings requests
- Stored in session data

### PoW (Proof of Work) Challenge
- Required before sending chat completion requests
- Generated via: `/api/v0/chat/create_pow_challenge`
- Uses WASM for computation (`sha3_wasm_bg.7b9ca65ddd.wasm`)
- Must be solved and included in chat completion request

### Session Tokens
- Stored in cookies and localStorage
- Extracted after successful login
- Used to authenticate subsequent API requests

## 🚀 Implementation Steps

### 1. Login Process

```javascript
// Use the automated login script
node login-deepseek.js
```

This will:
- Navigate to chat.deepseek.com
- Handle guest challenge if present
- Fill email/password form
- Wait for authentication
- Extract session cookies and tokens
- Save session data

### 2. Start Proxy

```bash
# Start with saved session
node start-deepseek.js
```

The proxy will:
- Load saved session from `sessions/deepseek_session.json`
- Restore cookies and localStorage
- Handle PoW challenges automatically
- Forward requests to DeepSeek API

### 3. Test API

```bash
# Health check
curl http://localhost:8787/health

# Chat completion
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## 📋 Network Analysis Details

### Request Patterns

**Client Settings** (Multiple calls)
```http
GET /api/v0/client/settings?did={DID}
GET /api/v0/client/settings?did=&scope=banner
```

**Guest Flow** (If not logged in)
```http
POST /api/v0/users/create_guest_challenge
→ Returns challenge for guest access
```

**Email Verification**
```http
POST /api/v0/users/create_email_verification_code
→ Sends verification code to email

POST /api/v0/users/check_email_code
→ Verifies the code
```

**Login/Register**
```http
POST /api/v0/users/register
→ Creates new account

POST /api/v0/users/login
→ Authenticates existing user
```

**Chat Session**
```http
GET /api/v0/chat_session/fetch_page?lte_cursor.pinned=false
→ Retrieves chat history

POST /api/v0/chat_session/create
→ Creates new chat session
```

**PoW Challenge** (Before chat)
```http
POST /api/v0/chat/create_pow_challenge
→ Returns PoW challenge data
→ Client must solve using WASM
```

**Chat Completion**
```http
POST /api/v0/chat/completion
→ Sends messages array
→ Includes solved PoW
→ Returns streaming response
```

## 🔧 Configuration Files

### Session Data Structure

```json
{
  "url": "https://chat.deepseek.com",
  "timestamp": 1234567890,
  "cookies": [
    {
      "name": "session_token",
      "value": "...",
      "domain": ".deepseek.com",
      "path": "/",
      "expires": 1234567890
    }
  ],
  "localStorage": {
    "device_id": "d827459b-8988-4a59-9688-34fdcaf0fdf6",
    "pow_challenge": "...",
    "session_id": "..."
  },
  "credentials": {
    "email": "user@example.com",
    "password": "***"
  },
  "sessionId": "...",
  "powChallenge": {...}
}
```

## ⚠️ Important Notes

### Rate Limiting
- DeepSeek may implement rate limits
- Monitor response headers for limit info
- Implement exponential backoff if needed

### Anti-Bot Measures
- Uses WASM for PoW calculations
- May have captcha during login
- Browser automation detection possible

### Session Expiry
- Sessions expire after certain period
- Auto-refresh mechanism recommended
- Re-login when authentication fails

### PoW Challenge
- Required for each chat session
- Computationally intensive (uses WASM)
- Must be solved before sending messages
- Solution must be included in completion request

## 🛠️ Troubleshooting

### Login Fails
1. Check credentials are correct
2. Verify email is registered
3. Look for captcha requirements
4. Check for 2FA requirements

### Chat Completion Fails
1. Verify session is still valid
2. Check if PoW challenge was solved
3. Ensure proper request format
4. Inspect network errors

### Session Expired
1. Run `node login-deepseek.js` again
2. Or use auto-refresh if implemented
3. Check token expiry times

## 📊 Testing Commands

```bash
# Test login flow
node login-deepseek.js

# Start proxy
node start-deepseek.js

# Test with different models
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-coder",
    "messages": [{"role": "user", "content": "Write a Python function"}]
  }'

# Check session status
curl http://localhost:8787/session
```

## 🔍 Network Monitoring

To capture your own network traffic:

```javascript
// Use Playwright to monitor network
import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

// Capture all requests
context.on('request', request => {
  console.log('>>>', request.method(), request.url());
});

await page.goto('https://chat.deepseek.com');
```

## 📚 Related Files

- `src/deepseek-auth.js` - Authentication manager
- `login-deepseek.js` - Login script
- `start-deepseek.js` - Proxy starter
- `src/network-analyzer.js` - Network traffic analyzer
- `sessions/deepseek_session.json` - Saved session data

---

**Last Updated**: Based on network capture from chat.deepseek.com  
**Status**: ✅ Working with email/password authentication
