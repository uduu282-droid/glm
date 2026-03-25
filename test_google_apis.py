import requests
import time

# Test Google API keys
def test_google_api_keys():
    print("🔍 Testing Google API Keys\n")
    
    api_keys = [
        "AIzaSyAeU_ij0fhCNAjYiKbxyco-DmSib2hwuTI",
        "AIzaSyAB0wZpI-wNe-nh-6tLLvk2w_lCqOFIy-s",
        "AIzaSyC8QipAcu4VhqDnF-9MTN-V3ED98E2nhx4",
        "AIzaSyDXIOIfSVIsOVVxacvbO1B0I68TbtsYgew",
        "AIzaSyCu4vZyl4af4UQu1LsoKVcHVXkqegbg7Ro",
        "AIzaSyAS6KrhRh_Vp95y11oDrXGfzmocApQeB14",
        "AIzaSyC0QKGnXrgSnNn_ze_gzim1oPp8ZYP3rXk",
        "AIzaSyASx2zLQFSBzaY1Jc_x8TgC053Cbdp89WM",
        "AIzaSyAOZczwL-o1QOnyIUeglXA4aDYJ6u4saZA",
        "AIzaSyDKW-9Y5uCVYcA2DFcja5cFseD97wkjTcg",
        "AIzaSyDE9_3ikb_l8yc4bVts6Sq7R4SbbIBcKVE",
        "AIzaSyDwDb_oOuF6jS7XBGgxog_Uu9QC7Nls60s"
    ]
    
    # Common Google API endpoints to test
    endpoints_to_test = [
        {
            "name": "Geocoding API",
            "url": "https://maps.googleapis.com/maps/api/geocode/json",
            "params": {"address": "New York", "key": ""}
        },
        {
            "name": "Places API",
            "url": "https://maps.googleapis.com/maps/api/place/textsearch/json",
            "params": {"query": "restaurant", "key": ""}
        },
        {
            "name": "Distance Matrix API",
            "url": "https://maps.googleapis.com/maps/api/distancematrix/json",
            "params": {"origins": "New York", "destinations": "Los Angeles", "key": ""}
        },
        {
            "name": "Static Maps API",
            "url": "https://maps.googleapis.com/maps/api/staticmap",
            "params": {"center": "New York", "zoom": "13", "size": "600x300", "key": ""}
        },
        {
            "name": "Urlshortener API",
            "url": "https://www.googleapis.com/urlshortener/v1/url",
            "params": {"key": ""},
            "method": "GET"
        }
    ]
    
    for i, api_key in enumerate(api_keys, 1):
        print(f"Testing API Key #{i}: {api_key[:12]}...")
        
        # Test each endpoint with this API key
        for endpoint in endpoints_to_test:
            print(f"  - Testing {endpoint['name']}...")
            
            params = endpoint['params'].copy()
            params['key'] = api_key
            
            try:
                if endpoint.get('method') == 'GET':
                    response = requests.get(endpoint['url'], params=params, timeout=10)
                else:
                    # For most Google APIs we'll use GET with parameters
                    response = requests.get(endpoint['url'], params=params, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if 'error_message' in data and data['error_message']:
                        print(f"    ❌ {endpoint['name']}: Error - {data['error_message']}")
                    elif 'status' in data:
                        if data['status'] in ['OK', 'ZERO_RESULTS']:
                            print(f"    ✅ {endpoint['name']}: Working (Status: {data['status']})")
                        else:
                            print(f"    ❌ {endpoint['name']}: Status - {data['status']}")
                    else:
                        print(f"    ✅ {endpoint['name']}: Working (200 OK)")
                        
                elif response.status_code == 403:
                    print(f"    ❌ {endpoint['name']}: Forbidden - Invalid API key or restricted")
                elif response.status_code == 400:
                    print(f"    ❌ {endpoint['name']}: Bad Request - Missing parameters")
                elif response.status_code == 429:
                    print(f"    ⚠️  {endpoint['name']}: Rate limited")
                else:
                    print(f"    ❌ {endpoint['name']}: Status {response.status_code}")
                    
            except Exception as e:
                print(f"    ❌ {endpoint['name']}: Request failed - {str(e)}")
        
        print()

# Run the test
test_google_api_keys()