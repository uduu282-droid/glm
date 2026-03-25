import requests
import urllib.parse

# Test the flux API endpoint
def test_flux_api():
    print("🔍 Testing Flux Image Generation API\n")
    
    # Test with a simple prompt
    prompt = "A beautiful sunset"
    encoded_prompt = urllib.parse.quote(prompt)
    url = f"https://fast-flux-demo.replicate.workers.dev/api/generate-image?text={encoded_prompt}"
    
    print(f"Testing URL: {url}")
    print(f"Prompt: {prompt}")
    print()
    
    try:
        response = requests.get(url, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Success! Response received")
            if response.headers.get("Content-Type", "").startswith("image/"):
                print("✅ Content-Type indicates image response")
                # Save the response for inspection
                with open("flux_test_response.png", "wb") as f:
                    f.write(response.content)
                print("Image saved as flux_test_response.png")
            else:
                print("📝 Non-image response:")
                print(response.text[:500])
        elif response.status_code == 500:
            print("❌ Server Error (500) - API may be experiencing issues")
            print(f"Response: {response.text[:500]}")
        elif response.status_code == 400:
            print("❌ Bad Request (400) - Check parameters")
            print(f"Response: {response.text[:500]}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text[:500]}")
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out (30s)")
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - API may be down")
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")

# Run the test
test_flux_api()