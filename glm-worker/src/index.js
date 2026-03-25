/**
 * GLM-5 Worker Proxy - OpenAI-Compatible API for Z.ai GLM-5
 * 
 * A Cloudflare Worker that provides OpenAI-compatible API endpoints
 * for free access to Zhipu AI's GLM-5 model via reverse-engineered API.
 * 
 * Features:
 * - OpenAI-compatible chat completions and model listing
 * - Persistent chat sessions with memory
 * - Real-time streaming via SSE
 * - Browser fingerprinting & request signing
 * - Automatic authentication (guest mode)
 */

import { Hono } from 'hono';

// ─────────────────────────────────────────────────────────────────────────────
// Configuration & Constants
// ─────────────────────────────────────────────────────────────────────────────

const CONFIG = {
  BASE_URL: 'https://chat.z.ai',
  API_BASE: 'https://chat.z.ai/api/v1',
  CHAT_API: 'https://chat.z.ai/api/v2/chat/completions',
  
  // Browser fingerprints
  USER_AGENT: 'Mozilla/5.0 (X11; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0',
  FE_VERSION: 'prod-fe-1.0.271',
  
  // Timeouts
  TIMEOUT_MS: 120000,
};

// Default browser headers
const BROWSER_HEADERS = {
  'User-Agent': CONFIG.USER_AGENT,
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Dest': 'empty',
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

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
 * Get current timestamp in milliseconds
 */
function getTimestamp() {
  return Date.now();
}

/**
 * Get current timestamp in seconds
 */
function getTimestampSeconds() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Base64 encode
 */
function base64Encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

/**
 * Get current time in ISO format
 */
function getISOTime() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, '.000Z');
}

/**
 * Get current UTC time string
 */
function getUTCTime() {
  return new Date().toUTCString();
}

/**
 * Get current IST time (for GLM variables)
 */
function getISTTime() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset);
  return istTime.toISOString().replace(/\.\d{3}Z$/, '');
}

// ─────────────────────────────────────────────────────────────────────────────
// HMAC Signature
// ─────────────────────────────────────────────────────────────────────────────

// Simplified secret for HMAC signing (extracted from Python glm.py)
const SECRET = "key-@@@@)))()((9))-xxxx&&&%%%%%";

/**
 * Generate HMAC-SHA256 signature for GLM API (matching Python exactly)
 */
