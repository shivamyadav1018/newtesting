import type {
  AmortizationEntry,
  LoanMetrics,
  YearlyAmortizationEntry,
} from '../types/loan';

export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number,
): number {
  if (principal <= 0 || tenureMonths <= 0 || annualRate < 0) {
    return 0;
  }

  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) {
    return principal / tenureMonths;
  }

  const growth = Math.pow(1 + monthlyRate, tenureMonths);
  return (principal * monthlyRate * growth) / (growth - 1);
}

export function calculateTotalInterest(
  principal: number,
  emi: number,
  tenureMonths: number,
): number {
  return Math.max(0, emi * tenureMonths - principal);
}

export function calculateLoanMetrics(
  principal: number,
  annualRate: number,
  tenureMonths: number,
): LoanMetrics {
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  const totalInterest = calculateTotalInterest(principal, emi, tenureMonths);

  return {
    emi,
    totalInterest,
    totalPayment: principal + totalInterest,
  };
}

export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  tenureMonths: number,
): AmortizationEntry[] {
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  if (!emi) {
    return [];
  }

  const monthlyRate = annualRate / 12 / 100;
  let balance = principal;

  return Array.from({length: tenureMonths}, (_, index) => {
    const interestComponent = balance * monthlyRate;
    const isLastMonth = index === tenureMonths - 1;
    const principalComponent = isLastMonth
      ? balance
      : Math.min(emi - interestComponent, balance);
    balance = Math.max(0, balance - principalComponent);

    return {
      month: index + 1,
      emi: isLastMonth ? principalComponent + interestComponent : emi,
      principalComponent,
      interestComponent,
      remainingBalance: balance,
    };
  });
}

export function aggregateScheduleByYear(
  schedule: AmortizationEntry[],
): YearlyAmortizationEntry[] {
  const years: YearlyAmortizationEntry[] = [];

  for (let index = 0; index < schedule.length; index += 12) {
    const entries = schedule.slice(index, index + 12);
    const last = entries[entries.length - 1];
    const principalPaid = entries.reduce(
      (total, entry) => total + entry.principalComponent,
      0,
    );
    const interestPaid = entries.reduce(
      (total, entry) => total + entry.interestComponent,
      0,
    );

    years.push({
      year: Math.floor(index / 12) + 1,
      startingMonth: entries[0].month,
      endingMonth: last.month,
      principalPaid,
      interestPaid,
      totalPaid: principalPaid + interestPaid,
      remainingBalance: last.remainingBalance,
    });
  }

  return years;
}

export function calculateRemainingTenure(
  startDate: string,
  tenureMonths: number,
  now = new Date(),
): number {
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) {
    return tenureMonths;
  }

  const elapsedMonths = Math.max(
    0,
    (now.getFullYear() - start.getFullYear()) * 12 +
      now.getMonth() -
      start.getMonth(),
  );
  return Math.max(0, tenureMonths - elapsedMonths);
}

