# 📊 Pollinations API Rate Limits & Tiers - Complete Guide

## 🔍 Research Findings (2025-2026)

Based on official GitHub issues, documentation, and community reports.

---

## 🎯 Rate Limit Tiers

### **Anonymous/Free Tier** (No API Key)
```
⚠️  UNDOCUMENTED but discovered through usage:
- ~1 request per 15 seconds
- No authentication required
- Returns HTTP 200 with placeholder image when rate limited
- Placeholder image MD5: 2090a5dc21c32952cbf8496339752bd1 (~1.3 MB)
- Normal images: 40-80 KB
```

**Usage:**
```bash
# Works without API key
curl "https://image.pollinations.ai/prompt/cat?width=512&height=512" -o image.jpg
```

---

### **Spore Tier** (Free API Key - pk_)
```
📋 Official Limits:
- 1 request per HOUR
- Per API key (pk_...)
- Requires registration at pollinations.ai

⚠️  REPORTED ISSUES (Feb 2026):
- Users getting 429 errors after 2 requests in 30 seconds
- Actual limit appears stricter than documented
- May have burst/buffer protection interfering
- GitHub Issue #8541 filed by team
```

**Usage:**
```bash
# With API key header
curl "https://gen.pollinations.ai/v1/chat/completions" \
  -H "Authorization: Bearer pk_YOUR_KEY" \
  -d '{"prompt": "cat"}'
```

---

### **Seed Tier** (Registered Users)
```
📋 Expected Limits:
- Higher than Spore tier
- Requires account registration
- Better rate limits for active developers
- Must request upgrade from Spore tier
```

**How to Upgrade:**
1. Register at pollinations.ai
2. Use API for testing
3. Request upgrade via GitHub issue or Discord
4. Explain your use case (e.g., "building real estate dashboard")

---

### **Pro/Enterprise Tiers**
```
💰 Paid tiers available for:
- High-volume production use
- Custom rate limits
- Priority support
- SLA guarantees

Contact: team@pollinations.ai
```

---

## 🚨 Rate Limit Detection

### How to Detect When Rate Limited:

**Method 1: Check Image Hash**
```javascript
const crypto = require('crypto');

async function checkRateLimit(imageBuffer) {
  const hash = crypto.createHash('md5').update(imageBuffer).digest('hex');
  
  // Known rate limit placeholder hash
  if (hash === '2090a5dc21c32952cbf8496339752bd1') {
    console.log('❌ RATE LIMITED!');
    return true;
  }
  
  return false;
}
```

**Method 2: Check File Size**
```javascript
function isRateLimited(imageBuffer) {
  const size = imageBuffer.length;
  
  // Normal images: 40-80 KB
  // Rate limit placeholder: ~1.3 MB
  if (size > 200000) { // 200 KB threshold
    console.log('❌ Rate limited (image too large)');
    return true;
  }
  
  if (size < 10000) { // 10 KB minimum
    console.log('❌ Invalid image (too small)');
    return true;
  }
  
  return false;
}
```

**Method 3: HTTP Status Code**
```javascript
try {
  const response = await fetch(url);
  
  if (response.status === 429) {
    console.log('❌ Rate limited (HTTP 429)');
    const retryAfter = response.headers.get('retry-after');
    console.log(`⏳ Retry after: ${retryAfter} seconds`);
    return;
  }
  
  if (!response.ok) {
    console.log(`❌ Error: ${response.status}`);
    return;
  }
  
  // Success!
  const imageData = await response.arrayBuffer();
  
} catch (error) {
  console.log('❌ Network error:', error.message);
}
```

---

## 💡 Best Practices

### For Anonymous Usage:
```javascript
// ✅ DO: Add delays between requests
async function generateImage(prompt) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
  
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  
  // Check if rate limited
  if (buffer.byteLength > 200000) {
    console.log('⏳ Waiting 20 seconds before retry...');
    await new Promise(r => setTimeout(r, 20000));
    return generateImage(prompt); // Retry
  }
  
  return buffer;
}
```

