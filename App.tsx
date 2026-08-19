import React, {useEffect, useState} from 'react';
import {StatusBar, Text, TextInput} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {LoanProvider} from './src/context/LoanContext';
import {ThemeProvider, useAppTheme} from './src/context/ThemeContext';
import {AppNavigator} from './src/navigation/AppNavigator';
import {OnboardingScreen} from './src/screens/OnboardingScreen';
import {preferenceRepository} from './src/services/storage';
import {initializeAdMob} from './src/services/adMob';

type NativeTextComponent = {
  defaultProps?: {style?: unknown};
};

const interStyle = {fontFamily: 'Inter'};
const NativeText = Text as unknown as NativeTextComponent;
const NativeTextInput = TextInput as unknown as NativeTextComponent;

NativeText.defaultProps = {
  ...NativeText.defaultProps,
  style: [interStyle, NativeText.defaultProps?.style],
};
NativeTextInput.defaultProps = {
  ...NativeTextInput.defaultProps,
  style: [interStyle, NativeTextInput.defaultProps?.style],
};

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
      {launchState.onboardingComplete ? <AppNavigator initialTab={launchState.initialTab} /> : <OnboardingScreen onComplete={completeOnboarding} />}
    </>
  );
}

export default function App() {
  useEffect(() => {
    initializeAdMob();
  }, []);

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
