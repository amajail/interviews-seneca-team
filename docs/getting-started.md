# Getting Started Guide

## Quick Start Overview

This guide will help you understand the project structure and start contributing to the interview tracking application.

## Project Vision

Replace the manual Excel-based candidate tracking system with a modern, scalable web application that:
- Supports multiple concurrent users
- Provides real-time updates
- Offers advanced search and filtering
- Maintains audit trails
- Enables data import/export

## Tech Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 + TypeScript | User interface |
| Backend | Azure Functions + Node.js | API endpoints |
| Database | Azure Table Storage | Data persistence |
| Hosting | Azure Static Web Apps + Functions | Cloud hosting |
| CI/CD | GitHub Actions | Automated deployment |

## Development Phases

### Phase 1: MVP - Core CRUD Operations
**Goal**: Replace basic Excel functionality

**User Stories**:
- INFRA-001 to INFRA-004, INFRA-006
- BACK-001 to BACK-005, BACK-010 to BACK-012
- FRONT-001 to FRONT-005, FRONT-011 to FRONT-013

**Deliverables**:
- List all candidates
- Add new candidate
- View candidate details
- Edit candidate information
- Delete candidate
- Basic validation and error handling

**Timeline**: Foundation for all future work

---

### Phase 2: Enhanced Features
**Goal**: Advanced search and workflow management

**User Stories**:
- BACK-007, BACK-008
- FRONT-006, FRONT-007, FRONT-009, FRONT-015, FRONT-016

**Deliverables**:
- Search and filter candidates
- Quick status updates
- Export to Excel
- Sortable columns
- Delete confirmations

---

### Phase 3: Analytics & Migration
**Goal**: Dashboard insights and data migration

**User Stories**:
- BACK-009
- FRONT-008, FRONT-010

**Deliverables**:
- Dashboard with metrics
- Import from Excel
- Data visualization

---

### Phase 4: Production Readiness
**Goal**: Production deployment

**User Stories**:
- INFRA-005, INFRA-007
- NFR-001, NFR-002, NFR-004

**Deliverables**:
- CI/CD pipeline
- Monitoring and logging
- Security implementation
- Comprehensive testing

---

## Architecture Principles

### SOLID Principles in Practice

#### 1. Single Responsibility Principle (SRP)
Each component/class does one thing:
```typescript
// Good - Single responsibility
class CandidateRepository {
  async findById(id: string): Promise<Candidate> { }
}

class CandidateValidator {
  validate(candidate: Candidate): ValidationResult { }
}

// Bad - Multiple responsibilities
class CandidateManager {
  async findById(id: string): Promise<Candidate> { }
  validate(candidate: Candidate): ValidationResult { }
  sendEmail(candidate: Candidate): void { }
}
```

#### 2. Open/Closed Principle (OCP)
Open for extension, closed for modification:
```typescript
// Good - Extend through interfaces
interface INotificationService {
  send(message: string): void;
}

class EmailNotification implements INotificationService {
  send(message: string): void { }
}

class SMSNotification implements INotificationService {
  send(message: string): void { }
}
```

#### 3. Liskov Substitution Principle (LSP)
Subtypes must be substitutable:
```typescript
// Good - Consistent behavior
interface Repository<T> {
  findById(id: string): Promise<T | null>;
}

class CandidateRepository implements Repository<Candidate> {
  async findById(id: string): Promise<Candidate | null> { }
}
```

#### 4. Interface Segregation Principle (ISP)
Many specific interfaces over one general:
```typescript
// Good - Specific interfaces
interface Readable<T> {
  findById(id: string): Promise<T>;
}

interface Writable<T> {
  create(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
}

// Use only what you need
class ReadOnlyService implements Readable<Candidate> { }
```

#### 5. Dependency Inversion Principle (DIP)
Depend on abstractions:
```typescript
// Good - Depend on interface
class CandidateService {
  constructor(private repository: ICandidateRepository) { }
}

// Bad - Depend on concrete class
class CandidateService {
  constructor(private repository: CandidateRepository) { }
}
```

---

## Clean Code Guidelines

### Naming Conventions

```typescript
// Components: PascalCase
const CandidateList: React.FC = () => { }

// Functions/variables: camelCase
const getCandidateById = (id: string) => { }
const candidateName = "John Doe";

// Constants: UPPER_SNAKE_CASE
const MAX_CANDIDATES_PER_PAGE = 20;
const API_BASE_URL = "https://api.example.com";

// Interfaces: PascalCase with 'I' prefix (optional)
interface ICandidateRepository { }
interface Candidate { }

// Types: PascalCase
type CandidateStatus = "new" | "interviewing" | "hired" | "rejected";
```

### Function Guidelines

```typescript
// Good - Small, focused, single purpose
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Good - Descriptive name, clear intent
function calculateDaysSinceApplication(applicationDate: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - applicationDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Bad - Too long, doing too much
function validateAndSaveCandidate(candidate: Candidate) {
  // 50 lines of code doing validation, transformation, and saving
}
```

### Error Handling

```typescript
// Good - Specific error types
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = "NotFoundError";
  }
}

// Good - Proper error handling
async function getCandidateById(id: string): Promise<Candidate> {
  try {
    const candidate = await repository.findById(id);
    if (!candidate) {
      throw new NotFoundError("Candidate", id);
    }
    return candidate;
  } catch (error) {
    logger.error("Failed to get candidate", { id, error });
    throw error;
  }
}
```

