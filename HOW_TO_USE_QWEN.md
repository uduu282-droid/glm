# 🚀 HOW TO USE QWEN IN CLAUDE CODE CLI

## ⚡ Quick Solution

### **You can't type in the background terminal. You need to run it interactively!**

---

## ✅ **Step-by-Step Instructions**

### **Step 1: Open a NEW Terminal/PowerShell Window**
- Press `Win + R`
- Type: `powershell`
- Press `Enter`

### **Step 2: Set Environment Variables**
Copy and paste these commands (one at a time):

```powershell
$env:ANTHROPIC_BASE_URL="https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1"
```

Press Enter.

```powershell
$env:ANTHROPIC_API_KEY="not-needed"
```

Press Enter.

### **Step 3: Start Claude Code with Qwen**

```powershell
claude --model qwen3-coder-plus
```

Press Enter.

---

## 🎉 **Now You Can Type!**

After running the command, you'll see the beautiful Claude Code interface:

```
Welcome to Claude Code v2.1.72
[ASCII Art Logo]
Let's get started.
Choose the text style...
❯ 1. Dark mode ✔
```

**NOW JUST TYPE YOUR MESSAGE!** For example:

```
Write a Python hello world function
```

Press Enter, and Qwen will respond! ✨

---

## 💡 **Pro Tip: Create a Shortcut Script**

Create a file called: **`start-qwen.ps1`**

```powershell
# start-qwen.ps1
$env:ANTHROPIC_BASE_URL = "https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1"
$env:ANTHROPIC_API_KEY = "not-needed"
claude --model qwen3-coder-plus
```

Then just run:
```powershell
.\start-qwen.ps1
```

And you're chatting instantly! 🚀

---

## 🎮 **What You Can Ask:**

### Code Generation:
```
Create a function to sort an array in JavaScript
```

### Explanations:
```
Explain how promises work in JavaScript
```

### Debugging:
```
Why doesn't this work? [paste your code]
```

### Creative Tasks:
```
Write a poem about programming
```

---

## ⚠️ **Why You Couldn't Type Before**

The terminal was running in **background mode** (non-interactive). 

When I use `run_in_terminal` with `is_background: true`, it starts the process but you can't interact with it directly.

**Solution:**Run the commands yourself in a fresh terminal window where you have full interactivity!

---

## 📋 **Complete Command Summary**

```powershell
# All in one go (paste all 3 lines):
$env:ANTHROPIC_BASE_URL="https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1"
$env:ANTHROPIC_API_KEY="not-needed"
claude --model qwen3-coder-plus
```

---

## 🔥 **Even Better: Add to PowerShell Profile**

Open your profile:
```powershell
notepad $PROFILE
```

Add this function:
```powershell
function QwenChat {
    $env:ANTHROPIC_BASE_URL = "https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1"
    $env:ANTHROPIC_API_KEY= "not-needed"
    claude --model qwen3-coder-plus
}
```

Save and restart PowerShell. Then just type:
```powershell
QwenChat
```

And you're ready to chat! ✨

---

## ✅ **Recap**

1. **Open new PowerShell** window
2. **Paste the 3 commands** above
3. **Start typing** your questions!

**🎊 That's it! You'll be chatting with Qwen in seconds!**
