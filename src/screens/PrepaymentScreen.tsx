import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarClock, PiggyBank, TrendingDown } from 'lucide-react-native';
import { FormField } from '../components/FormField';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { SegmentedControl } from '../components/SegmentedControl';
import { useLoans } from '../context/LoanContext';
import { useAppTheme } from '../context/ThemeContext';
import type { HomeStackParamList } from '../navigation/types';
import {
  formatCurrencyInput,
  formatINR,
  parseCurrencyInput,
} from '../utils/currency';
import { calculateEMI } from '../utils/loanCalculations';
import { calculatePrepaymentImpact } from '../utils/prepaymentCalculations';

type Props = NativeStackScreenProps<HomeStackParamList, 'Prepayment'>;
type PrepaymentMode = 'monthly' | 'one-time';

export function PrepaymentScreen({ route }: Props) {
  const { colors } = useAppTheme();
  const { getLoan } = useLoans();
  const loan = getLoan(route.params.loanId);
  const [mode, setMode] = useState<PrepaymentMode>('monthly');
  const [amount, setAmount] = useState('5,000');
  const [paymentMonth, setPaymentMonth] = useState('12');

  const result = useMemo(() => {
    if (!loan) return null;
    const value = parseCurrencyInput(amount);
    return calculatePrepaymentImpact(
      loan.principal,
      loan.interestRate,
      loan.tenureMonths,
      mode === 'monthly'
        ? { monthlyPrepayment: value }
        : {
            oneTimePrepayment: value,
            oneTimePrepaymentMonth: Number(paymentMonth) || 1,
          },
    );
  }, [amount, loan, mode, paymentMonth]);

  if (!loan || !result) {
    return (
      <Screen>
        <Text style={{ color: colors.text }}>Loan not found.</Text>
      </Screen>
    );
  }

  const emi = calculateEMI(
    loan.principal,
    loan.interestRate,
    loan.tenureMonths,
  );

  return (
    <Screen>
      <SectionHeader
        title={`Pay off ${loan.name} sooner`}
        caption={`Your regular EMI stays at ${formatINR(
          emi,
        )}. See how extra payments change the payoff timeline.`}
      />
      <SegmentedControl
        value={mode}
        onChange={value => {
          setMode(value);
          setAmount(value === 'monthly' ? '5,000' : '1,00,000');
        }}
        options={[
          { label: 'Extra each month', value: 'monthly' },
          { label: 'One-time payment', value: 'one-time' },
        ]}
      />
      <FormField
        label={
          mode === 'monthly'
            ? 'Extra amount per month'
            : 'One-time prepayment amount'
        }
        prefix="₹"
        keyboardType="number-pad"
        value={amount}
        onChangeText={value => setAmount(formatCurrencyInput(value))}
        hint={
          mode === 'monthly'
            ? 'This amount is paid in addition to your regular EMI every month.'
            : 'This amount is applied directly to the outstanding principal in the selected month.'
        }
      />
      {mode === 'one-time' ? (
        <FormField
          label="Payment month"
          suffix={`of ${loan.tenureMonths}`}
          keyboardType="number-pad"
          value={paymentMonth}
          onChangeText={value => {
            const numeric = value.replace(/[^0-9]/g, '');
            setPaymentMonth(
              numeric
                ? String(
                    Math.min(loan.tenureMonths, Math.max(1, Number(numeric))),
                  )
                : '',
            );
          }}
          hint="Month 1 is the first EMI month. Earlier prepayments generally save more interest."
        />
      ) : null}

      <View
        style={[
          styles.result,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.eyebrow, { color: colors.textMuted }]}>
          ESTIMATED SAVINGS
        </Text>
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[styles.savings, { color: colors.primary }]}
        >
          {formatINR(result.interestSaved)}
        </Text>
        <Text style={[styles.savingsCaption, { color: colors.textMuted }]}>
          less interest over the loan
        </Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.metrics}>
          <ResultMetric
            icon={<CalendarClock color={colors.primary} size={20} />}
            label="Time saved"
            value={formatMonths(result.monthsSaved)}
          />
          <ResultMetric
            icon={<TrendingDown color={colors.interest} size={20} />}
            label="New payoff time"
            value={formatMonths(result.revisedMonths)}
          />
        </View>
      </View>

      <View style={styles.comparison}>
        <SectionHeader
          title="Before and after"
          caption="Estimates assume the interest rate and regular EMI remain unchanged."
        />
        <ComparisonRow
          label="Original tenure"
          before={formatMonths(result.originalMonths)}
          after={formatMonths(result.revisedMonths)}
        />
        <ComparisonRow
          label="Total interest"
          before={formatINR(result.originalInterest)}
          after={formatINR(result.revisedInterest)}
        />
        <ComparisonRow
          label="Regular EMI"
          before={formatINR(emi)}
          after={formatINR(emi)}
        />
      </View>
      <View style={[styles.note, { backgroundColor: colors.primarySoft }]}>
        <PiggyBank color={colors.primary} size={20} />
        <Text style={[styles.noteText, { color: colors.text }]}>
          Check your lender’s prepayment charges and rules before making an
          extra payment.
        </Text>
      </View>
    </Screen>
  );
}

function ResultMetric({
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
    <View style={styles.metric}>
      {icon}
      <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
        {label}
      </Text>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[styles.metricValue, { color: colors.text }]}
      >
        {value}
      </Text>
    </View>
  );
}

function ComparisonRow({
  label,
  before,
  after,
}: {
  label: string;
  before: string;
  after: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.rowLabel, { color: colors.textMuted }]}>
        {label}
      </Text>
      <View style={styles.rowValues}>
        <Text style={[styles.before, { color: colors.textMuted }]}>
          {before}
        </Text>
        <Text style={[styles.after, { color: colors.text }]}>{after}</Text>
      </View>
    </View>
  );
}

function formatMonths(months: number): string {
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'}`;
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  return remainder
    ? `${years}y ${remainder}m`
    : `${years} ${years === 1 ? 'year' : 'years'}`;
}

const styles = StyleSheet.create({
  result: { borderWidth: 1, borderRadius: 8, padding: 18 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 0 },
  savings: {
    fontSize: 34,
    lineHeight: 43,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 0,
  },
  savingsCaption: { fontSize: 12, letterSpacing: 0 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 18 },
  metrics: { flexDirection: 'row', gap: 16 },
  metric: { flex: 1, minWidth: 0, gap: 5 },
  metricLabel: { fontSize: 11, letterSpacing: 0 },
  metricValue: { fontSize: 16, fontWeight: '800', letterSpacing: 0 },
  comparison: { gap: 0 },
  row: {
    minHeight: 58,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLabel: { fontSize: 13, letterSpacing: 0 },
  rowValues: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
    flex: 1,
  },
  before: {
    fontSize: 13,
    textDecorationLine: 'line-through',
    textAlign: 'right',
    letterSpacing: 0,
  },
  after: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
    minWidth: 74,
    letterSpacing: 0,
  },
  note: {
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  noteText: { fontSize: 12, lineHeight: 18, flex: 1, letterSpacing: 0 },
});
