import React, {useMemo} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useAppTheme} from '../context/ThemeContext';
import type {ComparisonOffer} from '../types/loan';
import {formatCompactINR} from '../utils/currency';
import {calculateLoanMetrics} from '../utils/loanCalculations';

interface ComparisonTableProps {
  offers: ComparisonOffer[];
}

export function ComparisonTable({offers}: ComparisonTableProps) {
  const {colors} = useAppTheme();
  const rows = useMemo(
    () =>
      offers.map(offer => ({
        offer,
        metrics: calculateLoanMetrics(offer.principal, offer.interestRate, offer.tenureMonths),
      })),
    [offers],
  );
  const byInterest = [...rows].sort((a, b) => a.metrics.totalInterest - b.metrics.totalInterest);
  const lowestInterest = byInterest[0];
  const lowestEmi = [...rows].sort((a, b) => a.metrics.emi - b.metrics.emi)[0];
  const shortest = [...rows].sort((a, b) => a.offer.tenureMonths - b.offer.tenureMonths)[0];
  const samePrincipal = rows.every(row => row.offer.principal === rows[0]?.offer.principal);
  const savingsToNext = byInterest.length > 1
    ? byInterest[1].metrics.totalInterest - lowestInterest.metrics.totalInterest
    : 0;
  const labels = [
    'Amount borrowed',
    'Annual rate',
    'Time to repay',
    'Monthly EMI',
    'Total interest',
    'Total repaid',
  ];

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.recommendation,
          {
            backgroundColor: samePrincipal ? colors.primarySoft : colors.interestSoft,
            borderColor: samePrincipal ? colors.primary : colors.interest,
          },
        ]}>
        <Text style={[styles.eyebrow, {color: samePrincipal ? colors.primary : colors.interest}]}>
          {samePrincipal ? 'LOWEST LONG-TERM COST' : 'MAKE THIS A FAIR COMPARISON'}
        </Text>
        <Text style={[styles.recommendationTitle, {color: colors.text}]}>
          {samePrincipal
            ? `${lowestInterest.offer.name} costs the least overall`
            : 'The loan amounts are different'}
        </Text>
        <Text style={[styles.recommendationBody, {color: colors.textMuted}]}>
          {samePrincipal
            ? `${lowestInterest.offer.name} charges ${formatCompactINR(lowestInterest.metrics.totalInterest)} in total interest${savingsToNext > 0 ? `, saving ${formatCompactINR(savingsToNext)} versus the next-cheapest offer` : ''}. Make sure its ${formatCompactINR(lowestInterest.metrics.emi)} monthly EMI fits your budget.`
            : 'An offer financing less money will naturally look cheaper. Set the same loan amount for every offer before choosing a winner.'}
        </Text>
      </View>

      <View style={styles.insights}>
        <Insight
          label="Lowest monthly EMI"
          name={lowestEmi.offer.name}
          value={`${formatCompactINR(lowestEmi.metrics.emi)} / month`}
        />
        <Insight
          label="Least total interest"
          name={lowestInterest.offer.name}
          value={formatCompactINR(lowestInterest.metrics.totalInterest)}
        />
        <Insight
          label="Shortest repayment time"
          name={shortest.offer.name}
          value={formatTenure(shortest.offer.tenureMonths)}
        />
      </View>

      <View style={styles.breakdownHeading}>
        <Text style={[styles.breakdownTitle, {color: colors.text}]}>Full breakdown</Text>
        <Text style={[styles.breakdownCaption, {color: colors.textMuted}]}>Swipe sideways to see every offer.</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.table, {borderColor: colors.border}]}>
          <View style={[styles.labelColumn, {backgroundColor: colors.surfaceMuted}]}>
            <View style={styles.headerCell} />
            {labels.map(label => <Text key={label} style={[styles.labelCell, {color: colors.textMuted}]}>{label}</Text>)}
          </View>
          {rows.map(({offer, metrics}) => {
            const best = samePrincipal && offer.id === lowestInterest.offer.id;
            const values = [
              formatCompactINR(offer.principal),
              `${offer.interestRate}%`,
              formatTenure(offer.tenureMonths),
              formatCompactINR(metrics.emi),
              formatCompactINR(metrics.totalInterest),
              formatCompactINR(metrics.totalPayment),
            ];
            return (
              <View key={offer.id} style={[styles.offerColumn, {backgroundColor: best ? colors.primarySoft : colors.surface, borderColor: colors.border}]}>
                <View style={styles.headerCell}>
                  <Text numberOfLines={1} style={[styles.offerName, {color: colors.text}]}>{offer.name}</Text>
                  <Text style={[styles.best, {color: best ? colors.primary : colors.textMuted}]}>{best ? 'LOWEST COST' : offer.source.toUpperCase()}</Text>
                </View>
                {values.map((value, index) => <Text key={`${index}-${value}`} style={[styles.valueCell, {color: index === 4 ? colors.interest : colors.text}]}>{value}</Text>)}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function Insight({label, name, value}: {label: string; name: string; value: string}) {
  const {colors} = useAppTheme();
  return (
    <View style={[styles.insight, {backgroundColor: colors.surface, borderColor: colors.border}]}>
      <Text style={[styles.insightLabel, {color: colors.textMuted}]}>{label}</Text>
      <Text numberOfLines={1} style={[styles.insightName, {color: colors.text}]}>{name}</Text>
      <Text style={[styles.insightValue, {color: colors.primary}]}>{value}</Text>
    </View>
  );
}

function formatTenure(months: number) {
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`;
  if (months % 12 === 0) {
    const years = months / 12;
    return `${years} year${years === 1 ? '' : 's'}`;
  }
  return `${Math.floor(months / 12)}y ${months % 12}m`;
}

const styles = StyleSheet.create({
  wrapper: {gap: 16},
  recommendation: {borderWidth: 1, borderRadius: 8, padding: 16, gap: 5},
  eyebrow: {fontSize: 10, fontWeight: '900', letterSpacing: 0},
  recommendationTitle: {fontSize: 18, lineHeight: 24, fontWeight: '800', letterSpacing: 0},
  recommendationBody: {fontSize: 13, lineHeight: 19, letterSpacing: 0},
  insights: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  insight: {minWidth: 145, flex: 1, borderWidth: 1, borderRadius: 8, padding: 12},
  insightLabel: {fontSize: 10, fontWeight: '700', letterSpacing: 0},
  insightName: {fontSize: 13, fontWeight: '800', marginTop: 5, letterSpacing: 0},
  insightValue: {fontSize: 12, fontWeight: '700', marginTop: 3, letterSpacing: 0},
  breakdownHeading: {gap: 2},
  breakdownTitle: {fontSize: 15, fontWeight: '800', letterSpacing: 0},
  breakdownCaption: {fontSize: 11, letterSpacing: 0},
  table: {flexDirection: 'row', borderWidth: 1, borderRadius: 8, overflow: 'hidden'},
  labelColumn: {width: 118},
  offerColumn: {width: 132, borderLeftWidth: StyleSheet.hairlineWidth},
  headerCell: {height: 64, justifyContent: 'center', paddingHorizontal: 10},
  labelCell: {height: 43, paddingHorizontal: 10, textAlignVertical: 'center', fontSize: 11, fontWeight: '700', letterSpacing: 0},
  valueCell: {height: 43, paddingHorizontal: 10, textAlignVertical: 'center', fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'], letterSpacing: 0},
  offerName: {fontSize: 13, fontWeight: '800', letterSpacing: 0},
  best: {fontSize: 9, fontWeight: '800', marginTop: 4, letterSpacing: 0},
});