async function signRequest(tsMs, prompt, userId, requestId) {
  const encoder = new TextEncoder();
  
  // Build the data string (matches Python: sp|b64|ts_ms)
  const sp = `requestId,${requestId},timestamp,${tsMs},user_id,${userId}`;
  const b64 = base64Encode(prompt);
  const d = `${sp}|${b64}|${tsMs}`;
  
  // Derive key using timestamp window (iv = floor(ts_ms / 300000))
  const iv = Math.floor(tsMs / 300000).toString();
  
  // Step 1: Derive key dk = HMAC(secret, iv)
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const dkBuffer = await crypto.subtle.sign('HMAC', secretKey, encoder.encode(iv));
  const dk = Array.from(new Uint8Array(dkBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Step 2: Sign data with derived key: signature = HMAC(dk, d)
  const dkKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(dk),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const sigBuffer = await crypto.subtle.sign('HMAC', dkKey, encoder.encode(d));
  return Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// Authentication & Session Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bootstrap authentication (seed cookies + get guest token)
 */
async function bootstrapAuth(ctx) {
  try {
    // Step 1: Seed cookies by visiting homepage
    const homeResponse = await fetch(CONFIG.BASE_URL, {
      method: 'GET',
      headers: {
        ...BROWSER_HEADERS,
        'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Dest': 'document',
        'Upgrade-Insecure-Requests': '1',
      },
    });
    
    if (!homeResponse.ok) {
      throw new Error(`Failed to seed cookies: ${homeResponse.status}`);
    }
    
    // Step 2: Get guest auth token
    const authResponse = await fetch(`${CONFIG.API_BASE}/auths`, {
      method: 'GET',
      headers: {
        ...BROWSER_HEADERS,
        'Accept': 'application/json',
        'Referer': `${CONFIG.BASE_URL}/`,
      },
    });
    
    if (!authResponse.ok) {
      throw new Error(`Auth failed: ${authResponse.status}`);
    }
    
    const authData = await authResponse.json();
    
    return {
      id: authData.id,
      token: authData.token,
      email: authData.email,
      name: authData.name || 'Guest',
    };
  } catch (error) {
    ctx.executionCtx.waitUntil(Promise.resolve(console.error('Bootstrap error:', error)));
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat Session Class
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GLM Chat Session - manages conversation state
 */
class ChatSession {
  constructor(auth) {
    this.auth = auth;
    this.chatId = null;
    this.lastCompId = null;
    this.historyMessages = {};
    this.historyCurrentId = null;
    this.turn = 0;
  }
  
  /**
   * Start a new chat session
   */
  async start(firstMessage) {
    const tsS = getTimestampSeconds();
    const tsMs = getTimestamp();
    const firstMsgId = generateUUID();
    
    // Initialize history with first message
    this.historyMessages = {
      [firstMsgId]: {
        id: firstMsgId,
        parentId: null,
        childrenIds: [],
        role: 'user',
        content: firstMessage,
        timestamp: tsS,
        models: ['glm-5'],
      }
    };
    this.historyCurrentId = firstMsgId;
    
    // Create chat on server
    const payload = {
      chat: {
        id: '',
        title: 'New Chat',
        models: ['glm-5'],
        params: {},
        history: {
          messages: this.historyMessages,
          currentId: this.historyCurrentId,
        },
        tags: [],
        flags: [],
        features: [{
          type: 'tool_selector',
          server: 'tool_selector_h',
          status: 'hidden'
        }],
        mcp_servers: [],
        enable_thinking: true,
        auto_web_search: false,
        message_version: 1,
        extra: {},
        timestamp: tsMs,
      }
    };
    
    const response = await fetch(`${CONFIG.API_BASE}/chats/new`, {
      method: 'POST',
      headers: {
        ...BROWSER_HEADERS,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.auth.token}`,
        'X-FE-Version': CONFIG.FE_VERSION,
        'Referer': `${CONFIG.BASE_URL}/`,
        'Origin': CONFIG.BASE_URL,
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create chat: ${response.status}`);
    }
    
    const data = await response.json();
    this.chatId = data.id;
    
    // Send first message
    await this._complete(firstMessage, firstMsgId, null);
  }
  
  /**
   * Send a follow-up message
   */
  async send(message) {
    if (!this.chatId) {
      throw new Error('Call start() first');
    }
    
    const userMsgId = generateUUID();
    const tsS = getTimestampSeconds();
    const prevId = this.historyCurrentId;
    
    // Add user message to history
    this.historyMessages[userMsgId] = {
      id: userMsgId,
      parentId: prevId,
      childrenIds: [],
      role: 'user',
      content: message,
      timestamp: tsS,
      models: ['glm-5'],
    };
    
    if (prevId) {
      this.historyMessages[prevId].childrenIds.push(userMsgId);
    }
    
    this.historyCurrentId = userMsgId;
    
    return await this._complete(message, userMsgId, this.lastCompId);
  }
  
  /**
   * Complete request to GLM API
   */
  async _complete(message, userMsgId, parentCompId) {
    this.turn++;
    
    const tsMs = getTimestamp();
    const requestId = generateUUID();
    const compId = generateUUID();
    
    // Sign the request
    const signature = await signRequest(tsMs, message, this.auth.id, requestId);
    
    // Build query parameters
    const params = new URLSearchParams({
      timestamp: tsMs.toString(),
      requestId: requestId,
      user_id: this.auth.id,
      version: '1.0.0',
      platform: 'web',
      token: this.auth.token,
      user_agent: CONFIG.USER_AGENT,
      language: 'en-US',
      languages: 'en-US,en',
      timezone: 'Asia/Kolkata',
      cookie_enabled: 'true',
      screen_width: '1600',
      screen_height: '900',
      screen_resolution: '1600x900',
      viewport_height: '794',
      viewport_width: '713',
      viewport_size: '713x794',
      color_depth: '24',
      pixel_ratio: '1.2',
      current_url: `https://chat.z.ai/c/${this.chatId}`,
      pathname: `/c/${this.chatId}`,
      search: '',
      hash: '',
      host: 'chat.z.ai',
      hostname: 'chat.z.ai',
      protocol: 'https:',
      referrer: '',
      title: 'Z.ai - Free AI Chatbot & Agent powered by GLM-5 & GLM-4.7',
      timezone_offset: '-330',
      local_time: getISOTime(),
      utc_time: getUTCTime(),
      is_mobile: 'false',
      is_touch: 'false',
      max_touch_points: '0',
      browser_name: 'Firefox',
      os_name: 'Linux',
      signature_timestamp: tsMs.toString(),
    });
    
    const istTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    
    // Build request payload
    const payload = {
      stream: true,
      model: 'glm-5',
      messages: [{ role: 'user', content: message }],
      signature_prompt: message,
      params: {},
      extra: {},
      features: {
        image_generation: false,
        web_search: false,
        auto_web_search: true,
        preview_mode: true,
        flags: [],
        enable_thinking: true,
      },
      variables: {
        '{{USER_NAME}}': this.auth.name,
        '{{USER_LOCATION}}': 'Unknown',
        '{{CURRENT_DATETIME}}': istTime.toISOString().split('.')[0],
        '{{CURRENT_DATE}}': istTime.toISOString().split('T')[0],
        '{{CURRENT_TIME}}': istTime.toTimeString().split(' ')[0],
        '{{CURRENT_WEEKDAY}}': istTime.toLocaleDateString('en-US', { weekday: 'long' }),
        '{{CURRENT_TIMEZONE}}': 'Asia/Kolkata',
        '{{USER_LANGUAGE}}': 'en-US',
      },
      chat_id: this.chatId,
      id: compId,
      current_user_message_id: userMsgId,
      current_user_message_parent_id: parentCompId,
      background_tasks: {
        title_generation: true,
        tags_generation: true,
      },
    };
    
    const url = `${CONFIG.CHAT_API}?${params.toString()}`;
    
    const headers = {
      ...BROWSER_HEADERS,
      'Accept': 'text/event-stream',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.auth.token}`,
      'X-FE-Version': CONFIG.FE_VERSION,
      'X-Signature': signature,
      'Referer': `https://chat.z.ai/c/${this.chatId}`,
      'Origin': 'https://chat.z.ai',
      'Cache-Control': 'no-cache',
    };
    
    // Make the request
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.slice(0, 300)}`);
    }
    
    // Parse SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let answer = [];
    let buffer = '';
    let phase = null;
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        
        const jsonStr = trimmed.slice(5).trim();
        if (!jsonStr || jsonStr === '[DONE]') continue;
        
        try {
          const event = JSON.parse(jsonStr);
          if (event.type !== 'chat:completion') continue;
          
          const data = event.data || {};
          const delta = data.delta_content || '';
          const newPhase = data.phase || null;
          
          if ('error' in data) {
            throw new Error(data.error);
          }
          
          if (newPhase !== phase) {
            phase = newPhase;
          }
          
          if (delta && phase !== 'thinking') {
            answer.push(delta);
          }
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      }
    }
    
    const fullAnswer = answer.join('');
    
    // Save assistant response to history
    const asstId = generateUUID();
    this.historyMessages[asstId] = {
      id: asstId,
      parentId: userMsgId,
      childrenIds: [],
      role: 'assistant',
      content: fullAnswer,
      timestamp: getTimestampSeconds(),
      models: ['glm-5'],
    };
    this.historyMessages[userMsgId].childrenIds.push(asstId);
    this.historyCurrentId = asstId;
    this.lastCompId = compId;
    
    return fullAnswer;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Global Session Cache with Auto-Recovery
// ─────────────────────────────────────────────────────────────────────────────

// In-memory cache (will be lost on Worker restart)
let globalSession = null;
let sessionPromise = null;
let lastError = null;
let errorCount = 0;
const MAX_ERRORS = 3; // Auto-reset after 3 consecutive errors

/**
 * Get or create cached chat session with auto-recovery
 */
async function getOrCreateSession(ctx) {
  // Auto-reset if too many errors
  if (errorCount >= MAX_ERRORS) {
    console.log(`Auto-resetting session after ${errorCount} errors`);
    resetSession();
  }
  
  if (!globalSession) {
    if (!sessionPromise) {
      sessionPromise = (async () => {
        try {
          const auth = await bootstrapAuth(ctx);
          const session = new ChatSession(auth);
          errorCount = 0; // Reset error counter on success
          return session;
        } catch (error) {
          errorCount++;
          sessionPromise = null;
          throw error;
        }
      })();
    }
    globalSession = await sessionPromise;
    sessionPromise = null;
  }
  return globalSession;
}

/**
 * Reset the global session
 */
function resetSession() {
  globalSession = null;
  sessionPromise = null;
  lastError = null;
  errorCount = 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hono App Setup
// ─────────────────────────────────────────────────────────────────────────────

const app = new Hono();

// CORS middleware
app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.header('Access-Control-Max-Age', '86400');
  
  if (c.req.method === 'OPTIONS') {
    c.status(204);
    return c.body(null);
  }
  
  await next();
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    session: globalSession ? 'active' : 'not_booted',
    turns: globalSession?.turn || 0,
    chat_id: globalSession?.chatId || null,
  });
});

// Models endpoint
app.get('/v1/models', (c) => {
  return c.json({
    object: 'list',
    data: [{
      id: 'glm-5',
      object: 'model',
      created: 1700000000,
      owned_by: 'zhipuai',
      permission: [],
      root: 'glm-5',
      parent: null,
    }],
  });
});

// Chat completions endpoint with retry logic
app.post('/v1/chat/completions', async (c) => {
  const MAX_RETRIES = 3;
  const BASE_DELAY = 1000; // 1 second
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const body = await c.req.json();
      const { messages, stream = false, model = 'glm-5' } = body;
      
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return c.json({
          error: { message: 'messages array is empty', type: 'invalid_request_error' }
        }, 400);
      }
      
      // Get or create session
      const session = await getOrCreateSession(c);
      
      // Extract last user message
      let lastUserMessage = null;
      let systemPrompt = '';
      
      for (const msg of messages) {
        if (msg.role === 'system') {
          systemPrompt = msg.content;
        } else if (msg.role === 'user') {
          lastUserMessage = msg.content;
        }
      }
      
      if (!lastUserMessage) {
        return c.json({
          error: { message: 'No user message found', type: 'invalid_request_error' }
        }, 400);
      }
      
      // Prepare message (prepend system prompt on first turn)
      const isTurn1 = session.turn === 0;
      const finalMessage = isTurn1 && systemPrompt 
        ? `${systemPrompt}\n\n${lastUserMessage}`
        : lastUserMessage;
      
      // Handle streaming
      if (stream) {
        const encoder = new TextEncoder();
        const completionId = `chatcmpl-${generateUUID()}`;
        
        const stream = new ReadableStream({
          async start(controller) {
            try {
              // Send initial chunk with role
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({
                  id: completionId,
                  object: 'chat.completion.chunk',
                  created: Math.floor(Date.now() / 1000),
                  model: model,
                  choices: [{
                    index: 0,
                    delta: { role: 'assistant', content: '' },
                    finish_reason: null,
                  }],
                })}\n\n`
              ));
              
              // Get response from GLM
              const answer = isTurn1 
                ? await session.start(finalMessage)
                : await session.send(finalMessage);
              
              // Stream tokens one by one (simulate real streaming)
              const tokens = answer.split(/(?=[ \n.,!?])/);
              for (const token of tokens) {
                if (token) {
                  controller.enqueue(encoder.encode(
                    `data: ${JSON.stringify({
                      id: completionId,
                      object: 'chat.completion.chunk',
                      created: Math.floor(Date.now() / 1000),
                      model: model,
                      choices: [{
                        index: 0,
                        delta: { content: token },
                        finish_reason: null,
                      }],
                    })}\n\n`
                  ));
                  
                  // Small delay to simulate streaming
                  await new Promise(resolve => setTimeout(resolve, 10));
                }
              }
              
              // Send final chunk
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({
                  id: completionId,
                  object: 'chat.completion.chunk',
                  created: Math.floor(Date.now() / 1000),
                  model: model,
                  choices: [{
                    index: 0,
                    delta: {},
                    finish_reason: 'stop',
                  }],
                })}\n\n`
              ));
              
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            } catch (error) {
              controller.error(error);
              throw error; // Will be caught by retry logic
            }
          },
        });
        
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } else {
        // Non-streaming response
        const answer = isTurn1 
          ? await session.start(finalMessage)
          : await session.send(finalMessage);
        
        return c.json({
          id: `chatcmpl-${generateUUID()}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: model,
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: answer,
            },
            finish_reason: 'stop',
          }],
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          },
        });
      }
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      lastError = error;
      
      // Auto-reset session on signature/rate limit errors
      if (error.message.includes('Signature validation failed') || 
          error.message.includes('429') ||
          error.message.includes('Rate limit')) {
        resetSession();
      }
      
      // If not last attempt, wait and retry
      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // All attempts failed
        console.error('All retries failed:', error);
        resetSession();
        return c.json({
          error: { 
            message: `Failed after ${MAX_RETRIES} attempts: ${error.message}`, 
            type: 'internal_server_error' 
          }
        }, 500);
      }
    }
  }
  
  // Should not reach here, but just in case
  return c.json({
    error: { message: 'Unknown error', type: 'internal_server_error' }
  }, 500);
});

// Session reset endpoint
app.post('/v1/session/reset', (c) => {
  resetSession();
  return c.json({
    status: 'reset',
    message: 'Session cleared - next request boots fresh chat',
  });
});

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'GLM-5 Worker Proxy',
    description: 'OpenAI-compatible API for free GLM-5 access',
    version: '1.0.0',
    endpoints: {
      chat_completions: '/v1/chat/completions',
      models: '/v1/models',
      health: '/health',
      reset: '/v1/session/reset',
    },
  });
});

// Export the worker
export default {
  fetch: app.fetch,
};
