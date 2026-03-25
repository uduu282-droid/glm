# 🚀 Z.AI BROWSER API - COMPLETE USAGE GUIDE

**Version:** 2.0  
**Status:** ✅ Production Ready  
**Last Updated:** March 8, 2026  

---

## 📖 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Basic Usage](#basic-usage)
3. [Advanced Features](#advanced-features)
4. [Examples](#examples)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 QUICK START

### Installation (Already Done!)

Everything you need is already in this folder:
- ✅ `zai_browser_api.js` - Main API wrapper
- ✅ Session data in `universal-ai-proxy/zai-session.json`

### Your First API Call

```bash
# Test it right now!
node zai_browser_api.js
```

This will ask "What is 59 × 55?" and show you the complete answer!

---

## 📚 BASIC USAGE

### Example 1: Single Question

```javascript
import ZAIBrowserAPI from './zai_browser_api.js';

const api = new ZAIBrowserAPI();

try {
    // Ask one question (auto opens and closes browser)
    const answer = await api.askOnce('What is the capital of France?');
    console.log(answer);
} catch (error) {
    console.error(error);
}
```

---

### Example 2: Multiple Questions (Efficient)

```javascript
import ZAIBrowserAPI from './zai_browser_api.js';

const api = new ZAIBrowserAPI();

try {
    // Open once, ask many times
    await api.initialize();
    
    const answer1 = await api.ask('What is 59 x 55?');
    console.log(answer1);
    
    const answer2 = await api.ask('What is Paris famous for?');
    console.log(answer2);
    
    const answer3 = await api.ask('Explain photosynthesis');
    console.log(answer3);
    
} finally {
    // Close when done
    await api.close();
}
```

**Why this is better:** Only loads browser once (~5s saved per question!)

---

### Example 3: Custom Options

```javascript
const api = new ZAIBrowserAPI();
await api.initialize();

// Ask with custom timeout
const answer = await api.ask('Complex question here', {
    timeout: 60000,        // Wait up to 60 seconds
    waitForResponse: true, // Wait for AI to respond
    clearContext: false    // Keep conversation context
});

await api.close();
```

---

## 🔥 ADVANCED FEATURES

### Feature 1: Study Assistant (Multi-Subject Tutor)

**File:** `example_study_assistant.js`

```javascript
// Run it:
node example_study_assistant.js
```

**What it does:**
- Opens browser once
- Asks questions across multiple subjects
- Formats output nicely
- Handles errors gracefully

**Example Output:**
```
📚 Mathematics
────────────────────────────────────────────────────────────
❓ What is 59 multiplied by 55? Show step-by-step work.

💡 Answer:
59 × 55 = 3245

Method 1: Standard Multiplication
   59
 x 55   
  295
 2950
------
 3245

Method 2: Distributive Property
= (60 - 1) × 55
= 3300 - 55
= 3245
```

---

### Feature 2: Conversation Manager with History

**File:** `conversation_manager.js`

```javascript
import ConversationManager from './conversation_manager.js';

const manager = new ConversationManager({
    sessionName: 'my-tutoring'  // Saves to conversations/my-tutoring.json
});

await manager.start();

// First question
await manager.chat('What are prime numbers?');

// Follow-up (automatically includes context!)
await manager.followUp('Is 17 a prime number? Why?');

// Another follow-up
await manager.followUp('What about 18?');

// Save and export
manager.export('txt');  // Exports readable text file
await manager.close();
```

**Features:**
- ✅ Auto-saves conversation history
- ✅ Contextual follow-up questions
- ✅ Export to TXT format
- ✅ Resume previous sessions

**Saved File Location:**
```
conversations/
├── my-tutoring.json      (machine-readable)
└── my-tutoring.txt       (human-readable)
```

---

## 💡 REAL-WORLD EXAMPLES

### Example 1: Homework Helper Bot

```javascript
import ZAIBrowserAPI from './zai_browser_api.js';

class HomeworkHelper {
    constructor() {
        this.api = new ZAIBrowserAPI();
    }

    async solveMathProblem(problem) {
        await this.api.initialize();
        
        const prompt = `Solve this math problem step by step: ${problem}`;
        const solution = await this.api.ask(prompt);
        
        await this.api.close();
        return solution;
    }

    async explainConcept(concept) {
        await this.api.initialize();
        
        const prompt = `Explain this concept simply: ${concept}`;
        const explanation = await this.api.ask(prompt);
        
        await this.api.close();
        return explanation;
    }
}

// Usage
const helper = new HomeworkHelper();

const mathAnswer = await helper.solveMathProblem('59 × 55');
console.log(mathAnswer);

const scienceAnswer = await helper.explainConcept('gravity');
console.log(scienceAnswer);
```

---

### Example 2: Trivia Quiz Generator

```javascript
import ZAIBrowserAPI from './zai_browser_api.js';

class TriviaMaster {
    constructor() {
        this.api = new ZAIBrowserAPI();
        this.questions = [];
        this.answers = [];
    }

    async addQuestion(category, question) {
        this.questions.push({ category, question });
    }

    async runQuiz() {
        await this.api.initialize();
        
        console.log('🧠 TRIVIA QUIZ\n');
        
        for (let i = 0; i < this.questions.length; i++) {
            const q = this.questions[i];
            
            console.log(`\n${q.category}: ${q.question}`);
            const answer = await this.api.ask(q.question);
            this.answers.push(answer);
            
            console.log(`✅ ${answer.substring(0, 100)}...`);
            
            // Pause between questions
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        await this.api.close();
    }

    saveResults(filename) {
        const content = this.questions.map((q, i) => 
            `Q${i+1}: ${q.question}\nA: ${this.answers[i]}\n`
        ).join('\n');
        
        fs.writeFileSync(filename, content);
        console.log(`\n💾 Saved to ${filename}`);
    }
}

// Usage
const trivia = new TriviaMaster();
await trivia.addQuestion('Geography', 'Capital of France?');
await trivia.addQuestion('Science', 'What is H2O?');
await trivia.addQuestion('History', 'First US president?');
await trivia.runQuiz();
trivia.saveResults('trivia-results.txt');
```

---

### Example 3: Code Review Assistant

```javascript
import ZAIBrowserAPI from './zai_browser_api.js';

class CodeReviewer {
    constructor() {
        this.api = new ZAIBrowserAPI();
    }

    async reviewCode(code, language = 'JavaScript') {
        await this.api.initialize();
        
        const prompt = `Review this ${language} code for bugs, performance issues, and best practices:\n\n${code}`;
        const review = await this.api.ask(prompt);
        
        await this.api.close();
        return review;
    }

    async explainCode(code) {
        await this.api.initialize();
        
        const prompt = `Explain what this code does line by line:\n\n${code}`;
        const explanation = await this.api.ask(prompt);
        
        await this.api.close();
        return explanation;
    }
}

// Usage
const reviewer = new CodeReviewer();

const code = `
function factorial(n) {
    if (n === 0) return 1;
    return n * factorial(n - 1);
}
`;

const review = await reviewer.reviewCode(code);
console.log('📝 Code Review:');
console.log(review);
```

---

### Example 4: Language Learning Partner

```javascript
import ZAIBrowserAPI from './zai_browser_api.js';

class LanguageTutor {
    constructor(language) {
        this.api = new ZAIBrowserAPI();
        this.targetLanguage = language;
    }

    async translatePhrase(phrase, fromLang = 'English') {
        await this.api.initialize();
        
        const prompt = `Translate from ${fromLang} to ${this.targetLanguage}: "${phrase}"`;
        const translation = await this.api.ask(prompt);
        
        await this.api.close();
        return translation;
    }

    async grammarExplanation(topic) {
        await this.api.initialize();
        
        const prompt = `Explain ${topic} grammar in ${this.targetLanguage} with examples`;
        const explanation = await this.api.ask(prompt);
        
        await this.api.close();
        return explanation;
    }

    async practiceConversation() {
        await this.api.initialize();
        
        const prompt = `Let's have a conversation in ${this.targetLanguage}. Start by asking me a simple question.`;
        const response = await this.api.ask(prompt);
        
        // Keep browser open for back-and-forth
        return response;
    }

    async endPractice() {
        await this.api.close();
    }
}

