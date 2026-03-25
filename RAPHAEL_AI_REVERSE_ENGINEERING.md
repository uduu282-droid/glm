# Raphael AI Image Editor - Complete Reverse Engineering Guide

## Overview
Raphael AI (https://raphael.app/ai-image-editor) is a free online AI photo editor that uses **FLUX.1 Kontext** models for text-based image editing.

## Core Technology Stack

### AI Model
- **Model**: FLUX.1 Kontext by Black Forest Labs
- **Architecture**: 12-billion parameter MMDiT Architecture
- **Capabilities**: 
  - Context-aware image editing
  - Text-prompt based transformations
  - High-quality output with typography support

### API Structure (Inferred)
Based on industry standards and similar platforms, the API likely follows this pattern:

```javascript
POST /api/generate or POST /api/edit
Headers:
  - Content-Type: multipart/form-data
  - Authorization: Bearer <user_token>
  - X-Credits: <available_credits>

Body:
  - image: <base64_or_file>
  - prompt: "change background to sunset beach"
  - mode: "standard" | "pro" | "max"
  - quality: number (resolution multiplier)
```

## Credit System Analysis

| Plan | Monthly Credits | Daily Refresh | Processing Time | Cost per Edit |
|------|----------------|---------------|-----------------|---------------|
| Free | 10 | Yes (10/day) | 15 seconds | 2 credits (Standard) |
| Pro | 2,000 | No | 9 seconds | 2-24 credits |
| Ultimate | 5,000 | No | Instant | 2-24 credits |

**Credit Costs by Mode:**
- **Standard**: 2 credits (basic quality)
- **Pro**: 12 credits (high quality)
- **Max**: 24 credits (maximum quality + typography)

## Featured Capabilities

### 1. Background Replacement
- Separates subject from background
- Replaces with custom scenes
- Example prompts:
  - "Change background to sunset beach"
  - "Replace with mountain landscape"
  - "Set in modern office environment"

### 2. Lighting Adjustment
- Cinematic lighting effects
- Time-of-day changes
- Examples:
  - "Add warm sunlight effect"
  - "Switch to night scene"
  - "Blue hour lighting"

### 3. Style Conversion
- Artistic transformations
- Supported styles:
  - Japanese anime
  - Oil painting
  - Pixel art (retro)
  - Digital art
  - Abstract

### 4. Color Change
- Object-specific colorization
- Precise color control
- Example: "Change all green leaves to red"

### 5. Age Transformation
- Face aging/de-aging
- Maintains facial features
- Range: 3-80 years old

## Technical Implementation

### Frontend Architecture (Next.js)
```javascript
// Likely structure based on bundle analysis
- Next.js framework
- React components
- WebAssembly for preprocessing
- WebSocket for real-time progress
```

### Image Processing Pipeline
```
1. Upload → Client-side compression (max 20MB)
2. Preprocessing → Format validation (JPG/PNG)
3. Queue → Credit deduction
4. Processing → FLUX.1 Kontext inference
5. Post-processing → Enhancement filters
6. Delivery → WebP/JPEG output
7. Cleanup → Immediate deletion (privacy policy)
```

## Privacy & Security

### Privacy Policy Highlights
- **Zero data retention**: Images deleted immediately after processing
- **No storage**: Prompts and results not stored on servers
- **Session-based**: Temporary processing only
- **GDPR compliant**: EU-based infrastructure likely

### Authentication
- Requires sign-in for credit tracking
- Session tokens for API access
- Credit balance checked per request

## Rate Limits & Restrictions

### Free Tier
- 10 credits daily (resets every 24h)
- 15-second queue time
- Standard quality only (2 credits = 5 edits/day)
- JPG/PNG up to 20MB

### Paid Tiers
- No daily limits (monthly caps)
- Priority processing
- Access to Pro/Max modes
- Higher resolution outputs

## API Endpoints (Hypothetical)

Based on similar services using FLUX.1 Kontext:

### Image Upload Endpoint
```http
POST https://api.raphael.app/v1/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Request:
- file: Image (JPG/PNG, max 20MB)

Response:
{
  "image_id": "img_abc123",
  "url": "https://temp.raphael.app/img_abc123.png",
  "expires_in": 300
}
```

### Edit Generation Endpoint
```http
POST https://api.raphael.app/v1/edit
Content-Type: application/json
Authorization: Bearer {token}

Request:
{
  "image_id": "img_abc123",
  "prompt": "change background to desert sunset",
  "mode": "standard",
  "credits": 2
}

Response:
{
  "task_id": "task_xyz789",
  "status": "queued",
  "estimated_time": 15,
  "credits_used": 2,
  "credits_remaining": 8
}
```

### Result Retrieval
```http
GET https://api.raphael.app/v1/result/{task_id}
Authorization: Bearer {token}

Response:
{
  "status": "completed",
  "result_url": "https://cdn.raphael.app/results/task_xyz789.webp",
  "download_expires": 3600
}
```

## Alternative Implementation Approaches

### Option 1: Direct FLUX.1 Kontext API
Use official APIs from providers:
- **Replicate**: `black-forest-labs/flux-kontext-max`
- **Fal.ai**: Flux context endpoints
- **Hugging Face**: Inference API

### Option 2: Browser Automation
- Puppeteer/Playwright for automation
- Session cookie extraction
- Request interception and replay

### Option 3: Self-Hosted Solution
- Deploy FLUX.1 Kontext on GPU cloud
- Use ComfyUI or Automatic1111
- Custom frontend interface

## Code Example: Client Implementation

```javascript
class RaphaelAIEditor {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.raphael.app/v1';
  }

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: formData
    });

    return await response.json();
  }

  async editImage(imageId, prompt, mode = 'standard') {
    const creditCosts = {
      'standard': 2,
      'pro': 12,
      'max': 24
    };

    const response = await fetch(`${this.baseUrl}/edit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_id: imageId,
        prompt: prompt,
        mode: mode,
        credits: creditCosts[mode]
      })
    });

    return await response.json();
  }

  async getResult(taskId) {
    const response = await fetch(`${this.baseUrl}/result/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    return await response.json();
  }

  async fullEdit(file, prompt, mode = 'standard') {
    // Upload
    const { image_id } = await this.uploadImage(file);
    
    // Generate
    const { task_id } = await this.editImage(image_id, prompt, mode);
    
    // Poll for result
    let result;
    do {
      await new Promise(resolve => setTimeout(resolve, 2000));
      result = await this.getResult(task_id);
    } while (result.status === 'queued' || result.status === 'processing');

    return result;
  }
}

// Usage example
const editor = new RaphaelAIEditor('your-api-key');
const result = await editor.fullEdit(
  document.getElementById('imageInput').files[0],
  'Convert to anime style with vibrant colors',
  'pro'
);
console.log('Edited image:', result.result_url);
```

## Testing Strategy

### Phase 1: Network Analysis
1. Open browser DevTools → Network tab
2. Perform image edit on raphael.app
3. Capture all XHR/fetch requests
4. Analyze headers, payloads, responses

### Phase 2: API Replay
1. Extract authentication tokens
2. Recreate request format
3. Test with curl/Postman
4. Automate with Node.js

### Phase 3: Scale Testing
1. Test rate limits
2. Verify credit deduction
3. Check session persistence
4. Validate error handling

## Legal & Ethical Considerations

### Terms of Service
- Review https://raphael.app/terms
- Respect rate limits and quotas
- Don't bypass authentication
- Honor copyright policies

### Best Practices
- Use for learning/research only
- Don't resell or commercialize
- Attribute original service
- Follow robots.txt

## Resources & References

### Official Documentation
- https://raphael.app/ai-image-editor
- https://blackforestlabs.ai/flux-kontext

### Alternative APIs
- Replicate: https://replicate.com/black-forest-labs/flux-kontext-max
- Fal.ai: https://fal.ai/models/flux-kontext
- Hugging Face: https://huggingface.co/black-forest-labs

### Community Tools
- FLUX.1 Kontext GitHub discussions
- Reddit r/StableDiffusion
- Discord AI art communities

## Conclusion

Raphael AI provides an accessible interface to FLUX.1 Kontext's powerful image editing capabilities. While the exact API implementation requires direct network analysis, this guide provides the foundation for understanding and potentially replicating its functionality through legitimate means such as:

1. Official FLUX.1 Kontext APIs
2. Self-hosted deployments
3. Licensed integrations

For production use, consider partnering with Black Forest Labs or using authorized API providers.
