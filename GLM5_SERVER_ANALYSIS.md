# 🚀 GLM-5 OpenAI-Compatible Server Analysis

## 📋 **What is This?**

**glm_server.py** is an **OpenAI-compatible API proxy** that provides free access to **Z.ai's GLM-5** (by Zhipu AI) through a local FastAPI server.

### The Magic:
- Reverse-engineered from Z.ai's web interface
- Creates persistent chat sessions (no re-authentication per request)
- Streams tokens in real-time via SSE
- Fully compatible with OpenAI SDK format

---

## ⚡ **Key Features**

### 1. **OpenAI-Compatible API**
```python
# Use with ANY OpenAI client
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="glm-local"  # ignored but required
)

response = client.chat.completions.create(
    model="glm-5",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### 2. **Persistent Session**
- Boots **once** on first request
- Reuses same `ChatSession` forever
- Maintains conversation history server-side
- No cookie seeding on every turn

### 3. **Real-time Streaming**
- Token-by-token streaming via SSE
- Separates thinking vs answer phases
- Doesn't stream thinking tokens (cleaner output)

### 4. **Smart Message Handling**
- Only sends **last user message** to GLM
- System prompt injected once on turn 1
- Full history managed server-side via UUID chains

---

## 🔧 **Architecture**

### Components:

#### 1. **StreamingChatSession** (Lines 60-217)
```python
class StreamingChatSession(ChatSession):
    """Extends GLM's ChatSession with real-time token callbacks"""
    
    on_token = None  # Callback for each answer token
    
    def _complete(self, message, user_msg_id, parent_comp_id):
        # Builds complex request with browser fingerprinting
        # Parses SSE stream token-by-token
        # Calls on_token(delta) for real-time streaming
```

**Key Tricks:**
- Mimics Firefox browser on Linux
- Generates cryptographic signatures
- Handles Z.ai's complex authentication dance
- Phase detection (thinking → answer → done)

#### 2. **Session Manager** (Lines 224-245)
```python
_session_lock = threading.Lock()
_glm_chat: StreamingChatSession | None = None
_request_lock = threading.Lock()

def _get_chat():
    # Singleton pattern - boot once, reuse forever
    if _glm_chat is None:
        with _session_lock:
            if _glm_chat is None:
                http, auth = _boot()  # Authenticate with Z.ai
                _glm_chat = StreamingChatSession(http, auth)
    return _glm_chat
```

**Thread Safety:**
- `_session_lock`: Protects session creation
- `_request_lock`: Serializes concurrent requests
- One global session shared across all requests

#### 3. **FastAPI Endpoints** (Lines 385-465)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/models` | GET | List available models (glm-5) |
| `/v1/chat/completions` | POST | Generate responses (streaming/non-streaming) |
| `/health` | GET | Check session status |
| `/v1/session/reset` | POST | Force-reset chat session |
| `/v1/debug` | POST | Echo requests for debugging |

#### 4. **Request Processor** (Lines 358-379)
```python
def _sync_send(messages: list[Message], token_sink=None) -> str:
    with _request_lock:  # One at a time!
        chat = _get_chat()
        is_first = chat.turn == 0
        text = _last_user_msg(messages, is_first)
        
        chat.on_token = token_sink  # For streaming
        if is_first:
            chat.start(text)  # Turn 1: system + user
        else:
            chat.send(text)   # Turn N: user only
```

---

## 🎯 **How It Works**

### Authentication Flow:

```
1. First Request Arrives
   ↓
2. _get_chat() called
   ↓
3. _boot() authenticates with Z.ai
   ├─ Seeds cookies
   ├─ Gets auth token
   └─ Returns (http_client, auth_info)
   ↓
4. StreamingChatSession created
   ↓
5. Session cached globally
   ↓
6. All future requests reuse same session
```

### Request Flow (Turn 1):

```
User: "Hello, I'm Bob"  (with system prompt)
   ↓
_last_user_msg() extracts:
   "You are helpful.\n\nHello, I'm Bob"
   ↓
chat.start(message)
   ├─ Generates UUIDs for message chain
   ├─ Signs request with timestamp
   ├─ Adds browser fingerprint
   └─ POSTs to https://chat.z.ai/api/v2/chat/completions
   ↓
SSE Stream Response:
   data: {"type":"chat:completion","data":{"phase":"thinking","delta_content":"..."}}
   data: {"type":"chat:completion","data":{"phase":"answer","delta_content":"Hi"}}
   ...
   ↓
Tokens streamed to client in real-time
   ↓
Full response cached server-side
```

### Request Flow (Turn N):

```
User: "What's my name?"
   ↓
_last_user_msg() extracts ONLY:
   "What's my name?"
   ↓
chat.send(message)
   ├─ Uses existing chat_id
   ├─ Links to previous turn via parent_id
   └─ GLM remembers full context
   ↓
Response: "Your name is Bob"
```

---

## 📦 **Dependencies**

### Required:
```bash
pip install fastapi uvicorn curl_cffi
```

### GLM Library:
The code imports from a custom `glm` module:
```python
from glm import (
    BH, FE, UA,           # Browser headers & fingerprints
    ChatSession,          # Base session class
    _boot,                # Boot/authenticate
    _ms, _s, _uid,        # Time & UUID utilities
    _ist, _utcs, _iso,    # Timezone helpers
    sign,                 # Request signature generator
)
```

**Note:** This `glm` library is NOT the official Zhipu AI SDK - it's a reverse-engineered wrapper specific to this project.

---

## 🔍 **Browser Fingerprinting**

The server meticulously mimics a real browser:

