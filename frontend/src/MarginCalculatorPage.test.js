import { calculateMarginResults, LOT_SIZE, ORDER_SIZE } from './MarginCalculatorPage';

describe('MarginCalculatorPage', () => {
  describe('calculateMarginResults', () => {
    test('returns null when marginForOneOrder is missing', () => {
      expect(calculateMarginResults(null, 1000000, 10)).toBeNull();
      expect(calculateMarginResults('', 1000000, 10)).toBeNull();
    });

    test('returns null when totalMarginAvailable is missing', () => {
      expect(calculateMarginResults(3500000, null, 10)).toBeNull();
      expect(calculateMarginResults(3500000, '', 10)).toBeNull();
    });

    test('returns null when totalPoints is missing', () => {
      expect(calculateMarginResults(3500000, 1000000, null)).toBeNull();
      expect(calculateMarginResults(3500000, 1000000, '')).toBeNull();
    });

    test('calculates correctly with user example values', () => {
      // Margin for One Order = 35,46,700
      // Total Margin Available = 1,23,44,000
      // Total Points = 10.8
      // Formula: |1755 / 3546700 * 12344000| / 65 = 93.97 → rounds to 94
      const result = calculateMarginResults(3546700, 12344000, 10.8);
      
      expect(result.totalLots).toBe(94);
      expect(result.fullOrders).toBe(3);
      expect(result.remainingLots).toBe(13);
      expect(result.remainingQty).toBe(845);
      // 94 lots * 65 * 10.8 = 65988
      expect(result.totalProfit).toBe('65988.00');
    });

    test('distributes lots into full orders correctly', () => {
      // rawLots = |1755 / 1755000 * 10000000| / 65 = 10000 / 65 = 153.85 → rounds to 154
      const result = calculateMarginResults(1755000, 10000000, 1);
      
      expect(result.totalLots).toBe(154);
      expect(result.fullOrders).toBe(5);
      expect(result.remainingLots).toBe(19);
    });

    test('calculates total profit correctly', () => {
      // rawLots = 1755/1755000 * 1755000 / 65 = 27 → rounds to 27
      const result = calculateMarginResults(1755000, 1755000, 5);
      
      // 27 lots * 65 * 5 = 8775
      expect(result.totalProfit).toBe('8775.00');
    });

    test('handles decimal points', () => {
      // 94 lots * 65 * 0.5 = 3055
      const result = calculateMarginResults(3546700, 12344000, 0.5);
      
      expect(result.totalProfit).toBe('3055.00');
    });

    test('handles large numbers', () => {
      const result = calculateMarginResults(1000000, 10000000, 100);
      
      // rawLots = 1755/1000000 * 10000000 / 65 = 270 → rounds to 270
      // 270 lots * 65 * 100 = 1,755,000
      expect(result.totalLots).toBe(270);
      expect(result.fullOrders).toBe(10);
      expect(result.totalProfit).toBe('1755000.00');
    });

    test('handles zero values', () => {
      expect(calculateMarginResults(0, 1000000, 10)).toBeNull();
      expect(calculateMarginResults(1000000, 0, 10)).toBeNull();
      expect(calculateMarginResults(1000000, 1000000, 0)).toBeNull();
    });
  });

  describe('Constants', () => {
    test('LOT_SIZE is 65', () => {
      expect(LOT_SIZE).toBe(65);
    });

    test('ORDER_SIZE is 1755', () => {
      expect(ORDER_SIZE).toBe(1755);
    });

    test('lots per order is 27', () => {
      expect(ORDER_SIZE / LOT_SIZE).toBe(27);
    });
  });
});