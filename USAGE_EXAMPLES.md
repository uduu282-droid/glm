# 🚀 GLM-5 Usage Examples

## Quick Reference

The Python implementation provides free access to GLM-5 through Z.ai's service.

---

## 1. Direct CLI Usage

### Interactive Mode
```bash
py glm.py
```

Example session:
```
z.ai GLM-5 client  (secret: key-@@@@))…)

[1] Seeding cookies …
    status=200
[2] Authenticating …
    guest=Guest-1774947018986@guest.com

[3] Starting chat …  (type 'exit' or Ctrl-C to quit)

────────────────────────────────────────────────────────────
  You › What is 2+2?

  [thinking]  ...
  GLM-5 › 2 + 2 equals 4.
  [42 tokens]

────────────────────────────────────────────────────────────
  You › exit
Goodbye.
```

### Single Message Mode
```bash
py glm.py "Explain quantum computing in one sentence"
```

---

## 2. OpenAI-Compatible Server

### Start Server
```bash
# Default (port 8000)
py glm_server.py

# Custom port
py glm_server.py --port 11434

# Pre-boot session (faster first request)
py glm_server.py --eager-boot
```

Server output:
```
╔══════════════════════════════════════════════════════╗
║      GLM-5  ·  OpenAI-compatible proxy  v2           ║
╠══════════════════════════════════════════════════════╣
║  Base URL  :  http://127.0.0.1:8000/v1               ║
║  Models    :  GET  /v1/models                        ║
║  Chat      :  POST /v1/chat/completions              ║
║  Reset     :  POST /v1/session/reset                 ║
║  Health    :  GET  /health                           ║
╚══════════════════════════════════════════════════════╝

  OPENAI_API_BASE = http://127.0.0.1:8000/v1
  OPENAI_API_KEY  = glm-local
```

---

## 3. Using with Python OpenAI Client

```python
import openai

# Configure client
client = openai.OpenAI(
    base_url="http://127.0.0.1:8000/v1",
    api_key="glm-local"  # any value works
)

# Simple chat
response = client.chat.completions.create(
    model="glm-5",
    messages=[
        {"role": "user", "content": "What is Python?"}
    ]
)

print(response.choices[0].message.content)

# Streaming chat
stream = client.chat.completions.create(
    model="glm-5",
    messages=[
        {"role": "user", "content": "Count from 1 to 5"}
    ],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

---

## 4. Using with Node.js

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
    baseURL: 'http://127.0.0.1:8000/v1',
    apiKey: 'glm-local'
});

// Simple chat
const response = await client.chat.completions.create({
    model: 'glm-5',
    messages: [
        { role: 'user', content: 'Hello!' }
    ]
});

console.log(response.choices[0].message.content);

// Streaming
const stream = await client.chat.completions.create({
    model: 'glm-5',
    messages: [
        { role: 'user', content: 'Tell me a joke' }
    ],
    stream: true
});

for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

---

## 5. Using with curl

### Health Check
```bash
curl http://127.0.0.1:8000/health
```

Response:
```json
{
  "status": "ok",
  "session": "active",
  "turns": 5,
  "chat_id": "b6886acd-f7c6-4d41-93a5-7034bb9264d4"
}
```

### List Models
```bash
curl http://127.0.0.1:8000/v1/models
```

Response:
```json
{
  "object": "list",
  "data": [{
    "id": "glm-5",
    "object": "model",
    "created": 1700000000,
    "owned_by": "zhipuai"
  }]
}
```

### Chat Completion (Non-Streaming)
```bash
curl http://127.0.0.1:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer glm-local" \
  -d '{
    "model": "glm-5",
    "messages": [
      {"role": "user", "content": "What is 2+2?"}
    ]
  }'
```

Response:
```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1711872000,
  "model": "glm-5",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "2 + 2 equals 4."
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0
  }
}
```

### Chat Completion (Streaming)
```bash
curl http://127.0.0.1:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer glm-local" \
  -d '{
    "model": "glm-5",
    "messages": [
      {"role": "user", "content": "Count to 3"}
    ],
    "stream": true
  }'
```

Response (SSE format):
```
data: {"id":"chatcmpl-xyz","choices":[{"delta":{"role":"assistant"}}]}

data: {"id":"chatcmpl-xyz","choices":[{"delta":{"content":"1"}}]}

data: {"id":"chatcmpl-xyz","choices":[{"delta":{"content":","}}]}

