# GEMINI.md

This file provides comprehensive project-specific guidance, architecture, and conventions for the Trading Journal application.

## Project Overview

The Trading Journal is a full-stack application designed to track Options and Mutual Fund trades, providing performance analytics, margin calculations, and visualization of trading history.

### Tech Stack
- **Frontend:** React 19 (Create React App), Tailwind CSS, shadcn/ui, Chart.js.
- **Backend:** Quarkus (Java 17), Hibernate ORM with Panache, PostgreSQL.
- **Data Persistence:** PostgreSQL.
- **Styling:** Custom Tailwind theme with dark mode support.

### Architecture

The project is structured as a monorepo with separate frontend and backend directories:

- `/frontend`: React SPA handling the UI and state management. It communicates with the Quarkus backend via REST APIs.
- `/backend`: Quarkus-based REST API that handles business logic and data persistence to PostgreSQL.
- `/database`: SQL schema definitions for the database.

### State Management
- `App.js` is the single source of truth.
- Trade state is fetched from the backend `/api/trades` endpoint.
- Field names use **camelCase** (e.g., `entryDate`, `optionsTradingAmount`) to align with Java conventions.


### Key Data Structure (`trading` table)
- `entry_date`, `exit_date`: Trade duration tracking.
- `options_trading_amount`, `mf_trading_amount`: Capital allocation.
- `total_profit`, `pnl`: Performance metrics.
- `percent`, `mf_profit`: Annualized ROI calculations.

## Building and Running

### Frontend (`/frontend`)
```bash
npm install               # Install dependencies
npm start                 # Run development server (http://localhost:3000)
npm test                  # Run Jest tests
npm run build             # Production build
```

### Backend (`/backend`)
```bash
./mvnw quarkus:dev        # Run in development mode with live coding
./mvnw package            # Package the application
./mvnw test               # Run backend tests
```

#### API Documentation & Testing
- **Swagger UI:** Available at `http://localhost:8080/q/swagger-ui/` when running in dev mode.
- **Base Path:** `http://localhost:8080/api`
- **Endpoints:**
    - `GET /trades`: Fetch all trades.
    - `POST /trades`: Add a new trade.
    - `PUT /trades/{id}`: Update an existing trade.


## Development Conventions

### Styling & UI
- **Tailwind CSS:** Use Tailwind for all styling.
- **Theme:** Primary color is rust/burnt orange (`hsl(15 100% 23%)`), accent is amber/gold (`hsl(45 93% 47%)`).
- **Mobile UX:** Ensure all inputs have `font-size: 16px` to prevent auto-zoom on iOS.

### Number Formatting
- **Indian Format:** Always use `formatIndianNumber()` from `src/lib/utils.js` for currency and numeric displays (e.g., 1,00,000).

### Key Calculations (`src/lib/tradingUtils.js`)
- **Required Profit:** Based on a 16% annual return model.
- **Annualized Percent:** Standard ROI calculation extrapolated to a 365-day year.
- **Consistency:** Real-time form calculations in `App.js` must align with `tradingUtils.js` logic.

## Environment Setup

The application connects to the PostgreSQL database via environment variables.

### Backend Setup
Create a `.env` file in the `backend/` directory (it is gitignored) and add the following:
```env
DB_URL=jdbc:postgresql://your-db-host:6543/postgres?prepareThreshold=0
DB_USERNAME=your-username
DB_PASSWORD=your-password
```
Quarkus will automatically load these variables in Dev Mode. For production, ensure these are set in your environment.


## Testing Strategy
- **Frontend:** Jest + React Testing Library. Mocks for Router and UI components are located in `src/__mocks__/` and `src/setupTests.js`.
- **Backend:** JUnit with REST-assured for API testing.
