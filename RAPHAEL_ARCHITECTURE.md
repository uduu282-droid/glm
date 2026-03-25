# Raphael AI Architecture - Visual Diagrams

## System Overview

```mermaid
graph TB
    User[User Browser] --> Frontend[Raphael Frontend<br/>Next.js + React]
    Frontend --> API[API Gateway<br/>Authentication & Rate Limiting]
    API --> Upload[Upload Service<br/>Image Processing]
    API --> Edit[Edit Service<br/>Task Management]
    API --> Credits[Credit System<br/>Billing & Quotas]
    
    Upload --> Storage[Temporary Storage<br/>S3/Cloud Storage]
    Edit --> Queue[Processing Queue<br/>Redis/RabbitMQ]
    Queue --> Worker[AI Workers<br/>GPU Instances]
    Worker --> Model[FLUX.1 Kontext<br/>AI Model]
    Model --> Result[Result Storage<br/>CDN Delivery]
    
    Credits --> DB[(Database<br/>PostgreSQL)]
    Storage -.-> DB
    Result -.-> DB
    
    style User fill:#e1f5ff
    style Frontend fill:#fff4e1
    style API fill:#e8f5e9
    style Model fill:#f3e5f5
```

## Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant Q as Queue
    participant W as Worker
    participant M as FLUX.1 Model
    participant C as CDN
    
    U->>F: Upload Image + Prompt
    F->>A: POST /upload (image)
    A->>F: image_id
    
    F->>A: POST /edit (image_id, prompt, mode)
    A->>A: Validate credits
    A->>Q: Add to queue
    A->>F: task_id, status: queued
    
    loop Poll every 2 seconds
        F->>A: GET /result/{task_id}
        A->>Q: Check status
        Q-->>F: status: processing
    end
    
    Q->>W: Process task
    W->>M: Run inference
    M-->>W: Edited image
    W->>C: Store result
    W->>Q: Mark complete
    
    F->>A: GET /result/{task_id}
    A-->>F: result_url, completed
    F->>U: Display result
```

## Credit System Flow

```mermaid
flowchart TD
    Start[User Login] --> Check{Check Plan}
    
    Check -->|Free| FreeTier[10 credits/day]
    Check -->|Pro| ProTier[2000 credits/month]
    Check -->|Ultimate| UltTier[5000 credits/month]
    
    FreeTier --> DailyReset[Daily refresh]
    ProTier --> MonthlyReset[Monthly refresh]
    UltTier --> MonthlyReset
    
    DailyReset --> EditRequest[Edit Request]
    MonthlyReset --> EditRequest
    
    EditRequest --> ModeCheck{Select Mode}
    ModeCheck -->|Standard| StdCost[2 credits]
    ModeCheck -->|Pro| ProCost[12 credits]
    ModeCheck -->|Max| MaxCost[24 credits]
    
    StdCost --> Deduct[Deduct Credits]
    ProCost --> Deduct
    MaxCost --> Deduct
    
    Deduct --> Process[Process Edit]
    Process --> Complete[Edit Complete]
```

## Data Flow Architecture

```mermaid
graph LR
    subgraph Client Side
        Browser[Browser]
        Upload[Image Upload]
        Display[Result Display]
    end
    
    subgraph API Layer
        Auth[Authentication]
        Validation[Validation]
        Routing[Request Routing]
    end
    
    subgraph Processing
        Preprocess[Preprocessing]
        Inference[AI Inference]
        Postprocess[Post-processing]
    end
    
    subgraph Storage
        TempDB[(Temp Storage)]
        ResultDB[(Results)]
        UserDB[(User Data)]
    end
    
    Browser --> Upload
    Upload --> Auth
    Auth --> Validation
    Validation --> Routing
    
    Routing --> Preprocess
    Preprocess --> Inference
    Inference --> Postprocess
    
    Postprocess --> Display
    Preprocess --> TempDB
    Postprocess --> ResultDB
    Auth --> UserDB
```

## Component Interaction

```mermaid
graph TB
    subgraph "Frontend Components"
        FC1[Image Uploader]
        FC2[Prompt Input]
        FC3[Mode Selector]
        FC4[Progress Tracker]
        FC5[Result Viewer]
    end
    
    subgraph "Backend Services"
        BS1[Upload Service]
        BS2[Auth Service]
        BS3[Task Manager]
        BS4[Credit Manager]
        BS5[Result Service]
    end
    
    subgraph "AI Infrastructure"
        AI1[Queue Manager]
        AI2[Worker Pool]
        AI3[FLUX.1 Model]
        AI4[GPU Cluster]
    end
    
    FC1 --> BS1
    FC2 --> BS3
    FC3 --> BS4
    FC4 --> BS3
    FC5 --> BS5
    
    BS1 --> AI1
    BS3 --> AI1
    BS4 --> BS3
    
    AI1 --> AI2
    AI2 --> AI3
    AI3 --> AI4
    
    AI2 --> BS5
    BS5 --> FC5
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Service
    participant DB as Database
    
    U->>F: Enter credentials
    F->>A: POST /auth/login (email, password)
    A->>DB: Verify user
    DB-->>A: User data
    
    alt Valid credentials
        A->>A: Generate JWT token
        A->>DB: Store session
        A-->>F: { token, user, credits }
        F->>F: Store token
        F-->>U: Logged in
    else Invalid credentials
        A-->>F: Error 401
        F-->>U: Show error
    end
    
    Note over F,A: Subsequent requests include<br/>Authorization: Bearer {token}
