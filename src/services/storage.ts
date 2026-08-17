import {createMMKV} from 'react-native-mmkv';
import type {Loan} from '../types/loan';

const storage = createMMKV({id: 'emi-planner-storage'});
const LOANS_KEY = 'loans.v1';
const THEME_KEY = 'theme-preference';
const ONBOARDING_KEY = 'onboarding-complete';

export type ThemePreference = 'system' | 'light' | 'dark';

export const loanRepository = {
  getAll(): Loan[] {
    const raw = storage.getString(LOANS_KEY);
    if (!raw) {
      return [];
    }
    try {
      const loans = JSON.parse(raw) as Loan[];
      return Array.isArray(loans) ? loans : [];
    } catch {
      return [];
    }
  },

  saveAll(loans: Loan[]): void {
    storage.set(LOANS_KEY, JSON.stringify(loans));
  },
};

export const preferenceRepository = {
  getTheme(): ThemePreference {
    return (storage.getString(THEME_KEY) as ThemePreference | undefined) ?? 'system';
  },

  setTheme(theme: ThemePreference): void {
    storage.set(THEME_KEY, theme);
  },

  hasCompletedOnboarding(): boolean {
    return storage.getBoolean(ONBOARDING_KEY) ?? false;
  },

  completeOnboarding(): void {
    storage.set(ONBOARDING_KEY, true);
  },
};

