import requests
import json

# Your deployed worker URL
WORKER_URL = "https://overchat-worker.llamai.workers.dev"

def test_health():
    """Test health endpoint"""
    print("🏥 Testing Health Endpoint...")
    response = requests.get(f"{WORKER_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

def test_models():
    """Test models list endpoint"""
    print("📋 Testing Models List...")
    response = requests.get(f"{WORKER_URL}/v1/models")
    data = response.json()
    print(f"Status: {response.status_code}")
    print(f"Available Models: {len(data['models'])}")
    for model in data['models'][:5]:  # Show first 5
        print(f"  - {model['id']} ({model['model']})")
    print()

def test_chat_streaming():
    """Test streaming chat"""
    print("💬 Testing Streaming Chat (Claude Sonnet 3.5)...")
    
    payload = {
        "model": "claude-sonnet-3-5",
        "message": "Hello! What's 2+2? Answer in one short sentence.",
        "stream": True
    }
    
    response = requests.post(
        f"{WORKER_URL}/v1/chat/completions",
        json=payload,
        stream=True
    )
    
    print(f"Status: {response.status_code}")
    print("Response: ", end="", flush=True)
    
    full_response = []
    for line in response.iter_lines(decode_unicode=True):
        if line and line.startswith("data:"):
            data_str = line[5:].strip()
            if data_str == "[DONE]":
                break
            try:
                event = json.loads(data_str)
                delta = event.get("choices", [{}])[0].get("delta", {}).get("content", "")
                if delta:
                    print(delta, end="", flush=True)
                    full_response.append(delta)
            except json.JSONDecodeError:
                pass
    
    print("\n\n✅ Complete!\n")

def test_different_models():
    """Test different AI models"""
    models_to_test = [
        "claude-sonnet-3-5",
        "gpt-4o",
        "gemini-2-5-pro"
    ]
    
    for model_name in models_to_test:
        print(f"🤖 Testing {model_name}...")
        
        payload = {
            "model": model_name,
            "message": "Say 'Hi' in 3 words",
            "stream": False
        }
        
        try:
            response = requests.post(
                f"{WORKER_URL}/v1/chat/completions",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"   Status: ✅ Success")
            else:
                print(f"   Status: ❌ Error {response.status_code}")
        except Exception as e:
            print(f"   Status: ❌ Timeout/Error")
        
        print()

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Overchat Worker Deployment Test")
    print("=" * 60)
    print(f"Worker URL: {WORKER_URL}\n")
    
    test_health()
    test_models()
    test_chat_streaming()
    test_different_models()
    
    print("=" * 60)
    print("✅ All tests completed!")
    print("=" * 60)
