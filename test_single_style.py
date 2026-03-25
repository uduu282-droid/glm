import requests

def test_single_style():
    print("🧪 Testing Single Style - Realistic")
    print("===================================\n")
    
    url = "https://flip-gen.vercel.app/ai/image/realistic"
    params = {
        'prompt': 'a beautiful landscape',
        'negative_prompt': 'blurry, bad quality'
    }
    
    print(f"URL: {url}")
    print(f"Params: {params}")
    
    try:
        response = requests.get(url, params=params, timeout=30)
        
        print(f"\nStatus: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        print(f"\nResponse: {response.text}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"\nJSON Data: {data}")
            except:
                print("\nResponse is not JSON")
        
    except Exception as e:
        print(f"\nError: {str(e)}")

if __name__ == "__main__":
    test_single_style()