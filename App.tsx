import React, {useState} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {LoanProvider} from './src/context/LoanContext';
import {ThemeProvider, useAppTheme} from './src/context/ThemeContext';
import {AppNavigator} from './src/navigation/AppNavigator';
import {OnboardingScreen} from './src/screens/OnboardingScreen';
import {preferenceRepository} from './src/services/storage';

function AppContent() {
  const {isDark} = useAppTheme();
  const [launchState, setLaunchState] = useState(() => {
    const onboardingComplete = preferenceRepository.hasCompletedOnboarding();
    return {
      onboardingComplete,
      initialTab: onboardingComplete ? ('Home' as const) : ('Calculator' as const),
    };
  });

  const completeOnboarding = () => {
    preferenceRepository.completeOnboarding();
    setLaunchState({onboardingComplete: true, initialTab: 'Calculator'});
  };

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {launchState.onboardingComplete ? (
        <AppNavigator initialTab={launchState.initialTab} />
      ) : (
        <OnboardingScreen onComplete={completeOnboarding} />
      )}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LoanProvider>
          <AppContent />
        </LoanProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
