/**
 * PhotoGrid Background Remover - Cloudflare Worker
 * 
 * Provides unlimited free access by rotating sessions
 * Automatically creates new sessions when quota is exhausted
 * 
 * Deploy with: wrangler deploy
 */

// Configuration
const CONFIG = {
  baseUrl: 'https://api.grid.plus/v1',
  defaultHeaders: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Origin': 'https://www.photogrid.app'
  },
  commonParams: {
    platform: 'h5',
    appid: '808645',
    version: '8.9.7',
    country: 'US',
    locale: 'en'
  },
  // Custom headers required by PhotoGrid API
  requiredHeaders: [
    'x-appid',
    'x-deviceid', 
    'x-ghostid',
    'x-mcc',
    'x-platform',
    'x-version',
    'sig'
  ]
};

// Session manager
class SessionManager {
  constructor() {
    this.sessions = [];
    this.currentSessionIndex = 0;
  }

  // Generate new session fingerprint
  generateFingerprint() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `session_${timestamp}_${random}`;
  }

  // Create new session headers
  createNewSession() {
    const fingerprint = this.generateFingerprint();
    const chromeVersion = Math.floor(Math.random() * 20 + 100);
    
    // Generate device ID and ghost ID (session identifiers)
    const deviceId = this.generateDeviceId();
    const ghostId = this.generateGhostId();
    
    return {
      ...CONFIG.defaultHeaders,
      'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.0.0 Safari/537.36`,
      'X-Client-Fingerprint': fingerprint,
      'X-Request-ID': `req_${Date.now()}_${Math.random().toString(36)}`,
      // Required PhotoGrid headers (captured from live traffic)
      'x-appid': CONFIG.commonParams.appid,
      'x-deviceid': deviceId,
      'x-ghostid': ghostId,
      'x-mcc': CONFIG.commonParams.locale,
      'x-platform': CONFIG.commonParams.platform,
      'x-sessiontoken': '',
      'x-uniqueid': '',
      'x-version': CONFIG.commonParams.version,
      'sec-ch-ua': '"Not-A.Brand";v="24", "Chromium";v="146"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"'
    };
  }

  // Generate device ID (32 char hex)
  generateDeviceId() {
    const timestamp = Date.now().toString(16);
    const random = Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return (timestamp + random).substring(0, 32);
  }

  // Generate ghost ID (similar format)
  generateGhostId() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Get current session headers
  getCurrentSession() {
    if (this.sessions.length === 0) {
      this.sessions.push(this.createNewSession());
    }
    return this.sessions[this.currentSessionIndex];
  }

  // Rotate to next session (when quota exhausted)
  rotateSession() {
    this.currentSessionIndex = (this.currentSessionIndex + 1) % this.sessions.length;
    
    // If we've cycled through all sessions, create a new one
    if (this.currentSessionIndex === 0 && this.sessions.length > 1) {
      this.sessions.push(this.createNewSession());
    }
    
    return this.getCurrentSession();
  }

  // Check remaining quota
  async checkQuota(headers) {
    try {
      const params = new URLSearchParams(CONFIG.commonParams);
      const response = await fetch(`${CONFIG.baseUrl}/web/nologinmethodlist?${params}`, {
        method: 'GET',
        headers: headers
      });
      
      const data = await response.json();
      return {
        uploadLimit: data.data?.lo_aistudio?.upload_limit || 0,
        downloadLimit: data.data?.lo_aistudio?.download_limit || 0,
        waitTime: data.data?.lo_aistudio?.wtime || 0
      };
    } catch (error) {
      console.error('Quota check failed:', error);
      return null;
    }
  }
}

