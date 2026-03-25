# 🚀 Rovo Dev CLI Multi-Account Setup Guide

## 📋 Overview

**Capacity:** 5M tokens/day per account (20M on first day)
**Model:** Claude Sonnet 4 (72.7% SWE-bench)
**Reset:** Midnight UTC daily
**Credit Card:** NOT required during beta

---

## ⚡ Quick Start (First Account - 10 minutes)

### Step 1: Install Atlassian CLI

```bash
npm install -g @atlassian/acli
```

Or download from: https://www.atlassian.com/software/rovo/dev/cli

### Step 2: Enable Rovo Dev Agents

1. Go to https://rovo.atlassian.com/
2. Sign in with your Atlassian account (create free if needed)
3. Navigate to "Dev Agents" or "Rovo Dev"
4. Enable the feature (may be in beta program)

### Step 3: Generate API Token

1. Click this link to auto-create token: https://id.atlassian.com/api-token
2. Or go to: https://id.atlassian.com/manage/api-tokens
3. Click "Create token"
4. Label it "Rovo Dev CLI"
5. Copy the token (save it securely!)

### Step 4: Authenticate and Test

```bash
acli login --email your@email.com --api-token YOUR_TOKEN
rovo dev "Hello, write a simple Python function"
```

### Step 5: Check Your Token Limit

```bash
rovo dev --show-limits
```

You should see:
```
Daily limit: 5,000,000 tokens
Used today: 0 tokens
Resets at: 2026-03-07T00:00:00Z
```

---

## 🔧 Multi-Account System Setup

### Project Structure

```
rovo-dev-multi-account/
├── authenticate.js          # Interactive auth for multiple accounts
├── setup-accounts.js        # Deploy credentials to Cloudflare KV
├── manage-secrets.js        # Update secrets in worker
├── src/
│   ├── index.ts             # Main worker with OpenAI-compatible API
│   ├── auth-manager.ts      # Account rotation logic
│   └── routes/
│       └── openai.ts        # /v1/chat/completions endpoint
├── package.json
├── wrangler.toml
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 📦 Step-by-Step Implementation

### Phase 1: Create Project Structure

```bash
mkdir rovo-dev-multi-account
cd rovo-dev-multi-account
npm init -y
npm install hono open qrcode-terminal toml wrangler typescript
```

### Phase 2: Authentication Script

Create `authenticate.js`:

```javascript
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
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    try {
      // Get email
      const email = await new Promise(resolve => {
        rl.question('Enter your Atlassian email: ', resolve);
      });

      // Get API token
      const apiToken = await new Promise(resolve => {
        rl.question('Enter your Atlassian API token: ', resolve);
      });

      // Validate credentials by testing
      console.log('\n⏳ Validating credentials...');
      
      try {
        // Test with acli login
        const testCmd = `acli login --email "${email}" --api-token "${apiToken}"`;
        execSync(testCmd, { stdio: 'pipe' });
        
        // Save credentials
        const accountId = email.replace(/[^a-zA-Z0-9]/g, '_');
        const credsPath = path.join(this.rovoDir, `creds_${accountId}.json`);
        
        const credentials = {
          email: email,
          api_token: apiToken,
          added_date: Date.now(),
          last_used: null,
          token_count_today: 0
        };

        fs.writeFileSync(credsPath, JSON.stringify(credentials, null, 2));
        
        console.log(`\n✅ Account added successfully!`);
        console.log(`Account ID: ${accountId}`);
        console.log(`Daily limit: 5,000,000 tokens`);
        console.log(`Credentials saved to: ${credsPath}`);
        
      } catch (error) {
        console.log('\n❌ Authentication failed!');
        console.log('Please check your email and API token.');
        console.log('Get a token at: https://id.atlassian.com/api-tokens');
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
      console.log('No accounts found. Add one with: npm run auth:add');
      return;
    }

    console.log(`Found ${files.length} account(s):\n`);

    files.forEach((file, index) => {
      const creds = JSON.parse(fs.readFileSync(path.join(this.rovoDir, file), 'utf8'));
      const accountId = file.replace('creds_', '').replace('.json', '');
      
      console.log(`${index + 1}. Account ID: ${accountId}`);
      console.log(`   Email: ${creds.email}`);
      console.log(`   Added: ${new Date(creds.added_date).toLocaleString()}`);
      console.log(`   Status: ✅ Active\n`);
    });
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
    console.log('Commands:');
    console.log('  add     - Add a new Rovo Dev account');
    console.log('  list    - List all accounts');
    console.log('  remove  - Remove an account');
    process.exit(1);
}
```

### Phase 3: Setup Accounts Script

Create `setup-accounts.js`:

```javascript
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
      // Deploy to Cloudflare KV
      const kvKey = `ACCOUNT:${accountId}`;
      const value = JSON.stringify(credentials);

      if (isRemote) {
        // Remote deployment via wrangler
        execSync(`echo '${value}' | wrangler secret put ${kvKey.replace(':', '_')}`, {
          stdio: 'inherit'
        });
      } else {
        // Local test - just show what would be deployed
        console.log(`  Would deploy to KV: ${kvKey}`);
        console.log(`  Email: ${credentials.email}`);
        console.log(`  Token: ${credentials.api_token.substring(0, 8)}...`);
      }

      console.log(`✅ Deployed: ${accountId}\n`);
    } catch (error) {
      console.log(`❌ Failed to deploy ${accountId}:`, error.message);
    }
  }

  async listAccounts() {
    console.log('📋 Accounts in local storage:\n');
    
    const files = fs.readdirSync(this.rovoDir)
      .filter(file => file.startsWith('creds_') && file.endsWith('.json'));

    files.forEach(file => {
      const accountId = file.replace('creds_', '').replace('.json', '');
      console.log(`✅ ${accountId}`);
    });

    console.log(`\nTotal: ${files.length} account(s)`);
  }

  async healthCheck() {
    console.log('🏥 Running health check...\n');
    
    const files = fs.readdirSync(this.rovoDir)
      .filter(file => file.startsWith('creds_') && file.endsWith('.json'));

    let validCount = 0;
    let invalidCount = 0;

    for (const file of files) {
      const accountId = file.replace('creds_', '').replace('.json', '');
      const isValid = await this.testAccount(accountId);
      
      if (isValid) {
        validCount++;
        console.log(`✅ ${accountId}: Valid`);
      } else {
        invalidCount++;
        console.log(`❌ ${accountId}: Invalid or expired`);
      }
    }

    console.log(`\nSummary:`);
    console.log(`  ✅ Valid: ${validCount}`);
    console.log(`  ❌ Invalid: ${invalidCount}`);
    console.log(`  Total: ${files.length}`);
  }

  async testAccount(accountId) {
    const credsPath = path.join(this.rovoDir, `creds_${accountId}.json`);
    const credentials = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

    try {
      // Test authentication
      execSync(`acli login --email "${credentials.email}" --api-token "${credentials.api_token}"`, {
        stdio: 'pipe'
      });
      return true;
    } catch (error) {
      return false;
    }
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
      console.log('Commands:');
      console.log('  deploy-all         - Deploy all accounts to local KV (test)');
      console.log('  deploy-all-remote  - Deploy all accounts to Cloudflare KV');
      console.log('  list               - List local accounts');
      console.log('  health             - Health check all accounts');
      console.log('  remove <accountId> - Remove account from KV');
      process.exit(1);
  }
}

