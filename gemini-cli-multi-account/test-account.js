// Test script for Gemini account
const fs = require('fs');
const path = require('path');

async function testGeminiAccount() {
  console.log('Testing Gemini account...\n');
  
  // Load credentials
  const credsPath = path.join(__dirname, '.gemini', 'oauth_creds_gemini1.json');
  
  if (!fs.existsSync(credsPath)) {
    console.log('❌ Credentials file not found!');
    return;
  }
  
  const credentials = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
  
  console.log('✅ Credentials loaded successfully');
  console.log(`Token expires: ${new Date(credentials.expiry_date).toLocaleString()}`);
  
  // Check if token is still valid
  const isValid = credentials.expiry_date > Date.now();
  console.log(`Token status: ${isValid ? '✅ Valid' : '❌ Expired'}\n`);
  
  if (!isValid) {
    console.log('Token expired, but refresh token should still work');
  }
  
  // Make test API call to list models
  try {
    console.log('Testing API call to list models...');
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
      headers: {
        'Authorization': `Bearer ${credentials.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`\nResponse status: ${response.status} ${response.ok ? '✅' : '❌'}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`\n✅ SUCCESS! Found ${data.models?.length || 0} models`);
      
      // Show first few models
      if (data.models && data.models.length > 0) {
        console.log('\nAvailable models:');
        data.models.slice(0, 5).forEach(model => {
          console.log(`  - ${model.name}`);
        });
      }
      
      console.log('\n🎉 Account is working! Ready to use.');
    } else {
      const errorText = await response.text();
      console.log(`\n❌ API call failed:`);
      console.log(errorText);
      
      if (response.status === 401) {
        console.log('\n⚠️  Token expired or invalid');
        console.log('You may need to re-authenticate with: gemini login');
      } else if (response.status === 429) {
        console.log('\n⚠️  Quota exceeded (1,000 requests/day limit)');
      }
    }
  } catch (error) {
    console.log(`\n❌ Error during API call:`);
    console.log(error.message);
  }
}

testGeminiAccount();
