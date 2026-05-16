# Trading Journal Frontend

This is the React frontend for the Trading Journal application.

## Available Scripts

In the project directory, you can run:

### `npm start`
Runs the app in the development mode at [http://localhost:3000](http://localhost:3000).

### `npm test`
Launches the test runner.

### `npm run build`
Builds the app for production to the `build` folder.

## Architecture

The frontend communicates with a Quarkus backend API (defaulting to `http://localhost:8080/api`).

## Testing

This project uses Jest + React Testing Library.

- `src/__mocks__/react-router-dom.js` - Mocks routing components.
- `src/__mocks__/react-toastify.js` - Stubs toast notifications.

### Run tests
- `npm test`
- `npm test -- --watchAll=false --runInBand` (CI-friendly)

### How to extend coverage
1. Add a new `*.test.js` file.
2. For API-dependent components, mock the global `fetch` API.
