/**
 * AIHubMix API Worker v3.0
 * Proxy requests to AIHubMix API with automatic key rotation
 * Supports 20+ free models with 10 API keys for load balancing
 */

// API Key rotation system
class ApiKeyRotator {
  constructor(keys) {
    this.keys = keys.map((key, index) => ({
      key,
      index,
      failures: 0,
      lastFailure: null,
      successCount: 0
    }));
    this.currentIndex = 0;
    this.totalKeys = keys.length;
  }

  // Get next key in rotation
  getNextKey() {
    const keyInfo = this.keys[this.currentIndex];
    console.log(`🔑 Using API Key #${this.currentIndex + 1}/${this.totalKeys}`);
    return keyInfo;
  }

  // Rotate to next key
  rotate() {
    this.currentIndex = (this.currentIndex + 1) % this.totalKeys;
  }

  // Report success for current key
  reportSuccess() {
    this.keys[this.currentIndex].successCount++;
    this.keys[this.currentIndex].failures = Math.max(0, this.keys[this.currentIndex].failures - 1);
  }

  // Report failure for current key
  reportFailure(error) {
    this.keys[this.currentIndex].failures++;
    this.keys[this.currentIndex].lastFailure = new Date().toISOString();
    console.log(`⚠️  Key #${this.currentIndex + 1} failed (${this.keys[this.currentIndex].failures}x), rotating...`);
    
    // Auto-rotate on failure
    this.rotate();
  }

  // Get statistics
  getStats() {
    return this.keys.map(k => ({
      index: k.index + 1,
      key: `${k.key.substring(0, 15)}...`,
      successes: k.successCount,
      failures: k.failures,
      lastFailure: k.lastFailure || 'Never'
    }));
  }
}

// Initialize with 10 API keys (including original)
const API_KEYS = [
  'sk-7d0UpxQGacF7uAgb7dF6FaE6D2744023A971E1485331C96d', // Original key #1
  'sk-I2FnnMfrTSrRTSDBC4D0D1Fa295c455e9c49B70d234615Be',   // Key #2
  'sk-J50KWB5NcJBiC2SvDdDfBa31074c4d538f3769602f378d4d',   // Key #3
  'sk-ctcyUEaYmCgbzOccC99091E623B74182A1F0A3D7E30aB54f',   // Key #4
  'sk-fRdZhTBPXKISpfoJDeF10f188c1847Ae8260018e76Eb35Fc',   // Key #5
  'sk-IoUCro3mhxHifaoV7593Ec1090064dCbA10b8d8719Fc6e5a',   // Key #6
  'sk-6IqVZGoG8YnaDg6D129cC62742Ae4824B919Be86FdCb312a',   // Key #7
  'sk-096zPCO99Jb6ldzwE0E3E39f9eEc4f48B092360d220673B1',   // Key #8
  'sk-Tv9ZjUZUrGAhkqRBAfD4Ba47Ac70429e92Cf768c353571C9',   // Key #9
  'sk-YK5I65k7XsmhXpcZ25649b26458f45Fe91Fd2d2aBfEe4180'    // Key #10
];

const keyRotator = new ApiKeyRotator(API_KEYS);

