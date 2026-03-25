export default {
  async fetch(request, env) {
    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      
      // Only allow POST requests
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ 
          error: 'Method not allowed. Use POST.' 
        }), { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get prompt from query parameter or request body
      let prompt = url.searchParams.get('prompt');
      
      if (!prompt && request.headers.get('Content-Type')?.includes('application/json')) {
        const body = await request.json();
        prompt = body.prompt || body.text;
      }

      if (!prompt) {
        return new Response(JSON.stringify({ 
          error: 'Missing prompt parameter. Use ?prompt=your+text or send JSON body with prompt field.' 
        }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Call the RapidAPI endpoint
      const rapidApiKey = 'ebbd999ebemsh25e7e9f6544cc1dp1950ffjsn1f6ac8266b48';
      const rapidApiHost = 'open-ai21.p.rapidapi.com';

      const response = await fetch(`https://${rapidApiHost}/texttoimage2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': rapidApiHost,
        },
        body: JSON.stringify({ text: prompt })
      });

      if (!response.ok) {
        throw new Error(`RapidAPI error: ${response.status}`);
      }

      const data = await response.json();

      // Return the generated image URL
      return new Response(JSON.stringify({
        success: true,
        prompt: prompt,
        image_url: data.generated_image,
        source: 'AI-Images via RapidAPI'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Error:', error);
      
      return new Response(JSON.stringify({ 
        success: false,
        error: error.message 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
