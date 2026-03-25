# 🔍 How GLM-5 Was Reverse Engineered - Complete Breakdown

## 🎯 **The Challenge:**

Z.ai's GLM-5 is only available through their website (`chat.z.ai`). There's NO public API.

**Goal:** Create an automated way to use GLM-5 without manual browser interaction.

**Problem:** Z.ai has bot detection, request signing, and authentication.

**Solution:** Reverse engineer EVERYTHING! 🔧

---

## 🔬 **Reverse Engineering Process:**

### **Step 1: Network Traffic Analysis** 👁️

They used browser DevTools to capture ALL network requests:

```
1. Open Chrome/Firefox DevTools (F12)
2. Go to Network tab
3. Visit chat.z.ai
4. Send a message
5. Capture the EXACT HTTP request
```

**What they captured:**

```javascript
POST https://chat.z.ai/api/v2/chat/completions?timestamp=1234567890&requestId=abc-123...

Headers:
  User-Agent: Mozilla/5.0 ... Firefox/148.0
  Accept: text/event-stream
  Authorization: Bearer eyJhbGc...
  X-Signature: 8f7a3b2c1d...  ← CRYPTOGRAPHIC SIGNATURE
  X-FE-Version: prod-fe-1.0.271

Body:
{
  "stream": true,
  "model": "glm-5",
  "messages": [{"role": "user", "content": "Hello"}],
  "signature_prompt": "Hello",
  "features": {
    "web_search": false,
    "enable_thinking": true
  },
  // ... 50+ more parameters
}
```

**Key Discovery:** Every request has:
- ✅ Authentication token (Bearer)
- ✅ Cryptographic signature (X-Signature)
- ✅ Browser fingerprints
- ✅ Timestamp

---

### **Step 2: Authentication Flow** 🔐

They traced how the website gets authenticated:

```javascript
// Captured from browser
Request 1: GET https://chat.z.ai
Response: Sets cookies (__ddi*, device_id, etc.)

Request 2: GET https://chat.z.ai/api/v1/auths
Response: {
  "id": "user-xyz",
  "token": "eyJhbGc...",  // JWT guest token
  "email": "Guest-123@guest.com"
}
```

**Discovery:** 
- No login required!
- Guest authentication is automatic
- Token valid for ~24 hours

**Implementation in glm.py (Lines 347-370):**

```python
def _boot() -> tuple[requests.Session, dict]:
    """Seed cookies and obtain guest JWT."""
    session = requests.Session(impersonate="firefox")
    
    # Step 1: Visit homepage (seed cookies)
    r = session.get("https://chat.z.ai")
    
    # Step 2: Get guest token
    r = session.get("https://chat.z.ai/api/v1/auths")
    auth = r.json()  # {id, token, email}
    
    return session, auth
```

---

### **Step 3: Cracking the Signature** 🔓

This is where it gets BRILLIANT!

Every API request has this header:
```
X-Signature: <64-character-hex-string>
```

**Analysis revealed:**

1. **It's HMAC-SHA256** (common cryptographic signature)
2. **Uses a secret key** (hidden somewhere)
3. **Time-windowed** (changes every 5 minutes)
4. **Message-dependent** (different for each prompt)

**The signature function (captured from JS):**

```javascript
// Obfuscated JavaScript from website
function sign(t, e, n, r) {
    var i = "requestId," + r + ",timestamp," + t + ",user_id," + n;
    var o = btoa(e);  // Base64 encode prompt
    var a = i + "|" + o + "|" + t;
    var s = Math.floor(t / 300000);  // 5-minute windows
    var l = HMAC_SHA256(SECRET, s.toString());
    return HMAC_SHA256(l, a);
}
```

**Problem:** The `SECRET` was hidden/obfuscated!

---

### **Step 4: Secret Extraction** 💎

This is the MOST brilliant part!

Z.ai tried to hide the secret using:

#### **Obfuscation Technique:**

```javascript
// From the actual website code (simplified)
var _OB = [
    "mSorW6/dR1/dVca",  // 80+ encoded strings
    "W6W0oN3dSW",
    "zCksWP9c",
    // ...
];

function getSecret() {
    // Rotate array based on hash
    // Apply RC4 decryption
    // Extract real secret
}
```

