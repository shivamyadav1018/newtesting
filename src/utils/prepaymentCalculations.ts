import {calculateEMI, generateAmortizationSchedule} from './loanCalculations';

export interface PrepaymentResult {
  originalMonths: number;
  revisedMonths: number;
  monthsSaved: number;
  interestSaved: number;
}

export function calculatePrepaymentImpact(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  monthlyPrepayment: number,
): PrepaymentResult {
  const original = generateAmortizationSchedule(
    principal,
    annualRate,
    tenureMonths,
  );
  const monthlyRate = annualRate / 12 / 100;
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  let balance = principal;
  let revisedInterest = 0;
  let revisedMonths = 0;

  while (balance > 0.01 && revisedMonths < tenureMonths) {
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(balance, emi - interest + monthlyPrepayment);
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
    interestSaved: Math.max(0, originalInterest - revisedInterest),
  };
}

