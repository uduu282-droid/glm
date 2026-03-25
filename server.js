/**
 * GLM AI Chat - Render Server
 * Serves the web interface and provides API proxy
 */

import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Configuration
const API_KEY = process.env.GLM_API_KEY || 'vtx-RUmIksxLD8Qf8njF3JsMXLqICnZEohaM';
const BASE_URL = 'https://api.featherlabs.online/v1';

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Proxy API endpoint to avoid CORS issues
app.post('/api/chat', async (req, res) => {
    try {
        const { model, messages, temperature, max_tokens } = req.body;
        
        const response = await fetch(`${BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages,
                temperature,
                max_tokens
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.json(data);
        
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({
            error: 'Failed to communicate with GLM API',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'GLM AI Chat',
        timestamp: new Date().toISOString()
    });
});

// Get available models (cached list)
app.get('/api/models', (req, res) => {
    res.json({
        models: [
            { id: 'glm-4.6', name: 'GLM-4.6', description: 'Balanced & powerful' },
            { id: 'glm-4.7', name: 'GLM-4.7', description: 'Latest flagship' },
            { id: 'glm-4.6v', name: 'GLM-4.6v', description: 'Vision-capable' },
            { id: 'glm-4.5', name: 'GLM-4.5', description: 'High-performance' },
            { id: 'glm-4.5-air', name: 'GLM-4.5-air', description: 'Fast & lightweight' }
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 GLM AI Chat server running on port ${PORT}`);
    console.log(`📱 Web interface: http://localhost:${PORT}`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log(`⚡ API proxy: http://localhost:${PORT}/api/chat`);
});

export default app;
