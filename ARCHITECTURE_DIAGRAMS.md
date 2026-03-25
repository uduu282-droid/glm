# ImgUpscaler AI - Architecture & Flow Diagrams

## System Architecture Overview

```mermaid
graph TB
    Client[Client Application]
    API[ImgUpscaler API Server]
    OSS[Alibaba Cloud OSS]
    
    Client -->|1. POST /upload-image| API
    API -->|Returns OSS URL + Token| Client
    Client -->|2. PUT Image Data| OSS
    OSS -->|Upload Confirmed| Client
    Client -->|3. POST /sign-object| API
    API -->|Returns Signed URL| Client
    Client -->|4. POST /process| API
    API -->|Processing...| API
    API -->|Returns Result URL| Client
    Client -->|5. GET Result| CDN[CDN/Storage]
    CDN -->|Final Image| Client
```

---

## Complete Upload & Processing Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API Server
    participant O as Alibaba OSS
    participant R as Result Storage
    
    C->>C: Create/Load Image
    Note over C: Step 0: Prepare Image
    
    C->>A: POST /api/common/upload/upload-image<br/>file_name: "test.png"
    Note over A: Step 1: Initiate Upload
    A-->>C: {code: 100000,<br/>result: {url, object_name}}
    
    C->>O: PUT /{object_path}<br/>[Binary Image Data]
    Note over O: Step 2: Direct Upload to Cloud
    O-->>C: 200 OK
    
    C->>A: POST /api/common/upload/sign-object<br/>object_name: "{path}"
    Note over A: Step 3: Sign for Access
    A-->>C: {code: 100000,<br/>result: {signed_url}}
    
    C->>A: POST /api/image/enhance<br/>{image_url: "..."}
    Note over A: Step 4: Process Image
    A-->>C: {code: 100000,<br/>result: {output_url}}
    
    C->>R: GET /{output_url}
    Note over R: Step 5: Download Result
    R-->>C: [Enhanced Image]
```

---

## API Endpoint Hierarchy

```mermaid
graph LR
    Root[api.imgupscaler.ai]
    
    Root --> Common[Common APIs]
    Root --> Image[Image APIs]
    Root --> Login[Login APIs]
    
    Common --> Upload[upload/upload-image]
    Common --> Sign[upload/sign-object]
    
    Image --> Enhance[image/enhance]
    Image --> Sharpen[image/sharpen]
    Image --> Restore[image/restore]
    Image --> Edit[image/edit]
    
    Login --> UserInfo[pai-login/v1/user/get-userinfo]
    
    style Upload fill:#90EE90
    style Sign fill:#90EE90
    style Enhance fill:#FFB6C1
    style Sharpen fill:#FFB6C1
    style Restore fill:#FFB6C1
    style Edit fill:#FFB6C1
```

**Legend:**
- 🟢 Green = Confirmed Working
- 🔴 Pink = Discovered, Needs Testing

---

## Data Flow Architecture

```mermaid
graph TB
    User[User Input]
    
    subgraph "Upload Phase"
        UI[Upload Init]
        URL[Get OSS URL]
        UD[Upload Data]
        SO[Sign Object]
    end
    
    subgraph "Cloud Storage"
        ALI[Alibaba Cloud OSS]
        TEMP[Temporary Storage]
        SIGN[Signed Access]
    end
    
    subgraph "Processing Phase"
        PROC[Image Processor]
        ENH[Enhancement AI]
        OUT[Output Generator]
    end
    
    subgraph "Delivery"
        CDN[CDN/Edge]
        FINAL[Final URL]
    end
    
    User --> UI
    UI --> URL
    URL --> UD
    UD --> ALI
    ALI --> SO
    SO --> SIGN
    SIGN --> PROC
    PROC --> ENH
    ENH --> OUT
    OUT --> CDN
    CDN --> FINAL