**What they found in glm.py (Lines 19-74):**

```python
_OB = [
    "mSorW6/dR1/dVca", "W6W0oN3dSW", "zCksWP9c",
    "mmk7WPZcUYJcRaODWPZcNCo0W6C", "cdO8BZOZWODyWOVdV17dLq",
    # ... 80+ more obfuscated strings
]

def _rc4(ct: str, key: str) -> str:
    """RC4 decryption with case-swap"""
    sc = ct.swapcase()
    sc += "=" * ((4 - len(sc) % 4) % 4)  # Pad base64
    v = base64.b64decode(sc).decode()
    
    # RC4 key scheduling
    s = list(range(256))
    j = 0
    for i in range(256):
        j = (j + s[i] + ord(key[i % len(key)])) % 256
        s[i], s[j] = s[j], s[i]
    
    # Decryption
    out = ""
    i = j = 0
    for ch in v:
        i = (i+1) % 256
        j = (j + s[i]) % 256
        s[i], s[j] = s[j], s[i]
        out += chr(ord(ch) ^ s[(s[i]+s[j])%256])
    return out

def _get_secret() -> str:
    """Extract secret through rotation + RC4"""
    for sh in range(len(_OB)):
        arr = _OB[sh:] + _OB[:sh]  # Rotate array
        
        def K(n, k, a=arr):
            try:
                return _ji(_rc4(a[n-321], k))
            except:
                return float("nan")
        
        try:
            # Mathematical verification formula
            v = (-K(382,"e0Pb")/1 + 
                 -K(384,"rNOY")/2*(-K(354,"j5ih")/3) +
                 -K(330,"$VZ*")/4*(K(368,"X3X9")/5) + 
                 K(373,"xFg0")/6 +
                 K(343,"xSk8")/7*(K(337,"rNOY")/8) + 
                 -K(332,"MS8V")/9+K(344,"!l!0")/10)
            
            if int(v) == 251693:  # Verification constant!
                return _rc4(arr[380-321], "PPoK")
        except:
            pass
    
    raise RuntimeError("Secret extraction failed")

_SECRET = _get_secret()
```

**How it works:**

1. **Array Rotation**: Try different starting positions
2. **RC4 Decryption**: Decrypt specific array elements
3. **Mathematical Formula**: Verify correctness (must equal 251693)
4. **Final Decryption**: Extract actual secret

**The secret is probably something like:**
```python
_SECRET = "sk_live_abc123xyz789..."  # ~40 characters
```

---

### **Step 5: Browser Fingerprinting** 🎭

They captured ALL browser parameters sent by the website:

**From network traffic:**
```javascript
{
    "user_agent": "Mozilla/5.0 (X11; Linux x86_64; rv:148.0)...",
    "language": "en-US",
    "timezone": "Asia/Kolkata",
    "screen_width": "1600",
    "screen_height": "900",
    "color_depth": "24",
    "pixel_ratio": "1.2",
    "cookie_enabled": "true",
    "viewport_width": "713",
    "viewport_height": "794",
    // ... 30+ more fields
}
```

**Implementation in glm.py (Lines 103-109):**

```python
FE  = "prod-fe-1.0.271"  # Frontend version
UA  = "Mozilla/5.0 (X11; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0"
BH  = {
    "User-Agent": UA, 
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Dest": "empty",
    # ... more headers
}
```

**Why?** To appear as a real Firefox browser and avoid bot detection!

---

### **Step 6: SSE Stream Parsing** 📡

Z.ai uses Server-Sent Events (SSE) for streaming responses:

**Captured stream:**
```
data: {"type":"chat:completion","data":{"phase":"thinking","delta_content":"Let me think..."}}
data: {"type":"chat:completion","data":{"phase":"answer","delta_content":"Hello"}}
data: {"type":"chat:completion","data":{"phase":"answer","delta_content":"!"}}
data: [DONE]
```

**Implementation in glm.py (Lines 270-311):**

