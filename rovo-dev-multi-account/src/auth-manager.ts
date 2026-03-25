export interface RovoCredentials {
	email: string;
	api_token: string;
	added_date: number;
	last_used: number | null;
	token_count_today: number;
	limit_reset_date: number | null;
}

export class RovoAuthManager {
	private kv: KVNamespace;

	constructor(kv: KVNamespace) {
		this.kv = kv;
	}

	/**
	 * Get all account IDs from KV
	 */
	async getAllAccountIds(): Promise<string[]> {
		try {
			const keys = await this.kv.list({ prefix: 'ACCOUNT:' });
			return keys.keys.map(key => key.name.replace('ACCOUNT:', ''));
		} catch (error) {
			console.error('Failed to list accounts:', error);
			return [];
		}
	}

	/**
	 * Load credentials for a specific account from KV
	 */
	async loadAccountCredentials(accountId: string): Promise<RovoCredentials | null> {
		try {
			const creds = await this.kv.get(`ACCOUNT:${accountId}`, 'json');
			return creds as RovoCredentials | null;
		} catch (error) {
			console.error(`Failed to load credentials for ${accountId}:`, error);
			return null;
		}
	}

	/**
	 * Select an account using weighted random rotation
	 * Prioritizes accounts with more remaining tokens
	 */
	async selectAccount(): Promise<RovoCredentials | null> {
		const accounts = await this.getAllAccountIds();
		if (accounts.length === 0) {
			return null;
		}

		// Check if we need to reset daily counters (new UTC day)
		await this.checkAndResetDailyCounters();

		// Load all accounts with their credentials
		const accountsWithCreds = [];
		for (const accountId of accounts) {
			const creds = await this.loadAccountCredentials(accountId);
			if (!creds) continue;

			// Calculate remaining tokens for today
			const remainingTokens = 5000000 - (creds.token_count_today || 0);
			
			// Skip accounts that have exhausted their daily limit
			if (remainingTokens <= 0) {
				console.log(`Account ${accountId} has exhausted daily limit`);
				continue;
			}

			accountsWithCreds.push({
				accountId,
				creds,
				remainingTokens
			});
		}

		if (accountsWithCreds.length === 0) {
			return null;
		}

		// Weighted random selection - prefer accounts with more remaining tokens
		const totalWeight = accountsWithCreds.reduce((sum, acc) => sum + acc.remainingTokens, 0);
		let random = Math.random() * totalWeight;
		
		for (const account of accountsWithCreds) {
			random -= account.remainingTokens;
			if (random <= 0) {
				return account.creds;
			}
		}

		// Fallback to first available
		return accountsWithCreds[0].creds;
	}

	/**
	 * Check and reset daily token counters at midnight UTC
	 */
	private async checkAndResetDailyCounters(): Promise<void> {
		try {
			const lastResetDate = await this.kv.get('LAST_DAILY_RESET_DATE');
			const currentUtcDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
			
			if (lastResetDate !== currentUtcDate) {
				console.log(`New UTC day detected (${currentUtcDate}), resetting daily counters...`);
				
				const accounts = await this.getAllAccountIds();
				for (const accountId of accounts) {
					const creds = await this.loadAccountCredentials(accountId);
					if (creds) {
						creds.token_count_today = 0;
						creds.limit_reset_date = Date.now();
						await this.kv.put(`ACCOUNT:${accountId}`, JSON.stringify(creds));
					}
				}
				
				await this.kv.put('LAST_DAILY_RESET_DATE', currentUtcDate);
				console.log('Daily counters reset successfully');
			}
		} catch (error) {
			console.error('Failed to reset daily counters:', error);
		}
	}

	/**
	 * Update token usage for an account
	 */
	async updateTokenUsage(accountId: string, tokensUsed: number): Promise<void> {
		try {
			const creds = await this.loadAccountCredentials(accountId);
			if (!creds) return;

			creds.token_count_today = (creds.token_count_today || 0) + tokensUsed;
			creds.last_used = Date.now();
			
			await this.kv.put(`ACCOUNT:${accountId}`, JSON.stringify(creds));
		} catch (error) {
			console.error('Failed to update token usage:', error);
		}
	}

	/**
	 * Mark account as failed temporarily
	 */
	async markAccountAsFailed(accountId: string): Promise<void> {
		console.log(`Marking account ${accountId} as failed`);
		// Could implement temporary blacklisting logic here
	}
}
