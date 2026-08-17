import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Car, GraduationCap, Home, Landmark, WalletCards} from 'lucide-react-native';
import {useAppTheme} from '../context/ThemeContext';
import type {Loan, LoanType} from '../types/loan';
import {LOAN_TYPE_LABELS} from '../types/loan';
import {formatCompactINR, formatINR} from '../utils/currency';
import {calculateEMI, calculateRemainingTenure} from '../utils/loanCalculations';

const icons: Record<LoanType, React.ComponentType<{color: string; size: number}>> = {
  home: Home,
  car: Car,
  personal: WalletCards,
  education: GraduationCap,
  other: Landmark,
};

interface LoanCardProps {
  loan: Loan;
  onPress: () => void;
}

export function LoanCard({loan, onPress}: LoanCardProps) {
  const {colors} = useAppTheme();
  const Icon = icons[loan.type];
  const emi = calculateEMI(loan.principal, loan.interestRate, loan.tenureMonths);
  const remaining = calculateRemainingTenure(loan.startDate, loan.tenureMonths);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        {backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1},
      ]}>
      <View style={styles.topRow}>
        <View style={[styles.icon, {backgroundColor: colors.primarySoft}]}>
          <Icon color={colors.primary} size={21} />
        </View>
        <View style={styles.titleBlock}>
          <Text numberOfLines={1} style={[styles.name, {color: colors.text}]}>{loan.name}</Text>
          <Text style={[styles.type, {color: colors.textMuted}]}>{LOAN_TYPE_LABELS[loan.type]} loan</Text>
        </View>
        <Text style={[styles.principal, {color: colors.text}]}>{formatCompactINR(loan.principal)}</Text>
      </View>
      <View style={[styles.divider, {backgroundColor: colors.border}]} />
      <View style={styles.metrics}>
        <View>
          <Text style={[styles.metricLabel, {color: colors.textMuted}]}>MONTHLY EMI</Text>
          <Text style={[styles.metricValue, {color: colors.text}]}>{formatINR(emi)}</Text>
        </View>
        <View style={styles.alignRight}>
          <Text style={[styles.metricLabel, {color: colors.textMuted}]}>REMAINING</Text>
          <Text style={[styles.metricValue, {color: colors.text}]}>{remaining} months</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {borderWidth: 1, borderRadius: 8, padding: 16, gap: 14},
  topRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  icon: {width: 42, height: 42, borderRadius: 8, alignItems: 'center', justifyContent: 'center'},
  titleBlock: {flex: 1, minWidth: 0},
  name: {fontSize: 16, fontWeight: '700', letterSpacing: 0},
  type: {fontSize: 12, marginTop: 3, letterSpacing: 0},
  principal: {fontSize: 15, fontWeight: '800', letterSpacing: 0},
  divider: {height: StyleSheet.hairlineWidth},
  metrics: {flexDirection: 'row', justifyContent: 'space-between'},
  metricLabel: {fontSize: 10, fontWeight: '700', letterSpacing: 0},
  metricValue: {fontSize: 14, fontWeight: '700', marginTop: 5, letterSpacing: 0},
  alignRight: {alignItems: 'flex-end'},
});

