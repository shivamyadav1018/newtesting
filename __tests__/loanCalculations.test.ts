import {
  aggregateScheduleByYear,
  calculateEMI,
  calculateTotalInterest,
  generateAmortizationSchedule,
} from '../src/utils/loanCalculations';

describe('loan calculations', () => {
  it('calculates EMI using the reducing balance formula', () => {
    expect(calculateEMI(2_500_000, 8.5, 240)).toBeCloseTo(21_695.58, 1);
  });

  it('handles a zero-interest loan', () => {
    expect(calculateEMI(120_000, 0, 12)).toBe(10_000);
    expect(calculateTotalInterest(120_000, 10_000, 12)).toBe(0);
  });

  it('generates a complete schedule that pays off the balance', () => {
    const schedule = generateAmortizationSchedule(500_000, 9, 60);

    expect(schedule).toHaveLength(60);
    expect(schedule[0].interestComponent).toBeCloseTo(3_750, 2);
    expect(schedule[59].remainingBalance).toBe(0);
    expect(schedule.reduce((sum, row) => sum + row.principalComponent, 0)).toBeCloseTo(500_000, 2);
  });

  it('aggregates partial final years correctly', () => {
    const schedule = generateAmortizationSchedule(300_000, 7.5, 30);
    const years = aggregateScheduleByYear(schedule);

    expect(years).toHaveLength(3);
    expect(years[2].startingMonth).toBe(25);
    expect(years[2].endingMonth).toBe(30);
    expect(years[2].remainingBalance).toBe(0);
  });
});

