import httpx
import json

# URL
url = "https://api.orbit-provider.com/v1/chat/completions"

# Headers
headers = {
    "Authorization": "Bearer sk-orbit-6***3cba",
    "Content-Type": "application/json"
}

# JSON payload
payload = {
    "model": "claude-sonnet-4-5-20250929",
    "messages": [
        {"role": "user", "content": "Hello!"}
    ]
}

print("Testing Orbit Provider API...")
print(f"URL: {url}")
print(f"Headers: {headers}")
print(f"Payload: {payload}")

try:
    # Sending the POST request
    response = httpx.post(url, headers=headers, json=payload, timeout=30.0)

    # Print status code and response
    print(f"\nStatus Code: {response.status_code}")
    
    try:
        response_json = response.json()
        print("Response JSON:")
        print(json.dumps(response_json, indent=2))
    except:
        print("Response Text:")
        print(response.text)

except Exception as e:
    print(f"\nError occurred: {str(e)}")