### For Production:
```javascript
class PollinationsClient {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.rateLimitHash = '2090a5dc21c32952cbf8496339752bd1';
    this.maxRetries = 3;
  }
  
  async generateImage(prompt, options = {}) {
    const params = new URLSearchParams({
      width: options.width || 1024,
      height: options.height || 1024,
      model: options.model || 'flux',
      nologo: 'true',
      ...(options.seed && { seed: options.seed })
    });
    
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: this.apiKey ? {
            'Authorization': `Bearer ${this.apiKey}`
          } : {}
        });
        
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after') || 15;
          console.log(`⏳ Attempt ${attempt}: Rate limited. Waiting ${retryAfter}s...`);
          await new Promise(r => setTimeout(r, retryAfter * 1000));
          continue;
        }
        
        const buffer = await response.arrayBuffer();
        
        // Check for rate limit placeholder
        const hash = await this.hashBuffer(buffer);
        if (hash === this.rateLimitHash || buffer.byteLength > 200000) {
          console.log(`⏳ Attempt ${attempt}: Rate limited (placeholder detected). Waiting 20s...`);
          await new Promise(r => setTimeout(r, 20000));
          continue;
        }
        
        // Success!
        return { success: true, data: buffer };
        
      } catch (error) {
        console.log(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt < this.maxRetries) {
          await new Promise(r => setTimeout(r, 5000));
        }
      }
    }
    
    return { success: false, error: 'Max retries exceeded' };
  }
  
  async hashBuffer(buffer) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(Buffer.from(buffer)).digest('hex');
  }
}

// Usage:
const client = new PollinationsClient();
const result = await client.generateImage('cyberpunk city', { 
  width: 1024, 
  height: 1024 
});

if (result.success) {
  console.log('✅ Image generated!');
} else {
  console.log('❌ Failed:', result.error);
}
```

---

## 📈 Recommended Delays

### Anonymous (No API Key):
```javascript
// Minimum: 15 seconds between requests
await new Promise(r => setTimeout(r, 15000));
```

### Spore Tier (API Key):
```javascript
// Despite "1/hour" limit, add conservative delays
await new Promise(r => setTimeout(r, 60000)); // 1 minute
```

### Production (Multiple Keys):
```javascript
// Rotate between multiple API keys
const apiKeys = ['pk_key1', 'pk_key2', 'pk_key3'];
let currentKeyIndex = 0;

function getNextKey() {
  const key = apiKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return key;
}
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: Getting 500 Errors
```
Problem: Server errors from Pollinations
Solution: Retry with exponential backoff
```

```javascript
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      
      if (response.status === 500 && i < maxRetries) {
        const delay = Math.pow(2, i) * 5000; // Exponential backoff
        console.log(`Server error, retrying in ${delay/1000}s...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries) throw error;
    }
  }
}
```

### Issue 2: Timeout Errors
```
Problem: Request takes too long (>60s)
Solution: Increase timeout to 120s+ and add retries
```

```javascript
const response = await fetch(url, {
  signal: AbortSignal.timeout(120000) // 2 minutes
});
```

### Issue 3: Inconsistent Quality
```
Problem: Some images look worse than others
Solution: Use specific seed values for consistency
```

```javascript
// Use consistent seed for reproducible results
const seed = 42; // Or any fixed number
const url = `https://image.pollinations.ai/prompt/cat?seed=${seed}`;
```

---

## 🎯 Summary & Recommendations

### Current State (March 2026):

| Tier | Cost | Rate Limit | Reliability | Best For |
|------|------|------------|-------------|----------|
| **Anonymous** | Free | ~1/15s | ⭐⭐⭐ | Testing, hobby projects |
| **Spore** | Free | 1/hour (theoretical) | ⭐⭐ | Light development |
| **Seed** | Free | Unknown (higher) | ⭐⭐⭐⭐ | Active development |
| **Pro** | Paid | Custom | ⭐⭐⭐⭐⭐ | Production |

### Our Recommendation:

**For Testing/Hobby:**
- ✅ Use anonymous tier (no API key needed)
- ⏳ Add 15-20 second delays between requests
- 🔄 Implement retry logic with hash detection

**For Production:**
- ✅ Register for API key (Spore tier minimum)
- 🎯 Request Seed tier upgrade
- 💰 Consider paid tier for high volume
- 🔄 Implement key rotation if needed

**For Your Use Case:**
```javascript
// Based on our testing, use this pattern:
async function safeGenerate(prompt) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024`;
  
  try {
    const response = await fetch(url, { timeout: 120000 });
    const buffer = await response.arrayBuffer();
    
    // Validate it's not a rate limit placeholder
    if (buffer.byteLength > 200000) {
      throw new Error('Rate limited - got placeholder image');
    }
    
    return { success: true, data: buffer };
    
  } catch (error) {
    console.log('Error:', error.message);
    console.log('💡 Wait 20 seconds and retry, or use curl directly');
    return null;
  }
}
```

---

## 📚 Sources

1. GitHub Issue #7207 - Rate Limit Detection via Image Hash
2. GitHub Issue #8541 - Spore Tier Rate Limit Issues
3. GitHub Issue #4667 - Rate Limiting Implementation
4. Pollinations Terms of Service
5. Community reports and testing (March 2026)

---

## 🆘 Need Help?

- **Discord:** Join Pollinations Discord for support
- **GitHub:** File issues at github.com/pollinations/pollinations
- **Email:** team@pollinations.ai
- **Docs:** https://enter.pollinations.ai/api/docs

---

**Last Updated:** March 21, 2026  
**Status:** Actively maintained based on latest research ✅
