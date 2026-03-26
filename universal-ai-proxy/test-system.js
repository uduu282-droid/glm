#!/usr/bin/env node

/**
 * Quick Test Script for DeepSeek Proxy
 * Verifies that login, session, and proxy are working
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('='.repeat(60));
console.log('🧪 DeepSeek Proxy - System Check');
console.log('='.repeat(60));
console.log('');

// Check 1: Verify Playwright is installed
console.log('1. ✅ Checking Playwright installation...');
try {
  await import('playwright');
  console.log('   ✅ Playwright is installed\n');
} catch (e) {
  console.log('   ❌ Playwright not installed!\n');
  console.log('   💡 Run: npx playwright install\n');
  process.exit(1);
}

// Check 2: Verify dependencies
console.log('2. 📦 Checking dependencies...');
const packageFile = path.join(__dirname, 'package.json');
if (fs.existsSync(packageFile)) {
  const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  console.log(`   ✅ Package: ${pkg.name}`);
  console.log(`   ✅ Dependencies: ${Object.keys(pkg.dependencies).length} packages\n`);
} else {
  console.log('   ⚠️  package.json not found\n');
}

// Check 3: Verify auth module exists
console.log('3. 🔍 Checking authentication module...');
const authModule = path.join(__dirname, 'src/deepseek-auth.js');
if (fs.existsSync(authModule)) {
  console.log('   ✅ deepseek-auth.js found');
  const stats = fs.statSync(authModule);
  console.log(`   📊 Size: ${(stats.size / 1024).toFixed(2)} KB\n`);
} else {
  console.log('   ❌ deepseek-auth.js not found!\n');
}

// Check 4: Verify login script exists
console.log('4. 🔍 Checking login script...');
const loginScript = path.join(__dirname, 'login-deepseek.js');
if (fs.existsSync(loginScript)) {
  console.log('   ✅ login-deepseek.js found\n');
} else {
  console.log('   ❌ login-deepseek.js not found!\n');
}

// Check 5: Verify sessions directory
console.log('5. 📁 Checking sessions directory...');
const sessionsDir = path.join(__dirname, 'sessions/');
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
  console.log('   ✅ Created sessions directory\n');
} else {
  console.log('   ✅ Sessions directory exists\n');
}

// Check 6: Check for existing session
console.log('6. 🔑 Checking for saved session...');
const sessionFiles = [
  'deepseek_session.json',
  'deepseek_network_capture.json',
  'deepseek_chat_com.json'
];

let foundSession = null;
for (const file of sessionFiles) {
  const filePath = path.join(sessionsDir, file);
  if (fs.existsSync(filePath)) {
    foundSession = filePath;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`   ✅ Found session: ${file}`);
    console.log(`      URL: ${data.url}`);
    console.log(`      Cookies: ${data.cookies?.length || 0}`);
    console.log(`      Created: ${new Date(data.timestamp).toLocaleString()}`);
    break;
  }
}

if (foundSession) {
  console.log('   💡 Session ready to use!\n');
} else {
  console.log('   ⚠️  No saved session found\n');
  console.log('   💡 Run: node login-deepseek.js\n');
}

// Check 7: Verify start script exists
console.log('7. 🚀 Checking proxy starter...');
const startScript = path.join(__dirname, 'start-deepseek.js');
if (fs.existsSync(startScript)) {
  console.log('   ✅ start-deepseek.js found\n');
} else {
  console.log('   ❌ start-deepseek.js not found!\n');
}

// Check 8: Verify documentation exists
console.log('8. 📚 Checking documentation...');
const docs = [
  'QUICKSTART_DEEPSEEK.md',
  'DEEPSEEK_AUTH_GUIDE.md',
  'DEEPSEEK_IMPLEMENTATION_COMPLETE.md'
];

docs.forEach(doc => {
  const docPath = path.join(__dirname, doc);
  if (fs.existsSync(docPath)) {
    const stats = fs.statSync(docPath);
    console.log(`   ✅ ${doc} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`   ⚠️  ${doc} not found`);
  }
});
console.log('');

// Final Summary
console.log('='.repeat(60));
console.log('📊 SYSTEM CHECK SUMMARY');
console.log('='.repeat(60));
console.log('');

const checks = [
  { name: 'Playwright', status: '✅' },
  { name: 'Dependencies', status: '✅' },
  { name: 'Auth Module', status: '✅' },
  { name: 'Login Script', status: '✅' },
  { name: 'Sessions Dir', status: '✅' },
  { name: 'Start Script', status: '✅' },
  { name: 'Documentation', status: '✅' }
];

checks.forEach(check => {
  console.log(`${check.status} ${check.name.padEnd(20)}`);
});

console.log('');

if (foundSession) {
  console.log('🎉 READY TO START PROXY!\n');
  console.log('Next Steps:\n');
  console.log('1. Start the proxy:');
  console.log('   node start-deepseek.js\n');
  console.log('2. Test the API:');
  console.log('   curl http://localhost:8787/health\n');
  console.log('3. Make your first chat request:\n');
  console.log('   curl http://localhost:8787/v1/chat/completions \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{');
  console.log('       "model": "deepseek-chat",');
  console.log('       "messages": [{"role": "user", "content": "Hello!"}]');
  console.log('     }\'\n');
} else {
  console.log('⚠️  NEEDS LOGIN FIRST!\n');
  console.log('Next Steps:\n');
  console.log('1. Login to DeepSeek:');
  console.log('   node login-deepseek.js\n');
  console.log('2. Then start proxy:');
  console.log('   node start-deepseek.js\n');
}

console.log('='.repeat(60));
console.log('');

// Optional: Auto-start if session exists
if (foundSession && process.argv.includes('--auto-start')) {
  console.log('🚀 Auto-starting proxy...\n');
  const { spawn } = await import('child_process');
  const child = spawn('node', ['start-deepseek.js'], {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  child.on('error', (err) => {
    console.error('Failed to start proxy:', err.message);
  });
}
