/**
 * Background Remover API - Working Implementation
 * Based on: https://www.changeimageto.com/
 * Endpoint: https://bgremover-backend-121350814881.us-central1.run.app/api/remove-bg
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

class BackgroundRemoverAPI {
  constructor() {
    this.apiUrl = 'https://bgremover-backend-121350814881.us-central1.run.app/api/remove-bg';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
      'Referer': 'https://www.changeimageto.com/',
      'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"'
    };
  }

  /**
   * Remove background from image
   * @param {string} imagePath - Path to input image
   * @param {string} outputDir - Directory to save result (default: './output')
   * @returns {Promise<{success: boolean, outputPath?: string, error?: string}>}
   */
  async removeBackground(imagePath, outputDir = './output') {
    console.log('🎨 Background Remover API');
    console.log('=' .repeat(50));
    console.log(`📤 Input: ${imagePath}`);
    
    try {
      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        throw new Error(`File not found: ${imagePath}`);
      }

      // Create output directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Prepare form data with multipart/form-data
      const formData = new FormData();
      const fileStream = fs.createReadStream(imagePath);
      formData.append('file', fileStream);

      console.log('⏳ Processing...');

      // Send request
      const response = await axios.post(this.apiUrl, formData, {
        headers: {
          ...this.headers,
          ...formData.getHeaders()
        },
        responseType: 'arraybuffer',
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      console.log(`✅ Status: ${response.status}`);
      console.log(`📊 Response size: ${(response.data.length / 1024).toFixed(2)} KB`);

      // Check if response is JSON (error) or binary (success)
      const contentType = response.headers['content-type'];
      
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = JSON.parse(Buffer.from(response.data).toString());
        
        if (jsonResponse.error) {
          throw new Error(jsonResponse.error);
        }
        
        // If JSON but no error, might be success message with URL
        if (jsonResponse.url) {
          console.log(`🔗 Result URL: ${jsonResponse.url}`);
          return {
            success: true,
            url: jsonResponse.url,
            message: 'Background removed successfully'
          };
        }
      }

      // Save result as PNG
      const timestamp = Date.now();
      const inputFileName = imagePath.split('/').pop().split('.')[0];
      const outputPath = `${outputDir}/${inputFileName}_no_bg_${timestamp}.png`;
      
      fs.writeFileSync(outputPath, response.data);
      
      console.log(`💾 Saved to: ${outputPath}`);
      console.log('✨ Background removed successfully!\n');

      return {
        success: true,
        outputPath,
        size: response.data.length
      };

    } catch (error) {
      console.error('❌ Error:', error.message);
      
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Headers:`, JSON.stringify(error.response.headers, null, 2));
        
        try {
          const errorData = Buffer.from(error.response.data).toString();
          console.error(`   Body:`, errorData.substring(0, 500));
        } catch {}
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Batch process multiple images
   */
  async batchRemoveBackground(imagePaths, outputDir = './output') {
    console.log(`🔄 Batch processing ${imagePaths.length} images...\n`);
    
    const results = [];
    
    for (let i = 0; i < imagePaths.length; i++) {
      console.log(`[${i + 1}/${imagePaths.length}]`);
      const result = await this.removeBackground(imagePaths[i], outputDir);
      results.push(result);
      
      // Small delay between requests
      if (i < imagePaths.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n✅ Completed: ${successCount}/${imagePaths.length} successful`);
    
    return results;
  }
}

// CLI usage
async function main() {
  const remover = new BackgroundRemoverAPI();
  
  // Get image path from command line or use default
  const imagePath = process.argv[2] || './test_image.png';
  
  if (process.argv[2] === '--batch') {
    // Batch mode: process all PNGs in current directory
    const files = fs.readdirSync('.').filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
    if (files.length === 0) {
      console.log('No images found in current directory');
      return;
    }
    await remover.batchRemoveBackground(files);
  } else {
    // Single image mode
    await remover.removeBackground(imagePath);
  }
}

// Export for programmatic use
export default BackgroundRemoverAPI;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
