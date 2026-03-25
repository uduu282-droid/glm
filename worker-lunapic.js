/**
 * LunaPic Proxy Worker
 * Provides API access to LunaPic photo editing tools
 * 
 * Endpoints:
 * - POST /remove-bg - Remove background from image
 * - POST /grayscale - Convert to black & white
 * - POST /blur - Apply blur effect
 * - POST /brightness - Adjust brightness
 * - POST /contrast - Adjust contrast
 * - POST /invert - Invert colors
 * - POST /resize - Resize image
 * - POST /rotate - Rotate image
 */

// Configuration
const CONFIG = {
  baseUrl: 'https://www2.lunapic.com',
  defaultParams: {
    fuzz: '8',
    fill: 'area',
    x: '50',
    y: '50'
  }
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCors();
    }

    const url = new URL(request.url);
    
    try {
      // Route requests
      if (url.pathname === '/remove-bg' || url.pathname === '/background-removal') {
        return await handleBackgroundRemoval(request);
      } else if (url.pathname === '/grayscale') {
        return await handleTool(request, 'grayscale');
      } else if (url.pathname === '/blur') {
        return await handleTool(request, 'blur');
      } else if (url.pathname === '/brightness') {
        return await handleTool(request, 'brightness');
      } else if (url.pathname === '/contrast') {
        return await handleTool(request, 'contrast');
      } else if (url.pathname === '/invert') {
        return await handleTool(request, 'invert');
      } else if (url.pathname === '/resize') {
        return await handleTool(request, 'resize');
      } else if (url.pathname === '/rotate') {
        return await handleTool(request, 'rotate');
      } else if (url.pathname === '/') {
        return new Response(getWelcomeHTML(), {
          headers: { 'Content-Type': 'text/html' }
        });
      } else {
        return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: error.message,
        tool: url.pathname.substring(1)
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

// CORS Headers
function handleCors() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// Background Removal Handler
async function handleBackgroundRemoval(request) {
  const formData = await request.formData();
  const imageFile = formData.get('file') || formData.get('image');
  
  if (!imageFile) {
    return new Response(JSON.stringify({ error: 'No image provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Get parameters
  const fuzz = formData.get('fuzz') || CONFIG.defaultParams.fuzz;
  const x = formData.get('x') || CONFIG.defaultParams.x;
  const y = formData.get('y') || CONFIG.defaultParams.y;

  // Initialize session
  const sessionResponse = await fetch(`${CONFIG.baseUrl}/editor/?action=transparent`, {
    method: 'GET',
    headers: getHeaders()
  });

  const cookies = sessionResponse.headers.get('set-cookie');
  
  // Extract session ID from cookie
  let sessionId = null;
  if (cookies) {
    const iconIdMatch = cookies.match(/icon_id=([^;]+)/);
    if (iconIdMatch) {
      sessionId = iconIdMatch[1];
      console.log('Session ID:', sessionId);
    }
  }
  
  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Failed to establish session with LunaPic' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Upload image
  const uploadForm = new FormData();
  uploadForm.append('file', imageFile);
  uploadForm.append('action', 'upload');

  const uploadResponse = await fetch(`${CONFIG.baseUrl}/editor/`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      ...(cookies ? { Cookie: cookies } : {})
    },
    body: uploadForm
  });

  // Apply background removal
  const transForm = new FormData();
  transForm.append('action', 'do-trans');
  transForm.append('fuzz', fuzz);
  transForm.append('fill', 'area');
  transForm.append('x', x);
  transForm.append('y', y);
  transForm.append('redo', '1');

  const resultResponse = await fetch(`${CONFIG.baseUrl}/editor/?action=do-trans`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      ...(cookies ? { Cookie: cookies } : {}),
      'referer': `${CONFIG.baseUrl}/editor/`
    },
    body: transForm
  });

  const resultBuffer = await resultResponse.arrayBuffer();
  
  // Wait for processing (LunaPic needs time)
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // KEY FIX: Use session_id?timestamp format (NOT session_id-bt-1)
  // LunaPic changed their URL format
  const timestamp = Math.floor(Math.random() * 10000000000);
  const resultUrl = `${CONFIG.baseUrl}/editor/working/${sessionId}?${timestamp}`;
  
  console.log('Downloading result from:', resultUrl);
  
  // Download result - handle 404 quirk (server returns image even with 404)
  const downloadResponse = await fetch(resultUrl, {
    method: 'GET',
    headers: {
      ...getHeaders(),
      ...(cookies ? { Cookie: cookies } : {}),
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Referer': `${CONFIG.baseUrl}/editor/`,
      'Sec-Ch-Ua': '"Not-A.Brand";v="24", "Chromium";v="146"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"'
    }
  });
  
  console.log('Download status:', downloadResponse.status);
  console.log('Content-Type:', downloadResponse.headers.get('content-type'));
  
  // Check if we got redirected to an error page
  const finalUrl = downloadResponse.url;
  if (finalUrl.includes('/error/') || finalUrl.includes('expired')) {
    console.error('Redirected to error/expired page:', finalUrl);
    return new Response(JSON.stringify({
      error: 'Image expired or not found',
      url: finalUrl,
      status: downloadResponse.status
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const finalBuffer = await downloadResponse.arrayBuffer();
  
  // Verify we got an image (GIF or PNG)
  const header = new Uint8Array(finalBuffer).slice(0, 8);
  const pngSignature = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const gifSignature = new TextEncoder().encode('GIF89a');
  
  const isPng = header.length >= 8 && 
                header[0] === pngSignature[0] &&
                header[1] === pngSignature[1] &&
                header[2] === pngSignature[2] &&
                header[3] === pngSignature[3] &&
                header[4] === pngSignature[4] &&
                header[5] === pngSignature[5] &&
                header[6] === pngSignature[6] &&
                header[7] === pngSignature[7];
  
  const isGif = header.length >= 6 &&
                header[0] === gifSignature[0] &&
                header[1] === gifSignature[1] &&
                header[2] === gifSignature[2] &&
                header[3] === gifSignature[3] &&
                header[4] === gifSignature[4] &&
                header[5] === gifSignature[5];
  
  if (!isPng && !isGif) {
    console.error('Did not receive valid image. First bytes:', Array.from(header).map(b => b.toString(16)).join(' '));
    return new Response(JSON.stringify({
      error: 'Invalid image received from LunaPic',
      contentType: downloadResponse.headers.get('content-type'),
      status: downloadResponse.status,
      firstBytes: Array.from(header).map(b => b.toString(16)).join(' ')
    }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  console.log(`✅ Successfully received ${isPng ? 'PNG' : 'GIF'} image`);
  
  return new Response(finalBuffer, {
    headers: {
      'Content-Type': isPng ? 'image/png' : 'image/gif',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

// Generic Tool Handler
async function handleTool(request, toolName) {
  const formData = await request.formData();
  const imageFile = formData.get('file') || formData.get('image');
  
  if (!imageFile) {
    return new Response(JSON.stringify({ error: 'No image provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Initialize session
  const sessionResponse = await fetch(`${CONFIG.baseUrl}/editor/?action=transparent`, {
    method: 'GET',
    headers: getHeaders()
  });

  const cookies = sessionResponse.headers.get('set-cookie');

  // Upload image
  const uploadForm = new FormData();
  uploadForm.append('file', imageFile);
  uploadForm.append('action', 'upload');

  await fetch(`${CONFIG.baseUrl}/editor/`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      ...(cookies ? { Cookie: cookies } : {})
    },
    body: uploadForm
  });

  // Prepare tool-specific form data
  const toolForm = new FormData();
  toolForm.append('action', toolName);

  // Add tool-specific parameters
  switch(toolName) {
    case 'grayscale':
      toolForm.append('red', formData.get('red') || '1');
      toolForm.append('green', formData.get('green') || '1');
      toolForm.append('blue', formData.get('blue') || '1');
      break;
    case 'blur':
      toolForm.append('radius', formData.get('radius') || '5');
      break;
    case 'brightness':
      toolForm.append('bright', formData.get('bright') || '20');
      break;
    case 'contrast':
      toolForm.append('contrast', formData.get('contrast') || '30');
      break;
    case 'resize':
      toolForm.append('width', formData.get('width') || '800');
      toolForm.append('height', formData.get('height') || 'auto');
      break;
    case 'rotate':
      toolForm.append('degrees', formData.get('degrees') || '90');
      break;
  }

  // Apply tool
  const resultResponse = await fetch(`${CONFIG.baseUrl}/editor/?action=${toolName}`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      ...(cookies ? { Cookie: cookies } : {}),
      'referer': `${CONFIG.baseUrl}/editor/`
    },
    body: toolForm
  });

  const resultBuffer = await resultResponse.arrayBuffer();
  
  return new Response(resultBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

// Helper function for headers
function getHeaders() {
  return {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
    'accept-language': 'en-US,en;q=0.9',
    'sec-ch-ua': '"Not-A.Brand";v="24", "Chromium";v="146"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'origin': 'https://www2.lunapic.com',
    'upgrade-insecure-requests': '1'
  };
}

// Welcome page HTML
function getWelcomeHTML() {
  return `<!DOCTYPE html>
<html>
<head>
  <title>LunaPic Proxy Worker</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
    h1 { color: #333; }
    .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
    code { background: #e0e0e0; padding: 2px 6px; border-radius: 3px; }
    .success { color: green; }
  </style>
</head>
<body>
  <h1>🎨 LunaPic Proxy Worker</h1>
  <p class="success">✅ Worker is running!</p>
  
  <h2>Available Endpoints:</h2>
  
  <div class="endpoint">
    <h3>🖼️ Background Removal</h3>
    <p><code>POST /remove-bg</code></p>
    <p>Form Data: <code>file</code> (image), <code>x</code>, <code>y</code>, <code>fuzz</code></p>
    <p>Returns: PNG image with transparent background</p>
  </div>
  
  <div class="endpoint">
    <h3>⚫ Grayscale</h3>
    <p><code>POST /grayscale</code></p>
    <p>Form Data: <code>file</code> (image)</p>
    <p>Returns: Black & white PNG image</p>
  </div>
  
  <div class="endpoint">
    <h3>🌫️ Blur</h3>
    <p><code>POST /blur</code></p>
    <p>Form Data: <code>file</code> (image), <code>radius</code> (default: 5)</p>
    <p>Returns: Blurred PNG image</p>
  </div>
  
  <div class="endpoint">
    <h3>☀️ Brightness</h3>
    <p><code>POST /brightness</code></p>
    <p>Form Data: <code>file</code> (image), <code>bright</code> (default: 20)</p>
    <p>Returns: Brightness-adjusted PNG image</p>
  </div>
  
  <div class="endpoint">
    <h3>🎭 Contrast</h3>
    <p><code>POST /contrast</code></p>
    <p>Form Data: <code>file</code> (image), <code>contrast</code> (default: 30)</p>
    <p>Returns: Contrast-adjusted PNG image</p>
  </div>
  
  <div class="endpoint">
    <h3>🔄 Invert</h3>
    <p><code>POST /invert</code></p>
    <p>Form Data: <code>file</code> (image)</p>
    <p>Returns: Color-inverted PNG image</p>
  </div>
  
  <div class="endpoint">
    <h3>📐 Resize</h3>
    <p><code>POST /resize</code></p>
    <p>Form Data: <code>file</code> (image), <code>width</code> (default: 800)</p>
    <p>Returns: Resized PNG image</p>
  </div>
  
  <div class="endpoint">
    <h3>🔄 Rotate</h3>
    <p><code>POST /rotate</code></p>
    <p>Form Data: <code>file</code> (image), <code>degrees</code> (default: 90)</p>
    <p>Returns: Rotated PNG image</p>
  </div>
  
  <h2>Example Usage:</h2>
  <pre><code>curl -X POST https://your-worker.workers.dev/remove-bg \\
  -F "file=@image.png" \\
  -F "x=50" \\
  -F "y=50" \\
  -o output.png</code></pre>
  
  <p style="margin-top: 30px; color: #666; font-size: 14px;">
    Powered by LunaPic API • All tools are free and unlimited
  </p>
</body>
</html>`;
}
