/**
 * OpenSourceGen - Firebase Auth Tester
 * 
 * Tests the actual Firebase authentication flow
 */

const axios = require('axios');

async function testFirebaseAuth() {
  console.log('🔍 Testing Firebase Authentication Flow\n');
  console.log('=' .repeat(70));
  
  // Firebase config from our analysis
  const firebaseConfig = {
    apiKey: "AIzaSyBmPLymGM3ZquLnZvEIYwp53R3mkmIte0Y",
    projectId: "opensourcegen-prod",
    appId: "1:755065672131:web:ea964e140fa05a76ecad76"
  };
  
  console.log('📊 Firebase Config:');
  console.log(`   API Key: ${firebaseConfig.apiKey}`);
  console.log(`   Project ID: ${firebaseConfig.projectId}`);
  console.log(`   App ID: ${firebaseConfig.appId}\n`);
  
  // Test 1: Get Firebase Web Config
  console.log('🧪 Test 1: Fetching Firebase Web Config');
  try {
    const webConfigUrl = `https://firebase.googleapis.com/v1alpha/projects/-/apps/${firebaseConfig.appId}/webConfig?key=${firebaseConfig.apiKey}`;
    const response = await axios.get(webConfigUrl);
    
    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2).substring(0, 300));
  } catch (error) {
    console.log('❌ Failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
  
  // Test 2: Create Firebase Installation
  console.log('\n\n🧪 Test 2: Creating Firebase Installation');
  try {
    const installationUrl = `https://firebaseinstallations.googleapis.com/v1/projects/${firebaseConfig.projectId}/installations?key=${firebaseConfig.apiKey}`;
    
    const fid = `c${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    const response = await axios.post(
      installationUrl,
      {
        fid: fid,
        authVersion: "FIS_v2",
        appId: firebaseConfig.appId,
        sdkVersion: "w:0.6.19"
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Firebase-Client': 'eyJ2ZXJzaW9uIjoyLCJoZWFydGJlYXRzIjpbXX0'
        }
      }
    );
    
    console.log('✅ Installation created!');
    console.log('Response:', JSON.stringify(response.data, null, 2).substring(0, 300));
    
    // Save the auth token for later use
    const authToken = response.data.authToken?.token;
    if (authToken) {
      console.log(`\n🔑 Auth Token: ${authToken.substring(0, 50)}...`);
      
      // Test 3: Try to access OpenSourceGen with Firebase token
      console.log('\n\n🧪 Test 3: Access OpenSourceGen with Firebase Token');
      try {
        const osgResponse = await axios.get(`${axios.baseUrl}/api/user/account`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ OpenSourceGen access successful!');
        console.log('Account:', JSON.stringify(osgResponse.data, null, 2));
      } catch (error) {
        console.log('❌ OpenSourceGen access failed:', error.message);
        if (error.response) {
          console.log('Status:', error.response.status);
          console.log('Data:', error.response.data);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Installation failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
  
  // Test 4: Check if there's a public signup endpoint
  console.log('\n\n🧪 Test 4: Looking for Public Endpoints');
  const endpointsToTry = [
    '/api/signup',
    '/api/register',
    '/api/auth/signup',
    '/api/auth/register',
    '/api/user/create',
    '/api/public/register'
  ];
  
  for (const endpoint of endpointsToTry) {
    try {
      const response = await axios.options(`${axios.baseUrl}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`✅ Found endpoint: ${endpoint}`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.response?.status || error.message}`);
    }
  }
}

// Run the test
testFirebaseAuth().catch(console.error);
