# How to Capture API Calls from Free AI Chat

## 📋 Instructions

### Method 1: Using Browser DevTools (Recommended)

1. **Open the Website**
   - Go to https://free-aichat.vercel.app/
   
2. **Open Developer Tools**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
   - Click on the **Network** tab
   
3. **Configure Network Tab**
   - Filter by: `All` or `Fetch/XHR`
   - Make sure "Preserve log" is checked
   
4. **Start Chatting**
   - Type a message like "Hello, test this" in the chat box
   - Click Send
   
5. **Find the API Call**
   - Look for a new request appearing in the Network tab
   - It will be a `POST` request to `/` or an API endpoint
   - The request type should show as `fetch`, `xhr`, or have `Next-Action` header
   
6. **Copy the Request**
   - Right-click on the request
   - Select **"Copy"** → **"Copy as fetch"** or **"Copy as cURL"**
   -Paste it into a text file named `captured_request.txt`

### Method 2: Detailed Request Inspection

After making a request in the Network tab:

1. **Click on the request** to see details
2. **Check these tabs:**
   - **Headers**: Copy all Request Headers
   - **Payload**: See what data was sent
   - **Response**: See what came back
   - **Preview**: Formatted response view

3. **Important headers to capture:**
   ```
   Next-Action: <action-id>
   Next-Router-State-Tree: <state-tree>
   Content-Type: text/plain;charset=UTF-8
   Accept: text/x-component
   ```

4. **Request Body format:**
   - Usually a JSON string or plain text
   - May contain message content and model selection

---

## 🎯 What We're Looking For

### Expected Request Structure:

```javascript
POST https://free-aichat.vercel.app/
Headers:
  - accept: text/x-component
  - content-type: text/plain;charset=UTF-8
  - next-action: <some-action-id>
  - next-router-state-tree: <encoded-state>
  
Body:
  {
    "0": "<your-message>",
    // or other format
  }
```

### Expected Response:
- Content-Type: `text/x-component` (React Server Component format)
- Contains streamed or complete AI response

---

## 📝 Once You Have the Captured Request

Save it in one of these formats:

### Format A: As cURL command
```bash
curl 'https://free-aichat.vercel.app/' \
  -H 'accept: text/x-component' \
  -H 'next-action: ...' \
  --data-raw '...'
```

### Format B: As JavaScript fetch
```javascript
fetch('https://free-aichat.vercel.app/', {
  method: 'POST',
  headers: {
    'accept': 'text/x-component',
    'next-action': '...'
  },
  body: '...'
})
```

### Format C: Just paste the raw details
Create a file called `captured_api_details.txt` with:
- Full URL
- All headers
- Request body
- Any cookies if present

---

## 🔍 Tips for Success

1. **Make multiple requests** - Try different messages to see patterns
2. **Switch models** - Test both Gemini and Groq to see how model selection works
3. **Look for tokens** - Check if there are any session tokens or authentication
4. **Check for streaming** - Some AI chats stream responses (Server-Sent Events)
5. **Note the timing** - See if tokens expire or change

---

## ⚠️ Common Issues

### Issue: Request has CSRF protection
- Look for tokens in cookies or page source
- May need to make a GET request first to get tokens

### Issue: Dynamic action IDs
- The `Next-Action` header might change
- We may need to extract it dynamically from the page

### Issue: Encrypted/obfuscated payload
- The request body might be encoded
- We'll need to reverse engineer the encoding

---

## ✅ Next Steps After Capturing

Once you have the captured request:
1. Save it to `captured_request.txt` or `captured_api_details.txt`
2. Run the analysis script I'll create
3. We'll build a terminal client together!
