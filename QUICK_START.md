# ⚡ Quick Start - 3 Steps to Terminal Chat

## 🎯 Goal: Get chatting in the terminal with Free AI Chat

---

## Step 1️⃣: Capture (2 minutes)

### Open Browser & DevTools
```
1. Go to: https://free-aichat.vercel.app/
2. Press: F12 (opens Developer Tools)
3. Click: "Network" tab
4. Check: "Preserve log" checkbox
```

### Send Message & Copy
```
1. Type: "Hello test" in chat box
2. Click: Send button
3. Watch: Network tab for new POST request
4. Right-click the POST request
5. Select: Copy → Copy as cURL
```

### Save It
```
1. Open: captured_request.txt (in this folder)
2. Paste: The cURL command you copied
3. Save: The file
```

✅ **Done with Step 1!**

---

## Step 2️⃣: Analyze (30 seconds)

Run this command in your terminal:

```bash
node analyze_and_test.js
```

**Wait for output:**

If you see:
```
✅ SUCCESS! API is working!
```
→ **Great! Move to Step 3**

If you see:
```
❌ Request failed
```
→ **Go back to Step 1, capture a fresh request** (tokens expire quickly!)

✅ **Done with Step 2!**

---

## Step 3️⃣: Chat! (Unlimited)

Run this command:

```bash
node terminal_client.js
```

**You should see:**
```
🤖 Free AI Chat Terminal Client
============================================================
✅ Loaded configuration from api_config.json

💡 Type your messages below. Type "quit" to exit.
------------------------------------------------------------

🎮 Ready to chat! (type "help" for commands)

> 
```

**Now just type and chat!**

Example:
```
> What is quantum computing?

⏳ Sending...

📊 Response Status: 200 OK
⏱️  Response Time: 892ms

✅ Response received!

🤖 AI Response:
------------------------------------------------------------
Quantum computing is a type of computing that uses quantum
mechanics principles to perform calculations...
------------------------------------------------------------

> 
```

✅ **Done! You're chatting from the terminal!**

---

## 🎮 Available Commands While Chatting

- `help` - Show all commands
- `clear` - Clear chat history  
- `history` - See previous messages
- `save` - Save chat to file
- `quit` - Exit

---

## ❌ Common Issues & Quick Fixes

### "No API configuration found!"
**Fix:** Make sure you saved `captured_request.txt` first, then run Step 2

### "Status 500" or "Request failed"
**Fix:** The action token expired. Go back to Step 1, capture fresh, try again

### "Command not found: node"
**Fix:** Install Node.js from https://nodejs.org/

---

## ✅ That's It!

Three simple steps:
1. **Capture** the API call from browser
2. **Analyze** and create config
3. **Chat** in terminal!

Happy chatting! 🎉

---

**Need more help?** See `SETUP_GUIDE.md` for detailed instructions.
