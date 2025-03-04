I'll create a Technical Design Document that builds on the PRD and incorporates PostgreSQL with pgvector and S3 for image storage.

# Technical Design Document: AI-Powered Demo Day Showcase

## 1. System Architecture

### 1.1 High-Level Architecture Diagram
```
                                   ┌─────────────────┐
                                   │                 │
                                   │  AWS S3 Bucket  │
                                   │  (Image Store)  │
                                   │                 │
                                   └────────┬────────┘
                                            │
┌──────────────┐    HTTP/WS     ┌───────────┴────────────┐     ┌─────────────┐
│              │◄──────────────►│                        │◄───►│             │
│   Browser    │                │    Express Backend     │     │  PostgreSQL │
│   Client     │                │    (EC2 Instance)      │     │  (pgvector) │
│              │◄──────────────►│                        │◄───►│             │
└──────────────┘                └───────────┬────────────┘     └─────────────┘
                                            │
                                    ┌───────┴───────┐
                                    │               │
                                    │  OpenAI API   │
                                    │               │
                                    └───────────────┘
```

## 2. Database Design

### 2.1 PostgreSQL Schema

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(40) NOT NULL,
    description TEXT,
    video_url VARCHAR(255),
    screenshot_url VARCHAR(255),
    techs VARCHAR(40)[] NOT NULL, -- 5 max
    keywords VARCHAR(40)[], -- 5 max
    github_url VARCHAR(255),
    deploy_url VARCHAR(255),
    profile_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    blurb VARCHAR(40),
    bio VARCHAR(700),
    skills VARCHAR(40)[] NOT NULL, -- 3 max
    pic_url VARCHAR(255),
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    profile_id UUID,
    embedding vector(1536)  -- Adjust dimension based on your embedding model
);

-- Add the foreign key constraint after both tables exist
ALTER TABLE projects 
ADD CONSTRAINT fk_profile 
FOREIGN KEY (profile_id) REFERENCES profiles(id) 
ON DELETE CASCADE;

ALTER TABLE documents
ADD CONSTRAINT fk_profile
FOREIGN KEY (profile_id) REFERENCES profiles(id)
ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_projects_profile_id ON projects(profile_id);
CREATE INDEX idx_profiles_name ON profiles(name);
CREATE INDEX idx_documents_profile_id ON documents(profile_id);
```

## 3. API Design

### 3.1 RESTful Endpoints

```typescript
// Student Routes
GET    /api/profiles              // List all profiles
GET    /api/profiles/:id          // Get profile details
POST   /api/profiles              // Create profile
PUT    /api/profiles/:id          // Update profile
DELETE /api/profiles/:id          // Delete profile

// Project Routes
GET    /api/profiles/:id/projects // List profile projects
POST   /api/projects              // Create project
PUT    /api/projects/:id          // Update project
DELETE /api/projects/:id          // Delete project

// Search Routes
POST   /api/search               // Semantic search

// Chat Routes
POST   /api/chat/message         // Send text message
POST   /api/chat/voice           // Send voice message
```

### 3.2 WebSocket Events

```typescript
interface WebSocketEvents {
    'chat:start': void;
    'chat:message': { text: string };
    'chat:voice': { audioBlob: Blob };
    'chat:response': { text: string };
    'chat:error': { message: string };
}
```

## 4. Component Design

### 4.1 Image Upload Service

```typescript
interface ImageUploadService {
    uploadToS3(file: Buffer, metadata: {
        filename: string;
        contentType: string;
        studentId: number;
    }): Promise<string>; // Returns S3 URL

    deleteFromS3(url: string): Promise<void>;
}
```

### 4.2 Vector Search Service

```typescript
interface VectorSearchService {
    createEmbedding(text: string): Promise<number[]>;
    
    searchSimilar(query: string, options: {
        limit?: number;
        threshold?: number;
        contentType?: string[];
    }): Promise<SearchResult[]>;
}
```

### 4.3 Chat Service

```typescript
interface ChatService {
    processVoiceInput(audio: Buffer): Promise<string>; // Uses Whisper
    
    generateResponse(input: string, context: {
        studentId?: number;
        previousMessages?: Message[];
    }): Promise<string>; // Uses GPT
}
```

## 5. Implementation Details

### 5.1 Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=production

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=demo_day
POSTGRES_USER=user
POSTGRES_PASSWORD=password

# AWS
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=demo-day-profiles

# OpenAI
OPENAI_API_KEY=your_api_key
```

### 5.2 S3 Bucket Configuration

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicRead",
            "Effect": "Allow",
            "Principal": "*",
            "Action": ["s3:GetObject"],
            "Resource": ["arn:aws:s3:::demo-day-profiles/*"]
        }
    ]
}
```

### 5.3 Data Flow for Semantic Search

1. **Embedding Creation**
```typescript
async function createProfileEmbeddings(profile: Profile) {
    // Create embeddings for different content types
    const bioEmbedding = await createEmbedding(profile.bio);
    const skillsEmbedding = await createEmbedding(
        profile.skills.join(' ')
    );
    const projectsEmbedding = await createEmbedding(
        profile.projects.map(p => 
            `${p.name} ${p.description}`
        ).join(' ')
    );

    // Store in database
    await Promise.all([
        storeEmbedding('bio', bioEmbedding, profile.id),
        storeEmbedding('skills', skillsEmbedding, profile.id),
        storeEmbedding('projects', projectsEmbedding, profile.id)
    ]);
}
```

## 6. Security Measures

### 6.1 API Security

```typescript
// Input validation middleware
const validateProfile = [
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('blurb').trim().isLength({ min: 2, max: 100 }),
    body('bio').trim().isLength({ min: 2, max: 700 }),
    body('skills').isArray(),
    body('pic_url').isURL(),
    // ... more validation rules
];
```

### 6.2 File Upload Security

```typescript
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
};

const upload = multer({
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max-size
    }
});
```

## 7. Monitoring and Logging

```typescript
// Winston logger configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'demo-day-api' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Prometheus metrics
const metrics = {
    httpRequestDurationMs: new prometheus.Histogram({
        name: 'http_request_duration_ms',
        help: 'Duration of HTTP requests in ms',
        labelNames: ['route']
    }),
    // ... more metrics
};
```

## 8. Deployment Checklist

1. Database Setup
   - [ ] Create PostgreSQL instance
   - [ ] Enable pgvector extension
   - [ ] Run migration scripts
   - [ ] Create indexes

2. AWS Configuration
   - [ ] Create S3 bucket
   - [ ] Configure CORS
   - [ ] Set up IAM roles
   - [ ] Launch EC2 instance

3. Application Deployment
   - [ ] Set environment variables
   - [ ] Install dependencies
   - [ ] Build application
   - [ ] Configure nginx
   - [ ] Setup SSL certificates

4. Monitoring Setup
   - [ ] Configure logging
   - [ ] Setup error tracking
   - [ ] Enable performance monitoring
