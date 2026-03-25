import requests
import time

# Test the exact scenario that causes "operation was aborted"
def test_aborted_operation():
    print("🔍 Testing for 'Operation was aborted' error\n")
    
    # The working configuration
    working_url = "https://integrate.api.nvidia.com/v1/chat/completions"
    api_key = "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"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Test different scenarios that might cause abortion
    test_cases = [
        {
            "name": "Normal request (should work)",
            "payload": {"model": "z-ai/glm4.7", "messages": [{"role": "user", "content": "test"}], "max_tokens": 50}
        },
        {
            "name": "Large request (might timeout)",
            "payload": {"model": "z-ai/glm4.7", "messages": [{"role": "user", "content": "write a long essay"}], "max_tokens": 2000}
        },
        {
            "name": "Missing required fields",
            "payload": {"model": "z-ai/glm4.7", "messages": []}
        },
        {
            "name": "Invalid model",
            "payload": {"model": "non-existent-model", "messages": [{"role": "user", "content": "test"}]}
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"Test {i}: {test_case['name']}")
        print("-" * 40)
        
        try:
            start_time = time.time()
            response = requests.post(working_url, headers=headers, json=test_case['payload'], timeout=15)
            end_time = time.time()
            
            print(f"Status: {response.status_code}")
            print(f"Response time: {end_time - start_time:.2f} seconds")
            
            if response.status_code == 200:
                print("✅ Success")
                data = response.json()
                usage = data.get('usage', {})
                print(f"Tokens: {usage.get('total_tokens', 'N/A')}")
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"Message: {response.text[:150]}...")
                
        except requests.exceptions.Timeout:
            print("❌ Timeout - Request was aborted due to timeout")
        except requests.exceptions.ConnectionError:
            print("❌ Connection Error - Request was aborted")
        except Exception as e:
            print(f"❌ Aborted: {str(e)}")
        
        print()

# Run the test
test_aborted_operation()