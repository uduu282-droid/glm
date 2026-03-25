# 🔧 Claude Code CLI - Using Different Providers

## 🎯 What You Need to Change

Yes! To use **different AI providers** (not just Anthropic), you need to modify:

1. **Base URL** - Where requests are sent
2. **API Key** - Authentication token
3. **Model names** - Map to provider's model format
4. **Environment variables** -Configuration

---

## 📋 Method 1: Environment Variables (Recommended)

### Create a `.env` file or set environment variables:

```bash
# For OpenAI-compatible providers
ANTHROPIC_BASE_URL=https://api.openai.com/v1
ANTHROPIC_API_KEY=sk-your-api-key-here

# Or for local LLM servers
ANTHROPIC_BASE_URL=http://localhost:1234/v1
ANTHROPIC_API_KEY=not-needed-for-local

# Or for other providers
ANTHROPIC_BASE_URL=https://api.mistral.ai/v1
ANTHROPIC_API_KEY=your-mistral-key
```

### Set in PowerShell:
```powershell
$env:ANTHROPIC_BASE_URL="https://api.openai.com/v1"
$env:ANTHROPIC_API_KEY="sk-your-key-here"
claude
```

---

## 🌐 Supported Provider Configurations

### 1️⃣ **OpenAI**
```bash
ANTHROPIC_BASE_URL=https://api.openai.com/v1
ANTHROPIC_API_KEY=sk-...
```

**Model mapping:**
- `claude-sonnet-4` → `gpt-4o`
- `claude-opus` → `gpt-4-turbo`
- `claude-haiku` → `gpt-3.5-turbo`

---

### 2️⃣ **Local LLM Servers**

#### **Ollama:**
```bash
ANTHROPIC_BASE_URL=http://localhost:11434/v1
ANTHROPIC_API_KEY=ollama
```

#### **LM Studio:**
```bash
ANTHROPIC_BASE_URL=http://localhost:1234/v1
ANTHROPIC_API_KEY=lm-studio
```

#### **vLLM:**
```bash
ANTHROPIC_BASE_URL=http://localhost:8000/v1
ANTHROPIC_API_KEY=vllm
```

---

### 3️⃣ **Groq**
```bash
ANTHROPIC_BASE_URL=https://api.groq.com/openai/v1
ANTHROPIC_API_KEY=gsk_...
```

---

### 4️⃣ **Together AI**
```bash
ANTHROPIC_BASE_URL=https://api.together.xyz/v1
ANTHROPIC_API_KEY=your-together-key
```

---

### 5️⃣ **Anyscale**
```bash
ANTHROPIC_BASE_URL=https://api.endpoints.anyscale.com/v1
ANTHROPIC_API_KEY=es_...
```

---

### 6️⃣ **Google Gemini (via OpenAI-compatible API)**
```bash
# Using a proxy that converts Anthropic → Gemini
ANTHROPIC_BASE_URL=https://your-gemini-proxy.com/v1
ANTHROPIC_API_KEY=your-gemini-key
```

---

### 7️⃣ **Azure OpenAI**
```bash
ANTHROPIC_BASE_URL=https://your-resource.openai.azure.com/openai/deployments/your-deployment
ANTHROPIC_API_KEY=your-azure-key
```

---

## 🔨 Method 2: MCP Server Configuration

For more advanced setups, use **MCP (Model Context Protocol)**:

