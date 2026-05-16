// Mock all external dependencies at the top level
jest.mock('react-router-dom');

// Mock global fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
);

jest.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('./JournalPage', () => {
  return function MockJournalPage() {
    return <div data-testid="journal-page">Journal Page</div>;
  };
});

jest.mock('./DashboardPage', () => {
  return function MockDashboardPage() {
    return <div data-testid="dashboard-page">Dashboard Page</div>;
  };
});

jest.mock('./PerformancePage', () => {
  return function MockPerformancePage() {
    return <div data-testid="performance-page">Performance Page</div>;
  };
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders trading journal app', () => {
  render(<App />);

  expect(screen.getByText('Trading Journal')).toBeInTheDocument();
  expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
  expect(screen.getAllByText('Journal').length).toBeGreaterThanOrEqual(1);
  expect(screen.getAllByText('Performance').length).toBeGreaterThanOrEqual(1);
});
