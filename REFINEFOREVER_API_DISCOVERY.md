# 🔍 RefineForever API - Reverse Engineering Results

## 📊 Analysis Date: March 23, 2026

---

## 🎯 DISCOVERED API ENDPOINTS

### Main Image Editing API

Based on analysis of the application JavaScript (`index-B-QYTy2U.js`), the following endpoints have been identified:

#### 1. **Submit Edit Request**
```http
POST {base_url}/edit/async
Content-Type: application/json

Request Body:
{
  "tool_id": "advanced_edit_image",
  "image": "<base64_or_url>",
  "edit_instruction": "your editing instructions",
  "preservation_constraints": "what to preserve",
  "detail_level": "detail level",
  "cfg_scale": 1.0
}

Response:
{
  "success": true,
  "request_id": "uuid-here",
  "status": "processing" | "queued" | "completed",
  "queue_position": 1,
  "estimated_wait": 30
}
```

#### 2. **Check Edit Status**
```http
GET {base_url}/edit/check/{request_id}

Response:
{
  "success": true,
  "status": "processing" | "completed" | "failed",
  "progress": 50,
  "queue_position": null,
  "estimated_wait": null
}
```

#### 3. **Get Edit Result**
```http
GET {base_url}/edit/result/{request_id}

Response (Success):
{
  "success": true,
  "result_images": [
    "https://refineforever.com/results/{image_id}.png"
  ],
  "metadata": {
    "processing_time": 15.3,
    "model_used": "qwen-image-edit-2509"
  }
}

Response (Processing):
{
  "success": false,
  "error": "Still processing",
  "retry_after": 5
}
```

---

## 📋 CONFIGURATION FILES

### Tools Configuration
**Endpoint**: `https://refineforever.com/tools.json`

This file contains metadata for all available tools including:
- Tool ID: `advanced_edit_image`
- Name: "Advanced Edit Image"
- Author: "Fyrean"
- Model: Qwen-Image-Edit-2509
- Tags: Image Editing, Professional, Multi-Modal
- Default CFG Scale: 1.0

**Prompt Template Structure**:
```
{{edit_instruction}}{{preservation_constraints}}{{detail_level}}
```

**Negative Prompt Template**:
```
{{quality_issues_neg}}{{anatomical_issues_neg}}{{technical_artifacts_neg}}{{unwanted_elements_neg}}
```

---

## 🔑 KEY FINDINGS

### 1. **Architecture Pattern**
- **Async Processing**: Uses asynchronous job queue pattern
- **Polling Required**: Client must poll `/edit/check/{id}` for completion
- **Request ID**: UUID-based tracking for each edit request

### 2. **Workflow**
```
1. POST /edit/async → Get request_id
2. GET /edit/check/{request_id} → Poll until complete
3. GET /edit/result/{request_id} → Download result
```

### 3. **Application Details**
- **Main JS File**: `https://refineforever.com/assets/index-B-QYTy2U.js`
- **Size**: 589 KB (minified React/Vue app)
- **Framework**: Likely React or Vue (based on component structure)
- **Backend**: Python/Flask or Node.js (RESTful API pattern)

---

## 🛠️ IMPLEMENTATION EXAMPLE

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

class RefineForeverClient {
  constructor(baseUrl = 'https://refineforever.com') {
    this.baseUrl = baseUrl;
  }

