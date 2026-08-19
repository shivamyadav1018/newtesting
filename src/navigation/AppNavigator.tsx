import React from 'react';
import { StyleSheet } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Calculator,
  GitCompareArrows,
  House,
  Settings,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';
import { AmortizationScreen } from '../screens/AmortizationScreen';
import { CalculatorScreen } from '../screens/CalculatorScreen';
import { CompareScreen } from '../screens/CompareScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoanDetailScreen } from '../screens/LoanDetailScreen';
import { LoanFormScreen } from '../screens/LoanFormScreen';
import { PrepaymentScreen } from '../screens/PrepaymentScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import type { HomeStackParamList, TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function getTabBarIcon(routeName: keyof TabParamList) {
  return ({ color, size }: { color: string; size: number }) => {
    const Icon =
      routeName === 'Home'
        ? House
        : routeName === 'Calculator'
        ? Calculator
        : routeName === 'Compare'
        ? GitCompareArrows
        : Settings;
    return <Icon color={color} size={size - 2} strokeWidth={2.2} />;
  };
}

function HomeNavigator() {
  const { colors } = useAppTheme();
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: styles.headerTitle,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <HomeStack.Screen
        name="LoanList"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="LoanDetail"
        component={LoanDetailScreen}
        options={{ title: 'Loan details' }}
      />
      <HomeStack.Screen
        name="Amortization"
        component={AmortizationScreen}
        options={{ title: 'Amortization' }}
      />
      <HomeStack.Screen
        name="Prepayment"
        component={PrepaymentScreen}
        options={{ title: 'Prepayment planner' }}
      />
      <HomeStack.Screen
        name="LoanForm"
        component={LoanFormScreen}
        options={({ route }) => ({
          title: route.params?.loanId ? 'Edit loan' : 'Add loan',
        })}
      />
    </HomeStack.Navigator>
  );
}

export function AppNavigator({
  initialTab = 'Home',
}: {
  initialTab?: keyof TabParamList;
}) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme: Theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.interest,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        initialRouteName={initialTab}
        screenOptions={({ route }) => ({
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: styles.headerTitle,
          headerTintColor: colors.text,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 56 + insets.bottom,
            paddingTop: 6,
            paddingBottom: Math.max(insets.bottom, 6),
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: getTabBarIcon(route.name),
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeNavigator}
          options={{ headerShown: false }}
        />
        <Tab.Screen name="Calculator" component={CalculatorScreen} />
        <Tab.Screen name="Compare" component={CompareScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontSize: 16, fontWeight: '800', letterSpacing: 0 },
  tabLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0 },
});
