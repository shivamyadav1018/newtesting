import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AmortizationTable} from '../components/AmortizationTable';
import {Screen} from '../components/Screen';
import {SectionHeader} from '../components/SectionHeader';
import {SegmentedControl} from '../components/SegmentedControl';
import {useLoans} from '../context/LoanContext';
import {useAppTheme} from '../context/ThemeContext';
import type {HomeStackParamList} from '../navigation/types';
import {formatCompactINR} from '../utils/currency';
import {aggregateScheduleByYear, generateAmortizationSchedule} from '../utils/loanCalculations';

type Props = NativeStackScreenProps<HomeStackParamList, 'Amortization'>;

export function AmortizationScreen({route}: Props) {
  const {width} = useWindowDimensions();
  const {colors} = useAppTheme();
  const {getLoan} = useLoans();
  const [mode, setMode] = useState<'monthly' | 'yearly'>('monthly');
  const loan = getLoan(route.params.loanId);
  const monthly = useMemo(
    () => (loan ? generateAmortizationSchedule(loan.principal, loan.interestRate, loan.tenureMonths) : []),
    [loan],
  );
  const yearly = useMemo(() => aggregateScheduleByYear(monthly), [monthly]);
  const axisLabelStyle = {color: colors.textMuted, ...styles.axisLabel};
  const chartData = useMemo(() => {
    const interval = Math.max(1, Math.ceil(monthly.length / 24));
    const sampled = monthly.filter((_, index) => index % interval === 0);
    const last = monthly[monthly.length - 1];
    if (last && sampled[sampled.length - 1]?.month !== last.month) {
      sampled.push(last);
    }
    return sampled.map(entry => ({value: entry.remainingBalance, label: entry.month % 12 === 0 ? `Y${entry.month / 12}` : ''}));
  }, [monthly]);

  if (!loan) {
    return <Screen><Text style={{color: colors.text}}>Loan not found.</Text></Screen>;
  }

  return (
    <Screen>
      <SectionHeader title="Payoff timeline" caption={`${loan.name} · ${loan.tenureMonths} monthly payments`} />
      <View style={[styles.chart, {backgroundColor: colors.surface, borderColor: colors.border}]}>
        <View style={styles.chartTitleRow}>
          <View>
            <Text style={[styles.chartLabel, {color: colors.textMuted}]}>BALANCE JOURNEY</Text>
            <Text style={[styles.chartValue, {color: colors.text}]}>{formatCompactINR(loan.principal)} to ₹0</Text>
          </View>
          <View style={[styles.legendDot, {backgroundColor: colors.primary}]} />
        </View>
        <LineChart
          data={chartData}
          width={Math.max(240, width - 84)}
          height={170}
          color={colors.primary}
          thickness={3}
          curved
          hideDataPoints
          hideYAxisText
          yAxisColor={colors.chartGrid}
          xAxisColor={colors.chartGrid}
          rulesColor={colors.chartGrid}
          noOfSections={4}
          initialSpacing={2}
          endSpacing={4}
          xAxisLabelTextStyle={axisLabelStyle}
        />
      </View>
      <View style={styles.tableHeading}>
        <SectionHeader title="Payment schedule" caption={mode === 'monthly' ? 'Grouped into 12-month blocks' : 'Principal and interest by year'} />
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[{label: 'Monthly', value: 'monthly'}, {label: 'Yearly', value: 'yearly'}]}
        />
      </View>
      <AmortizationTable mode={mode} monthly={monthly} yearly={yearly} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chart: {borderWidth: 1, borderRadius: 8, padding: 16, overflow: 'hidden'},
  chartTitleRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16},
  chartLabel: {fontSize: 10, fontWeight: '800', letterSpacing: 0},
  chartValue: {fontSize: 17, fontWeight: '800', marginTop: 4, letterSpacing: 0},
  legendDot: {width: 10, height: 10, borderRadius: 5},
  tableHeading: {gap: 14},
  axisLabel: {fontSize: 9},
});
