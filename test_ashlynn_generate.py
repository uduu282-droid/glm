import requests
import urllib.parse

# Test the actual image generation endpoint
def test_ashlynn_generate_api():
    print("🔍 Testing Ashlynn Image Generation API\n")
    
    # Test the styles endpoint first
    styles_url = "https://image.itz-ashlynn.workers.dev/styles"
    print("Testing styles endpoint...")
    try:
        response = requests.get(styles_url, timeout=10)
        print(f"Styles endpoint Status Code: {response.status_code}")
        if response.status_code == 200:
            print("✅ Styles endpoint working")
        else:
            print(f"❌ Styles endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Styles endpoint request failed: {str(e)}")
    
    print()
    
    # Now test the actual image generation endpoint
    prompt = "a beautiful landscape with mountains and sunset"
    encoded_prompt = urllib.parse.quote(prompt)
    generate_url = f"https://image.itz-ashlynn.workers.dev/generate?prompt={encoded_prompt}&version=flux&size=1024x1024"
    
    print(f"Testing image generation with prompt: {prompt}")
    print(f"URL: {generate_url}")
    print("This may take a moment...")
    
    try:
        response = requests.get(generate_url, timeout=60)  # Longer timeout for image generation
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
        
        if response.status_code == 200:
            if response.headers.get("Content-Type", "").startswith("image/"):
                print("✅ Success! Image response received")
                # Save the image
                with open("ashlynn_generated_image.png", "wb") as f:
                    f.write(response.content)
                print("Image saved as ashlynn_generated_image.png")
            else:
                print("📝 Non-image response:")
                print(response.text[:500])
        else:
            print(f"❌ Error: {response.status_code}")
            if hasattr(response, 'text'):
                print(f"Response: {response.text[:500]}")
                
    except requests.exceptions.Timeout:
        print("❌ Request timed out (60s)")
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")

# Run the test
test_ashlynn_generate_api()