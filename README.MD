# Trading Journal Application

A full-stack personal trading journal application for tracking Options and Mutual Fund trades with performance analytics and calculations.

## Project Overview

This application helps traders track their trading performance by recording trade details, calculating profits/losses, and visualizing performance metrics over time. It consists of a React frontend and a Quarkus-based backend service.

## Features

- **Trade Tracking**: Record entry/exit dates, trading amounts, profits, and other metrics for both Options and Mutual Fund trades
- **Performance Analytics**: Dashboard with key performance indicators (KPIs) like total P&L, win rate, profit factor
- **Performance Charts**: Visualize trading performance over time with Chart.js
- **Margin Calculator**: Calculate required margins and potential profits for trades
- **Dark Mode**: Built-in dark theme support
- **Mobile Responsive**: Works on all device sizes

## Project Structure

The application is organized as a full-stack project:

```
trading-journal/
├── backend/          # Quarkus Java backend
└── frontend/        # React frontend
```

## Frontend (React)

### Technologies Used

- React 19 with Create React App
- Tailwind CSS for styling
- shadcn/ui components with Radix primitives
- Chart.js for data visualization
- react-toastify for notifications
- react-router-dom for navigation

### Pages

1. **Journal** (`/`) - Add/edit trade form with sortable/filterable trade history table
2. **Dashboard** (`/dashboard`) - Key performance indicators and metrics
3. **Performance** (`/performance`) - Chart.js line chart comparing Options vs MF performance
4. **Margin Calculator** (`/margin-calculator`) - Standalone calculator for margin calculations
5. **Settings** (`/settings`) - Application settings

### Key Calculations

- **Required Profit**: Calculates minimum profit needed based on 16% annual return model
- **Annualized Percent**: Calculates annualized return percentage for trades
- **Complete Trades Filter**: Filters trades with all required fields filled

### Environment Setup

The application connects to the database via the backend. Configure the database connection in `backend/src/main/resources/application.properties`.


### Available Scripts

In the `frontend/` directory, you can run:

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Removes the single build dependency

### Testing

The project uses Jest + React Testing Library with mocks for:
- React Router
- Toast notifications
- UI components

Run tests with:
```bash
npm test
# or
npm test -- --watchAll=false --runInBand
```

## Backend (Quarkus)

### Technologies Used

- Quarkus - Supersonic Subatomic Java Framework
- Hibernate ORM with Panache
- PostgreSQL database
- REST API endpoints

### Running the Backend

In the `backend/` directory:

```bash
# Run in dev mode with live coding
./mvnw quarkus:dev

# Package the application
./mvnw package

# Run the packaged application
java -jar target/quarkus-app/quarkus-run.jar
```

### Creating a Native Executable

```bash
# Create native executable
./mvnw package -Dnative

# Run native executable
./target/backend-1.0.0-SNAPSHOT-runner
```

## Database

The application uses PostgreSQL with a single `trading` table containing fields for:
- Entry and exit dates
- Options trading amount
- Required profit
- Interest and actual profit
- Total profit
- Percent return
- Mutual Fund trading amount
- PnL and MF profit

## Development

### Prerequisites

- Node.js (v14 or later)
- Java JDK 11 or later
- PostgreSQL database

### Installation

1. Clone the repository
2. Set up the PostgreSQL database and run the schema in `database/database-schema.sql`
3. Configure database connection in `backend/src/main/resources/application.properties`
4. Install frontend dependencies: `npm install` in frontend directory
5. Install backend dependencies: `./mvnw` in backend directory

### Folder Structure

```
frontend/
├── public/          # Static assets
├── src/             # Source code
│   ├── components/     # React components
│   ├── lib/          # Utility functions
│   └── __mocks/     # Test mocks
└── package.json      # Dependencies and scripts

backend/
├── src/
│   └── main/
│       ├── java/     # Java source files
│       └── resources/ # Configuration files
├── pom.xml          # Maven configuration
└── README.md         # Backend documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.