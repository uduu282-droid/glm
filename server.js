import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const CONFIG = {
  BASE_URL: "https://api.overchat.ai/v1/chat/completions",
  DEFAULT_MODEL: "anthropic/claude-sonnet-3-5",
  DEFAULT_PERSONA_ID: "claude-sonnet-3-5-landing",
  MAX_TOKENS: 4000,
  TEMPERATURE: 0.5,
};

// Available models
const MODELS = {
  "claude-sonnet-4-5": { model: "anthropic/claude-sonnet-4-5", persona: "claude-sonnet-4-5-landing" },
  "claude-sonnet-3-7": { model: "anthropic/claude-sonnet-3-7", persona: "claude-sonnet-3-7-landing" },
  "claude-sonnet-3-5": { model: "anthropic/claude-sonnet-3-5", persona: "claude-sonnet-3-5-landing" },
  "claude-opus-4-6": { model: "anthropic/claude-opus-4-6", persona: "claude-opus-4-6-landing" },
  "claude-haiku-4-5": { model: "anthropic/claude-haiku-4-5-20251001", persona: "claude-haiku-4-5-landing" },
  "gpt-5.1": { model: "openai/gpt-5.1", persona: "gpt-5-1-landing" },
  "gpt-5": { model: "openai/gpt-5", persona: "gpt-5-landing" },
  "gpt-4o": { model: "openai/gpt-4o", persona: "gpt-4o-landing" },
  "gpt-o3": { model: "openai/o3", persona: "o3-landing" },
  "gemini-2-5-pro": { model: "google/gemini-2-5-pro", persona: "gemini-2-5-pro-landing" },
  "gemini-2-0-flash": { model: "google/gemini-2-0-flash", persona: "gemini-2-0-flash-landing" },
  "kimi-k2": { model: "moonshot/kimi-k2", persona: "kimi-k2-landing" },
  "kimi-k2-turbo": { model: "moonshot/kimi-k2-turbo", persona: "kimi-k2-turbo-landing" },
  "deepseek-v3": { model: "deepseek/deepseek-v3", persona: "deepseek-v3-landing" },
  "mistral": { model: "mistral/mistral-large", persona: "mistral-large-landing" },
  "qwen-2-5-max": { model: "alibaba/qwen-2-5-max", persona: "qwen-2-5-max-landing" },
  "llama-4": { model: "meta/llama-4", persona: "llama-4-landing" },
  "grok-4": { model: "xai/grok-4", persona: "grok-4-landing" },
  "grok-3": { model: "xai/grok-3", persona: "grok-3-landing" },
};

// Middleware
app.use(cors());
app.use(express.json());

// Generate UUID
function generateUUID() {
  return uuidv4();
}

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    models: Object.keys(MODELS).length
  });
});

// Models list endpoint
app.get('/v1/models', (req, res) => {
  const modelsList = Object.entries(MODELS).map(([name, config]) => ({
    id: name,
    model: config.model,
    persona: config.persona,
    provider: config.model.split('/')[0],
    name: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }));
  
  res.json({ models: modelsList });
});

// Chat endpoint
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const {
      model = CONFIG.DEFAULT_MODEL,
      messages,
      message,
      system,
      stream = true,
      temperature = CONFIG.TEMPERATURE,
      max_tokens = CONFIG.MAX_TOKENS,
      chat_id
    } = req.body;

    // Get model config
    const modelConfig = MODELS[model] || { model: model, persona: `${model}-landing` };

    // Prepare messages
    const payloadMessages = [];
    
    if (messages && Array.isArray(messages)) {
      messages.forEach(msg => {
        payloadMessages.push({
          id: generateUUID(),
          role: msg.role || 'user',
          content: msg.content || ''
        });
      });
    } else if (message) {
      payloadMessages.push({
        id: generateUUID(),
        role: 'user',
        content: message
      });
    } else {
      return res.status(400).json({ error: 'No message provided' });
    }

    // Add system message
    if (system) {
      payloadMessages.push({
        id: generateUUID(),
        role: 'system',
        content: system
      });
    }

    // Prepare payload
    const payload = {
      chatId: chat_id || generateUUID(),
      model: modelConfig.model,
      messages: payloadMessages,
      personaId: modelConfig.persona,
      stream: stream,
      temperature: temperature,
      max_tokens: max_tokens,
      frequency_penalty: 0,
      presence_penalty: 0,
      top_p: 0.95
    };

    // Set up headers with browser-like fingerprint
    const headers = {
      "accept": "*/*",
      "content-type": "application/json",
      "x-device-platform": "web",
      "x-device-version": "1.0.44",
      "x-device-language": "en-US",
      "x-device-uuid": generateUUID(),
      "origin": "https://overchat.ai",
      "referer": "https://overchat.ai/",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"
    };

    console.log(`Sending request to Overchat API...`);

    // Make request to Overchat API
    const response = await fetch(CONFIG.BASE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    console.log(`Overchat API Response: ${response.status}`);

    // Handle non-streaming response
    if (!stream) {
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    // Handle streaming response
    if (response.ok) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Pipe the response directly
      response.body.pipe(res);
    } else {
      const errorText = await response.text();
      console.error(`Overchat API Error: ${errorText}`);
      res.status(response.status).json({ 
        error: `API Error: ${response.status}`,
        details: errorText.substring(0, 500)
      });
    }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📋 Models: http://localhost:${PORT}/v1/models`);
  console.log(`💬 Chat: POST http://localhost:${PORT}/v1/chat/completions`);
});
