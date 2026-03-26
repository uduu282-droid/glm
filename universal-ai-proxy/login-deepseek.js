import { chromium } from 'playwright';
import DeepSeekAuth from './src/deepseek-auth.js';
import fs from 'fs';

/**
 * DeepSeek Login Script with Email/Password
 * Uses the authentication flow captured from network logs
 */
async function loginToDeepSeek() {
  console.log('='.repeat(60));
  console.log('🔐 DeepSeek Authentication System');
  console.log('='.repeat(60));
  console.log('');
  
  // Credentials from your network capture
  const credentials = {
    email: 'eres3022@gmail.com',
    password: 'ronit@5805'
  };
  
  console.log('📧 Email:', credentials.email);
  console.log('🔑 Password: [HIDDEN]\n');
  
  const auth = new DeepSeekAuth();
  
  try {
    // Perform complete login flow
    const sessionData = await auth.login(credentials.email, credentials.password);
    
    // Save session
    const sessionFile = auth.saveSession();
    
    console.log('='.repeat(60));
    console.log('✨ LOGIN COMPLETED!\n');
    console.log('📊 Session Summary:\n');
    console.log(`   - URL: ${sessionData.url}`);
    console.log(`   - Cookies: ${sessionData.cookies.length}`);
    console.log(`   - LocalStorage items: ${Object.keys(sessionData.localStorage).length}`);
    console.log(`   - Session ID: ${sessionData.sessionId}`);
    console.log(`   - PoW Challenge: ${sessionData.powChallenge ? 'Captured' : 'Will generate on chat'}`);
    console.log('');
    console.log('💾 Saved to:', sessionFile);
    console.log('='.repeat(60));
    console.log('');
    console.log('🚀 Next Steps:\n');
    console.log('1. Start the proxy server:');
    console.log('   node start-deepseek.js\n');
    console.log('2. Or use directly with universal proxy:');
    console.log('   node src/index.js https://chat.deepseek.com\n');
    console.log('');
    console.log('3. Test the API:');
    console.log('   curl http://localhost:8787/v1/chat/completions \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{');
    console.log('       "model": "deepseek-chat",');
    console.log('       "messages": [{"role": "user", "content": "Hello!"}]');
    console.log('     }\'\n');
    console.log('');
    
    // Keep browser open for verification
    console.log('⏳ Browser will close in 5 seconds...\n');
    await auth.sleep(5000);
    await auth.close();
    
  } catch (error) {
    console.error('\n❌ Login failed:', error.message);
    console.error('\n💡 Troubleshooting:\n');
    console.error('   - Check if credentials are correct');
    console.error('   - DeepSeek may have captcha or 2FA');
    console.error('   - Try manual login in the browser window\n');
    
    if (auth.browser) {
      console.log('👀 Browser kept open for debugging\n');
      console.log('Press ENTER to close...\n');
      await auth.waitForManualConfirmation();
      await auth.close();
    }
    
    process.exit(1);
  }
}

// Run the login
loginToDeepSeek().catch(console.error);
