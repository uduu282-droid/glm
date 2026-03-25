import requests
import json

def test_nano_gpt_api():
    print("🧪 Testing Nano-GPT API")
    print("======================\n")
    
    base_url = "https://nano-gpt.com/api/v1"
    api_key = "sk-nano-1d74edc0-adbb-43ec-8942-f32033d73de7"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    # Test 1: Get models endpoint
    print("Test 1: GET /models")
    try:
        response = requests.get(f"{base_url}/models", headers=headers, timeout=15)
        print(f"  Status: {response.status_code}")
        print(f"  Content-Type: {response.headers.get('content-type')}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"  ✅ SUCCESS: Models retrieved")
                print(f"  Response: {json.dumps(data, indent=2)[:500]}...")
            except ValueError:
                print(f"  Response (text): {response.text[:300]}...")
        else:
            print(f"  ❌ FAILED: {response.text}")
            
    except Exception as e:
        print(f"  ❌ Error: {e}")
    
    print()
    
    # Test 2: Chat completions endpoint
    print("Test 2: POST /chat/completions")
    chat_data = {
        "model": "gpt-5.2",
        "messages": [
            {"role": "user", "content": "Hello, how are you?"}
        ]
    }
    
    try:
        response = requests.post(
            f"{base_url}/chat/completions", 
            headers=headers, 
            json=chat_data, 
            timeout=30
        )
        print(f"  Status: {response.status_code}")
        print(f"  Content-Type: {response.headers.get('content-type')}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"  ✅ SUCCESS: Chat completion received")
                print(f"  Response: {json.dumps(data, indent=2)[:800]}...")
                return data
            except ValueError:
                print(f"  Response (text): {response.text[:500]}...")
                return response.text
        else:
            print(f"  ❌ FAILED: {response.text}")
            return None
            
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None

if __name__ == "__main__":
    result = test_nano_gpt_api()
    print('\n' + '='*50)
    if result:
        print('🎉 Nano-GPT API Test: SUCCESS')
    else:
        print('❌ Nano-GPT API Test: FAILED')