import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {PieChart} from 'react-native-gifted-charts';
import {useAppTheme} from '../context/ThemeContext';
import {formatCompactINR, formatINR} from '../utils/currency';

interface EMISummaryCardProps {
  principal: number;
  emi: number;
  totalInterest: number;
  totalPayment: number;
  showChart?: boolean;
}

export function EMISummaryCard({
  principal,
  emi,
  totalInterest,
  totalPayment,
  showChart = true,
}: EMISummaryCardProps) {
  const {colors} = useAppTheme();
  const pieData = [
    {value: principal, color: colors.primary},
    {value: totalInterest, color: colors.interest},
  ];

  return (
    <View style={[styles.card, {backgroundColor: colors.surface, borderColor: colors.border}]}>
      <Text style={[styles.eyebrow, {color: colors.textMuted}]}>MONTHLY PAYMENT</Text>
      <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.emi, {color: colors.text}]}>
        {formatINR(emi)}
      </Text>
      <View style={[styles.divider, {backgroundColor: colors.border}]} />
      <View style={styles.detailRow}>
        <Metric label="Total interest" value={formatINR(totalInterest)} color={colors.interest} />
        <Metric label="Total payment" value={formatINR(totalPayment)} color={colors.text} align="right" />
      </View>
      {showChart ? (
        <View style={styles.chartRow}>
          <PieChart
            data={pieData}
            donut
            radius={66}
            innerRadius={46}
            innerCircleColor={colors.surface}
          />
          <View style={styles.legend}>
            <Legend color={colors.primary} label="Principal" value={formatCompactINR(principal)} />
            <Legend color={colors.interest} label="Interest" value={formatCompactINR(totalInterest)} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Metric({label, value, color, align}: {label: string; value: string; color: string; align?: 'right'}) {
  return (
    <View style={[styles.metric, align === 'right' && styles.alignRight]}>
      <Text style={[styles.metricLabel, {color}]}>{label}</Text>
      <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.metricValue, {color}]}>{value}</Text>
    </View>
  );
}

function Legend({color, label, value}: {color: string; label: string; value: string}) {
  const {colors} = useAppTheme();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, {backgroundColor: color}]} />
      <View>
        <Text style={[styles.legendLabel, {color: colors.textMuted}]}>{label}</Text>
        <Text style={[styles.legendValue, {color: colors.text}]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {borderWidth: 1, borderRadius: 8, padding: 18},
  eyebrow: {fontSize: 11, fontWeight: '800', letterSpacing: 0},
  emi: {fontSize: 34, lineHeight: 43, fontWeight: '800', marginTop: 4, letterSpacing: 0},
  divider: {height: StyleSheet.hairlineWidth, marginVertical: 16},
  detailRow: {flexDirection: 'row', gap: 12},
  metric: {flex: 1, minWidth: 0},
  alignRight: {alignItems: 'flex-end'},
  metricLabel: {fontSize: 12, fontWeight: '600', letterSpacing: 0},
  metricValue: {fontSize: 16, fontWeight: '800', marginTop: 4, maxWidth: '100%', letterSpacing: 0},
  chartRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 22},
  legend: {gap: 18},
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 10},
  dot: {width: 10, height: 10, borderRadius: 5},
  legendLabel: {fontSize: 11, letterSpacing: 0},
  legendValue: {fontSize: 14, fontWeight: '700', marginTop: 2, letterSpacing: 0},
});
