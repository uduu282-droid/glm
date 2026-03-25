#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const qrcode = require('qrcode-terminal');
const open = require('open');

class GeminiAuthManager {
  constructor() {
    this.geminiDir = path.join(process.cwd(), '.gemini');
    // Gemini CLI OAuth Configuration
    // Using credentials from the official gemini-cli project
    this.oauthBaseUrl = 'https://accounts.google.com';
    this.clientId = '68125469507-17sidq3vkfe5dvt8btt76f2s9hnlbrnu.apps.googleusercontent.com';
    this.clientSecret = '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';
    this.scope = 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/userinfo.email openid';
    this.redirectUri = 'http://localhost:8085/callback';
  }

  async ensureDir() {
    try {
      await fs.mkdir(this.geminiDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }

  generateState() {
    return crypto.randomBytes(32).toString('hex');
  }

  generateCodeVerifier() {
    return crypto.randomBytes(32).toString('base64url');
  }

  generateCodeChallenge(verifier) {
    return crypto.createHash('sha256').update(verifier).digest('base64url');
  }

  getAuthorizationUrl(state, codeChallenge) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scope,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `${this.oauthBaseUrl}/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForTokens(code, codeVerifier) {
    const response = await fetch(`${this.oauthBaseUrl}/o/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${response.statusText}. Response: ${errorData}`);
    }

    const data = await response.json();
    
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      id_token: data.id_token,
    };
  }

  async startInteractiveAuth(accountId) {
    console.log('\n=== Gemini CLI OAuth Authentication ===');
    
    const state = this.generateState();
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);
    const authUrl = this.getAuthorizationUrl(state, codeChallenge);

    console.log('\nOpening browser for authentication...');
    console.log('If browser doesn\'t open, visit:');
    console.log(authUrl);

    // Try to open browser
    try {
      await open(authUrl);
    } catch (error) {
      console.log('Failed to open browser automatically. Please visit the URL above.');
    }

    // For CLI-based auth, we need to wait for callback
    // This is a simplified version - in production you'd run a local server
    console.log('\n⚠️  IMPORTANT: After authentication, you\'ll be redirected to localhost:8085');
    console.log('Copy the "code" parameter from the URL and paste it below:\n');

    return new Promise((resolve, reject) => {
      process.stdout.write('Enter authorization code: ');
      
      process.stdin.once('data', async (data) => {
        const code = data.toString().trim();
        
        if (!code) {
          reject(new Error('No code provided'));
          return;
        }

        try {
          const tokens = await this.exchangeCodeForTokens(code, codeVerifier);
          
          // Convert to credentials format
          const credentials = {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            token_type: tokens.token_type,
            expiry_date: Date.now() + (tokens.expires_in * 1000),
            id_token: tokens.id_token,
          };

          // Save credentials
          await this.saveAccountCredentials(accountId, credentials);
          
          console.log(`\n🎉 Authentication successful for account ${accountId}!`);
          console.log(`Credentials saved to ./.gemini/oauth_creds_${accountId}.json`);
          
          resolve(credentials);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async saveAccountCredentials(accountId, credentials) {
    await this.ensureDir();
    const filePath = path.join(this.geminiDir, `oauth_creds_${accountId}.json`);
    await fs.writeFile(filePath, JSON.stringify(credentials, null, 2));
  }

  async loadAccountCredentials(accountId) {
    try {
      const filePath = path.join(this.geminiDir, `oauth_creds_${accountId}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }

  async loadAllAccounts() {
    await this.ensureDir();
    try {
      const files = await fs.readdir(this.geminiDir);
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

  isTokenValid(credentials) {
    return credentials && credentials.expiry_date > Date.now();
  }

  async removeAccount(accountId) {
    const filePath = path.join(this.geminiDir, `oauth_creds_${accountId}.json`);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Account ${accountId} not found`);
      }
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    const response = await fetch(`${this.oauthBaseUrl}/o/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Token refresh failed: ${response.status} ${response.statusText}. Response: ${errorData}`);
    }

    const data = await response.json();
    
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken,
      token_type: data.token_type,
      expires_in: data.expires_in,
    };
  }
}

async function listAccounts() {
  console.log('Listing all Gemini accounts...');
  
  try {
    const authManager = new GeminiAuthManager();
    const accountIds = await authManager.loadAllAccounts();
    
    if (accountIds.length === 0) {
      console.log('No accounts found in ./.gemini/ directory.');
      return;
    }
    
    console.log(`\nFound ${accountIds.length} account(s):\n`);
    
    for (const accountId of accountIds) {
      const credentials = await authManager.loadAccountCredentials(accountId);
      const isValid = authManager.isTokenValid(credentials);
      
      console.log(`Account ID: ${accountId}`);
      console.log(`  Status: ${isValid ? '✅ Valid' : '❌ Invalid/Expired'}`);
      if (credentials && credentials.expiry_date) {
        const expiry = new Date(credentials.expiry_date);
        console.log(`  Expires: ${expiry.toLocaleString()}`);
      }
      console.log('');
    }
  } catch (error) {
    console.error('Failed to list accounts:', error.message);
    process.exit(1);
  }
}

async function addAccount(accountId) {
  console.log(`Adding new Gemini account with ID: ${accountId}...`);
  
  try {
    const authManager = new GeminiAuthManager();
    await authManager.startInteractiveAuth(accountId);
  } catch (error) {
    console.error('Authentication failed:', error.message);
    process.exit(1);
  }
}

async function removeAccount(accountId) {
  console.log(`Removing Gemini account with ID: ${accountId}...`);
  
  try {
    const authManager = new GeminiAuthManager();
    await authManager.removeAccount(accountId);
    console.log(`\n✅ Account ${accountId} removed successfully!`);
  } catch (error) {
    console.error('Failed to remove account:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'list':
    listAccounts();
    break;
  case 'add':
    if (!args[1]) {
      console.error('Please provide an account ID: node authenticate.js add <account-id>');
      process.exit(1);
    }
    addAccount(args[1]);
    break;
  case 'remove':
    if (!args[1]) {
      console.error('Please provide an account ID: node authenticate.js remove <account-id>');
      process.exit(1);
    }
    removeAccount(args[1]);
    break;
  default:
    console.log('Usage: node authenticate.js [list|add <account-id>|remove <account-id>]');
    console.log('  list                - List all accounts');
    console.log('  add <account-id>    - Add a new account with the specified ID');
    console.log('  remove <account-id> - Remove an existing account with the specified ID');
    process.exit(1);
}
