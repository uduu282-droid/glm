# Test Runware Provider Specifically
# Testing with correct payload format

import requests
import json
from datetime import datetime

def test_runware():
    """Test Runware provider with different payload formats"""
    
    base_url = "https://ai-image-gen-zeta.vercel.app/api/generate"
    prompt = "A young woman in a field of flowers"
    
    print("=" * 60)
    print("🧪 Testing RUNWARE Provider")
    print("=" * 60)
    
    # Try different payload formats based on what the frontend uses
    
    # Format 1: From the code analysis (exact structure)
    payload1 = {
        "prompt": prompt,
        "model": "runware:100@1",
        "width": 1024,
        "height": 1024,
        "steps": 20,
        "CFGScale": 7.5,
        "numberResults": 1,
        "outputType": "url"
    }
    
    print("\n📋 Payload Format 1 (Standard):")
    print(json.dumps(payload1, indent=2))
    
    try:
        response = requests.post(
            f"{base_url}/runware",
            json=payload1,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"⏱️ Duration: {response.elapsed.total_seconds():.2f}s")
        print(f"\n📄 Response Headers:")
        for key, value in response.headers.items():
            print(f"   {key}: {value}")
        
        print(f"\n📄 Response Body (first 500 chars):")
        print(response.text[:500])
        
        try:
            data = response.json()
            print(f"\n✅ Parsed JSON:")
            print(json.dumps(data, indent=2))
            
            if response.ok:
                print("\n✅ SUCCESS!")
                if "images" in data:
                    print(f"📷 Images returned: {len(data['images'])}")
                    for i, img in enumerate(data['images'][:2]):
                        if 'url' in img:
                            print(f"   Image {i+1}: {img['url']}")
                        elif 'base64' in img:
                            print(f"   Image {i+1}: Base64 ({len(img['base64'])} chars)")
                        elif 'dataURI' in img:
                            print(f"   Image {i+1}: Data URI ({len(img['dataURI'])} chars)")
            else:
                print(f"\n❌ FAILED: {data}")
                
        except json.JSONDecodeError as e:
            print(f"\n❌ Invalid JSON: {e}")
            
    except Exception as e:
        print(f"\n❌ EXCEPTION: {e}")
    
    # Try alternative model IDs
    print("\n" + "=" * 60)
    print("Testing Alternative Model IDs...")
    print("=" * 60)
    
    alternative_models = [
        "runware:100@1",  # FLUX.1 Schnell
        "runware:101@1",  # FLUX.1 Dev
        "bfl:2@1",        # FLUX.1.1 Pro
    ]
    
    for model in alternative_models:
        print(f"\n🎨 Testing model: {model}")
        payload = {
            "prompt": prompt,
            "model": model,
            "width": 1024,
            "height": 1024,
            "steps": 20,
            "CFGScale": 7.5,
            "numberResults": 1
        }
        
        try:
            response = requests.post(
                f"{base_url}/runware",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=60
            )
            
            print(f"   Status: {response.status_code}")
            if response.ok:
                data = response.json()
                print(f"   ✅ SUCCESS - Images: {len(data.get('images', []))}")
            else:
                print(f"   ❌ Failed - {response.text[:100]}")
        except Exception as e:
            print(f"   ❌ Error: {e}")


if __name__ == "__main__":
    test_runware()
