#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SecretsManager {
  constructor() {
    this.envPath = path.join(process.cwd(), '.env');
  }

  loadEnvFile() {
    try {
      const envContent = fs.readFileSync(this.envPath, 'utf8');
      const envVars = {};
      
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim();
          }
        }
      });
      
      return envVars;
    } catch (error) {
      throw new Error(`Failed to read .env file: ${error.message}`);
    }
  }

  async updateSecrets() {
    console.log('Updating Cloudflare Worker secrets from .env file...\n');
    
    const envVars = this.loadEnvFile();
    
    if (Object.keys(envVars).length === 0) {
      console.log('No environment variables found in .env file.');
      return;
    }

    console.log('Found the following variables to update:\n');
    for (const [key, value] of Object.entries(envVars)) {
      const maskedValue = value.length > 4 
        ? `${value.substring(0, 2)}...${value.substring(value.length - 2)}`
        : '***';
      console.log(`  - ${key}: ${maskedValue}`);
    }
    
    console.log('\n⚠️  This will update secrets in your Cloudflare Worker.\n');
    
    // Update each secret
    for (const [key, value] of Object.entries(envVars)) {
      console.log(`Updating ${key}...`);
      
      try {
        // Use wrangler secret put command
        const command = `echo "${value}" | wrangler secret put ${key}`;
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${key} updated successfully\n`);
      } catch (error) {
        console.error(`❌ Failed to update ${key}: ${error.message}\n`);
      }
    }
    
    console.log('🎉 Secret update complete!');
  }

  listSecrets() {
    console.log('Listing configured secrets from .env file:\n');
    
    try {
      const envVars = this.loadEnvFile();
      
      if (Object.keys(envVars).length === 0) {
        console.log('No secrets configured in .env file.');
        return;
      }
      
      console.log('Configured secrets:\n');
      for (const [key, value] of Object.entries(envVars)) {
        const maskedValue = value.length > 4 
          ? `${value.substring(0, 2)}...${value.substring(value.length - 2)}`
          : '***';
        console.log(`  ${key}: ${maskedValue}`);
      }
      
      console.log('\n💡 To update these secrets in Cloudflare, run: npm run secrets:update');
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];
const secretsManager = new SecretsManager();

switch (command) {
  case 'list':
    secretsManager.listSecrets();
    break;
    
  default:
    secretsManager.updateSecrets();
    break;
}
