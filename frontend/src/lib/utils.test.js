import { formatIndianNumber } from './utils';

describe('formatIndianNumber', () => {
  test('formats positive integers correctly', () => {
    expect(formatIndianNumber(1000)).toBe('1,000');
    expect(formatIndianNumber(100000)).toBe('1,00,000');
    expect(formatIndianNumber(10000000)).toBe('1,00,00,000');
  });

  test('formats negative integers correctly', () => {
    expect(formatIndianNumber(-1000)).toBe('-1,000');
    expect(formatIndianNumber(-500)).toBe('-500');
    expect(formatIndianNumber(-100000)).toBe('-1,00,000');
  });

  test('formats decimal numbers correctly', () => {
    expect(formatIndianNumber(1000.5)).toBe('1,000.5');
    expect(formatIndianNumber(-1000.75)).toBe('-1,000.75');
    expect(formatIndianNumber(0.5)).toBe('0.5');
    expect(formatIndianNumber(-0.5)).toBe('-0.5');
  });

  test('handles numeric strings', () => {
    expect(formatIndianNumber('1000')).toBe('1,000');
    expect(formatIndianNumber('-1000')).toBe('-1,000');
    expect(formatIndianNumber('-0')).toBe('-0');
  });

  test('handles edge cases', () => {
    expect(formatIndianNumber(0)).toBe('0');
    expect(formatIndianNumber('')).toBe('');
    expect(formatIndianNumber(null)).toBe(null);
    expect(formatIndianNumber(undefined)).toBe(undefined);
    expect(formatIndianNumber(NaN)).toBeNaN();
  });
});
