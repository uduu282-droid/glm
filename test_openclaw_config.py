import requests

# Test the exact configuration from your interface
def test_openclaw_config():
    print("🔍 Testing OpenClaw Configuration\n")
    
    # Your exact configuration
    config = {
        "base_url": "http://integrate.api.nvidia.com/v1",  # HTTP instead of HTTPS
        "api_key": "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",
        "model": "z-ai/glm4.7"
    }
    
    print("Configuration being tested:")
    print(f"Base URL: {config['base_url']}")
    print(f"API Key: {config['api_key'][:20]}...")
    print(f"Model: {config['model']}")
    print()
    
    # Test with HTTP
    print("Test 1: HTTP connection (your current config)")
    test_endpoint(config['base_url'], config['api_key'])
    
    # Test with HTTPS (correct version)
    print("\nTest 2: HTTPS connection (recommended)")
    https_url = config['base_url'].replace('http://', 'https://')
    test_endpoint(https_url, config['api_key'])

def test_endpoint(url, api_key):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "z-ai/glm4.7",
        "messages": [{"role": "user", "content": "test"}],
        "max_tokens": 50
    }
    
    try:
        print(f"Testing: {url}")
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Success! Connection working")
            data = response.json()
            usage = data.get('usage', {})
            print(f"Tokens used: {usage.get('total_tokens', 'N/A')}")
        else:
            print(f"❌ Failed with status: {response.status_code}")
            print(f"Error: {response.text[:200]}")
            
    except requests.exceptions.SSLError as e:
        print("❌ SSL/TLS Error - Try using HTTPS instead")
        print(f"Error details: {str(e)[:100]}...")
    except requests.exceptions.ConnectionError as e:
        print("❌ Connection Error - Check URL and network")
        print(f"Error details: {str(e)[:100]}...")
    except requests.exceptions.Timeout as e:
        print("❌ Timeout Error - Request took too long")
        print(f"Error details: {str(e)[:100]}...")
    except Exception as e:
        print(f"❌ Other Error: {str(e)[:100]}...")

# Run the test
test_openclaw_config()