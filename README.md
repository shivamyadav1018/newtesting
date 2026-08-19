# EMI Planner

A local-first React Native CLI app for calculating, tracking, and comparing loans. Financial data is stored only on the device with MMKV.

## Run locally

Install JavaScript and iOS dependencies:

```sh
npm install
cd ios && bundle exec pod install && cd ..
```

Start Metro, then launch a native target from another terminal:

```sh
npm start
npm run android
# or
npm run ios
```

## Quality checks

```sh
npm run typecheck
npm run lint
npm test
```

## Structure

- `src/components`: reusable form, card, table, and summary UI
- `src/screens`: onboarding and each navigation destination
- `src/navigation`: bottom tabs and Home stack
- `src/context`: loans and persisted theme state
- `src/services`: MMKV repository and isolated future export service
- `src/utils`: pure loan, prepayment, and currency calculations
- `src/config.ts`: central Pro state, feature flags, and optional loan-limit policy

`appConfig.loanLimit` is `null`, so saved loans are currently unbounded. Set a number later to enforce a cap through the existing repository-facing policy without changing the screens.

## AdMob configuration

Development builds automatically use Google's test interstitial ID. Before a release:

1. Replace the Android and iOS demo **app IDs** in `app.json` with the app IDs from your AdMob account.
2. Set the Android and iOS production interstitial **ad-unit IDs** in `productionAdMobInterstitialIds` in `src/config.ts`.
3. Reinstall iOS pods and rebuild the native app.

If a production ad-unit ID is missing, release builds skip the ad and keep every calculation/save action working. Interstitials are requested after successful calculate, save-loan, and add-comparison submissions.
