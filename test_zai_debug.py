import requests
import json

def test_api():
    url = "https://chat.z.ai/api/v1/chats/?page=1"
    
    # PASTE FRESH VALUES HERE
    bearer_token = "eyJhbGci..." 
    cookie_str = "token=...; ssxmod_itna=...; acw_tc=..."

    headers = {
        "Authorization": f"Bearer {bearer_token}",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Referer": "https://chat.z.ai/"
    }

    try:
        # Correct way to pass cookies - using the cookies parameter or Cookie header
        response = requests.get(url, headers=headers, cookies={
            "token": "...",
            "ssxmod_itna": "...", 
            "acw_tc": "..."
        })
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ SUCCESS: Data retrieved.")
            print(json.dumps(response.json(), indent=2)[:500]) # Print first 500 chars
        elif response.status_code == 401:
            print("❌ AUTH FAILED: Token likely expired. Check 'WWW-Authenticate' header:")
            print(response.headers.get('WWW-Authenticate', 'No extra info'))
            print(f"Full response: {response.text}")
        else:
            print(f"❌ FAILED: {response.text}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()