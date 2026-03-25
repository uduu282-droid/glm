/**
 * 🎨 Unified Image Processing API - Cloudflare Worker
 * 
 * Single endpoint for 5 working image processing tools
 * 
 * Available Tools:
 * - remove-bg: Remove background from images
 * - convert-format: Convert between PNG/JPG/WEBP
 * - image-to-pdf: Convert image to PDF
 * - remove-text: Remove text/watermarks
 * - remove-gemini-watermark: Remove Gemini AI watermarks
 */

// Backend API configuration
const BACKEND_BASE = 'https://bgremover-backend-121350814881.us-central1.run.app';

// Available tools (only confirmed working ones)
const TOOLS = {
  'remove-bg': { endpoint: '/api/remove-bg' },
  'convert-format': { endpoint: '/api/convert-format' },
  'image-to-pdf': { endpoint: '/api/image-to-pdf' },
  'remove-text': { endpoint: '/api/remove-text' },
  'remove-gemini-watermark': { endpoint: '/api/remove-gemini-watermark' }
};

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    
    // Health check
    if (url.pathname === '/health') {
      return jsonResponse({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    }

    // API info endpoint
    if (url.pathname === '/') {
      return jsonResponse({
        name: 'Unified Image Processing API',
        version: '1.0.0',
        description: 'Single endpoint for multiple image processing tools',
        availableTools: Object.keys(TOOLS),
        endpoints: {
          health: 'GET /health',
          tools: 'GET /api/tools',
          process: 'POST /api/process'
        }
      });
    }

    // List available tools
    if (url.pathname === '/api/tools') {
      return jsonResponse({
        tools: Object.entries(TOOLS).map(([key, value]) => ({
          name: key,
          description: getToolDescription(key),
          endpoint: value.endpoint
        }))
      });
    }

    // Main processing endpoint
    if (url.pathname === '/api/process' && request.method === 'POST') {
      try {
        const formData = await request.formData();
        const tool = formData.get('tool');
        const imageFile = formData.get('image');
        
        // Validate tool
        if (!tool || !TOOLS[tool]) {
          return jsonResponse({
            error: 'Invalid tool',
            message: `Unknown tool: ${tool}`,
            availableTools: Object.keys(TOOLS)
          }, 400);
        }

        // Validate image
        if (!imageFile) {
          return jsonResponse({
            error: 'No image provided',
            message: 'Please provide an image file'
          }, 400);
        }

        // Create multipart form data manually for better compatibility
        const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`;
        const imageBuffer = await imageFile.arrayBuffer();
        const imageBytes = new Uint8Array(imageBuffer);
        
        // Build multipart form data
        const parts = [];
        
        // File part
        parts.push(`--${boundary}\r\n`);
        parts.push(`Content-Disposition: form-data; name="file"; filename="${imageFile.name || "image.png"}"\r\n`);
        parts.push(`Content-Type: ${imageFile.type || "image/png"}\r\n\r\n`);
        
        // Convert body parts to bytes
        const encoder = new TextEncoder();
        const headerParts = parts.map(part => encoder.encode(part));
        const footer = encoder.encode(`\r\n--${boundary}--\r\n`);
        
        // Calculate total size
        const totalSize = headerParts.reduce((sum, part) => sum + part.length, 0) + imageBytes.length + footer.length;
        
        // Create final body
        const bodyBuffer = new Uint8Array(totalSize);
        let offset = 0;
        
        for (const part of headerParts) {
          bodyBuffer.set(part, offset);
          offset += part.length;
        }
        
        bodyBuffer.set(imageBytes, offset);
        offset += imageBytes.length;
        
        bodyBuffer.set(footer, offset);

        // Make request to backend
        const toolConfig = TOOLS[tool];
        const backendUrl = `${BACKEND_BASE}${toolConfig.endpoint}`;
        
        console.log(`Forwarding to backend: ${backendUrl}`);
        
        const backendResponse = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.changeimageto.com/',
            'Content-Type': `multipart/form-data; boundary=${boundary}`
          },
          body: bodyBuffer
        });

        console.log(`Backend response status: ${backendResponse.status}`);

        if (!backendResponse.ok) {
          const errorText = await backendResponse.text();
          console.error('Backend error:', errorText);
          return jsonResponse({
            error: 'Processing failed',
            message: `Backend returned ${backendResponse.status}`,
            details: errorText.substring(0, 200)
          }, backendResponse.status);
        }

        // Get response - could be binary image or JSON with base64
        const responseBuffer = await backendResponse.arrayBuffer();
        let processedImage;
        
        // Try to parse as JSON first (some APIs return base64 in JSON)
        try {
          const textDecoder = new TextDecoder();
          const responseText = textDecoder.decode(responseBuffer);
          const jsonData = JSON.parse(responseText);
          
          // Check if it contains base64 image data
          if (jsonData.test_image_base64 || jsonData.output_image || jsonData.image_base64) {
            const base64Data = jsonData.test_image_base64 || jsonData.output_image || jsonData.image_base64;
            const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
            processedImage = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
            console.log('Decoded base64 from JSON response');
          } else {
            // Not a base64 response, use original buffer
            processedImage = new Uint8Array(responseBuffer);
          }
        } catch (e) {
          // Not JSON, use as binary
          processedImage = new Uint8Array(responseBuffer);
        }
        let contentType = backendResponse.headers.get('content-type');
        
        // If we decoded from JSON, content-type might be wrong
        if (processedImage.length > 0) {
          // Detect content type from magic bytes
          const bytes = processedImage.subarray(0, 4);
          if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
            contentType = 'image/png';
          } else if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
            contentType = 'image/jpeg';
          } else if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
            contentType = 'application/pdf';
          } else {
            contentType = contentType || 'image/png'; // default
          }
        }
        
        console.log(`Content-Type: ${contentType}, Size: ${processedImage.byteLength} bytes`);

        // Return with proper headers
        return new Response(processedImage, {
          headers: {
            ...corsHeaders,
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="processed_${Date.now()}.${contentType.includes('pdf') ? 'pdf' : 'png'}"`,
            'Cache-Control': 'no-cache'
          }
        });

      } catch (error) {
        console.error('Processing error:', error);
        return jsonResponse({
          error: 'Processing failed',
          message: error.message
        }, 500);
      }
    }

    // 404 for unknown routes
    return jsonResponse({
      error: 'Not Found',
      message: 'Use /api/process endpoint'
    }, 404);
  }
};

// Helper function to get tool description
function getToolDescription(tool) {
  const descriptions = {
    'remove-bg': 'Remove background from images',
    'convert-format': 'Convert between PNG, JPG, WEBP formats',
    'image-to-pdf': 'Convert image to PDF document',
    'remove-text': 'Remove text and watermarks from images',
    'remove-gemini-watermark': 'Remove Gemini AI watermarks specifically'
  };
  return descriptions[tool] || 'Image processing tool';
}

// Helper function for JSON responses
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}
