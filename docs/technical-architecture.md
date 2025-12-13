# Technical Architecture

## Overview
Interview tracking application for IT projects built with React frontend, Node.js Azure Functions backend, and Azure Table Storage database.

## Architecture Principles

### SOLID Principles
1. **Single Responsibility Principle (SRP)**: Each class/module has one reason to change
2. **Open/Closed Principle (OCP)**: Open for extension, closed for modification
3. **Liskov Substitution Principle (LSP)**: Subtypes must be substitutable for base types
4. **Interface Segregation Principle (ISP)**: Many specific interfaces over one general interface
5. **Dependency Inversion Principle (DIP)**: Depend on abstractions, not concretions

### Clean Code Practices
- Meaningful names for variables, functions, and classes
- Small, focused functions (single responsibility)
- DRY (Don't Repeat Yourself)
- Proper error handling
- Comprehensive tests
- Clear code organization and folder structure

## Technology Stack

### Frontend
- **Framework**: React 18+
- **Language**: TypeScript
- **State Management**: React Context API / Redux Toolkit (TBD based on complexity)
- **Routing**: React Router v6
- **UI Framework**: Material-UI or Tailwind CSS (TBD)
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Validation**: Zod or Yup
- **Testing**: Jest + React Testing Library
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js 18+ LTS
- **Platform**: Azure Functions v4
- **Language**: TypeScript
- **Framework**: Azure Functions HTTP triggers
- **Validation**: Zod
- **Testing**: Jest
- **API Documentation**: OpenAPI/Swagger

### Database
- **Primary Storage**: Azure Table Storage
- **SDK**: @azure/data-tables

### Infrastructure
- **Hosting**: Azure
  - Frontend: Azure Static Web Apps or Azure Storage Static Website
  - Backend: Azure Functions (Consumption or Premium plan)
  - Database: Azure Table Storage
- **CI/CD**: GitHub Actions
- **Version Control**: GitHub

## Application Architecture

### Frontend Architecture

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components (Button, Input, etc.)
│   └── features/        # Feature-specific components
├── pages/               # Page components (route views)
├── services/            # API integration layer
│   └── api/            # API client and endpoints
├── hooks/               # Custom React hooks
├── context/             # React Context providers
├── models/              # TypeScript interfaces/types
├── utils/               # Utility functions
├── constants/           # Application constants
└── tests/               # Test files
```

**Design Patterns:**
- **Container/Presenter Pattern**: Separate logic from presentation
- **Custom Hooks**: Encapsulate reusable stateful logic
- **Service Layer**: Abstract API calls
- **Repository Pattern**: Data access abstraction

### Backend Architecture

```
backend/
├── src/
│   ├── functions/           # Azure Function handlers
│   │   ├── candidates/     # Candidate-related functions
│   │   └── health/         # Health check endpoints
│   ├── domain/             # Business logic layer
│   │   ├── entities/       # Domain entities
│   │   ├── services/       # Business services
│   │   └── validators/     # Domain validation
│   ├── infrastructure/     # External concerns
│   │   ├── database/       # Data access layer
│   │   │   ├── repositories/  # Repository implementations
│   │   │   └── mappers/    # Entity-to-DTO mappers
│   │   └── config/         # Configuration
│   ├── shared/             # Shared utilities
│   │   ├── errors/         # Custom error classes
│   │   └── utils/          # Helper functions
│   └── tests/              # Test files
└── host.json               # Azure Functions configuration
```

**Design Patterns:**
- **Clean Architecture**: Separate concerns into layers
- **Repository Pattern**: Abstract data access
- **Dependency Injection**: Inject dependencies via constructors
- **Factory Pattern**: Create complex objects
- **Strategy Pattern**: Interchangeable algorithms (e.g., validation strategies)

### Data Layer

#### Azure Table Storage Schema

**Candidates Table**
- PartitionKey: `CANDIDATE#{year-month}` (e.g., CANDIDATE#2025-01)
- RowKey: `{GUID}` (unique candidate ID)
- Properties:
  - candidateId (string)
  - fullName (string)
  - email (string)
  - phone (string)
  - positionAppliedFor (string)
  - applicationDate (DateTime)
  - currentStatus (string)
  - interviewStage (string)
  - source (string)
  - priority (string)
  - resumeUrl (string)
  - technicalSkillsRating (number)
  - interviewerNames (string - JSON array)
  - interviewNotes (string)
  - nextFollowUpDate (DateTime)
  - decisionStatus (string)
  - offerDetails (string)
  - createdAt (DateTime)
  - updatedAt (DateTime)
  - createdBy (string)
  - updatedBy (string)

## API Design

### RESTful Endpoints

```
GET    /api/candidates              # List all candidates (with pagination & filters)
POST   /api/candidates              # Create new candidate
GET    /api/candidates/{id}         # Get candidate by ID
PUT    /api/candidates/{id}         # Update candidate
DELETE /api/candidates/{id}         # Delete candidate
GET    /api/candidates/search       # Search candidates
GET    /api/candidates/export       # Export to Excel
POST   /api/candidates/import       # Import from Excel
GET    /api/health                  # Health check
```

### Request/Response Format

**Common Response Structure:**
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "metadata": {
    "timestamp": "2025-01-13T10:00:00Z",
    "version": "1.0"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": { ... }
  },
  "metadata": { ... }
}
```

## Security Considerations

1. **Authentication**: Azure AD B2C or custom JWT-based auth
2. **Authorization**: Role-based access control (RBAC)
3. **Data Validation**: Input validation on both frontend and backend
4. **CORS**: Properly configured for frontend domain
5. **Secrets Management**: Azure Key Vault for sensitive data
6. **HTTPS**: Enforce HTTPS for all communications
7. **Rate Limiting**: Prevent abuse of API endpoints

## Performance Considerations

1. **Pagination**: Implement cursor-based pagination for large datasets
2. **Caching**:
   - Frontend: React Query for client-side caching
   - Backend: Azure Functions output caching
3. **Lazy Loading**: Load components and data on demand
4. **Optimistic Updates**: Update UI immediately, sync with server
5. **Connection Pooling**: Reuse Azure Table Storage client instances

## Monitoring & Observability

1. **Application Insights**: Azure Application Insights for telemetry
2. **Logging**: Structured logging with correlation IDs
3. **Error Tracking**: Centralized error logging
4. **Performance Metrics**: Response times, success rates
5. **Health Checks**: Regular health endpoint monitoring

## Development Workflow

1. **Version Control**: Git with feature branch workflow
2. **Code Review**: PR reviews required before merge
3. **Testing**: Minimum 80% code coverage
4. **CI/CD**: Automated build, test, and deployment
5. **Environments**: Dev, Staging, Production

## Quality Gates

1. **Pre-commit**: Linting and formatting
2. **Pre-push**: Unit tests must pass
3. **PR**: Code review + integration tests
4. **Deployment**: All tests + security scan
