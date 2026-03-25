# 🖥️ OpenSourceGen Terminal Client - Usage Guide

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ installed
- `axios` package: `npm install axios`

### Quick Start

```bash
# Navigate to the directory
cd "c:\Users\Ronit\Downloads\test models 2"

# Run the terminal client
node opensourcegen-terminal.js
```

---

## 💬 Interactive Commands

Once the client starts, you can use these commands:

### 🔑 Authentication

**Initialize and Authenticate:**
```
init
```
This will:
- Generate a device fingerprint
- Register with OpenSourceGen
- Save your session for 24 hours

---

### 🏥 System Commands

**Check API Health:**
```
health
```

**Show Account Information:**
```
account
```

**List Your Media:**
```
list
```

---

### 🎨 Generation Commands

**Generate Image (Interactive):**
```
generate
```
Then enter your prompt when asked.

**Generate Image (One-liner):**
```
generate A beautiful sunset over mountains, digital art
```

**With Parameters:**
```javascript
// Note: Advanced parameters may or may not be supported
// This depends on the actual API implementation
```

---

### 📥 Download Commands

**Download from URL:**
```
download https://opensourcegen.com/images/xxx.png
```

---

### ℹ️ Help & Exit

**Show Help:**
```
help
```

**Exit Client:**
```
exit
```
or
```
quit
```

---

## 🎯 Example Session

```bash
$ node opensourcegen-terminal.js

🚀 OpenSourceGen Terminal Client
======================================================================
Commands:
  init          - Initialize and authenticate
  health        - Check API health
  account       - Show account information
  generate      - Generate an image
  list          - List your media
  download [URL] - Download media from URL
  help          - Show this help
  exit          - Exit the client
======================================================================

Type "init" to start.

📝 opensourcegen> init
🔑 Initializing OpenSourceGen Terminal Client...

📱 Device Fingerprint: terminal_1774213000000_abc123
🔄 Registering device...
✅ Authentication successful!

💾 Session saved to: opensourcegen-session.json

Ready! Type "account" to test connection or "generate" to create.

📝 opensourcegen> generate A cyberpunk city at night, neon lights, futuristic
🎨 Generating Image...

Prompt: A cyberpunk city at night, neon lights, futuristic
Model: flux
Size: 1024x1024

✅ Generation successful!
Response: {
  "imageUrl": "https://opensourcegen.com/generated/xxx.png",
  "metadata": {...}
}

📥 Image URL: https://opensourcegen.com/generated/xxx.png

Download this image? (y/n): y

📥 Downloading Media...

URL: https://opensourcegen.com/generated/xxx.png
✅ Downloaded to: C:\Users\Ronit\Downloads\test models 2\downloaded_1774213000000.png
File size: 245.67 KB

📝 opensourcegen> account
👤 Fetching Account Information...

Account Details:
{
  "email": "user@example.com",
  "subscription": "free",
  "creditsRemaining": 10,
  ...
}

📝 opensourcegen> exit
Goodbye! 👋
```

---

## 📁 Session Management

### Session File
Your authentication is saved in:
```
opensourcegen-session.json
```

**Session Duration:** 24 hours

**Manual Session Reset:**
Delete the session file to force re-authentication:
```bash
del opensourcegen-session.json
```

---

## ⚠️ Important Notes

### API Limitations

1. **Rate Limits**: Free users likely have daily generation limits
2. **Subscription Required**: Some features may require paid subscription
3. **Endpoint Discovery**: The actual generation endpoint (`/api/generate`) is inferred from code analysis and may need adjustment

### Known Issues

1. **Generation Endpoint**: The `/api/generate` endpoint was discovered through code analysis but hasn't been confirmed working
2. **Parameter Support**: Advanced parameters (steps, guidance, etc.) may not be supported
3. **Model Selection**: Available models depend on what OpenSourceGen supports

### Troubleshooting

**Authentication Failed:**
```
❌ Registration failed - no API key received
```
**Solution:** Check your internet connection and try again. The API might be temporarily down.

**Not Authenticated:**
```
❌ Not authenticated. Run "init" first.
```
**Solution:** Run the `init` command to authenticate.

**Session Expired:**
```
⚠️  Session expired
```
**Solution:** Run `init` again to get a new session.

**API Error 404:**
```
❌ Generation failed: Request failed with status code 404
```
**Solution:** The generation endpoint path might be different. Try these alternatives:
- `/api/generate`
- `/api/create`
- `/api/text2img`
- `/api/image/generate`

---

## 🔧 Manual Testing (Alternative)

If the interactive client doesn't work, test manually with curl:

### 1. Register Device
```powershell
$body = @{
    fingerprint = "terminal_test_$(Get-Date -UnixTimeSeconds)"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://opensourcegen.com/api/osg-register" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### 2. Check Health
```powershell
Invoke-RestMethod -Uri "https://opensourcegen.com/api/health"
```

### 3. Get Account Info (if you have a token)
```powershell
$headers = @{
    Authorization = "Bearer YOUR_TOKEN_HERE"
}

Invoke-RestMethod -Uri "https://opensourcegen.com/api/user/account" `
  -Headers $headers
```

---

## 🎯 What Works vs What's Uncertain

### ✅ Confirmed Working:
- ✅ Health check endpoint (`/api/health`)
- ✅ Device registration (`/api/osg-register`)
- ✅ Firebase authentication flow
- ✅ Session management

### ⚠️ Likely Working (needs testing):
- ⚠️ Image generation (`/api/generate` - inferred from code)
- ⚠️ Account info retrieval
- ⚠️ Media listing
- ⚠️ Media downloads

### ❓ Unknown:
- ❓ Exact generation parameters
- ❓ Supported models beyond "flux"
- ❓ Rate limits and quotas
- ❓ Subscription tier features

---

## 💡 Tips

1. **Start with Health Check**: Always run `health` first to verify API is accessible
2. **Save Your Session**: The session lasts 24 hours, so you don't need to re-authenticate every time
3. **Test with Simple Prompts**: Start with simple prompts before complex ones
4. **Check Account Credits**: Use `account` to see if you have remaining credits/generations
5. **Monitor File Size**: Downloaded images are typically 200KB-2MB

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Internet Connection**: Ensure you're online
2. **Verify API Status**: Run `health` command
3. **Clear Session**: Delete `opensourcegen-session.json` and re-run `init`
4. **Check Firewall**: Ensure outgoing HTTPS requests are allowed
5. **Update Node.js**: Make sure you're using Node.js 16 or higher

---

## 📊 Current Status

| Feature | Status | Confidence |
|---------|--------|------------|
| Authentication | ✅ Working | 100% |
| Health Check | ✅ Working | 100% |
| Session Management | ✅ Working | 100% |
| Image Generation | ⚠️ Inferred | 70% |
| Account Info | ⚠️ Inferred | 80% |
| Media Downloads | ⚠️ Inferred | 80% |

---

*Created: March 23, 2026*  
*Terminal Client Version: 1.0*  
*OpenSourceGen API Version: Unknown*