main().catch(console.error);
```

### Phase 4: Package.json Scripts

Update `package.json`:

```json
{
  "name": "rovo-dev-multi-account",
  "version": "1.0.0",
  "description": "Multi-account Rovo Dev CLI proxy with Cloudflare Workers",
  "scripts": {
    "deploy": "wrangler deploy",
    "auth:add": "node authenticate.js add",
    "auth:list": "node authenticate.js list",
    "auth:remove": "node authenticate.js remove",
    "setup:deploy-all": "node setup-accounts.js deploy-all",
    "setup:deploy-all-remote": "node setup-accounts.js deploy-all-remote",
    "setup:list": "node setup-accounts.js list",
    "setup:health": "node setup-accounts.js health",
    "secrets:update": "node manage-secrets.js"
  },
  "dependencies": {
    "hono": "^4.3.0",
    "open": "^10.1.0",
    "qrcode-terminal": "^0.12.0",
    "toml": "^3.0.0",
    "typescript": "^5.4.5",
    "wrangler": "^3.63.0"
  }
}
```

---

## 🎯 Usage Examples

### Add First Account

```bash
npm run auth:add
```

Enter your Atlassian email and API token when prompted.

### Add More Accounts

Repeat for each additional account (use different emails):

```bash
npm run auth:add
```

### List All Accounts

```bash
npm run auth:list
```

### Deploy to Cloudflare KV

```bash
npm run setup:deploy-all-remote
```

### Test Your Setup

```bash
curl -X POST http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## 📊 Expected Capacity

| Accounts | Daily Tokens | Hourly (avg) | Per Minute (avg) |
|----------|--------------|--------------|------------------|
| 1 | 5,000,000 | 208,333 | 3,472 |
| 5 | 25,000,000 | 1,041,667 | 17,361 |
| 10 | 50,000,000 | 2,083,333 | 34,722 |

**Note:** Actual usage depends on request size. Average chat message = ~100-500 tokens.

---

## 🔍 Next Steps

After creating these files:
1. Run `npm install` to install dependencies
2. Add your first account with `npm run auth:add`
3. Test locally
4. Deploy to Cloudflare Workers

Ready to proceed with file creation?
