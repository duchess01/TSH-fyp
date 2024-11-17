# TSH FYP Project - Intelligent Machine Manual Processing System

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Development](#development)
- [Testing](#testing)
- [CI/CD](#cicd)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## Overview

This project is a sophisticated full-stack application designed to process and analyze machine manuals using AI/ML capabilities. It features a microservices architecture with multiple specialized services handling different aspects of the application.

Key Features:

- PDF manual upload and processing
- Machine information extraction using LLMs
- User authentication and authorization
- Analytics dashboard
- Real-time chat interface
- Structured data extraction from manuals

## System Architecture

The application follows a microservices architecture with the following key components:

1. **Frontend Service**: React.js application with Tailwind CSS
2. **Backend Services**:
   - User Service (Authentication & Authorization)
   - Chat Service (Real-time communication)
   - NER-LLM Service (Named Entity Recognition)
   - Upload Service (File handling)
   - Analytics Service (Data analysis)
   - QnA Service (Question & Answer processing)
   - Langchain Service (LLM integration)

## Technologies Used

### Backend

- Node.js/Express.js for User and Chat services
- Python/FastAPI for NER-LLM and Upload services
- PostgreSQL for data persistence
- Docker & Docker Compose for containerization
- LangChain for LLM integration
- JWT for authentication

### Frontend

- React.js
- Tailwind CSS
- TypeScript

### DevOps & Infrastructure

- Docker
- GitHub Actions
- PostgreSQL
- Nginx (reverse proxy)

## Prerequisites

- Docker & Docker Compose
- Node.js (v20 or later)
- Python 3.11+
- PostgreSQL
- Git

## Installation & Setup

1. Clone the repository:

```bash
git clone https://github.com/duchess01/TSH-fyp.git
cd TSH-fyp
```

2. Environment Setup:
   Create `.local.env` file in the backend directory with required credentials:

```
DUCHESS_API_KEY=your_api_key_here
```

3. Docker Setup:

```bash
cd backend
docker-compose up --build
```

This will start all microservices defined in the docker-compose.yml:

- User service on port 3000
- Chat service on port 3001
- Analytics service on port 3002
- QnA service on port 3003
- NER-LLM service on port 8000
- Upload service on port 8002
- Langchain service on port 8001

## Running the Application

### Development Mode

1. Start all services using Docker Compose:

```bash
docker-compose up --build
```

2. To stop all services:

```bash
docker-compose down -v
```

## Development

### Adding New Features

1. Create a new branch:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes
3. Submit a pull request

### Database Management

The project uses multiple PostgreSQL instances for different services:

- User DB (Port 5433)
- Chat DB (Port 5434)
- NER DB (Port 5435)
- QnA DB (Port 5436)

## API Documentation

### User Service Endpoints

- POST `/api/users/login` - User authentication
- POST `/api/users/add` - Add new user
- GET `/api/users/getUserDetails/:id` - Get user details
- PUT `/api/users/update/:id` - Update user details
- DELETE `/api/users/delete/:id` - Delete user

### Upload Service Endpoints

- POST `/upload` - Upload and process PDF files
- GET `/ready` - Health check endpoint

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Add License Information]
