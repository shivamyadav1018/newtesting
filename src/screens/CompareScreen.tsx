import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import {BarChart} from 'react-native-gifted-charts';
import {Check, Plus, Trash2} from 'lucide-react-native';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {AppButton} from '../components/AppButton';
import {ComparisonTable} from '../components/ComparisonTable';
import {FormField} from '../components/FormField';
import {Screen} from '../components/Screen';
import {SectionHeader} from '../components/SectionHeader';
import {SegmentedControl} from '../components/SegmentedControl';
import {useLoans} from '../context/LoanContext';
import {useAppTheme} from '../context/ThemeContext';
import type {ComparisonOffer} from '../types/loan';
import {formatCurrencyInput, formatCompactINR, parseCurrencyInput} from '../utils/currency';
import {calculateLoanMetrics} from '../utils/loanCalculations';

const offerSchema = z.object({
  name: z.string().trim().min(2, 'Enter an offer name'),
  principal: z.string().refine(value => parseCurrencyInput(value) >= 1_000, 'Amount must be at least ₹1,000'),
  interestRate: z.string().refine(value => Number(value) >= 0 && Number(value) <= 50, 'Enter a rate from 0 to 50%'),
  tenure: z.string().refine(value => Number(value) > 0, 'Enter a tenure'),
  tenureUnit: z.enum(['years', 'months']),
});

type OfferValues = z.infer<typeof offerSchema>;

