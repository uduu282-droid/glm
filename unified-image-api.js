/**
 * 🎨 Unified Image Processing API
 * 
 * A single endpoint to access multiple image processing tools
 * 
 * Usage:
 *   POST /api/process
 *   {
 *     "tool": "remove-bg|convert-format|image-to-pdf|remove-text",
 *     "image": "base64 or file path",
 *     "options": {}
 *   }
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

class UnifiedImageAPI {
  constructor() {
    this.baseUrl = 'https://bgremover-backend-121350814881.us-central1.run.app';
    
    // Map of tool names to actual endpoints
    this.tools = {
      'remove-bg': {
        endpoint: '/api/remove-bg',
        description: 'Remove background from images',
        supportsOptions: false
      },
      'convert-format': {
        endpoint: '/api/convert-format',
        description: 'Convert between PNG, JPG, WEBP formats',
        supportsOptions: true,
        options: {
          format: 'png|jpg|webp (default: png)',
          quality: '0-100 (default: 90)'
        }
      },
      'image-to-pdf': {
        endpoint: '/api/image-to-pdf',
        description: 'Convert image to PDF document',
        supportsOptions: true,
        options: {
          pageSize: 'A4|Letter|Custom (default: A4)',
          orientation: 'portrait|landscape (default: portrait)'
        }
      },
      'remove-text': {
        endpoint: '/api/remove-text',
        description: 'Remove text/watermarks from images',
        supportsOptions: false
      }
    };
  }

  /**
   * Process an image with the specified tool
   * @param {string} tool - Tool name to use
   * @param {string} imagePath - Path to input image
   * @param {object} options - Tool-specific options
   * @param {string} outputDir - Output directory
   * @returns {Promise<object>} - Result with output path
   */
  async processImage(tool, imagePath, options = {}, outputDir = './output') {
    // Validate tool
    if (!this.tools[tool]) {
      throw new Error(`Unknown tool: ${tool}. Available: ${Object.keys(this.tools).join(', ')}`);
    }

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`File not found: ${imagePath}`);
    }

    const toolConfig = this.tools[tool];
    const formData = new FormData();
    
    // Add image file
    formData.append('file', fs.createReadStream(imagePath));
    
    // Add options if supported
    if (toolConfig.supportsOptions && options) {
      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });
    }

    // Make API request
    const url = `${this.baseUrl}${toolConfig.endpoint}`;
    console.log(`📤 Processing: ${tool} (${imagePath})`);
    console.log(`🔗 Endpoint: ${url}`);
    
    try {
      const response = await axios.post(url, formData, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.changeimageto.com/',
          ...formData.getHeaders()
        },
        responseType: 'arraybuffer',
        timeout: 60000
      });

      if (response.status === 200) {
        // Create output directory
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        // Generate output filename
        const timestamp = Date.now();
        const inputFileName = imagePath.split(/[\\/]/).pop().split('.')[0];
        const ext = tool === 'image-to-pdf' ? 'pdf' : 'png';
        const outputPath = `${outputDir}/${inputFileName}_${tool.replace(/-/g, '_')}_${timestamp}.${ext}`;
        
        // Save result
        fs.writeFileSync(outputPath, Buffer.from(response.data));
        
        const result = {
          success: true,
          tool: tool,
          input: imagePath,
          output: outputPath,
          size: (response.data.length / 1024).toFixed(2) + ' KB',
          status: response.status
        };

        console.log(`✅ Success: ${(result.size)}`);
        console.log(`💾 Saved: ${outputPath}\n`);
        
        return result;
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      if (error.response) {
        try {
          const errorText = Buffer.from(error.response.data).toString();
          console.error(`   Response: ${errorText.substring(0, 200)}`);
        } catch {}
      }
      throw error;
    }
  }

  /**
   * Batch process multiple images
   * @param {array} images - Array of image paths
   * @param {string} tool - Tool to use
   * @param {object} options - Options
   * @returns {Promise<array>} - Results
   */
  async batchProcess(images, tool, options = {}) {
    console.log(`\n🚀 Batch Processing ${images.length} images with ${tool}\n`);
    
    const results = [];
    for (const image of images) {
      try {
        const result = await this.processImage(tool, image, options);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          image: image,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Get list of available tools
   * @returns {object} - Tools information
   */
  getAvailableTools() {
    return {
      tools: Object.keys(this.tools),
      details: this.tools,
      usage: {
        example: 'await api.processImage("remove-bg", "./input.png")',
        batchExample: 'await api.batchProcess(["img1.png", "img2.png"], "remove-bg")'
      }
    };
  }
}

// Export as default
export default UnifiedImageAPI;

// CLI usage
if (process.argv[1] && process.argv[1].includes('unified-image-api.js')) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🎨 Unified Image Processing API\n');
    console.log('Usage:');
    console.log('  node unified-image-api.js <tool> <image> [options]\n');
    console.log('Available tools:');
    const api = new UnifiedImageAPI();
    const tools = api.getAvailableTools();
    Object.entries(tools.details).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value.description}`);
    });
    console.log('\nExamples:');
    console.log('  node unified-image-api.js remove-bg ./input.png');
    console.log('  node unified-image-api.js convert-format ./input.png --format=jpg');
    console.log('  node unified-image-api.js image-to-pdf ./input.png\n');
    process.exit(0);
  }

  const tool = args[0];
  const image = args[1];
  
  if (!tool || !image) {
    console.error('❌ Please provide tool and image path');
    process.exit(1);
  }

  const api = new UnifiedImageAPI();
  api.processImage(tool, image).catch(() => process.exit(1));
}
