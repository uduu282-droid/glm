import requests
import json

def comprehensive_zai_test():
    url = "https://chat.z.ai/api/v1/chats/?page=1"
    
    print("🧪 COMPREHENSIVE Z.AI AUTHENTICATION TEST")
    print("=========================================\n")
    
    # Test different authentication approaches
    
    # Test 1: No authentication
    print("Test 1: No authentication")
    try:
        response = requests.get(url, timeout=10)
        print(f"  Status: {response.status_code}")
        print(f"  Response: {response.text[:100]}...")
    except Exception as e:
        print(f"  Error: {e}")
    print()
    
    # Test 2: Bearer token only in headers
    print("Test 2: Bearer token only in headers")
    headers = {
        "Authorization": "Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
        "Referer": "https://chat.z.ai/"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"  Status: {response.status_code}")
        print(f"  WWW-Authenticate: {response.headers.get('WWW-Authenticate', 'Not present')}")
        print(f"  Response: {response.text[:100]}...")
    except Exception as e:
        print(f"  Error: {e}")
    print()
    
    # Test 3: Cookies only
    print("Test 3: Cookies only")
    cookies = {
        "token": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...",
        "ssxmod_itna": "1-eqmxuDg70=DQi...",
        "acw_tc": "0a0ccafe17719246963924170e503614063b7dfcf4701428602390320dcef8"
    }
    try:
        response = requests.get(url, cookies=cookies, timeout=10)
        print(f"  Status: {response.status_code}")
        print(f"  WWW-Authenticate: {response.headers.get('WWW-Authenticate', 'Not present')}")
        print(f"  Response: {response.text[:100]}...")
    except Exception as e:
        print(f"  Error: {e}")
    print()
    
    # Test 4: Both headers and cookies (as originally provided)
    print("Test 4: Both headers and cookies")
    try:
        response = requests.get(url, headers=headers, cookies=cookies, timeout=10)
        print(f"  Status: {response.status_code}")
        print(f"  WWW-Authenticate: {response.headers.get('WWW-Authenticate', 'Not present')}")
        print(f"  Response: {response.text[:100]}...")
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"  JSON Data: {str(data)[:200]}...")
            except:
                print("  Response is not JSON")
    except Exception as e:
        print(f"  Error: {e}")
    print()
    
    # Test 5: Different User-Agent
    print("Test 5: Different User-Agent (mobile)")
    mobile_headers = {
        "Authorization": "Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        "Accept": "application/json",
        "Referer": "https://chat.z.ai/"
    }
    try:
        response = requests.get(url, headers=mobile_headers, cookies=cookies, timeout=10)
        print(f"  Status: {response.status_code}")
        print(f"  Response: {response.text[:100]}...")
    except Exception as e:
        print(f"  Error: {e}")
    print()

if __name__ == "__main__":
    comprehensive_zai_test()
    print("🧪 Testing Complete!")