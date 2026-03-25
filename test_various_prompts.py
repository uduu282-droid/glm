import requests
import time

def test_various_prompts():
    print("🧪 Testing Flip Gen API with Different Prompts")
    print("==============================================\n")
    
    base_url = "https://flip-gen.vercel.app/ai/image/realistic"
    
    # Try different prompts to see which ones work
    test_prompts = [
        "a cat",
        "a dog", 
        "a flower",
        "a tree",
        "a house",
        "mountains",
        "ocean",
        "sunset",
        "portrait",
        "simple art"
    ]
    
    results = []
    
    for prompt in test_prompts:
        print(f"Testing prompt: '{prompt}'")
        
        params = {
            'prompt': prompt,
            'negative_prompt': 'blurry, bad quality'
        }
        
        try:
            response = requests.get(base_url, params=params, timeout=30)
            
            print(f"  Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    status = data.get('status', False)
                    print(f"  Success: {status}")
                    
                    if status and 'image_url' in data:
                        print(f"  Image URL: {data['image_url']}")
                        results.append((prompt, True, data['image_url']))
                    elif 'error' in data:
                        print(f"  Error: {data['error']}")
                        results.append((prompt, False, data['error']))
                    else:
                        print(f"  Data: {data}")
                        results.append((prompt, False, str(data)))
                except:
                    print(f"  Non-JSON response: {response.text[:100]}")
                    results.append((prompt, False, response.text[:100]))
            else:
                print(f"  Failed with status {response.status_code}")
                results.append((prompt, False, f"HTTP {response.status_code}"))
        
        except Exception as e:
            print(f"  Exception: {str(e)}")
            results.append((prompt, False, str(e)))
        
        # Wait between requests to be respectful
        time.sleep(2)
        print()
    
    print("SUMMARY:")
    print("========")
    working = [(p, url) for p, success, url in results if success]
    failing = [(p, error) for p, success, error in results if not success]
    
    print(f"Working prompts: {len(working)}")
    for prompt, url in working:
        print(f"  ✓ {prompt}: {url}")
    
    print(f"\nFailing prompts: {len(failing)}")
    for prompt, error in failing:
        print(f"  ✗ {prompt}: {error}")

if __name__ == "__main__":
    test_various_prompts()