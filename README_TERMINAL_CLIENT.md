# 🤖 Free AI Chat - Terminal Client & API Analyzer

Reverse-engineered terminal client for https://free-aichat.vercel.app/ that allows you to chat with **Gemini** and **Groq** AI models directly from your command line.

---

## 🚀 Quick Start (3 Steps)

### 1️⃣ Capture the API Call
```bash
# Open browser → https://free-aichat.vercel.app/
# Press F12→ Network tab → Send message
# Right-click POST request → Copy → Copy as cURL
# Paste into captured_request.txt
```

### 2️⃣ Analyze & Configure
```bash
node analyze_and_test.js
```

### 3️⃣ Start Chatting!
```bash
node terminal_client.js
```

**That's it!** You're now chatting with AI from your terminal! 🎉

---

## 📁 What Each File Does

| File | Purpose |
|------|---------|
| **`terminal_client.js`** | 🎮 Main chat client - run this to start chatting |
| **`analyze_and_test.js`** | 🔍 Analyzes captured requests and tests API |
| **`captured_request.txt`** | 📋 Paste your cURL command here |
| **`api_config.json`** | ⚙️ Auto-generated API configuration |
| **`SETUP_GUIDE.md`** | 📖 Detailed setup instructions |
| **`QUICK_START.md`** | ⚡ Quick 3-step guide |
| **`CAPTURE_API_CALLS_GUIDE.md`** | 📸 How to capture API calls |
| **`FREE_AICHAT_ANALYSIS_REPORT.md`** | 📊 Technical analysis report|

---

## 🎯 Features

✅ **Full Terminal Chat Interface**
- Interactive messaging
- Message history tracking
- Save conversations to files
- Clear chat functionality

✅ **Model Support**
- Works with Gemini (Google)
- Works with Groq (Llama, Mixtral, etc.)
- Easy model switching

✅ **Smart Analysis**
- Automatic cURL parsing
- API endpoint detection
- Response format analysis
- Error handling and diagnostics

✅ **Conversation Management**
- View chat history
- Export conversations
- Session persistence
- Multiple config support

---

## 🛠️ Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- Modern web browser (Chrome/Edge recommended)

### Setup
```bash
# No installation needed! Just clone or download these files.
# The scripts use built-in Node.js modules + node-fetch

# If you need to install node-fetch (usually not necessary):
npm install node-fetch
```

---

## 📖 Detailed Usage

### Step 1: Capture API Request

**Why?** The website uses Next.js Server Actions with dynamic tokens that expire quickly. We need fresh tokens.

**How:**
1. Open https://free-aichat.vercel.app/ in browser
2. Press `F12` to open DevTools
3. Click "Network" tab
4. Check "Preserve log" checkbox
5. Type "Hello test" in chat box and send
6. Look for new POST request in Network tab
7. Right-click → Copy → Copy as cURL
8. Paste into `captured_request.txt`
9. Save file

**What we're capturing:**
- URL endpoint
- Next-Action token (critical!)
- Next-Router-State-Tree
- All required headers
- Request body format

---

### Step 2: Analyze Configuration

**Run analyzer:**
```bash
node analyze_and_test.js
```

**What it does:**
1. Reads `captured_request.txt`
2. Parses cURL command automatically
3. Extracts URL, headers, body
4. Tests the API endpoint
5. Creates `api_config.json`
6. Saves test response to `test_response.txt`

**Success looks like:**
```
✅ SUCCESS! API is working!
📊 Response Status: 200 OK
⏱️  Response Time: 1234ms
```

**If it fails:**
- Tokens expired → Recapture (Step 1)
- Missing headers → Make sure you copied ALL headers
- Wrong format → Check captured_request.txt format

---

### Step 3: Terminal Chat

**Start chatting:**
```bash
node terminal_client.js
```

**You'll see:**
```
🤖 Free AI Chat Terminal Client
============================================================
✅ Loaded configuration from api_config.json

🎯 Target: https://free-aichat.vercel.app/
Model: Gemini/Groq (via Next.js Action)

💡 Type your messages below. Type "quit" to exit.
------------------------------------------------------------

🎮 Ready to chat! (type "help" for commands)

> 
```

