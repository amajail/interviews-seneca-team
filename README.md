# Interviews Seneca Team

A modern web application for tracking interview candidates for IT projects, replacing manual Excel-based tracking with a robust, scalable solution.

## Overview

This application provides a comprehensive interview candidate tracking system built with:
- **Frontend**: React with TypeScript
- **Backend**: Node.js Azure Functions with TypeScript
- **Database**: Azure Table Storage
- **Architecture**: Clean Architecture following SOLID principles

## Project Goals

Replace the existing Excel-based candidate tracking system with a web application that provides:
- Multi-user concurrent access
- Real-time data updates
- Advanced search and filtering
- Audit trails
- Data export/import capabilities
- Responsive design for mobile and desktop

## Architecture

The application follows clean code principles and SOLID design patterns:

### Frontend (`/frontend`)
- React 18+ with TypeScript
- Component-based architecture
- Service layer for API integration
- Custom hooks for reusable logic
- Repository pattern for data access

### Backend (`/backend`)
- Azure Functions v4 with TypeScript
- Clean Architecture (Domain, Application, Infrastructure layers)
- Repository pattern for data access
- Dependency injection
- Comprehensive validation and error handling

### Infrastructure
- Azure Static Web Apps (Frontend hosting)
- Azure Functions (Backend API)
- Azure Table Storage (Database)
- Azure Application Insights (Monitoring)
- GitHub Actions (CI/CD)

## Documentation

Comprehensive documentation is available in the `/docs` folder:

- **[Excel Analysis](docs/excel-analysis.md)**: Analysis of the existing Excel system and requirements
- **[Technical Architecture](docs/technical-architecture.md)**: Detailed architecture, design patterns, and technical decisions
- **[Product Backlog](docs/backlog.md)**: Complete user stories organized by frontend, backend, and infrastructure

## Project Structure

```
interviews-seneca-team/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API integration
│   │   ├── hooks/        # Custom React hooks
│   │   └── models/       # TypeScript types
│   └── package.json
├── backend/              # Azure Functions
│   ├── src/
│   │   ├── functions/   # Function handlers
│   │   ├── domain/      # Business logic
│   │   ├── infrastructure/ # Data access
│   │   └── shared/      # Utilities
│   └── package.json
├── docs/                # Documentation
│   ├── excel-analysis.md
│   ├── technical-architecture.md
│   └── backlog.md
├── sample/              # Sample Excel file
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ LTS
- Azure Functions Core Tools
- Azure Storage Emulator (Azurite) for local development
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/[your-username]/interviews-seneca-team.git
cd interviews-seneca-team
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Set up environment variables (see `.env.example` files)

5. Start local development:

Frontend:
```bash
cd frontend
npm run dev
```

Backend:
```bash
cd backend
npm start
```

## Development Workflow

1. **Feature Branch**: Create feature branch from `main`
2. **Development**: Implement feature following SOLID principles
3. **Testing**: Write unit and integration tests (min 80% coverage)
4. **Code Review**: Submit PR for review
5. **CI/CD**: Automated tests and deployment

## Code Quality Standards

- **SOLID Principles**: All code must follow SOLID design principles
- **Clean Code**: Meaningful names, small functions, DRY principle
- **Testing**: Minimum 80% code coverage
- **Type Safety**: TypeScript strict mode enabled
- **Linting**: ESLint configured, all code must pass linting
- **Formatting**: Prettier configured for consistent formatting

## User Stories

The project backlog contains detailed user stories organized into:
- **Infrastructure Stories**: Project setup, CI/CD, deployment
- **Backend Stories**: API endpoints, business logic, data access
- **Frontend Stories**: UI components, pages, user interactions

See [docs/backlog.md](docs/backlog.md) for the complete backlog.

## Contributing

1. Follow the coding standards and SOLID principles
2. Write tests for all new code
3. Update documentation as needed
4. Submit PR with clear description
5. Ensure all CI checks pass

## License

[MIT License](LICENSE)

## Contact

For questions or issues, please open a GitHub issue.

---

**Status**: 🚧 Project Setup Phase

**Next Steps**:
1. Initialize frontend React project
2. Initialize backend Azure Functions project
3. Set up Azure resources
4. Implement MVP user stories
