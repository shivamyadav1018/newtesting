export const appConfig = {
  isPro: true,
  loanLimit: null as number | null,
  features: {
    pdfExport: true,
    prepayment: true,
  },
} as const;

export function canCreateLoan(currentLoanCount: number): boolean {
  return appConfig.loanLimit === null || currentLoanCount < appConfig.loanLimit;
}

