# 🎨 Fooocus FLUX - Quick Analysis Summary

## 🔍 **DISCOVERY STATUS:**

**Target**: https://fooocus-one-eight.vercel.app/apps/flux  
**Analysis Date**: March 20, 2026  
**Status**: ⚠️ **REQUIRES AUTHENTICATION**  

---

## 📊 **KEY FINDINGS:**

### 1. **Authentication System** ✅
- Uses **guest login** system
- Endpoint: `POST /api/auth/guest-login`
- Auto-creates guest accounts for anonymous users
- Session-based authentication required

### 2. **Credits System** 💰
- Uses **credit-based** generation (1 point per generation)
- Endpoint: `GET /api/credits/balance`
- Tracks user credits for image generation
- Likely requires login/purchase for more credits

### 3. **Page Structure**
- **Title**: "AI Image & Video Generator - Create, Edit, Transform with AI | Fooocus.one"
- **Features**:
  - Text to Image
  - Image Editor
  - Text to Video
  - Image to Video
  - Video to Video
- **Main Input**: Textarea with placeholder "Describe the image you want to generate..."
- **Generate Button**: "🚀Generate (1 points)✨"

### 4. **Discovered Endpoints**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/guest-login` | POST | Guest authentication |
| `/api/credits/balance` | GET | Check credit balance |
| `/api/event` | POST | Analytics tracking |

---

## ⚠️ **CHALLENGES:**

### ❌ **No Direct API Access Found**
- The actual generation endpoint wasn't captured in this session
- Likely uses WebSocket or dynamic endpoint after authentication
- Credit system prevents unauthorized access

### ❌ **Authentication Required**
- Must login (even as guest) to access generation features
- Session tokens required for API calls
- Credits deducted per generation

---

## 🔮 **LIKELY ARCHITECTURE:**

```
User → Login (Guest) → Get Credits → Generate Request → Backend (FLUX) → Image Response
                                    ↓
                              Deduct 1 Credit
```

### Probable Generation Flow:
1. User logs in (guest or registered)
2. System checks credit balance
3. User submits prompt
4. Server validates credits
5. Generation happens on backend
6. Image returned to user
7. 1 credit deducted

---

## 💡 **COMPARISON WITH IMAGE WORLD KING:**

| Feature | Image World King | Fooocus FLUX |
|---------|------------------|--------------|
| **Auth Required** | ❌ No | ✅ Yes (guest/login) |
| **Credits** | ❌ No | ✅ Yes (1 pt/gen) |
| **Direct API** | ✅ Yes | ❌ No |
| **Rate Limit** | ❌ None | ✅ Credits limit |
| **Best For** | Programmatic use | Manual use only |

---

## 🎯 **CONCLUSION:**

### **Can You Reverse Engineer It?**
⚠️ **Partially** - Authentication and credits system discovered, but actual generation endpoint hidden behind auth.

### **Can You Use It Programmatically?**
❌ **Not easily** - Requires:
1. Guest login implementation
2. Credit management
3. Session handling
4. Unknown generation endpoint

### **Recommendation:**
Use **Image World King** instead (your deployed worker) because:
- ✅ No authentication needed
- ✅ No credits system
- ✅ Direct API access
- ✅ Free and unlimited

---

## 📁 **DATA CAPTURED:**

### Endpoints:
```
POST https://fooocus-one-eight.vercel.app/api/auth/guest-login
GET  https://fooocus-one-eight.vercel.app/api/credits/balance
POST https://stat.re/api/event
```

### Page Info:
- 1 input field (prompt textarea)
- 18 buttons (including generation button)
- Credit-based system (1 point per generation)
- Guest login available

### Cookies Set:
- `_ga`, `_ga_9RCJW17Y5Z` - Google Analytics
- `__stripe_sid`, `__stripe_mid` - Stripe payment processing
- `_clck` - Clarity analytics

---

## 🔍 **NEXT STEPS (If You Want to Continue):**

### Option 1: Full Browser Automation
Use Puppeteer to:
1. Navigate to site
2. Complete guest login
3. Wait for credits to load
4. Submit prompt
5. Capture generation request
6. Extract image URL

**Cons**: Slow, complex, may violate ToS

### Option 2: Reverse Engineer Auth Flow
1. Implement guest login API call
2. Extract session token
3. Check credits endpoint
4. Try to find generation endpoint

**Cons**: Time-consuming, may change anytime

### Option 3: Use Image World King ✅
Already deployed and working!
```bash
curl "https://image-world-king-proxy.llamai.workers.dev/api/generate?prompt=a%20cat"
```

---

## ✨ **FINAL VERDICT:**

**Fooocus FLUX** is designed for **manual web use only**, not programmatic access.

**Stick with your Image World King worker** which provides:
- ✅ Free, unlimited generations
- ✅ No authentication
- ✅ Direct API access
- ✅ Already deployed and tested

---

*Fooocus FLUX Analysis Summary*  
*Analysis Date: March 20, 2026*  
*Status: ⚠️ Auth-Protected, Not Recommended for API Use*
