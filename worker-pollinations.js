/**
 * Pollinations Image Generator Worker
 * FREE image generation using direct Pollinations API
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // GET endpoint - generate image from prompt in URL
      if (url.pathname === '/generate' && request.method === 'GET') {
        const prompt = url.searchParams.get('prompt');
        
        if (!prompt) {
          return new Response(JSON.stringify({
            error: 'Missing prompt parameter'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const width = url.searchParams.get('width') || '1024';
        const height = url.searchParams.get('height') || '1024';
        const model = url.searchParams.get('model') || 'flux';
        const seed = url.searchParams.get('seed') || Math.floor(Math.random() * 1000000).toString();
        const nologo = url.searchParams.get('nologo') || 'true';

        // Build Pollinations URL
        const encodedPrompt = encodeURIComponent(prompt);
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?` +
          `width=${width}&height=${height}&model=${model}&seed=${seed}&nologo=${nologo}`;

        console.log('🎨 Generating image:', pollinationsUrl);

        // Fetch image from Pollinations
        const imageResponse = await fetch(pollinationsUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          redirect: 'follow'
        });

        if (!imageResponse.ok) {
          throw new Error(`Pollinations API error: ${imageResponse.status}`);
        }

        // Get the image as arrayBuffer
        const imageData = await imageResponse.arrayBuffer();

        // Return image with correct content type
        return new Response(imageData, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      }

      // POST endpoint - accept JSON body
      if (url.pathname === '/generate' && request.method === 'POST') {
        const body = await request.json();
        
        const { 
          prompt, 
          width = 1024, 
          height = 1024, 
          model = 'flux',
          seed = Math.floor(Math.random() * 1000000),
          nologo = true
        } = body;

        if (!prompt) {
          return new Response(JSON.stringify({
            error: 'Missing prompt in request body'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Build Pollinations URL
        const encodedPrompt = encodeURIComponent(prompt);
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?` +
          `width=${width}&height=${height}&model=${model}&seed=${seed}&nologo=${nologo}`;

        console.log('🎨 Generating image:', pollinationsUrl);

        // Fetch image from Pollinations
        const imageResponse = await fetch(pollinationsUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          redirect: 'follow'
        });

        if (!imageResponse.ok) {
          throw new Error(`Pollinations API error: ${imageResponse.status}`);
        }

        // Get the image as arrayBuffer
        const imageData = await imageResponse.arrayBuffer();

        // Convert to base64 for JSON response
        const base64Image = arrayBufferToBase64(imageData);

        return new Response(JSON.stringify({
          success: true,
          prompt: prompt,
          width: width,
          height: height,
          model: model,
          seed: seed,
          imageBase64: `data:image/jpeg;base64,${base64Image}`,
          imageUrl: pollinationsUrl
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }

      // Health check
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          service: 'Pollinations Image Worker',
          version: '1.0.0',
          free: true,
          noAuthRequired: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Default response
      return new Response(JSON.stringify({
        name: 'Pollinations Image Generator Worker',
        version: '1.0.0',
        description: 'FREE AI image generation using Pollinations API',
        endpoints: {
          'GET /generate?prompt=...': 'Generate image (returns JPEG)',
          'POST /generate': 'Generate image with JSON body (returns base64)',
          '/health': 'Health check'
        },
        features: [
          '✅ Completely FREE',
          '✅ No authentication required',
          '✅ No rate limits',
          '✅ Multiple models supported',
          '✅ Custom dimensions'
        ],
        example: `${url.origin}/generate?prompt=A beautiful sunset&width=1024&height=1024`
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

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
