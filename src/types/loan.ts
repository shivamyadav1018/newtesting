export type LoanType = 'home' | 'car' | 'personal' | 'education' | 'other';

export interface Loan {
  id: string;
  name: string;
  type: LoanType;
  principal: number;
  interestRate: number;
  tenureMonths: number;
  startDate: string;
  createdAt: string;
}

export type LoanInput = Omit<Loan, 'id' | 'createdAt'>;

export interface AmortizationEntry {
  month: number;
  emi: number;
  principalComponent: number;
  interestComponent: number;
  remainingBalance: number;
}

export interface YearlyAmortizationEntry {
  year: number;
  startingMonth: number;
  endingMonth: number;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  remainingBalance: number;
}

export interface LoanMetrics {
  emi: number;
  totalInterest: number;
  totalPayment: number;
}

export interface ComparisonOffer {
  id: string;
  name: string;
  principal: number;
  interestRate: number;
  tenureMonths: number;
  source: 'saved' | 'manual';
}

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  home: 'Home',
  car: 'Car',
  personal: 'Personal',
  education: 'Education',
  other: 'Custom',
};

