# Frontend - Interview Tracker

React-based frontend application for the Interview Tracking System.

## Tech Stack

- **React 18+** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **Axios** for HTTP requests
- **React Hook Form** + **Zod** for form validation
- **ESLint** + **Prettier** for code quality

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── common/      # Shared components (Button, Input, etc.)
│   └── features/    # Feature-specific components
├── pages/           # Page components (route views)
├── services/        # API integration layer
│   └── api/        # API client and endpoints
├── hooks/           # Custom React hooks
├── context/         # React Context providers
├── models/          # TypeScript interfaces/types
├── utils/           # Utility functions
└── constants/       # Application constants
```

## Getting Started

### Prerequisites

- Node.js 18+ LTS
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

## Architecture Patterns

### Clean Architecture

The application follows clean architecture principles:

- **Components**: Presentational layer
- **Pages**: Route-level containers
- **Services**: API integration and external services
- **Hooks**: Reusable stateful logic
- **Models**: Type definitions and interfaces
- **Utils**: Pure utility functions

### SOLID Principles

- **Single Responsibility**: Each component/module has one purpose
- **Open/Closed**: Extension through composition and hooks
- **Liskov Substitution**: Consistent interfaces
- **Interface Segregation**: Specific prop interfaces
- **Dependency Inversion**: Depend on abstractions (hooks, services)

## Code Style

### TypeScript

- Strict mode enabled
- No implicit any
- Explicit return types for exported functions
- Path aliases configured (`@/components`, `@/services`, etc.)

### ESLint Rules

- Prettier integration
- React hooks rules enforced
- No unused variables
- Console warnings (allow warn/error)

### Naming Conventions

- Components: PascalCase (`CandidateList.tsx`)
- Hooks: camelCase with 'use' prefix (`useCandidates.ts`)
- Utilities: camelCase (`formatDate`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Types/Interfaces: PascalCase (`Candidate`, `ApiResponse`)

## Path Aliases

Import using path aliases for cleaner code:

```typescript
// Instead of: import { Candidate } from '../../../models/Candidate'
import { Candidate } from '@/models/Candidate'

// Available aliases:
import Something from '@/components/...'
import Something from '@/pages/...'
import Something from '@/services/...'
import Something from '@/hooks/...'
import Something from '@/models/...'
import Something from '@/utils/...'
import Something from '@/constants/...'
```

## Environment Variables

All environment variables must be prefixed with `VITE_` to be exposed to the app.

See `.env.example` for available variables.

## API Integration

### HTTP Client

Centralized Axios instance with:
- Base URL configuration
- Request/response interceptors
- Error handling
- Authentication token injection

### API Services

Services follow the repository pattern:

```typescript
import { candidateApi } from '@/services/api'

// Get all candidates
const candidates = await candidateApi.getCandidates()

// Get candidate by ID
const candidate = await candidateApi.getCandidateById(id)

// Create candidate
const newCandidate = await candidateApi.createCandidate(data)
```

### Custom Hooks

Data fetching with custom hooks:

```typescript
import { useCandidates } from '@/hooks'

function CandidateList() {
  const { candidates, loading, error, refetch } = useCandidates()

  if (loading) return <LoadingSpinner />
  if (error) return <Error message={error} />

  return <div>{/* Render candidates */}</div>
}
```

## Best Practices

1. **Component Size**: Keep components under 300 lines
2. **Hook Extraction**: Extract complex logic to custom hooks
3. **Type Safety**: No `any` types, use proper interfaces
4. **Error Handling**: Always handle errors and loading states
5. **Accessibility**: Use semantic HTML and ARIA labels
6. **Performance**: Use React.memo() for expensive components
7. **Testing**: Write tests for business logic and user flows

## Contributing

1. Create feature branch from `main`
2. Follow coding standards and SOLID principles
3. Write tests for new features
4. Run linting and formatting before commit
5. Submit PR with clear description

## Related Documentation

- [Project README](../README.md)
- [Technical Architecture](../docs/technical-architecture.md)
- [Product Backlog](../docs/backlog.md)
- [Getting Started Guide](../docs/getting-started.md)
