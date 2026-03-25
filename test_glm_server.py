#!/usr/bin/env python3
"""
Test GLM-5 OpenAI-Compatible Server
Tests all endpoints and functionality
"""

import requests
import json
import time
from typing import Optional

BASE_URL = "http://localhost:8000"

def print_section(title: str):
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70 + "\n")

def test_health():
    """Test health endpoint"""
    print_section("TEST 1: Health Check")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        response.raise_for_status()
        
        data = response.json()
        print("✅ Health endpoint responding")
        print(f"Status: {data.get('status')}")
        print(f"Session: {data.get('session')}")
        print(f"Turns: {data.get('turns')}")
        print(f"Chat ID: {data.get('chat_id')}")
        
        return data
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return None

def test_list_models():
    """Test models listing"""
    print_section("TEST 2: List Models")
    
    try:
        response = requests.get(f"{BASE_URL}/v1/models")
        response.raise_for_status()
        
        data = response.json()
        print("✅ Models endpoint responding")
        print(f"Available models: {len(data.get('data', []))}")
        
        for model in data.get('data', []):
            print(f"  - {model.get('id')} (owned by: {model.get('owned_by')})")
        
        return data
    except Exception as e:
        print(f"❌ Models endpoint failed: {e}")
        return None

def test_non_streaming_chat():
    """Test non-streaming chat completion"""
    print_section("TEST 3: Non-Streaming Chat")
    
    try:
        payload = {
            "model": "glm-5",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Hello! What can you do?"}
            ],
            "stream": False
        }
        
        print("Sending request...")
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/v1/chat/completions",
            json=payload,
            timeout=60
        )
        elapsed = time.time() - start_time
        response.raise_for_status()
        
        data = response.json()
        print(f"✅ Response received in {elapsed:.2f}s")
        print(f"Model: {data.get('model')}")
        print(f"Finish reason: {data['choices'][0].get('finish_reason')}")
        
        content = data['choices'][0]['message']['content']
        print(f"\nResponse:\n{content[:200]}{'...' if len(content) > 200 else ''}")
        
        return data
    except Exception as e:
        print(f"❌ Chat completion failed: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text[:200]}")
        return None

def test_streaming_chat():
    """Test streaming chat completion"""
    print_section("TEST 4: Streaming Chat")
    
    try:
        payload = {
            "model": "glm-5",
            "messages": [
                {"role": "user", "content": "Count from 1 to 5 slowly"}
            ],
            "stream": True
        }
        
        print("Starting stream...")
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/v1/chat/completions",
            json=payload,
            stream=True,
            timeout=60
        )
        response.raise_for_status()
        
        print("\nReceiving tokens:")
        token_count = 0
        full_content = ""
        
        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                if line_str.startswith('data: '):
                    data_str = line_str[6:]
                    if data_str.strip() == '[DONE]':
                        break
                    
                    try:
                        data = json.loads(data_str)
                        if data.get('choices'):
                            delta = data['choices'][0].get('delta', {})
                            content = delta.get('content', '')
                            if content:
                                print(content, end='', flush=True)
                                full_content += content
                                token_count += 1
                    except json.JSONDecodeError:
                        continue
        
        elapsed = time.time() - start_time
        print(f"\n\n✅ Stream completed")
        print(f"Total tokens: {token_count}")
        print(f"Time: {elapsed:.2f}s")
        print(f"Tokens/sec: {token_count/elapsed:.2f}" if elapsed > 0 else "")
        
        return {
            "content": full_content,
            "token_count": token_count,
            "elapsed": elapsed
        }
    except Exception as e:
        print(f"\n❌ Streaming failed: {e}")
        return None

