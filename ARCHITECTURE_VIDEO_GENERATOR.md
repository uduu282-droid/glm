# 🏗️ Pixelbin Video Generator - Architecture & Flow

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Interactive CLI  │  │  Quick CLI   │  │  Batch Processor│  │
│  │                  │  │              │  │                 │  │
│  │ pixelbin_video_  │  │ pixelbin_    │  │ pixelbin_       │  │
│  │ generator.js     │  │ cli.js       │  │ batch.js        │  │
│  │                  │  │              │  │                 │  │
│  │ • Menu system    │  │ • One-liners │  │ • Multi-video   │  │
│  │ • Step-by-step   │  │ • Fast gen   │  │ • Automation    │  │
│  │ • Presets        │  │ • Scriptable │  │ • Scheduling    │  │
│  └──────────────────┘  └──────────────┘  └─────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              TerminalVideoGenerator Class                │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  Configuration Management                                │  │
│  │  • Provider selection (AIVideo/GrokImagine)             │  │
│  │  • Authentication tokens                                 │  │
│  │  • Request headers                                       │  │
│  │                                                          │  │
│  │  Request Builder                                         │  │
│  │  • Prompt processing                                     │  │
│  │  • Style application                                     │  │
│  │  • Parameter validation                                  │  │
│  │  • Payload construction                                  │  │
│  │                                                          │  │
│  │  Response Handler                                        │  │
│  │  • Error parsing                                         │  │
│  │  • Success detection                                     │  │
│  │  • Result formatting                                     │  │
│  │  • File output                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     API CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Axios HTTP Client                     │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  • POST requests to video generation endpoints          │  │
│  │  • Custom headers (Auth, User-Agent, etc.)              │  │
│  │  • Timeout handling (60s default)                       │  │
│  │  • Compression support (gzip, deflate, zstd)            │  │
│  │  • Error handling & retry logic                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL API PROVIDERS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────┐  │
│  │   AIVideoGenerator.me    │  │    GrokImagine.ai        │  │
│  │   (Primary Provider)     │  │  (Alternative Provider)  │  │
│  ├──────────────────────────┤  ├──────────────────────────┤  │
│  │ Base: platform.aivideo...│  │ Base: aiplatform.tattoo..│  │
│  │ Auth: JWT Token          │  │ Auth: JWT Token          │  │
│  │ Channel: GROK_IMAGINE    │  │ Channel: GROK_IMAGINE    │  │
│  │                          │  │                          │  │
│  │ Endpoint:                │  │ Endpoint:                │  │
│  │ /api/v1/ai/video/create  │  │ /api/v1/ai/video/create  │  │
│  └──────────────────────────┘  └──────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   AI VIDEO GENERATION MODELS                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Behind the scenes, these APIs use advanced AI models:         │
│  • Text encoding (transformers)                                │
│  • Video generation (diffusion models)                         │
│  • Frame interpolation                                         │
│  • Audio synthesis (optional)                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Single Video Generation Flow

```
User Input
    │
    ├─→ [Prompt] ──────────────────────────┐
    ├─→ [Style Selection] ─────────────────┤
    ├─→ [Duration] ────────────────────────┤
    ├─→ [Resolution] ──────────────────────┤
    ├─→ [Negative Prompt] ─────────────────┤
    │                                      │
    ↓                                      │
┌──────────────────────────────────────────┴──┐
│         Build Request Payload               │
│                                             │
│  {                                          │
│    prompt: "A beautiful sunset...",        │
│    style: "cinematic",                     │
│    negative_prompt: "blurry",              │
│    duration: 5,                            │
│    resolution: "1024x1024",                │
│    channel: "GROK_IMAGINE"                 │
│  }                                          │
└─────────────────────────────────────────────┘
                    │
                    ↓
        ┌───────────────────────┐
        │  Add Headers          │
        │  • Authorization      │
        │  • User-Agent         │
        │  • Content-Type       │
        │  • Unique ID          │
        └───────────────────────┘
                    │
                    ↓
        ┌───────────────────────┐
        │  POST Request         │
        │  axios.post(url,      │
        │    payload, config)   │
        └───────────────────────┘
                    │
                    ↓
        ┌───────────────────────┐
        │  API Processing       │
        │  • Validate request   │
        │  • Check auth         │
        │  • Queue generation   │
        │  • Process with AI    │
        └───────────────────────┘
                    │
                    ↓
        ┌───────────────────────┐
        │  Response Received    │
        │  • Success/Error      │
        │  • Video URL/Task ID  │
        │  • Metadata           │
        └───────────────────────┘
                    │
                    ↓
        ┌───────────────────────┐
        │  Display to User      │
        │  • Format output      │
        │  • Show errors        │
        │  • Save results       │
        └───────────────────────┘
                    │
                    ↓
              End Result
```

