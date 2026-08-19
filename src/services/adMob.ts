import {Platform} from 'react-native';
import mobileAds, {AdEventType, InterstitialAd, TestIds} from 'react-native-google-mobile-ads';
import {productionAdMobInterstitialIds} from '../config';

type Interstitial = ReturnType<typeof InterstitialAd.createForAdRequest>;

let interstitial: Interstitial | null = null;
let isLoaded = false;
let initializationPromise: Promise<unknown> | null = null;
let unsubscribeListeners: Array<() => void> = [];

function getAdUnitId(): string | null {
  if (__DEV__) {
    return TestIds.INTERSTITIAL;
  }

  const productionId = Platform.select(productionAdMobInterstitialIds);
  return productionId?.startsWith('ca-app-pub-') ? productionId : null;
}

function clearInterstitial() {
  unsubscribeListeners.forEach(unsubscribe => unsubscribe());
  unsubscribeListeners = [];
  interstitial = null;
  isLoaded = false;
}

function createAndLoadInterstitial() {
  const adUnitId = getAdUnitId();
  clearInterstitial();

  // A release without a configured real ID remains functional and never
  // falls back to a test ad or accidentally requests a live ad with test data.
  if (!adUnitId) {
    return;
  }

  const nextInterstitial = InterstitialAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });
  interstitial = nextInterstitial;
  unsubscribeListeners = [
    nextInterstitial.addAdEventListener(AdEventType.LOADED, () => {
      isLoaded = true;
    }),
    nextInterstitial.addAdEventListener(AdEventType.CLOSED, createAndLoadInterstitial),
    nextInterstitial.addAdEventListener(AdEventType.ERROR, createAndLoadInterstitial),
  ];
  nextInterstitial.load();
}

export function initializeAdMob(): Promise<unknown> {
  if (!getAdUnitId()) {
    return Promise.resolve();
  }

  if (!initializationPromise) {
    initializationPromise = mobileAds()
      .initialize()
      .then(statuses => {
        createAndLoadInterstitial();
        return statuses;
      })
      .catch(error => {
        initializationPromise = null;
        if (__DEV__) {
          console.warn('AdMob initialization failed', error);
        }
      });
  }

  return initializationPromise;
}

export function showInterstitialAd(): void {
  if (!interstitial || !isLoaded) {
    initializeAdMob();
    return;
  }

  isLoaded = false;
  interstitial.show().catch(error => {
    if (__DEV__) {
      console.warn('Interstitial ad could not be shown', error);
    }
    createAndLoadInterstitial();
  });
}
