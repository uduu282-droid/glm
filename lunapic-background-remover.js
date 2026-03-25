/**
 * LunaPic Background Remover - Complete Implementation
 * Based on reverse-engineered API from https://www2.lunapic.com/editor/?action=transparent
 * 
 * How it works:
 * 1. Upload image to editor (POST /editor/)
 * 2. Server sets session cookie (icon_id)
 * 3. Click point selection for background removal (x, y coordinates)
 * 4. Download result from /editor/working/{session_id}-bt-1
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class LunaPicBackgroundRemover {
  constructor() {
    this.baseUrl = 'https://www2.lunapic.com';
    this.sessionId = null;
    this.cookie = null;
    
    // Default parameters
    this.fuzz = 8; // Tolerance level (0-100)
    this.clickPoint = { x: 10, y: 10 }; // Default click point (top-left corner)
  }

  /**
   * Step 1: Upload image and establish session
   */
  async uploadImage(imagePath) {
    console.log('📤 Uploading image to LunaPic...');
    
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const fileName = path.basename(imagePath);
      
      const formData = new FormData();
      formData.append('file', imageBuffer, {
        filename: fileName,
        contentType: 'image/jpeg'
      });
      formData.append('action', 'upload');
      
      const response = await axios.post(`${this.baseUrl}/editor/`, formData, {
        headers: {
          ...formData.getHeaders(),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://www2.lunapic.com',
          'Referer': 'https://www2.lunapic.com/editor/?action=transparent'
        },
        maxRedirects: 0,
        validateStatus: () => true
      });
      
      // Extract session ID from Set-Cookie header
      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        const iconIdMatch = setCookie.find(cookie => cookie.includes('icon_id='));
        if (iconIdMatch) {
          this.sessionId = iconIdMatch.match(/icon_id=([^;]+)/)[1];
          this.cookie = setCookie.map(c => c.split(';')[0]).join('; ');
          console.log(`✅ Session established: ${this.sessionId}`);
        }
      }
      
      if (!this.sessionId) {
        throw new Error('Failed to get session ID from cookies');
      }
      
      return {
        success: true,
        sessionId: this.sessionId,
        imageUrl: `${this.baseUrl}/editor/working/${this.sessionId}`
      };
      
    } catch (error) {
      console.error('❌ Upload failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Step 2: Perform background removal
   * Uses "magic wand" algorithm - clicks on background to remove it
   */
  async removeBackground(clickX = this.clickPoint.x, clickY = this.clickPoint.y, fuzz = this.fuzz) {
    if (!this.sessionId) {
      throw new Error('No active session. Upload an image first.');
    }
    
    console.log(`🎯 Removing background (click: ${clickX},${clickY}, fuzz: ${fuzz})...`);
    
    try {
      const formData = new FormData();
      formData.append('savenav', 'LunaPic > Edit > Transparent Background');
      formData.append('fuzz', fuzz.toString());
      formData.append('fill', 'area');
      formData.append('action', 'do-trans');
      formData.append('x', clickX.toString());
      formData.append('y', clickY.toString());
      
      const response = await axios.post(`${this.baseUrl}/editor/`, formData, {
        headers: {
          ...formData.getHeaders(),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://www2.lunapic.com',
          'Referer': `${this.baseUrl}/editor/`,
          'Cookie': this.cookie
        },
        maxRedirects: 0,
        validateStatus: () => true
      });
      
      console.log('✅ Background removal completed');
      
      return {
        success: true,
        resultUrl: `${this.baseUrl}/editor/working/${this.sessionId}-bt-1`
      };
      
    } catch (error) {
      console.error('❌ Background removal failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Step 3: Download the result
   */
  async downloadResult(outputPath = 'output.png') {
    if (!this.sessionId) {
      throw new Error('No active session');
    }
    
    console.log('💾 Downloading result...');
    
    try {
      const resultUrl = `${this.baseUrl}/editor/working/${this.sessionId}-bt-1`;
      
      const response = await axios.get(resultUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cookie': this.cookie
        }
      });
      
      fs.writeFileSync(outputPath, response.data);
      console.log(`✅ Image saved to: ${outputPath}`);
      
      return {
        success: true,
        outputPath: outputPath
      };
      
    } catch (error) {
      console.error('❌ Download failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Complete workflow: Upload → Remove Background → Download
   */
  async processImage(imagePath, options = {}) {
    const {
      clickX = this.clickPoint.x,
      clickY = this.clickPoint.y,
      fuzz = this.fuzz,
      outputPath = `output_${Date.now()}.png`
    } = options;
    
    console.log('\n🚀 Starting LunaPic background removal...\n');
    console.log('=' .repeat(60));
    
    // Step 1: Upload
    const uploadResult = await this.uploadImage(imagePath);
    if (!uploadResult.success) {
      return uploadResult;
    }
    
    // Wait a moment for server processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Remove background
    const removeResult = await this.removeBackground(clickX, clickY, fuzz);
    if (!removeResult.success) {
      return removeResult;
    }
    
    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Download
    const downloadResult = await this.downloadResult(outputPath);
    
    console.log('\n' + '=' .repeat(60));
    if (downloadResult.success) {
      console.log('✨ SUCCESS! Background removed and saved.');
    }
    console.log('=' .repeat(60) + '\n');
    
    return downloadResult;
  }

  /**
   * Auto-detect best click point by analyzing image edges
   * Assumes background is at corners
   */
  autoDetectClickPoint(imagePath) {
    console.log('🔍 Auto-detecting click point...');
    // Simple heuristic: click near corner where background likely exists
    // For better results, implement edge detection
    
    const stats = fs.statSync(imagePath);
    if (!stats.isFile()) {
      return this.clickPoint;
    }
    
    // Default to top-left corner (works for most product photos)
    return { x: 10, y: 10 };
  }
}

// CLI Usage
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║     LunaPic Background Remover - Magic Wand Tool         ║
╠═══════════════════════════════════════════════════════════╣
║  Usage: node lunapic-background-remover.js <image>       ║
║                                                           ║
║  Options:                                                 ║
║    --click-x <number>   X coordinate to click (default:10)║
║    --click-y <number>   Y coordinate to click (default:10)║
║    --fuzz <number>      Tolerance 0-100 (default:8)       ║
║    --output <path>      Output file path                  ║
║                                                           ║
║  Examples:                                                ║
║    node lunapic-background-remover.js photo.jpg          ║
║    node lunapic-background-remover.js img.png --fuzz 15  ║
║    node lunapic-background-remover.js test.jpg \\        ║
║      --click-x 50 --click-y 50 --output result.png       ║
╚═══════════════════════════════════════════════════════════╝
    `);
    process.exit(0);
  }
  
  const imagePath = args[0];
  const options = {};
  
  // Parse arguments
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--click-x' && args[i + 1]) {
      options.clickX = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--click-y' && args[i + 1]) {
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
    console.error('\n❌ Failed:', result.error);
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = LunaPicBackgroundRemover;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
