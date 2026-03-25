import requests
import json

# Test NVIDIA API token context and limits
api_key = "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"
url = "https://integrate.api.nvidia.com/v1/chat/completions"

def test_token_limits():
    print("🔍 Testing NVIDIA API Token Context and Limits\n")
    
    # Test 1: Default token limit (100 tokens)
    print("Test 1: Default token limit (100 tokens)")
    test_request({
        "model": "z-ai/glm4.7",
        "messages": [{"role": "user", "content": "Count to 50"}],
        "max_tokens": 100
    })
    
    # Test 2: Higher token limit (500 tokens)
    print("\nTest 2: Higher token limit (500 tokens)")
    test_request({
        "model": "z-ai/glm4.7", 
        "messages": [{"role": "user", "content": "Explain quantum computing in detail"}],
        "max_tokens": 500
    })
    
    # Test 3: Very high token limit (1000 tokens)
    print("\nTest 3: Very high token limit (1000 tokens)")
    test_request({
        "model": "z-ai/glm4.7",
        "messages": [{"role": "user", "content": "Write a detailed explanation of machine learning with examples"}],
        "max_tokens": 1000
    })
    
    # Test 4: Maximum token limit (16384 tokens as in original code)
    print("\nTest 4: Maximum token limit (16384 tokens)")
    test_request({
        "model": "z-ai/glm4.7",
        "messages": [{"role": "user", "content": "Write a comprehensive guide to artificial intelligence"}],
        "max_tokens": 16384
    })
    
    # Test 5: Context window test with long prompt
    print("\nTest 5: Context window with long prompt")
    long_prompt = "The quick brown fox jumps over the lazy dog. " * 100  # ~4200 characters
    test_request({
        "model": "z-ai/glm4.7",
        "messages": [{"role": "user", "content": f"Summarize this text: {long_prompt}"}],
        "max_tokens": 200
    })

def test_request(payload):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            usage = data.get('usage', {})
            print(f"Prompt tokens: {usage.get('prompt_tokens', 'N/A')}")
            print(f"Completion tokens: {usage.get('completion_tokens', 'N/A')}")
            print(f"Total tokens: {usage.get('total_tokens', 'N/A')}")
            
            if 'choices' in data and len(data['choices']) > 0:
                content = data['choices'][0].get('message', {}).get('content', '')
                print(f"Response length: {len(content)} characters")
                print(f"Response preview: {content[:100]}...")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Request failed: {str(e)}")

# Run the tests
test_token_limits()