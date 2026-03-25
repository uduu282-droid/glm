import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { RovoAuthManager } from './auth-manager';

export interface Env {
	ROVO_TOKEN_CACHE: KVNamespace;
}

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('/*', cors());

// Health check endpoint
app.get('/health', async (c) => {
	return c.json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		service: 'Rovo Dev Multi-Account Proxy',
		capacity: '5M tokens/day per account'
	});
});

// OpenAI-compatible chat completions endpoint
app.post('/v1/chat/completions', async (c) => {
	try {
		const authManager = new RovoAuthManager(c.env.ROVO_TOKEN_CACHE);
		
		// Get request body
		const body = await c.req.json();
		const { model, messages, stream = false } = body;

		if (!messages || !Array.isArray(messages)) {
			return c.json({
				error: {
					message: 'Missing or invalid "messages" array',
					type: 'invalid_request_error'
				}
			}, 400);
		}

		// Select an account using rotation logic
		const account = await authManager.selectAccount();
		
		if (!account) {
			return c.json({
				error: {
					message: 'No valid accounts available. All accounts may be failed or expired.',
					type: 'internal_server_error'
				}
			}, 500);
		}

		// Convert OpenAI format to Rovo/Claude format
		const rovoMessages = convertToRovoFormat(messages);

		// Make API call to Rovo Dev
		const response = await callRovoAPI(account, rovoMessages, model);

		// Convert back to OpenAI format
		const openAIResponse = convertToOpenAIFmt(response, model);

		return c.json(openAIResponse);

	} catch (error: any) {
		console.error('Error in chat completions:', error);
		
		return c.json({
			error: {
				message: error.message || 'Internal server error',
				type: 'internal_server_error'
			}
		}, 500);
	}
});

// Models endpoint
app.get('/v1/models', async (c) => {
	return c.json({
		object: 'list',
		data: [
			{
				id: 'claude-sonnet-4',
				object: 'model',
				created: Date.now(),
				owned_by: 'anthropic'
			},
			{
				id: 'claude-3-7-sonnet',
				object: 'model',
				created: Date.now(),
				owned_by: 'anthropic'
			}
		]
	});
});

// Admin endpoint to check account status
app.get('/admin/accounts', async (c) => {
	try {
		const authManager = new RovoAuthManager(c.env.ROVO_TOKEN_CACHE);
		const accounts = await authManager.getAllAccountIds();
		
		const accountDetails = [];
		for (const accountId of accounts) {
			const creds = await authManager.loadAccountCredentials(accountId);
			if (creds) {
				accountDetails.push({
					id: accountId,
					email: creds.email,
					added_date: creds.added_date,
					last_used: creds.last_used,
					token_count_today: creds.token_count_today || 0,
					limit_reset_date: creds.limit_reset_date
				});
			}
		}

		return c.json({
			total_accounts: accountDetails.length,
			total_capacity_per_day: accountDetails.length * 5000000,
			accounts: accountDetails
		});
	} catch (error: any) {
		return c.json({ error: error.message }, 500);
	}
});

/**
 * Convert OpenAI message format to Rovo/Claude format
 */
function convertToRovoFormat(messages: any[]) {
	return messages.map(msg => ({
		role: msg.role,
		content: msg.content
	}));
}

/**
 * Convert Rovo API response to OpenAI format
 */
function convertToOpenAIFmt(rovoResponse: any, model: string) {
	// Rovo returns Claude-style response
	const content = rovoResponse.content || rovoResponse.response || '';
	
	return {
		id: `chatcmpl-rovo-${Date.now()}`,
		object: 'chat.completion',
		model: model || 'claude-sonnet-4',
		choices: [{
			index: 0,
			message: {
				role: 'assistant',
				content: content
			},
			finish_reason: 'stop'
		}],
		usage: {
			prompt_tokens: rovoResponse.usage?.input_tokens || 0,
			completion_tokens: rovoResponse.usage?.output_tokens || 0,
			total_tokens: (rovoResponse.usage?.input_tokens || 0) + (rovoResponse.usage?.output_tokens || 0)
		}
	};
}

/**
 * Call Rovo Dev API with account credentials
 */
async function callRovoAPI(account: any, messages: any[], model?: string) {
	const { email, api_token } = account;

	// Use Atlassian CLI through API or direct API call
	// For now, we'll simulate with a placeholder
	// In production, this would call the actual Rovo API
	
	console.log(`Calling Rovo API with account ${email}`);
	console.log(`Messages:`, JSON.stringify(messages, null, 2));

	// TODO: Implement actual Rovo API call
	// This would use the acli or direct HTTP API
	
	// Placeholder response for development
	return {
		content: `[Rovo Dev API - Model: ${model || 'claude-sonnet-4'}]\n\nThis is a placeholder response. The actual implementation would call the Rovo Dev API with your credentials.\n\nEmail: ${email}\nMessages: ${JSON.stringify(messages[0]?.content || '', null, 2)}`,
		usage: {
			input_tokens: 10,
			output_tokens: 50
		}
	};
}

export default app;