export function CompareScreen() {
  const {width} = useWindowDimensions();
  const {colors} = useAppTheme();
  const {loans} = useLoans();
  const [mode, setMode] = useState<'saved' | 'manual'>('saved');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [manualOffers, setManualOffers] = useState<ComparisonOffer[]>([]);
  const offers = useMemo<ComparisonOffer[]>(
    () =>
      mode === 'saved'
        ? selectedIds
            .map(id => loans.find(loan => loan.id === id))
            .filter((loan): loan is NonNullable<typeof loan> => Boolean(loan))
            .map(loan => ({
              id: loan.id,
              name: loan.name,
              principal: loan.principal,
              interestRate: loan.interestRate,
              tenureMonths: loan.tenureMonths,
              source: 'saved',
            }))
        : manualOffers,
    [loans, manualOffers, mode, selectedIds],
  );
  const barData = offers.map(offer => ({
    value: calculateLoanMetrics(offer.principal, offer.interestRate, offer.tenureMonths).totalInterest,
    label: offer.name.length > 8 ? `${offer.name.slice(0, 7)}...` : offer.name,
    frontColor: colors.interest,
  }));
  const axisLabelStyle = {color: colors.textMuted, ...styles.axisLabel};

  const toggleLoan = (id: string) => {
    setSelectedIds(current =>
      current.includes(id)
        ? current.filter(item => item !== id)
        : current.length < 3
          ? [...current, id]
          : current,
    );
  };

  return (
    <Screen>
      <SectionHeader title="Compare offers" caption="Put 2 or 3 loans side by side. Lowest total interest wins." />
      <SegmentedControl
        value={mode}
        onChange={setMode}
        options={[{label: 'Saved loans', value: 'saved'}, {label: 'Manual offers', value: 'manual'}]}
      />
      {mode === 'saved' ? (
        <View style={styles.selector}>
          {loans.length === 0 ? (
            <Text style={[styles.emptyText, {color: colors.textMuted}]}>Save loans from the calculator to compare them here.</Text>
          ) : (
            loans.map(loan => {
              const selected = selectedIds.includes(loan.id);
              const disabled = !selected && selectedIds.length >= 3;
              const optionStateStyle = {
                backgroundColor: selected ? colors.primarySoft : colors.surface,
                borderColor: selected ? colors.primary : colors.border,
                opacity: disabled ? 0.45 : 1,
              };
              const checkStateStyle = {
                backgroundColor: selected ? colors.primary : 'transparent',
                borderColor: selected ? colors.primary : colors.border,
              };
              return (
                <Pressable
                  key={loan.id}
                  disabled={disabled}
                  onPress={() => toggleLoan(loan.id)}
                  style={[
                    styles.loanOption,
                    optionStateStyle,
                  ]}>
                  <View style={styles.loanCopy}>
                    <Text numberOfLines={1} style={[styles.loanName, {color: colors.text}]}>{loan.name}</Text>
                    <Text style={[styles.loanTerms, {color: colors.textMuted}]}>{formatCompactINR(loan.principal)} · {loan.interestRate}% · {loan.tenureMonths} mo</Text>
                  </View>
                  <View style={[styles.check, checkStateStyle]}>
                    {selected ? <Check color={colors.white} size={15} strokeWidth={3} /> : null}
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      ) : (
        <ManualOffers offers={manualOffers} setOffers={setManualOffers} />
      )}
      <Text style={[styles.selectionHint, {color: offers.length >= 2 ? colors.primary : colors.textMuted}]}>
        {offers.length}/3 selected {offers.length < 2 ? '· choose at least 2' : ''}
      </Text>
      {offers.length >= 2 ? (
        <>
          <SectionHeader title="Comparison" />
          <ComparisonTable offers={offers} />
          <View style={[styles.chart, {backgroundColor: colors.surface, borderColor: colors.border}]}>
            <Text style={[styles.chartTitle, {color: colors.text}]}>Total interest</Text>
            <BarChart
              data={barData}
              width={Math.max(240, width - 84)}
              height={190}
              barWidth={Math.min(52, (width - 130) / offers.length)}
              spacing={22}
              hideYAxisText
              yAxisColor={colors.chartGrid}
              xAxisColor={colors.chartGrid}
              rulesColor={colors.chartGrid}
              noOfSections={4}
              xAxisLabelTextStyle={axisLabelStyle}
            />
          </View>
        </>
      ) : null}
    </Screen>
  );
}

function ManualOffers({offers, setOffers}: {offers: ComparisonOffer[]; setOffers: React.Dispatch<React.SetStateAction<ComparisonOffer[]>>}) {
  const {colors} = useAppTheme();
  const {control, handleSubmit, reset, formState: {errors}} = useForm<OfferValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {name: '', principal: '', interestRate: '', tenure: '', tenureUnit: 'years'},
  });
  const addOffer = (values: OfferValues) => {
    if (offers.length >= 3) return;
    setOffers(current => [
      ...current,
      {
        id: `offer-${Date.now()}-${current.length}`,
        name: values.name.trim(),
        principal: parseCurrencyInput(values.principal),
        interestRate: Number(values.interestRate),
        tenureMonths: Math.round(values.tenureUnit === 'years' ? Number(values.tenure) * 12 : Number(values.tenure)),
        source: 'manual',
      },
    ]);
    reset({name: '', principal: '', interestRate: '', tenure: '', tenureUnit: values.tenureUnit});
  };

  return (
    <View style={styles.manualSection}>
      {offers.map(offer => (
        <View key={offer.id} style={[styles.savedOffer, {backgroundColor: colors.surface, borderColor: colors.border}]}>
          <View style={styles.loanCopy}>
            <Text style={[styles.loanName, {color: colors.text}]}>{offer.name}</Text>
            <Text style={[styles.loanTerms, {color: colors.textMuted}]}>{formatCompactINR(offer.principal)} · {offer.interestRate}% · {offer.tenureMonths} mo</Text>
          </View>
          <Pressable accessibilityLabel={`Remove ${offer.name}`} onPress={() => setOffers(current => current.filter(item => item.id !== offer.id))} style={styles.removeButton}>
            <Trash2 color={colors.danger} size={19} />
          </Pressable>
        </View>
      ))}
      {offers.length < 3 ? (
        <View style={[styles.offerForm, {borderColor: colors.border}]}>
          <Text style={[styles.formTitle, {color: colors.text}]}>Add offer {offers.length + 1}</Text>
          <Controller control={control} name="name" render={({field}) => <FormField label="Offer name" placeholder="e.g. Bank A" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} error={errors.name?.message} />} />
          <Controller control={control} name="principal" render={({field}) => <FormField label="Loan amount" prefix="₹" keyboardType="number-pad" value={field.value} onBlur={field.onBlur} onChangeText={value => field.onChange(formatCurrencyInput(value))} error={errors.principal?.message} />} />
          <Controller control={control} name="interestRate" render={({field}) => <FormField label="Annual rate" suffix="%" keyboardType="decimal-pad" value={field.value} onBlur={field.onBlur} onChangeText={value => field.onChange(value.replace(/[^0-9.]/g, ''))} error={errors.interestRate?.message} />} />
          <Controller control={control} name="tenureUnit" render={({field}) => <SegmentedControl value={field.value} onChange={field.onChange} options={[{label: 'Years', value: 'years'}, {label: 'Months', value: 'months'}]} />} />
          <Controller control={control} name="tenure" render={({field}) => <FormField label="Tenure" keyboardType="number-pad" value={field.value} onBlur={field.onBlur} onChangeText={value => field.onChange(value.replace(/[^0-9.]/g, ''))} error={errors.tenure?.message} />} />
          <AppButton title="Add to comparison" variant="secondary" onPress={handleSubmit(addOffer)} icon={<Plus color={colors.text} size={18} />} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {gap: 10},
  loanOption: {borderWidth: 1, borderRadius: 8, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12},
  loanCopy: {flex: 1, minWidth: 0},
  loanName: {fontSize: 14, fontWeight: '800', letterSpacing: 0},
  loanTerms: {fontSize: 12, marginTop: 4, letterSpacing: 0},
  check: {width: 24, height: 24, borderRadius: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center'},
  emptyText: {fontSize: 14, lineHeight: 21, textAlign: 'center', paddingVertical: 28, letterSpacing: 0},
  selectionHint: {fontSize: 11, fontWeight: '800', letterSpacing: 0},
  chart: {borderWidth: 1, borderRadius: 8, padding: 16, overflow: 'hidden'},
  chartTitle: {fontSize: 16, fontWeight: '800', marginBottom: 18, letterSpacing: 0},
  axisLabel: {fontSize: 10},
  manualSection: {gap: 10},
  savedOffer: {borderWidth: 1, borderRadius: 8, padding: 14, flexDirection: 'row', alignItems: 'center'},
  removeButton: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  offerForm: {borderTopWidth: 1, paddingTop: 18, gap: 16, marginTop: 4},
  formTitle: {fontSize: 16, fontWeight: '800', letterSpacing: 0},
});
