import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useAppTheme} from '../context/ThemeContext';
import type {AmortizationEntry, YearlyAmortizationEntry} from '../types/loan';
import {formatCompactINR} from '../utils/currency';

interface AmortizationTableProps {
  mode: 'monthly' | 'yearly';
  monthly: AmortizationEntry[];
  yearly: YearlyAmortizationEntry[];
}

export function AmortizationTable({mode, monthly, yearly}: AmortizationTableProps) {
  const {colors} = useAppTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[styles.table, {borderColor: colors.border}]}>
        {mode === 'monthly' ? (
          <>
            <MonthlyHeader />
            {monthly.map((entry, index) => (
              <React.Fragment key={entry.month}>
                {index % 12 === 0 ? (
                  <View style={[styles.yearBand, {backgroundColor: colors.primarySoft}]}>
                    <Text style={[styles.yearBandText, {color: colors.primary}]}>YEAR {Math.floor(index / 12) + 1}</Text>
                  </View>
                ) : null}
                <TableRow
                  values={[
                    String(entry.month),
                    formatCompactINR(entry.emi),
                    formatCompactINR(entry.principalComponent),
                    formatCompactINR(entry.interestComponent),
                    formatCompactINR(entry.remainingBalance),
                  ]}
                />
              </React.Fragment>
            ))}
          </>
        ) : (
          <>
            <YearlyHeader />
            {yearly.map(entry => (
              <TableRow
                key={entry.year}
                values={[
                  `Year ${entry.year}`,
                  formatCompactINR(entry.principalPaid),
                  formatCompactINR(entry.interestPaid),
                  formatCompactINR(entry.totalPaid),
                  formatCompactINR(entry.remainingBalance),
                ]}
              />
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

function MonthlyHeader() {
  return <HeaderRow values={['Month', 'EMI', 'Principal', 'Interest', 'Balance']} />;
}

function YearlyHeader() {
  return <HeaderRow values={['Period', 'Principal', 'Interest', 'Paid', 'Balance']} />;
}

function HeaderRow({values}: {values: string[]}) {
  const {colors} = useAppTheme();
  return (
    <View style={[styles.row, styles.header, {backgroundColor: colors.surfaceMuted, borderColor: colors.border}]}>
      {values.map((value, index) => (
        <Text key={value} style={[styles.cell, index === 0 && styles.firstCell, styles.headerText, {color: colors.textMuted}]}>{value}</Text>
      ))}
    </View>
  );
}

function TableRow({values}: {values: string[]}) {
  const {colors} = useAppTheme();
  return (
    <View style={[styles.row, {backgroundColor: colors.surface, borderColor: colors.border}]}>
      {values.map((value, index) => (
        <Text key={`${index}-${value}`} style={[styles.cell, index === 0 && styles.firstCell, {color: colors.text}]}>{value}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {width: 660, borderWidth: 1, borderRadius: 8, overflow: 'hidden'},
  row: {minHeight: 46, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth},
  header: {minHeight: 42},
  cell: {width: 132, paddingHorizontal: 8, textAlign: 'right', fontSize: 12, fontVariant: ['tabular-nums'], letterSpacing: 0},
  firstCell: {textAlign: 'left'},
  headerText: {fontSize: 11, fontWeight: '700'},
  yearBand: {height: 30, justifyContent: 'center', paddingHorizontal: 10},
  yearBandText: {fontSize: 10, fontWeight: '800', letterSpacing: 0},
});

