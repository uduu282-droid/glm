import requests
import urllib.parse

# Test the image.itz-ashlynn.workers.dev API
def test_ashlynn_image_api():
    print("🔍 Testing Ashlynn Image API\n")
    
    # First, let's try to see what the base URL returns
    base_url = "https://image.itz-ashlynn.workers.dev/"
    
    print("Testing base URL...")
    try:
        response = requests.get(base_url, timeout=10)
        print(f"Base URL Status Code: {response.status_code}")
        print(f"Base URL Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
        print(f"Base URL Response Length: {len(response.text)} characters")
        print(f"Base URL Preview: {response.text[:200]}...")
    except Exception as e:
        print(f"❌ Base URL request failed: {str(e)}")
    
    print()
    
    # Now let's try with a sample prompt as a query parameter
    prompt = "a beautiful landscape"
    encoded_prompt = urllib.parse.quote(prompt)
    api_url = f"{base_url}?prompt={encoded_prompt}"
    
    print(f"Testing with prompt: {prompt}")
    print(f"API URL: {api_url}")
    
    try:
        response = requests.get(api_url, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
        
        if response.status_code == 200:
            if response.headers.get("Content-Type", "").startswith("image/"):
                print("✅ Success! Image response received")
                # Save the image
                with open("ashlynn_api_image.png", "wb") as f:
                    f.write(response.content)
                print("Image saved as ashlynn_api_image.png")
            else:
                print("📝 Non-image response:")
                print(response.text[:500])
        else:
            print(f"❌ Error: {response.status_code}")
            if hasattr(response, 'text'):
                print(f"Response: {response.text[:500]}")
                
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")

# Run the test
test_ashlynn_image_api()