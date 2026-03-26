# 🌐 Universal Chat Website Proxy - Quick Examples

## What This Does:

Instead of needing API keys, this system:
1. **Launches a real browser**
2. **Logs into chat websites** with your username/password
3. **Extracts cookies & tokens** from your session
4. **Proxies all requests** using your authenticated session
5. **Saves the session** so you don't have to login again

---

## 🚀 How To Use:

### Example 1: ChatGPT (OpenAI)

```bash
node src/index.js https://chat.openai.com
```

**What happens:**
1. Browser opens → Goes to chat.openai.com
2. Terminal asks: "Enter your email"
3. Terminal asks: "Enter your password"
4. Browser auto-fills and clicks login
5. You complete any 2FA manually in browser
6. System extracts your session cookies
7. **Proxy running at http://localhost:8787!**

Then use it:
```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4", "messages": [{"role": "user", "content": "Hello!"}]}'
```

---

### Example 2: Claude.ai

```bash
node src/index.js https://claude.ai
```

**Flow:**
1. Browser opens → claude.ai
2. Login with Google/Email
3. Extract session
4. Proxy ready!

---

### Example 3: Poe.com

```bash
node src/index.js https://poe.com
```

Login → Get access to all bots → Proxy enabled!

Use it:
```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-opus",
    "messages": [{"role": "user", "content": "Hey Poe!"}]
  }'
```

---

### Example 4: DeepSeek Chat Website

```bash
node src/index.js https://chat.deepseek.com
```

Same as above - username/password login!

---

## 📊 Session Management:

### Sessions are saved in:
```
./sessions/<website_domain>.json
```

### Reuse existing session:
```bash
node src/index.js https://chat.openai.com
# Asks: "Reuse existing session?" → Yes
# Proxy starts immediately!
```

### Clear all sessions:
```bash
node src/index.js --clear
```

### Manual refresh (when session expires):
```bash
curl -X POST http://localhost:8787/refresh
```

---

## 🎯 Real World Usage:

### Frontend Integration:

```javascript
// Your React/Vue app
async function chatWithAI(message) {
  const response = await fetch('http://localhost:8787/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'default',
      messages: [{ role: 'user', content: message }]
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// Works with ANY chat website you logged into!
```

### Python Script:

```python
import requests

response = requests.post(
    'http://localhost:8787/v1/chat/completions',
    json={
        'model': 'default',
        'messages': [{'role': 'user', 'content': 'Hello!'}]
    }
)

print(response.json()['choices'][0]['message']['content'])
```

---

## 🔥 Why This Is INSANE:

**Before:** 
- Need API key for each service
- Pay per request
- Rate limits
- Complex setup

**Now:**
- Just login to website ✅
- One command → Proxy works ✅
- Uses your existing free account ✅
- No API key needed ✅
- Works with ANY chat site ✅

---

## 💡 Pro Tips:

1. **Multiple accounts?** Run multiple instances:
   ```bash
   # Terminal 1: Your ChatGPT
   node src/index.js https://chat.openai.com --port 8787
   
   # Terminal 2: Friend's ChatGPT  
   node src/index.js https://chat.openai.com --port 8788
   ```

2. **Session expired?** Just run `--refresh` or restart

3. **Custom selectors for weird login forms:**
   ```bash
   node src/index.js https://weird-site.com
   # Say "yes" to custom selectors
   # Provide CSS selectors for their form
   ```

---

## ⚠️ Important Notes:

- Sessions expire (hours to days depending on site)
- When expired, just re-run the command
- Your credentials are stored locally only
- Never shared or sent anywhere except the chat website

---

## 🎊 YOU NOW HAVE:

A **universal proxy** that works with **ANY chat website**!

Just provide:
1. Website URL
2. Your username/password
3. Done! 🚀

No API keys, no payments, no BS!

---

Made with ❤️ for unlimited AI access!
