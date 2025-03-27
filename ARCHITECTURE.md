# Vote Counter System Architecture

## System Overview

```mermaid
graph TB
    subgraph Client ["Client (PWA)"]
        UI[User Interface]
        SW[Service Worker]
        LC[Local Cache]
        
        UI --> SW
        SW --> LC
    end

    subgraph Auth ["Authentication Layer"]
        FA[Firebase Auth]
    end

    subgraph Backend ["Backend Services"]
        API[Next.js API Routes]
        SYNC[Sync Service]
        
        API --> SYNC
    end

    subgraph Storage ["Data Storage"]
        FRD[Firebase Realtime DB]
        MDB[MongoDB]
        
        SYNC --> FRD
        SYNC --> MDB
    end

    UI --> FA
    UI --> API
    SW --> FRD
```

## Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant PWA as PWA Client
    participant SW as Service Worker
    participant API as Next.js API
    participant FRD as Firebase RT DB
    participant MDB as MongoDB

    Note over U,MDB: Online Flow
    U->>PWA: Submit Vote
    PWA->>API: POST /api/votes
    API->>FRD: Update Real-time Count
    API->>MDB: Store Vote Record
    FRD-->>PWA: Sync Update
    
    Note over U,MDB: Offline Flow
    U->>PWA: Submit Vote
    PWA->>SW: Cache Vote
    SW->>PWA: Confirm Storage
    
    Note over U,MDB: Reconnection Flow
    SW->>API: Sync Cached Votes
    API->>FRD: Batch Update
    API->>MDB: Batch Store
    FRD-->>PWA: Sync Complete
```

## Component Architecture

```mermaid
graph TD
    subgraph UI ["UI Components"]
        Login[Login Screen]
        Location[Location Selector]
        Counter[Vote Counter]
        Dashboard[Dashboard]
    end

    subgraph State ["State Management"]
        Auth[Auth Context]
        Vote[Vote Context]
        Sync[Sync Context]
    end

    subgraph Data ["Data Layer"]
        API[API Client]
        Cache[IndexedDB Cache]
        RT[Realtime Client]
    end

    Login --> Auth
    Location --> Vote
    Counter --> Vote
    Dashboard --> Vote
    
    Auth --> API
    Vote --> API
    Vote --> Cache
    Sync --> RT
    
    Cache --> Sync
```

## Security Architecture

```mermaid
graph LR
    subgraph Client ["Client Security"]
        JWT[JWT Tokens]
        SSL[SSL/TLS]
        SW[Service Worker]
    end

    subgraph Server ["Server Security"]
        Auth[Authentication]
        RBAC[Role Based Access]
        Rate[Rate Limiting]
    end

    subgraph Data ["Data Security"]
        Encrypt[Encryption at Rest]
        Backup[Automated Backups]
        Audit[Audit Logs]
    end

    JWT --> Auth
    Auth --> RBAC
    RBAC --> Encrypt
```

## Offline Sync Strategy

```mermaid
stateDiagram-v2
    [*] --> Online
    Online --> Offline: Connection Lost
    Offline --> Syncing: Connection Restored
    Syncing --> Online: Sync Complete
    Syncing --> ConflictResolution: Conflicts Detected
    ConflictResolution --> Syncing: Resolved
    ConflictResolution --> Manual: Requires Intervention
    Manual --> Syncing: Fixed
```

## Deployment Architecture

```mermaid
graph TB
    subgraph Client ["Client Deployment"]
        Vercel[Vercel Edge Network]
        CDN[CDN Cache]
    end

    subgraph Services ["Backend Services"]
        Firebase[Firebase Services]
        NextAPI[Next.js API]
    end

    subgraph Database ["Database Layer"]
        Mongo[MongoDB Atlas]
        RealtimeDB[Firebase Realtime DB]
    end

    Vercel --> Firebase
    Vercel --> NextAPI
    NextAPI --> Mongo
    Firebase --> RealtimeDB