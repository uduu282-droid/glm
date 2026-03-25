# Free AI Chat API Analysis Report

## Website: https://free-aichat.vercel.app/

---

## 🎯 Key Findings

### **AI Models Supported:**
Based on the analysis, this website supports **TWO AI models**:

1. **Gemini** (Google's AI model)
2. **Groq** (AI inference platform - likely offers Llama models)

### **Evidence from HTML Metadata:**

```html
<meta name="description" content="Experience seamless conversations with FreeAI Chat. 
Switch between Gemini and Groq models for enhanced AI interactions. Free, fast, and no sign-up required."/>

<meta name="keywords" content="AI chat,free AI,Gemini chat,Groq chat,AI assistant,chatbot,artificial intelligence,free chatbot"/>

<meta property="og:description" content="Experience seamless conversations with multiple AI models. Switch between Gemini and Groq for enhanced AI interactions."/>
```

---

## 🔧 Technical Details

### **Technology Stack:**
- **Framework**: Next.js (React Server Components)
- **Deployment**: Vercel
- **UI Components**: Custom React components with dropdown menu for model selection

### **Architecture:**
- Uses **React Server Components (RSC)** with Next.js App Router
- Implements **Server Actions** for handling chat requests
- Client-side model switching via dropdown menu

### **HTML Structure:**
```html
<nav>
  <button data-slot="dropdown-menu-trigger">
    Model: Gemini
    <svg class="lucide-chevron-down">...</svg>
  </button>
</nav>
```

The dropdown shows "Model: Gemini" indicating users can switch between models.

---

## 📡 Network Request Analysis

### **Observed Request Headers:**
```
Request URL: https://free-aichat.vercel.app/
Request Method: POST
Content-Type: text/plain;charset=UTF-8
Accept: text/x-component
Next-Action: 405240754eac217df4ff6088d4d438a00cf17c8683
Next-Router-State-Tree: [...]
```

### **Response Characteristics:**
- **Content-Type**: `text/x-component` (React Server Component response)
- **X-Powered-By**: Next.js
- **Cache-Control**: no-cache, must-revalidate
- **Vercel Cache**: BYPASS

---

## 🤖 Available Models Detail

### 1. **Gemini**
- **Provider**: Google
- **Type**: Large Language Model (LLM)
- **Capabilities**: Text generation, conversation, reasoning
- **Likely Version**: Gemini Pro or Gemini 1.5 (based on common free tier offerings)

### 2. **Groq**
- **Provider**: Groq (runs various open-source models)
- **Type**: AI Inference Platform
- **Likely Models**: 
  - Llama 3 (Meta) - 70B or 8B
  - Mixtral (Mistral AI)
  - Other open-source LLMs
- **Key Feature**: Very fast inference speeds

---

## 💡 Usage Information

### **Features:**
- ✅ Free to use
- ✅ No sign-up required
- ✅ Multiple model support
- ✅ Fast responses
- ✅ Web-based interface

### **Limitations:**
- Only 2 model providers (Gemini & Groq)
- No direct API access (web interface only)
- Uses Next.js Server Actions (not a traditional REST API)

---

## 🔍 How to Test

### **Option 1: Use the Website Directly**
1. Visit: https://free-aichat.vercel.app/
2. Click on"Model: Gemini" dropdown
3. Select between Gemini and Groq
4. Start chatting!

### **Option 2: Analyze Network Traffic**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Use the chat interface
4. Inspect the Server Action requests to see actual API calls

### **Option 3: Reverse Engineer JavaScript Bundles**
Downloaded bundle files for deeper analysis:
- `bundle___next_static_chunks_app_page_1319a369ca449a20_js.js` -Contains main app logic
- Search for "gemini", "groq", or"model" keywords

---

## 📝 Notes

- The application does NOT expose a public REST API
- All communication happens through Next.js Server Actions
- The backend likely proxies requests to:
  - Google's Gemini API
  - Groq Cloud API (for Llama/Mixtral models)
  
- To programmatically access these models, you would need to:
  1. Get your own API keys from Google AI Studio (Gemini)
  2. Get your own API keys from Groq Cloud
  3. Or use the web scraping approach (not recommended for production)

---

## 🚀 Recommended Alternatives for API Access

If you want to use these models programmatically:

### **For Gemini:**
```javascript
// Official Google API
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('YOUR_API_KEY');
const model= genAI.getGenerativeModel({ model: 'gemini-pro' });
```

### **For Groq Models:**
```javascript
// Official Groq API
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: 'YOUR_API_KEY' });

const response = await groq.chat.completions.create({
  model: 'llama-3.1-70b-versatile',
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

---

## 📊 Summary Table

| Feature | Details |
|---------|---------|
| **Website** | https://free-aichat.vercel.app |
| **Models** | Gemini, Groq |
| **Cost** | Free |
| **Auth Required** | No |
| **API Available** | No (Web only) |
| **Framework** | Next.js + RSC |
| **Hosting** | Vercel |
| **Creator** | M-Arham07 (GitHub) |

---

## ✅ Conclusion

**Free AI Chat** is a simple, free web interface that provides access to **Gemini** and **Groq** AI models without requiring sign-up. While there's no official API, the service itself is straightforward to use through the web interface. For programmatic access, consider getting your own API keys from the respective providers.

**Analysis Date**: March 10, 2026  
**Status**: ✅ Complete
