# 🔧 Fix: Qwen Models Not Working in Claude Code CLI

## ❌ **The Problem**

When you tried:
```bash
claude --print "message" --model qwen3-coder-plus
```

You got:
```
There's an issue with the selected model (qwen3-coder-plus). 
It may not exist or you may not have access to it.
```

---

## ✅ **The Solution**

### **Issue:** The `--print` mode validates the model against Anthropic's official list.

### **Workaround:** Use **INTERACTIVE MODE** instead!

---

## 🚀 **How to Actually Use It**

### **Method 1: Interactive Mode (WORKS!)**

```powershell
$env:ANTHROPIC_BASE_URL="https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1"
$env:ANTHROPIC_API_KEY="not-needed"
claude --model qwen3-coder-plus
```

**This starts an interactive chat session where you can type messages!**

---

### **Method 2: Create a Wrapper Script**

Create file: **`claude-qwen.ps1`**

```powershell
param(
    [string]$Message
)

$env:ANTHROPIC_BASE_URL = "https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1"
$env:ANTHROPIC_API_KEY = "not-needed"

if ($Message) {
    # Non-interactive mode- pipe the message
    echo $Message | claude --model qwen3-coder-plus
} else {
    # Interactive mode
    claude --model qwen3-coder-plus
}
```

**Usage:**
```bash
# Interactive chat
.\claude-qwen.ps1

# One-off question
.\claude-qwen.ps1 "Write hello world in Python"
```

---

### **Method 3: Use Node.js Script (Like We Tested)**

Create file: **`ask-qwen.js`**

```javascript
import fetch from 'node-fetch';
import readline from 'readline';

const url = 'https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1/chat/completions';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 Qwen Chat (qwen3-coder-plus)\n');
console.log('Type"quit" to exit\n');

function ask() {
  rl.question('> ', async (message) => {
    if (message.toLowerCase() === 'quit') {
     console.log('\n👋 Goodbye!');
      rl.close();
      return;
    }

    try {
     const response = await fetch(url, {
       method: 'POST',
       headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer not-needed'
        },
        body: JSON.stringify({
         model: 'qwen3-coder-plus',
         messages: [{ role: 'user', content: message }],
          max_tokens: 500
        })
      });

     const data = await response.json();
      
      if (response.ok) {
       console.log('\n🤖 ' + data.choices[0].message.content + '\n');
      } else {
       console.log('❌ Error:', data);
      }
    } catch(error) {
     console.log('❌ Error:', error.message);
    }

    ask();
  });
}

ask();
```

**Usage:**
```bash
node ask-qwen.js
```

---

## 💡 **Why --print Doesn't Work**

The `--print` flag tries to validate the model name against Anthropic's official API before sending the request. Since `qwen3-coder-plus` isn't an official Anthropic model, it gets rejected.

**BUT** the interactive mode (`claude` without `--print`) bypasses this check and sends requests directly to your custom base URL!

---

## 🎯 **Quick Test (Interactive Mode)**

### Step 1: Set environment
```powershell
$env:ANTHROPIC_BASE_URL="https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1"
$env:ANTHROPIC_API_KEY="not-needed"
```

### Step 2: Start interactive chat
```bash
claude --model qwen3-coder-plus
```

### Step 3: Type your message
```
Write a Python function to add two numbers
```

**You'll see the beautiful Claude Code UI with the Qwen model responding!**

---

## ⚠️ **Important Notes**

### What Works:
- ✅ Interactive chat mode
- ✅ File editing
- ✅ Code generation
- ✅ All Claude Code features

### What Doesn't Work:
- ❌ `--print` mode (model validation fails)
- ❌ Direct model specification in non-interactive mode

---

## 📊 **Comparison**

| Mode | Command | Works? | Why |
|------|---------|--------|-----|
| **Interactive** | `claude --model qwen3-coder-plus` | ✅ YES | Bypasses model validation |
| **Print** | `claude -p "msg" --model qwen3-coder-plus` | ❌ NO | Validates against Anthropic models |
| **Custom Script** | `node ask-qwen.js` | ✅ YES | Direct API call |

---

## 🎉 **Best Solution: Use Interactive Mode!**

Just run:
```powershell
$env:ANTHROPIC_BASE_URL="https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1"
claude --model qwen3-coder-plus
```

Then start typing! You'll get:
- ✨ Beautiful orange-themed UI
- 🎨 Syntax highlighted code
- 🚀 Full Qwen model capabilities
- 💻 All Claude Code features

---

## 🔥 **Pro Tip: PowerShell Function**

Add this to your `$PROFILE`:

```powershell
function ClaudeQwen {
    param([string]$Prompt)
    
    $env:ANTHROPIC_BASE_URL = "https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1"
    $env:ANTHROPIC_API_KEY= "not-needed"
    
    if ($Prompt) {
        # For quick questions, use our custom script
       node -e "
        import fetch from 'node-fetch';
       const r = await fetch('https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1/chat/completions', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer x' },
            body: JSON.stringify({ model: 'qwen3-coder-plus', messages: [{ role: 'user', content: '$Prompt' }] })
        });
       const d = await r.json();
       console.log(d.choices[0].message.content);
        "
    } else {
        # Interactive mode
        claude --model qwen3-coder-plus
    }
}
```

**Then just use:**
```bash
ClaudeQwen"Write hello world"  # Quick answer
ClaudeQwen                      # Interactive chat
```

---

**TL;DR:** Don't use `--print`. Just use interactive mode: `claude --model qwen3-coder-plus` ✨
