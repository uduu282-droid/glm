/**
 * Raphael AI Image Editor - Client Implementation
 * 
 * A complete client for interacting with Raphael AI's image editing API.
 * This is a reference implementation based on reverse-engineered patterns.
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class RaphaelAIClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'https://api.raphael.app/v1';
    this.apiKey = options.apiKey || process.env.RAPHAEL_API_KEY;
    this.timeout = options.timeout || 120000; // 2 minutes
    this.pollInterval = options.pollInterval || 2000; // 2 seconds
    
    if (!this.apiKey) {
      console.warn('⚠️  No API key provided. Some endpoints may not work.');
    }
    
    this.axios = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Upload an image to Raphael AI
   * @param {string|Buffer} imageSource - File path or Buffer
   * @returns {Promise<Object>} Upload response with image_id
   */
  async uploadImage(imageSource) {
    console.log('📤 Uploading image...');
    
    let imageData;
    let fileName;
    
    if (typeof imageSource === 'string') {
      // File path
      if (!fs.existsSync(imageSource)) {
        throw new Error(`File not found: ${imageSource}`);
      }
      imageData = fs.readFileSync(imageSource);
      fileName = path.basename(imageSource);
    } else if (Buffer.isBuffer(imageSource)) {
      imageData = imageSource;
      fileName = 'image.png';
    } else {
      throw new Error('Invalid image source. Provide file path or Buffer.');
    }
    
    const form = new FormData();
    form.append('file', imageData, {
      filename: fileName,
      contentType: this.getMimeType(fileName)
    });
    
    try {
      const response = await this.axios.post('/upload', form, {
        headers: {
          ...form.getHeaders()
        }
      });
      
      console.log('✅ Image uploaded successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Upload failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Edit an image using AI
   * @param {string} imageId - ID from upload
   * @param {string} prompt - Text instruction for editing
   * @param {string} mode - 'standard' | 'pro' | 'max'
   * @returns {Promise<Object>} Task information
   */
  async editImage(imageId, prompt, mode = 'standard') {
    console.log(`🎨 Editing image with prompt: "${prompt}" (${mode} mode)`);
    
    const creditCosts = {
      'standard': 2,
      'pro': 12,
      'max': 24
    };
    
    const payload = {
      image_id: imageId,
      prompt: prompt.trim(),
      mode: mode.toLowerCase(),
      credits: creditCosts[mode.toLowerCase()] || 2
    };
    
    try {
      const response = await this.axios.post('/edit', payload);
      console.log('✅ Edit task created');
      return response.data;
    } catch (error) {
      console.error('❌ Edit request failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get result of an edit task
   * @param {string} taskId - Task ID from editImage
   * @returns {Promise<Object>} Task status and result
   */
  async getResult(taskId) {
    try {
      const response = await this.axios.get(`/result/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get result:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Wait for task completion
   * @param {string} taskId - Task ID
   * @param {number} maxAttempts - Maximum polling attempts
   * @returns {Promise<Object>} Final result
   */
  async waitForCompletion(taskId, maxAttempts = 60) {
    console.log('⏳ Waiting for processing...');
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await this.getResult(taskId);
      
      if (result.status === 'completed') {
        console.log('✅ Processing completed!');
        return result;
      }
      
      if (result.status === 'failed' || result.status === 'error') {
        throw new Error(`Task failed: ${result.error || 'Unknown error'}`);
      }
      
      if (attempt % 10 === 0) {
        console.log(`⏱️  Still processing... (${Math.floor(attempt * this.pollInterval / 1000)}s elapsed)`);
      }
      
      await new Promise(resolve => setTimeout(resolve, this.pollInterval));
    }
    
    throw new Error('Task timed out after maximum attempts');
  }

  /**
   * Complete workflow: upload, edit, and download
   * @param {string} imagePath - Path to input image
   * @param {string} prompt - Edit instruction
   * @param {string} mode - Quality mode
   * @param {string} outputPath - Where to save result
   * @returns {Promise<Object>} Result metadata
   */
  async fullEdit(imagePath, prompt, mode = 'standard', outputPath = null) {
    console.log('🚀 Starting full edit workflow...\n');
    
    // Step 1: Upload
    const uploadResult = await this.uploadImage(imagePath);
    const imageId = uploadResult.image_id || uploadResult.id;
    
    if (!imageId) {
      throw new Error('Upload did not return an image_id');
    }
    
    // Step 2: Edit
    const editResult = await this.editImage(imageId, prompt, mode);
    const taskId = editResult.task_id || editResult.id;
    
    if (!taskId) {
      throw new Error('Edit did not return a task_id');
    }
    
    // Step 3: Wait for completion
    const finalResult = await this.waitForCompletion(taskId);
    
    // Step 4: Download result
    if (outputPath && finalResult.result_url) {
      await this.downloadImage(finalResult.result_url, outputPath);
      console.log(`💾 Image saved to: ${outputPath}`);
    }
    
    return finalResult;
  }

  /**
   * Download image from URL
   * @param {string} url - Image URL
   * @param {string} outputPath - Local file path
   */
  async downloadImage(url, outputPath) {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  /**
   * Get MIME type from filename
   */
  getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Check credit balance
   * @returns {Promise<Object>} Credit information
   */
  async getCredits() {
    try {
      const response = await this.axios.get('/credits');
      return response.data;
    } catch (error) {
      console.error('Failed to get credits:', error.message);
      return null;
    }
  }

  /**
   * Test connection and authentication
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      await this.axios.get('/health');
      console.log('✅ Connected to Raphael API');
      return true;
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
  }
}

// CLI Usage Example
async function main() {
  const client = new RaphaelAIClient({
    apiKey: process.env.RAPHAEL_API_KEY || 'your-api-key-here'
  });
  
  // Test connection
  const connected = await client.testConnection();
  if (!connected) {
    console.log('Cannot connect to API. Please check your configuration.');
    return;
  }
  
  // Example: Full edit workflow
  try {
    const result = await client.fullEdit(
      './input-image.jpg',           // Input image path
      'Change background to sunset beach',  // Edit prompt
      'standard',                     // Quality mode
      './output-image.webp'           // Output path
    );
    
    console.log('\n✨ Edit completed successfully!');
    console.log('Credits used:', result.credits_used);
    console.log('Credits remaining:', result.credits_remaining);
    console.log('Result URL:', result.result_url);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

// Export for programmatic use
module.exports = RaphaelAIClient;

// Run if called directly
if (require.main === module) {
  main();
}

/*
 * USAGE EXAMPLES:
 * 
 * 1. Basic usage:
 *    const RaphaelAIClient = require('./raphael-ai-client');
 *    const client = new RaphaelAIClient({ apiKey: 'your-key' });
 *    
 *    const result = await client.fullEdit(
 *      './photo.jpg',
 *      'Convert to anime style',
 *      'pro',
 *      './anime-photo.webp'
 *    );
 * 
 * 2. Manual workflow:
 *    const upload = await client.uploadImage('./photo.jpg');
 *    const task = await client.editImage(upload.image_id, 'Make it brighter', 'standard');
 *    const result = await client.waitForCompletion(task.task_id);
 *    await client.downloadImage(result.result_url, './brighter.jpg');
 * 
 * 3. Check credits:
 *    const credits = await client.getCredits();
 *    console.log('Available credits:', credits.available);
 */
