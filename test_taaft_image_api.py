import requests
import json
import time
from urllib.parse import urljoin

def fetch_session_token():
    """
    Fetch a fresh session token from the main page
    """
    try:
        session = requests.Session()
        
        # First, visit the main page to get cookies and tokens
        main_url = 'https://theresanaiforthat.com/@taaft/image-generator/'
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        
        response = session.get(main_url, headers=headers, timeout=30)
        
        # Try to extract se_accept_encoding from page or cookies
        se_token = None
        
        # Check cookies
        for cookie in session.cookies:
            if 'se_' in cookie.name:
                print(f"Found cookie: {cookie.name}={cookie.value}")
        
        # Check if token is in page JavaScript
        import re
        matches = re.findall(r'se_accept_encoding["\']?\s*[:=]\s*["\']([a-zA-Z0-9]+)["\']', response.text)
        if matches:
            se_token = matches[0]
            print(f"Found se_accept_encoding in page: {se_token}")
        
        return session, se_token
        
    except Exception as e:
        print(f"Failed to fetch session token: {e}")
        return None, None


def test_taaft_image_generator():
    """
    Reverse engineering test for TAAFT Image Generator API
    Based on captured request headers from browser dev tools
    
    Endpoint: https://theresanaiforthat.com/api/generate/
    Method: POST
    Content-Type: multipart/form-data
    """
    
    print('🔍 TAAFT Image Generator API Reverse Engineering')
    print('=' * 60)
    
    base_url = 'https://theresanaiforthat.com'
    generate_endpoint = '/api/generate/'
    full_url = urljoin(base_url, generate_endpoint)
    
    # Test prompts
    test_prompts = [
        "A beautiful sunset over mountains",
        "A cute cat sitting on a windowsill",
        "Futuristic city with flying cars",
        "Serene lake surrounded by pine trees"
    ]
    
    # Required headers from captured request
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': f'{base_url}/@taaft/image-generator/',
        'Origin': base_url,
        'Sec-Ch-Ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
    }
    
    # Special headers from capture
    special_headers = {
        'se_accept_encoding': 's64f8RMdS3G35ZsMA399mhl93m1O1kd35099mh7l93m1wTVyMzIcDlpbvQheAZ75',
        'se_initial_referrer': '',
        'X-Content-Type-Options': 'nosniff',
    }
    
    headers.update(special_headers)
    
    results = []
    successful_generations = []
    
    # Get fresh session and token
    print("📡 Fetching fresh session token...")
    session, se_token = fetch_session_token()
    
    if se_token:
        print(f"✅ Got session token: {se_token[:20]}...")
        headers['se_accept_encoding'] = se_token
    else:
        print("⚠️ No dynamic token found, using static token")
    
    if session is None:
        session = requests.Session()
    
    for i, prompt in enumerate(test_prompts, 1):
        print(f"\n🧪 Test {i}: {prompt}")
        print('-' * 60)
        
        try:
            # Prepare multipart form data
            files = {
                'prompt': (None, prompt),
            }
            
            # Optional: Add aspect ratio parameter
            data = {
                'aspect_ratio': '1:1',  # Square format
                'width': '1024',
                'height': '1024',
            }
            
            # Combine files and data
            response = session.post(
                full_url,
                headers=headers,
                files={**files, **data},
                timeout=60,
                allow_redirects=False
            )
            
            result = {
                'test_number': i,
                'prompt': prompt,
                'url': full_url,
                'status_code': response.status_code,
                'content_type': response.headers.get('content-type', 'unknown'),
                'response_size': len(response.content),
                'success': response.status_code == 200,
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
            }
            
            print(f"Status Code: {response.status_code}")
            print(f"Content-Type: {result['content_type']}")
            print(f"Response Size: {result['response_size']} bytes")
            
            # Check if we got an image
            if response.status_code == 200:
                if 'image' in result['content_type'].lower():
                    print("✅ SUCCESS: Image received!")
                    result['image_data'] = True
                    
                    # Save the generated image
                    filename = f"taaft_generated_image_{i}_{int(time.time())}.png"
                    with open(filename, 'wb') as f:
                        f.write(response.content)
                    result['saved_file'] = filename
                    print(f"💾 Image saved as: {filename}")
                    successful_generations.append(result)
                    
                elif 'application/json' in result['content_type']:
                    print("✅ SUCCESS: JSON response received")
                    try:
                        json_response = response.json()
                        result['json_response'] = json_response
                        print(f"Response JSON: {json.dumps(json_response, indent=2)[:500]}...")
                        
                        # Check if JSON contains image URL
                        if isinstance(json_response, dict):
                            for key in ['image_url', 'url', 'image', 'output']:
                                if key in json_response:
                                    print(f"📷 Found image URL in '{key}': {json_response[key]}")
                                    result['image_url'] = json_response[key]
                                    successful_generations.append(result)
                                    break
                    except json.JSONDecodeError:
                        result['raw_response'] = response.text[:300]
                        print(f"Raw response: {response.text[:300]}...")
                else:
                    print("⚠️ Response received but not sure what it is")
                    result['raw_response'] = response.text[:300]
                    print(f"Response preview: {response.text[:300]}")
            else:
                print(f"❌ FAILED: HTTP {response.status_code}")
                try:
                    error_text = response.text[:500]
                    result['error'] = error_text
                    print(f"Error response: {error_text}...")
                except:
                    result['error'] = "Could not read error response"
            
            results.append(result)
            
            # Rate limiting - wait between requests
            if i < len(test_prompts):
                print("⏳ Waiting 2 seconds before next request...")
                time.sleep(2)
                
        except requests.exceptions.RequestException as e:
            print(f"❌ REQUEST FAILED: {str(e)}")
            results.append({
                'test_number': i,
                'prompt': prompt,
                'success': False,
                'error': str(e),
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
            })
        except Exception as e:
            print(f"❌ UNEXPECTED ERROR: {str(e)}")
            results.append({
                'test_number': i,
                'prompt': prompt,
                'success': False,
                'error': f"Unexpected error: {str(e)}",
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
            })
    
    # Print summary
    print('\n' + '=' * 60)
    print('📊 TEST SUMMARY')
    print('=' * 60)
    print(f"Total tests: {len(test_prompts)}")
    print(f"Successful: {len(successful_generations)}")
    print(f"Failed: {len(results) - len(successful_generations)}")
    print(f"Success rate: {len(successful_generations)/len(test_prompts)*100:.1f}%")
    
    if successful_generations:
        print('\n✅ SUCCESSFUL GENERATIONS:')
        for gen in successful_generations:
            print(f"\n🟢 Test {gen['test_number']}: {gen['prompt']}")
            print(f"   Status: {gen['status_code']}")
            print(f"   Content-Type: {gen['content_type']}")
            if 'saved_file' in gen:
                print(f"   Saved File: {gen['saved_file']}")
            if 'image_url' in gen:
                print(f"   Image URL: {gen['image_url']}")
    
    # Save detailed results
    save_results = []
    for r in results:
        r_copy = r.copy()
        r_copy.pop('image_data', None)
        save_results.append(r_copy)
    
    with open('taaft_api_test_results.json', 'w') as f:
        json.dump(save_results, f, indent=2)
    print("\n💾 Detailed results saved to: taaft_api_test_results.json")
    
    return successful_generations