```

## Error Handling Flow

```mermaid
flowchart TD
    Error[Error Occurs] --> Type{Error Type}
    
    Type -->|401 Unauthorized| AuthErr[Re-authenticate]
    Type -->|402 Payment Required| CreditErr[Insufficient Credits]
    Type -->|429 Too Many Requests| RateErr[Rate Limited]
    Type -->|500 Server Error| ServErr[Server Issue]
    Type -->|Timeout| TimeErr[Request Timeout]
    
    AuthErr --> Refresh[Refresh Token]
    Refresh --> RetryAuth[Retry Request]
    
    CreditErr --> Notify[Notify User]
    Notify --> WaitOrUpgrade[Wait or Upgrade Plan]
    
    RateErr --> Backoff[Exponential Backoff]
    Backoff --> RetryRate[Retry Later]
    
    ServErr --> Log[Log Error]
    Log --> Fallback[Fallback Option]
    
    TimeErr --> IncreaseTimeout[Increase Timeout]
    IncreaseTimeout --> RetryTime[Retry Request]
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        LB[Load Balancer]
        
        subgraph "Frontend Cluster"
            FE1[Frontend Instance 1]
            FE2[Frontend Instance 2]
            FE3[Frontend Instance 3]
        end
        
        subgraph "API Cluster"
            API1[API Instance 1]
            API2[API Instance 2]
            API3[API Instance 3]
        end
        
        subgraph "AI Workers"
            W1[GPU Worker 1]
            W2[GPU Worker 2]
            W3[GPU Worker 3]
        end
        
        DB[(Primary Database)]
        Cache[(Redis Cache)]
        CDN[CDN Network]
    end
    
    Users --> LB
    LB --> FE1
    LB --> FE2
    LB --> FE3
    
    FE1 --> API1
    FE2 --> API2
    FE3 --> API3
    
    API1 --> Cache
    API2 --> Cache
    API3 --> Cache
    
    API1 --> DB
    API2 --> DB
    API3 --> DB
    
    API1 --> W1
    API2 --> W2
    API3 --> W3
    
    W1 --> CDN
    W2 --> CDN
    W3 --> CDN
```

## Technology Stack

```
┌─────────────────────────────────────────────┐
│              Frontend Layer                 │
│  Next.js, React, TypeScript, TailwindCSS   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│              API Layer                      │
│  Node.js, Express/Fastify, JWT Auth        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│           Processing Layer                  │
│  Python, PyTorch, Diffusers, CUDA          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│           Storage Layer                     │
│  PostgreSQL, Redis, S3, CloudFlare CDN     │
└─────────────────────────────────────────────┘
```

## API Endpoint Map

```
/api/v1
├── /auth
│   ├── /login          POST   - User authentication
│   ├── /register       POST   - User registration
│   ├── /refresh        POST   - Token refresh
│   └── /me             GET    - Current user info
│
├── /images
│   ├── /upload         POST   - Image upload
│   ├── /{id}           GET    - Get image info
│   └── /{id}           DELETE - Delete image
│
├── /edit
│   ├── /               POST   - Create edit task
│   ├── /{task_id}      GET    - Get task status
│   └── /{task_id}      DELETE - Cancel task
│
├── /results
│   ├── /{task_id}      GET    - Download result
│   └── /{task_id}/url  GET    - Get result URL
│
├── /credits
│   ├── /               GET    - Get credit balance
│   ├── /history        GET    - Credit usage history
│   └── /plans          GET    - Available plans
│
└── /user
    ├── /profile        GET    - User profile
    ├── /history        GET    - Edit history
    └── /preferences    PUT    - Update preferences
```

## Performance Metrics

```
Typical Request Timeline:
├── Upload (0-2s)
│   └── Image compression & validation
│
├── Queue Wait (0-15s)
│   └── Depends on plan & load
│
├── Processing (5-20s)
│   ├── Preprocessing (1-2s)
│   ├── AI Inference (3-15s)
│   └── Post-processing (1-3s)
│
└── Download (0-3s)
    └── CDN delivery

Total: 6-40 seconds
Average: ~20 seconds
```

## Security Layers

```mermaid
graph TB
    User[User Request] --> WAF[WAF<br/>DDoS Protection]
    WAF --> RateLimit[Rate Limiter<br/>Request Throttling]
    RateLimit --> Auth[Authentication<br/>JWT Validation]
    Auth --> Validate[Input Validation<br/>XSS/SQL Injection]
    Validate --> Encrypt[Encryption<br/>TLS 1.3]
    Encrypt --> Access[Access Control<br/>RBAC]
    Access --> Audit[Audit Logging<br/>Security Events]
    Audit --> Backend[Backend Service]
```

---

These diagrams provide a complete visual understanding of how Raphael AI and similar systems work internally. Use them as reference for building your own implementation!
