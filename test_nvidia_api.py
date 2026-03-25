import requests
import json

def test_nvidia_api():
    print("🧪 Testing NVIDIA API")
    print("====================\n")
    
    base_url = "https://integrate.api.nvidia.com/v1"
    api_key = "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"
    
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
                
                # Categorize models
                chat_models = []
                embedding_models = []
                other_models = []
                
                for model in data.get('data', []):
                    model_id = model.get('id', '')
                    if 'chat' in model_id.lower() or 'instruct' in model_id.lower() or 'conversational' in model_id.lower():
                        chat_models.append(model_id)
                    elif 'embed' in model_id.lower():
                        embedding_models.append(model_id)
                    else:
                        other_models.append(model_id)
                
                print(f"  Chat/Instruct models: {len(chat_models)}")
                print(f"  Embedding models: {len(embedding_models)}")
                print(f"  Other models: {len(other_models)}")
                
                print(f"\n  First 10 Chat/Instruct models: {chat_models[:10]}")
                print(f"  First 10 Embedding models: {embedding_models[:10]}")
                print(f"  First 10 Other models: {other_models[:10]}")
                
                print(f"\n  Complete Chat/Instruct model list ({len(chat_models)}):")
                for i, model in enumerate(chat_models, 1):
                    print(f"    {i}. {model}")
                
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

if __name__ == "__main__":
    result = test_nvidia_api()
    print('\n' + '='*50)
    if result:
        print('🎉 NVIDIA API Test: SUCCESS')
    else:
        print('❌ NVIDIA API Test: FAILED')