---

## Folder Structure Details

### Frontend Structure
```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── common/        # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   └── features/      # Feature-specific components
│   │       ├── CandidateCard.tsx
│   │       └── StatusBadge.tsx
│   ├── pages/             # Route pages
│   │   ├── CandidateListPage.tsx
│   │   ├── CandidateDetailPage.tsx
│   │   └── DashboardPage.tsx
│   ├── services/          # API integration
│   │   └── api/
│   │       ├── candidateApi.ts
│   │       └── httpClient.ts
│   ├── hooks/             # Custom hooks
│   │   ├── useCandidates.ts
│   │   └── useDebounce.ts
│   ├── context/           # React Context
│   │   └── AuthContext.tsx
│   ├── models/            # TypeScript interfaces
│   │   ├── Candidate.ts
│   │   └── ApiResponse.ts
│   ├── utils/             # Utility functions
│   │   ├── validation.ts
│   │   └── formatters.ts
│   ├── constants/         # Constants
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── tsconfig.json
```

### Backend Structure
```
backend/
├── src/
│   ├── functions/              # Azure Function handlers
│   │   ├── candidates/
│   │   │   ├── getCandidates.ts
│   │   │   ├── getCandidateById.ts
│   │   │   ├── createCandidate.ts
│   │   │   ├── updateCandidate.ts
│   │   │   └── deleteCandidate.ts
│   │   └── health/
│   │       └── healthCheck.ts
│   ├── domain/                 # Business logic
│   │   ├── entities/
│   │   │   └── Candidate.ts
│   │   ├── services/
│   │   │   ├── CandidateService.ts
│   │   │   └── ValidationService.ts
│   │   └── validators/
│   │       └── candidateSchema.ts
│   ├── infrastructure/         # External dependencies
│   │   ├── database/
│   │   │   ├── repositories/
│   │   │   │   ├── ICandidateRepository.ts
│   │   │   │   └── CandidateRepository.ts
│   │   │   └── mappers/
│   │   │       └── CandidateMapper.ts
│   │   └── config/
│   │       └── tableStorageConfig.ts
│   ├── shared/                 # Shared utilities
│   │   ├── errors/
│   │   │   └── CustomErrors.ts
│   │   └── utils/
│   │       └── logger.ts
│   └── tests/
├── host.json
├── package.json
└── tsconfig.json
```

---

## Next Steps for Developers

### 1. Set Up Local Environment
- [ ] Clone the repository
- [ ] Install Node.js 18+ LTS
- [ ] Install Azure Functions Core Tools
- [ ] Install Azurite for local storage emulation

### 2. Review Documentation
- [ ] Read `docs/excel-analysis.md` to understand requirements
- [ ] Review `docs/technical-architecture.md` for design decisions
- [ ] Study `docs/backlog.md` to see all user stories

### 3. Start with Phase 1 Stories
Focus on MVP stories to build the foundation:
1. **INFRA-002**: Set up frontend project
2. **INFRA-003**: Set up backend project
3. **BACK-001**: Create candidate entity and repository
4. **FRONT-011**: Create API service layer

### 4. Follow Development Workflow
1. Pick a story from the backlog
2. Create feature branch: `feature/STORY-ID-description`
3. Implement following SOLID principles
4. Write tests (min 80% coverage)
5. Submit PR for review
6. Merge after approval

---

## Testing Strategy

### Unit Tests
- Test business logic in isolation
- Mock external dependencies
- Fast execution
- High coverage (80%+)

### Integration Tests
- Test API endpoints end-to-end
- Use test database
- Verify request/response flow

### Component Tests
- Test React components
- Use React Testing Library
- Test user interactions

---

## Common Patterns

### Repository Pattern (Backend)
```typescript
// Interface
interface ICandidateRepository {
  findAll(): Promise<Candidate[]>;
  findById(id: string): Promise<Candidate | null>;
  create(candidate: Candidate): Promise<Candidate>;
  update(candidate: Candidate): Promise<Candidate>;
  delete(id: string): Promise<void>;
}

// Implementation
class CandidateRepository implements ICandidateRepository {
  constructor(private tableClient: TableClient) {}

  async findById(id: string): Promise<Candidate | null> {
    // Implementation using Azure Table Storage
  }
}
```

### Service Layer Pattern (Frontend)
```typescript
// API service
class CandidateApiService {
  private httpClient: AxiosInstance;

  async getCandidates(): Promise<Candidate[]> {
    const response = await this.httpClient.get('/candidates');
    return response.data;
  }
}

// Custom hook
function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      const data = await candidateApi.getCandidates();
      setCandidates(data);
      setLoading(false);
    };
    fetchCandidates();
  }, []);

  return { candidates, loading };
}
```

---

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Azure Functions Node.js Guide](https://docs.microsoft.com/azure/azure-functions/functions-reference-node)
- [Azure Table Storage SDK](https://docs.microsoft.com/azure/storage/tables/)
- [Clean Code Principles](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

## Questions?

For questions or clarifications:
1. Check the documentation in `/docs`
2. Review the backlog for detailed acceptance criteria
3. Open a GitHub issue
4. Reach out to the team

Happy coding!
