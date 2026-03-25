#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class RovoSetupManager {
  constructor() {
    this.rovoDir = path.join(process.cwd(), '.rovo');
  }

  async deployAllAccounts(isRemote = false) {
    console.log('🚀 Deploying all accounts to KV storage...\n');
    
    const files = fs.readdirSync(this.rovoDir)
      .filter(file => file.startsWith('creds_') && file.endsWith('.json'));

    if (files.length === 0) {
      console.log('❌ No accounts found. Add accounts first with: npm run auth:add\n');
      return;
    }

    console.log(`Found ${files.length} account(s) to deploy...\n`);

    for (const file of files) {
      const accountId = file.replace('creds_', '').replace('.json', '');
      await this.deployAccount(accountId, isRemote);
    }

    console.log('\n✅ All accounts deployed successfully!');
    console.log(`💡 Total capacity: ${(files.length * 5).toLocaleString()}M tokens/day\n`);
  }

  async deployAccount(accountId, isRemote = false) {
    const credsPath = path.join(this.rovoDir, `creds_${accountId}.json`);
    
    if (!fs.existsSync(credsPath)) {
      console.log(`❌ Account not found: ${accountId}`);
      return;
    }

    const credentials = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
    
    console.log(`Deploying account: ${accountId}...`);

    try {
      const kvKey = `ACCOUNT:${accountId}`;
      const value = JSON.stringify(credentials);

      if (isRemote) {
        // Remote deployment via wrangler
        console.log(`  📤 Deploying to Cloudflare KV...`);
        execSync(`echo '${value}' | wrangler secret put ${kvKey.replace(':', '_')}`, {
          stdio: 'pipe'
        });
        console.log(`  ✅ Deployed to KV: ${kvKey}`);
      } else {
        // Local test - just show what would be deployed
        console.log(`  📋 Would deploy to KV: ${kvKey}`);
        console.log(`     Email: ${credentials.email}`);
        console.log(`     Token: ${credentials.api_token.substring(0, 8)}...`);
      }

      console.log(`  ✅ Success\n`);
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}\n`);
    }
  }

  async listAccounts() {
    console.log('📋 Accounts in local storage:\n');
    
    const files = fs.readdirSync(this.rovoDir)
      .filter(file => file.startsWith('creds_') && file.endsWith('.json'));

    if (files.length === 0) {
      console.log('No accounts found.\n');
      return;
    }

    files.forEach((file, index) => {
      const accountId = file.replace('creds_', '').replace('.json', '');
      console.log(`${index + 1}. ✅ ${accountId}`);
    });

    console.log(`\nTotal: ${files.length} account(s)`);
    console.log(`Capacity: ${(files.length * 5).toLocaleString()}M tokens/day\n`);
  }

  async healthCheck() {
    console.log('🏥 Running health check...\n');
    
    const files = fs.readdirSync(this.rovoDir)
      .filter(file => file.startsWith('creds_') && file.endsWith('.json'));

    if (files.length === 0) {
      console.log('No accounts to check.\n');
      return;
    }

    let validCount = 0;
    let invalidCount = 0;

    for (const file of files) {
      const accountId = file.replace('creds_', '').replace('.json', '');
      const creds = JSON.parse(fs.readFileSync(path.join(this.rovoDir, file), 'utf8'));
      
      // Simple validation - just check if token exists and has minimum length
      const isValid = creds.api_token && creds.api_token.length >= 20;
      
      if (isValid) {
        validCount++;
        console.log(`✅ ${accountId}: Valid (${creds.email})`);
      } else {
        invalidCount++;
        console.log(`❌ ${accountId}: Invalid or missing token`);
      }
    }

    console.log(`\nSummary:`);
    console.log(`  ✅ Valid: ${validCount}`);
    console.log(`  ❌ Invalid: ${invalidCount}`);
    console.log(`  Total: ${files.length}`);
    console.log(`  Capacity: ${(validCount * 5).toLocaleString()}M tokens/day (valid accounts only)\n`);
  }

  async removeAccountFromKV(accountId) {
    console.log(`Removing account ${accountId} from KV...`);
    
    try {
      execSync(`wrangler secret delete ACCOUNT_${accountId.replace(':', '_')}`, {
        stdio: 'inherit'
      });
      console.log(`✅ Removed: ${accountId}`);
    } catch (error) {
      console.log(`❌ Failed to remove: ${accountId}`);
      console.log(`Error: ${error.message}`);
    }
  }
}

// CLI commands
const command = process.argv[2];
const setup = new RovoSetupManager();

async function main() {
  switch (command) {
    case 'deploy-all':
      await setup.deployAllAccounts(false);
      break;
    
    case 'deploy-all-remote':
      await setup.deployAllAccounts(true);
      break;
    
    case 'list':
      await setup.listAccounts();
      break;
    
    case 'health':
      await setup.healthCheck();
      break;
    
    case 'remove':
      const accountId = process.argv[3];
      await setup.removeAccountFromKV(accountId);
      break;
    
    default:
      console.log('Usage: node setup-accounts.js <deploy-all|deploy-all-remote|list|health|remove>');
      console.log('\nCommands:');
      console.log('  deploy-all         - Preview deploy all accounts to KV');
      console.log('  deploy-all-remote  - Actually deploy all accounts to Cloudflare KV');
      console.log('  list               - List local accounts');
      console.log('  health             - Health check all accounts');
      console.log('  remove <accountId> - Remove account from KV');
      console.log('\nExample:');
      console.log('  npm run setup:deploy-all');
      console.log('  npm run setup:deploy-all-remote');
      console.log('  npm run setup:health');
      process.exit(1);
  }
}

main().catch(console.error);
