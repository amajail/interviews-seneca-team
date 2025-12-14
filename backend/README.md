# Backend - Interview Tracking Application

Azure Functions backend API for the Interview Tracking Application.

## Overview

This backend provides a serverless API built with Azure Functions v4 and TypeScript, following clean architecture principles and SOLID design patterns.

## Tech Stack

- **Runtime**: Node.js 18+ LTS
- **Framework**: Azure Functions v4
- **Language**: TypeScript (strict mode)
- **Database**: Azure Table Storage
- **Validation**: Zod
- **Code Quality**: ESLint + Prettier

## Architecture

The project follows clean architecture with clear separation of concerns:

```
src/
├── functions/              # Azure Function handlers (HTTP triggers)
│   ├── candidates/        # Candidate-related endpoints
│   └── health/           # Health check endpoint
├── domain/               # Business logic and entities
│   ├── entities/        # Domain entities and DTOs
│   ├── services/        # Business logic services
│   └── validators/      # Validation schemas
├── infrastructure/      # External dependencies
│   ├── database/       # Data access layer
│   │   ├── repositories/  # Repository implementations
│   │   └── mappers/      # Entity-to-DTO mappers
│   └── config/         # Configuration
└── shared/            # Shared utilities
    ├── errors/       # Custom error classes
    └── utils/        # Utility functions
```

## Prerequisites

- Node.js 18+ LTS
- Azure Functions Core Tools v4
- Azurite (Azure Storage Emulator) for local development

### Installing Azure Functions Core Tools

```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

### Installing Azurite

```bash
npm install -g azurite
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example settings file:

```bash
cp local.settings.json.example local.settings.json
```

For local development, the default settings use Azurite (local storage emulator).

### 3. Start Azurite

In a separate terminal:

```bash
azurite --silent --location ./azurite --debug ./azurite/debug.log
```

Or use the npm script:

```bash
npm run azurite
```

### 4. Build the Project

```bash
npm run build
```

### 5. Start the Functions

```bash
npm start
```

The API will be available at `http://localhost:7071/api`

## Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch mode for development
- `npm run clean` - Remove build artifacts
- `npm start` - Start the Azure Functions runtime
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests (to be implemented)

## API Endpoints

### Health Check

```
GET /api/health
```

Returns the health status of the API.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-13T10:30:00.000Z",
  "service": "interviews-seneca-backend",
  "version": "1.0.0"
}
```

### Candidates (Coming Soon)

```
GET    /api/candidates       # List all candidates
GET    /api/candidates/{id}  # Get candidate by ID
POST   /api/candidates       # Create new candidate
PUT    /api/candidates/{id}  # Update candidate
DELETE /api/candidates/{id}  # Delete candidate
```

## Development Guidelines

### SOLID Principles

This codebase follows SOLID principles:

- **Single Responsibility**: Each class/function has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes are substitutable for their base types
- **Interface Segregation**: Many specific interfaces over one general
- **Dependency Inversion**: Depend on abstractions, not concretions

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for code formatting
- Meaningful variable and function names
- Small, focused functions
- Comprehensive error handling

### Testing

- Minimum 80% code coverage required
- Unit tests for business logic
- Integration tests for API endpoints
- Test files: `*.test.ts`

## Project Structure Details

### Functions Layer

HTTP-triggered Azure Functions that handle requests and responses. Keep this layer thin - it should only:
- Parse requests
- Call domain services
- Format responses
- Handle HTTP-specific concerns

### Domain Layer

Contains business logic and entities. This layer should be independent of frameworks and external dependencies.

- **Entities**: Core business objects
- **Services**: Business logic operations
- **Validators**: Validation rules using Zod

### Infrastructure Layer

Handles external dependencies like databases, APIs, file systems.

- **Repositories**: Data access using repository pattern
- **Mappers**: Convert between domain entities and database models
- **Config**: Configuration and environment variables

### Shared Layer

Reusable utilities and cross-cutting concerns.

- **Errors**: Custom error classes
- **Utils**: Helper functions and utilities

## Environment Variables

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Storage connection string | `UseDevelopmentStorage=true` (local) |
| `TABLE_NAME` | Table name for candidates | `candidates` |
| `FUNCTIONS_WORKER_RUNTIME` | Runtime for Functions | `node` |

## Deployment

Deployment is handled through CI/CD pipelines (to be configured in INFRA-005).

For manual deployment:

```bash
func azure functionapp publish <function-app-name>
```

## Troubleshooting

### Port Already in Use

If port 7071 is already in use:

```bash
# Find the process
lsof -i :7071

# Kill it
kill -9 <PID>
```

### Azurite Connection Issues

Ensure Azurite is running:

```bash
azurite --version
```

Check connection string in `local.settings.json`:

```json
"AZURE_STORAGE_CONNECTION_STRING": "UseDevelopmentStorage=true"
```

### TypeScript Errors

Clean and rebuild:

```bash
npm run clean
npm run build
```

## Next Steps

1. Implement BACK-001: Create Candidate Entity and Repository
2. Implement BACK-002: Create Candidate API endpoint
3. Implement BACK-003: Get Candidate by ID API endpoint
4. Add comprehensive unit and integration tests
5. Configure CI/CD pipeline

## Resources

- [Azure Functions Documentation](https://docs.microsoft.com/azure/azure-functions/)
- [Azure Table Storage SDK](https://docs.microsoft.com/azure/storage/tables/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## License

MIT