### Edit MCP config:
**Location:** `%APPDATA%\Claude\mcp.json` (create if doesn't exist)

```json
{
  "mcpServers": {
    "custom-provider": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-openai"],
      "env": {
        "OPENAI_API_KEY": "sk-...",
        "OPENAI_BASE_URL": "https://api.openai.com/v1"
      }
    }
  }
}
```

---

## 🛠️ Method 3: Custom Wrapper Script

Create a wrapper script that sets everything up:

### **PowerShell: `claude-openai.ps1`**
```powershell
$env:ANTHROPIC_BASE_URL = "https://api.openai.com/v1"
$env:ANTHROPIC_API_KEY = "sk-..."
& claude @args
```

### **Batch: `claude-local.bat`**
```batch
@echo off
set ANTHROPIC_BASE_URL=http://localhost:11434/v1
set ANTHROPIC_API_KEY=ollama
claude %*
```

---

## 🎯 Quick Setup Examples

### **Example 1: Use Ollama (Free, Local)**

1. **Install Ollama:**
   ```bash
   winget install Ollama.Ollama
   ```

2. **Pull a model:**
   ```bash
   ollama pull llama3.2
   ```

3. **Set environment:**
   ```powershell
   $env:ANTHROPIC_BASE_URL="http://localhost:11434/v1"
   $env:ANTHROPIC_API_KEY="ollama"
   ```

4. **Run Claude:**
   ```bash
   claude
   ```

---

### **Example 2: Use Groq (Fast, Cheap)**

1. **Get API key:** https://console.groq.com/keys

2. **Set environment:**
   ```powershell
   $env:ANTHROPIC_BASE_URL="https://api.groq.com/openai/v1"
   $env:ANTHROPIC_API_KEY="gsk_your-key-here"
   ```

3. **Run Claude:**
   ```bash
   claude -p "Hello!"
   ```

---

### **Example 3: Use OpenRouter (Multiple Models)**

1. **Get API key:** https://openrouter.ai/keys

2. **Set environment:**
   ```powershell
   $env:ANTHROPIC_BASE_URL="https://openrouter.ai/api/v1"
   $env:ANTHROPIC_API_KEY="sk-or-..."
   ```

3. **Access 100+ models through one API!**

---

## 📊 Provider Comparison

| Provider | Cost | Speed | Models Available | Best For |
|----------|------|-------|------------------|----------|
| **Anthropic** | $$$ | Fast | Claude only | Official support |
| **OpenAI** | $$ | Fast | GPT-4, GPT-3.5 | General purpose |
| **Ollama** | FREE | Varies | Any open-source | Local testing |
| **Groq** | $ | ⚡ Fastest | Llama, Mixtral | Speed-critical tasks |
| **Together** | $ | Fast | Many open models | Variety |
| **Azure** | $$ | Fast | GPT, Claude | Enterprise |

---

## 🔍 Model Name Mapping

Since Claude Code expects Claude model names, you may need to map them:

### Common mappings:

```javascript
// In your wrapper or proxy:
const modelMap = {
  'claude-sonnet-4': 'gpt-4o',
  'claude-opus': 'gpt-4-turbo',
  'claude-haiku': 'gpt-3.5-turbo',
  'claude-3.5-sonnet': 'llama-3.1-70b',
};
```

Or use a **proxy server** that handles this automatically!

---

## 🚀 Recommended: Use a Proxy Server

For seamless multi-provider support, run a proxy that translates:

### **LiteLLM Proxy** (Best Option):

1. **Install:**
   ```bash
   pip install litellm[proxy]
   ```

2. **Create `config.yaml`:**
   ```yaml
   model_list:
     - model_name: claude-sonnet-4
       litellm_params:
         model: gpt-4o
         api_key: sk-...
         api_base: https://api.openai.com/v1
     
     - model_name: claude-opus
       litellm_params:
         model: together_ai/meta-llama/Llama-3-70b-chat-hf
         api_key: your-together-key
   ```

3. **Run proxy:**
   ```bash
   litellm --config config.yaml
   ```

4. **Point Claude Code to it:**
   ```powershell
   $env:ANTHROPIC_BASE_URL="http://0.0.0.0:4000"
   $env:ANTHROPIC_API_KEY="fake-key"
   claude
   ```

---

## 💡 Pro Tips

### Tip 1: Multiple Profiles
Create multiple wrapper scripts for different providers:
- `claude-anthropic.ps1`
- `claude-openai.ps1`
- `claude-local.ps1`

### Tip 2: Use `.envrc` with direnv
```bash
# .envrc file
export ANTHROPIC_BASE_URL="http://localhost:11434/v1"
export ANTHROPIC_API_KEY="ollama"
```

### Tip 3: Docker for Consistency
```bash
docker run -e ANTHROPIC_BASE_URL=... -e ANTHROPIC_API_KEY=... claude-code
```

---

## ⚠️ Important Notes

### Limitations:
1. **Not all Claude features work** with other providers
2. **Tool calling** may not translate perfectly
3. **Streaming responses** might behave differently
4. **Image support** varies by provider

### Best Compatibility:
- ✅ **Text chat** - Works everywhere
- ✅ **Basic Q&A** - Universal
- ⚠️ **Code execution** - Provider-dependent
- ⚠️ **File analysis** - May not work
- ❌ **Image input** - Limited support

---

## 🎯 Summary

**To use different providers with Claude Code CLI:**

1. **Change base URL:**
   ```bash
   $env:ANTHROPIC_BASE_URL="https://other-provider.ai/v1"
   ```

2. **Change API key:**
   ```bash
   $env:ANTHROPIC_API_KEY="your-key-here"
   ```

3. **Map model names** (if needed)

4. **Run Claude Code!**

**OR** use a proxy like LiteLLM for automatic translation!

---

**Want help setting up a specific provider?** Let me know which one and I'll create a detailed setup guide! 🚀
