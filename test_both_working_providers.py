# Test Both Working Providers (Pollinations & Runware)

import requests
import json
from datetime import datetime

def test_working_providers():
    """Test both working providers with correct payloads"""
    
    base_url = "https://ai-image-gen-zeta.vercel.app/api/generate"
    prompt = "A young woman in a field of flowers"
    
    print("=" * 60)
    print("🧪 Testing WORKING PROVIDERS")
    print("=" * 60)
    
    results = []
    
    # Test 1: Pollinations
    print("\n" + "=" * 60)
    print("Testing POLLINATIONS")
    print("=" * 60)
    
    pollinations_payload = {
        "prompt": prompt,
        "model": "flux",
        "width": 1024,
        "height": 1024,
        "seed": 42,
        "nologo": True,
        "private": True
    }
    
    try:
        response = requests.post(
            f"{base_url}/pollinations",
            json=pollinations_payload,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        duration = response.elapsed.total_seconds()
        data = response.json()
        
        print(f"Status: {response.status_code}")
        print(f"Duration: {duration:.2f}s")
        
        if response.ok and "data" in data:
            print(f"✅ SUCCESS - Images: {len(data['data'])}")
            results.append({
                'provider': 'pollinations',
                'status': 'SUCCESS',
                'images': len(data['data']),
                'duration': duration
            })
        else:
            print(f"❌ FAILED: {data}")
            results.append({
                'provider': 'pollinations',
                'status': 'FAILED',
                'error': str(data)
            })
            
    except Exception as e:
        print(f"❌ EXCEPTION: {e}")
        results.append({
            'provider': 'pollinations',
            'status': 'EXCEPTION',
            'error': str(e)
        })
    
    # Test 2: Runware
    print("\n" + "=" * 60)
    print("Testing RUNWARE")
    print("=" * 60)
    
    runware_payload = {
        "prompt": prompt,
        "model": "runware:100@1",  # FLUX.1 Schnell
        "width": 1024,
        "height": 1024,
        "steps": 20,
        "CFGScale": 7.5,
        "numberResults": 1,
        "outputType": "URL"  # MUST BE UPPERCASE!
    }
    
    try:
        response = requests.post(
            f"{base_url}/runware",
            json=runware_payload,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        duration = response.elapsed.total_seconds()
        data = response.json()
        
        print(f"Status: {response.status_code}")
        print(f"Duration: {duration:.2f}s")
        
        if response.ok and "images" in data:
            print(f"✅ SUCCESS - Images: {len(data['images'])}")
            if data['images']:
                img = data['images'][0]
                if 'url' in img:
                    print(f"📷 Image URL: {img['url'][:80]}...")
                elif 'base64' in img:
                    print(f"📷 Base64: {len(img['base64'])} chars")
                elif 'dataURI' in img:
                    print(f"📷 Data URI: {len(img['dataURI'])} chars")
            
            results.append({
                'provider': 'runware',
                'status': 'SUCCESS',
                'images': len(data['images']),
                'duration': duration
            })
        else:
            print(f"❌ FAILED: {data}")
            results.append({
                'provider': 'runware',
                'status': 'FAILED',
                'error': str(data)
            })
            
    except Exception as e:
        print(f"❌ EXCEPTION: {e}")
        results.append({
            'provider': 'runware',
            'status': 'EXCEPTION',
            'error': str(e)
        })
    
    # Test 3: Runware with different model
    print("\n" + "=" * 60)
    print("Testing RUNWARE (FLUX.1 Dev)")
    print("=" * 60)
    
    runware_dev_payload = {
        "prompt": prompt,
        "model": "runware:101@1",  # FLUX.1 Dev
        "width": 1024,
        "height": 1024,
        "steps": 28,
        "CFGScale": 7.5,
        "numberResults": 1,
        "outputType": "URL"
    }
    
    try:
        response = requests.post(
            f"{base_url}/runware",
            json=runware_dev_payload,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        duration = response.elapsed.total_seconds()
        data = response.json()
        
        print(f"Status: {response.status_code}")
        print(f"Duration: {duration:.2f}s")
        
        if response.ok and "images" in data:
            print(f"✅ SUCCESS - Images: {len(data['images'])}")
            results.append({
                'provider': 'runware:101@1',
                'status': 'SUCCESS',
                'images': len(data['images']),
                'duration': duration
            })
        else:
            print(f"❌ FAILED: {data}")
            results.append({
                'provider': 'runware:101@1',
                'status': 'FAILED',
                'error': str(data)
            })
            
    except Exception as e:
        print(f"❌ EXCEPTION: {e}")
        results.append({
            'provider': 'runware:101@1',
            'status': 'EXCEPTION',
            'error': str(e)
        })
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    total = len(results)
    successful = sum(1 for r in results if r['status'] == 'SUCCESS')
    
    print(f"\nTotal Tests: {total}")
    print(f"✅ Successful: {successful} ({successful/total*100:.1f}%)")
    print(f"❌ Failed: {total - successful} ({(total-successful)/total*100:.1f}%)")
    
    print("\n📋 Results:")
    for i, result in enumerate(results, 1):
        status_icon = "✅" if result['status'] == 'SUCCESS' else "❌"
        print(f"{i}. {status_icon} {result['provider'].upper()}")
        if result['status'] == 'SUCCESS':
            print(f"   Images: {result['images']} | Time: {result['duration']:.2f}s")
    
    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"working_providers_test_{timestamp}.json"
    
    with open(filename, 'w') as f:
        json.dump({
            'timestamp': timestamp,
            'summary': {
                'total': total,
                'successful': successful,
                'failed': total - successful,
                'success_rate': f"{successful/total*100:.1f}%"
            },
            'results': results
        }, f, indent=2)
    
    print(f"\n💾 Results saved to: {filename}")
    
    # Final verdict
    print("\n" + "=" * 60)
    print("🎯 FINAL VERDICT")
    print("=" * 60)
    
    working = [r for r in results if r['status'] == 'SUCCESS']
    
    if working:
        print(f"\n✅ WORKING PROVIDERS: {len(working)}")
        for r in working:
            print(f"   - {r['provider'].upper()} ({r['images']} images, {r['duration']:.2f}s)")
        
        print("\n💡 Recommendation:")
        if any(r['provider'] == 'pollinations' for r in working):
            print("   Use Pollinations for quick, simple generations")
        if any('runware' in r['provider'] for r in working):
            print("   Use Runware for advanced control and fine-tuning")
    else:
        print("\n❌ NO PROVIDERS WORKING")


if __name__ == "__main__":
    test_working_providers()
