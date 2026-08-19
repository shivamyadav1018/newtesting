import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import {
  CalendarDays,
  Edit3,
  FileDown,
  HandCoins,
  ListTree,
  Percent,
  Trash2,
} from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { EMISummaryCard } from '../components/EMISummaryCard';
import { Screen } from '../components/Screen';
import { useLoans } from '../context/LoanContext';
import { useAppTheme } from '../context/ThemeContext';
import type { HomeStackParamList } from '../navigation/types';
import { exportLoanSummary } from '../services/pdfExport';
import { LOAN_TYPE_LABELS } from '../types/loan';
import { calculateLoanMetrics } from '../utils/loanCalculations';

type Props = NativeStackScreenProps<HomeStackParamList, 'LoanDetail'>;

export function LoanDetailScreen({ navigation, route }: Props) {
  const { colors } = useAppTheme();
  const { getLoan, deleteLoan } = useLoans();
  const [isExporting, setIsExporting] = useState(false);
  const loan = getLoan(route.params.loanId);

  if (!loan) {
    return (
      <Screen contentContainerStyle={styles.missing}>
        <Text style={[styles.missingText, { color: colors.text }]}>
          This loan is no longer available.
        </Text>
        <AppButton
          title="Back to loans"
          onPress={() => navigation.popToTop()}
        />
      </Screen>
    );
  }

  const metrics = calculateLoanMetrics(
    loan.principal,
    loan.interestRate,
    loan.tenureMonths,
  );
  const confirmDelete = () => {
    Alert.alert(
      'Delete this loan?',
      `${loan.name} and its locally saved details will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteLoan(loan.id);
            navigation.popToTop();
          },
        },
      ],
    );
  };
  const exportPdf = async () => {
    setIsExporting(true);
    try {
      await exportLoanSummary(loan);
    } catch (error) {
      Alert.alert(
        'Could not export PDF',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Screen>
      <View>
        <Text style={[styles.type, { color: colors.primary }]}>
          {LOAN_TYPE_LABELS[loan.type].toUpperCase()} LOAN
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>{loan.name}</Text>
      </View>
      <EMISummaryCard principal={loan.principal} {...metrics} />
      <View style={[styles.terms, { borderColor: colors.border }]}>
        <Term
          icon={<Percent color={colors.primary} size={19} />}
          label="Interest rate"
          value={`${loan.interestRate}% p.a.`}
        />
        <View
          style={[styles.verticalDivider, { backgroundColor: colors.border }]}
        />
        <Term
          icon={<CalendarDays color={colors.primary} size={19} />}
          label="Original tenure"
          value={`${loan.tenureMonths} months`}
        />
      </View>
      <AppButton
        title="View amortization"
        onPress={() => navigation.navigate('Amortization', { loanId: loan.id })}
        icon={<ListTree color={colors.white} size={18} />}
      />
      <View style={styles.actions}>
        <AppButton
          title="Prepayment"
          variant="secondary"
          onPress={() => navigation.navigate('Prepayment', { loanId: loan.id })}
          icon={<HandCoins color={colors.text} size={18} />}
          style={styles.action}
        />
        <AppButton
          title="Export PDF"
          variant="secondary"
          onPress={exportPdf}
          loading={isExporting}
          icon={<FileDown color={colors.text} size={18} />}
          style={styles.action}
        />
      </View>
      <View style={styles.actions}>
        <AppButton
          title="Edit"
          variant="secondary"
          onPress={() => navigation.navigate('LoanForm', { loanId: loan.id })}
          icon={<Edit3 color={colors.text} size={17} />}
          style={styles.action}
        />
        <AppButton
          title="Delete"
          variant="ghost"
          onPress={confirmDelete}
          icon={<Trash2 color={colors.danger} size={17} />}
          style={styles.action}
        />
      </View>
    </Screen>
  );
}

function Term({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.term}>
      {icon}
      <Text style={[styles.termLabel, { color: colors.textMuted }]}>
        {label}
      </Text>
      <Text style={[styles.termValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  type: { fontSize: 10, fontWeight: '800', letterSpacing: 0 },
  title: { fontSize: 28, fontWeight: '800', marginTop: 4, letterSpacing: 0 },
  terms: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 18,
    flexDirection: 'row',
  },
  term: { flex: 1, alignItems: 'center' },
  termLabel: { fontSize: 11, marginTop: 8, letterSpacing: 0 },
  termValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 3,
    letterSpacing: 0,
  },
  verticalDivider: { width: StyleSheet.hairlineWidth },
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1 },
  missing: { flexGrow: 1, justifyContent: 'center' },
  missingText: { fontSize: 17, textAlign: 'center', letterSpacing: 0 },
});
