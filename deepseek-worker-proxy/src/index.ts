import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env, ChatCompletionRequest } from './types';
import { DeepSeekAPIClient } from './deepseek-client';
import { MultiAccountAuthManager } from './multi-auth';
import { DEEPSEEK_MODELS } from './config';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', cors());
app.use('*', async (c, next) => {
	console.log(`[Request] ${c.req.method} ${c.req.path}`);
	await next();
});

// Health check endpoint
app.get('/health', (c) => {
	return c.json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		service: 'DeepSeek Worker Multi-Account'
	});
});

// Models endpoint
app.get('/v1/models', (c) => {
	const models = Object.entries(DEEPSEEK_MODELS).map(([id, name]) => ({
		id,
		object: 'model',
		created: Date.now(),
		owned_by: 'deepseek'
	}));

	return c.json({
		object: 'list',
		data: models
	});
});

// Chat completions endpoint
app.post('/v1/chat/completions', async (c) => {
	try {
		const request = await c.req.json<ChatCompletionRequest>();
		
		// Get account credentials
		const authManager = new MultiAccountAuthManager(c.env);
		const account = await authManager.getCredentials();
		
		if (!account) {
			return c.json({
				error: {
					message: 'No valid accounts available. All accounts may be failed or expired.',
					type: 'internal_server_error'
				}
			}, 500);
		}

		console.log(`Using account: ${account.accountId}`);
		console.log(`Request model: ${request.model}`);

		// Make request to DeepSeek API
		const client = new DeepSeekAPIClient(c.env, account.credentials);
		const response = await client.chatCompletions(request);

		return c.json(response);

	} catch (error) {
		console.error('Chat completion error:', error);
		
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		
		return c.json({
			error: {
				message: errorMessage.includes('DeepSeek API') ? errorMessage : `DeepSeek API error: ${errorMessage}`,
				type: 'internal_server_error'
			}
		}, 500);
	}
});

// Admin health check endpoint
app.get('/admin/health', async (c) => {
	// Require admin authentication
	if (!c.env.ADMIN_SECRET_KEY) {
		return c.json({ error: 'Admin endpoint not configured' }, 503);
	}

	const authHeader = c.req.header('Authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return c.json({ error: 'Missing Authorization header' }, 401);
	}

	const providedKey = authHeader.substring(7);
	if (providedKey !== c.env.ADMIN_SECRET_KEY) {
		return c.json({ error: 'Invalid admin key' }, 401);
	}

	try {
		const authManager = new MultiAccountAuthManager(c.env);
		const accountsHealth = await authManager.getAccountsHealth();
		
		// Summary statistics
		const totalAccounts = accountsHealth.length;
		const healthyAccounts = accountsHealth.filter(a => a.status === 'healthy').length;
		const errorAccounts = accountsHealth.filter(a => a.status === 'error').length;
		const missingCredentialsAccounts = accountsHealth.filter(a => a.status === 'missing_credentials').length;

		// Generate pretty ASCII table for accounts
		const accountsTable = accountsHealth.map(account => {
			const statusIcon = account.status === 'healthy' ? '✅' : 
			                 account.status === 'error' ? '❌' : '❓';
			
			return `│ ${account.account.padEnd(30)} │ ${statusIcon} ${account.status.padEnd(18)} │ ${account.expiresIn.padEnd(10)} │ ✓ ${String(account.apiStatus || 'N/A').padEnd(4)} │`;
		}).join('\n');

		const prettyOutput = `
╔══════════════════════════════════════════════════════════════════╗
║              🏥 DEEPSEEK MULTI-ACCOUNT HEALTH CHECK              ║
╠══════════════════════════════════════════════════════════════════╣
║ 📊 SUMMARY                                                       ║
╟──────────────────────────────────────────────────────────────────╢
║ Total Accounts:      ${totalAccounts.toString().padStart(3)}                                       ║
║ ✅ Healthy:           ${healthyAccounts.toString().padStart(3)}                                        ║
║ ❌ Error:              ${errorAccounts.toString().padStart(3)}                                        ║
║ ❓ Missing Creds:      ${missingCredentialsAccounts.toString().padStart(3)}                                        ║
╟──────────────────────────────────────────────────────────────────╢
║ 📋 ACCOUNT STATUS DETAILS                                      ║
╟──────────────────────────────────────────────────────────────────╢
│ Account                         │ Status              │ Expires In │ API │
╠══════════════════════════════════════════════════════════════════╣
${accountsTable}
╚══════════════════════════════════════════════════════════════════╝
🕒 Last Updated: ${new Date().toISOString()}
🔧 Proxy-based health check (tests exact same path as users)
`;

		return c.text(prettyOutput, {
			headers: {
				'Content-Type': 'text/plain'
			}
		});
		
	} catch (error) {
		console.error('Admin health check failed:', error);
		return c.json({ 
			error: 'Health check failed',
			details: error instanceof Error ? error.message : 'Unknown error'
		}, 500);
	}
});

// Debug token endpoint
app.get('/v1/debug/token', (c) => {
	return c.json({
		service: 'DeepSeek Worker Token Cache',
		status: 'active',
		cached: false,
		message: 'Multi-account system active'
	});
});

export default app;
