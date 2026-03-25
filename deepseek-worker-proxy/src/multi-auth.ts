import { Env, DeepSeekCredentials } from './types';

/**
 * Multi-account authentication manager for DeepSeek API.
 * Supports multiple API keys with automatic rotation and failover.
 */
export class MultiAccountAuthManager {
	private env: Env;
	private selectedAccount: string | null = null;
	private selectedCredentials: DeepSeekCredentials | null = null;
	private forcedAccount: string | null = null; // For health checks

	constructor(env: Env) {
		this.env = env;
	}

	/**
	 * Get all account IDs from KV storage
	 */
	private async getAllAccountIds(): Promise<string[]> {
		try {
			console.log('DEBUG: Listing accounts from KV...');
			const list = await this.env.DEEPSEEK_TOKEN_CACHE.list({ prefix: 'ACCOUNT:' });
			console.log('DEBUG: KV list result:', JSON.stringify(list));
			const accountIds = list.keys.map(key => key.name.replace('ACCOUNT:', ''));
			console.log('DEBUG: Found accounts:', accountIds);
			return accountIds;
		} catch (error) {
			console.error('DEBUG: Failed to list accounts:', error);
			return [];
		}
	}

	/**
	 * Load credentials for a specific account from KV
	 */
	private async loadAccountCredentials(accountId: string): Promise<DeepSeekCredentials | null> {
		try {
			const creds = await this.env.DEEPSEEK_TOKEN_CACHE.get(`ACCOUNT:${accountId}`, 'json');
			return creds as DeepSeekCredentials | null;
		} catch (error) {
			console.error(`Failed to load credentials for ${accountId}:`, error);
			return null;
		}
	}

	/**
	 * Weighted random selection of accounts
	 */
	private async selectBestAccount(): Promise<{ accountId: string; credentials: DeepSeekCredentials } | null> {
		const allAccountIds = await this.getAllAccountIds();

		if (allAccountIds.length === 0) {
			console.log('No accounts configured');
			return null;
		}

		console.log(`Available accounts: ${allAccountIds.join(', ')}`);

		// Simple round-robin or random selection
		const randomIndex = Math.floor(Math.random() * allAccountIds.length);
		const selectedAccountId = allAccountIds[randomIndex];
		
		const credentials = await this.loadAccountCredentials(selectedAccountId);
		if (!credentials) {
			console.log(`No credentials found for ${selectedAccountId}`);
			return null;
		}

		console.log(`Selected account: ${selectedAccountId}`);
		return { accountId: selectedAccountId, credentials };
	}

	/**
	 * Force selection of a specific account (for health checks)
	 */
	public forceSelectAccount(accountId: string): void {
		this.forcedAccount = accountId;
		this.selectedAccount = null;
		this.selectedCredentials = null;
	}

	/**
	 * Clear forced account and restore normal selection
	 */
	public clearForcedAccount(): void {
		this.forcedAccount = null;
		this.selectedAccount = null;
		this.selectedCredentials = null;
	}

	/**
	 * Get credentials for the next request
	 */
	async getCredentials(): Promise<{ accountId: string; credentials: DeepSeekCredentials } | null> {
		// If we have a forced account (health check), use it
		if (this.forcedAccount) {
			console.log(`Using forced account: ${this.forcedAccount}`);
			const credentials = await this.loadAccountCredentials(this.forcedAccount);
			if (credentials) {
				return { accountId: this.forcedAccount, credentials };
			}
			return null;
		}

		// If we already have selected credentials, reuse them
		if (this.selectedAccount && this.selectedCredentials) {
			return { accountId: this.selectedAccount, credentials: this.selectedCredentials };
		}

		// Select a new account
		const selected = await this.selectBestAccount();
		if (selected) {
			this.selectedAccount = selected.accountId;
			this.selectedCredentials = selected.credentials;
		}

		return selected;
	}

	/**
	 * Mark an account as failed and clear selection
	 */
	markCurrentAsFailed(): void {
		if (this.selectedAccount) {
			console.log(`Marking account ${this.selectedAccount} as failed`);
		}
		this.selectedAccount = null;
		this.selectedCredentials = null;
	}

	/**
	 * Get health status of all accounts
	 */
	async getAccountsHealth(): Promise<Array<{
		account: string;
		status: 'healthy' | 'error' | 'missing_credentials';
		error: string | null;
		expiresIn: string;
		isFailed: boolean;
		apiStatus?: number;
	}>> {
		const allAccountIds = await this.getAllAccountIds();
		const results: Array<{
			account: string;
			status: 'healthy' | 'error' | 'missing_credentials';
			error: string | null;
			expiresIn: string;
			isFailed: boolean;
			apiStatus?: number;
		}> = [];

		console.log(`Starting health check for ${allAccountIds.length} accounts...`);

		for (const accountId of allAccountIds) {
			console.log(`Testing account: ${accountId}`);
			
			this.forceSelectAccount(accountId);
			
			try {
				const credentials = await this.loadAccountCredentials(accountId);
				if (!credentials) {
					results.push({
						account: accountId,
						status: 'missing_credentials',
						error: 'No credentials found',
						expiresIn: 'unknown',
						isFailed: false
					});
					continue;
				}

				// Test through the actual client
				const { DeepSeekAPIClient } = await import('./deepseek-client');
				const client = new DeepSeekAPIClient(this.env, credentials);
				
				await client.chatCompletions({
					model: 'deepseek-chat',
					messages: [{ role: 'user', content: 'hi' }],
					max_tokens: 5
				});
				
				results.push({
					account: accountId,
					status: 'healthy',
					error: null,
					expiresIn: 'N/A',
					isFailed: false,
					apiStatus: 200
				});
				
				console.log(`✅ ${accountId}: HEALTHY`);
				
			} catch (error) {
				console.log(`❌ ${accountId}: ERROR - ${error instanceof Error ? error.message : 'Unknown error'}`);
				
				results.push({
					account: accountId,
					status: 'error',
					error: error instanceof Error ? error.message : 'Unknown error',
					expiresIn: 'N/A',
					isFailed: false
				});
			}
		}

		this.clearForcedAccount();
		return results;
	}
}
