/**
 * ImgUpscaler Worker - Cloudflare Worker Implementation
 * 
 * Uses the reverse-engineered ImgUpscaler.ai upload flow
 * to provide cloud storage and image hosting capabilities.
 * 
 * Features:
 * - Upload images to Alibaba Cloud OSS
 * - Get signed URLs for uploaded images
 * - CORS-enabled for browser access
 * - No authentication required (uses ImgUpscaler's infrastructure)
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route requests
      if (url.pathname === '/upload' && request.method === 'POST') {
        return await handleUpload(request, corsHeaders);
      }
      
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ status: 'ok' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Default response
      return new Response(JSON.stringify({
        name: 'ImgUpscaler Worker',
        version: '1.0.0',
        endpoints: {
          upload: '/upload (POST)',
          health: '/health (GET)'
        },
        description: 'Cloud storage upload worker using ImgUpscaler infrastructure'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message,
        stack: error.stack
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

/**
 * Handle image upload
 * Flow: Initiate → Upload to OSS → Sign → Return URL
 */
async function handleUpload(request, corsHeaders) {
  console.log('📤 Handling upload request...');
  
  // Get image from request
  const formData = await request.formData();
  const imageFile = formData.get('image');
  
  if (!imageFile) {
    return new Response(JSON.stringify({
      error: 'No image provided',
      message: 'Please upload an image file in the "image" field'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Step 1: Initiate upload with ImgUpscaler API
    console.log('Step 1: Initiating upload...');
    const initiateResponse = await fetch('https://api.imgupscaler.ai/api/common/upload/upload-image', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://imgupscaler.ai',
        'Referer': 'https://imgupscaler.ai/',
        'Accept': '*/*',
        'product-code': '067003',
        'product-serial': ''
      },
      body: createFormData({ file_name: imageFile.name })
    });

    const initiateData = await initiateResponse.json();
    console.log('Initiate response:', JSON.stringify(initiateData));
    
    if (initiateData.code !== 100000) {
      throw new Error(`Upload initiation failed: ${initiateData.message?.en || 'Unknown error'} (code: ${initiateData.code})`);
    }

    const { url: ossUrl, object_name } = initiateData.result;
    console.log('✅ Upload initiated:', object_name);

    // Step 2: Upload to Alibaba Cloud OSS
    console.log('Step 2: Uploading to Alibaba Cloud OSS...');
    const arrayBuffer = await imageFile.arrayBuffer();
    
    const uploadResponse = await fetch(ossUrl, {
      method: 'PUT',
      body: arrayBuffer,
      headers: {
        'Content-Type': imageFile.type || 'image/png'
      }
    });

    if (uploadResponse.status !== 200) {
      throw new Error(`OSS upload failed with status ${uploadResponse.status}`);
    }

    console.log('✅ Uploaded to cloud storage');

    // Step 3: Sign the object
    console.log('Step 3: Signing object...');
    const signResponse = await fetch('https://api.imgupscaler.ai/api/common/upload/sign-object', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://imgupscaler.ai',
        'Referer': 'https://imgupscaler.ai/',
        'Accept': '*/*'
      },
      body: createFormData({ object_name })
    });

    const signData = await signResponse.json();
    
    if (signData.code !== 100000) {
      throw new Error(`Sign failed: ${signData.message?.en || 'Unknown error'}`);
    }

    const signedUrl = signData.result.url;
    console.log('✅ Object signed');

    // Return success
    return new Response(JSON.stringify({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: imageFile.name,
        size: imageFile.size,
        type: imageFile.type,
        objectName: object_name,
        signedUrl: signedUrl,
        // Note: Signed URLs may expire. Download before expiration.
        note: 'This is a temporary signed URL for accessing your uploaded image'
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Failed to upload image'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Helper to create FormData with proper boundary
 */
function createFormData(fields) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).slice(2);
  let body = '';
  
  for (const [key, value] of Object.entries(fields)) {
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
    body += `${value}\r\n`;
  }
  body += `--${boundary}--\r\n`;
  
  return body;
}
