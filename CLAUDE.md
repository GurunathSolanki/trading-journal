# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (React)
```bash
npm start                 # Dev server on http://localhost:3000
npm test                  # Interactive watch mode (Jest + RTL)
npm test -- --watchAll=false --runInBand   # CI-friendly single run
npm test -- --coverage                    # Run with coverage report
npm test -- src/lib/tradingUtils.test.js  # Run a single test file
npm run build             # Production build to /build
```

### Backend (Quarkus)
```bash
./mvnw quarkus:dev         # Dev mode with live coding
./mvnw package             # Package application
java -jar target/quarkus-app/quarkus-run.jar  # Run packaged app
./mvnw package -Dnative    # Build native executable
./target/backend-*-runner  # Run native executable
```

## Architecture

### Full-Stack Structure
- **Frontend**: React 19 + Tailwind CSS + shadcn/ui components
  - Pages: Journal (trade tracking), Dashboard (KPIs), Performance (chart.js), Margin Calculator
  - State: App.js owns all trade state and API calls
  - Data flow: App.js → page components via props
- **Backend**: Quarkus REST API with Hibernate Panache ORM
  - Single trading table in PostgreSQL
  - API endpoints: `/api/trades` (CRUD operations)

### Key Components
- **App.js**: Main state container, fetches trades on mount
- **JournalPage**: Trade form + history table with Indian number formatting
- **DashboardPage**: KPIs (total P&L, win rate, profit factor)
- **PerformancePage**: Chart.js line chart comparing Options vs MF
- **MarginCalculatorPage**: Standalone margin calculations
- **tradingUtils.js**: Core calculation functions

### Data Flow
1. App.js fetches trades from `/api/trades` on mount
2. State passed down to page components
3. Form submissions trigger API calls (POST/PUT)
4. Backend persists to PostgreSQL

## Testing
- Run all tests: `npm test`
- Run specific test: `npm test -- src/lib/tradingUtils.test.js`
- Mocks: `src/__mocks__/react-router-dom.js`, inline jest.mock() calls

## Important Notes
- Environment variables: Configure database connection in `backend/src/main/resources/application.properties`
- Number formatting: Uses Indian numbering system (lakh/crore)
- Theme: Custom CSS variables in `src/index.css` (rust/burnt orange primary)
- Mobile: Inputs use `font-size: 16px` to prevent iOS zoom

## Development Workflow
1. Start frontend: `npm start` in `/frontend`
2. Start backend: `./mvnw quarkus:dev` in `/backend`
3. Database: Set up PostgreSQL and configure connection
4. Make changes → test → commit

## Deployment
1. Build frontend: `npm run build`
2. Package backend: `./mvnw package`
3. Deploy to Cloud Run (see `deploy-to-cloud-run.md`)

## Configuration
- Database connection: `backend/src/main/resources/application.properties`
- Frontend environment: `frontend/.env` (if needed)
- Theme colors: `src/index.css`