// Global session manager
const sessionManager = new SessionManager();

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check endpoint
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          service: 'PhotoGrid Proxy',
          sessionsAvailable: sessionManager.sessions.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get user IP
      if (url.pathname === '/ip') {
        const ipResponse = await fetch(`${CONFIG.baseUrl}/web/current_ip`, {
          method: 'GET',
          headers: CONFIG.defaultHeaders
        });
        
        const ipData = await ipResponse.json();
        return new Response(JSON.stringify(ipData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get AI categories
      if (url.pathname === '/categories') {
        const params = new URLSearchParams(CONFIG.commonParams);
        const response = await fetch(`${CONFIG.baseUrl}/ai/aihug/category/list?${params}`, {
          method: 'GET',
          headers: CONFIG.defaultHeaders
        });
        
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get AI styles
      if (url.pathname === '/styles') {
        const params = new URLSearchParams(CONFIG.commonParams);
        const response = await fetch(`${CONFIG.baseUrl}/ai/web/aihug/style_list?${params}`, {
          method: 'GET',
          headers: CONFIG.defaultHeaders
        });
        
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get all available features with detailed quota info
      if (url.pathname === '/features') {
        const params = new URLSearchParams(CONFIG.commonParams);
        const headers = sessionManager.getCurrentSession();
        const response = await fetch(`${CONFIG.baseUrl}/web/nologinmethodlist?${params}`, {
          method: 'GET',
          headers: headers
        });
        
        const data = await response.json();
        const features = data.data || {};
        
        return new Response(JSON.stringify({
          status: 'success',
          features: {
            backgroundRemoval: features.wn_bgcut || features.wn_background,
            watermarkRemoval: features.wn_superremove,
            objectRemoval: features.mcp_remove,
            imageEnhancement: features.wn_enhancer,
            aiStyleTransfer: features.wn_aistyle_nano,
            superResolution: features.wn_superresolution,
            oldPhotoRestoration: features.wn_oldphoto,
            backgroundBlur: features.wn_backgroundblur,
            autoSelect: features.wn_autoselect
          },
          categories: 9,
          aiStyles: 181,
          sessionQuota: await sessionManager.checkQuota(headers)
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Watermark removal endpoint
      if (url.pathname === '/remove-watermark') {
        return new Response(JSON.stringify({
          status: 'ready',
          feature: 'watermark-removal',
          method: 'POST',
          endpoint: '/api/ai/remove/watermark',
          description: 'Remove watermarks, logos, and text from images',
          usage: 'Send POST request to /api/ai/remove/watermark with image data',
          quota: await sessionManager.checkQuota(sessionManager.getCurrentSession())
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Object removal endpoint
      if (url.pathname === '/remove-object') {
        return new Response(JSON.stringify({
          status: 'ready',
          feature: 'object-removal',
          method: 'POST',
          endpoint: '/api/ai/remove/object',
          description: 'Remove unwanted objects from photos',
          usage: 'Send POST request to /api/ai/remove/object with image data and object mask',
          quota: await sessionManager.checkQuota(sessionManager.getCurrentSession())
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Background removal - 2 step process
      if (url.pathname === '/remove-bg' || url.pathname === '/background-removal') {
        const imageUrl = url.searchParams.get('image_url');
        
        if (!imageUrl) {
          return new Response(JSON.stringify({
            error: 'Missing image_url parameter',
            usage: 'GET /remove-bg?image_url=https://example.com/image.jpg'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        try {
          // Step 1: Get upload URL - needs form-urlencoded body
          const session = sessionManager.getCurrentSession();
          
          // Create form data for upload URL request
          const uploadUrlParams = new URLSearchParams();
          uploadUrlParams.append('type', 'cut');
          
          const uploadUrlResponse = await fetch(`${CONFIG.baseUrl}/ai/web/nologin/getuploadurl`, {
            method: 'POST',
            headers: {
              ...session,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: uploadUrlParams.toString()
          });
          
          const uploadData = await uploadUrlResponse.json();
          
          if (uploadData.code !== 0) {
            throw new Error(`Upload URL failed: ${uploadData.errmsg || uploadData.code}`);
          }
          
          console.log('✅ Got upload URL, proceeding with image...');
          
          // Step 2: Upload image for processing
          const uploadParams = new URLSearchParams();
          uploadParams.append('image_url', imageUrl);
          if (uploadData.data && uploadData.data.file_id) {
            uploadParams.append('file_id', uploadData.data.file_id);
          }
          
          const uploadResponse = await fetch(`${CONFIG.baseUrl}/ai/web/bgcut/nologinupload`, {
            method: 'POST',
            headers: {
              ...session,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: uploadParams.toString()
          });
          
          const result = await uploadResponse.json();
          
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
          
        } catch (error) {
          return new Response(JSON.stringify({
            error: error.message,
            type: 'BackgroundRemovalError'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // Reset session (force new session)
      if (url.pathname === '/reset') {
        const newSession = sessionManager.createNewSession();
        sessionManager.sessions.push(newSession);
        sessionManager.currentSessionIndex = sessionManager.sessions.length - 1;
        
        const quota = await sessionManager.checkQuota(newSession);
        
        return new Response(JSON.stringify({
          message: 'Session reset successful',
          newSession: true,
          quota: quota,
          totalSessions: sessionManager.sessions.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Proxy API requests with automatic session rotation
      if (url.pathname.startsWith('/api/')) {
        const apiPath = url.pathname.replace('/api/', '');
        const targetUrl = `${CONFIG.baseUrl}/${apiPath}${url.search}`;
        
        // Get current session
        let headers = sessionManager.getCurrentSession();
        
        // Check quota before making request
        const quota = await sessionManager.checkQuota(headers);
        
        // If quota is low, rotate session
        if (quota && quota.uploadLimit < 3) {
          console.log('Low quota detected, rotating session...');
          headers = sessionManager.rotateSession();
        }
        
        // Clone request to read body safely
        const clonedRequest = request.clone();
        const bodyText = request.method !== 'GET' ? await clonedRequest.text() : undefined;
        
        // Forward the request (no signature needed based on captured traffic)
        const response = await fetch(targetUrl, {
          method: request.method,
          headers: headers,
          body: bodyText
        });
        
        const data = await response.json();
        
        // If we got an error about quota, rotate and retry
        if (response.status === 429 || (data.code && data.code !== 0)) {
          console.log('Quota exceeded, rotating session and retrying...');
          headers = sessionManager.rotateSession();
          
          const retryResponse = await fetch(targetUrl, {
            method: request.method,
            headers: headers,
            body: bodyText
          });
          
          const retryData = await retryResponse.json();
          
          return new Response(JSON.stringify(retryData), {
            status: retryResponse.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Default response - show available endpoints
      return new Response(JSON.stringify({
        service: 'PhotoGrid Background Remover Proxy',
        version: '1.0.0',
        features: [
          'Unlimited free usage with session rotation',
          'Automatic quota management',
          'No authentication required'
        ],
        endpoints: {
          health: '/health - Check service status',
          ip: '/ip - Get your IP address',
          categories: '/categories - List AI categories (9)',
          styles: '/styles - List AI styles (181)',
          features: '/features - Get ALL features with quotas',
          'remove-watermark': '/remove-watermark - Watermark removal info',
          'remove-object': '/remove-object - Object removal info',
          quota: '/quota - Check current quota',
          reset: '/reset - Force new session',
          api: '/api/* - Proxy any PhotoGrid API call'
        },
        stats: {
          sessionsAvailable: sessionManager.sessions.length,
          currentSessionIndex: sessionManager.currentSessionIndex
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
