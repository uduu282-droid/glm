import requests
import json

def analyze_nano_gpt_models():
    print("🔍 Analyzing Nano-GPT Models and Pricing")
    print("========================================\n")
    
    base_url = "https://nano-gpt.com/api/v1"
    api_key = "sk-nano-1d74edc0-adbb-43ec-8942-f32033d73de7"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    # Get all models first
    print("Getting complete models list...")
    try:
        response = requests.get(f"{base_url}/models", headers=headers, timeout=15)
        if response.status_code == 200:
            models_data = response.json()
            print(f"Total models available: {len(models_data.get('data', []))}")
            
            # Categorize models by pricing (based on the 402 responses we saw)
            cheap_models = []
            expensive_models = []
            
            for model in models_data.get('data', [])[:50]:  # Check first 50 models
                model_id = model.get('id', '')
                print(f"Testing {model_id}...")
                
                # Test this model
                chat_data = {
                    "model": model_id,
                    "messages": [{"role": "user", "content": "Hi"}],
                    "max_tokens": 5  # Keep it minimal
                }
                
                try:
                    test_response = requests.post(
                        f"{base_url}/chat/completions",
                        headers=headers,
                        json=chat_data,
                        timeout=10
                    )
                    
                    if test_response.status_code == 200:
                        print(f"  ✅ FREE: {model_id}")
                        cheap_models.append(model_id)
                    elif test_response.status_code == 402:
                        try:
                            error_data = test_response.json()
                            if "accepts" in error_data and len(error_data["accepts"]) > 0:
                                price = error_data["accepts"][0]["maxAmountRequiredUSD"]
                                if price < 0.01:  # Less than 1 cent
                                    print(f"  💰 CHEAP (${price:.6f}): {model_id}")
                                    cheap_models.append(f"{model_id} (${price:.6f})")
                                else:
                                    print(f"  💰 EXPENSIVE (${price:.4f}): {model_id}")
                                    expensive_models.append(f"{model_id} (${price:.4f})")
                        except:
                            print(f"  💰 REQUIRES PAYMENT: {model_id}")
                    elif test_response.status_code == 400:
                        print(f"  ❌ NOT SUPPORTED: {model_id}")
                    
                except Exception as e:
                    print(f"  ❌ ERROR testing {model_id}: {e}")
                
                # Small delay to avoid rate limiting
                import time
                time.sleep(0.5)
                
        else:
            print(f"Failed to get models: {response.status_code}")
            return
            
    except Exception as e:
        print(f"Error: {e}")
        return
    
    print("\n" + "="*50)
    print("SUMMARY:")
    print(f"Free/Cheap models found: {len(cheap_models)}")
    print(f"Expensive models: {len(expensive_models)}")
    
    if cheap_models:
        print("\n💰 AFFORDABLE OPTIONS (< $0.01):")
        for model in cheap_models[:10]:  # Show top 10 cheapest
            print(f"  - {model}")
    
    if expensive_models:
        print("\n💸 EXPENSIVE MODELS:")
        for model in expensive_models[:5]:
            print(f"  - {model}")

if __name__ == "__main__":
    analyze_nano_gpt_models()