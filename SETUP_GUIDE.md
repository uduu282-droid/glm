# 🚀 Complete Setup Guide - Free AI Chat Terminal Client

## 📋 Overview

This guide will help you capture the actual API calls from the Free AI Chat website and use them in a terminal-based chat client.

---

## 🔧 Step-by-Step Instructions

### **Step 1: Capture the API Call**

1. **Open your web browser** (Chrome/Edge recommended)
   ```
   https://free-aichat.vercel.app/
   ```

2. **Open Developer Tools**
   - Windows/Linux: Press `F12` or `Ctrl+Shift+I`
   - Mac: Press `Cmd+Option+I`

3. **Go to Network Tab**
   - Click on "Network" tab in DevTools
   - Check "Preserve log" checkbox (important!)
   - Set filter to "Fetch/XHR"

4. **Send a Test Message**
   - Type "Hello, this is a test" in the chat box
   - Click Send button
   - Watch for new requests in Network tab

5. **Find the Right Request**
   - Look for a `POST` request to `/` or similar
   - Should have headers like:
     - `Next-Action: <some-id>`
     - `Next-Router-State-Tree: <encoded-string>`
     - `Accept: text/x-component`

6. **Copy the Request**
   - Right-click on the request
   - Select **"Copy"** → **"Copy as cURL"**
   - This copies everything to clipboard!

7. **Save the Captured Request**
   - Open `captured_request.txt` file
   -Paste the cURL command
   - Save the file

---

### **Step 2: Analyze the Captured Request**

Run the analyzer script:

```bash
node analyze_and_test.js
```

This will:
- ✅ Parse your captured cURL command
- ✅ Extract URL, headers, and body
- ✅ Test if the API works with captured data
- ✅ Create `api_config.json` automatically
- ✅ Save response to `test_response.txt`

**If successful**, you'll see:
```
✅ SUCCESS! API is working!
📝 Response Preview:
...
```

---

### **Step 3: Start Chatting in Terminal**

Once the API test passes:

```bash
node terminal_client.js
```

You'll see an interactive chat interface where you can:
- 💬 Send messages and get AI responses
- 🔄 Switch between models (Gemini/Groq)
- 💾 Save chat history to files
- 📜 View message history
- ❌ Clear conversation

---

## 🎮 Terminal Commands

Once running the terminal client:

| Command | Description |
|---------|-------------|
| `help` | Show all commands |
| `clear` | Clear chat history |
| `model` | Check current model |
| `history` | Show recent messages |
| `save` | Save chat to file |
| `quit` or `exit` | Exit program |

Just type your message and press Enter to chat!

---

## 🔍 Troubleshooting

### Issue: "No API configuration found!"

**Solution:** You need to capture the API request first.
1. Follow Step 1 carefully
2. Make sure to paste into `captured_request.txt`
3. Run `node analyze_and_test.js`

---

### Issue: "Request failed" or "Status 500"

**Possible causes:**
- ⚠️ **Expired Action ID**: Next.js action tokens expire quickly
  - **Fix**: Capture a fresh request
  
- ⚠️ **Missing Headers**: Some headers are critical
  - **Fix**: Make sure you copied ALL headers when doing "Copy as cURL"
  
- ⚠️ **Session/Cookies**: May need session data
  - **Fix**: Try capturing again after refreshing the page

---

### Issue: "Response received but can't parse"

The response format might be React Server Components (RSC).

**What's happening:**
- The API returns RSC format (`text/x-component`)
- It's not standard JSON
- Contains encoded component tree

**What we're doing:**
- The analyzer tries to extract readable text
- Sometimes needs custom parsing based on response format

---

## 📊 Files Created

After following this guide, you'll have:

| File | Purpose |
|------|---------|
| `captured_request.txt` | Your raw cURL command |
| `api_config.json` | Parsed API configuration |
| `test_response.txt` | Sample API response |
| `chat_TIMESTAMP.txt` | Saved chat sessions |

---

## 🎯 Advanced: Manual Configuration

If automatic parsing fails, you can manually edit `api_config.json`:

```json
{
  "url": "https://free-aichat.vercel.app/",
  "method": "POST",
  "headers": {
    "accept": "text/x-component",
    "content-type": "text/plain;charset=UTF-8",
    "next-action": "YOUR_ACTION_ID_HERE",
    "next-router-state-tree": "YOUR_STATE_TREE_HERE",
    "user-agent": "Mozilla/5.0..."
  },
  "body": ""
}
```

**Key headers needed:**
- `next-action` - The Server Action ID (changes frequently!)
- `next-router-state-tree` - Navigation state
- `accept` - Must be `text/x-component`

---

## 💡 Pro Tips

1. **Fresh is Best**: Capture requests right before using them (they expire)

2. **Model Switching**: To switch between Gemini and Groq:
   - Change model on website
   - Send another message
   - Capture that request
   - Note any differences in headers/body

3. **Multiple Sessions**: Keep multiple config files for different models:
   - `config_gemini.json`
   - `config_groq.json`

4. **Watch for Changes**: If terminal client stops working:
   - Website may have updated
   - Action IDs definitely changed
   - Recapture and regenerate config

---

## 🚨 Important Notes

⚠️ **This is NOT an official API**
- We're reverse-engineering a web interface
- Structure can change anytime
- For production use, get official API keys from Google/Groq

⚠️ **Rate Limits**
- Free service may have usage limits
- Don't spam requests
- Be respectful of the service

⚠️ **Session Dependency**
- Some implementations may require cookies
- May need to capture entire session flow
- Check if requests work without authentication

---

## ✅ Success Checklist

- [ ] Opened website in browser
- [ ] Opened DevTools (F12)
- [ ] Went to Network tab
- [ ] Sent test message
- [ ] Found POST request with Next-Action header
- [ ] Copied as cURL
- [ ] Pasted into `captured_request.txt`
- [ ] Ran `node analyze_and_test.js`
- [ ] Got "SUCCESS" message
- [ ] Ran `node terminal_client.js`
- [ ] Successfully chatted with AI!

---

## 🆘 Still Having Issues?

If you're stuck:

1. **Check the basics:**
   - Node.js installed? (`node --version`)
   - All files present? (ls the directory)
   -Correct directory? (should be where scripts are)

2. **Re-capture:**
   - Sometimes just need fresh capture
   - Try after clearing browser cache

3. **Different approach:**
   - Instead of cURL, try copying as "Copy as fetch"
   -Paste into a JS file and debug from there

4. **Check for updates:**
   - Website may have changed
   - May need to adjust parsing logic

---

## 🎉 When Everything Works

You should see something like:

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
⏱️  Response Time: 1234ms
Content-Type: text/x-component

✅ Response received!

🤖 AI Response:
------------------------------------------------------------
Hello! How can I assist you today? Feel free to ask me
anything, and I'll do my best to provide helpful information.
------------------------------------------------------------

>
```

Then you're chatting away in your terminal! 🎊

---

**Last Updated**: March 10, 2026  
**Status**: Ready for testing once you capture the API call