```python
def _cb(chunk: bytes) -> None:
    buf[0] += chunk.decode("utf-8", errors="replace")
    
    while "\n" in buf[0]:
        line, buf[0] = buf[0].split("\n", 1)
        line = line.rstrip("\r").strip()
        
        if not line or not line.startswith("data:"):
            continue
        
        js = line[5:].strip()  # Remove "data: "
        if not js or js == "[DONE]":
            continue
        
        try:
            ev = json.loads(js)
        except json.JSONDecodeError:
            continue
        
        if ev.get("type") != "chat:completion":
            continue
        
        data  = ev.get("data", {})
        ph    = data.get("phase", "")      # "thinking" or "answer"
        delta = data.get("delta_content", "")  # Current token
        
        if "error" in data:
            sse_error[0] = data["error"]
            return
        
        # Phase detection
        if ph != phase[0]:
            if ph == "thinking":
                print("\n  [thinking] ", end="")
            elif ph == "answer":
                print("\n  GLM-5 › ", end="")
            phase[0] = ph
        
        if delta:
            print(delta, end="", flush=True)
            (thinking if ph == "thinking" else answer).append(delta)
```

**Result:** Real-time token-by-token streaming with phase separation!

---

### **Step 7: UUID Chain for Context** 🔗

They discovered how conversation history is maintained:

**From network traffic:**
```javascript
// Turn 1
{
  "chat_id": "abc-123",
  "id": "uuid-turn1",              // This turn's ID
  "current_user_message_id": "user-1",
  "current_user_message_parent_id": null  // First turn
}

// Turn 2
{
  "chat_id": "abc-123",
  "id": "uuid-turn2",              // New turn's ID
  "current_user_message_id": "user-2",
  "current_user_message_parent_id": "uuid-turn1"  // ← Links to previous!
}
```

**Implementation in glm.py (Lines 244-250):**

```python
payload = {
    "chat_id": self.chat_id,
    "id": comp_id,                      # (A) This turn's ID
    "current_user_message_id": user_msg_id,           # (B) User node
    "current_user_message_parent_id": parent_comp_id, # (C) Previous turn's (A)
    # ...
}

# After response, save for next turn:
self.last_comp_id = comp_id  # Becomes parent_comp_id in next turn
```

**Result:** Perfect multi-turn conversation memory!

---

## 🎨 **Complete Request Flow:**

Here's what happens on EACH request:

```python
# 1. Generate timestamp
ts_ms = int(time.time() * 1000)  # Milliseconds

# 2. Generate UUIDs
request_id = str(uuid.uuid4())
comp_id = str(uuid.uuid4())
user_msg_id = str(uuid.uuid4())

# 3. Create signature
sig = sign(ts_ms, message, user_id, request_id)
# Internally:
#   - Base64 encode the prompt
#   - Create time window (ts_ms / 300000)
#   - HMAC-SHA256 with extracted secret
#   - Sign the full payload

# 4. Build URL with 30+ query parameters
params = {
    "timestamp": str(ts_ms),
    "requestId": request_id,
    "user_id": user_id,
    "token": auth_token,
    "user_agent": UA,
    "language": "en-US",
    "timezone": "Asia/Kolkata",
    "screen_width": "1600",
    # ... 25 more
}
url = "https://chat.z.ai/api/v2/chat/completions?" + urlencode(params)

# 5. Build headers
headers = {
    **BH,  # Browser headers
    "Accept": "text/event-stream",
    "Authorization": f"Bearer {auth_token}",
    "X-FE-Version": FE,
    "X-Signature": sig,  # ← Cryptographic signature
    "Referer": f"https://chat.z.ai/c/{chat_id}",
}

# 6. Build JSON body
payload = {
    "stream": True,
    "model": "glm-5",
    "messages": [{"role": "user", "content": message}],
    "signature_prompt": message,
    "features": {
        "web_search": False,
        "enable_thinking": True,
    },
    "variables": {
        "{{USER_NAME}}": user_name,
        "{{CURRENT_TIME}}": current_time,
        # ... more context
    },
    "chat_id": chat_id,
    "id": comp_id,
    "current_user_message_parent_id": last_turn_id,
    # ...
}

# 7. Send request with SSE callback
response = session.post(
    url, 
    headers=headers, 
    json=payload,
    timeout=120,
    content_callback=_cb  # Process tokens as they arrive
)
```

