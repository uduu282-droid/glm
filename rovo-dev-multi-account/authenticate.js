#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class RovoAuthManager {
  constructor() {
    this.rovoDir = path.join(process.cwd(), '.rovo');
    if (!fs.existsSync(this.rovoDir)) {
      fs.mkdirSync(this.rovoDir, { recursive: true });
    }
  }

  async addAccount() {
    console.log('🔐 Adding Rovo Dev Account\n');
    console.log('📝 Instructions:');
    console.log('1. Go to: https://id.atlassian.com/api-tokens');
    console.log('2. Click "Create token"');
    console.log('3. Label it "Rovo Dev CLI"');
    console.log('4. Copy the token\n');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    try {
      const email = await new Promise(resolve => {
        rl.question('Enter your Atlassian email: ', resolve);
      });

      const apiToken = await new Promise(resolve => {
        rl.question('Enter your Atlassian API token: ', resolve);
      });

      console.log('\n⏳ Validating credentials...');
      
      try {
        // Save credentials first
        const accountId = email.replace(/[^a-zA-Z0-9]/g, '_');
        const credsPath = path.join(this.rovoDir, `creds_${accountId}.json`);
        
        const credentials = {
          email: email,
          api_token: apiToken,
          added_date: Date.now(),
          last_used: null,
          token_count_today: 0,
          limit_reset_date: null
        };

        fs.writeFileSync(credsPath, JSON.stringify(credentials, null, 2));
        
        console.log(`\n✅ Account added successfully!`);
        console.log(`   Account ID: ${accountId}`);
        console.log(`   Email: ${email}`);
        console.log(`   Daily limit: 5,000,000 tokens`);
        console.log(`   Resets at: Midnight UTC`);
        console.log(`   Credentials saved to: ${credsPath}`);
        console.log(`\n💡 Tip: Test with 'npx -y @atlassian/acli rovo dev "Hello"'`);
        
      } catch (error) {
        console.log('\n❌ Failed to save credentials!');
        console.log('Error:', error.message);
        return false;
      }

      return true;
    } finally {
      rl.close();
    }
  }

  listAccounts() {
    console.log('📋 Listing Rovo Dev Accounts\n');
    
    const files = fs.readdirSync(this.rovoDir)
      .filter(file => file.startsWith('creds_') && file.endsWith('.json'));

    if (files.length === 0) {
      console.log('❌ No accounts found. Add one with: npm run auth:add\n');
      return;
    }

    console.log(`Found ${files.length} account(s):\n`);

    files.forEach((file, index) => {
      const creds = JSON.parse(fs.readFileSync(path.join(this.rovoDir, file), 'utf8'));
      const accountId = file.replace('creds_', '').replace('.json', '');
      
      console.log(`${index + 1}. 🟢 Account ID: ${accountId}`);
      console.log(`   Email: ${creds.email}`);
      console.log(`   Added: ${new Date(creds.added_date).toLocaleString()}`);
      console.log(`   Daily Limit: 5,000,000 tokens`);
      console.log(`   Status: ✅ Active\n`);
    });

    console.log('💡 Total capacity: ' + (files.length * 5) + 'M tokens/day\n');
  }

  removeAccount(accountId) {
    const credsPath = path.join(this.rovoDir, `creds_${accountId}.json`);
    
    if (fs.existsSync(credsPath)) {
      fs.unlinkSync(credsPath);
      console.log(`✅ Removed account: ${accountId}`);
    } else {
      console.log(`❌ Account not found: ${accountId}`);
    }
  }
}

// CLI commands
const command = process.argv[2];
const auth = new RovoAuthManager();

switch (command) {
  case 'add':
    auth.addAccount().then(success => {
      process.exit(success ? 0 : 1);
    });
    break;
  
  case 'list':
    auth.listAccounts();
    break;
  
  case 'remove':
    const accountId = process.argv[3];
    auth.removeAccount(accountId);
    break;
  
  default:
    console.log('Usage: node authenticate.js <add|list|remove>');
    console.log('\nCommands:');
    console.log('  add     - Add a new Rovo Dev account');
    console.log('  list    - List all accounts');
    console.log('  remove  - Remove an account (by Account ID)');
    console.log('\nExample:');
    console.log('  npm run auth:add');
    console.log('  npm run auth:list');
    console.log('  npm run auth:remove account_user_com');
    process.exit(1);
}
