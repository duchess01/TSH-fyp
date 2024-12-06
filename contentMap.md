# TSH FYP Project Content Map

## Project Overview

A full-stack application for processing and analyzing machine manuals using AI/ML capabilities.  
**Target Audience**: Technical teams and field engineers who work with machine manuals.  
**Purpose**: Streamline manual analysis, reduce time spent on repetitive tasks, and improve data accessibility.

## System Architecture

### Frontend Service

- **Technology**: React.js with Tailwind CSS
- **Implementation**: TypeScript
- **Features**:
  - User interface components
  - Accessibility standards (WCAG compliant)
  - Testing framework: Jest

### Backend Services

1. **User Service (Authentication & Authorization)**

   - JWT-based authentication
   - User management endpoints
   - Handles user registration and login
   - Manages user sessions

2. **Chat Service (Real-time Communication)**

   - WebSocket implementation
   - Real-time message handling
   - Chat history management
   - Session tracking

3. **NER-LLM Service (Named Entity Recognition)**

   - FastAPI implementation
   - Keyword extraction functionality
   - Embedding generation
   - Entity recognition processing
   - Manual content analysis

4. **Upload Service (File Handling)**

   - PDF processing
   - File management endpoints
   - Document validation
   - Content extraction

5. **Analytics Service (Data Analysis)**

   - Usage statistics
   - Performance metrics
   - User behavior tracking
   - System monitoring

6. **QnA Service (Question & Answer Processing)**

   - Query handling
   - Response generation
   - Context management
   - Answer validation

7. **Langchain Service (LLM Integration)**
   - LLM model management
   - Retrieval Augmented Generation (RAG) implementation
   - Pinecone integration for vector search
   - Query processing
   - Response generation

### System Communication

- REST API for inter-service communication.

## Database Structure

**PostgreSQL Instances**:

- User DB (Port 5433)
- Chat DB (Port 5434)
- NER DB (Port 5435)
- QnA DB (Port 5436)

**Backup and Recovery**:

- Automated daily backups
- Disaster recovery plan in place for critical data
- Regular schema migration tracking.

## AI/ML Pipeline

1. **Document Processing**

   - PDF upload
   - Text extraction
   - Content structuring
   - Metadata extraction

2. **NER Processing**

   - Keyword extraction
   - Entity recognition
   - Embedding generation
   - Context analysis
   - Manual segmentation

3. **Vector Storage**

   - Pinecone integration
   - Embedding storage
   - Namespace management
   - Vector indexing
   - Similarity search

4. **Query Processing**
   - Question analysis
   - Context retrieval
   - Response generation
   - Answer ranking
   - Quality assurance

## DevOps Infrastructure

**Docker Configuration**:

- User service (3000)
- Chat service (3001)
- Analytics service (3002)
- QnA service (3003)
- NER-LLM service (8000)
- Upload service (8002)
- Langchain service (8001)

**Environment Setup**:

- Environment variable management
- API key configuration
- Service connectivity
- Database configuration

**CI/CD Pipeline**:

- Testing tools: Jest, Pytest
- Deployment platform: GitHub Actions

## API Structure

**Authentication Endpoints**:

- Login
- User management
- Session handling
- Password reset
- Account verification

**File Management Endpoints**:

- Upload
- Processing
- Retrieval
- Status tracking
- Error handling

**Query Endpoints**:

- Question processing
- Context retrieval
- Response generation
- History tracking
- Performance monitoring

## Development Workflow

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request
6. Code review
7. Testing
8. Deployment

## Security Implementation

- JWT authentication
- API key management
- CORS configuration
- Rate limiting
- Input validation
- Data encryption

## Documentation

- API documentation (e.g., Swagger/OpenAPI)
- Setup guides
- Development guidelines
- Deployment procedures
- Troubleshooting guides
