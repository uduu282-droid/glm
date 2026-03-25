import requests
import json

headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'X-Android-Package': 'com.horsemen.ai.chat.gpt',
    'X-Android-Cert': '6F9EC5DDB6C10EF65586CCBFFBFE8CF87785E389',
    'x-goog-api-key': 'AIzaSyBQmhLBBmUHeZmzKQSgmiX17Izbbk-KBGs',
    'User-Agent': 'Dalvik/2.1.0 (Linux; Android 12; SM-S9280)',
    'Host': 'firebaseinstallations.googleapis.com',
    'Connection': 'keep-alive',
}

data = {
    "fid": "cKj9ZfM8R3S7W1A0",
    "appId": "1:539313859520:android:0e4437f86ac2013becf625",
    "authVersion": "FIS_v2",
    "sdkVersion": "a:17.0.0"
}

print("Testing Firebase Installations API...")
print(f"URL: https://firebaseinstallations.googleapis.com/v1/projects/chatai-c30fc/installations")
print(f"Headers: {json.dumps(headers, indent=2)}")
print(f"Data: {json.dumps(data, indent=2)}")

try:
    response = requests.post(
        'https://firebaseinstallations.googleapis.com/v1/projects/chatai-c30fc/installations',
        headers=headers,
        data=json.dumps(data),
    )

    print(f"\nStatus Code: {response.status_code}")
    print("Response Text:")
    print(response.text)

except Exception as e:
    print(f"\nError occurred: {str(e)}")