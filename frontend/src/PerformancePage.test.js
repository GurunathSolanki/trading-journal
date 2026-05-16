import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PerformancePage from './PerformancePage';

// Mock PerformanceChart
jest.mock('./PerformanceChart', () => {
  return function MockPerformanceChart({ trades }) {
    return <div data-testid="performance-chart" data-trades-count={trades.length}>Performance Chart</div>;
  };
});

// Mock UI components
jest.mock('./components/ui/card', () => ({
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }) => <div data-testid="card-title">{children}</div>
}));

describe('PerformancePage', () => {
  test('renders performance page with chart', () => {
    const mockTrades = [
      {
        id: 1,
        entry_date: '2024-01-01',
        exit_date: '2024-01-02',
        options_trading_amount: 10000,
        total_profit: 300,
        percent: '1095.00',
        pnl: 150,
        mf_profit: '11.00'
      }
    ];

    render(<PerformancePage trades={mockTrades} />);

    expect(screen.getByText('Performance Comparison')).toBeInTheDocument();
    expect(screen.getByTestId('performance-chart')).toBeInTheDocument();
    expect(screen.getByTestId('performance-chart')).toHaveAttribute('data-trades-count', '1');
  });

  test('renders with empty trades array', () => {
    render(<PerformancePage trades={[]} />);

    expect(screen.getByText('Performance Comparison')).toBeInTheDocument();
    expect(screen.getByTestId('performance-chart')).toHaveAttribute('data-trades-count', '0');
  });
});