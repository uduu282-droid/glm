import requests
import json

def test_ultra_cheap_model():
    print("🎉 Testing Ultra-Cheap Nano-GPT Models")
    print("=====================================\n")
    
    base_url = "https://nano-gpt.com/api/v1"
    api_key = "sk-nano-1d74edc0-adbb-43ec-8942-f32033d73de7"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    # Test the cheapest model we found
    cheapest_model = "auto-model-basic"
    print(f"Testing {cheapest_model} (price: $0.000029)")
    
    chat_data = {
        "model": cheapest_model,
        "messages": [
            {"role": "user", "content": "Hello, how are you?"}
        ],
        "max_tokens": 50  # Keep it reasonable
    }
    
    try:
        response = requests.post(
            f"{base_url}/chat/completions", 
            headers=headers, 
            json=chat_data, 
            timeout=30
        )
        
        print(f"Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type')}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print("✅ SUCCESS: Free response generated!")
                print(f"Response: {json.dumps(data, indent=2)}")
                return data
            except ValueError:
                print(f"Response (text): {response.text}")
                return response.text
        elif response.status_code == 402:
            error_data = response.json()
            if "accepts" in error_data and len(error_data["accepts"]) > 0:
                amount = error_data["accepts"][0]["maxAmountRequiredUSD"]
                print(f"💰 Payment Required: ${amount} USD")
                print(f"This is only {amount * 1000:.3f} cents!")
            else:
                print("💰 Payment Required")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request Error: {e}")
    
    # Let's also test a few more ultra-cheap options
    print("\n" + "="*40)
    print("Testing other ultra-cheap models:")
    
    ultra_cheap_models = [
        "auto-model-basic",    # $0.000029
        "openai/gpt-oss-20b",  # $0.000023
        "openai/gpt-oss-safeguard-20b", # $0.000024
        "mistralai/Devstral-Small-2505", # $0.000022
        "openai/gpt-5-nano"    # $0.000024
    ]
    
    working_models = []
    
    for model in ultra_cheap_models:
        print(f"\nTesting {model}...")
        chat_data["model"] = model
        
        try:
            response = requests.post(
                f"{base_url}/chat/completions",
                headers=headers,
                json=chat_data,
                timeout=15
            )
            
            if response.status_code == 200:
                print(f"  ✅ WORKS: {model}")
                working_models.append(model)
            elif response.status_code == 402:
                try:
                    error_data = response.json()
                    if "accepts" in error_data and len(error_data["accepts"]) > 0:
                        amount = error_data["accepts"][0]["maxAmountRequiredUSD"]
                        print(f"  💰 ${amount:.6f}: {model}")
                except:
                    print(f"  💰 Requires payment: {model}")
            else:
                print(f"  ❌ Error: {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ Failed: {e}")
    
    print("\n" + "="*50)
    if working_models:
        print("🎉 FREE/ULTRA-CHEAP WORKING MODELS:")
        for model in working_models:
            print(f"  - {model}")
    else:
        print("💸 All models require micro-payments (under 1 cent)")

if __name__ == "__main__":
    result = test_ultra_cheap_model()
    print('\n🎉 Ultra-Cheap Model Testing Complete!')