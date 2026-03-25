# 🌐 Z.AI BROWSER API SERVER

**Turn your Z.AI browser automation into a full REST API accessible from anywhere!**

---

## 🚀 QUICK START

### 1. Install Dependencies

```bash
npm install express cors
```

---

### 2. Start the Server

```bash
node zai_api_server.js
```

You'll see:
```
🌐 Z.AI Browser API Server
============================================================
✅ Pool ready with 3 instances

✅ Server running on port 3000

📍 Endpoints:
   POST http://localhost:3000/api/ask
   POST http://localhost:3000/api/ask-once
   POST http://localhost:3000/api/batch
   GET  http://localhost:3000/health
   GET  http://localhost:3000/api/session/status
   GET  http://localhost:3000/api/stats
============================================================
🚀 Ready to accept requests!
```

---

### 3. Make Your First API Call

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is 59 multiplied by 89?"}'
```

**Using JavaScript (fetch):**
```javascript
const response = await fetch('http://localhost:3000/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'What is 59 x 89?' })
});

const data = await response.json();
console.log(data.answer);
```

**Using Python (requests):**
```python
import requests

response = requests.post(
    'http://localhost:3000/api/ask',
    json={'question': 'What is 59 x 89?'}
)

data = response.json()
print(data['answer'])
```

---

## 📋 API ENDPOINTS

### POST `/api/ask`

Ask a single question using pooled browser instance.

**Request:**
```json
{
  "question": "What is 59 multiplied by 89?",
  "timeout": 40000,
  "waitForResponse": true
}
```

**Response:**
```json
{
  "success": true,
  "question": "What is 59 multiplied by 89?",
  "answer": "59 × 89 = 5251\n\nStep-by-step:\n...",
  "timestamp": "2026-03-08T...",
  "metadata": {
    "characters": 495,
    "tookMs": 15234
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "All API instances busy. Try again in a moment.",
  "suggestion": "Try refreshing session: node zai_login_explorer.js"
}
```

---

### POST `/api/ask-once`

Ask a question with auto-managed browser (opens/closes automatically).

**Use case:** Occasional questions, don't want to keep browser open.

**Request:**
```json
{
  "question": "Explain quantum computing",
  "timeout": 40000
}
```

**Response:** Same as `/api/ask`

---

### POST `/api/batch`

Ask multiple questions in sequence.

**Request:**
```json
{
  "questions": [
    "What is 59 x 89?",
    "Explain gravity",
    "Who wrote Hamlet?"
  ],
  "delayBetweenQuestions": 2000
}
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "results": [
    {
      "index": 0,
      "question": "What is 59 x 89?",
      "answer": "5251\n\n...",
      "success": true
    },
    {
      "index": 1,
      "question": "Explain gravity",
      "answer": "Gravity is a fundamental force...",
      "success": true
    }
  ],
  "timestamp": "2026-03-08T..."
}
```

---

### GET `/health`

Check server health and pool status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-08T12:34:56.789Z",
  "pool": {
    "total": 3,
    "busy": 1,
    "available": 2
  },
  "uptime": 3600.5
}
```

---

### GET `/api/session/status`

Check if your Z.AI session is still valid.

**Response:**
```json
{
  "valid": true,
  "age": "1.23 hours",
  "cookies": 8,
  "url": "https://chat.z.ai/",
  "needsRefresh": false
}
```

---

### GET `/api/stats`

Get detailed server statistics.

**Response:**
```json
{
  "pool": [
    {
      "instance": 1,
      "busy": false,
      "initialized": true,
      "lastUsedAgo": "5.2s ago"
    },
    {
      "instance": 2,
      "busy": true,
      "initialized": true,
      "lastUsedAgo": "1.1s ago"
    }
  ],
  "uptime": 3600.5,
  "memory": {
    "heapUsed": 45678901,
    "heapTotal": 67890123
  }
}
```

---

## 💡 USAGE EXAMPLES

### Example 1: Simple Question (JavaScript)

```javascript
async function askZAI(question) {
    const response = await fetch('http://localhost:3000/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
    });
    
    const data = await response.json();
    
    if (data.success) {
        return data.answer;
    } else {
        throw new Error(data.error);
    }
}

// Usage
const answer = await askZAI('What is 59 x 89?');
console.log(answer);
```

