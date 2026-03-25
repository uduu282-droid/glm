// Cloudflare Worker - Runware AI Image Generator (Proxy Version)
// Proxies through ai-image-gen-zeta.vercel.app (no API key needed!)

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return jsonResponse({
        success: false,
        error: 'Method not allowed. Use POST.'
      }, 405);
    }

    try {
      // Parse incoming request
      const data = await request.json();
      let { 
        prompt, 
        model = 'runware:100@1',
        width = 1024,
        height = 1024,
        steps = 20,
        CFGScale = 7.5,
        numberResults = 1,
        outputType = 'URL'
      } = data;

      // Validate input
      if (!prompt || typeof prompt !== 'string') {
        return jsonResponse({
          success: false,
          error: 'Prompt is required'
        }, 400);
      }

      // Validate prompt length
      if (prompt.length < 3 || prompt.length > 2000) {
        return jsonResponse({
          success: false,
          error: 'Prompt must be between 3 and 2000 characters'
        }, 400);
      }

      // Validate dimensions
      if (width < 256 || width > 2048 || height < 256 || height > 2048) {
        return jsonResponse({
          success: false,
          error: 'Width and height must be between 256 and 2048'
        }, 400);
      }

      console.log(`Generating image via proxy: "${prompt.substring(0, 50)}..."`);

      // Build request to ai-image-gen-zeta.vercel.app
      // We're proxying through their working endpoint!
      const proxyUrl = 'https://ai-image-gen-zeta.vercel.app/api/generate/runware';
      
      const proxyRequest = {
        prompt: prompt,
        model: model,
        width: parseInt(width),
        height: parseInt(height),
        steps: parseInt(steps),
        CFGScale: parseFloat(CFGScale),
        numberResults: parseInt(numberResults),
        outputType: String(outputType).toUpperCase()  // ENSURE UPPERCASE!
      };

      // Call their API (they handle Runware API key!)
      const apiResponse = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'RunwareWorker/1.0'
        },
        body: JSON.stringify(proxyRequest)
      });

      // Check response
      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}));
        console.error('Proxy API error:', apiResponse.status, errorData);
        
        let errorMessage = 'Image generation failed';
        if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error.message;
        }
        
        return jsonResponse({
          success: false,
          error: errorMessage
        }, apiResponse.status);
      }

      // Get result from their API
      const result = await apiResponse.json();

      // Validate response
      if (!result.images || !Array.isArray(result.images)) {
        return jsonResponse({
          success: false,
          error: 'Invalid response from image generation service'
        }, 502);
      }

      console.log(`✅ Generated ${result.images.length} image(s) successfully`);

      // Return successful response
      return jsonResponse({
        success: true,
        images: result.images,
        prompt: prompt,
        model: model,
        parameters: {
          width,
          height,
          steps,
          CFGScale,
          numberResults,
          outputType
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Worker error:', error);
      
      return jsonResponse({
        success: false,
        error: `Internal server error: ${error.message}`
      }, 500);
    }
  }
};

// Helper function to create JSON responses with CORS headers
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

// Handle CORS preflight requests
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    }
  });
}