// Complete list of supported free models
const ALL_MODELS = [
  // Coding Models (9)
  { id: 'coding-glm-5-free', type: 'coding', context: '-', provider: 'Zhipu' },
  { id: 'coding-glm-5-turbo-free', type: 'coding', context: '-', provider: 'Zhipu' },
  { id: 'coding-minimax-m2.7-free', type: 'coding', context: '204K', provider: 'MiniMax' },
  { id: 'minimax-m2.5-free', type: 'coding', context: '204K', provider: 'MiniMax' },
  { id: 'coding-minimax-m2.5-free', type: 'coding', context: '204K', provider: 'MiniMax' },
  { id: 'coding-minimax-m2.1-free', type: 'coding', context: '204K', provider: 'MiniMax' },
  { id: 'coding-glm-4.7-free', type: 'coding', context: '-', provider: 'Zhipu' },
  { id: 'coding-glm-4.6-free', type: 'coding', context: '200K', provider: 'Zhipu' },
  { id: 'coding-minimax-m2-free', type: 'coding', context: '204K', provider: 'MiniMax' },
  { id: 'kimi-for-coding-free', type: 'coding', context: '256K', provider: 'Moonshot' },
  
  // General Purpose Models (8)
  { id: 'gpt-4.1-free', type: 'general', context: '1M', provider: 'OpenAI (Azure)' },
  { id: 'gpt-4.1-mini-free', type: 'general', context: '1M', provider: 'OpenAI (Azure)' },
  { id: 'gpt-4.1-nano-free', type: 'general', context: '1M', provider: 'OpenAI (Azure)' },
  { id: 'gpt-4o-free', type: 'general', context: '1M', provider: 'OpenAI (Azure)' },
  { id: 'glm-4.7-flash-free', type: 'general', context: '-', provider: 'Zhipu' },
  { id: 'step-3.5-flash-free', type: 'general', context: '256K', provider: 'StepFun' },
  { id: 'mimo-v2-flash-free', type: 'general', context: '256K', provider: 'Xiaomi' },
  
  // Vision/Multimodal Models (3)
  { id: 'gemini-3.1-flash-image-preview-free', type: 'vision', context: '-', provider: 'Google' },
  { id: 'gemini-3-flash-preview-free', type: 'vision', context: '1M', provider: 'Google' },
  { id: 'gemini-2.0-flash-free', type: 'vision', context: '1M', provider: 'Google' }
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Only handle POST requests to /v1/chat/completions
      if (url.pathname === '/v1/chat/completions' && request.method === 'POST') {
        return await handleChatCompletion(request, env, corsHeaders);
      }

      // Health check endpoint
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ 
          status: 'ok',
          worker: 'AIHubMix Proxy',
          version: '2.0.0'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Models list endpoint
      if (url.pathname === '/models') {
        return new Response(JSON.stringify({
          models: ALL_MODELS
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Key rotation stats endpoint
      if (url.pathname === '/stats') {
        return new Response(JSON.stringify({
          totalKeys: API_KEYS.length,
          currentKeyIndex: keyRotator.currentIndex + 1,
          keyStats: keyRotator.getStats(),
          totalRequests: keyRotator.keys.reduce((sum, k) => sum + k.successCount + k.failures, 0),
          successfulRequests: keyRotator.keys.reduce((sum, k) => sum + k.successCount, 0),
          failedRequests: keyRotator.keys.reduce((sum, k) => sum + k.failures, 0)
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Default response with full model list
      return new Response(JSON.stringify({
        name: 'AIHubMix Worker',
        version: '3.0.0',
        features: [
          '20+ free AI models',
          '10 API keys with auto-rotation',
          'Automatic retry on rate limits',
          'Load balancing across keys'
        ],
        endpoints: {
          chat: '/v1/chat/completions (POST)',
          health: '/health (GET)',
          models: '/models (GET)',
          stats: '/stats (GET)'
        },
        totalModels: 20,
        apiKeys: {
          total: API_KEYS.length,
          rotation: 'Round-robin with auto-failover'
        },
        categories: {
          coding: 9,
          general: 8,
          vision: 3
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message,
        type: 'WorkerError'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

/**
 * Handle chat completion requests with automatic key rotation
 */
async function handleChatCompletion(request, env, corsHeaders) {
  console.log('📤 Received chat completion request');
  
  // Get the request body
  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return new Response(JSON.stringify({
      error: {
        message: 'Invalid JSON in request body',
        type: 'InvalidRequest'
      }
    }), {
      status: 400,
      headers: corsHeaders
    });
  }

  // Validate model
  const { model, messages } = requestBody;
  if (!model || !messages) {
    return new Response(JSON.stringify({
      error: {
        message: 'Missing required fields: model and messages',
        type: 'InvalidRequest'
      }
    }), {
      status: 400,
      headers: corsHeaders
    });
  }

  console.log(`Model: ${model}, Messages: ${messages.length}`);

  // Forward to AIHubMix API with rotated key
  const aihubmixUrl = 'https://aihubmix.com/v1/chat/completions';
  
  // Get current API key from rotator
  const keyInfo = keyRotator.getNextKey();
  const apiKey = keyInfo.key;
  
  try {
    console.log(`🔄 Attempting request with Key #${keyInfo.index + 1}`);
    
    const aihubmixResponse = await fetch(aihubmixUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`AIHubMix response status: ${aihubmixResponse.status}`);

    // Get response data
    const responseData = await aihubmixResponse.json();

    // Check for rate limit errors and auto-retry with different key
    if (aihubmixResponse.status === 429 || aihubmixResponse.status === 403) {
      console.log(`⚠️  Rate limit or auth error, rotating key...`);
      keyRotator.reportFailure('Rate limit');
      
      // Retry once with next key
      console.log(`🔄 Retrying with next key...`);
      const retryKey = keyRotator.getNextKey().key;
      
      const retryResponse = await fetch(aihubmixUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${retryKey}`
        },
        body: JSON.stringify(requestBody)
      });
      
      const retryData = await retryResponse.json();
      
      if (retryResponse.ok) {
        keyRotator.reportSuccess();
        console.log('✅ Retry successful!');
      }
      
      return new Response(JSON.stringify(retryData), {
        status: retryResponse.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Success!
    keyRotator.reportSuccess();
    console.log('✅ Request successful, rotating to next key');
    keyRotator.rotate();

    // Return the response from AIHubMix
    return new Response(JSON.stringify(responseData), {
      status: aihubmixResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('AIHubMix API error:', error);
    keyRotator.reportFailure(error);
    
    return new Response(JSON.stringify({
      error: {
        message: `Failed to call AIHubMix API: ${error.message}`,
        type: 'UpstreamError',
        details: 'Key rotated automatically'
      }
    }), {
      status: 502,
      headers: corsHeaders
    });
  }
}
