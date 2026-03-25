/**
 * 🌐 Unified Image Processing Server
 * 
 * Single endpoint to access all image processing tools
 * 
 * POST /api/process
 * {
 *   "tool": "remove-bg|convert-format|image-to-pdf|remove-text",
 *   "image": "base64_string_or_url",
 *   "options": {}
 * }
 */

import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

// Available tools configuration
const TOOLS = {
  // Background Tools
  'remove-bg': {
    endpoint: '/api/remove-bg',
    description: 'Remove background from images',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  },
  'change-bg': {
    endpoint: '/api/change-bg',
    description: 'Replace background with solid colors or custom backgrounds',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    supportsOptions: true,
    options: { color: 'hex color code (e.g., #FFFFFF)' }
  },
  'blur-bg': {
    endpoint: '/api/blur-bg',
    description: 'Blur background for portrait effect',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    supportsOptions: true,
    options: { blur: '0-10 (default: 5)' }
  },
  'bw-bg': {
    endpoint: '/api/bw-bg',
    description: 'Convert background to black and white',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  },
  
  // Color & Enhancement Tools
  'change-colors': {
    endpoint: '/api/change-colors',
    description: 'Adjust hue, saturation, brightness, contrast',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    supportsOptions: true,
    options: { hue: '0-360', saturation: '-100 to 100', brightness: '-100 to 100', contrast: '-100 to 100' }
  },
  'enhance': {
    endpoint: '/api/enhance',
    description: 'Sharpen details and auto-improve quality',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  },
  'upscale': {
    endpoint: '/api/upscale',
    description: 'Increase image size up to 4x',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    supportsOptions: true,
    options: { scale: '2|3|4 (default: 2)' }
  },
  
  // Format & Conversion Tools
  'convert-format': {
    endpoint: '/api/convert-format',
    description: 'Convert between PNG, JPG, WEBP formats',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    supportsOptions: true,
    options: { format: 'png|jpg|webp', quality: '0-100' }
  },
  'image-to-pdf': {
    endpoint: '/api/image-to-pdf',
    description: 'Convert image to PDF document',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    supportsOptions: true,
    options: { pageSize: 'A4|Letter|Custom', orientation: 'portrait|landscape' }
  },
  
  // Text & Object Removal Tools
  'ocr': {
    endpoint: '/api/ocr',
    description: 'Extract text from images (OCR)',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  },
  'remove-text': {
    endpoint: '/api/remove-text',
    description: 'Remove text/watermarks from images',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  },
  'remove-watermark': {
    endpoint: '/api/remove-watermark',
    description: 'Remove watermarks using AI inpainting',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  },
  'remove-gemini-watermark': {
    endpoint: '/api/remove-gemini-watermark',
    description: 'Remove Gemini AI watermarks specifically',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  },
  'remove-people': {
    endpoint: '/api/remove-people',
    description: 'Remove people from photos with AI',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  },
  
  // Resize & Optimization Tools
  'resize': {
    endpoint: '/api/resize',
    description: 'Resize images to specific dimensions',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    supportsOptions: true,
    options: { width: 'pixels', height: 'pixels', fit: 'cover|contain|fill' }
  },
  'compress': {
    endpoint: '/api/compress',
    description: 'Reduce file size without losing quality',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    supportsOptions: true,
    options: { quality: '0-100 (default: 80)' }
  },
  
  // Additional Tools
  'add-text': {
    endpoint: '/api/add-text',
    description: 'Add customizable text to photos',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    supportsOptions: true,
    options: { text: 'your text', fontSize: '12-72', color: 'hex color', x: 'position X', y: 'position Y' }
  },
  'metadata': {
    endpoint: '/api/metadata',
    description: 'View, edit, and remove image metadata (EXIF)',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    supportsOptions: true,
    options: { action: 'view|edit|remove' }
  },
  'check-quality': {
    endpoint: '/api/check-quality',
    description: 'Detect blurry, noisy, pixelated photos',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  }
};

const BASE_URL = 'https://bgremover-backend-121350814881.us-central1.run.app';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({
    name: 'Unified Image Processing API',
    version: '1.0.0',
    availableTools: Object.keys(TOOLS),
    endpoints: {
      process: 'POST /api/process',
      tools: 'GET /api/tools',
      health: 'GET /health'
    }
  });
});

// List available tools
app.get('/api/tools', (req, res) => {
  res.json({
    tools: Object.entries(TOOLS).map(([key, value]) => ({
      name: key,
      description: value.description,
      supportedFormats: value.mimeTypes
    }))
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main processing endpoint
app.post('/api/process', upload.single('image'), async (req, res) => {
  try {
    const { tool, options = {} } = req.body;
    
    // Validate tool
    if (!tool || !TOOLS[tool]) {
      return res.status(400).json({
        error: 'Invalid tool',
        message: `Unknown tool: ${tool}`,
        availableTools: Object.keys(TOOLS)
      });
    }

    // Get image from request
    let imagePath;
    
    if (req.file) {
      // From file upload
      imagePath = req.file.path;
    } else if (req.body.image) {
      // From base64 or URL
      if (req.body.image.startsWith('http')) {
        // Download from URL
        const response = await axios.get(req.body.image, {
          responseType: 'arraybuffer'
        });
        imagePath = `uploads/temp_${Date.now()}`;
        fs.writeFileSync(imagePath, response.data);
      } else {
        // From base64
        const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
        imagePath = `uploads/temp_${Date.now()}`;
        fs.writeFileSync(imagePath, Buffer.from(base64Data, 'base64'));
      }
    } else {
      return res.status(400).json({
        error: 'No image provided',
        message: 'Please provide an image file, base64 string, or URL'
      });
    }

    // Prepare request to backend API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));
    
    // Add options
    if (TOOLS[tool].supportsOptions) {
      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });
    }

    // Call backend API
    const toolConfig = TOOLS[tool];
    const response = await axios.post(`${BASE_URL}${toolConfig.endpoint}`, formData, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.changeimageto.com/',
        ...formData.getHeaders()
      },
      responseType: 'arraybuffer',
      timeout: 60000
    });

    // Clean up temp file
    if (imagePath.startsWith('uploads/temp_')) {
      fs.unlinkSync(imagePath);
    }

    // Determine output format
    const contentType = response.headers['content-type'];
    const outputFormat = contentType.includes('pdf') ? 'pdf' : 'png';

    // Return result
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="processed_${Date.now()}.${outputFormat}"`
    });

    res.send(response.data);

  } catch (error) {
    console.error('Processing error:', error.message);
    
    // Clean up temp file on error
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }

    res.status(error.response?.status || 500).json({
      error: 'Processing failed',
      message: error.message,
      details: error.response?.data?.toString() || error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Unified Image API Server running on port ${PORT}`);
  console.log(`\nAvailable tools:`);
  Object.entries(TOOLS).forEach(([key, value]) => {
    console.log(`  - ${key}: ${value.description}`);
  });
  console.log(`\nEndpoints:`);
  console.log(`  GET  http://localhost:${PORT}/ - API info`);
  console.log(`  GET  http://localhost:${PORT}/api/tools - List tools`);
  console.log(`  POST http://localhost:${PORT}/api/process - Process image`);
  console.log(`  GET  http://localhost:${PORT}/health - Health check\n`);
});