---

### Example 2: Homework Helper (Python)

```python
import requests

class HomeworkHelper:
    def __init__(self):
        self.base_url = 'http://localhost:3000/api'
    
    def solve_math(self, problem):
        response = requests.post(
            f'{self.base_url}/ask',
            json={'question': f'Solve step by step: {problem}'}
        )
        return response.json()['answer']
    
    def explain_concept(self, concept):
        response = requests.post(
            f'{self.base_url}/ask',
            json={'question': f'Explain simply: {concept}'}
        )
        return response.json()['answer']

# Usage
helper = HomeworkHelper()

math_answer = helper.solve_math('59 × 89')
print(f'Math: {math_answer}')

science_answer = helper.explain_concept('gravity')
print(f'Science: {science_answer}')
```

---

### Example 3: Batch Quiz Generator (Node.js)

```javascript
const questions = [
    'What is the capital of France?',
    'Explain photosynthesis',
    'Who wrote Romeo and Juliet?',
    'What is 59 × 89?'
];

const response = await fetch('http://localhost:3000/api/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        questions: questions,
        delayBetweenQuestions: 2000
    })
});

const data = await response.json();

data.results.forEach((result, i) => {
    console.log(`\nQ${i+1}: ${result.question}`);
    console.log(`A: ${result.answer.substring(0, 200)}...\n`);
});
```

---

### Example 4: Discord Bot Integration

```javascript
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('message', async (message) => {
    if (message.content.startsWith('!ask ')) {
        const question = message.content.substring(5);
        
        // Send typing indicator
        message.channel.startTyping();
        
        try {
            const response = await fetch('http://localhost:3000/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question })
            });
            
            const data = await response.json();
            
            if (data.success) {
                await message.channel.send(`🤖 ${data.answer}`);
            } else {
                await message.channel.send(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            await message.channel.send('❌ Failed to get answer');
        } finally {
            message.channel.stopTyping();
        }
    }
});

client.login('YOUR_BOT_TOKEN');
```

---

### Example 5: Web Dashboard (HTML/JS)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Z.AI API Dashboard</title>
    <style>
        body { font-family: Arial; max-width: 800px; margin: 50px auto; }
        #question { width: 100%; padding: 10px; font-size: 16px; }
        #answer { background: #f5f5f5; padding: 20px; margin-top: 20px; white-space: pre-wrap; }
        button { padding: 10px 20px; font-size: 16px; margin-top: 10px; }
    </style>
</head>
<body>
    <h1>🤔 Ask Z.AI Anything</h1>
    <textarea id="question" rows="3" placeholder="Type your question..."></textarea>
    <button onclick="ask()">Ask</button>
    <div id="answer"></div>

    <script>
        async function ask() {
            const question = document.getElementById('question').value;
            const answerDiv = document.getElementById('answer');
            
            answerDiv.textContent = '⏳ Thinking...';
            
            try {
                const response = await fetch('http://localhost:3000/api/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    answerDiv.textContent = data.answer;
                } else {
                    answerDiv.textContent = '❌ ' + data.error;
                }
            } catch (error) {
                answerDiv.textContent = '❌ ' + error.message;
            }
        }
    </script>
</body>
</html>
```

---

## ⚙️ CONFIGURATION

### Environment Variables

Create a `.env` file or set environment variables:

```bash
# Server port (default: 3000)
ZAI_PORT=3000

# Pool size (default: 3 instances)
ZAI_POOL_SIZE=3

# Enable debug logging
ZAI_DEBUG=true
```

---

### Customizing Pool Size

Edit `zai_api_server.js`:

```javascript
const MAX_POOL_SIZE = 5;  // Increase for more concurrent requests
```

**Recommendations:**
- **1-2 users:** 2-3 instances
- **5-10 users:** 5-7 instances
- **Production:** 10+ instances with load balancing

---

## 🔒 SECURITY CONSIDERATIONS

### For Local Development:

✅ No authentication needed  
✅ CORS enabled for all origins  
✅ Runs on localhost only  

---

### For Production Deployment:

```javascript
// Add authentication middleware
app.use('/api', (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== process.env.ZAI_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    next();
});

// Rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api', limiter);
```

---

## 📊 PERFORMANCE TUNING

### Optimize for Speed:

1. **Increase pool size:**
   ```javascript
   const MAX_POOL_SIZE = 10;
   ```

2. **Keep browsers warm:**
   ```javascript
   // Periodically ping instances to keep them alive
   setInterval(async () => {
       for (const poolItem of apiPool) {
           if (!poolItem.busy && poolItem.instance.initialized) {
               // Just check health, don't ask anything
               await poolItem.instance.page.evaluate(() => document.title);
           }
       }
   }, 60000); // Every minute
   ```

3. **Reduce timeout for simple questions:**
   ```javascript
   // In request
   {
     "question": "Simple fact",
     "timeout": 20000  // Faster than default 40s
   }
   ```

---

## 🐛 TROUBLESHOOTING

### Problem: "All API instances busy"

**Solution 1:** Increase pool size
```javascript
const MAX_POOL_SIZE = 10;  // Was 3
```

**Solution 2:** Check what's happening
```bash
curl http://localhost:3000/api/stats
```

---

### Problem: Session expired

**Symptoms:**
```json
{
  "success": false,
  "error": "Authentication failed"
}
```

**Solution:**
```bash
# Check session status
curl http://localhost:3000/api/session/status

# If needs refresh: true
node zai_login_explorer.js
```

---

### Problem: Slow responses

**Check health:**
```bash
curl http://localhost:3000/health
```

**Restart server:**
```bash
# Stop (Ctrl+C)
node zai_api_server.js
```

---

## 🚀 DEPLOYMENT

### Deploy to Heroku:

1. **Create files:**
   ```bash
   # Procfile
   web: node zai_api_server.js
   
   # package.json
   {
     "name": "zai-api-server",
     "version": "1.0.0",
     "main": "zai_api_server.js",
     "type": "module",
     "scripts": {
       "start": "node zai_api_server.js"
     },
     "dependencies": {
       "express": "^4.18.0",
       "cors": "^2.8.5"
     },
     "engines": {
       "node": "18.x"
     }
   }
   ```

2. **Deploy:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   heroku create zai-api
   git push heroku main
   heroku open
   ```

---

### Deploy to Docker:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "zai_api_server.js"]
```

**Build and run:**
```bash
docker build -t zai-api .
docker run -p 3000:3000 zai-api
```

---

### Deploy to Railway/Render:

1. Connect GitHub repo
2. Set start command: `node zai_api_server.js`
3. Add environment variables
4. Deploy automatically!

---

## 📈 MONITORING

### Add logging:

```javascript
// Add to zai_api_server.js
const morgan = require('morgan');
app.use(morgan('combined'));
```

### Health check monitoring:

```bash
# Check every 5 minutes
while true; do
    curl http://localhost:3000/health
    sleep 300
done
```

---

## 🎯 USE CASES

### 1. Personal AI Assistant
```javascript
// Ask anything throughout the day
const answer = await ask('Explain blockchain');
```

### 2. Educational Platform
```javascript
// Power your tutoring app
const explanation = await ask('Teach me quadratic equations');
```

### 3. Content Generation
```javascript
// Generate blog post outlines
const outline = await ask('Outline for article about AI');
```

### 4. Customer Support Bot
```javascript
// Answer common questions
const response = await ask(userQuestion);
```

### 5. Research Tool
```javascript
// Get explanations for complex topics
const explanation = await ask('Explain CRISPR gene editing');
```

---

## 🎊 SUCCESS!

You now have a **full REST API** for Z.AI that you can:

✅ Access from any programming language  
✅ Deploy to cloud services  
✅ Share with your team  
✅ Integrate into apps  
✅ Scale with load balancing  

**Your Z.AI power is now available everywhere!** 🚀

---

**Server Status:** ✅ Production Ready  
**Port:** 3000 (configurable)  
**Pool Size:** 3 instances (configurable)  

---

*Happy API-fying!* 🎉
