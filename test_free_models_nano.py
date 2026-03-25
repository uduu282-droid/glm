import requests
import json

def test_free_models_nano_gpt():
    print("🧪 Testing Nano-GPT Free Models")
    print("===============================\n")
    
    base_url = "https://nano-gpt.com/api/v1"
    api_key = "sk-nano-1d74edc0-adbb-43ec-8942-f32033d73de7"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    # Try different models that might be free or cheaper
    test_models = [
        "auto-model",           # Generic auto model
        "auto-model-basic",     # Basic tier
        "study_gpt-chatgpt-4o-latest",  # Study model
        "openai/gpt-4o-mini",   # Mini model (often free)
        "gpt-5-mini",          # Mini version
        "gpt-5-nano",          # Nano version
        "mistral-tiny",        # Tiny Mistral
        "ministral-3b-2512",   # Small ministral
    ]
    
    test_message = {"role": "user", "content": "Hello, how are you?"}
    
    for i, model in enumerate(test_models, 1):
        print(f"Test {i}: {model}")
        chat_data = {
            "model": model,
            "messages": [test_message]
        }
        
        try:
            response = requests.post(
                f"{base_url}/chat/completions", 
                headers=headers, 
                json=chat_data, 
                timeout=30
            )
            
            print(f"  Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"  ✅ SUCCESS: Response received")
                    print(f"  Response: {json.dumps(data, indent=2)[:400]}...")
                    return {"model": model, "response": data}
                except ValueError:
                    print(f"  Response (text): {response.text[:300]}...")
                    return {"model": model, "response": response.text}
            elif response.status_code == 402:
                error_data = response.json()
                if "accepts" in error_data and len(error_data["accepts"]) > 0:
                    amount = error_data["accepts"][0]["maxAmountRequiredUSD"]
                    print(f"  💰 Payment Required: ${amount} USD")
                else:
                    print(f"  💰 Payment Required")
            else:
                print(f"  ❌ Error: {response.text[:200]}...")
                
        except Exception as e:
            print(f"  ❌ Request Error: {e}")
        
        print()  # Empty line between tests
    
    print("Testing different parameter combinations...")
    
    # Test with different parameters that might affect pricing
    print("Test with temperature=0:")
    chat_data = {
        "model": "auto-model",
        "messages": [test_message],
        "temperature": 0
    }
    
    try:
        response = requests.post(
            f"{base_url}/chat/completions", 
            headers=headers, 
            json=chat_data, 
            timeout=30
        )
        print(f"  Status: {response.status_code}")
        if response.status_code == 200:
            print("  ✅ Free generation with temperature=0!")
            return {"model": "auto-model", "params": "temperature=0", "response": response.json()}
        elif response.status_code == 402:
            print("  💰 Still requires payment")
    except Exception as e:
        print(f"  ❌ Error: {e}")
    
    print()
    
    print("Test with max_tokens=10:")
    chat_data = {
        "model": "auto-model",
        "messages": [test_message],
        "max_tokens": 10
    }
    
    try:
        response = requests.post(
            f"{base_url}/chat/completions", 
            headers=headers, 
            json=chat_data, 
            timeout=30
        )
        print(f"  Status: {response.status_code}")
        if response.status_code == 200:
            print("  ✅ Free generation with max_tokens=10!")
            return {"model": "auto-model", "params": "max_tokens=10", "response": response.json()}
        elif response.status_code == 402:
            print("  💰 Still requires payment")
    except Exception as e:
        print(f"  ❌ Error: {e}")
    
    return None

if __name__ == "__main__":
    result = test_free_models_nano_gpt()
    print('\n' + '='*50)
    if result:
        print('🎉 Found a free model!')
        print(f"Model: {result.get('model', 'Unknown')}")
        if 'params' in result:
            print(f"Parameters: {result['params']}")
    else:
        print('❌ No free models found - all require payment')