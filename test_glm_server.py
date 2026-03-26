"""
Test script for GLM-5 Flask server
Run this after deploying to Render to verify everything works
"""

import requests
import json
import sys

# Configuration - Update with your Render URL
RENDER_URL = "https://your-service-name.onrender.com"  # ← UPDATE THIS!
LOCAL_URL = "http://localhost:8000"

def test_health(base_url):
    """Test health endpoint"""
    print(f"\n🏥 Testing Health Endpoint: {base_url}/health")
    try:
        response = requests.get(f"{base_url}/health")
        response.raise_for_status()
        data = response.json()
        print(f"✅ Status: {data.get('status', 'unknown')}")
        print(f"   Turns: {data.get('turns', 0)}")
        print(f"   Chat ID: {data.get('chat_id', None)}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_models(base_url):
    """Test models endpoint"""
    print(f"\n📋 Testing Models Endpoint: {base_url}/v1/models")
    try:
        response = requests.get(f"{base_url}/v1/models")
        response.raise_for_status()
        data = response.json()
        models = data.get('data', [])
        print(f"✅ Found {len(models)} model(s):")
        for model in models:
            print(f"   - {model.get('id', 'unknown')} ({model.get('owned_by', 'unknown')})")
        return len(models) > 0
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_chat(base_url):
    """Test chat completion"""
    print(f"\n💬 Testing Chat Completion: {base_url}/v1/chat/completions")
    try:
        payload = {
            "model": "glm-5",
            "messages": [
                {"role": "user", "content": "Hello! Please respond with just 'Testing successful!'"}
            ]
        }
        
        print("   ⏳ Waiting for response (first request may take longer)...")
        response = requests.post(
            f"{base_url}/v1/chat/completions",
            json=payload,
            timeout=120  # Increased timeout for cold starts
        )
        response.raise_for_status()
        data = response.json()
        
        # Extract response
        choice = data.get('choices', [{}])[0]
        message = choice.get('message', {})
        content = message.get('content', '')
        
        print(f"✅ Model: {data.get('model', 'unknown')}")
        print(f"   Response: {content[:100]}{'...' if len(content) > 100 else ''}")
        print(f"   Usage: {json.dumps(data.get('usage', {}), indent=2)}")
        
        return len(content) > 0
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_session_reset(base_url):
    """Test session reset"""
    print(f"\n🔄 Testing Session Reset: {base_url}/v1/session/reset")
    try:
        response = requests.post(f"{base_url}/v1/session/reset")
        response.raise_for_status()
        data = response.json()
        print(f"✅ Status: {data.get('status', 'unknown')}")
        print(f"   Message: {data.get('message', '')}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def run_all_tests(base_url="local"):
    """Run all tests"""
    url = LOCAL_URL if base_url == "local" else RENDER_URL
    
    print(f"""
╔══════════════════════════════════════════════════════╗
║         GLM-5 Server Test Suite                      ║
╠══════════════════════════════════════════════════════╣
║  Testing: {url:<43} ║
╚══════════════════════════════════════════════════════╝
""")
    
    results = []
    
    # Run tests
    results.append(("Health Check", test_health(url)))
    results.append(("Models List", test_models(url)))
    results.append(("Chat Completion", test_chat(url)))
    results.append(("Session Reset", test_session_reset(url)))
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    print("="*60)
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your GLM-5 server is working perfectly!")
    else:
        print("⚠️ Some tests failed. Check the logs above for details.")
    
    return passed == total

if __name__ == "__main__":
    mode = "local"
    
    if len(sys.argv) > 1:
        if sys.argv[1] in ["--render", "-r"]:
            mode = "render"
            print("ℹ️ Testing deployed Render instance")
            print("⚠️ Make sure to update RENDER_URL in the test script!")
        elif sys.argv[1] in ["--help", "-h"]:
            print("""
Usage: python test_glm_server.py [OPTIONS]

Options:
  --render, -r   Test deployed Render instance (update RENDER_URL first!)
  --help, -h     Show this help message
  (no args)      Test local server (default)
""")
            sys.exit(0)
    
    success = run_all_tests(mode)
    sys.exit(0 if success else 1)
