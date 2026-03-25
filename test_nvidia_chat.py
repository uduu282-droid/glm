import requests
import json

def test_nvidia_chat_completion():
    print("🧪 Testing NVIDIA API Chat Completion")
    print("====================================\n")
    
    base_url = "https://integrate.api.nvidia.com/v1"
    api_key = "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"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    # Test with a popular model from the list
    model = "meta/llama-3.1-8b-instruct"
    print(f"Testing chat completion with model: {model}")
    
    chat_data = {
        "model": model,
        "messages": [
            {"role": "user", "content": "Hello, how are you?"}
        ],
        "temperature": 0.7,
        "max_tokens": 150
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
                print(f"✅ SUCCESS: Chat completion received")
                print(f"Response: {json.dumps(data, indent=2)[:1000]}...")
                
                # Extract and display the actual response
                if 'choices' in data and len(data['choices']) > 0:
                    content = data['choices'][0]['message']['content']
                    print(f"\n🤖 AI Response: {content}")
                
                return data
            except ValueError:
                print(f"Response (text): {response.text[:500]}...")
                return response.text
        else:
            print(f"❌ FAILED: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    result = test_nvidia_chat_completion()
    print('\n' + '='*50)
    if result:
        print('🎉 NVIDIA Chat Completion Test: SUCCESS')
    else:
        print('❌ NVIDIA Chat Completion Test: FAILED')