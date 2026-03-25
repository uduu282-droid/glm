// Gemini Multi-Account Worker Proxy
// OpenAI-compatible API for Gemini models with multi-account rotation

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import type { Env, AccountCredentials } from './types';
import { GeminiAuthManager } from './auth-manager';
import { setupOpenAIRoutes } from './routes/openai';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('/*', cors());
app.use('/*', prettyJSON());

// Health check endpoint
app.get('/health', (c) => {
	return c.json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		service: 'gemini-cli-multi-account-proxy'
	});
});

// Admin health check - requires ADMIN_SECRET_KEY
app.get('/admin/health', async (c) => {
	const authHeader = c.req.header('Authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return c.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const token = authHeader.substring(7);
	if (token !== c.env.ADMIN_SECRET_KEY) {
		return c.json({ error: 'Invalid admin key' }, { status: 401 });
	}

	try {
		const authManager = new GeminiAuthManager(c.env.GEMINI_TOKEN_CACHE);
		const accountsHealth = await authManager.healthCheck();
		
		const summary = {
			total_accounts: accountsHealth.length,
			healthy_accounts: accountsHealth.filter(a => a.status === 'healthy').length,
			failed_accounts: accountsHealth.filter(a => a.status === 'error').length,
			quota_exceeded_accounts: accountsHealth.filter(a => a.status === 'quota_exceeded').length
		};

		return c.json({
			summary,
			accounts: accountsHealth
		});
	} catch (error) {
		return c.json({ 
			error: 'Health check failed',
			details: error instanceof Error ? error.message : String(error)
		}, { status: 500 });
	}
});

// List available models
app.get('/v1/models', async (c) => {
	// Gemini models available through CLI
	const models = [
		{
			id: 'gemini-2.5-pro',
			name: 'Gemini 2.5 Pro',
			created: Date.now(),
			object: 'model'
		},
		{
			id: 'gemini-2.5-flash',
			name: 'Gemini 2.5 Flash',
			created: Date.now(),
			object: 'model'
		}
	];

	return c.json({
		object: 'list',
		data: models
	});
});

// Setup OpenAI-compatible routes
setupOpenAIRoutes(app);

// Error handling
app.onError((err, c) => {
	console.error('Worker error:', err);
	return c.json({
		error: {
			message: err.message || 'Internal server error',
			type: 'worker_error'
		}
	}, { status: 500 });
});

export default app;
