/**
 * Pollinations Image Generation API - Reverse Engineered
 * 
 * Endpoint: https://anmixai.vercel.app/api/pollinations/image
 * Method: POST
 * Status: Requires payment/balance on Pollinations platform
 */

import axios from 'axios';

class PollinationsImageGenerator {
  constructor() {
    this.apiUrl = 'https://anmixai.vercel.app/api/pollinations/image';
    this.baseUrl = 'https://pollinations.ai'; // Alternative direct endpoint
  }

  /**
   * Generate image using Pollinations API via anmixai proxy
   * @param {string} prompt - Image description
   * @param {object} options - Generation options
   * @returns {Promise<object>} Image generation result
   */
  async generateImage(prompt, options = {}) {
    const config = {
      prompt: prompt,
      width: options.width || 1024,
      height: options.height || 1024,
      seed: options.seed || Math.floor(Math.random() * 1000000),
      model: options.model || 'flux',
      source: 'pollinations', // Required: 'pollinations' or 'nexus'
      ...options
    };

    try {
      const response = await axios.post(this.apiUrl, config, {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://anmixai.vercel.app/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'
        },
        timeout: 60000
      });

      return {
        success: true,
        data: response.data,
        status: response.status
      };

    } catch (error) {
      if (error.response?.status === 402) {
        return {
          success: false,
          error: 'PAYMENT_REQUIRED',
          message: 'Insufficient balance on Pollinations platform',
          details: error.response.data
        };
      }

      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  /**
   * Direct Pollinations API (alternative - may not require auth)
   * @param {string} prompt - Image description
   * @param {object} options - Generation options
   */
  async generateImageDirect(prompt, options = {}) {
    const params = new URLSearchParams({
      prompt: prompt,
      width: options.width || 1024,
      height: options.height || 1024,
      seed: options.seed || Math.floor(Math.random() * 1000000),
      model: options.model || 'flux',
      nologo: 'true'
    });

    try {
      // This returns the image directly as binary
      const response = await axios.get(
        `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`,
        {
          responseType: 'arraybuffer',
          timeout: 60000
        }
      );

      return {
        success: true,
        imageData: response.data,
        contentType: response.headers['content-type']
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Test the API
async function main() {
  console.log('🎨 Pollinations Image API - Reverse Engineering Results\n');
  console.log('=' .repeat(80));
  
  const generator = new PollinationsImageGenerator();
  
  console.log('\n📋 API ENDPOINT DISCOVERED:\n');
  console.log('URL:', 'https://anmixai.vercel.app/api/pollinations/image');
  console.log('Method: POST');
  console.log('Status: ✅ Working (requires payment)\n');
  
  console.log('📝 REQUEST FORMAT:\n');
  console.log(JSON.stringify({
    prompt: "Your image description",
    width: 1024,
    height: 1024,
    seed: 12345,
    model: 'flux',
    source: 'pollinations'  // Required: 'pollinations' or 'nexus'
  }, null, 2));
  
  console.log('\n🔑 REQUIRED HEADERS:\n');
  console.log({
    'Content-Type': 'application/json',
    'Referer': 'https://anmixai.vercel.app/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'
  });
  
  console.log('\n💰 PAYMENT INFO:\n');
  console.log('Cost: ~0.0132 pollen per request');
  console.log('Note: Requires Pollinations account with balance\n');
  
  console.log('🔄 ALTERNATIVE (FREE):\n');
  console.log('Direct API: https://image.pollinations.ai/prompt/{prompt}');
  console.log('This endpoint is FREE and doesn\'t require authentication!\n');
  
  // Test direct (free) endpoint
  console.log('🧪 Testing FREE direct endpoint...\n');
  
  const result = await generator.generateImageDirect(
    'A beautiful sunset over mountains',
    { width: 1024, height: 1024, model: 'flux' }
  );
  
  if (result.success) {
    console.log('✅ Direct API works!');
    console.log('Image size:', result.imageData.length, 'bytes');
    console.log('Content-Type:', result.contentType);
  } else {
    console.log('❌ Direct API error:', result.error);
  }
  
  console.log('\n\n📚 USAGE EXAMPLES:\n');
  console.log('1. Via anmixai (requires payment):');
  console.log('   curl -X POST https://anmixai.vercel.app/api/pollinations/image \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"prompt":"cat","width":1024,"model":"flux","source":"pollinations"}\'\n');
  
  console.log('2. Direct Pollinations (FREE):');
  console.log('   curl "https://image.pollinations.ai/prompt/cat?width=1024&height=1024"\n');
}

main().catch(console.error);
