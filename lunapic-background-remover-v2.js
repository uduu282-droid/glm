/**
 * LunaPic Background Remover - REVERSE ENGINEERED v2
 * Based on ACTUAL captured traffic from working session
 * 
 * Key discoveries:
 * 1. Need to preserve ALL cookies (not just icon_id)
 * 2. Result URL has timestamp parameter: /working/{session_id}?{timestamp}
 * 3. Need fname cookie with original filename
 * 4. Must use same referer chain as browser
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class LunaPicBackgroundRemover {
  constructor() {
    this.baseUrl = 'https://www2.lunapic.com';
    this.cookies = {};
    this.sessionId = null;
    this.filename = null;
  }

  /**
   * Step 1: Initialize session by visiting transparent background page
   */
  async initSession() {
    console.log('📡 Initializing session...');
    
    const response = await axios.get(`${this.baseUrl}/editor/?action=transparent`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Ch-Ua': '"Not-A.Brand";v="24", "Chromium";v="146"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"'
      },
      maxRedirects: 5
    });
    
    // Extract ALL cookies
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      setCookie.forEach(cookie => {
        const match = cookie.match(/^([^=]+)=([^;]+)/);
        if (match) {
          this.cookies[match[1]] = match[2];
        }
      });
      
      if (this.cookies['icon_id']) {
        this.sessionId = this.cookies['icon_id'];
        console.log(`✅ Session initialized: ${this.sessionId}`);
        return true;
      }
    }
    
    console.error('❌ Failed to get session cookie');
    return false;
  }

  /**
   * Step 2: Upload image
   */
  async uploadImage(imagePath) {
    console.log('📤 Uploading image...');
    
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call initSession() first.');
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    this.filename = `image_${Date.now()}.jpg`;
    
    // Set fname cookie
    const fnameBase = path.basename(imagePath, path.extname(imagePath));
    this.cookies['fname'] = fnameBase.replace(/[^a-zA-Z0-9_]/g, '_');
    
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: this.filename,
      contentType: 'image/jpeg'
    });
    
    const cookieString = Object.entries(this.cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    
    try {
      const response = await axios.post(`${this.baseUrl}/editor/`, formData, {
        headers: {
          ...formData.getHeaders(),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://www2.lunapic.com',
          'Referer': `${this.baseUrl}/editor/?action=transparent`,
          'Cookie': cookieString
        },
        maxRedirects: 5
      });
      
      console.log('✅ Image uploaded');
      
      // Update cookies from response
      const newCookies = response.headers['set-cookie'];
      if (newCookies) {
        newCookies.forEach(cookie => {
          const match = cookie.match(/^([^=]+)=([^;]+)/);
          if (match) {
            this.cookies[match[1]] = match[2];
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error('❌ Upload failed:', error.message);
      return false;
    }
  }

  /**
   * Step 3: Apply background removal
   */
  async removeBackground(x = 10, y = 10, fuzz = 8) {
    console.log(`🎯 Removing background (click: ${x},${y}, fuzz: ${fuzz})...`);
    
    const cookieString = Object.entries(this.cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    
    const formData = new FormData();
    formData.append('savenav', 'LunaPic > Edit > Transparent Background');
    formData.append('fuzz', fuzz.toString());
    formData.append('fill', 'area');
    formData.append('action', 'do-trans');
    formData.append('x', x.toString());
    formData.append('y', y.toString());
    
    try {
      const response = await axios.post(`${this.baseUrl}/editor/`, formData, {
        headers: {
          ...formData.getHeaders(),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://www2.lunapic.com',
          'Referer': `${this.baseUrl}/editor/`,
          'Upgrade-Insecure-Requests': '1',
          'Cookie': cookieString
        },
        maxRedirects: 5
      });
      
      console.log('✅ Background removal applied');
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return true;
    } catch (error) {
      console.error('❌ Background removal failed:', error.message);
      return false;
    }
  }

  /**
   * Step 4: Download result
   * KEY: Add timestamp parameter to URL!
   */
  async downloadResult(outputPath = 'output.png') {
    console.log('💾 Downloading result...');
    
    if (!this.sessionId) {
      throw new Error('No active session');
    }
    
    const cookieString = Object.entries(this.cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    
    // Generate timestamp like browser does
    const timestamp = Math.floor(Math.random() * 10000000000); // Larger random number
    // KEY FIX: Use session_id?timestamp format (NOT session_id-bt-1)
    const resultUrl = `${this.baseUrl}/editor/working/${this.sessionId}?${timestamp}`;
    
    console.log(`   Result URL: ${resultUrl}`);
    
    try {
      const response = await axios.get(resultUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Ch-Ua': '"Not-A.Brand";v="24", "Chromium";v="146"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Referer': `${this.baseUrl}/editor/`,
          'Cookie': cookieString
        },
        maxRedirects: 0, // Don't follow redirects, check first
        validateStatus: () => true // Accept all status codes
      });
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${response.headers['content-type']}`);
      
      // If redirect (3xx), follow it manually
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers['location'];
        console.log(`   Redirect to: ${location}`);
        if (location) {
          // Follow redirect
          const finalResponse = await axios.get(location, {
            responseType: 'arraybuffer',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'Cookie': cookieString
            }
          });
          response.data = finalResponse.data;
          response.headers['content-type'] = finalResponse.headers['content-type'];
        }
      } else if (response.status === 404) {
        // Even on 404, check if we got an image (sometimes servers return images with 404)
        if (response.data && response.data.byteLength > 100) {
          console.log('⚠️  Got 404 but received data, checking if it\'s an image...');
          // Continue processing
        } else {
          throw new Error(`HTTP 404 - Image not found. Session may have expired or URL format changed.`);
        }
      } else if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Verify PNG signature
      const buffer = Buffer.from(response.data);
      const header = buffer.slice(0, 8);
      const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const isValid = header.compare(pngSignature) === 0;
      
      if (!isValid) {
        const firstBytes = header.toString('hex');
        console.log(`⚠️  Invalid PNG signature: ${firstBytes}`);
        
        // Check if it's HTML
        const textHeader = header.toString('utf8');
        if (textHeader.includes('<!DOCTYPE') || textHeader.includes('<html')) {
          console.error('❌ Received HTML page instead of image');
          return false;
        }
      }
      
      fs.writeFileSync(outputPath, buffer);
      console.log(`✅ Result saved: ${outputPath}`);
      console.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB`);
      
      return true;
    } catch (error) {
      console.error('❌ Download failed:', error.message);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   URL: ${error.config.url}`);
      }
      return false;
    }
  }

  /**
   * Complete workflow
   */
  async processImage(imagePath, options = {}) {
    const {
      clickX = 10,
      clickY = 10,
      fuzz = 8,
      outputPath = `lunapic_result_${Date.now()}.png`
    } = options;
    
    console.log('\n🎨 LunaPic Background Removal - REVERSE ENGINEERED v2\n');
    console.log('=' .repeat(70));
    
    // Step 1: Initialize session
    const sessionOk = await this.initSession();
    if (!sessionOk) {
      console.log('❌ Failed to initialize session');
      return { success: false, error: 'Session initialization failed' };
    }
    
    // Step 2: Upload image
    const uploadOk = await this.uploadImage(imagePath);
    if (!uploadOk) {
      return { success: false, error: 'Upload failed' };
    }
    
    // Step 3: Remove background
    const removeOk = await this.removeBackground(clickX, clickY, fuzz);
    if (!removeOk) {
      return { success: false, error: 'Background removal failed' };
    }
    
    // Step 4: Download result
    const downloadOk = await this.downloadResult(outputPath);
    if (!downloadOk) {
      return { success: false, error: 'Download failed' };
    }
    
    console.log('\n' + '=' .repeat(70));
    console.log('✨ SUCCESS! Background removed and saved.\n');
    
    return {
      success: true,
      outputPath: outputPath,
      sessionId: this.sessionId
    };
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║     LunaPic Background Remover - REVERSE ENGINEERED v2   ║
╠═══════════════════════════════════════════════════════════╣
║  Usage: node lunapic-v2.js <image> [options]             ║
║                                                           ║
║  Options:                                                 ║
║    --x <number>       Click X coordinate (default: 10)    ║
║    --y <number>       Click Y coordinate (default: 10)    ║
║    --fuzz <number>    Tolerance 0-100 (default: 8)        ║
║    --output <path>    Output file                         ║
║                                                           ║
║  Example:                                                 ║
║    node lunapic-v2.js photo.jpg --fuzz 10 --x 50 --y 50  ║
╚═══════════════════════════════════════════════════════════╝
    `);
    process.exit(0);
  }
  
  const imagePath = args[0];
  const options = {};
  
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--x' && args[i + 1]) {
      options.clickX = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--y' && args[i + 1]) {
      options.clickY = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--fuzz' && args[i + 1]) {
      options.fuzz = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      options.outputPath = args[i + 1];
      i++;
    }
  }
  
  if (!fs.existsSync(imagePath)) {
    console.error(`❌ File not found: ${imagePath}`);
    process.exit(1);
  }
  
  const remover = new LunaPicBackgroundRemover();
  const result = await remover.processImage(imagePath, options);
  
  if (!result.success) {
    console.error('\n❌ FAILED:', result.error);
    process.exit(1);
  }
}

const path = require('path');
module.exports = LunaPicBackgroundRemover;

if (require.main === module) {
  main().catch(console.error);
}