data: {"id":"chatcmpl-xyz","choices":[{"delta":{"content":" 2"}}]}

data: {"id":"chatcmpl-xyz","choices":[{"delta":{"content":","}}]}

data: {"id":"chatcmpl-xyz","choices":[{"delta":{"content":" 3"}}]}

data: {"id":"chatcmpl-xyz","choices":[{"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

### Reset Session
```bash
curl -X POST http://127.0.0.1:8000/v1/session/reset
```

Response:
```json
{
  "status": "reset",
  "message": "Session cleared – next request boots a fresh chat."
}
```

---

## 6. Using with Cursor IDE

1. Open Cursor Settings
2. Go to "Models" or "AI" section
3. Add custom model:
   - Provider: OpenAI Compatible
   - Base URL: `http://127.0.0.1:8000/v1`
   - API Key: `glm-local`
   - Model: `glm-5`

4. Start using GLM-5 in Cursor!

---

## 7. Using with Cline (VS Code Extension)

1. Install Cline extension
2. Open Cline settings
3. Configure custom API:
   ```json
   {
     "cline.apiProvider": "openai-compatible",
     "cline.apiBaseUrl": "http://127.0.0.1:8000/v1",
     "cline.apiKey": "glm-local",
     "cline.model": "glm-5"
   }
   ```

4. Start chatting with GLM-5!

---

## 8. Advanced: System Prompts

```python
import openai

client = openai.OpenAI(
    base_url="http://127.0.0.1:8000/v1",
    api_key="glm-local"
)

response = client.chat.completions.create(
    model="glm-5",
    messages=[
        {
            "role": "system",
            "content": "You are a helpful Python programming assistant. Always provide code examples."
        },
        {
            "role": "user",
            "content": "How do I read a file in Python?"
        }
    ]
)

print(response.choices[0].message.content)
```

**Note**: System prompt is only used on the first message of a session.

---

## 9. Handling Rate Limits

### In Python
```python
import openai
import time

client = openai.OpenAI(
    base_url="http://127.0.0.1:8000/v1",
    api_key="glm-local"
)

def chat_with_retry(message, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="glm-5",
                messages=[{"role": "user", "content": message}]
            )
            return response.choices[0].message.content
        except Exception as e:
            if "CONCURRENCY_LIMIT" in str(e) and attempt < max_retries - 1:
                wait_time = 2 ** attempt  # exponential backoff
                print(f"Rate limited, retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise

# Use it
result = chat_with_retry("What is AI?")
print(result)
```

### In Node.js
```javascript
async function chatWithRetry(message, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await client.chat.completions.create({
                model: 'glm-5',
                messages: [{ role: 'user', content: message }]
            });
            return response.choices[0].message.content;
        } catch (error) {
            if (error.message.includes('CONCURRENCY_LIMIT') && attempt < maxRetries - 1) {
                const waitTime = Math.pow(2, attempt) * 1000;
                console.log(`Rate limited, retrying in ${waitTime/1000}s...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            } else {
                throw error;
            }
        }
    }
}

// Use it
const result = await chatWithRetry('What is AI?');
console.log(result);
```

---

## 10. Session Management

### Check Session Status
```bash
curl http://127.0.0.1:8000/health
```

### Reset Session (Start Fresh Chat)
```bash
curl -X POST http://127.0.0.1:8000/v1/session/reset
```

**When to reset**:
- Starting a new topic
- Context getting too long
- Want to clear conversation history

---

## 📝 Tips & Best Practices

1. **Session Persistence**: The server maintains one session across all requests. This means conversation history is preserved.

2. **Rate Limits**: Z.ai's free tier has concurrency limits. Use retry logic or try during off-peak hours.

3. **System Prompts**: Only effective on the first message. Reset session to change system prompt.

4. **Streaming**: Use streaming for better UX in interactive applications.

5. **Error Handling**: Always implement retry logic for production use.

6. **Port Conflicts**: If port 8000 is busy, use `--port` flag to specify different port.

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port is in use
netstat -ano | findstr :8000

# Use different port
py glm_server.py --port 8001
```

### Rate limit errors
```bash
# Reset session and try again
curl -X POST http://127.0.0.1:8000/v1/session/reset

# Or wait a few minutes and retry
```

### Connection refused
```bash
# Make sure server is running
curl http://127.0.0.1:8000/health

# Check server logs for errors
```

---

**Happy coding with GLM-5! 🚀**
