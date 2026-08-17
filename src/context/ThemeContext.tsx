import React, {createContext, useContext, useMemo, useState} from 'react';
import {useColorScheme} from 'react-native';
import {preferenceRepository, type ThemePreference} from '../services/storage';
import {darkColors, lightColors, type AppColors} from '../theme';

interface ThemeContextValue {
  colors: AppColors;
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({children}: React.PropsWithChildren) {
  const systemTheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    preferenceRepository.getTheme(),
  );
  const isDark = preference === 'system' ? systemTheme === 'dark' : preference === 'dark';

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: isDark ? darkColors : lightColors,
      isDark,
      preference,
      setPreference: next => {
        preferenceRepository.setTheme(next);
        setPreferenceState(next);
      },
    }),
    [isDark, preference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used inside ThemeProvider');
  }
  return context;
}

