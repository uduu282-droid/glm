import requests
from urllib.parse import quote

def test_flip_gen_api():
    print("🧪 Testing Flip Gen API: flip-gen.vercel.app")
    print("==================================================\n")
    
    base_url = "https://flip-gen.vercel.app"
    
    # Available styles
    styles = [
        'realistic', 'anime', 'fantasy', 'cyberpunk', 'watercolor', 
        'oil-painting', 'pixel-art', 'sketch', 'cartoon', 'abstract', 
        'vintage', 'steampunk'
    ]
    
    # Test with a simple prompt
    prompt = 'a beautiful landscape'
    negative_prompt = 'blurry, bad quality'
    
    print(f"Testing {len(styles)} available styles with prompt: '{prompt}'\n")
    
    working_styles = []
    
    for style in styles:
        print(f"\nTesting style: {style}")
        
        url = f"{base_url}/ai/image/{style}"
        params = {
            'prompt': prompt,
            'negative_prompt': negative_prompt
        }
        
        try:
            response = requests.get(url, params=params, timeout=30)
            
            print(f"Status: {response.status_code}")
            print(f"Content-Type: {response.headers.get('content-type')}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print("✅ SUCCESS: API response received")
                    print(f"Response: {data}")
                    
                    if data.get('status', False):
                        image_url = data.get('image_url', '')
                        if image_url:
                            print(f"Image URL: {image_url}")
                            working_styles.append(style)
                    else:
                        print(f"⚠️  API returned with status: {data.get('status')}")
                        if 'error' in data:
                            print(f"Error: {data['error']}")
                            
                except ValueError:
                    print("✅ SUCCESS: Response received (not JSON)")
                    print(f"Response: {response.text[:200]}...")
                    working_styles.append(style)
            else:
                print(f"❌ FAILED: {response.status_code}")
                print(f"Response: {response.text[:200]}...")
                
        except Exception as e:
            print(f"❌ REQUEST FAILED: {str(e)}")
    
    print(f"\n\n✅ Working styles ({len(working_styles)}): {working_styles}")
    return working_styles

def test_specific_examples():
    print("\n\n🧪 Testing Specific Examples Provided")
    print("=====================================\n")
    
    examples = [
        {
            'name': 'Simple Prompt (Anime Style)',
            'url': 'https://flip-gen.vercel.app/ai/image/anime',
            'params': {'prompt': 'naruto standing on mountain'}
        },
        {
            'name': 'Prompt with Negative Prompt (Anime Style)',
            'url': 'https://flip-gen.vercel.app/ai/image/anime',
            'params': {
                'prompt': 'naruto standing on mountain',
                'negative_prompt': 'blurry,bad quality,low details'
            }
        }
    ]
    
    for example in examples:
        print(f"Testing: {example['name']}")
        print(f"URL: {example['url']}")
        print(f"Params: {example['params']}")
        
        try:
            response = requests.get(example['url'], params=example['params'], timeout=30)
            
            print(f"Status: {response.status_code}")
            print(f"Content-Type: {response.headers.get('content-type')}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print("✅ SUCCESS: API response received")
                    print(f"Response: {data}")
                except ValueError:
                    print("✅ SUCCESS: Response received (not JSON)")
                    print(f"Response: {response.text[:200]}...")
            else:
                print(f"❌ FAILED: {response.status_code}")
                print(f"Response: {response.text[:200]}...")
                
        except Exception as e:
            print(f"❌ REQUEST FAILED: {str(e)}")

if __name__ == "__main__":
    working_styles = test_flip_gen_api()
    test_specific_examples()
    
    print(f'\n🎉 Flip Gen API Testing Complete!')
    print(f'Total working styles: {len(working_styles)} out of 12')
    
    if working_styles:
        print(f'Working styles: {", ".join(working_styles)}')