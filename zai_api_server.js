import express from 'express';
import cors from 'cors';
import ZAIBrowserAPI from './zai_browser_api.js';
import fs from 'fs';
import path from 'path';

/**
 * 🌐 Z.AI Browser API Server
 * 
 * Exposes the browser automation as a REST API
 * Access from anywhere: http://localhost:3000/api/ask
 */

const app = express();
const PORT = process.env.ZAI_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API instance pool (for concurrent requests)
const apiPool = [];
const MAX_POOL_SIZE = 3;

// Initialize API pool
function initializePool() {
    console.log('🔄 Initializing API pool...');
    for (let i = 0; i < MAX_POOL_SIZE; i++) {
        const api = new ZAIBrowserAPI();
        apiPool.push({
            instance: api,
            busy: false,
            lastUsed: Date.now()
        });
    }
    console.log(`✅ Pool ready with ${MAX_POOL_SIZE} instances\n`);
}

// Get available API instance
async function getApiInstance() {
    const available = apiPool.find(pool => !pool.busy);
    
    if (!available) {
        throw new Error('All API instances busy. Try again in a moment.');
    }
    
    available.busy = true;
    available.lastUsed = Date.now();
    
    // Initialize if not already
    if (!available.instance.initialized) {
        await available.instance.initialize();
    }
    
    return available;
}

// Return API instance to pool
function returnApiInstance(poolItem) {
    poolItem.busy = false;
    poolItem.lastUsed = Date.now();
}

// Health check endpoint
app.get('/health', (req, res) => {
    const healthyInstances = apiPool.filter(p => !p.busy && p.instance.initialized).length;
    
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        pool: {
            total: MAX_POOL_SIZE,
            busy: MAX_POOL_SIZE - healthyInstances,
            available: healthyInstances
        },
        uptime: process.uptime()
    });
});

// Main ask endpoint
app.post('/api/ask', async (req, res) => {
    const { question, timeout = 40000, waitForResponse = true } = req.body;
    
    if (!question || typeof question !== 'string') {
        return res.status(400).json({
            success: false,
            error: 'Question is required and must be a string'
        });
    }
    
    try {
        const poolItem = await getApiInstance();
        
        console.log(`💬 [${new Date().toISOString()}] Asking: "${question.substring(0, 50)}..."`);
        
        const answer = await poolItem.instance.ask(question, {
            timeout,
            waitForResponse
        });
        
        returnApiInstance(poolItem);
        
        res.json({
            success: true,
            question: question,
            answer: answer,
            timestamp: new Date().toISOString(),
            metadata: {
                characters: answer.length,
                tookMs: Date.now() - poolItem.lastUsed
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        res.status(500).json({
            success: false,
            error: error.message,
            suggestion: 'Try refreshing session: node zai_login_explorer.js'
        });
    }
});

// Quick ask endpoint (auto manages browser)
app.post('/api/ask-once', async (req, res) => {
    const { question, timeout = 40000 } = req.body;
    
    if (!question) {
        return res.status(400).json({ error: 'Question required' });
    }
    
    const api = new ZAIBrowserAPI();
    
    try {
        await api.initialize();
        const answer = await api.askOnce(question, { timeout });
        
        res.json({
            success: true,
            question: question,
            answer: answer,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    } finally {
        await api.close();
    }
});

// Batch questions endpoint
app.post('/api/batch', async (req, res) => {
    const { questions, delayBetweenQuestions = 2000 } = req.body;
    
    if (!Array.isArray(questions)) {
        return res.status(400).json({ error: 'Questions must be an array' });
    }
    
    const results = [];
    const poolItem = await getApiInstance();
    
    try {
        for (let i = 0; i < questions.length; i++) {
            console.log(`📝 Question ${i + 1}/${questions.length}: ${questions[i]}`);
            
            const answer = await poolItem.instance.ask(questions[i]);
            
            results.push({
                index: i,
                question: questions[i],
                answer: answer,
                success: true
            });
            
            // Delay between questions
            if (i < questions.length - 1) {
                await new Promise(resolve => setTimeout(resolve, delayBetweenQuestions));
            }
        }
        
        returnApiInstance(poolItem);
        
        res.json({
            success: true,
            count: results.length,
            results: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Batch error:', error.message);
        
        res.status(500).json({
            success: false,
            error: error.message,
            partialResults: results
        });
    }
});

// Session management endpoints
app.get('/api/session/status', (req, res) => {
    try {
        const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
        
        if (!fs.existsSync(sessionPath)) {
            return res.json({
                valid: false,
                message: 'No session found'
            });
        }
        
        const session = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
        const age = Date.now() - session.timestamp;
        const ageHours = (age / (1000 * 60 * 60)).toFixed(2);
        
        res.json({
            valid: true,
            age: `${ageHours} hours`,
            cookies: session.cookies?.length || 0,
            url: session.url,
            needsRefresh: age > (2 * 60 * 60 * 1000) // Older than 2 hours
        });
        
    } catch (error) {
        res.status(500).json({
            valid: false,
            error: error.message
        });
    }
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
    const now = Date.now();
    const poolStats = apiPool.map((pool, i) => ({
        instance: i + 1,
        busy: pool.busy,
        initialized: pool.instance.initialized,
        lastUsedAgo: `${((now - pool.lastUsed) / 1000).toFixed(1)}s ago`
    }));
    
    res.json({
        pool: poolStats,
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
async function startServer() {
    console.log('\n🌐 Z.AI Browser API Server');
    console.log('='.repeat(60));
    
    // Initialize pool
    initializePool();
    
    // Start listening
    app.listen(PORT, () => {
        console.log(`\n✅ Server running on port ${PORT}`);
        console.log(`\n📍 Endpoints:`);
        console.log(`   POST http://localhost:${PORT}/api/ask`);
        console.log(`   POST http://localhost:${PORT}/api/ask-once`);
        console.log(`   POST http://localhost:${PORT}/api/batch`);
        console.log(`   GET  http://localhost:${PORT}/health`);
        console.log(`   GET  http://localhost:${PORT}/api/session/status`);
        console.log(`   GET  http://localhost:${PORT}/api/stats`);
        console.log(`\n📚 Documentation:`);
        console.log(`   Open README_SERVER.md for usage examples`);
        console.log('='.repeat(60));
        console.log('\n🚀 Ready to accept requests!\n');
    });
}

// Handle shutdown
process.on('SIGINT', async () => {
    console.log('\n👋 Shutting down server...');
    
    for (const poolItem of apiPool) {
        try {
            await poolItem.instance.close();
        } catch (e) {
            // Ignore errors during shutdown
        }
    }
    
    process.exit(0);
});

// Start
startServer().catch(console.error);
