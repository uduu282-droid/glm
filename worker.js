/**
 * Overchat.ai API Worker
 * Proxies requests to Overchat.ai with support for all models
 */

// Configuration
const CONFIG = {
  BASE_URL: "https://api.overchat.ai/v1/chat/completions",
  DEFAULT_MODEL: "anthropic/claude-sonnet-3-5",
  DEFAULT_PERSONA_ID: "claude-sonnet-3-5-landing",
  MAX_TOKENS: 4000,
  TEMPERATURE: 0.5,
  
  // Rate limiting (requests per minute per IP)
  RATE_LIMIT: 10,
  RATE_LIMIT_WINDOW: 60, // seconds
  
  // Device UUID rotation (generate new UUID every X requests)
  UUID_ROTATION: 100,
};

// Available models mapping
const MODELS = {
  // Claude models
  "claude-sonnet-4-5": { model: "anthropic/claude-sonnet-4-5", persona: "claude-sonnet-4-5-landing" },
  "claude-sonnet-3-7": { model: "anthropic/claude-sonnet-3-7", persona: "claude-sonnet-3-7-landing" },
  "claude-sonnet-3-5": { model: "anthropic/claude-sonnet-3-5", persona: "claude-sonnet-3-5-landing" },
  "claude-opus-4-6": { model: "anthropic/claude-opus-4-6", persona: "claude-opus-4-6-landing" },
  "claude-haiku-4-5": { model: "anthropic/claude-haiku-4-5-20251001", persona: "claude-haiku-4-5-landing" },
  
  // GPT models
  "gpt-5.1": { model: "openai/gpt-5.1", persona: "gpt-5-1-landing" },
  "gpt-5": { model: "openai/gpt-5", persona: "gpt-5-landing" },
  "gpt-4o": { model: "openai/gpt-4o", persona: "gpt-4o-landing" },
  "gpt-o3": { model: "openai/o3", persona: "o3-landing" },
  
  // Gemini models
  "gemini-2-5-pro": { model: "google/gemini-2-5-pro", persona: "gemini-2-5-pro-landing" },
  "gemini-2-0-flash": { model: "google/gemini-2-0-flash", persona: "gemini-2-0-flash-landing" },
  
  // Other models
  "kimi-k2": { model: "moonshot/kimi-k2", persona: "kimi-k2-landing" },
  "kimi-k2-turbo": { model: "moonshot/kimi-k2-turbo", persona: "kimi-k2-turbo-landing" },
  "deepseek-v3": { model: "deepseek/deepseek-v3", persona: "deepseek-v3-landing" },
  "mistral": { model: "mistral/mistral-large", persona: "mistral-large-landing" },
  "qwen-2-5-max": { model: "alibaba/qwen-2-5-max", persona: "qwen-2-5-max-landing" },
  "llama-4": { model: "meta/llama-4", persona: "llama-4-landing" },
  "grok-4": { model: "xai/grok-4", persona: "grok-4-landing" },
  "grok-3": { model: "xai/grok-3", persona: "grok-3-landing" },
};

/**
 * Generate UUID v4
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Check rate limit
 */
async function checkRateLimit(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `ratelimit:${ip}`;
  
  if (env.RATE_LIMIT_KV) {
    const current = await env.RATE_LIMIT_KV.get(key);
    const now = Math.floor(Date.now() / 1000);
    
    if (current) {
      const data = JSON.parse(current);
      if (now - data.window_start < CONFIG.RATE_LIMIT_WINDOW) {
        if (data.count >= CONFIG.RATE_LIMIT) {
          return false;
        }
        data.count++;
        await env.RATE_LIMIT_KV.put(key, JSON.stringify(data), { expirationTtl: CONFIG.RATE_LIMIT_WINDOW });
        return true;
      }
    }
    
    // New window
    await env.RATE_LIMIT_KV.put(key, JSON.stringify({ window_start: now, count: 1 }), { expirationTtl: CONFIG.RATE_LIMIT_WINDOW });
  }
  
  return true;
}

/**
 * Handle CORS preflight
 */
function handleCORS(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Device-UUID',
    'Access-Control-Max-Age': '86400',
  };
  
  return new Response(null, { headers });
}

/**
 * Main chat handler
 */
async function handleChat(request, env) {
  try {
    // Check rate limit
    const rateLimited = await checkRateLimit(request, env);
    if (!rateLimited) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse request
    const body = await request.json();
    const modelName = body.model || CONFIG.DEFAULT_MODEL;
    
    // Get model config
    const modelConfig = MODELS[modelName] || { model: modelName, persona: `${modelName}-landing` };
    
    // Generate device UUID
    const deviceUUID = generateUUID();
    
    // Prepare messages
    const messages = [];
    if (body.messages && Array.isArray(body.messages)) {
      // Use provided messages
      body.messages.forEach(msg => {
        messages.push({
          id: generateUUID(),
          role: msg.role || 'user',
          content: msg.content || ''
        });
      });
    } else if (body.message) {
      // Single message format
      messages.push({
        id: generateUUID(),
        role: 'user',
        content: body.message
      });
    } else {
      return new Response(JSON.stringify({ error: 'No message provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Add system message if provided
    if (body.system) {
      messages.push({
        id: generateUUID(),
        role: 'system',
        content: body.system
      });
    }
    
    // Prepare payload
    const payload = {
      chatId: body.chat_id || generateUUID(),
      model: modelConfig.model,
      messages: messages,
      personaId: body.persona_id || modelConfig.persona,
      stream: body.stream !== undefined ? body.stream : true,
      temperature: body.temperature || CONFIG.TEMPERATURE,
      max_tokens: body.max_tokens || CONFIG.MAX_TOKENS,
      frequency_penalty: body.frequency_penalty || 0,
      presence_penalty: body.presence_penalty || 0,
      top_p: body.top_p || 0.95
    };
    
    // Set up headers
    const headers = {
      "accept": "*/*",
      "content-type": "application/json",
      "x-device-platform": "web",
      "x-device-version": "1.0.44",
      "x-device-language": "en-US",
      "x-device-uuid": deviceUUID,
      "origin": "https://overchat.ai",
      "referer": "https://overchat.ai/",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"
    };
    
    // Make request to Overchat API
    const response = await fetch(CONFIG.BASE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    // Log error for debugging (check wrangler tail)
    if (!response.ok) {
      console.error(`Overchat API Error: ${response.status} - ${await response.text()}`);
    }
    
    // Handle non-streaming response
    if (!payload.stream) {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          ...handleCORS(request).headers
        }
      });
    }
    
    // Handle streaming response
    if (response.ok) {
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          ...handleCORS(request).headers
        }
      });
    } else {
      const errorText = await response.text();
      return new Response(JSON.stringify({ 
        error: `API Error: ${response.status}`,
        details: errorText.substring(0, 500)
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * List available models
 */
function handleModelsList() {
  const modelsList = Object.entries(MODELS).map(([name, config]) => ({
    id: name,
    model: config.model,
    persona: config.persona,
    provider: config.model.split('/')[0],
    name: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }));
  
  return new Response(JSON.stringify({ models: modelsList }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Worker entry point
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS(request);
    }
    
    // Route handling
    if (path === '/v1/chat/completions' && request.method === 'POST') {
      return handleChat(request, env);
    } else if (path === '/v1/models' && request.method === 'GET') {
      return handleModelsList();
    } else if (path === '/' || path === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        version: '1.0.0',
        models: Object.keys(MODELS).length
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