**Just type and press Enter!**

---

## 🎮 Terminal Commands

While chatting, you can use these commands:

| Command | Description | Example |
|---------|-------------|---------|
| `help` | Show all available commands | `help` |
| `clear` | Clear conversation history | `clear` |
| `history` | Display recent messages | `history` |
| `save` | Save chat to timestamped file | `save` |
| `model` | Check current model | `model` |
| `quit` / `exit` | Exit the program | `quit` |

**Regular messages:**
Just type naturally - anything that's not a command gets sent to the AI!

---

## 💡 Pro Tips

### 1. Fresh Tokens Are Critical
Next.js action tokens expire quickly (minutes!). If you get errors:
```bash
# Recapture:
# 1. Go back to browser
# 2. Send another message  
# 3. Copy as cURL again
# 4. Update captured_request.txt
# 5. Run: node analyze_and_test.js
```

### 2. Model Switching
To switch between Gemini and Groq:
```bash
# On website:
1. Change model dropdown
2. Send message
3. Capture that specific request
4. Note differences in headers/body
```

### 3. Keep Multiple Configs
For different models, keep separate configs:
```bash
config_gemini.json    # Gemini-specific config
config_groq.json      # Groq-specific config
api_config.json       # Active config (copy what you need)
```

### 4. Long Conversations
Save important chats periodically:
```bash
> save
✅ Chat saved to chat_1710076800000.txt
```

### 5. Debugging Responses
Check `test_response.txt` to see raw API responses and understand the format.

---

## 🔧 Troubleshooting

### ❌ "No API configuration found!"

**Cause:** Missing `api_config.json`

**Fix:**
```bash
# Make sure you completed all steps:
1. ✅ Captured request → captured_request.txt
2. ✅ Ran analyzer → node analyze_and_test.js
3. ✅ Got "SUCCESS" message
```

---

### ❌ "Status 500" or "Request failed"

**Cause:** Expired or invalid tokens

**Fix:**
```bash
# Tokens expire quickly! Recapture:
1. Browser → https://free-aichat.vercel.app/
2. F12→ Network tab
3. Send NEW message
4. Copy NEW POST request as cURL
5. Update captured_request.txt
6. Run: node analyze_and_test.js
```

---

### ❌ Can't parse response

**Cause:** React Server Component format is complex

**What's happening:**
The API returns`text/x-component` format, not plain JSON. The client tries to extract readable text but may need adjustments.

**Check:**
```bash
# Look at raw response
cat test_response.txt

# Or check terminal output for"Response Preview"
```

---

### ❌ "Command not found: node"

**Cause:** Node.js not installed

**Fix:**
```bash
# Install Node.js from:
https://nodejs.org/

# Verify installation:
node --version   # Should show v16+ 
npm --version    # Should show version number
```

---

### ❌ Response is gibberish/encoded

**Cause:** RSC (React Server Component) encoding

**Understanding the format:**
```javascript
// Typical RSC response looks like:
0:{...}
1:["some","data",...]
// It's a component tree, not direct text
```

**What we do:**
- Try to extract text content
- Look for patterns like `"f":"message"`
- Parse if it's valid JSON

---

## 📊 Understanding the API

### What We Discovered

**Website:** https://free-aichat.vercel.app/

**Technology:**
- Next.js with React Server Components
- Vercel hosting
- Server Actions for chat endpoints

**Models Available:**
1. **Gemini** - Google's advanced LLM
2. **Groq** - Platform running open models (Llama 3, Mixtral, etc.)

**Request Format:**
```http
POST /
Accept: text/x-component
Next-Action: <dynamic-token>
Next-Router-State-Tree: <encoded-state>
Content-Type: text/plain;charset=UTF-8

<message-data>
```

**Response Format:**
- Content-Type: `text/x-component`
- React Server Component stream
- Contains AI response encoded as component tree

---

## 🚨 Important Notes

### ⚠️ This is Reverse Engineering

**What this means:**
- NOT an official API
- Structure can change anytime
- No guarantees of stability
- For educational/personal use only

**For production, use official APIs:**
- **Gemini**: https://makersuite.google.com/app/apikey
- **Groq**: https://console.groq.com/keys

