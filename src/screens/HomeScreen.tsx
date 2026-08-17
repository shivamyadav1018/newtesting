import React, {useMemo} from 'react';
import {FlatList, StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import {Plus, WalletCards} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../components/AppButton';
import {LoanCard} from '../components/LoanCard';
import {useLoans} from '../context/LoanContext';
import {useAppTheme} from '../context/ThemeContext';
import type {HomeStackParamList} from '../navigation/types';
import {formatCompactINR, formatINR} from '../utils/currency';
import {calculateEMI} from '../utils/loanCalculations';

type Props = NativeStackScreenProps<HomeStackParamList, 'LoanList'>;

function ItemSeparator() {
  return <View style={styles.separator} />;
}

export function HomeScreen({navigation}: Props) {
  const {colors} = useAppTheme();
  const {width} = useWindowDimensions();
  const {loans, canAddLoan} = useLoans();
  const columnCount = width >= 700 ? 2 : 1;
  const horizontalPadding = width >= 768 ? 32 : width >= 430 ? 20 : 16;
  const totals = useMemo(
    () => ({
      principal: loans.reduce((sum, loan) => sum + loan.principal, 0),
      emi: loans.reduce(
        (sum, loan) => sum + calculateEMI(loan.principal, loan.interestRate, loan.tenureMonths),
        0,
      ),
    }),
    [loans],
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safe, {backgroundColor: colors.background}]}>
      <FlatList
        key={`loan-grid-${columnCount}`}
        data={loans}
        numColumns={columnCount}
        columnWrapperStyle={columnCount > 1 ? styles.columns : undefined}
        keyExtractor={loan => loan.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          {paddingHorizontal: horizontalPadding},
          loans.length === 0 && styles.emptyList,
        ]}
        ItemSeparatorComponent={ItemSeparator}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <View>
                <Text style={[styles.eyebrow, {color: colors.primary}]}>YOUR PORTFOLIO</Text>
                <Text style={[styles.title, {color: colors.text}]}>Loans</Text>
              </View>
              <AppButton
                title="Add loan"
                onPress={() => navigation.navigate('LoanForm')}
                disabled={!canAddLoan}
                icon={<Plus color={colors.white} size={18} />}
                style={styles.addButton}
              />
            </View>
            {loans.length > 0 ? (
              <View style={[styles.overview, {backgroundColor: colors.black}]}>
                <View style={styles.overviewMetric}>
                  <Text style={styles.overviewLabel}>TOTAL BORROWED</Text>
                  <Text style={styles.overviewValue}>{formatCompactINR(totals.principal)}</Text>
                </View>
                <View style={styles.overviewMetricRight}>
                  <Text style={styles.overviewLabel}>MONTHLY OUTGO</Text>
                  <Text style={styles.overviewValue}>{formatINR(totals.emi)}</Text>
                </View>
              </View>
            ) : null}
            {loans.length > 0 ? (
              <Text style={[styles.sectionLabel, {color: colors.textMuted}]}>{loans.length} SAVED {loans.length === 1 ? 'LOAN' : 'LOANS'}</Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, {backgroundColor: colors.primarySoft}]}>
              <WalletCards color={colors.primary} size={28} />
            </View>
            <Text style={[styles.emptyTitle, {color: colors.text}]}>Your loan picture starts here</Text>
            <Text style={[styles.emptyText, {color: colors.textMuted}]}>Add an existing loan to track its cost and payoff schedule.</Text>
            <AppButton title="Add your first loan" onPress={() => navigation.navigate('LoanForm')} style={styles.emptyButton} />
          </View>
        }
        renderItem={({item}) => (
          <View style={styles.loanItem}>
            <LoanCard loan={item} onPress={() => navigation.navigate('LoanDetail', {loanId: item.id})} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1},
  list: {paddingVertical: 16, paddingBottom: 32},
  emptyList: {flexGrow: 1},
  columns: {gap: 12},
  loanItem: {flex: 1, minWidth: 0},
  separator: {height: 12},
  headerContent: {gap: 20, marginBottom: 16},
  titleRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  eyebrow: {fontSize: 10, fontWeight: '800', letterSpacing: 0},
  title: {fontSize: 30, fontWeight: '800', marginTop: 2, letterSpacing: 0},
  addButton: {minHeight: 42},
  overview: {borderRadius: 8, padding: 18, flexDirection: 'row'},
  overviewMetric: {flex: 1},
  overviewMetricRight: {flex: 1, alignItems: 'flex-end'},
  overviewLabel: {color: '#AEB9B4', fontSize: 9, fontWeight: '800', letterSpacing: 0},
  overviewValue: {color: '#FFFFFF', fontSize: 19, fontWeight: '800', marginTop: 6, letterSpacing: 0},
  sectionLabel: {fontSize: 10, fontWeight: '800', letterSpacing: 0},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 40},
  emptyIcon: {width: 58, height: 58, borderRadius: 8, alignItems: 'center', justifyContent: 'center'},
  emptyTitle: {fontSize: 20, fontWeight: '800', textAlign: 'center', marginTop: 20, letterSpacing: 0},
  emptyText: {fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8, maxWidth: 300, letterSpacing: 0},
  emptyButton: {marginTop: 24, alignSelf: 'stretch'},
});
