import requests

def test_red_flip_banana_api():
    print("🧪 Testing Red Flip Banana API: flip-banana.vercel.app")
    print("==================================================\n")
    
    url = "https://flip-banana.vercel.app/generate"
    
    params = {
        "prompt": "banana"
    }
    
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
            
            # Extract image URL if available
            if 'response' in data and 'image_url' in data['response']:
                image_url = data['response']['image_url']
                print(f"\nImage URL: {image_url}")
            
            return data
        else:
            print(f"\n❌ FAILED: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"\n❌ REQUEST FAILED: {str(e)}")
        return None

# Run the test
if __name__ == "__main__":
    result = test_red_flip_banana_api()
    if result:
        print('\n' + '='*50)
        print('🎉 Red Flip Banana API Test: SUCCESS')
        print(f"Response Data: {result}")
    else:
        print('\n' + '='*50)
        print('❌ Red Flip Banana API Test: FAILED')