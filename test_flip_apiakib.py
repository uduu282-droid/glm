import requests

def test_flip_apiakib():
    print("🧪 Testing Flip APIAKIB: flip-apiakib.vercel.app")
    print("==================================================\n")
    
    url = "https://flip-apiakib.vercel.app/ai/gpt-5"
    params = {"text": "hello"}
    
    print(f"Testing URL: {url}")
    print(f"Parameters: {params}")
    
    try:
        response = requests.get(url, params=params)
        
        print(f"\nStatus: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type')}")
        
        print(f"Response: {response.text[:500]}...")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ SUCCESS: API response received")
            print("Parsed JSON response:")
            print(data)
            
            # Extract text response if available
            if 'text' in data:
                text_response = data['text']
                print(f"\nAI Response: {text_response}")
            
            return data
        else:
            print(f"\n❌ FAILED: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"\n❌ REQUEST FAILED: {str(e)}")
        return None

# Run the test
if __name__ == "__main__":
    result = test_flip_apiakib()
    if result:
        print('\n' + '='*50)
        print('🎉 Flip APIAKIB Test: SUCCESS')
        print(f"Response Data: {result}")
    else:
        print('\n' + '='*50)
        print('❌ Flip APIAKIB Test: FAILED')