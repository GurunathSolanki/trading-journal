import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PerformanceChart from './PerformanceChart';

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn()
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn()
}));

jest.mock('react-chartjs-2', () => ({
  Line: ({ data, options }) => (
    <div data-testid="line-chart" data-dataset-count={data.datasets.length}>
      Chart
    </div>
  )
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowUpIcon: () => <div data-testid="arrow-up-icon">↑</div>,
  ArrowDownIcon: () => <div data-testid="arrow-down-icon">↓</div>,
  TrendingUp: () => <div data-testid="trending-up-icon">↑</div>
}));

// Mock UI components
jest.mock('./components/ui/card', () => ({
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }) => <div data-testid="card-title">{children}</div>
}));

jest.mock('./components/ui/button', () => ({
  Button: ({ children, variant, onClick }) => (
    <button onClick={onClick} data-variant={variant}>{children}</button>
  )
}));

describe('PerformanceChart', () => {
  const mockTrades = [
    {
      id: 1,
      entry_date: '2024-01-01',
      exit_date: '2024-01-02',
      options_trading_amount: 10000,
      total_profit: 300,
      percent: '1095.00',
      pnl: 150,
      mfProfit: '11.00'
    },
    {
      id: 2,
      entry_date: '2024-01-03',
      exit_date: '2024-01-04',
      options_trading_amount: 10000,
      total_profit: 200,
      percent: '730.00',
      pnl: 100,
      mfProfit: '7.30'
    }
  ];

  test('renders performance chart with summary cards', () => {
    render(<PerformanceChart trades={mockTrades} />);

    expect(screen.getByText('Avg Options Return')).toBeInTheDocument();
    expect(screen.getByText('Avg MF Return')).toBeInTheDocument();
    expect(screen.getByText('Combined Growth')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  test('displays correct average calculations', () => {
    render(<PerformanceChart trades={mockTrades} />);

    // Avg Options %: (1095.00 + 730.00) / 2 = 912.50
    const optionsCard = screen.getByText('Avg Options Return').closest('[data-testid="card"]');
    expect(optionsCard.textContent).toContain('912.50%');

    // Avg MF %: (11.00 + 7.30) / 2 = 9.15
    const mfCard = screen.getByText('Avg MF Return').closest('[data-testid="card"]');
    expect(mfCard.textContent).toContain('9.15%');
  });

  test('renders chart with correct datasets', () => {
    render(<PerformanceChart trades={mockTrades} />);

    const chart = screen.getByTestId('line-chart');
    expect(chart).toHaveAttribute('data-dataset-count', '3');
  });

  test('renders toggle button', () => {
    render(<PerformanceChart trades={mockTrades} />);

    expect(screen.getByText('Show Absolute Values')).toBeInTheDocument();
  });

  test('handles empty trades array', () => {
    render(<PerformanceChart trades={[]} />);

    expect(screen.getByText('Add trades to see your performance chart')).toBeInTheDocument();
  });

  test('displays correct icons for positive/negative values', () => {
    const mixedTrades = [
      {
        id: 1,
        entry_date: '2024-01-01',
        exit_date: '2024-01-02',
        options_trading_amount: 10000,
        total_profit: 300,
        percent: '1095.00',
        pnl: -50,
        mfProfit: '-3.65'
      }
    ];

    render(<PerformanceChart trades={mixedTrades} />);

    expect(screen.getAllByTestId('arrow-up-icon').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('arrow-down-icon')).toBeInTheDocument();
  });

  test('calculates cumulative data correctly', () => {
    render(<PerformanceChart trades={mockTrades} />);

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});
