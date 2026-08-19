import { calculateEMI, generateAmortizationSchedule } from './loanCalculations';

export interface PrepaymentResult {
  originalMonths: number;
  revisedMonths: number;
  monthsSaved: number;
  originalInterest: number;
  revisedInterest: number;
  interestSaved: number;
}

export interface PrepaymentOptions {
  monthlyPrepayment?: number;
  oneTimePrepayment?: number;
  oneTimePrepaymentMonth?: number;
}

export function calculatePrepaymentImpact(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  prepayment: number | PrepaymentOptions,
): PrepaymentResult {
  const original = generateAmortizationSchedule(
    principal,
    annualRate,
    tenureMonths,
  );
  const options =
    typeof prepayment === 'number'
      ? { monthlyPrepayment: prepayment }
      : prepayment;
  const monthlyPrepayment = Math.max(0, options.monthlyPrepayment ?? 0);
  const oneTimePrepayment = Math.max(0, options.oneTimePrepayment ?? 0);
  const oneTimePrepaymentMonth = Math.min(
    tenureMonths,
    Math.max(1, Math.round(options.oneTimePrepaymentMonth ?? 1)),
  );
  const monthlyRate = annualRate / 12 / 100;
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  let balance = principal;
  let revisedInterest = 0;
  let revisedMonths = 0;

  while (balance > 0.01 && revisedMonths < tenureMonths && emi > 0) {
    const interest = balance * monthlyRate;
    const month = revisedMonths + 1;
    const lumpSum = month === oneTimePrepaymentMonth ? oneTimePrepayment : 0;
    const principalPaid = Math.min(
      balance,
      Math.max(0, emi - interest) + monthlyPrepayment + lumpSum,
    );
    balance -= principalPaid;
    revisedInterest += interest;
    revisedMonths += 1;
  }

  const originalInterest = original.reduce(
    (sum, entry) => sum + entry.interestComponent,
    0,
  );
  return {
    originalMonths: tenureMonths,
    revisedMonths,
    monthsSaved: tenureMonths - revisedMonths,
    originalInterest,
    revisedInterest,
    interestSaved: Math.max(0, originalInterest - revisedInterest),
  };
}