```

---

## Component Interaction Map

```mermaid
graph TB
    Browser[Browser Client]
    NodeJS[Node.js Client]
    Python[Python Client]
    
    LB[Load Balancer]
    API[API Gateway]
    
    Auth[Auth Service]
    Upload[Upload Service]
    Process[Processing Service]
    
    OSS[Alibaba OSS]
    DB[(Database)]
    Cache[(Cache)]
    
    Browser --> LB
    NodeJS --> LB
    Python --> LB
    
    LB --> API
    API --> Auth
    API --> Upload
    API --> Process
    
    Upload --> OSS
    Process --> OSS
    Upload --> DB
    Process --> Cache
```

---

## State Machine for Image Processing

```mermaid
stateDiagram-v2
    [*] --> Created: Image Loaded
    Created --> Uploading: Start Upload
    Uploading --> Uploaded: Cloud Storage Confirm
    Uploaded --> Signing: Request Signature
    Signing --> Signed: Receive Signed URL
    Signed --> Processing: Submit Enhancement
    Processing --> Complete: Processing Done
    Processing --> Failed: Error Occurred
    Complete --> Downloading: Fetch Result
    Downloading --> [*]: Save to Disk
    Failed --> [*]: Error Handling
```

---

## Network Request Timeline

```mermaid
gantt
    title Image Upscale Operation Timeline
    dateFormat X
    axisFormat %L ms
    
    section Client
    Prepare Image     :a1, 0, 100
    Init Upload       :a2, after a1, 50
    Upload to OSS     :a3, after a2, 2000
    Sign Object       :a4, after a3, 50
    Process Image     :a5, after a4, 5000
    Download Result   :a6, after a5, 1000
    
    section Server
    Upload Init       :b1, 50, 50
    Sign Generation   :b2, 2100, 50
    AI Processing     :b3, 2200, 5000
    
    section Storage
    OSS Upload        :c1, 150, 2000
    Result Storage    :c2, 7200, 500
```

---

## Error Handling Flow

```mermaid
graph TD
    Start[Start Operation]
    TryUpload[Try Upload]
    UploadErr{Upload Error?}
    RetryUpload[Retry Upload]
    MaxRetries{Max Retries?}
    UploadFail[Upload Failed]
    
    TryProcess[Try Process]
    ProcessErr{Process Error?}
    RetryProcess[Retry Process]
    ProcessFail[Process Failed]
    
    TryDownload[Try Download]
    DownloadErr{Download Error?}
    RetryDownload[Retry Download]
    DownloadFail[Download Failed]
    
    Success[Success!]
    
    Start --> TryUpload
    TryUpload --> UploadErr
    UploadErr -->|Yes| RetryUpload
    UploadErr -->|No| TryProcess
    RetryUpload --> MaxRetries
    MaxRetries -->|Yes| UploadFail
    MaxRetries -->|No| TryUpload
    
    TryProcess --> ProcessErr
    ProcessErr -->|Yes| RetryProcess
    ProcessErr -->|No| TryDownload
    RetryProcess --> MaxRetries
    MaxRetries -->|Yes| ProcessFail
    
    TryDownload --> DownloadErr
    DownloadErr -->|Yes| RetryDownload
    DownloadErr -->|No| Success
```

---

## Service Dependencies

```mermaid
graph LR
    App[ImgUpscaler Application]
    
    subgraph "External Services"
        Alibaba[Alibaba Cloud OSS]
        Analytics[Google Analytics]
        Logging[Aliyun Log Service]
        Iconify[Iconify Icons]
        MagicEraser[MagicEraser CDN]
    end
    
    App --> Alibaba
    App --> Analytics
    App --> Logging
    App --> Iconify
    App --> MagicEraser
    
    style Alibaba fill:#FF6B6B
    style App fill:#4ECDC4