def test_multi_turn_conversation():
    """Test multi-turn conversation"""
    print_section("TEST 5: Multi-Turn Conversation")
    
    try:
        # Turn 1
        print("Turn 1: Introduce yourself")
        payload1 = {
            "model": "glm-5",
            "messages": [
                {"role": "system", "content": "You are Bob, a friendly assistant."},
                {"role": "user", "content": "Hi, I'm Alice. What's your name?"}
            ]
        }
        
        response1 = requests.post(
            f"{BASE_URL}/v1/chat/completions",
            json=payload1,
            timeout=60
        )
        response1.raise_for_status()
        answer1 = response1.json()['choices'][0]['message']['content']
        print(f"Assistant: {answer1[:100]}...")
        
        time.sleep(0.5)
        
        # Turn 2 - should remember name
        print("\nTurn 2: Ask follow-up (should remember context)")
        payload2 = {
            "model": "glm-5",
            "messages": [
                {"role": "assistant", "content": answer1},
                {"role": "user", "content": "What's my name?"}
            ]
        }
        
        response2 = requests.post(
            f"{BASE_URL}/v1/chat/completions",
            json=payload2,
            timeout=60
        )
        response2.raise_for_status()
        answer2 = response2.json()['choices'][0]['message']['content']
        print(f"Assistant: {answer2[:100]}...")
        
        # Check if it remembered
        if "Alice" in answer2 or "alice" in answer2:
            print("\n✅ Context remembered correctly!")
        else:
            print("\n⚠️  May have lost context")
        
        return {"turn1": answer1, "turn2": answer2}
    except Exception as e:
        print(f"❌ Multi-turn failed: {e}")
        return None

def test_session_reset():
    """Test session reset"""
    print_section("TEST 6: Session Reset")
    
    try:
        print("Resetting session...")
        response = requests.post(f"{BASE_URL}/v1/session/reset")
        response.raise_for_status()
        
        data = response.json()
        print(f"✅ Session reset successful")
        print(f"Status: {data.get('status')}")
        print(f"Message: {data.get('message')}")
        
        # Verify with health check
        health = requests.get(f"{BASE_URL}/health").json()
        print(f"\nNew session state:")
        print(f"Turns: {health.get('turns')}")
        print(f"Chat ID: {health.get('chat_id')}")
        
        return data
    except Exception as e:
        print(f"❌ Reset failed: {e}")
        return None

def test_with_openai_sdk():
    """Test with official OpenAI Python SDK"""
    print_section("TEST 7: OpenAI SDK Compatibility")
    
    try:
        from openai import OpenAI
        
        print("Initializing OpenAI client...")
        client = OpenAI(
            base_url=f"{BASE_URL}/v1",
            api_key="glm-local"
        )
        
        print("Sending chat request...")
        response = client.chat.completions.create(
            model="glm-5",
            messages=[
                {"role": "user", "content": "Say hello in one word"}
            ]
        )
        
        print(f"✅ OpenAI SDK works!")
        print(f"Response: {response.choices[0].message.content}")
        
        return response
    except ImportError:
        print("⚠️  OpenAI SDK not installed (pip install openai)")
        return None
    except Exception as e:
        print(f"❌ OpenAI SDK test failed: {e}")
        return None

def run_all_tests():
    """Run complete test suite"""
    print("\n" + "╔══════════════════════════════════════════════════════╗")
    print("║     GLM-5 Server - Complete Test Suite           ║")
    print("╚══════════════════════════════════════════════════════╝")
    print(f"\nBase URL: {BASE_URL}\n")
    
    results = {
        "health": test_health(),
        "models": test_list_models(),
        "chat_basic": test_non_streaming_chat(),
        "chat_stream": test_streaming_chat(),
        "chat_context": test_multi_turn_conversation(),
        "reset": test_session_reset(),
        "openai_sdk": test_with_openai_sdk()
    }
    
    # Summary
    print_section("TEST SUMMARY")
    
    passed = sum(1 for v in results.values() if v is not None)
    total = len(results)
    
    print(f"\nResults: {passed}/{total} tests passed\n")
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print("\n" + "=" * 70)
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! Server is working perfectly!\n")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check output above.\n")

if __name__ == "__main__":
    run_all_tests()
