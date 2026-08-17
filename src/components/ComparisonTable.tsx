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
  const bestId = rows.reduce<string | null>(
    (best, row) =>
      best === null || row.metrics.totalInterest < (rows.find(item => item.offer.id === best)?.metrics.totalInterest ?? Infinity)
        ? row.offer.id
        : best,
    null,
  );
  const labels = ['Principal', 'Rate', 'Tenure', 'EMI', 'Interest', 'Total'];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[styles.table, {borderColor: colors.border}]}>
        <View style={[styles.labelColumn, {backgroundColor: colors.surfaceMuted}]}>
          <View style={styles.headerCell} />
          {labels.map(label => <Text key={label} style={[styles.labelCell, {color: colors.textMuted}]}>{label}</Text>)}
        </View>
        {rows.map(({offer, metrics}) => {
          const best = offer.id === bestId;
          const values = [
            formatCompactINR(offer.principal),
            `${offer.interestRate}%`,
            `${offer.tenureMonths} mo`,
            formatCompactINR(metrics.emi),
            formatCompactINR(metrics.totalInterest),
            formatCompactINR(metrics.totalPayment),
          ];
          return (
            <View key={offer.id} style={[styles.offerColumn, {backgroundColor: best ? colors.primarySoft : colors.surface, borderColor: colors.border}]}>
              <View style={styles.headerCell}>
                <Text numberOfLines={1} style={[styles.offerName, {color: colors.text}]}>{offer.name}</Text>
                <Text style={[styles.best, {color: best ? colors.primary : colors.textMuted}]}>{best ? 'BEST VALUE' : offer.source.toUpperCase()}</Text>
              </View>
              {values.map((value, index) => <Text key={`${index}-${value}`} style={[styles.valueCell, {color: index === 4 ? colors.interest : colors.text}]}>{value}</Text>)}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  table: {flexDirection: 'row', borderWidth: 1, borderRadius: 8, overflow: 'hidden'},
  labelColumn: {width: 92},
  offerColumn: {width: 132, borderLeftWidth: StyleSheet.hairlineWidth},
  headerCell: {height: 64, justifyContent: 'center', paddingHorizontal: 10},
  labelCell: {height: 43, paddingHorizontal: 10, textAlignVertical: 'center', fontSize: 11, fontWeight: '700', letterSpacing: 0},
  valueCell: {height: 43, paddingHorizontal: 10, textAlignVertical: 'center', fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'], letterSpacing: 0},
  offerName: {fontSize: 13, fontWeight: '800', letterSpacing: 0},
  best: {fontSize: 9, fontWeight: '800', marginTop: 4, letterSpacing: 0},
});