def analyze_api_requirements():
    """
    Analyze what's required for the TAAFT API
    Based on the HTML page analysis
    """
    print('\n' + '=' * 60)
    print('📋 API REQUIREMENTS ANALYSIS')
    print('=' * 60)
    
    requirements = {
        'endpoint': 'https://theresanaiforthat.com/api/generate/',
        'method': 'POST',
        'content_type': 'multipart/form-data',
        'required_headers': [
            'User-Agent',
            'Referer',
            'Origin',
            'se_accept_encoding (special token)',
        ],
        'form_parameters': {
            'prompt': '(required) Text description of the image',
            'aspect_ratio': '(optional) Square(1:1), Landscape(16:9), Portrait(9:16), etc.',
            'width': '(optional) Max 2000px',
            'height': '(optional) Max 2000px',
            'image': '(optional) Upload reference image (PNG, JPG, GIF up to 10MB)'
        },
        'features': [
            'Unlimited free generations',
            'Commercial use allowed',
            'Multiple aspect ratios',
            'Image-to-image capability',
            'Various artistic styles'
        ],
        'rate_limits': 'Unknown - needs testing',
        'authentication': 'None detected (no API key required)'
    }
    
    print(json.dumps(requirements, indent=2))
    return requirements


if __name__ == "__main__":
    print("Starting TAAFT Image Generator API Reverse Engineering...\n")
    
    # First, analyze requirements
    analyze_api_requirements()
    
    # Then run tests
    print("\n" + "=" * 60)
    print("🚀 RUNNING API TESTS")
    print("=" * 60 + "\n")
    
    successful = test_taaft_image_generator()
    
    print(f"\n🎉 Testing complete! Generated {len(successful)} images successfully.")
