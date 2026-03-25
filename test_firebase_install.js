import fetch from 'node-fetch';
import { stringify } from 'querystring';

// Test the Firebase Installations API
async function testFirebaseInstallations() {
    console.log('Testing Firebase Installations API...\n');
    
    const url = 'https://firebaseinstallations.googleapis.com/v1/projects/chatai-c30fc/installations';
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Android-Package': 'com.horsemen.ai.chat.gpt',
        'X-Android-Cert': '6F9EC5DDB6C10EF65586CCBFFBFE8CF87785E389',
        'x-goog-api-key': 'AIzaSyBQmhLBBmUHeZmzKQSgmiX17Izbbk-KBGs',
        'User-Agent': 'Dalvik/2.1.0 (Linux; Android 12; SM-S9280)',
        'Host': 'firebaseinstallations.googleapis.com',
        'Connection': 'keep-alive',
    };

    const data = {
        "fid": "cKj9ZfM8R3S7W1A0",
        "appId": "1:539313859520:android:0e4437f86ac2013becf625",
        "authVersion": "FIS_v2",
        "sdkVersion": "a:17.0.0"
    };

    try {
        console.log('URL:', url);
        console.log('Headers:', JSON.stringify(headers, null, 2));
        console.log('Data:', JSON.stringify(data, null, 2));
        
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        console.log('\nStatus Code:', response.status);
        
        const responseBody = await response.text();
        console.log('Response Body:');
        console.log(responseBody);

        if (response.ok) {
            console.log('\n✅ Firebase Installations API test successful!');
            console.log('Installation created with FID:', JSON.parse(responseBody).fid);
        } else {
            console.log(`\n❌ API returned error status: ${response.status}`);
        }

    } catch (error) {
        console.error('\n❌ Request failed:', error.message);
    }
}

// Run the test
await testFirebaseInstallations();