```

**Red** = Critical Dependency (Alibaba OSS for storage)  
**Teal** = Main Application

---

## File Structure Generated by Analysis

```
imgupscaler_project/
│
├── imgupscaler_complete.js          # Main implementation
├── test_imgupscaler_all_endpoints.js # Endpoint tester
├── reverse_imgupscaler.js           # Browser automation
├── test_imgupscaler_upload.js       # Upload capture
│
├── IMGUPSCALER_COMPLETE_API_DOCS.md # Full documentation
├── IMGUPSCALER_QUICK_START.md       # Quick guide
├── IMGUPSCALER_PROJECT_SUMMARY.md   # This summary
├── ARCHITECTURE_DIAGRAMS.md         # This file
│
├── imgupscaler_analysis/
│   ├── complete_data.json          # Initial analysis
│   └── endpoints.txt               # Endpoint list
│
├── imgupscaler_upload_analysis/
│   ├── upload_analysis.json        # Upload flow data
│   └── endpoints.txt               # Upload endpoints
│
├── imgupscaler_endpoint_tests/      # Test results (generated)
│   └── test_results_*.json
│
└── imgupscaler_output/              # Processed images (generated)
    └── *_upscaled.*
```

---

## Authentication & Headers Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    
    C->>S: Request with Headers
    Note over C,S: Required Headers:
    Note over C: User-Agent<br/>Accept-Language<br/>Origin<br/>Referer<br/>Accept
    
    alt With Auth
        Note over C: + Authorization<br/>+ Product-Serial<br/>+ Product-Code
    end
    
    S->>S: Validate Headers
    S-->>C: Response
    
    alt Valid Headers
        S-->>C: 200 OK + Data
    else Invalid Headers
        S-->>C: 4xx Error
    end
```

---

## Rate Limiting Strategy (Inferred)

```mermaid
graph TB
    Request[Incoming Request]
    Check{Check Rate Limit}
    Count[Request Count]
    Window[Time Window]
    Allow[Allow Request]
    Block[Block Request]
    
    Request --> Check
    Check --> Count
    Check --> Window
    Count --> Allow
    Window --> Allow
    Allow --> Process[Process Normally]
    
    Check -->|Over Limit| Block
    Block --> Return429[Return 429 Too Many Requests]
```

*Note: Actual rate limits unknown - requires testing*

---

## Scalability Considerations

```mermaid
graph TB
    subgraph "Current Architecture"
        Single[Single API Server]
        SingleOSS[Shared Alibaba OSS]
    end
    
    subgraph "Scalable Architecture"
        LB[Load Balancer]
        API1[API Server 1]
        API2[API Server 2]
        API3[API Server 3]
        MultiOSS[Distributed OSS Buckets]
        Cache[Redis Cache Layer]
    end
    
    Single --> SingleOSS
    LB --> API1
    LB --> API2
    LB --> API3
    API1 --> MultiOSS
    API2 --> MultiOSS
    API3 --> MultiOSS
    API1 --> Cache
    API2 --> Cache
    API3 --> Cache
```

---

## Security Model

```mermaid
graph TB
    Client[Client Request]
    
    subgraph "Security Layers"
        HTTPS[HTTPS Encryption]
        Headers[Header Validation]
        CORS[CORS Policy]
        SignURL[Signed URLs]
        TTL[Time-Limited Access]
    end
    
    Client --> HTTPS
    HTTPS --> Headers
    Headers --> CORS
    CORS --> SignURL
    SignURL --> TTL
    TTL --> Resource[Protected Resource]
    
    style HTTPS fill:#90EE90
    style Headers fill:#FFD700
    style CORS fill:#FFD700
    style SignURL fill:#90EE90
    style TTL fill:#90EE90
```

**Green** = Strong Security Measure  
**Yellow** = Moderate/Unknown Security

---

## Monitoring Points (Discovered)

```mermaid
graph LR
    App[Application]
    
    GA[Google Analytics]
    AliLog[Aliyun Log Service]
    
    App -->|Page Views| GA
    App -->|API Calls| AliLog
    App -->|Errors| AliLog
    App -->|Performance| AliLog
    
    style GA fill:#FF6B6B
    style AliLog fill:#4ECDC4
```

**Detected Tracking:**
- Google Analytics (G-KFJ6N97K1V)
- Aliyun Log Store (web-imgupsclaer)

---

These diagrams provide a complete visual understanding of the ImgUpscaler system architecture, flows, and components.
