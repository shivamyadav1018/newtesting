export const appConfig = {
  isPro: true,
  loanLimit: null as number | null,
  features: {
    pdfExport: true,
    prepayment: true,
  },
} as const;

/**
 * Replace these with the interstitial ad-unit IDs from your AdMob account
 * before creating a release build. Debug builds never use these values.
 */
export const productionAdMobInterstitialIds = {
  android: '',
  ios: '',
} as const;

export function canCreateLoan(currentLoanCount: number): boolean {
  return appConfig.loanLimit === null || currentLoanCount < appConfig.loanLimit;
}
