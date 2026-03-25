# Test AI Image Gen Zeta - Comprehensive Testing Suite
# Tests all 5 providers to verify which ones work

import requests
import json
from datetime import datetime

class AIImageGenTester:
    def __init__(self):
        self.base_url = "https://ai-image-gen-zeta.vercel.app/api/generate"
        self.test_prompt = "A young woman in a field of flowers"
        self.results = []
        
    def test_provider(self, provider_name, payload):
        """Test a specific provider"""
        print(f"\n{'='*60}")
        print(f"🧪 Testing: {provider_name.upper()}")
        print(f"{'='*60}")
        print(f"Prompt: {self.test_prompt}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        start_time = datetime.now()
        
        try:
            response = requests.post(
                f"{self.base_url}/{provider_name}",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=60
            )
            
            duration = (datetime.now() - start_time).total_seconds()
            
            print(f"\n📊 Response Status: {response.status_code}")
            print(f"⏱️ Duration: {duration:.2f}s")
            
            # Try to parse JSON
            try:
                data = response.json()
                
                if response.ok:
                    print(f"✅ SUCCESS!")
                    
                    # Check response format
                    if "data" in data and isinstance(data["data"], list):
                        print(f"📷 Images returned: {len(data['data'])}")
                        for i, img in enumerate(data['data'][:2]):  # Show first 2
                            if 'url' in img:
                                print(f"   Image {i+1}: {img['url'][:80]}...")
                            elif 'b64_json' in img:
                                print(f"   Image {i+1}: Base64 ({len(img['b64_json'])} chars)")
                    
                    self.results.append({
                        'provider': provider_name,
                        'status': 'SUCCESS',
                        'duration': duration,
                        'response_code': response.status_code,
                        'images_count': len(data.get('data', [])) if 'data' in data else 0
                    })
                    
                    return True, data
                    
                else:
                    error_msg = data.get('error', {}).get('message') or data.get('error') or 'Unknown error'
                    print(f"❌ FAILED: {error_msg}")
                    
                    self.results.append({
                        'provider': provider_name,
                        'status': 'FAILED',
                        'duration': duration,
                        'response_code': response.status_code,
                        'error': error_msg
                    })
                    
                    return False, data
                    
            except json.JSONDecodeError:
                print(f"❌ Invalid JSON response")
                print(f"Response: {response.text[:200]}")
                
                self.results.append({
                    'provider': provider_name,
                    'status': 'INVALID_JSON',
                    'duration': duration,
                    'response_code': response.status_code,
                    'response': response.text[:200]
                })
                
                return False, None
                
        except requests.exceptions.Timeout:
            duration = (datetime.now() - start_time).total_seconds()
            print(f"❌ TIMEOUT (>60 seconds)")
            
            self.results.append({
                'provider': provider_name,
                'status': 'TIMEOUT',
                'duration': duration
            })
            
            return False, None
            
        except Exception as e:
            duration = (datetime.now() - start_time).total_seconds()
            print(f"❌ EXCEPTION: {str(e)}")
            
            self.results.append({
                'provider': provider_name,
                'status': 'EXCEPTION',
                'duration': duration,
                'error': str(e)
            })
            
            return False, None
    
    def run_all_tests(self):
        """Run tests for all providers"""
        print("🚀 Starting Comprehensive AI Image Generator Tests")
        print(f"Base URL: {self.base_url}")
        print(f"Test Prompt: {self.test_prompt}")
        print("=" * 60)
        
        # Test Pollinations (should work)
        pollinations_payload = {
            "prompt": self.test_prompt,
            "model": "flux",
            "width": 1024,
            "height": 1024,
            "seed": 42,
            "nologo": True,
            "private": True,
            "enhance": False
        }
        self.test_provider("pollinations", pollinations_payload)
        
        # Test Runware (likely fails)
        runware_payload = {
            "prompt": self.test_prompt,
            "model": "runware:100@1",
            "width": 1024,
            "height": 1024,
            "steps": 20,
            "CFGScale": 7.5,
            "numberResults": 1,
            "outputType": "url"
        }
        self.test_provider("runware", runware_payload)
        
        # Test Together (likely fails)
        together_payload = {
            "prompt": self.test_prompt,
            "model": "black-forest-labs/FLUX.1-schnell-Free",
            "width": 1024,
            "height": 1024,
            "steps": 28,
            "n": 1,
            "response_format": "url"
        }
        self.test_provider("together", together_payload)
        
        # Test Google (likely fails)
        google_payload = {
            "prompt": f"Generate 1 images of\n\n{self.test_prompt}",
            "model": "gemini-2.0-flash-exp"
        }
        self.test_provider("google", google_payload)
        
        # Test xAI (likely fails)
        xai_payload = {
            "prompt": self.test_prompt,
            "model": "grok-2-image",
            "n": 1,
            "response_format": "url"
        }
        self.test_provider("xai", xai_payload)
        
        # Generate summary
        self.generate_summary()
        
        return self.results
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 60)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 60)
        
        total = len(self.results)
        successful = sum(1 for r in self.results if r['status'] == 'SUCCESS')
        failed = total - successful
        
        print(f"\nTotal Providers Tested: {total}")
        print(f"✅ Successful: {successful} ({successful/total*100:.1f}%)")
        print(f"❌ Failed: {failed} ({failed/total*100:.1f}%)")
        
        print("\n📋 Detailed Results:")
        for i, result in enumerate(self.results, 1):
            status_icon = "✅" if result['status'] == 'SUCCESS' else "❌"
            print(f"\n{i}. {status_icon} {result['provider'].upper()}")
            print(f"   Status: {result['status']}")
            print(f"   Duration: {result.get('duration', 'N/A'):.2f}s" if 'duration' in result else "   Duration: N/A")
            
            if result['status'] == 'SUCCESS':
                print(f"   Images: {result.get('images_count', 0)}")
            elif 'error' in result:
                print(f"   Error: {result['error']}")
        
        # Save results to file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"ai_image_gen_test_results_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump({
                'timestamp': timestamp,
                'test_prompt': self.test_prompt,
                'base_url': self.base_url,
                'summary': {
                    'total': total,
                    'successful': successful,
                    'failed': failed,
                    'success_rate': f"{successful/total*100:.1f}%"
                },
                'results': self.results
            }, f, indent=2)
        
        print(f"\n💾 Results saved to: {filename}")
        
        # Final verdict
        print("\n" + "=" * 60)
        print("🎯 FINAL VERDICT")
        print("=" * 60)
        
        working_providers = [r['provider'] for r in self.results if r['status'] == 'SUCCESS']
        
        if working_providers:
            print(f"\n✅ WORKING PROVIDERS: {', '.join(working_providers).upper()}")
            print(f"\nRecommendation: Use {working_providers[0].upper()} for image generation")
        else:
            print("\n❌ NO PROVIDERS WORKING")
            print("All providers failed. Site may be down or require authentication.")


def main():
    tester = AIImageGenTester()
    tester.run_all_tests()


if __name__ == "__main__":
    main()
