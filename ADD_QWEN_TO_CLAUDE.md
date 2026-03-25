# 🚀 Add Qwen Models to Claude Code CLI

## ✅ Quick Setup (3 Methods)

---

## **Method 1: Environment Variables (Easiest)**

### PowerShell - One-Time Setup:
```powershell
$env:ANTHROPIC_BASE_URL="https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1"
$env:ANTHROPIC_API_KEY="not-needed"
claude --model qwen3-coder-plus
```

### PowerShell- Permanent Setup:
Add to your PowerShell profile:

```powershell
# Open profile
notepad $PROFILE

# Add these lines:
$env:ANTHROPIC_BASE_URL="https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1"
$env:ANTHROPIC_API_KEY="not-needed"
```

Then restart PowerShell and just run:
```bash
claude --model qwen3-coder-plus
```

---

## **Method 2: Create Wrapper Scripts**

### Create file: `claude-qwen.ps1`
```powershell
$env:ANTHROPIC_BASE_URL = "https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1"
$env:ANTHROPIC_API_KEY= "not-needed"
& claude @args
```

**Usage:**
```bash
.\claude-qwen.ps1 --model qwen3-coder-plus
```

---

## **Method 3: Batch File (Alternative)**

### Create file: `claude-qwen.bat`
```batch
@echo off
set ANTHROPIC_BASE_URL=https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1
set ANTHROPIC_API_KEY=not-needed
claude %*
```

**Usage:**
```bash
claude-qwen.bat --model qwen3-coder-plus
```

---

## 🎯 **Available Qwen Models**

Once configured, you can use these models:

| Model | Use Case | Command |
|-------|----------|---------|
| **qwen3-coder-plus** | Complex coding | `claude --model qwen3-coder-plus` |
| **qwen3-coder-flash** | Quick tasks | `claude --model qwen3-coder-flash` |
| **vision-model** | Images | `claude --model vision-model` |

---

## 💻 **Test It Works**

### Test Command:
```bash
claude-p "Write a Python hello world" --model qwen3-coder-plus
```

**Expected Output:**
```python
print("Hello, World!")
```

---

## 🔧 **MCP Configuration (Advanced)**

If you want to add it as an MCP server:

### Edit or create: `%APPDATA%\Claude\mcp.json`

```json
{
  "mcpServers": {
    "qwen": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-openai"],
      "env": {
        "OPENAI_API_KEY": "not-needed",
        "OPENAI_BASE_URL": "https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1"
      }
    }
  }
}
```

---

## ⚡ **Quick Start Commands**

### 1. Simple Chat:
```bash
$env:ANTHROPIC_BASE_URL="https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1"
claude --model qwen3-coder-plus
```

### 2. One-Off Question:
```bash
claude-p "Explain quantum computing" --model qwen3-coder-plus
```

### 3. Code Review:
```bash
claude-p "Review this code for bugs: $(Get-Content .\myapp.js)" --model qwen3-coder-plus
```

---

## 📋 **Configuration Summary**

```yaml
Base URL: https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1
API Key: not-needed (any value works)
Models: qwen3-coder-plus, qwen3-coder-flash, vision-model
Format: OpenAI-compatible
Auth: None required
```

---

## ✅ **Verification**

After setup, test with:

```bash
claude --help
```

You should see it accepts the `--model` parameter with your Qwen models!

---

## 🎉 **Success Indicators**

✅ Working if you see:
- No authentication errors
- Response from Claude
- Model name shows as `qwen3-coder-plus`

❌ Not working if:
- Auth errors appear
- Connection refused
- Wrong model name

---

**Ready to code with Qwen!** 🚀
