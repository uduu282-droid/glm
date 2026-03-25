#!/usr/bin/env node

/**
 * Auto Token Refresh System for Qwen Worker Proxy
 * 
 * This script automatically refreshes expired OAuth tokens for all configured accounts.
 * It uses the refresh_token grant type to get new access tokens without user interaction.
 * 
 * Usage:
 *   node auto-refresh-tokens.js              # Refresh all accounts
 *   node auto-refresh-tokens.js --watch      # Run continuously, checking every 5 minutes
 *   node auto-refresh-tokens.js account1     # Refresh specific account
 */

const fs = require('fs').promises;
const path = require('path');

class QwenTokenRefresher {
  constructor() {
    this.qwenDir = path.join(process.cwd(), '.qwen');
    // Qwen OAuth Configuration
    this.oauthBaseUrl = 'https://chat.qwen.ai';
    this.tokenEndpoint = `${this.oauthBaseUrl}/api/v1/oauth2/token`;
    this.clientId = 'f0304373b74a44d2b584a3fb70ca9e56';
  }

  async ensureDir() {
    try {
      await fs.mkdir(this.qwenDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }

  /**
   * Load credentials for a specific account
   */
  async loadAccountCredentials(accountId) {
    try {
      const filePath = path.join(this.qwenDir, `oauth_creds_${accountId}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }

  /**
   * Load all accounts from .qwen directory
   */
  async loadAllAccounts() {
    await this.ensureDir();
    try {
      const files = await fs.readdir(this.qwenDir);
      const accountFiles = files.filter(file => 
        file.startsWith('oauth_creds_') && file.endsWith('.json')
      );
      
      return accountFiles.map(file => 
        file.replace('oauth_creds_', '').replace('.json', '')
      );
    } catch (error) {
      return [];
    }
  }

  /**
   * Save updated credentials back to file
   */
  async saveAccountCredentials(accountId, credentials) {
    await this.ensureDir();
    const filePath = path.join(this.qwenDir, `oauth_creds_${accountId}.json`);
    await fs.writeFile(filePath, JSON.stringify(credentials, null, 2));
    console.log(`✅ Saved updated credentials for ${accountId}`);
  }

  /**
   * Check if token is expired or about to expire (within 5 minutes)
   */
  isTokenExpiring(credentials, bufferMinutes = 5) {
    if (!credentials || !credentials.expiry_date) return true;
    
    const now = Date.now();
    const bufferMs = bufferMinutes * 60 * 1000;
    return credentials.expiry_date <= (now + bufferMs);
  }

  /**
   * Refresh access token using refresh_token
   */
  async refreshToken(refreshToken) {
    console.log('🔄 Requesting new access token...');
    
    const bodyData = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.clientId,
      refresh_token: refreshToken,
    });

    try {
      const response = await fetch(this.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: bodyData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Token refresh failed: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`
        );
      }

      const tokenData = await response.json();
      
      if (!tokenData.access_token) {
        throw new Error('No access_token received in refresh response');
      }

      console.log('✅ Token refresh successful!');
      
      // Preserve existing fields that might not be returned in refresh response
      const updatedCredentials = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || refreshToken, // Keep old if not provided
        token_type: tokenData.token_type || 'Bearer',
        resource_url: tokenData.resource_url || tokenData.endpoint || credentials.resource_url,
        expiry_date: tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : undefined,
        scope: tokenData.scope || credentials.scope || 'openid profile email model.completion', // Default scope
        id_token: tokenData.id_token || credentials.id_token || '', // Preserve or default
      };
      
      return updatedCredentials;
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  /**
   * Refresh tokens for a specific account
   */
  async refreshAccount(accountId, force = false) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing account: ${accountId}`);
    console.log('='.repeat(60));
    
    const credentials = await this.loadAccountCredentials(accountId);
    
    if (!credentials) {
      console.log(`⚠️  No credentials found for ${accountId}, skipping...`);
      return { success: false, reason: 'not_found' };
    }

    // Check if token needs refresh
    if (!force && !this.isTokenExpiring(credentials)) {
      const expiresIn = Math.round((credentials.expiry_date - Date.now()) / 1000 / 60);
      console.log(`✅ Token still valid for ${expiresIn} minutes, skipping refresh`);
      return { success: true, reason: 'still_valid' };
    }

    if (!credentials.refresh_token) {
      console.log('❌ No refresh_token available. Please re-authenticate manually.');
      return { success: false, reason: 'no_refresh_token' };
    }

    try {
      // Refresh the token
      const newCredentials = await this.refreshToken(credentials.refresh_token);
      
      // Update expiry if not provided
      if (!newCredentials.expiry_date) {
        // Default to 1 hour if expires_in not provided
        newCredentials.expiry_date = Date.now() + (3600 * 1000);
        console.log('ℹ️  No expires_in provided, setting default expiry to 1 hour');
      }

      // Save updated credentials
      await this.saveAccountCredentials(accountId, newCredentials);
      
      const expiresIn = Math.round((newCredentials.expiry_date - Date.now()) / 1000 / 60);
      console.log(`🎉 New token valid for ${expiresIn} minutes`);
      
      return { success: true, reason: 'refreshed' };
    } catch (error) {
      console.error(`❌ Failed to refresh ${accountId}: ${error.message}`);
      console.error('💡 You may need to re-authenticate this account manually.');
      return { success: false, reason: 'refresh_failed', error: error.message };
    }
  }

  /**
   * Refresh all accounts
   */
  async refreshAllAccounts() {
    console.log('🔍 Scanning for Qwen accounts...\n');
    
    const accounts = await this.loadAllAccounts();
    
    if (accounts.length === 0) {
      console.log('❌ No accounts found. Please add accounts first using:');
      console.log('   npm run auth:add <account-id>\n');
      return;
    }

    console.log(`Found ${accounts.length} account(s): ${accounts.join(', ')}\n`);

    const results = {
      refreshed: [],
      still_valid: [],
      failed: [],
      not_found: [],
    };

    // Process each account
    for (const accountId of accounts) {
      const result = await this.refreshAccount(accountId);
      
      switch (result.reason) {
        case 'refreshed':
          results.refreshed.push(accountId);
          break;
        case 'still_valid':
          results.still_valid.push(accountId);
          break;
        case 'not_found':
          results.not_found.push(accountId);
          break;
        case 'no_refresh_token':
        case 'refresh_failed':
          results.failed.push(accountId);
          break;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 REFRESH SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Refreshed: ${results.refreshed.length} - ${results.refreshed.join(', ') || 'none'}`);
    console.log(`⏭️  Skipped (valid): ${results.still_valid.length} - ${results.still_valid.join(', ') || 'none'}`);
    console.log(`❌ Failed: ${results.failed.length} - ${results.failed.join(', ') || 'none'}`);
    if (results.not_found.length > 0) {
      console.log(`⚠️  Not found: ${results.not_found.length} - ${results.not_found.join(', ')}`);
    }
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Watch mode - continuously monitor and refresh tokens
   */
  async watchMode(checkIntervalMinutes = 5) {
    console.log('👁️  Starting watch mode...');
    console.log(`📅 Checking every ${checkIntervalMinutes} minutes\n`);
    console.log('Press Ctrl+C to stop\n');

    const checkLoop = async () => {
      while (true) {
        const now = new Date().toLocaleString();
        console.log(`\n[${now}] Running scheduled token check...`);
        await this.refreshAllAccounts();
        
        console.log(`⏳ Next check in ${checkIntervalMinutes} minutes...\n`);
        await new Promise(resolve => setTimeout(resolve, checkIntervalMinutes * 60 * 1000));
      }
    };

    await checkLoop();
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const refresher = new QwenTokenRefresher();

  const watchMode = args.includes('--watch');
  const specificAccount = args.find(arg => !arg.startsWith('--'));

  if (watchMode) {
    // Continuous monitoring mode
    await refresher.watchMode();
  } else if (specificAccount) {
    // Refresh specific account
    console.log(`🔄 Refreshing account: ${specificAccount}`);
    await refresher.refreshAccount(specificAccount, true);
  } else {
    // Refresh all accounts once
    await refresher.refreshAllAccounts();
  }
}

// Handle errors gracefully
main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
