/**
 * Raphael AI - Direct API Test
 * 
 * Tests the captured API endpoint directly without authentication
 * Based on real captured network traffic
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Optional: sharp for image processing
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  Sharp not installed. Install with: npm install sharp');
}

class RaphaelDirectAPI {
  constructor() {
    this.baseUrl = 'https://raphael.app';
    this.editEndpoint = '/api/ai-image-editor';
    
    // Realistic browser headers
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Origin': 'https://raphael.app',
      'Referer': 'https://raphael.app/ai-image-editor'
    };
  }

  /**
   * Prepare image for API (convert to WebP and resize)
   */
  async prepareImage(imagePath) {
    console.log('📸 Preparing image...');
    
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image not found: ${imagePath}`);
    }
    
    const fileExt = path.extname(imagePath).toLowerCase();
    const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp'];
    
    if (!supportedFormats.includes(fileExt)) {
      throw new Error(`Unsupported format: ${fileExt}. Use JPG, PNG, or WebP`);
    }
    
    if (sharp) {
      // Use sharp for optimal processing
      const { data, info } = await sharp(imagePath)
        .webp({ quality: 85 })
        .resize(720, 480, { fit: 'inside', withoutEnlargement: true })
        .toBuffer({ resolveWithObject: true });
      
      console.log(`✅ Resized to ${info.width}x${info.height}`);
      
      return {
        base64: data.toString('base64'),
        width: info.width,
        height: info.height,
        size: data.length
      };
    } else {
      // Fallback: read as-is and convert to base64
      console.log('⚠️  Using basic conversion (install sharp for better results)');
      const buffer = fs.readFileSync(imagePath);
      const base64 = buffer.toString('base64');
      
      // Try to get image dimensions (basic method)
      let width = 720;
      let height = 480;
      
      return {
        base64: base64,
        width: width,
        height: height,
        size: buffer.length
      };
    }
  }

  /**
   * Send edit request to Raphael API
   */
  async editImage(imagePath, mode = 'standard', prompt = '') {
    console.log('\n🎨 Starting image edit...\n');
    
    // Prepare image
    const imageData = await this.prepareImage(imagePath);
    
    // Generate UUID
    const requestId = crypto.randomUUID();
    
    // Build payload
    const payload = {
      input_image_base64: imageData.base64,
      input_image_mime_type: 'image/webp',
      input_image_extension: 'webp',
      width: imageData.width,
      height: imageData.height,
      mode: mode,
      client_request_id: requestId
    };
    
    // Add prompt if provided (from command line or default)
    if (prompt) {
      payload.prompt = prompt;
    }
    
    console.log(`📊 Payload size: ${(JSON.stringify(payload).length / 1024).toFixed(2)} KB`);
    console.log(`🎯 Mode: ${mode}`);
    if (prompt) console.log(`💬 Prompt: ${prompt}`);
    console.log(`🆔 Request ID: ${requestId}\n`);
    
    // Debug: Show payload structure
    console.log('📋 Payload keys:', Object.keys(payload).join(', '));
    console.log('🔍 Has base64?', !!payload.input_image_base64);
    console.log('🔍 Has dimensions?', !!payload.width && !!payload.height);
    
    // Make API call
    console.log('📡 Sending request to Raphael API...');
    const startTime = Date.now();
    
    try {
      const response = await axios.post(
        `${this.baseUrl}${this.editEndpoint}`,
        payload,
        {
          headers: this.headers,
          timeout: 120000, // 2 minutes
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );
      
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log(`\n✅ Success! (${elapsed}s)`);
      console.log(`📊 Status: ${response.status}`);
      
      if (response.data) {
        console.log(`💰 Credits used: ${response.data.credits_used || 'N/A'}`);
        console.log(`💰 Credits remaining: ${response.data.credits_remaining || 'N/A'}`);
        
        if (response.data.output_image_url) {
          console.log(`🖼️  Result URL: ${response.data.output_image_url}`);
          return {
            success: true,
            url: response.data.output_image_url,
            creditsUsed: response.data.credits_used,
            creditsRemaining: response.data.credits_remaining,
            time: elapsed
          };
        }
      }
      
      return {
        success: true,
        data: response.data,
        time: elapsed
      };
      
    } catch (error) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.error(`\n❌ Failed after ${elapsed}s`);
      
      if (error.response) {
        console.error(`📊 Status: ${error.response.status}`);
        console.error(`📝 Response:`, JSON.stringify(error.response.data, null, 2));
        
        if (error.response.status === 429) {
          console.error('\n⚠️  Rate limited! Wait before trying again.');
        } else if (error.response.status === 401 || error.response.status === 403) {
          console.error('\n⚠️  Authentication required. May need browser automation.');
        }
      } else if (error.code === 'ECONNABORTED') {
        console.error('⏱️  Request timed out');
      } else {
        console.error(`💥 Error: ${error.message}`);
      }
      
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }
  }

  /**
   * Download result image
   */
  async downloadImage(url, outputPath) {
    console.log(`\n💾 Downloading image to ${outputPath}...`);
    
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: this.headers
      });
      
      fs.writeFileSync(outputPath, response.data);
      console.log(`✅ Saved: ${outputPath} (${(response.data.length / 1024).toFixed(2)} KB)`);
      
      return outputPath;
    } catch (error) {
      console.error(`❌ Download failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Complete workflow: upload, edit, download
   */
  async fullWorkflow(imagePath, mode = 'standard', saveTo = null, prompt = '') {
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║     Raphael AI - Direct Image Editor        ║');
    console.log('╚══════════════════════════════════════════════╝\n');
    
    // Step 1: Edit
    const result = await this.editImage(imagePath, mode, prompt);
    
    if (!result.success || !result.url) {
      console.log('\n❌ Edit failed. Cannot proceed to download.');
      return result;
    }
    
    // Step 2: Download (if output path specified)
    if (saveTo) {
      await this.downloadImage(result.url, saveTo);
    }
    
    return result;
  }
}