---

## Component Interaction

### Interactive Mode Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Main Application Loop                                      │
└─────────────────────────────────────────────────────────────┘
         │
         ↓
┌─────────────────┐
│ Show Main Menu  │
│ 1. Generate     │
│ 2. Change Prov  │
│ 3. Info         │
│ 4. Styles       │
│ 5. Presets      │
│ 6. Exit         │
└─────────────────┘
         │
         ↓
┌─────────────────┐     No      ┌──────────────────┐
│ User Selects    │────────────→│ Exit Application │
│ Option          │             └──────────────────┘
└─────────────────┘
         │ Yes
         ↓
┌─────────────────┐
│ Execute Option  │
│ • interactive   │
│   Generate()    │
│ • switchProv()  │
│ • showInfo()    │
│ • testPresets() │
└─────────────────┘
         │
         ↓
┌─────────────────┐
│ Wait for Enter  │
└─────────────────┘
         │
         ↓
┌─────────────────┐     No      ┌──────────────────┐
│ Continue?       │────────────→│  Clear Screen    │
└─────────────────┘             └──────────────────┘
         │                             │
         └─────────────────────────────┘
```

---

## Batch Processing Architecture

```
┌────────────────────────────────────────────────────────────┐
│              Batch Configuration File (JSON)               │
├────────────────────────────────────────────────────────────┤
│  [                                                         │
│    { "prompt": "...", "style": "...", ... },              │
│    { "prompt": "...", "style": "...", ... },              │
│    ...                                                     │
│  ]                                                         │
└────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌────────────────────────────────────────────────────────────┐
│           BatchVideoGenerator.processBatch()               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  for (let i = 0; i < jobs.length; i++) {                  │
│    1. Read job config                                     │
│    2. Call generateVideo(job, i+1, total)                │
│    3. Store result in results[]                           │
│    4. Wait delay (3 seconds)                              │
│    5. Next iteration                                      │
│  }                                                         │
│                                                            │
└────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌────────────────────────────────────────────────────────────┐
│                  Results Aggregation                       │
├────────────────────────────────────────────────────────────┤
│  {                                                         │
│    summary: {                                              │
│      total: 8,                                            │
│      successful: 7,                                       │
│      failed: 1,                                           │
│      generated_at: "2026-03-21..."                        │
│    },                                                      │
│    results: [...]                                          │
│  }                                                         │
└────────────────────────────────────────────────────────────┘
                            │
                            ↓
                  Save to JSON file
```

---

## Error Handling Strategy

```
┌─────────────────────────────────────────────────────────┐
│              Try-Catch Error Handling                   │
└─────────────────────────────────────────────────────────┘
         │
         ↓
    ┌─────────┐
    │  Try    │
    │  POST   │
    │  Request│
    └─────────┘
         │
    ┌────┴────┐
    │         │
Success    Error
    │         │
    │    ┌────┴────────────────────────────────────┐
    │    │         Catch Block                     │
    │    │                                         │
    │    │  if (error.response) {                 │
    │    │    // API responded with error         │
    │    │    check status code                   │
    │    │    parse error message                 │
    │    │    provide helpful tips                │
    │    │  } else if (error.code === timeout) { │
    │    │    // Connection timeout               │
    │    │  } else {                              │
    │    │    // Other errors                     │
    │    │  }                                     │
    │    └─────────────────────────────────────────┘
    │
    ↓
Return result object:
{
  success: true/false,
  data/error: ...,
  timestamp: ...
}
```

---

## Configuration Management

```
┌─────────────────────────────────────────────────────────┐
│           PROVIDERS Configuration Object                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  const PROVIDERS = {                                    │
│    AIVIDEO: {                                           │
│      baseUrl: 'https://platform.aivideogenerator.me',  │
│      authToken: 'eyJ0eXAiOiJKV1QiLCJ...',              │
│      uniqueId: '865ead8054fa643f...',                  │
│      channel: 'GROK_IMAGINE',                          │
│      origin: 'https://aivideogenerator.me',            │
│      modelId: 'af548e1bec9c1417...'                    │
│    },                                                   │
│    GROKIMAGINE: {                                       │
│      baseUrl: 'https://aiplatform.tattooidea.ai',      │
│      authToken: 'eyJ0eXAiOiJKV1QiLCJ...',              │
│      uniqueId: '865ead8054fa643f...',                  │
│      channel: 'GROK_IMAGINE',                          │
│      origin: 'https://grokimagineai.com',              │
│      modelId: 'ad7be746bd789864...'                    │
│    }                                                    │
│  };                                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
         │
         ↓
    Dynamic switching based on user selection
