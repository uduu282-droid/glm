// Gemini Authentication Manager for Cloudflare Workers

import type { AccountCredentials, TokenRefreshResult, AccountHealthStatus } from './types';

export class GeminiAuthManager {
  private kv: KVNamespace;

  constructor(kvNamespace: KVNamespace) {
    this.kv = kvNamespace;
  }

  /**
   * Get all account IDs from KV
   */
  async getAllAccountIds(): Promise<string[]> {
    const keys = await this.kv.list({ prefix: 'ACCOUNT:' });
    return keys.keys.map(key => key.name.replace('ACCOUNT:', ''));
  }

  /**
   * Load credentials for a specific account
   */
  async loadAccountCredentials(accountId: string): Promise<AccountCredentials | null> {
    try {
      const data = await this.kv.get(`ACCOUNT:${accountId}`);
      return data as AccountCredentials | null;
    } catch (error) {
      console.error(`Failed to load credentials for ${accountId}:`, error);
      return null;
    }
  }

  /**
   * Check if token is valid (not expired)
   */
  isTokenValid(credentials: AccountCredentials | null): boolean {
    if (!credentials) return false;
    return credentials.expiry_date > Date.now();
  }

  /**
   * Refresh an expired token
   */
  async refreshToken(accountId: string, refreshToken: string): Promise<TokenRefreshResult> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: '76408527936-qkdgtnv1fqscc96gvqmsvk1o3j8bqc79.apps.googleusercontent.com',
          client_secret: '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',
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      const newCredentials: AccountCredentials = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken,
        token_type: data.token_type,
        expiry_date: Date.now() + (data.expires_in * 1000),
        id_token: data.id_token,
      };

      // Save updated credentials to KV
      await this.kv.put(`ACCOUNT:${accountId}`, JSON.stringify(newCredentials));

      return {
        success: true,
        credentials: newCredentials,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Select an account using probability-based selection
   */
  async selectAccount(): Promise<AccountCredentials | null> {
    const accounts = await this.getAllAccountIds();
    
    if (accounts.length === 0) {
      return null;
    }

    // Load all credentials
    const accountsWithCreds: Array<{ accountId: string; creds: AccountCredentials; minutesLeft: number }> = [];
    
    for (const accountId of accounts) {
      const creds = await this.loadAccountCredentials(accountId);
      if (!creds) continue;

      const minutesLeft = (creds.expiry_date - Date.now()) / 60000;
      accountsWithCreds.push({ accountId, creds, minutesLeft });
    }

    if (accountsWithCreds.length === 0) {
      return null;
    }

    // Find freshest account (most time left)
    const freshestMinutes = Math.max(...accountsWithCreds.map(a => a.minutesLeft));

    // Probability-based selection
    const weighted = accountsWithCreds.map(account => {
      let probability: number;
      
      if (account.minutesLeft < 0) {
        // Expired: 10% chance (triggers proactive refresh)
        probability = 0.1;
      } else if (account.minutesLeft === freshestMinutes) {
        // Freshest: 85% probability
        probability = 0.85;
      } else if (account.minutesLeft > 30) {
        probability = 0.7;
      } else if (account.minutesLeft > 20) {
        probability = 0.5;
      } else if (account.minutesLeft > 10) {
        probability = 0.3;
      } else if (account.minutesLeft > 5) {
        probability = 0.1;
      } else {
        probability = 0.05;
      }

      return { ...account, probability };
    });

    // Weighted random selection
    const selected = this.weightedRandomSelect(weighted);

    // Handle expired account with proactive refresh
    if (selected && selected.minutesLeft < 0) {
      try {
        console.log(`Proactive refresh for ${selected.accountId}...`);
        const refreshResult = await this.refreshToken(selected.accountId, selected.creds.refresh_token);
        
        if (refreshResult.success && refreshResult.credentials) {
          selected.creds = refreshResult.credentials;
        }
      } catch (refreshError) {
        console.log(`Refresh failed for ${selected.accountId}, using fallback`);
      }
    }

    return selected ? selected.creds : null;
  }

  /**
   * Weighted random selection
   */
  private weightedRandomSelect<T extends { probability: number }>(items: T[]): T {
    const totalWeight = items.reduce((sum, item) => sum + item.probability, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of items) {
      random -= item.probability;
      if (random <= 0) {
        return item;
      }
    }
    
    return items[items.length - 1];
  }

  /**
   * Perform health check on all accounts
   */
  async healthCheck(): Promise<AccountHealthStatus[]> {
    const accounts = await this.getAllAccountIds();
    const results: AccountHealthStatus[] = [];

    for (const accountId of accounts) {
      const creds = await this.loadAccountCredentials(accountId);
      
      if (!creds) {
        results.push({
          account: accountId,
          status: 'missing_credentials',
        });
        continue;
      }

      const isExpired = creds.expiry_date < Date.now();
      const expiresIn = Math.floor((creds.expiry_date - Date.now()) / 60000);

      // Auto-refresh if expired
      if (isExpired && creds.refresh_token) {
        try {
          const refreshResult = await this.refreshToken(accountId, creds.refresh_token);
          if (refreshResult.success && refreshResult.credentials) {
            Object.assign(creds, refreshResult.credentials);
          }
        } catch (error) {
          results.push({
            account: accountId,
            status: 'error',
            error: `Refresh failed: ${error instanceof Error ? error.message : String(error)}`,
          });
          continue;
        }
      }

      // Make test API call
      try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
          headers: {
            'Authorization': `Bearer ${creds.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        let status: AccountHealthStatus['status'] = 'healthy';
        if (response.status === 429) {
          status = 'quota_exceeded';
        } else if (!response.ok) {
          status = 'error';
        }

        results.push({
          account: accountId,
          status,
          expiresIn: `${expiresIn} min`,
          error: response.ok ? null : await response.text(),
        });
      } catch (error) {
        results.push({
          account: accountId,
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }
}