// Usage
const spanishTutor = new LanguageTutor('Spanish');

const translation = await spanishTutor.translatePhrase('Hello, how are you?');
console.log(translation);

const grammar = await spanishTutor.grammarExplanation('present tense verbs');
console.log(grammar);

await spanishTutor.endPractice();
```

---

## ⚙️ BEST PRACTICES

### 1. Session Management

✅ **DO:**
```javascript
const api = new ZAIBrowserAPI();
await api.initialize();  // Open once

// Ask many questions
await api.ask('Q1');
await api.ask('Q2');
await api.ask('Q3');

await api.close();  // Close when done
```

❌ **DON'T:**
```javascript
// Don't do this - too slow!
await api.askOnce('Q1');  // Opens/closes browser
await api.askOnce('Q2');  // Opens/closes browser again
await api.askOnce('Q3');  // Opens/closes browser again
```

---

### 2. Error Handling

✅ **DO:**
```javascript
try {
    await api.initialize();
    const answer = await api.ask('Question?', { timeout: 40000 });
    console.log(answer);
} catch (error) {
    console.error('API Error:', error.message);
    // Fallback or retry logic
} finally {
    await api.close();
}
```

❌ **DON'T:**
```javascript
// No error handling - might crash!
const answer = await api.ask('Question?');
console.log(answer);
```

---

### 3. Rate Limiting

✅ **DO:**
```javascript
// Add delays between questions
for (const question of questions) {
    await api.ask(question);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second pause
}
```

❌ **DON'T:**
```javascript
// Spamming - might get blocked!
questions.forEach(async q => await api.ask(q)); // All at once!
```

---

### 4. Session Refresh

✅ **DO:**
```javascript
// Check if session is still valid before long runs
if (!sessionIsValid()) {
    console.log('Refreshing session...');
    runCommand('node zai_login_explorer.js');
}
```

**How to check session validity:**
```javascript
function sessionIsValid() {
    try {
        const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
        const data = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
        
        // Check if older than 2 hours
        const age = Date.now() - data.timestamp;
        return age < (2 * 60 * 60 * 1000); // 2 hours
    } catch {
        return false;
    }
}
```

---

## 🐛 TROUBLESHOOTING

### Problem 1: "Chat input not found"

**Symptoms:**
```
❌ Chat input not found!
📸 Check zai_debug_screenshot.png
```

**Solutions:**

1. **Refresh session tokens:**
   ```bash
   node zai_login_explorer.js
   ```

2. **Check if Z.AI website changed:**
   - Open https://chat.z.ai/ manually
   - See if UI looks different
   - Check if input field still exists

3. **Update selectors in code:**
   ```javascript
   // In zai_browser_api.js, add more selectors:
   const possibleSelectors = [
       // ... existing ones ...
       'textarea',              // Generic
       '[contenteditable]',     // Alternative
       'input[role="textbox"]'  // Another option
   ];
   ```

---

### Problem 2: Timeout during page load

**Symptoms:**
```
page.goto: Timeout 30000ms exceeded
```

**Solutions:**

1. **Increase timeout:**
   ```javascript
   await this.page.goto('https://chat.z.ai/', { 
       waitUntil: 'domcontentloaded',
       timeout: 60000  // 60 seconds instead of 30
   });
   ```

2. **Check internet connection:**
   ```bash
   ping chat.z.ai
   ```

3. **Try alternative loading:**
   ```javascript
   // In zai_browser_api.js initialize():
   try {
       await this.page.goto('https://chat.z.ai/', { 
           waitUntil: 'domcontentloaded',
           timeout: 30000 
       });
   } catch {
       // Fallback to faster load
       await this.page.goto('https://chat.z.ai/', { 
           waitUntil: 'commit',
           timeout: 10000 
       });
   }
   ```

---

### Problem 3: Response extraction returns garbage

**Symptoms:**
- Gets "Thinking..." text
- Includes UI elements
- Partial responses

**Solutions:**

1. **Wait longer for complete response:**
   ```javascript
   const answer = await api.ask(question, {
       timeout: 60000  // More time
   });
   ```

2. **Improve filtering:**
   ```javascript
   // In extractResponse(), add more filters:
   const cleanText = text
       .replace(/Thinking\.\.\./gi, '')
       .replace(/Skip/gi, '')
       .replace(/Loading\.\.\./gi, '')
       .trim();
   ```

3. **Use different selectors:**
   ```javascript
   // Try more specific selectors:
   '.prose > p:last-child'
   '[data-testid="message-content"]'
   ```

---

### Problem 4: Session expires frequently

**Symptoms:**
- Works for a while then stops
- Gets authentication errors

**Solution: Auto-refresh tokens**

```javascript
class SmartAPI {
    constructor() {
        this.api = new ZAIBrowserAPI();
        this.lastRefresh = Date.now();
    }

