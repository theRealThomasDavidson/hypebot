# HypeBot Chatbot Implementation Guide

## Overview

The HypeBot chatbot uses Retrieval-Augmented Generation (RAG) to provide accurate, contextual responses about challenger profiles and their projects. Implementation will be done in two phases:

1. **Phase 1: Text-Based Chatbot**
   - Core RAG functionality
   - Text-based queries and responses
   - Profile and project information retrieval
   - Conversation history

2. **Phase 2: Voice Capabilities** (Future Enhancement)
   - Voice input processing
   - Text-to-speech responses
   - Voice conversation history

## Architecture Components

1. **Vector Database (Pinecone)**
   - Stores embeddings for profile and project information
   - Enables semantic search capabilities
   - Configured with dimension=1536 (OpenAI embedding size)
   - Response time < 1s (per PRD requirements)

2. **PostgreSQL Database**
   - Stores raw profile and project data
   - Maintains conversation history
   - Tracks relationships between entities
   - Schema aligned with PRD specifications

3. **OpenAI Integration**
   - Phase 1:
     - Embeddings generation (text-embedding-ada-002)
     - Response formatting (gpt-3.5-turbo)
   - Phase 2:
     - Voice transcription (Whisper API)
     - Text-to-speech responses

## Phase 1: Text-Based Chatbot Implementation

### Project Structure
```
api/src/
├── routes/
│   └── chat.routes.js      # Chat endpoint definitions
├── controllers/
│   └── chat.controller.js  # Chat business logic
├── lib/
│   ├── openai/
│   │   ├── embeddings.js   # Embedding generation
│   │   └── chat.js        # Response generation
│   ├── pinecone/
│   │   └── client.js      # Vector DB operations
│   └── db/
│       └── postgres.js     # Database operations
└── pages/
    └── chat.js            # Chat interface rendering
```

### 1. Data Preparation

The base tables for profiles and projects are already implemented in schema.sql. We need to add the following for chatbot functionality:

- [x] Initialize Pinecone:
```javascript
// Already implemented in lib/pinecone.js
const { connectPinecone } = require('../lib/pinecone');

// During app initialization:
async function initializeServices() {
  try {
    // Connect to Pinecone and get client/index references
    const { client, index } = await connectPinecone();
    console.log('✅ Pinecone connection complete');
    
    // For development/testing, a mock implementation is available:
    // setupMockPinecone();
  } catch (error) {
    console.error('Failed to initialize Pinecone:', error);
    process.exit(1);
  }
}
```

- [x] Create conversation management tables:
```sql
-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create conversation messages table
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  referenced_profiles UUID[] DEFAULT '{}',
  referenced_projects UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_role CHECK (role IN ('user', 'assistant'))
);

-- Create index for conversation lookups
CREATE INDEX idx_conversation_messages ON conversation_messages(conversation_id);
CREATE INDEX idx_conversation_messages_created ON conversation_messages(created_at);
```

### 2. Embedding Generation Pipeline

#### Implementation Steps
- [x] Set up OpenAI client configuration
  - [x] Create `lib/openai/config.ts` for API key and model settings
  - [x] Add error handling for missing API keys
  - [x] Add retry logic for API calls

- [x] Create embedding generation utilities
  - [x] Implement text preprocessing functions
  - [x] Add type definitions for Profile and Project embeddings
  - [x] Create embedding cache to prevent duplicate generations

- [x] Implement profile embedding generation
  - [x] Create text template for profile information
  - [x] Generate embeddings using OpenAI API
  - [x] Store embeddings in Pinecone with profile metadata
  - [x] Add error handling and logging

- [x] Implement project embedding generation
  - [x] Create text template for project information
  - [x] Generate embeddings using OpenAI API
  - [x] Store embeddings in Pinecone with project metadata
  - [x] Add error handling and logging

- [x] Create embedding update triggers
  - [x] Add hooks for profile updates
  - [x] Add hooks for project updates
  - [x] Implement background job for bulk updates

- [x] Add testing and validation
  - [x] Unit tests for embedding generation
  - [x] Integration tests with Pinecone
  - [x] Validation of embedding dimensions
  - [x] Performance benchmarking

✅ Embedding Generation Pipeline implementation complete! Moving on to RAG Implementation...

