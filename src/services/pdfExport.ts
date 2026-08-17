import type {Loan} from '../types/loan';

export async function exportLoanSummary(_loan: Loan): Promise<void> {
  throw new Error('PDF export is not included in the MVP build.');
}

