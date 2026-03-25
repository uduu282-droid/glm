import requests
import json

# Detailed NVIDIA API token context analysis
api_key = "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"
url = "https://integrate.api.nvidia.com/v1/chat/completions"

def detailed_token_analysis():
    print("🔍 Detailed NVIDIA API Token Context Analysis\n")
    
    test_cases = [
        {
            "name": "Short response (100 tokens)",
            "payload": {
                "model": "z-ai/glm4.7",
                "messages": [{"role": "user", "content": "What is 2+2?"}],
                "max_tokens": 100
            }
        },
        {
            "name": "Medium response (500 tokens)", 
            "payload": {
                "model": "z-ai/glm4.7",
                "messages": [{"role": "user", "content": "Explain photosynthesis"}],
                "max_tokens": 500
            }
        },
        {
            "name": "Long response (1000 tokens)",
            "payload": {
                "model": "z-ai/glm4.7", 
                "messages": [{"role": "user", "content": "Describe the history of computers"}],
                "max_tokens": 1000
            }
        },
        {
            "name": "Maximum response (16384 tokens)",
            "payload": {
                "model": "z-ai/glm4.7",
                "messages": [{"role": "user", "content": "Write a comprehensive essay about climate change"}],
                "max_tokens": 16384
            }
        },
        {
            "name": "Long context prompt",
            "payload": {
                "model": "z-ai/glm4.7",
                "messages": [{"role": "user", "content": "The quick brown fox " * 200 + "Now summarize this."}],
                "max_tokens": 300
            }
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"Test {i}: {test_case['name']}")
        print("-" * 50)
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(url, headers=headers, json=test_case['payload'], timeout=30)
            
            print(f"HTTP Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Extract usage information
                usage = data.get('usage', {})
                prompt_tokens = usage.get('prompt_tokens', 0)
                completion_tokens = usage.get('completion_tokens', 0)
                total_tokens = usage.get('total_tokens', 0)
                
                print(f"Token Usage:")
                print(f"  • Prompt tokens: {prompt_tokens}")
                print(f"  • Completion tokens: {completion_tokens}")
                print(f"  • Total tokens: {total_tokens}")
                print(f"  • Requested max_tokens: {test_case['payload']['max_tokens']}")
                
                # Extract response content
                if 'choices' in data and len(data['choices']) > 0:
                    message = data['choices'][0].get('message', {})
                    content = message.get('content', '')
                    reasoning = message.get('reasoning_content', '')
                    
                    print(f"Response Analysis:")
                    print(f"  • Content length: {len(content)} characters")
                    print(f"  • Content words: {len(content.split()) if content else 0} words")
                    print(f"  • Has reasoning: {'Yes' if reasoning else 'No'}")
                    
                    if content:
                        print(f"  • Content preview: {content[:150]}...")
                else:
                    print("  • No response content received")
                    
            else:
                print(f"Error Response: {response.text[:200]}...")
                
        except Exception as e:
            print(f"Request failed: {str(e)}")
        
        print("\n")

# Run detailed analysis
detailed_token_analysis()