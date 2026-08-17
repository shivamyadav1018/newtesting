import {
  formatCompactINR,
  formatCurrencyInput,
  parseCurrencyInput,
} from '../src/utils/currency';

describe('currency utilities', () => {
  it('formats input using Indian digit grouping', () => {
    expect(formatCurrencyInput('2500000')).toBe('25,00,000');
    expect(parseCurrencyInput('25,00,000')).toBe(2_500_000);
  });

  it('uses lakh and crore notation', () => {
    expect(formatCompactINR(750_000)).toBe('₹7.5 L');
    expect(formatCompactINR(25_000_000)).toBe('₹2.5 Cr');
  });
});
