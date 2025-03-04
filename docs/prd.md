# Product Requirements Document: AI-Powered Demo Day Showcase

## 1. Product Overview

### Purpose
Create an interactive showcase website for GauntletAI Challengers to display their projects and profiles during demo day, enhanced with AI features for improved visitor engagement and information discovery.

### Target Audience
- Potential employers
- Industry professionals
- Fellow developers
- GauntletAI staff and students
- Tech community members
- Dude(tte)s who want to see what the other dude(tte)s are up to

## 2. Product Features

### 2.1 Core Features

#### Home Page
- Grid layout of student profiles featuring:
  - Professional profile pictures
  - Full names
  - Short blurbs (elevator pitch)
- Search by name functionality

#### Student Detail Pages
- Comprehensive student profiles including:
  - Extended bio
  - Skills and technologies
  - Project showcase with descriptions
  - Social links and integrations (LinkedIn, GitHub)
  - Profile picture
  - Contact information

### 2.2 AI Features

#### Semantic Search
- Natural language search across student profiles
- Search parameters:
  - Skills
  - Project types
  - Keywords from bios
- Real-time search results updating
- Relevance-based result ranking

#### Voice-Enabled AI Chatbot
- Voice input capability
- Speech-to-text conversion using OpenAI Whisper
- Natural language processing via OpenAI GPT
- Text-to-speech response capability
- Context-aware responses about:
  - Student backgrounds
  - Projects
  - Technologies
  - General bootcamp information

## 3. Technical Requirements

### 3.1 Technology Stack

#### Frontend
- HTML5
- CSS3
- JavaScript

#### Backend
- Node.js runtime
- Express.js framework
- RESTful API architecture

#### AI/ML Infrastructure
- OpenAI API integration
  - GPT for chat responses
  - Whisper for speech-to-text
- PGvector database
  - Storage for semantic embeddings
  - Fast similarity search

#### Deployment
- EC2 instance backend that returns HTML pages and API JSON responses
- Environment configuration management

### 3.2 Data Architecture

#### 3.2 Data Architecture

- **Projects Table**
  - `id`: UUID, Primary Key, Default: gen_random_uuid()
  - `title`: VARCHAR(40), Not Null
  - `description`: TEXT
  - `video_url`: VARCHAR(255)
  - `screenshot_url`: VARCHAR(255)
  - `techs`: VARCHAR(40)[], Not Null (max 5)
  - `keywords`: VARCHAR(40[]), (max 5)
  - `github_url`: VARCHAR(255)
  - `deploy_url`: VARCHAR(255)
  - `profile_id`: UUID, Foreign Key, references `id` in `profiles` with ON DELETE CASCADE
  - `created_at`: TIMESTAMP, Default: CURRENT_TIMESTAMP
  - `updated_at`: TIMESTAMP, Default: CURRENT_TIMESTAMP

- **Profiles Table**
  - `id`: UUID, Primary Key, Default: gen_random_uuid()
  - `name`: VARCHAR(255), Not Null
  - `blurb`: VARCHAR(40)
  - `bio`: VARCHAR(700)
  - `skills`: VARCHAR(40)[], Not Null (max 3)
  - `pic_url`: VARCHAR(255)
  - `github_url`: VARCHAR(255)
  - `linkedin_url`: VARCHAR(255)
  - `created_at`: TIMESTAMP, Default: CURRENT_TIMESTAMP
  - `updated_at`: TIMESTAMP, Default: CURRENT_TIMESTAMP

## 4. User Stories

### Visitors
1. As a visitor, I want to browse student profiles to find potential candidates
2. As a visitor, I want to search for specific skills or technologies
3. As a visitor, I want to ask questions about students via voice
4. As a visitor, I want to easily access students' professional profiles

### Students
1. As a student, I want to showcase my projects effectively
2. As a student, I want to highlight my skills and experiences

## 5. Implementation Phases

### Phase 1: Core Website
- Setup project structure
- Implement basic frontend design
- Create backend API endpoints
- Setup database schema
- Basic CRUD operations

### Phase 2: AI Integration
- Implement OpenAI API integration
- Create embeddings for semantic search
- Implement voice interface
- Test AI features

### Phase 3: Polish & Deploy
- UI/UX improvements
- Performance optimization
- Testing and bug fixes

## 6. Success Metrics

### Technical Metrics
- Page load time < 2 seconds
- CRUD operations response time < 500ms
- Name search results in < 100ms
- Semantic search results in < 1 second
- Voice processing < 4 seconds
- 94.5% uptime

### User Experience Metrics
- Successful profile views
- Search query success rate
- Voice interaction completion rate
- Click-through rate to external profiles

## 7. Constraints & Assumptions

### Constraints
- OpenAI API rate limits and costs
- Browser compatibility requirements
- Mobile device support requirements

### Assumptions
- Students will provide complete profile information
- Stable internet connection for voice features
- Sufficient API credits for demo day traffic

## 8. Security Requirements

- API key security
- Rate limiting
- CORS configuration
- Environment variable protection