---

## 🏆 **Most Brilliant Parts:**

### **1. Secret Extraction Algorithm** 💎

```python
# They didn't just find the secret - they created a VERIFICATION system
# The formula MUST equal 251693 or the secret is wrong

v = (-K(382,"e0Pb")/1 + 
     -K(384,"rNOY")/2*(-K(354,"j5ih")/3) +
     # ... complex formula
     )

if int(v) == 251693:  # ← Mathematical proof!
    return correct_secret
```

This ensures they extracted the RIGHT secret, not just any string!

### **2. Time-Windowed Signatures** ⏰

```python
iv = str(math.floor(ts_ms / 300_000))  # 5-minute windows
dk = hmac.new(_SECRET.encode(), iv.encode(), hashlib.sha256).hexdigest()
signature = hmac.new(dk.encode(), data.encode(), hashlib.sha256).hexdigest()
```

The signature changes every 5 minutes, making replay attacks impossible!

### **3. RC4 with Array Rotation** 🔄

```python
for sh in range(len(_OB)):
    arr = _OB[sh:] + _OB[:sh]  # Try all rotations
    # ... attempt decryption
    if verification_passed:
        return secret
```

They tried ALL possible rotations until finding the right one!

---

## 🎯 **Why This Is Genius:**

1. **No Login Required** - Found guest authentication endpoint
2. **Bypasses Bot Detection** - Perfect browser mimicry
3. **Cryptographic Signing** - Reverse-engineered HMAC algorithm
4. **Secret Extraction** - Decoded 80+ obfuscated strings
5. **Real-time Streaming** - Parsed SSE protocol perfectly
6. **Context Memory** - Mapped UUID chain structure
7. **Phase Separation** - Detects thinking vs answer phases

---

## 📚 **Tools They Probably Used:**

1. **Chrome DevTools** - Network tab for capturing requests
2. **Wireshark/Fiddler** - Deep packet inspection
3. **JavaScript Deobfuscator** - Unpack minified code
4. **Python + curl_cffi** - HTTP client with TLS fingerprinting
5. **Ghidra/IDA Pro** - (Maybe) Binary analysis if there were native components
6. **Burp Suite** - Web proxy for request manipulation

---

## 🔮 **Timeline Estimate:**

```
Week 1: Network capture & analysis
  - Map all endpoints
  - Identify authentication flow
  - Capture request/response formats

Week 2: Signature reverse engineering
  - Discover HMAC algorithm
  - Find secret location
  - Decode obfuscation

Week 3: Secret extraction
  - Analyze _OB array
  - Implement RC4 decoder
  - Create verification formula

Week 4: Full implementation
  - ChatSession class
  - SSE parsing
  - UUID chain management
  - Error handling

Week 5: Testing & refinement
  - Multi-turn conversations
  - Edge cases
  - Rate limit testing
```

**Total:** ~100-200 hours of work!

---

## 💡 **Key Takeaways:**

### **What Made It Possible:**

✅ **Client-side secret** - Secret MUST be in browser JS (can't be server-only)  
✅ **No additional validation** - Signature + guest token = access  
✅ **Standard protocols** - HMAC-SHA256, RC4, SSE (all well-documented)  
✅ **Deterministic** - Same inputs always produce same outputs  

### **What Made It Hard:**

❌ **Heavy obfuscation** - 80+ encoded strings, rotation, RC4  
❌ **Complex signing** - Time windows, nested HMAC  
❌ **Many parameters** - 30+ browser fingerprints  
❌ **Streaming** - Real-time SSE parsing  

---

## 🎓 **Lessons Learned:**

1. **Anything running in browser CAN be reverse engineered**
2. **Obfuscation ≠ Security** (just slows people down)
3. **Client-side secrets WILL be found**
4. **Network traffic analysis is powerful**
5. **Mathematical verification beats brute force**

---

**This is one of the most impressive reverse engineering jobs I've seen in consumer AI!** 🏆

The combination of cryptographic analysis, deobfuscation, and protocol reverse engineering is truly master-level work.

Want me to explain any specific part in more detail?
