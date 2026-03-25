/**
 * Image World King API Proxy - Cloudflare Worker
 * 
 * A production-ready proxy for the Image World King AI image generation API
 * Features:
 * - CORS support
 * - Rate limiting
 * - Request validation
 * - Error handling
 * - Caching support
 * 
 * Usage:
 * GET /api/generate?prompt=your_prompt
 * GET /health - Health check
 * GET /stats - Usage statistics
 */

// Configuration
const CONFIG = {
  // Rate limiting: DISABLED (no limits)
  RATE_LIMIT: null,
  
  // Cache TTL in seconds (5 minutes to match API expiration)
  CACHE_TTL: 300,
  
  // Target API
  TARGET_API: 'https://image-world-king.vercel.app/api/gen-v1',
  
  // Allowed origins (use '*' for public access)
  ALLOWED_ORIGINS: ['*'],
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
};

// Storage for rate limiting (using Cloudflare KV if available)
let rateLimitStore = new Map();

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPreflight();
    }
    
    // Route handling
    try {
      switch (url.pathname) {
        case '/api/generate':
          return await handleGenerate(request, env);
        
        case '/health':
          return handleHealth();
        
        case '/stats':
          return await handleStats(env);
        
        default:
          return jsonResponse(
            { 
              error: 'Not Found',
              message: 'Use /api/generate?prompt=your_text',
              endpoints: {
                generate: '/api/generate?prompt={text}',
                health: '/health',
                stats: '/stats'
              }
            },
            { status: 404 }
          );
      }
    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse(
        { 
          error: 'Internal Server Error',
          message: error.message 
        },
        { status: 500 }
      );
    }
  }
};

/**
 * Handle image generation requests
 */
async function handleGenerate(request, env) {
  const url = new URL(request.url);
  const prompt = url.searchParams.get('prompt');
  
  // Validate prompt
  if (!prompt || prompt.trim().length === 0) {
    return jsonResponse(
      { 
        error: 'Bad Request',
        message: 'Missing or empty prompt parameter' 
      },
      { status: 400 }
    );
  }
  
  // Validate prompt length (prevent abuse)
  if (prompt.length > 500) {
    return jsonResponse(
      { 
        error: 'Bad Request',
        message: 'Prompt too long (max 500 characters)' 
      },
      { status: 400 }
    );
  }
  
  // Check rate limiting (DISABLED - removed)
  // No rate limits now!
  /*
  const clientId = getClientId(request);
  if (!await checkRateLimit(clientId, env)) {
    return jsonResponse(
      { 
        error: 'Too Many Requests',
        message: `Rate limit exceeded`,
        retry_after: 60
      },
      { 
        status: 429,
        headers: { 'Retry-After': '60' }
      }
    );
  }
  */
  
  // Check cache first
  const cacheKey = `iwk:${prompt.trim().toLowerCase()}`;
  if (env.CACHE_KV) {
    const cached = await env.CACHE_KV.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return jsonResponse(JSON.parse(cached));
    }
  }
  
  // Make request to target API
  const targetUrl = `${CONFIG.TARGET_API}?text=${encodeURIComponent(prompt)}`;
  
  console.log('Proxying request to:', targetUrl);
  
  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ImageWorldKing-Worker/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Target API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate response
    if (!data.success || !data.image_url) {
      throw new Error('Invalid response from target API');
    }
    
    // Add metadata
    const responseData = {
      ...data,
      proxied: true,
      timestamp: new Date().toISOString(),
      cache_key: cacheKey
    };
    
    // Cache the response
    if (env.CACHE_KV) {
      await env.CACHE_KV.put(cacheKey, JSON.stringify(responseData), {
        expirationTtl: CONFIG.CACHE_TTL
      });
    }
    
    // Increment stats
    await incrementStats(env);
    
    return jsonResponse(responseData, {
      headers: {
        'Cache-Control': `public, max-age=${CONFIG.CACHE_TTL}`,
      }
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return jsonResponse(
      { 
        error: 'Gateway Error',
        message: `Failed to fetch from target API: ${error.message}` 
      },
      { status: 502 }
    );
  }
}

/**
 * Health check endpoint
 */
function handleHealth() {
  return jsonResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    config: {
      rate_limit: CONFIG.RATE_LIMIT,
      cache_ttl: CONFIG.CACHE_TTL,
      target_api: CONFIG.TARGET_API
    }
  });
}

/**
 * Stats endpoint
 */
async function handleStats(env) {
  let stats = {
    total_requests: 0,
    successful_requests: 0,
    failed_requests: 0,
    last_reset: 'unknown'
  };
  
  if (env.STATS_KV) {
    const stored = await env.STATS_KV.get('stats');
    if (stored) {
      stats = JSON.parse(stored);
    }
  }
  
  return jsonResponse(stats);
}

/**
 * Handle CORS preflight requests
 */
function handleCorsPreflight() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Get client ID for rate limiting (IP address)
 */
function getClientId(request) {
  const cfConnectingIp = request.headers.get('CF-Connecting-IP');
  const xForwardedFor = request.headers.get('X-Forwarded-For');
  return cfConnectingIp || xForwardedFor?.split(',')[0] || 'unknown';
}

/**
 * Check rate limit for a client
 */
async function checkRateLimit(clientId, env) {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  
  // Use KV storage if available
  if (env.RATE_LIMIT_KV) {
    const key = `rate:${clientId}`;
    const data = await env.RATE_LIMIT_KV.get(key);
    
    if (!data) {
      await env.RATE_LIMIT_KV.put(key, JSON.stringify({ count: 1, timestamp: now }), {
        expirationTtl: 60
      });
      return true;
    }
    
    const parsed = JSON.parse(data);
    if (now - parsed.timestamp < windowMs) {
      if (parsed.count >= CONFIG.RATE_LIMIT) {
        return false;
      }
      await env.RATE_LIMIT_KV.put(key, JSON.stringify({ 
        count: parsed.count + 1, 
        timestamp: parsed.timestamp 
      }), {
        expirationTtl: 60
      });
      return true;
    } else {
      await env.RATE_LIMIT_KV.put(key, JSON.stringify({ count: 1, timestamp: now }), {
        expirationTtl: 60
      });
      return true;
    }
  }
  
  // Fallback to in-memory storage (for development)
  const clientData = rateLimitStore.get(clientId) || { count: 0, timestamp: now };
  
  if (now - clientData.timestamp < windowMs) {
    if (clientData.count >= CONFIG.RATE_LIMIT) {
      return false;
    }
    clientData.count++;
  } else {
    clientData.count = 1;
    clientData.timestamp = now;
  }
  
  rateLimitStore.set(clientId, clientData);
  return true;
}

/**
 * Increment usage statistics
 */
async function incrementStats(env) {
  if (!env.STATS_KV) return;
  
  try {
    const stored = await env.STATS_KV.get('stats');
    const stats = stored ? JSON.parse(stored) : {
      total_requests: 0,
      successful_requests: 0,
      failed_requests: 0,
      last_reset: new Date().toISOString()
    };
    
    stats.total_requests++;
    stats.successful_requests++;
    
    await env.STATS_KV.put('stats', JSON.stringify(stats));
  } catch (error) {
    console.error('Stats error:', error);
  }
}

/**
 * Helper function to create JSON responses
 */
function jsonResponse(data, options = {}) {
  const { status = 200, headers = {} } = options;
  
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...headers
    }
  });
}
