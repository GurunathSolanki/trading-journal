import {
  calculateRequiredProfit,
  calculateAnnualizedPercent,
  getCompleteTrades,
  calculateVolatility,
  calculateSharpeRatio
} from './tradingUtils';

describe('Trading Utilities', () => {
  describe('calculateRequiredProfit', () => {
    test('calculates required profit correctly for 1 day', () => {
      const result = calculateRequiredProfit('2024-01-01', '2024-01-02', 10000);
      // (10000 * 16 * 2) / (100 * 365) = 320000 / 36500 ≈ 8.767 → 9
      expect(result).toBe(9);
    });

    test('calculates required profit correctly for multiple days', () => {
      const result = calculateRequiredProfit('2024-01-01', '2024-01-08', 10000);
      // (10000 * 16 * 8) / (100 * 365) = 1280000 / 36500 ≈ 35.07 → 35
      expect(result).toBe(35);
    });

    test('returns empty string for missing dates', () => {
      expect(calculateRequiredProfit('', '2024-01-02', 10000)).toBe('');
      expect(calculateRequiredProfit('2024-01-01', '', 10000)).toBe('');
      expect(calculateRequiredProfit('2024-01-01', '2024-01-02', '')).toBe('');
    });

    test('handles same day trades', () => {
      const result = calculateRequiredProfit('2024-01-01', '2024-01-01', 10000);
      expect(result).toBe(4);
    });
  });

  describe('calculateAnnualizedPercent', () => {
    test('calculates annualized percentage correctly', () => {
      const result = calculateAnnualizedPercent(300, '2024-01-01', '2024-01-02', 10000);
      // (300 * 365 * 100) / (2 * 10000) = 10950000 / 20000 = 547.50
      expect(result).toBe('547.50');
    });

    test('calculates for multiple days', () => {
      const result = calculateAnnualizedPercent(300, '2024-01-01', '2024-01-08', 10000);
      // (300 * 365 * 100) / (8 * 10000) = 10950000 / 80000 = 136.875 → 136.88
      expect(result).toBe('136.88');
    });

    test('returns 0.00 for invalid inputs', () => {
      expect(calculateAnnualizedPercent(300, '', '2024-01-02', 10000)).toBe('0.00');
      expect(calculateAnnualizedPercent(300, '2024-01-01', '', 10000)).toBe('0.00');
      expect(calculateAnnualizedPercent(300, '2024-01-01', '2024-01-02', 0)).toBe('0.00');
    });

    test('handles negative profit', () => {
      const result = calculateAnnualizedPercent(-100, '2024-01-01', '2024-01-02', 10000);
      expect(result).toBe('-182.50');
    });
  });

  describe('getCompleteTrades', () => {
    test('filters out incomplete trades', () => {
      const trades = [
        {
          id: 1,
          entry_date: '2024-01-01',
          exit_date: '2024-01-02',
          options_trading_amount: 10000,
          required_profit: 9,
          interest: 100,
          actual_profit: 200,
          total_profit: 300,
          percent: '547.50',
          mf_trading_amount: 5000,
          pnl: 150,
          mf_profit: '1095.00'
        },
        {
          id: 2,
          entry_date: '2024-01-01',
          exit_date: '2024-01-02',
          options_trading_amount: null, // incomplete
          required_profit: null,
          interest: 100,
          actual_profit: 200,
          total_profit: 300,
          percent: '547.50',
          mf_trading_amount: 5000,
          pnl: 150,
          mf_profit: '1095.00'
        },
        {
          id: 3,
          entry_date: '2024-01-01',
          exit_date: '2024-01-02',
          options_trading_amount: 10000,
          required_profit: 9,
          interest: 100,
          actual_profit: 200,
          total_profit: 300,
          percent: '547.50',
          mf_trading_amount: '', // incomplete
          pnl: 150,
          mf_profit: '1095.00'
        }
      ];

      const completeTrades = getCompleteTrades(trades);
      expect(completeTrades).toHaveLength(1);
      expect(completeTrades[0].id).toBe(1);
    });

    test('returns empty array for no trades', () => {
      expect(getCompleteTrades([])).toEqual([]);
    });

    test('returns empty array when no trades are complete', () => {
      const trades = [
        { entry_date: null },
        { exit_date: null },
        { options_trading_amount: null }
      ];
      expect(getCompleteTrades(trades)).toEqual([]);
      });
      });

      describe('calculateVolatility', () => {
      test('calculates standard deviation correctly', () => {
      const returns = [10, 20, 30]; // mean = 20
      // variance = ((10-20)^2 + (20-20)^2 + (30-20)^2) / (3-1)
      // variance = (100 + 0 + 100) / 2 = 100
      // stdDev = sqrt(100) = 10
      expect(calculateVolatility(returns)).toBe(10);
      });

      test('returns 0 for single value or empty array', () => {
      expect(calculateVolatility([10])).toBe(0);
      expect(calculateVolatility([])).toBe(0);
      });
      });

      describe('calculateSharpeRatio', () => {
      test('calculates sharpe ratio correctly', () => {
      // (15 - 7) / 4 = 8 / 4 = 2.00
      expect(calculateSharpeRatio(15, 4, 7)).toBe('2.00');
      });

      test('handles zero standard deviation', () => {
      expect(calculateSharpeRatio(15, 0, 7)).toBe('0.00');
      });

      test('uses default risk free rate of 7%', () => {
      // (17 - 7) / 5 = 10 / 5 = 2.00
      expect(calculateSharpeRatio(17, 5)).toBe('2.00');
      });
      });
      });