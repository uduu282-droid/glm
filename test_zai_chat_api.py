import requests

def test_zai_chat_api():
    print("🧪 Testing Z.ai Chat API")
    print("=======================\n")
    
    url = "https://chat.z.ai/api/v1/chats/?page=1"
    
    # Using the headers and cookies structure you provided
    headers = {
        "accept": "application/json",
        "authorization": "Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...", # Incomplete token as shown
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
        "referer": "https://chat.z.ai/",
    }
    
    # Using the cookies structure you provided
    cookies = {
        "token": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...", # Incomplete token as shown
        "ssxmod_itna": "1-eqmxuDg70=DQi...",
        "acw_tc": "0a0ccafe17719246963924170e503614063b7dfcf4701428602390320dcef8"
    }
    
    print(f"Testing URL: {url}")
    print("Headers included: accept, authorization, user-agent, referer")
    print("Cookies included: token, ssxmod_itna, acw_tc")
    print("\nNote: Using placeholder tokens as provided in the example\n")
    
    try:
        response = requests.get(url, headers=headers, cookies=cookies, timeout=15)
        
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type')}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"\n✅ SUCCESS: Received JSON response")
                print(f"Response (first 500 chars): {str(data)[:500]}...")
                return data
            except ValueError:
                print(f"\n⚠️  Response received but not valid JSON")
                print(f"Response text (first 500 chars): {response.text[:500]}...")
                return response.text
        else:
            print(f"\n❌ FAILED: Status {response.status_code}")
            print(f"Response text: {response.text}")
            return None
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
        return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None

if __name__ == "__main__":
    result = test_zai_chat_api()
    print('\n' + '='*50)
    if result:
        print('🎉 Z.ai Chat API Test: SUCCESS')
    else:
        print('❌ Z.ai Chat API Test: FAILED')