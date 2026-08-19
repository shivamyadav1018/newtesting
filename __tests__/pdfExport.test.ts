jest.mock('react-native-share', () => ({
  __esModule: true,
  default: {open: jest.fn()},
}));

import {buildLoanSummaryPdf} from '../src/services/pdfExport';
import type {Loan} from '../src/types/loan';

const loan: Loan = {
  id: 'loan-1',
  name: 'Test Home Loan',
  type: 'home',
  principal: 2_500_000,
  interestRate: 8.5,
  tenureMonths: 240,
  startDate: '2026-01-01',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('PDF export', () => {
  it('creates a valid multipage PDF loan summary', async () => {
    const base64 = await buildLoanSummaryPdf(loan);

    expect(base64.startsWith('JVBER')).toBe(true);
    expect(base64.length).toBeGreaterThan(13_000);
  });
});
