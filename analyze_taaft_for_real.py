import requests
import re
import json

def analyze_taaft_page():
    """
    Download and analyze the TAAFT image generator page
    to find how the API is called
    """
    
    url = 'https://theresanaiforthat.com/@taaft/image-generator/'
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    
    print("📥 Downloading TAAFT image generator page...")
    
    session = requests.Session()
    response = session.get(url, headers=headers, timeout=30)
    
    print(f"Status: {response.status_code}")
    print(f"Page size: {len(response.text)} bytes")
    
    # Save HTML for analysis
    with open('taaft_page_source.html', 'w', encoding='utf-8') as f:
        f.write(response.text)
    print("💾 Saved HTML to: taaft_page_source.html")
    
    # Look for JavaScript files
    js_files = re.findall(r'src=["\'](.*?\.js)["\']', response.text)
    print(f"\n📄 Found {len(js_files)} JavaScript files")
    
    # Look for se_accept_encoding
    se_matches = re.findall(r'se_accept_encoding["\']?\s*[:=]\s*[\"\'\s]*([a-zA-Z0-9+/=]+)', response.text)
    if se_matches:
        print(f"\n✅ Found se_accept_encoding: {se_matches[0]}")
    else:
        print("\n❌ No se_accept_encoding found in page")
    
    # Look for API calls
    api_matches = re.findall(r'(?:fetch|axios|ajax)\([\'"`](.*?/api/.*?)[\'"`]', response.text)
    if api_matches:
        print(f"\n🔗 Found API calls: {api_matches}")
    
    # Look for any generate endpoints
    gen_matches = re.findall(r'(/api/generate/?)', response.text)
    if gen_matches:
        print(f"\n🎯 Found generate endpoint references: {set(gen_matches)}")
    
    # Check cookies
    print(f"\n🍪 Cookies received:")
    for cookie in session.cookies:
        print(f"   {cookie.name} = {cookie.value[:50] if len(cookie.value) > 50 else cookie.value}")
    
    # Search for any tokens or auth headers
    token_patterns = [
        r'["\']token["\']\s*:\s*["\']([^"\']+)["\']',
        r'["\']auth["\']\s*:\s*["\']([^"\']+)["\']',
        r'["\']api[_-]?key["\']\s*:\s*["\']([^"\']+)["\']',
        r'Authorization["\']?\s*:\s*["\']([^"\']+)["\']',
    ]
    
    for pattern in token_patterns:
        matches = re.findall(pattern, response.text, re.IGNORECASE)
        if matches:
            print(f"\n🔑 Found potential tokens (pattern: {pattern[:30]}...):")
            for match in matches[:3]:
                print(f"   {match[:50]}...")
    
    # Look for FormData usage
    formdata_usage = re.findall(r'FormData\(\)', response.text)
    if formdata_usage:
        print(f"\n📦 Found FormData usage: {len(formdata_usage)} times")
    
    # Look for POST requests
    post_requests = re.findall(r'post\s*\(\s*[\'"`](.*?)[\'"`]', response.text)
    if post_requests:
        print(f"\n📤 Found POST requests to: {post_requests[:5]}")
    
    return session, response.text


def test_with_browser_headers():
    """
    Test API with exact browser-like headers including all cookies
    """
    
    print("\n" + "="*60)
    print("Testing with complete browser simulation")
    print("="*60)
    
    # First get cookies and session
    session, html = analyze_taaft_page()
    
    # Now try API call with the same session
    api_url = 'https://theresanaiforthat.com/api/generate/'
    
    # Complete browser headers
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'multipart/form-data',
        'Origin': 'https://theresanaiforthat.com',
        'Referer': 'https://theresanaiforthat.com/@taaft/image-generator/',
        'Sec-Ch-Ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
    }
    
    # Add any se_ headers from cookies
    for cookie in session.cookies:
        if cookie.name.startswith('se_'):
            headers[cookie.name] = cookie.value
            print(f"Added header from cookie: {cookie.name} = {cookie.value[:30]}...")
    
    prompt = "A simple test image"
    
    files = {
        'prompt': (None, prompt),
        'aspect_ratio': (None, '1:1'),
        'width': (None, '512'),
        'height': (None, '512'),
    }
    
    print(f"\n🧪 Testing API with prompt: '{prompt}'")
    
    try:
        response = session.post(api_url, headers=headers, files=files, timeout=60)
        
        print(f"Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'unknown')}")
        print(f"Response Size: {len(response.content)} bytes")
        
        # Save response
        with open('api_response_debug.txt', 'wb') as f:
            f.write(response.content)
        print("💾 Response saved to: api_response_debug.txt")
        
        if response.status_code == 200:
            if len(response.content) > 0:
                print("✅ Got response!")
                
                # Try to detect if it's an image
                if response.content[:4] == b'\x89PNG':
                    print("🖼️ Response is a PNG image!")
                    with open('test_output.png', 'wb') as f:
                        f.write(response.content)
                    print("💾 Saved image to: test_output.png")
                elif response.content[:2] == b'\xff\xd8':
                    print("🖼️ Response is a JPEG image!")
                    with open('test_output.jpg', 'wb') as f:
                        f.write(response.content)
                    print("💾 Saved image to: test_output.jpg")
                else:
                    print(f"Response preview: {response.content[:200]}")
            else:
                print("⚠️ Empty response")
        else:
            print(f"❌ Failed with status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    test_with_browser_headers()