  async submitEdit(imageData, options = {}) {
    const response = await axios.post(`${this.baseUrl}/edit/async`, {
      tool_id: 'advanced_edit_image',
      image: imageData,
      edit_instruction: options.instruction || 'Edit this image',
      preservation_constraints: options.preserve || '',
      detail_level: options.detail || 'high',
      cfg_scale: options.cfg || 1.0
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to submit');
    }

    return response.data.request_id;
  }

  async checkStatus(requestId) {
    const response = await axios.get(`${this.baseUrl}/edit/check/${requestId}`);
    return response.data;
  }

  async getResult(requestId, maxRetries = 60, pollInterval = 2000) {
    let retries = 0;

    while (retries < maxRetries) {
      const status = await this.checkStatus(requestId);

      if (status.status === 'completed') {
        const result = await axios.get(`${this.baseUrl}/edit/result/${requestId}`);
        return result.data;
      }

      if (status.status === 'failed') {
        throw new Error('Edit failed');
      }

      // Still processing
      console.log(`Waiting... (${status.progress || 'queued'})`);
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      retries++;
    }

    throw new Error('Timeout waiting for result');
  }

  async editImage(imageData, options = {}) {
    const requestId = await this.submitEdit(imageData, options);
    const result = await this.getResult(requestId);
    return result;
  }
}

// Usage Example
(async () => {
  const client = new RefineForeverClient();

  try {
    const result = await client.editImage(
      'data:image/png;base64,...',
      {
        instruction: 'Change the sky to sunset',
        preserve: 'Keep the main subject unchanged'
      }
    );

    console.log('Result:', result.result_images[0]);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
```

---

## 📁 GENERATED ANALYSIS FILES

### Files Created During Analysis:

1. **`REFINEFOREVER_ANALYSIS_2026-03-22T20-49-37-266Z.json`**
   - Complete network traffic capture
   - All HTTP requests/responses
   - Headers and metadata

2. **`refineforever-app.js`**
   - Full minified application JavaScript (589 KB)
   - Contains business logic and API calls

3. **`refineforever-page.html`**
   - Complete HTML source of the tool page

4. **`refineforever-screenshot.png`**
   - Screenshot of the interface

---

## 🔍 NEXT STEPS FOR FULL REVERSE ENGINEERING

### To Get Complete API Details:

1. **Test Endpoints Directly**
   ```bash
   curl https://refineforever.com/edit/async \
     -H "Content-Type: application/json" \
     -d '{"tool_id":"advanced_edit_image","image":"test"}'
   ```

2. **Capture Authentication**
   - Check if API requires authentication tokens
   - Look for session cookies
   - Identify any API keys in headers

3. **Analyze Response Formats**
   - Test with real images
   - Document all response fields
   - Identify error formats

4. **Rate Limits & Quotas**
   - Test request frequency limits
   - Check for credit/token system
   - Identify usage restrictions

---

## ⚠️ IMPORTANT NOTES

### Authentication:
- ❓ **Unknown** - May require session cookies or API tokens
- ✅ No hardcoded API keys found in client-side JS
- ⚠️ May need browser session context (like Raphael AI)

### Base URL:
The base URL appears to be `https://refineforever.com` based on:
- Relative paths in JS: `${o}/edit/async`
- Tools.json location
- Static asset hosting

### Model Backend:
- **Primary Model**: Qwen-Image-Edit-2509
- **Type**: Multi-modal image editing
- **Capabilities**: Semantic editing, appearance modification, element changes

---

## 📊 SUMMARY

| Aspect | Status | Details |
|--------|--------|---------|
| API Discovery | ✅ **PARTIAL** | 3 endpoints identified |
| Endpoint URLs | ✅ **FOUND** | `/edit/async`, `/edit/check/{id}`, `/edit/result/{id}` |
| Request Format | ⚠️ **INFERRED** | Based on JS analysis, needs testing |
| Response Format | ⚠️ **INFERRED** | Based on JS analysis, needs testing |
| Authentication | ❓ **UNKNOWN** | May require testing |
| Working Implementation | ❌ **NEEDED** | Requires live testing |

---

## 🎯 RECOMMENDATION

**Next Action**: Test the discovered endpoints directly with a real HTTP client to:
1. Verify endpoint URLs are correct
2. Determine authentication requirements
3. Document actual request/response formats
4. Test with real images

Would you like me to create a test script to validate these endpoints?

---

*Generated by RefineForever API Analyzer*  
*Analysis Date: March 23, 2026*
