# 🎨 Flux Image Generator - START HERE

**Reverse engineered from https://test2img.vercel.app/**

---

## ⚡ Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
npm install gradio-client
```

### Step 2: Generate Your First Image

```bash
node flux_image_generator.js "a cat holding a sign that says hello world"
```

**That's it!** The image URL will be displayed in the console.

---

## 🎯 What We Discovered

### Site Analysis

**Original Site**: https://test2img.vercel.app/  
**Technology**: Astro + Gradio Client  
**Backend**: Hugging Face Space (`black-forest-labs/FLUX.1-dev`)  

### How It Works

The site uses the **Gradio client library** to connect to a Hugging Face space running FLUX.1-dev model.

**Key Discovery**:
```javascript
// From the site's JavaScript
const client = await y.connect("black-forest-labs/FLUX.1-dev");
const result = await client.predict("/infer", {
    prompt: "your prompt here",
    width: 512,
    height: 512
});
```

---

## 📋 API Parameters

### Required
- `prompt` (string): Text description of desired image

### Optional (with defaults)
- `seed` (integer): Random seed (default: 0)
- `randomize_seed` (boolean): Randomize each generation (default: true)
- `width` (integer): Image width (default: 512, max: 1024)
- `height` (integer): Image height (default: 512, max: 1024)
- `guidance_scale` (float): CFG scale (default: 3.5, range: 1-10)
- `num_inference_steps` (integer): Quality steps (default: 28, max: 50)

---

## 🚀 Usage Examples

### Basic Generation

```bash
# Simple prompt
node flux_image_generator.js "a beautiful sunset over mountains"

# Complex prompt
node flux_image_generator.js "a futuristic cyberpunk city at night with neon lights and flying cars, highly detailed, 8k"
```

### Download Image

```bash
# Generate and download
node flux_image_generator.js --download "a serene mountain landscape"
```

### Batch Generation

```bash
# Generate multiple images
node flux_image_generator.js --batch
```

### Programmatic Use

```javascript
import { FluxImageGenerator } from './flux_image_generator.js';

async function main() {
    const generator = new FluxImageGenerator();
    
    // Generate image
    const result = await generator.generate(
        "a magical forest with glowing mushrooms",
        {
            width: 768,
            height: 768,
            guidance_scale: 5.0,
            num_inference_steps: 50
        }
    );
    
    if (result.success) {
        console.log(`Generated: ${result.imageUrl}`);
        
        // Download
        await generator.download(result.imageUrl, 'forest.webp');
    }
}

main();
```

---

## 🧪 Test Scripts

### Test All Features

```bash
# Run comprehensive tests
node test_flux_api.js
```

### Test Specific Prompts

Create `my_test.js`:
```javascript
import { FluxImageGenerator } from './flux_image_generator.js';

async function test() {
    const generator = new FluxImageGenerator();
    
    const prompts = [
        "a simple cat",
        "a complex scene with multiple elements",
        "abstract art with geometric shapes"
    ];
    
    for (const prompt of prompts) {
        console.log(`\nTesting: ${prompt}`);
        const result = await generator.generate(prompt);
        console.log(result.success ? '✅ Success' : '❌ Failed');
    }
}

test();
```

---

## 💡 Tips & Tricks

### Better Results

1. **Be Specific**: Add details about lighting, style, mood
   ```
   ❌ "a cat"
   ✅ "a fluffy orange tabby cat sitting on a sunny windowsill, photorealistic, soft natural lighting"
   ```

2. **Adjust Guidance Scale**:
   - Lower (1-3): More creative, less aligned to prompt
   - Higher (7-10): More precise, may look stiff
   - Sweet spot: 3.5-5.0

3. **Increase Steps for Quality**:
   - Default (28): Good quality, fast
   - High (50): Best quality, slower
   - Low (10-15): Fast preview

4. **Experiment with Seeds**:
   ```javascript
   // Same prompt, different seeds
   await generator.generate("a landscape", { seed: 42, randomize_seed: false });
   await generator.generate("a landscape", { seed: 123, randomize_seed: false });
   ```

### Common Issues

**Issue**: "Space is busy"  
**Solution**: Wait a minute and retry

**Issue**: Timeout  
**Solution**: Reduce image size or inference steps

**Issue**: Poor quality  
**Solution**: Increase `num_inference_steps` to 50

---

## 📊 Performance

| Setting | Time | Quality | Use Case |
|---------|------|---------|----------|
| 512x512, 28 steps | ~5-10s | Good | Quick tests |
| 768x768, 50 steps | ~15-30s | High | Final renders |
| 1024x1024, 50 steps | ~30-60s | Best | High-res output |

---

## 🎨 Example Prompts

### Photorealistic
```
a professional photograph of a wise old owl perched on a tree branch, 
detailed feathers, natural lighting, bokeh background, 8k resolution
```

### Fantasy Art
```
a majestic dragon breathing fire over a medieval castle, 
fantasy art style, dramatic lighting, epic composition, digital painting
```

### Sci-Fi
```
futuristic space station orbiting a distant galaxy, 
sci-fi concept art, neon lights, highly detailed, cinematic lighting
```

### Abstract
```
colorful abstract composition with flowing organic shapes, 
modern art, vibrant colors, dynamic movement
```

---

## 🔗 Integration Examples

### React Component

```jsx
import { useState } from 'react';

function ImageGenerator() {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true);
        try {
            const generator = new FluxImageGenerator();
            const result = await generator.generate(prompt);
            setImage(result.imageUrl);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your image..."
            />
            <button onClick={generate} disabled={loading}>
                {loading ? 'Generating...' : 'Generate'}
            </button>
            {image && <img src={image} alt="Generated" />}
        </div>
    );
}
```

### Express API

```javascript
import express from 'express';
import { FluxImageGenerator } from './flux_image_generator.js';

const app = express();
app.use(express.json());

app.post('/api/generate', async (req, res) => {
    const { prompt, ...options } = req.body;
    
    const generator = new FluxImageGenerator();
    const result = await generator.generate(prompt, options);
    
    res.json(result);
});

app.listen(3000);
```

---

## 📁 Files Created

- `flux_image_generator.js` - Main implementation ⭐
- `FLUX_IMAGE_GENERATOR_ANALYSIS.md` - Complete technical analysis
- `test_flux_api.js` - Testing script (create this)

---

## 🆘 Troubleshooting

### Error: "Cannot find module 'gradio-client'"
```bash
npm install gradio-client
```

### Error: "Space is currently busy"
Wait 1-2 minutes and retry. The free tier has limited GPU capacity.

### Error: "Timeout"
Reduce image resolution or inference steps:
```javascript
await generator.generate("prompt", {
    width: 512,
    height: 512,
    num_inference_steps: 20
});
```

### Generated image looks wrong
Check your prompt - be more specific and descriptive. Add style keywords.

---

## 🎉 Next Steps

1. ✅ Try the basic example above
2. 🎨 Experiment with different prompts
3. ⚙️ Adjust parameters for better quality
4. 🔗 Integrate into your projects
5. 📚 Read `FLUX_IMAGE_GENERATOR_ANALYSIS.md` for advanced usage

---

## 📞 Resources

- **Analysis Report**: `FLUX_IMAGE_GENERATOR_ANALYSIS.md`
- **Original Site**: https://test2img.vercel.app/
- **Model Info**: https://huggingface.co/black-forest-labs/FLUX.1-dev
- **Gradio Docs**: https://www.gradio.app/docs/gradio_client

---

**Ready to create amazing images?** 🎨

```bash
node flux_image_generator.js "your imagination is the limit!"
```
