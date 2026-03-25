import requests
import json

# Simple token context test
api_key = "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"
url = "https://integrate.api.nvidia.com/v1/chat/completions"

def simple_token_test():
    print("🔍 NVIDIA API Token Context Summary\n")
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Test with different token limits
    test_cases = [
        {"max_tokens": 100, "prompt": "Count to 10"},
        {"max_tokens": 500, "prompt": "Explain machine learning"},
        {"max_tokens": 1000, "prompt": "Describe artificial intelligence"},
        {"max_tokens": 2000, "prompt": "Write about the future of technology"}
    ]
    
    for i, case in enumerate(test_cases, 1):
        print(f"Test {i}: {case['max_tokens']} token limit")
        
        payload = {
            "model": "z-ai/glm4.7",
            "messages": [{"role": "user", "content": case["prompt"]}],
            "max_tokens": case["max_tokens"]
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                usage = data.get('usage', {})
                
                print(f"  ✅ Success")
                print(f"  • Prompt tokens: {usage.get('prompt_tokens', 'N/A')}")
                print(f"  • Completion tokens: {usage.get('completion_tokens', 'N/A')}")
                print(f"  • Total tokens: {usage.get('total_tokens', 'N/A')}")
                
                # Get response content info
                if 'choices' in data and len(data['choices']) > 0:
                    content = data['choices'][0].get('message', {}).get('content', '')
                    if content:
                        print(f"  • Response length: {len(content)} characters")
                        print(f"  • Response words: {len(content.split())} words")
            else:
                print(f"  ❌ Failed: {response.status_code}")
                print(f"  • Error: {response.text[:100]}...")
                
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
        
        print()

# Run the test
simple_token_test()