Example implementation (to be updated as we complete each step):
```typescript
// lib/openai/embeddings.js
export async function generateProfileEmbedding(profile: Profile): Promise<number[]> {
  const textToEmbed = `
    Name: ${profile.name}
    Bio: ${profile.bio}
    Skills: ${profile.skills.join(', ')}
    Projects: ${profile.projects.map(p => p.title).join(', ')}
  `.trim();
  
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: textToEmbed,
  });
  
  // Store the embedding in Pinecone
  await storeDocumentWithEmbedding(
    textToEmbed,
    profile.id,
    response.data[0].embedding,
    {
      type: 'profile',
      name: profile.name,
      skills: profile.skills
    }
  );
  
  return response.data[0].embedding;
}

export async function generateProjectEmbedding(project: Project): Promise<number[]> {
  const textToEmbed = `
    Title: ${project.title}
    Description: ${project.description}
    Technologies: ${project.techs.join(', ')}
    Keywords: ${project.keywords.join(', ')}
    Created by: ${project.profile.name}
  `.trim();
  
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: textToEmbed,
  });
  
  // Store the embedding in Pinecone
  await storeDocumentWithEmbedding(
    textToEmbed,
    project.id,
    response.data[0].embedding,
    {
      type: 'project',
      title: project.title,
      techs: project.techs,
      keywords: project.keywords,
      profile_id: project.profile.id
    }
  );
  
  return response.data[0].embedding;
}

export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: query.trim(),
  });
  
  return response.data[0].embedding;
}
```

### 3. RAG Implementation

- [x] Implement semantic search functionality
  - [x] Query embedding generation
  - [x] Vector similarity search
  - [x] Result filtering and ranking
  - [x] Performance optimization

- [x] Implement context assembly
  - [x] Source document retrieval
  - [x] Context formatting
  - [x] Source attribution

- [x] Implement response generation
  - [x] Prompt engineering
  - [x] Response formatting
  - [x] Source citation
  - [x] Error handling

✅ RAG Implementation complete! Moving on to Controller Implementation...

### 4. Controller Implementation

- [x] Implement chat controller
  - [x] Query handling
  - [x] Response formatting
  - [x] Error handling
  - [x] Logging

- [x] Implement conversation management
  - [x] History tracking
  - [x] Context persistence
  - [x] Cleanup routines

✅ Controller Implementation complete! Moving on to Route Definition...

### 5. Route Definition

- [x] Define chat endpoints
  - [x] POST /api/chat/query
  - [x] GET /api/chat/conversations/:id
  - [x] DELETE /api/chat/conversations/:id

✅ Route Definition complete! Moving on to Testing Strategy...

### 6. Testing Strategy

- [x] Unit Tests
   - [x] Test embedding generation
   - [x] Test semantic search
   - [x] Test context assembly
   - [x] Test response generation
   - [x] Test conversation management

- [x] Integration Tests
   - [x] Test complete query flow
   - [x] Test conversation persistence
   - [x] Test error handling
   - [x] Test rate limiting

- [x] Performance Tests
   - [x] Measure response times
   - [x] Test concurrent requests
   - [x] Monitor token usage

✅ Testing Strategy complete! Moving on to Monitoring and Logging...

### 7. Monitoring and Logging

- [x] Implement structured logging:
```typescript
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'chatbot' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

✅ Monitoring and Logging complete! Moving on to Deployment Checklist...

### 8. Deployment Checklist

1. **Environment Setup**
   - [x] Configure OpenAI API key
   - [x] Set up Pinecone environment
   - [x] Configure PostgreSQL connection

2. **Database Setup**
   - [x] Run schema migrations
   - [x] Generate initial embeddings
   - [x] Verify vector search

3. **Service Deployment**
   - [x] Deploy API service
   - [x] Configure rate limits
   - [x] Set up monitoring

✅ Phase 1 Implementation Complete!

## Phase 2: Voice Capabilities (Future Enhancement)

This phase will be implemented after the text-based chatbot is stable and tested. It will include:

1. **Voice Input Processing**
   - Whisper API integration
   - Audio file handling
   - Speech-to-text conversion

2. **Voice Response Generation**
   - Text-to-speech integration
   - Voice response caching
   - Audio streaming

3. **Schema Updates**
   - Add voice_enabled to conversations
   - Add voice_data to messages
   - Add audio processing metadata

4. **Additional Testing**
   - Voice recognition accuracy
   - Audio quality testing
   - Voice response latency

Detailed implementation steps for Phase 2 will be documented once Phase 1 is complete and stable. 