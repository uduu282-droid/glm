import requests
import json

def test_anannas_with_available_model():
    print("🧪 Testing Anannas AI API with available models")
    print("==============================================\n")
    
    base_url = "https://api.anannas.ai/v1"
    api_key = "sk-cr-27275ae349694731b095effe5abe64e3"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    # First, get the models
    print("Getting available models...")
    try:
        response = requests.get(f"{base_url}/models", headers=headers, timeout=15)
        if response.status_code == 200:
            models_data = response.json()
            print(f"✅ Retrieved {len(models_data.get('data', []))} models")
            
            # Look for models that might be similar to the example
            available_models = [model['id'] for model in models_data.get('data', [])]
            print(f"First 10 models: {available_models[:10]}")
            
            # Find models that might work based on the example
            potential_models = []
            for model_id in available_models:
                if 'gpt' in model_id.lower() or 'mini' in model_id.lower() or 'openai' in model_id.lower():
                    potential_models.append(model_id)
            
            print(f"\nPotential GPT models: {potential_models[:10]}")
            
            # Try with the first few available models
            test_messages = [
                {"role": "user", "content": "Hello, how are you?"},
                {"role": "user", "content": "Explain quantum computing"}
            ]
            
            working_models = []
            tested_models = 0
            
            for model in available_models[:10]:  # Test first 10 models
                print(f"\nTesting model: {model}")
                chat_data = {
                    "model": model,
                    "messages": [test_messages[0]],  # Start with simple message
                    "max_tokens": 50
                }
                
                try:
                    response = requests.post(
                        f"{base_url}/chat/completions",
                        headers=headers,
                        json=chat_data,
                        timeout=20  # Longer timeout
                    )
                    
                    if response.status_code == 200:
                        print(f"  ✅ SUCCESS: {model}")
                        working_models.append(model)
                        
                        # Try to get the response content
                        try:
                            data = response.json()
                            if data.get('choices') and data['choices'][0].get('message'):
                                content = data['choices'][0]['message']['content']
                                print(f"    Response preview: {content[:100]}...")
                        except:
                            pass
                    else:
                        print(f"  ❌ FAILED: {response.status_code} - {response.text[:100]}...")
                        
                except Exception as e:
                    print(f"  ❌ ERROR: {e}")
                
                tested_models += 1
                if len(working_models) >= 2:  # Stop after finding 2 working models
                    print(f"\n✅ Found {len(working_models)} working models, stopping test.")
                    break
            
            print(f"\n📊 Final Results:")
            print(f"Total models tested: {tested_models}")
            print(f"Working models: {len(working_models)}")
            print(f"Working model list: {working_models}")
            
            return working_models
            
        else:
            print(f"❌ Failed to get models: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"❌ Error getting models: {e}")
        return []

if __name__ == "__main__":
    result = test_anannas_with_available_model()
    print('\n' + '='*50)
    if result:
        print('🎉 Anannas API: FOUND WORKING MODELS')
        print(f"✅ Working models: {', '.join(result)}")
    else:
        print('❌ Anannas API: NO WORKING MODELS FOUND')