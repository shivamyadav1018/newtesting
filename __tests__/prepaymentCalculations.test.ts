import { calculatePrepaymentImpact } from '../src/utils/prepaymentCalculations';

describe('prepayment calculations', () => {
  it('reduces tenure and interest with a recurring monthly prepayment', () => {
    const result = calculatePrepaymentImpact(2_500_000, 8.5, 240, {
      monthlyPrepayment: 5_000,
    });

    expect(result.revisedMonths).toBeLessThan(result.originalMonths);
    expect(result.monthsSaved).toBeGreaterThan(0);
    expect(result.interestSaved).toBeGreaterThan(0);
    expect(result.revisedInterest).toBeCloseTo(
      result.originalInterest - result.interestSaved,
      2,
    );
  });

  it('supports one-time prepayments in a selected month', () => {
    const early = calculatePrepaymentImpact(1_000_000, 9, 120, {
      oneTimePrepayment: 100_000,
      oneTimePrepaymentMonth: 12,
    });
    const late = calculatePrepaymentImpact(1_000_000, 9, 120, {
      oneTimePrepayment: 100_000,
      oneTimePrepaymentMonth: 60,
    });

    expect(early.monthsSaved).toBeGreaterThan(0);
    expect(early.interestSaved).toBeGreaterThan(late.interestSaved);
  });

  it('leaves the original plan unchanged when no prepayment is supplied', () => {
    const result = calculatePrepaymentImpact(500_000, 7.5, 60, 0);

    expect(result.revisedMonths).toBe(60);
    expect(result.monthsSaved).toBe(0);
    expect(result.interestSaved).toBeCloseTo(0, 2);
  });
});
