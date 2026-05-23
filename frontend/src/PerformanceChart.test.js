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
  Legend: jest.fn(),
  Filler: jest.fn(),
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
      entryDate: '2024-01-01',
      exitDate: '2024-01-02',
      optionsTradingAmount: 10000,
      totalProfit: 300,
      percent: '12.00',
      mfTradingAmount: 2000,
      pnl: 150,
      mfProfit: '8.00',
    },
    {
      id: 2,
      entryDate: '2024-01-03',
      exitDate: '2024-01-04',
      optionsTradingAmount: 10000,
      totalProfit: 200,
      percent: '10.00',
      mfTradingAmount: 2000,
      pnl: 100,
      mfProfit: '6.00',
    },
  ];

  test('renders performance chart with summary cards', () => {
    render(<PerformanceChart trades={mockTrades} />);

    expect(screen.getByText('Avg Options Annualized')).toBeInTheDocument();
    expect(screen.getByText('Avg MF Annualized')).toBeInTheDocument();
    expect(screen.getByText('Leader')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  test('displays correct average annualized returns', () => {
    render(<PerformanceChart trades={mockTrades} />);

    // Avg options annualized: (12 + 10) / 2 = 11.00%
    const optionsCard = screen.getByText('Avg Options Annualized').closest('[data-testid="card"]');
    expect(optionsCard.textContent).toContain('11.00%');

    // Avg MF annualized: (8 + 6) / 2 = 7.00%
    const mfCard = screen.getByText('Avg MF Annualized').closest('[data-testid="card"]');
    expect(mfCard.textContent).toContain('7.00%');
  });

  test('renders chart with 2 datasets (options + MF, no combined)', () => {
    render(<PerformanceChart trades={mockTrades} />);

    const chart = screen.getByTestId('line-chart');
    expect(chart).toHaveAttribute('data-dataset-count', '2');
  });

  test('renders toggle button', () => {
    render(<PerformanceChart trades={mockTrades} />);

    expect(screen.getByText('Absolute P&L')).toBeInTheDocument();
  });

  test('handles empty trades array', () => {
    render(<PerformanceChart trades={[]} />);

    expect(screen.getByText('Add trades to see your performance chart')).toBeInTheDocument();
  });

  test('displays correct icons for positive/negative values', () => {
    const mixedTrades = [
      {
        id: 1,
        entryDate: '2024-01-01',
        exitDate: '2024-01-02',
        optionsTradingAmount: 10000,
        totalProfit: 300,
        percent: '12.00',
        mfTradingAmount: 2000,
        pnl: -50,
        mfProfit: '-3.65',
      }
    ];

    render(<PerformanceChart trades={mixedTrades} />);

    expect(screen.getAllByTestId('arrow-up-icon').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('arrow-down-icon')).toBeInTheDocument();
  });

  test('renders chart with trades data', () => {
    render(<PerformanceChart trades={mockTrades} />);

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});
