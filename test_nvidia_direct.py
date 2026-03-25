import requests
import json
import os
import sys

# Color support for terminal output
_USE_COLOR = sys.stdout.isatty() and os.getenv("NO_COLOR") is None
_REASONING_COLOR = "\033[90m" if _USE_COLOR else ""
_RESET_COLOR = "\033[0m" if _USE_COLOR else ""

# Test NVIDIA API directly with the same parameters
url = "https://integrate.api.nvidia.com/v1/chat/completions"
api_key = "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"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

payload = {
    "model": "z-ai/glm4.7",
    "messages": [{"content": "hey", "role": "user"}],
    "temperature": 1,
    "top_p": 1,
    "max_tokens": 100,
    "stream": True
}

print("Testing NVIDIA API with direct HTTP request...")
print(f"URL: {url}")
print(f"Model: z-ai/glm4.7")
print(f"Message: 'hey'")
print("-" * 50)

try:
    # Make streaming request
    with requests.post(url, headers=headers, json=payload, stream=True) as response:
        print("Response:")
        
        if response.status_code != 200:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            exit(1)
        
        # Process streaming response
        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                if line_str.startswith('data: '):
                    data = line_str[6:]  # Remove 'data: ' prefix
                    
                    if data == '[DONE]':
                        break
                    
                    try:
                        chunk = json.loads(data)
                        
                        if 'choices' in chunk and len(chunk['choices']) > 0:
                            delta = chunk['choices'][0].get('delta', {})
                            
                            # Handle reasoning content (if available)
                            reasoning = delta.get('reasoning_content')
                            if reasoning:
                                print(f"{_REASONING_COLOR}{reasoning}{_RESET_COLOR}", end="")
                            
                            # Handle regular content
                            content = delta.get('content')
                            if content is not None:
                                print(content, end="")
                                
                    except json.JSONDecodeError:
                        # Handle non-JSON lines
                        if '[DONE]' not in data:
                            print(f"Non-JSON response: {data}")
        
        print("\n\n✅ NVIDIA API test completed successfully!")

except requests.exceptions.RequestException as e:
    print(f"\n❌ Request error: {str(e)}")
except Exception as e:
    print(f"\n❌ Unexpected error: {str(e)}")