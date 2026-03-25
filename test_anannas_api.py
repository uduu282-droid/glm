import requests
import json

def test_anannas_api():
    print("🧪 Testing Anannas AI API: api.anannas.ai/v1")
    print("==========================================\n")
    
    base_url = "https://api.anannas.ai/v1"
    api_key = "sk-cr-27275ae349694731b095effe5abe64e3"
    
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
                print(f"  Total models: {len(data.get('data', []))}")
                print(f"  First 10 models: {', '.join([m.get('id', 'unknown') for m in data.get('data', [])[:10]])}")
                print(f"  Response: {json.dumps(data, indent=2)[:500]}...")
                return data
            except ValueError:
                print(f"  Response (text): {response.text[:300]}...")
                return response.text
        else:
            print(f"  ❌ FAILED: {response.text}")
            return None
            
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None
    
    print()
    
    # Test 2: Chat completions endpoint with the specific model from example
    print("Test 2: POST /chat/completions with openai/gpt-5-mini")
    chat_data = {
        "model": "openai/gpt-5-mini",
        "messages": [
            {"role": "user", "content": "Explain quantum computing"}
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

def test_additional_models():
    """Test a few more models to see how many are working"""
    base_url = "https://api.anannas.ai/v1"
    api_key = "sk-cr-27275ae349694731b095effe5abe64e3"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Test a few different models
    test_models = [
        "openai/gpt-4o",      # Popular model
        "openai/gpt-4",       # Standard GPT-4
        "claude-3-5-sonnet",  # Anthropic model
        "gemini-pro"          # Google model
    ]
    
    working_models = []
    failed_models = []
    
    for model in test_models:
        print(f"\nTesting {model}...")
        chat_data = {
            "model": model,
            "messages": [
                {"role": "user", "content": "Hello"}
            ],
            "max_tokens": 50  # Keep it short for testing
        }
        
        try:
            response = requests.post(
                f"{base_url}/chat/completions",
                headers=headers,
                json=chat_data,
                timeout=15
            )
            
            if response.status_code == 200:
                print(f"  ✅ WORKING")
                working_models.append(model)
            else:
                print(f"  ❌ FAILED: {response.status_code}")
                failed_models.append(model)
                
        except Exception as e:
            print(f"  ❌ ERROR: {e}")
            failed_models.append(model)
    
    print(f"\n📊 Summary:")
    print(f"Working models: {len(working_models)}")
    print(f"Failed models: {len(failed_models)}")
    
    if working_models:
        print(f"✅ Working: {', '.join(working_models)}")
    if failed_models:
        print(f"❌ Failed: {', '.join(failed_models)}")

if __name__ == "__main__":
    result = test_anannas_api()
    print('\n' + '='*50)
    if result:
        print('🎉 Anannas API Test: SUCCESS')
        # If we got models data, also test a few more models
        if isinstance(result, dict) and 'data' in result:
            print(f"\nTesting additional models from the list...")
            test_additional_models()
    else:
        print('❌ Anannas API Test: FAILED')