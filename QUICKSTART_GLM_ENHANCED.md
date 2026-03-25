# 🚀 GLM Enhanced Server - Quick Start Guide

## ⚡ **Start Server (30 seconds):**

```bash
cd "c:\Users\Ronit\Downloads\test models 2"
python glm_server_enhanced.py --eager-boot
```

**Wait for:**
```
╔══════════════════════════════════════════════════════╗
║      GLM-5 · ENHANCED EDITION  v3                    ║
╠══════════════════════════════════════════════════════╣
║  ✅ Web Search: ENABLED (auto)                       ║
║  ✅ MCP Servers: advanced-search                     ║
║  ✅ Models: 5 available                     ║
║                                                      ║
║  Base URL  :  http://127.0.0.1:8001/v1          ║
╚══════════════════════════════════════════════════════╝
```

---

## 🎯 **Quick Test (10 seconds):**

### **Option 1: Browser**
Open in browser: `http://localhost:8001/v1/models`

### **Option 2: Command Line**
```bash
curl http://localhost:8001/v1/models
```

### **Option 3: Python**
```python
import requests
r = requests.get("http://localhost:8001/v1/models")
print(r.json())
```

---

## 💻 **Usage with OpenAI SDK:**

### **Setup:**
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8001/v1",
    api_key="glm-local"  # Any key works
)
```

### **Use GLM-5 (Flagship):**
```python
response = client.chat.completions.create(
    model="glm-5",
    messages=[
        {"role": "user", "content": "What are the latest AI news?"}
    ],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content, end='')
```

### **Switch to GLM-4.7 (Faster):**
```python
response = client.chat.completions.create(
    model="glm-4.7",
    messages=[
        {"role": "user", "content": "Explain quantum computing"}
    ]
)

print(response.choices[0].message.content)
```

---

## 📋 **All Available Models:**

| Model | Best For | Speed | Quality | Web Search |
|-------|----------|-------|---------|------------|
| **glm-5** | Complex tasks | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ Yes |
| **glm-4.7** | Quick answers | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | ✅ Yes |
| **glm-4.6v** | Vision tasks | ⚡⚡⚡ | ⭐⭐⭐⭐ | ✅ Yes |
| **glm-air** | Simple queries | ⚡⚡⚡⚡⚡ | ⭐⭐⭐ | ❌ No |
| **glm-edge** | Maximum speed | ⚡⚡⚡⚡⚡ | ⭐⭐⭐ | ❌ No |

---

## 🌐 **Web Search Features:**

### **Automatically Triggers For:**
- Current events ("today's news")
- Recent developments ("this week")
- Live information ("current price")
- Breaking news ("latest updates")

### **Example Queries:**
```python
queries = [
    "What are today's top technology news?",
    "Latest AI breakthroughs this month",
    "Who won the recent championship?",
    "Current weather in Tokyo",
    "Recent scientific discoveries"
]
```

### **Expected Response Time:**
- **Without web search**: 5-15 seconds
- **With web search**: 15-60 seconds

---

## 🔧 **Common Commands:**

### **Check Health:**
```bash
curl http://localhost:8001/health
```

**Response:**
```json
{
  "status": "ok",
  "session": "active",
  "web_search": true,
  "mcp_servers": ["advanced-search"],
  "current_model": "glm-5"
}
```

### **List Models:**
```bash
curl http://localhost:8001/v1/models
```

### **Reset Session:**
```bash
curl -X POST http://localhost:8001/v1/session/reset
```

---

## ⚠️ **Troubleshooting:**

### **Port Already in Use:**
```bash
# Kill process on port 8001
netstat -ano | findstr :8001
taskkill /PID <PID> /F

# Or use different port
python glm_server_enhanced.py --port 8002
```

### **Timeout Errors:**
- Use streaming mode (`stream=True`)
- Increase timeout in code
- Web search takes longer (normal)

### **Model Not Found:**
```bash
# Check available models
curl http://localhost:8001/v1/models

# Make sure you're using exact model name
model: "glm-5"  # ✓ Correct
model: "glm5"   # ✗ Wrong
```

---

## 📊 **Performance Benchmarks:**

### **Quantum Computing Question Test:**

**GLM-5:**
- Response Time: ~46 seconds
- Tokens/sec: 0.2
- Quality: Excellent (detailed explanation)

**GLM-4.7:**
- Response Time: ~24 seconds  
- Tokens/sec: 0.3
- Quality: Very Good (concise)

**Recommendation:**
- Use **GLM-5** for quality-critical tasks
- Use **GLM-4.7** for faster responses

---

## 🎯 **Best Practices:**

### **For Development:**
```python
# Always use streaming during development
response = client.chat.completions.create(
    model="glm-5",
    messages=[...],
    stream=True  # See tokens as they generate
)
```

### **For Production:**
```python
# Non-streaming for simpler integration
try:
    response = client.chat.completions.create(
        model="glm-4.7",  # Faster for users
        messages=[...],
        timeout=120  # Longer timeout
    )
except Exception as e:
    # Fallback to GLM-5
    response = client.chat.completions.create(
        model="glm-5",
        messages=[...]
    )
```

### **For Web Search:**
```python
# Be specific about time sensitivity
good_prompts = [
    "What are the latest AI news THIS WEEK?",
    "CURRENT price of Bitcoin",
    "RECENT NBA game results"
]

# Avoid vague time references
bad_prompts = [
    "Tell me about recent events",  # Too vague
    "What's new in tech?"           # Could be any time
]
```

---

## 🚀 **Advanced Usage:**

### **Multi-Turn Conversation:**
```python
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "I'm learning Python."},
    {"role": "assistant", "content": "Great choice! What would you like to learn?"},
    {"role": "user", "content": "How do I read files?"}
]

response = client.chat.completions.create(
    model="glm-5",
    messages=messages
)
```

### **System Prompts:**
```python
messages = [
    {"role": "system", "content": "You are a math tutor. Explain step-by-step."},
    {"role": "user", "content": "Solve x^2 = 16"}
]

response = client.chat.completions.create(
    model="glm-5",
    messages=messages
)
```

---

## 📞 **API Reference:**

### **Endpoints:**

```
GET  /v1/models              → List all models
POST /v1/chat/completions    → Chat completion
GET  /health                 → Server health
GET  /models                 → Model details
GET  /v1/debug/websearch     → Web search config
POST /v1/session/reset       → Reset session
```

### **Request Format:**
```json
{
  "model": "glm-5",
  "messages": [
    {"role": "system", "content": "You are helpful"},
    {"role": "user", "content": "Hello"}
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 2000
}
```

### **Response Format:**
```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1700000000,
  "model": "glm-5",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you?"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8,
    "total_tokens": 18
  }
}
```

---

## 🎉 **You're Ready!**

Your GLM server is now:
- ✅ Running on port 8001
- ✅ Web search enabled
- ✅ All 5 models available
- ✅ OpenAI compatible
- ✅ Ready for production use

**Happy chatting with GLM! 🚀**

---

**Server URL:** http://localhost:8001/v1  
**Models:** 5 (glm-5, glm-4.7, glm-4.6v, glm-air, glm-edge)  
**Web Search:** ✅ Enabled  
**Status:** 🟢 Operational
