import requests
import urllib.parse
import json

def test_python_image_endpoints():
    print('🐍 Testing Python Image Generation Endpoints')
    print('==========================================\n')
    
    endpoints = [
        # From test_flux_api.py and test_flux_detailed.py
        {
            'name': 'Flux API (Python)',
            'url': 'https://fast-flux-demo.replicate.workers.dev/api/generate-image',
            'method': 'GET',
            'params': {'text': 'A beautiful sunset'}
        },
        
        # From test_ashlynn_api.py and test_ashlynn_generate.py
        {
            'name': 'Ashlynn Image API (Python)',
            'url': 'https://image.itz-ashlynn.workers.dev/generate',
            'method': 'GET',
            'params': {'prompt': 'a beautiful landscape', 'version': 'flux', 'size': '1024x1024'}
        },
        {
            'name': 'Ashlynn Styles (Python)',
            'url': 'https://image.itz-ashlynn.workers.dev/styles',
            'method': 'GET',
            'params': {}
        },
        
        # Test the base URLs
        {
            'name': 'Ashlynn Base URL',
            'url': 'https://image.itz-ashlynn.workers.dev/',
            'method': 'GET',
            'params': {}
        }
    ]
    
    results = []
    live_endpoints = []
    
    for endpoint in endpoints:
        print(f"\n🧪 Testing: {endpoint['name']}")
        print(f"URL: {endpoint['url']}")
        print(f"Method: {endpoint['method']}")
        
        try:
            if endpoint['method'] == 'GET':
                if endpoint['params']:
                    full_url = f"{endpoint['url']}?{urllib.parse.urlencode(endpoint['params'])}"
                else:
                    full_url = endpoint['url']
                
                print(f"Full URL: {full_url}")
                response = requests.get(full_url, timeout=30)
            else:
                response = requests.post(endpoint['url'], json=endpoint['params'], timeout=30)
            
            result = {
                'name': endpoint['name'],
                'url': endpoint['url'],
                'method': endpoint['method'],
                'status_code': response.status_code,
                'content_type': response.headers.get('content-type', 'unknown'),
                'success': response.status_code == 200
            }
            
            print(f"Status: {response.status_code}")
            print(f"Content-Type: {result['content_type']}")
            
            if response.status_code == 200:
                if 'image' in result['content_type']:
                    print("✅ SUCCESS: Image response received!")
                    result['image_size'] = len(response.content)
                    print(f"Image size: {result['image_size']} bytes")
                    
                    # Save image
                    filename = f"python_test_{endpoint['name'].replace(' ', '_')}_{int(time.time())}.png"
                    with open(filename, 'wb') as f:
                        f.write(response.content)
                    result['saved_file'] = filename
                    print(f"💾 Image saved as: {filename}")
                    live_endpoints.append(result)
                else:
                    print("✅ SUCCESS: API response received")
                    try:
                        result['response'] = response.text[:300]
                        print(f"Response preview: {result['response']}...")
                    except:
                        result['response'] = "Could not read response"
                    live_endpoints.append(result)
            else:
                print(f"❌ FAILED: {response.status_code}")
                try:
                    result['error'] = response.text[:200]
                    print(f"Error: {result['error']}...")
                except:
                    result['error'] = "Could not read error response"
                results.append(result)
                
        except Exception as e:
            print(f"❌ REQUEST FAILED: {str(e)}")
            results.append({
                'name': endpoint['name'],
                'url': endpoint['url'],
                'method': endpoint['method'],
                'success': False,
                'error': str(e)
            })
    
    # Summary
    print('\n' + '='*50)
    print('📊 PYTHON TEST RESULTS')
    print('='*50)
    print(f"Total endpoints tested: {len(endpoints)}")
    print(f"Working endpoints: {len(live_endpoints)}")
    print(f"Failed endpoints: {len(results) - len(live_endpoints)}")
    
    if live_endpoints:
        print('\n✅ LIVE PYTHON ENDPOINTS:')
        print('-'*30)
        for endpoint in live_endpoints:
            print(f"\n🟢 {endpoint['name']}")
            print(f"   URL: {endpoint['url']}")
            print(f"   Status: {endpoint['status_code']}")
            if 'image_size' in endpoint:
                print(f"   Image Size: {endpoint['image_size']} bytes")
                print(f"   Saved File: {endpoint['saved_file']}")
            elif 'response' in endpoint:
                print(f"   Response: {endpoint['response'][:100]}...")
    
    return live_endpoints

# Import time for timestamp
import time

# Run the Python tests
if __name__ == "__main__":
    live_endpoints = test_python_image_endpoints()
    print(f"\n🎉 Python testing complete! Found {len(live_endpoints)} live endpoints.")