    async ensureValidSession() {
        const age = Date.now() - this.lastRefresh;
        
        // Refresh every 2 hours automatically
        if (age > (2 * 60 * 60 * 1000)) {
            console.log('🔄 Refreshing session...');
            // Run login script programmatically
            await this.refreshSession();
            this.lastRefresh = Date.now();
        }
    }

    async ask(question) {
        await this.ensureValidSession();
        return await this.api.ask(question);
    }
}
```

---

## 📊 PERFORMANCE TIPS

### Speed Optimizations

1. **Keep browser open:** ~5x faster for multiple questions
   ```javascript
   await api.initialize();
   // Ask many questions
   await api.close();
   ```

2. **Use headless mode:** Slightly faster, less resources
   ```javascript
   // In zai_browser_api.js:
   this.browser = await chromium.launch({
       headless: true,  // Hidden browser
       args: ['--disable-gpu']
   });
   ```

3. **Reduce timeout for simple questions:**
   ```javascript
   const answer = await api.ask('Simple question', {
       timeout: 20000  // 20 seconds instead of 40
   });
   ```

---

## 🎓 LEARNING RESOURCES

### Files to Read:
- `ZAI_BROWSER_API_WORKING.md` - Technical details
- `ZAI_API_SOLUTION_FINAL.md` - Solution overview
- `zai_browser_api.js` - Source code with comments

### Example Scripts:
- `zai_browser_api.js` - Built-in test
- `example_study_assistant.js` - Multi-subject tutor
- `conversation_manager.js` - History tracking

---

## 🚀 NEXT STEPS

### Beginner Path:
1. Run `node zai_browser_api.js` to see it work
2. Try `example_study_assistant.js` for multi-question demo
3. Create your own simple script with one question

### Intermediate Path:
1. Use `conversation_manager.js` for tutoring session
2. Build a custom helper class for your use case
3. Add error handling and retry logic

### Advanced Path:
1. Extend `ZAIBrowserAPI` class with new features
2. Add streaming response support
3. Integrate with other services (Discord bot, etc.)

---

**Happy Coding! 🎉**

Your Z.AI browser API is ready for anything!
