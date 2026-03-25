import requests
import json
import time
from urllib.parse import urljoin

def test_openai_fm_api():
    """
    Reverse engineering test for OpenAI.fm Audio Generation API
    Based on captured request headers from browser dev tools
    
    Endpoint: https://www.openai.fm/api/generate
    Method: POST
    Content-Type: multipart/form-data
    Response: audio/wav (direct audio file)
    """
    
    print('🔍 OpenAI.fm Audio Generator API Reverse Engineering')
    print('=' * 60)
    
    base_url = 'https://www.openai.fm'
    generate_endpoint = '/api/generate'
    full_url = urljoin(base_url, generate_endpoint)
    
    # Test prompts for audio generation
    test_prompts = [
        "Create a peaceful piano melody",
        "Generate ambient electronic music",
        "Create a upbeat pop track",
        "Generate cinematic orchestral music",
        "Create lo-fi hip hop beats"
    ]
    
    # Headers from captured request
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Origin': 'https://www.openai.fm',
        'Referer': 'https://www.openai.fm/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
    }
    
    # Cookies from capture (these will need to be obtained via session)
    cookies_from_capture = {
        '_ga': 'GA1.1.624713172.1773862445',
        '_ga_NME7NXL4L0': 'GS2.1.s1773862445$o1$g1$t1773862474$j31$l0$h0',
    }
    
    results = []
    successful_generations = []
    
    # Create session to handle cookies
    session = requests.Session()
    
    # First, visit the main page to get initial cookies
    print("📡 Fetching initial cookies from main page...")
    try:
        main_response = session.get('https://www.openai.fm/', headers=headers, timeout=30)
        print(f"✅ Main page loaded (status: {main_response.status_code})")
        print(f"🍪 Cookies received: {len(session.cookies)}")
        
        # Update headers with referer
        headers['Referer'] = 'https://www.openai.fm/'
        
    except Exception as e:
        print(f"⚠️ Warning: Could not fetch main page: {e}")
    
    for i, prompt in enumerate(test_prompts, 1):
        print(f"\n🧪 Test {i}: {prompt}")
        print('-' * 60)
        
        try:
            # Prepare multipart form data
            # We need to figure out what form fields are expected
            # Common fields for audio generation:
            files = {
                'prompt': (None, prompt),
                'duration': (None, '30'),  # seconds
                'genre': (None, 'ambient'),
                'tempo': (None, 'medium'),
            }
            
            # Try the request
            response = session.post(
                full_url,
                headers=headers,
                files=files,
                timeout=120,  # Audio generation may take longer
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
            
            # Check if we got audio
            if response.status_code == 200:
                content_type = result['content_type'].lower()
                
                if 'audio' in content_type or result['content_type'] == 'audio/wav':
                    print("✅ SUCCESS: Audio file received!")
                    result['audio_data'] = True
                    
                    # Save the generated audio
                    filename = f"openai_fm_generated_audio_{i}_{int(time.time())}.wav"
                    with open(filename, 'wb') as f:
                        f.write(response.content)
                    result['saved_file'] = filename
                    print(f"💾 Audio saved as: {filename}")
                    print(f"🎵 Audio size: {result['response_size']} bytes")
                    successful_generations.append(result)
                    
                elif 'application/json' in content_type:
                    print("✅ SUCCESS: JSON response received")
                    try:
                        json_response = response.json()
                        result['json_response'] = json_response
                        print(f"Response JSON: {json.dumps(json_response, indent=2)[:500]}...")
                        
                        # Check if JSON contains audio URL or data
                        for key in ['audio_url', 'url', 'audio', 'output', 'file']:
                            if key in json_response:
                                print(f"🎵 Found audio in '{key}': {json_response[key][:100] if isinstance(json_response[key], str) else json_response[key]}")
                                result['audio_info'] = json_response[key]
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
                print("⏳ Waiting 3 seconds before next request...")
                time.sleep(3)
                
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
                print(f"   File Size: {gen['response_size']} bytes")
            if 'audio_info' in gen:
                print(f"   Audio Info: {gen['audio_info']}")
    
    # Save detailed results
    save_results = []
    for r in results:
        r_copy = r.copy()
        r_copy.pop('audio_data', None)
        save_results.append(r_copy)
    
    with open('openai_fm_api_test_results.json', 'w') as f:
        json.dump(save_results, f, indent=2)
    print("\n💾 Detailed results saved to: openai_fm_api_test_results.json")
    
    return successful_generations


def analyze_form_parameters():
    """
    Analyze what form parameters might be needed
    Based on common audio generation APIs
    """
    print('\n' + '=' * 60)
    print('📋 POTENTIAL API PARAMETERS')
    print('=' * 60)
    
    parameters = {
        'required': {
            'prompt': 'Text description of the audio to generate',
        },
        'optional': {
            'duration': 'Length in seconds (e.g., 30, 60, 120)',
            'genre': 'Music genre (ambient, classical, electronic, pop, rock, jazz, etc.)',
            'tempo': 'Speed (slow, medium, fast)',
            'mood': 'Emotion (happy, sad, energetic, calm, dramatic)',
            'instruments': 'Preferred instruments (piano, guitar, drums, strings)',
            'format': 'Output format (wav, mp3, ogg)',
            'seed': 'Random seed for reproducibility',
        },
        'possible_headers': {
            'X-API-Key': 'API key if required',
            'Authorization': 'Bearer token if authentication needed',
            'Content-Type': 'multipart/form-data',
        }
    }
    
    print(json.dumps(parameters, indent=2))
    return parameters


if __name__ == "__main__":
    print("Starting OpenAI.fm Audio Generator API Reverse Engineering...\n")
    
    # First, analyze potential parameters
    analyze_form_parameters()
    
    # Then run tests
    print("\n" + "=" * 60)
    print("🚀 RUNNING API TESTS")
    print("=" * 60 + "\n")
    
    successful = test_openai_fm_api()
    
    print(f"\n🎉 Testing complete! Generated {len(successful)} audio files successfully.")