---

### ⚠️ Rate Limits & Etiquette

**Be respectful:**
- Don't spam requests
- Respect free service limitations
- Monitor your usage
- Consider getting official API keys for heavy use

---

### ⚠️ Security

**What we're NOT doing:**
- Stealing credentials
- Bypassing authentication
- Circumventing paid features

**What we ARE doing:**
- Automating what you could do manually in browser
- Using the same endpoints the website uses
- Educational reverse engineering

---

## 📈 Advanced Usage

### Custom Request Formatting

If default parsing doesn't work, manually edit `api_config.json`:

```json
{
  "url": "https://free-aichat.vercel.app/",
  "method": "POST",
  "headers": {
    "accept": "text/x-component",
    "content-type": "text/plain;charset=UTF-8",
    "next-action": "YOUR_ACTION_ID",
    "next-router-state-tree": "YOUR_STATE_TREE",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
  },
  "body": "{\"0\":\"your-message\"}"
}
```

**Key fields:**
- `next-action` - Most critical, changes frequently
- `next-router-state-tree` - Navigation context
- `body` - Your message format

---

### Building Your Own Client

Use `api_config.json` as base for custom implementations:

**Python example:**
```python
import json
import requests

with open('api_config.json') as f:
   config = json.load(f)

response = requests.post(
   config['url'],
   headers=config['headers'],
    data=config['body']
)

print(response.text)
```

**cURL example:**
```bash
curl -X POST "$(jq -r '.url' api_config.json)" \
  -H "$(jq -r '.headers[]' api_config.json)" \
  -d '{"0":"Hello!"}'
```

---

## 📚 Additional Resources

- **SETUP_GUIDE.md** - Detailed setup walkthrough
- **QUICK_START.md** - 3-step quick guide
- **CAPTURE_API_CALLS_GUIDE.md** - How to capture requests
- **FREE_AICHAT_ANALYSIS_REPORT.md** - Technical analysis

---

## 🎉 Success Indicators

You know it's working when you see:

```
🤖 Free AI Chat Terminal Client
============================================================
✅ Loaded configuration from api_config.json

🎯 Target: https://free-aichat.vercel.app/
Model: Gemini/Groq (via Next.js Action)

💡 Type your messages below. Type "quit" to exit.
------------------------------------------------------------

🎮 Ready to chat! (type "help" for commands)

> Hello!
⏳ Sending...

📊 Response Status: 200 OK
⏱️  Response Time: 892ms
Content-Type: text/x-component

✅ Response received!

🤖 AI Response:
------------------------------------------------------------
Hello! How can I assist you today?
------------------------------------------------------------

> 
```

---

## 🆘 Still Need Help?

1. **Re-read QUICK_START.md** - Follow the 3 steps exactly
2. **Check SETUP_GUIDE.md** - More detailed troubleshooting
3. **Recapture everything** - Fresh tokens solve 90% of issues
4. **Verify Node.js** - Make sure it's installed and working
5. **Check file permissions** - Make sure files are readable

---

## 🎯 Project Status

✅ **Completed:**
- API endpoint discovery
- Request/response analysis
- Terminal client implementation
- Automatic configuration parser
- Error handling and diagnostics
- Conversation management features

🔄 **In Progress:**
- Testing with both Gemini and Groq models
- Improved RSC response parsing
- Session persistence improvements

---

## 📝 License & Disclaimer

**Educational purposes only.** This project demonstrates:
- Web API reverse engineering techniques
- Next.js Server Actions mechanics
- Terminal-based UI development

**Not affiliated with:**
- Free AI Chat website
- Google (Gemini)
- Groq

**Use responsibly and ethically.**

---

## 🙏 Credits

Created as an educational project to demonstrate:
- API reverse engineering
- Next.js internals understanding
- Terminal application development

**Website analyzed:** https://free-aichat.vercel.app/  
**Creator:** M-Arham07 (GitHub)

---

## 📞 Support

If you find bugs or have suggestions:
- Check existing documentation first
- Try troubleshooting steps
- Experiment with configurations
- Share findings with community

---

**Happy Terminal Chatting! 🎊**

*Last Updated: March 10, 2026*
