import requests

def test_mcp_core_magic_model():
    print("🧪 Testing MCP Core API - Magic Model")
    print("=====================================\n")
    
    url = "https://t2i.mcpcore.xyz/generate"
    
    # Test with the working 'magic' model
    payload = {
        "prompt": "a beautiful landscape",
        "model": "magic"
    }
    
    print(f"Testing URL: {url}")
    print(f"Payload: {payload}")
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        
        print(f"\nStatus: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        print(f"\nResponse: {response.text}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"\nJSON Data: {data}")
                
                if data.get('success') and 'imageUrl' in data:
                    image_url = data['imageUrl']
                    print(f"\n✅ SUCCESS: Image generated!")
                    print(f"Image URL: {image_url}")
                    
                    # Optionally download and save the image
                    print(f"Downloading image from: {image_url}")
                    img_response = requests.get(image_url)
                    if img_response.status_code == 200:
                        filename = f"mcp_core_test_{data.get('id', 'image')}.jpg"
                        with open(filename, 'wb') as f:
                            f.write(img_response.content)
                        print(f"Image saved as: {filename}")
                        return data
                    else:
                        print(f"Failed to download image: {img_response.status_code}")
                        return data
                else:
                    print("\n⚠️  API returned but without image URL")
                    return data
                    
            except ValueError:
                print("\nResponse is not JSON")
                return None
        else:
            print(f"\n❌ FAILED: {response.status_code}")
            return None
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return None

if __name__ == "__main__":
    result = test_mcp_core_magic_model()
    if result:
        print('\n🎉 MCP Core Magic Model Test: SUCCESS')
        print(f"Response: {result}")
    else:
        print('\n❌ MCP Core Magic Model Test: FAILED')