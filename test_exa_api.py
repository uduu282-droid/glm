import requests
import json

# Test the Exa.ai search API
def test_exa_api():
    print("🔍 Testing Exa.ai Search API\n")
    
    url = "https://api.exa.ai/search"
    api_key = "96e0fcca-9781-4785-b71e-c77ed653f168"
    
    headers = {
        "content-type": "application/json",
        "x-api-key": api_key
    }
    
    payload = {
        "query": "Latest news on Nvidia",
        "numResults": 10,
        "type": "auto",
        "contents": {
            "highlights": {
                "maxCharacters": 4000
            }
        }
    }
    
    print("Request Details:")
    print(f"URL: {url}")
    print(f"API Key: {api_key[:8]}...{api_key[-4:]}")
    print(f"Query: {payload['query']}")
    print(f"Number of results: {payload['numResults']}")
    print()
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Success! API is working")
            data = response.json()
            
            # Analyze the response
            if 'results' in data:
                results = data['results']
                print(f"Number of results returned: {len(results)}")
                
                if results:
                    print("\nFirst result preview:")
                    first_result = results[0]
                    print(f"Title: {first_result.get('title', 'N/A')}")
                    print(f"URL: {first_result.get('url', 'N/A')}")
                    print(f"Score: {first_result.get('score', 'N/A')}")
                    
                    if 'highlights' in first_result:
                        highlights = first_result['highlights']
                        print(f"Highlights: {highlights[:200]}..." if len(highlights) > 200 else f"Highlights: {highlights}")
                else:
                    print("No results found")
            else:
                print("Unexpected response format:")
                print(json.dumps(data, indent=2)[:500])
                
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Error message: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")

# Run the test
test_exa_api()