```

---

## File Structure

```
test models 2/
│
├── Core Applications
│   ├── pixelbin_video_generator.js    (Interactive CLI)
│   ├── pixelbin_cli.js                (Quick commands)
│   ├── pixelbin_batch.js              (Batch processor)
│   └── test_pixelbin_api.js           (API tester)
│
├── Configuration
│   ├── batch_config_example.json      (Sample batch config)
│   └── run_video_generator.bat        (Windows launcher)
│
├── Documentation
│   ├── START_HERE_PIXELBIN.md         (Quick start)
│   ├── PIXELBIN_PROJECT_SUMMARY.md    (Complete overview)
│   ├── QUICK_START_VIDEO_GENERATOR.md (Usage guide)
│   ├── README_PIXELBIN_VIDEO_GENERATOR.md (Technical docs)
│   └── ARCHITECTURE_VIDEO_GENERATOR.md (This file)
│
└── Dependencies (from package.json)
    └── axios                          (HTTP client)
```

---

## Security Model

```
┌─────────────────────────────────────────────────────────┐
│              Authentication Flow                        │
└─────────────────────────────────────────────────────────┘

Current Implementation:
┌──────────────────────────────────────────────────────┐
│  Pre-configured JWT Tokens                           │
│                                                      │
│  • Extracted from web sessions                      │
│  • Stored in source code                            │
│  • May expire over time                             │
│  • Need manual updates                              │
└──────────────────────────────────────────────────────┘

Recommended Production Approach:
┌──────────────────────────────────────────────────────┐
│  Dynamic Authentication                              │
│                                                      │
│  • Implement login flow                             │
│  • Obtain fresh tokens                              │
│  • Handle token refresh                             │
│  • Secure token storage                             │
│  • Environment variables                            │
└──────────────────────────────────────────────────────┘
```

---

## Performance Considerations

### Request Timing

```
┌─────────────────────────────────────────────────────┐
│  Typical Generation Timeline                        │
└─────────────────────────────────────────────────────┘

Request Sent → API Processing → Generation → Response
     │              │              │           │
     │              │              │           │
   <1s          10-30s         20-60s       <1s
                    │              │
                    └──────┬──────┘
                      Total: 30-90s
```

### Rate Limiting Strategy

```javascript
// Built-in delays to prevent rate limiting
const delay = 3000; // 3 seconds between requests

for (let i = 0; i < batch.length; i++) {
    await generateVideo(batch[i]);
    await sleep(delay); // Wait before next request
}
```

---

## Scalability

### Current Limitations

- **Sequential Processing:** One video at a time
- **Single Thread:** Node.js event loop
- **API Rate Limits:** Provider restrictions
- **Memory:** All results stored in RAM

### Future Enhancements

```
┌─────────────────────────────────────────────────────┐
│  Potential Improvements                             │
└─────────────────────────────────────────────────────┘

• Parallel Processing  → Multiple concurrent requests
• Worker Threads       → Background processing
• Queue System         → Job scheduling
• Caching             → Store/reuse responses
• Database            → Persistent storage
• REST API            → Web service interface
• WebSocket           → Real-time updates
• Progress Tracking   → Generation status
```

---

## Summary

**Architecture Type:** Client-Server with Multiple Providers

**Pattern:** MVC-inspired (Model-View-Controller)
- **Model:** Data/configuration objects
- **View:** Terminal UI/output
- **Controller:** Business logic (TerminalVideoGenerator class)

**Key Design Decisions:**
1. ✅ Modular design (separate files for different modes)
2. ✅ Configuration-driven (easy provider switching)
3. ✅ Error-resilient (comprehensive error handling)
4. ✅ User-friendly (multiple interfaces for different skill levels)
5. ✅ Extensible (class-based architecture)

**Technology Stack:**
- Runtime: Node.js v22+
- HTTP Client: Axios
- Language: ES6+ JavaScript
- Interface: Terminal/CLI

---

*Architecture documented: March 21, 2026*
