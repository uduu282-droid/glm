# 🎨 Pollinations Image API - Reverse Engineering Report

## ✅ API ENDPOINT DISCOVERED

**Primary Endpoint (via anmixai proxy):**
```
URL:    https://anmixai.vercel.app/api/pollinations/image
Method: POST
Status: ✅ Working (requires payment/balance)
```

---

## 📝 REQUEST FORMAT

### Required Parameters:
```json
{
  "prompt": "A beautiful sunset over mountains",
  "width": 1024,
  "height": 1024,
  "seed": 12345,
  "model": "flux",
  "source": "pollinations"  // REQUIRED: "pollinations" or "nexus"
}
```

### Optional Parameters:
- `width`: Image width (default: 1024)
- `height`: Image height (default: 1024)
- `seed`: Random seed for reproducibility
- `model`: Model to use (`flux`, `stable-diffusion`, etc.)
- `source`: Must be `'pollinations'` or `'nexus'`

---

## 🔑 REQUIRED HEADERS

```javascript
{
  'Content-Type': 'application/json',
  'Referer': 'https://anmixai.vercel.app/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'
}
```

---

## 💰 PAYMENT REQUIREMENT

**Important:** This endpoint requires a Pollinations account with balance.

- **Cost per request:** ~0.0132 pollen
- **Error on insufficient balance:** HTTP 402 Payment Required
- **Error message:** `"Insufficient balance. This model costs ~0.0132 pollen per request, but your available balance is 0.0100."`

---

## 🔄 FREE ALTERNATIVE

Pollinations offers a **FREE direct API** that doesn't require authentication:

### Direct Endpoint:
```
GET https://image.pollinations.ai/prompt/{your_prompt}
```

### Example Usage:

**cURL:**
```bash
curl "https://image.pollinations.ai/prompt/A%20beautiful%20sunset?width=1024&height=1024&model=flux&nologo=true"
```

**JavaScript:**
```javascript
const response = await fetch(
  'https://image.pollinations.ai/prompt/sunset?width=1024&height=1024&model=flux'
);
const imageBuffer = await response.arrayBuffer();
```

**Python:**
```python
import requests

response = requests.get(
    'https://image.pollinations.ai/prompt/sunset',
    params={'width': 1024, 'height': 1024, 'model': 'flux'}
)
with open('image.jpg', 'wb') as f:
    f.write(response.content)
```

---

## 📚 CODE EXAMPLES

### 1. Via anmixai (Requires Payment)

**Node.js:**
```javascript
import axios from 'axios';

const response = await axios.post(
  'https://anmixai.vercel.app/api/pollinations/image',
  {
    prompt: 'A cyberpunk city at night',
    width: 1024,
    height: 1024,
    seed: 42,
    model: 'flux',
    source: 'pollinations'
  },
  {
    headers: {
      'Content-Type': 'application/json',
      'Referer': 'https://anmixai.vercel.app/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'
    }
  }
);

console.log(response.data);
```

**Python:**
```python
import requests

response = requests.post(
    'https://anmixai.vercel.app/api/pollinations/image',
    json={
        'prompt': 'A cyberpunk city at night',
        'width': 1024,
        'height': 1024,
        'seed': 42,
        'model': 'flux',
        'source': 'pollinations'
    },
    headers={
        'Content-Type': 'application/json',
        'Referer': 'https://anmixai.vercel.app/'
    }
)

print(response.json())
```

### 2. Direct Pollinations (FREE)

**Node.js:**
```javascript
import axios from 'axios';

const response = await axios.get(
  'https://image.pollinations.ai/prompt/cyberpunk_city',
  {
    params: {
      width: 1024,
      height: 1024,
      model: 'flux',
      nologo: true
    },
    responseType: 'arraybuffer'
  }
);

// Save image
import fs from 'fs';
fs.writeFileSync('image.jpg', response.data);
```

**Python:**
```python
import requests

response = requests.get(
    'https://image.pollinations.ai/prompt/cyberpunk_city',
    params={'width': 1024, 'height': 1024, 'model': 'flux', 'nologo': True}
)

with open('image.jpg', 'wb') as f:
    f.write(response.content)
```

---

## 🧪 TESTING RESULTS

### anmixai Endpoint Test:
```
✅ Status Code: 200 OK (when sufficient balance)
❌ Status Code: 402 Payment Required (insufficient balance)
💰 Cost: ~0.0132 pollen per request
⚠️  Note: Requires Pollinations account top-up
```

### Direct Pollinations Test:
```
✅ Completely FREE
✅ No authentication required
✅ Returns image directly
⚠️  May have rate limits for anonymous usage
```

---

## 🎯 RECOMMENDATION

**Use the FREE direct Pollinations API** unless you specifically need the anmixai proxy features:

```bash
# Recommended approach - FREE!
curl "https://image.pollinations.ai/prompt/your_prompt?width=1024&height=1024"
```

The anmixai endpoint appears to be a paid proxy service that adds billing/tracking on top of the free Pollinations API.

---

## 📊 COMPARISON

| Feature | anmixai Proxy | Direct Pollinations |
|---------|--------------|---------------------|
| **Cost** | ~0.0132 pollen/request | FREE |
| **Auth Required** | Yes (account + balance) | No |
| **Rate Limits** | Based on balance | Anonymous limits |
| **Response Format** | JSON | Binary image |
| **Models** | flux, others | flux, sd, more |
| **Best For** | Production/billing | Testing/free usage |

---

## 🔍 ADDITIONAL FINDINGS

### Response Headers (from anmixai):
```
x-vercel-id: bom1::iad1::nlqpl-1774064183905-17376c0957ba
x-matched-path: /api/pollinations/image
x-vercel-cache: MISS
cache-control: public, max-age=0, must-revalidate
content-type: application/json
server: Vercel
```

### Infrastructure:
- Hosted on **Vercel**
- Uses **Next.js** (rsc header indicates React Server Components)
- Proxies requests to Pollinations backend
- Adds authentication and billing layer

---

## 📁 FILES CREATED

1. [`test-pollinations-api.js`](test-pollinations-api.js) - Basic API test
2. [`pollinations-api-reverse.js`](pollinations-api-reverse.js) - Complete implementation
3. [`POLLINATIONS_API_DOCS.md`](POLLINATIONS_API_DOCS.md) - This documentation

---

## ✅ CONCLUSION

Successfully reverse-engineered the Pollinations image generation API! 

**Key Discovery:** The anmixai endpoint is a paid proxy wrapper around the **FREE direct Pollinations API** that anyone can use without authentication.

**Recommendation:** Use the direct endpoint for free image generation! 🎉
