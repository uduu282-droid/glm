import requests

def test_makehub_api():
    print("🧪 Testing MakeHub API: api.makehub.ai/v1")
    print("========================================\n")
    
    base_url = "https://api.makehub.ai/v1"
    
    # Test the models endpoint
    print("Testing models endpoint...")
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Authorization': 'Bearer mh_85afbeff51e5450fa84319bc05dab185776afdf8d8464e9082baad75d69b7'
        }
        
        response = requests.get(f"{base_url}/models", headers=headers, timeout=10)
        
        print(f"Models Endpoint Status: {response.status_code}")
        print(f"Models Endpoint Content-Type: {response.headers.get('content-type')}")
        
        print(f"Models Response (first 500 chars): {response.text[:500]}...")
        
    except requests.exceptions.Timeout:
        print("❌ Models Endpoint Request Timed Out")
    except requests.exceptions.RequestException as e:
        print(f"❌ Models Endpoint Request Failed: {e}")
    
    # Test with a simple chat completion-like request
    print("\nTesting chat completion endpoint...")
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mh_85afbeff51e5450fa84319bc05dab185776afdf8d8464e9082baad75d69b7'
        }
        
        data = {
            "model": "openai/gpt-4",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "What are the benefits of using a routing platform for AI models?"}
            ]
        }
        
        response = requests.post(f"{base_url}/chat/completions", headers=headers, json=data, timeout=10)
        
        print(f"Chat Completion Status: {response.status_code}")
        print(f"Chat Completion Content-Type: {response.headers.get('content-type')}")
        
        print(f"Chat Response (first 500 chars): {response.text[:500]}...")
        
    except requests.exceptions.Timeout:
        print("❌ Chat Completion Request Timed Out")
    except requests.exceptions.RequestException as e:
        print(f"❌ Chat Completion Request Failed: {e}")

if __name__ == "__main__":
    test_makehub_api()
    print('\n' + '='*50)
    print('🎉 MakeHub API Testing Complete!')