// CLI Usage
async function main() {
  const api = new RaphaelDirectAPI();
  
  // Get arguments
  const imagePath = process.argv[2] || './test-image.jpg';
  const mode = process.argv[3] || 'standard';
  const outputPath = process.argv[4] || null;
  const prompt = process.argv[5] || ''; // Optional prompt argument
  
  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Image not found: ${imagePath}`);
    console.log('\nUsage: node test-direct-raphael.js <image.jpg> [mode] [output.webp]');
    console.log('Modes: standard, pro, max');
    process.exit(1);
  }
  
  // Run workflow
  const result = await api.fullWorkflow(imagePath, mode, outputPath, prompt);
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 SUMMARY');
  console.log('='.repeat(50));
  
  if (result.success) {
    console.log('✅ Status: SUCCESS');
    if (result.url) console.log(`🔗 URL: ${result.url}`);
    if (result.creditsUsed) console.log(`💰 Credits: ${result.creditsUsed}`);
    if (result.time) console.log(`⏱️  Time: ${result.time}s`);
  } else {
    console.log('❌ Status: FAILED');
    if (result.error) console.log(`💥 Error: ${result.error}`);
    if (result.status) console.log(`📊 HTTP Status: ${result.status}`);
  }
  
  console.log('='.repeat(50) + '\n');
}

// Export for programmatic use
module.exports = RaphaelDirectAPI;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

/*
 * USAGE EXAMPLES:
 * 
 * 1. Basic test (standard mode):
 *    node test-direct-raphael.js ./photo.jpg
 * 
 * 2. With Pro mode:
 *    node test-direct-raphael.js ./photo.jpg pro
 * 
 * 3. Save result:
 *    node test-direct-raphael.js ./photo.jpg max ./output.webp
 * 
 * 4. With prompt:
 *    node test-direct-raphael.js ./photo.jpg standard ./output.webp "Convert to anime style"
 * 
 * 5. Programmatic use:
 *    const RaphaelAPI = require('./test-direct-raphael');
 *    const api = new RaphaelAPI();
 *    const result = await api.editImage('./photo.jpg', 'standard', 'Change background to beach');
 */