```python
params = {
    "user_agent": "Mozilla/5.0 ... Firefox",
    "language": "en-US",
    "timezone": "Asia/Kolkata",
    "screen_width": "1600",
    "screen_height": "900",
    "color_depth": "24",
    "pixel_ratio": "1.2",
    "current_url": "https://chat.z.ai/c/{chat_id}",
    "pathname": f"/c/{chat_id}",
    "host": "chat.z.ai",
    "os_name": "Linux",
    # ... 30+ more fields
}
```

**Why?** Z.ai likely has bot detection - this keeps the session alive longer.

---

## 🚦 **Usage Examples**

### Start Server:

```bash
# Basic start
python glm_server.py

# Custom port
python glm_server.py --port 11434

# Pre-boot session (faster first response)
python glm_server.py --eager-boot
```

### Test Endpoints:

```bash
# Health check
curl http://localhost:8000/health

# List models
curl http://localhost:8000/v1/models

# Non-streaming chat
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# Streaming chat
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5",
    "messages": [{"role": "user", "content": "Tell me a story"}],
    "stream": true
  }'

# Reset session
curl -X POST http://localhost:8000/v1/session/reset
```

### Use with OpenAI Python SDK:

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="glm-local"
)

# Non-streaming
response = client.chat.completions.create(
    model="glm-5",
    messages=[
        {"role": "system", "content": "You are helpful."},
        {"role": "user", "content": "Hello!"}
    ]
)
print(response.choices[0].message.content)

# Streaming
stream = client.chat.completions.create(
    model="glm-5",
    messages=[{"role": "user", "content": "Tell me a joke"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

---

## ⚠️ **Important Notes**

### 1. **Rate Limits**
- Depends on Z.ai's free tier policies
- Session-based tracking (not IP-based)
- May hit limits with heavy usage

### 2. **Stability**
- Tied to Z.ai's web interface structure
- If they change their API, this breaks
- Requires updating the `glm` library

### 3. **Legal/Ethical**
- Reverse engineering may violate ToS
- For personal/research use only
- Not for commercial deployment

### 4. **Performance**
- Single global session = serialized requests
- `_request_lock` prevents concurrency
- Latency depends on Z.ai servers (China-based)

---

## 🎨 **Advanced Features**

### Thinking Mode:
```python
"features": {
    "enable_thinking": True,  # GLM thinks before answering
    "auto_web_search": True,  # Can search web for info
    "preview_mode": True,
}
```

**Thinking tokens** are captured but NOT streamed to client (cleaner UX).

### MCP Servers:
```python
"mcp_servers": ["advanced-search"]
```
Enables advanced search capabilities via Z.ai's infrastructure.

### Variable Injection:
```python
"variables": {
    "{{USER_NAME}}": auth["name"],
    "{{CURRENT_DATETIME}}": "2026-03-23 10:30:00",
    "{{USER_LANGUAGE}}": "en-US",
    # ... more
}
```
Personalizes responses with contextual info.

---

## 🐛 **Error Handling**

### Auto-Recovery:
```python
try:
    if is_first:
        chat.start(text)
    else:
        chat.send(text)
except Exception:
    _reset_chat()  # Auto-reset on error
    raise
```

Any error triggers session reset - next request boots fresh.

### SSE Error Detection:
```python
if "error" in data:
    sse_err[0] = data["error"]
    return  # Stop processing stream
```

Catches errors mid-stream before completion.

---

## 📊 **Comparison with Alternatives**

| Feature | GLM-5 Server | Ollama | LM Studio |
|---------|--------------|--------|-----------|
| Model Quality | High (GLM-5) | Varies | Varies |
| Cost | Free (Z.ai) | Free (local) | Free/Paid |
| Setup Complexity | Medium | Easy | Easy |
| Streaming | ✅ Yes | ✅ Yes | ✅ Yes |
| Context Memory | ✅ Persistent | ✅ Persistent | ✅ Persistent |
| Web Search | ✅ Built-in | ❌ | ❌ |
| Stability | ⚠️ Depends on Z.ai | ✅ Stable | ✅ Stable |

---

## 💡 **Use Cases**

### Perfect For:
1. **Developers** needing free high-quality LLM access
2. **Prototyping** without API costs
3. **Research** on multi-agent systems
4. **Testing** OpenAI-compatible tools locally

### Not Ideal For:
1. **Production systems** (unreliable dependency)
2. **High-throughput** needs (serialized requests)
3. **Commercial products** (ToS violations)

---

## 🔮 **Future Enhancements**

Potential improvements:
- [ ] Multi-session pooling for concurrency
- [ ] Retry logic with exponential backoff
- [ ] Token counting & usage stats
- [ ] Image generation support
- [ ] Web search result caching
- [ ] Multiple model support (GLM-4, GLM-Edge)

---

## 📝 **Summary**

**glm_server.py** is a clever reverse-engineering of Z.ai's GLM-5 chatbot, providing:

✅ Free access to powerful LLM  
✅ OpenAI-compatible API  
✅ Persistent conversations  
✅ Real-time streaming  
✅ Smart session management  

⚠️ But relies on Z.ai's continued compatibility  

**Best used for:** Development, testing, research, personal projects  

---

## 🎯 **Quick Start Commands**

```bash
# Install dependencies
pip install fastapi uvicorn curl_cffi

# Start server with pre-boot
python glm_server.py --eager-boot

# In another terminal, test it
curl http://localhost:8000/health
curl http://localhost:8000/v1/models

# Use with Python
pip install openai
# Then run your OpenAI-compatible code!
```

---

**Bottom Line:** This is a well-crafted bridge between Z.ai's free GLM-5 service and the OpenAI ecosystem. Perfect for experimentation and development! 🚀
