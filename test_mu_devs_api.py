# MU-Devs API Test - Python Implementation
# Reverse engineered from https://mu-devs.vercel.app/

import requests
import time
from typing import List, Dict, Optional

class MUDevsImageGenerator:
    def __init__(self):
        self.base_url = 'https://mu-devs.vercel.app'
        self.endpoint = '/generate'
    
    def generate(self, prompt: str, model: str = 'flux') -> Dict:
        """
        Generate an image using MU-Devs API
        
        Args:
            prompt: Text description of the desired image
            model: Model to use ('flux' or 'fluxpro')
        
        Returns:
            Dictionary with success status and image URL or error
        """
        print(f"🎨 Generating image for prompt: \"{prompt}\"")
        print(f"Model: {model}")
        
        try:
            response = requests.post(
                f'{self.base_url}{self.endpoint}',
                json={
                    'prompt': prompt,
                    'model': model
                },
                headers={
                    'Content-Type': 'application/json'
                }
            )
            
            data = response.json()
            
            if data.get('success'):
                print('✅ SUCCESS!')
                print(f"📷 Image URL: {data.get('image_url')}")
                return {
                    'success': True,
                    'imageUrl': data.get('image_url')
                }
            else:
                print(f"❌ API Error: {data.get('error')}")
                return {
                    'success': False,
                    'error': data.get('error')
                }
                
        except requests.exceptions.RequestException as e:
            print(f'❌ Request Failed: {str(e)}')
            return {
                'success': False,
                'error': str(e)
            }
    
    def batch_generate(self, prompts: List[str], model: str = 'flux', 
                      delay: int = 3) -> List[Dict]:
        """
        Generate multiple images in batch
        
        Args:
            prompts: List of text prompts
            model: Model to use
            delay: Seconds to wait between requests
        
        Returns:
            List of results
        """
        print(f"🚀 Batch generating {len(prompts)} images...\n")
        results = []
        
        for i, prompt in enumerate(prompts):
            print(f"\n[{i + 1}/{len(prompts)}]")
            result = self.generate(prompt, model)
            results.append(result)
            
            # Wait between requests to avoid rate limiting
            if i < len(prompts) - 1:
                print(f'⏳ Waiting {delay} seconds...')
                time.sleep(delay)
        
        return results


def main():
    """CLI usage"""
    generator = MUDevsImageGenerator()
    
    # Get prompt from command line or use default
    import sys
    prompt = sys.argv[1] if len(sys.argv) > 1 else 'A futuristic cyberpunk city at night with neon lights'
    model = sys.argv[2] if len(sys.argv) > 2 else 'flux'
    
    generator.generate(prompt, model)


if __name__ == '__main__':
    main()
