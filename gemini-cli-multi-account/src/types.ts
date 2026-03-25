// Type definitions for Gemini Multi-Account Worker

export interface Env {
	// KV Namespace for storing multiple accounts
	GEMINI_TOKEN_CACHE: KVNamespace;
	
	// API authentication (supports multiple keys)
	OPENAI_API_KEYS?: string; // Comma-separated list of API keys
	ADMIN_SECRET_KEY?: string; // Admin key for health check endpoint
	
	// Google Cloud Project ID (for paid/enterprise tier)
	GOOGLE_CLOUD_PROJECT?: string;
}

export interface AccountCredentials {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expiry_date: number;
	id_token?: string;
	account_id?: string;
}

export interface TokenRefreshResult {
	success: boolean;
	credentials?: AccountCredentials;
	error?: string;
}

export interface AccountHealthStatus {
	account: string;
	status: 'healthy' | 'quota_exceeded' | 'error' | 'missing_credentials';
	expiresIn?: string;
	error?: string;
}
