import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import {BarChart} from 'react-native-gifted-charts';
import {Check, Plus, Trash2} from 'lucide-react-native';
import {Controller, useForm, useWatch} from 'react-hook-form';
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
import {showInterstitialAd} from '../services/adMob';

const offerSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter an offer name'),
    principal: z.string().refine(value => parseCurrencyInput(value) >= 1_000, 'Amount must be at least ₹1,000'),
    interestRate: z.string().refine(value => Number(value) >= 0 && Number(value) <= 50, 'Enter a rate from 0 to 50%'),
    tenure: z.string().refine(value => Number(value) > 0, 'Enter a tenure'),
    tenureUnit: z.enum(['years', 'months']),
  })
  .superRefine((values, context) => {
    const months = values.tenureUnit === 'years' ? Number(values.tenure) * 12 : Number(values.tenure);
    if (months > 600) {
      context.addIssue({
        code: 'custom',
        path: ['tenure'],
        message: 'Tenure cannot exceed 50 years',
      });
    }
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
  const samePrincipal = offers.every(offer => offer.principal === offers[0]?.principal);
  const axisLabelStyle = {color: colors.textMuted, ...styles.axisLabel};

  const toggleLoan = (id: string) => {
    setSelectedIds(current => (current.includes(id) ? current.filter(item => item !== id) : current.length < 3 ? [...current, id] : current));
  };

  return (
    <Screen>
      <SectionHeader title="Choose the loan that fits you" caption="Compare 2 or 3 offers. We’ll separate monthly affordability from long-term cost so you can see the trade-off." />
      <SegmentedControl
        value={mode}
        onChange={setMode}
        options={[
          {label: 'Choose saved loans', value: 'saved'},
          {label: 'Enter new offers', value: 'manual'},
        ]}
      />
      {mode === 'saved' ? (
        <View style={styles.selector}>
          {loans.length === 0 ? (
            <Text style={[styles.emptyText, {color: colors.textMuted}]}>No saved loans yet. Calculate and save a loan first, or choose “Enter new offers” above.</Text>
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
                <Pressable key={loan.id} disabled={disabled} onPress={() => toggleLoan(loan.id)} style={[styles.loanOption, optionStateStyle]}>
                  <View style={styles.loanCopy}>
                    <Text numberOfLines={1} style={[styles.loanName, {color: colors.text}]}>
                      {loan.name}
                    </Text>
                    <Text style={[styles.loanTerms, {color: colors.textMuted}]}>
                      {formatCompactINR(loan.principal)} · {loan.interestRate}% yearly · {formatTenure(loan.tenureMonths)}
                    </Text>
                  </View>
                  <View style={[styles.check, checkStateStyle]}>{selected ? <Check color={colors.white} size={15} strokeWidth={3} /> : null}</View>
                </Pressable>
              );
            })
          )}
        </View>
      ) : (
        <ManualOffers offers={manualOffers} setOffers={setManualOffers} />
      )}
      <Text style={[styles.selectionHint, {color: offers.length >= 2 ? colors.primary : colors.textMuted}]}>{offers.length < 2 ? `${offers.length} of 3 added · add ${2 - offers.length} more to compare` : `${offers.length} of 3 added · comparison ready`}</Text>
      {offers.length >= 2 ? (
        <>
          <SectionHeader title="Your best options" caption="Start with the recommendation, then check whether the monthly payment works for your budget." />
          <ComparisonTable offers={offers} />
          <View style={[styles.chart, {backgroundColor: colors.surface, borderColor: colors.border}]}>
            <Text style={[styles.chartTitle, {color: colors.text}]}>Interest cost over the full loan</Text>
            <Text style={[styles.chartCaption, {color: colors.textMuted}]}>{samePrincipal ? 'A shorter bar means less money paid to the lender as interest.' : 'Compare these bars only after making the amount borrowed the same.'}</Text>
            <BarChart data={barData} width={Math.max(240, width - 84)} height={190} barWidth={Math.min(52, (width - 130) / offers.length)} spacing={22} hideYAxisText yAxisColor={colors.chartGrid} xAxisColor={colors.chartGrid} rulesColor={colors.chartGrid} noOfSections={4} xAxisLabelTextStyle={axisLabelStyle} />
          </View>
        </>
      ) : null}
    </Screen>
  );
}

function ManualOffers({offers, setOffers}: {offers: ComparisonOffer[]; setOffers: React.Dispatch<React.SetStateAction<ComparisonOffer[]>>}) {
  const {colors} = useAppTheme();
  const {
    control,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<OfferValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      name: '',
      principal: '',
      interestRate: '',
      tenure: '',
      tenureUnit: 'years',
    },
  });
  const tenureUnit = useWatch({control, name: 'tenureUnit'});
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
    reset({
      name: '',
      principal: '',
      interestRate: '',
      tenure: '',
      tenureUnit: values.tenureUnit,
    });
    showInterstitialAd();
  };

  return (
    <View style={styles.manualSection}>
      {offers.map(offer => (
        <View key={offer.id} style={[styles.savedOffer, {backgroundColor: colors.surface, borderColor: colors.border}]}>
          <View style={styles.loanCopy}>
            <Text style={[styles.loanName, {color: colors.text}]}>{offer.name}</Text>
            <Text style={[styles.loanTerms, {color: colors.textMuted}]}>
              {formatCompactINR(offer.principal)} · {offer.interestRate}% yearly · {formatTenure(offer.tenureMonths)}
            </Text>
          </View>
          <Pressable accessibilityLabel={`Remove ${offer.name}`} onPress={() => setOffers(current => current.filter(item => item.id !== offer.id))} style={styles.removeButton}>
            <Trash2 color={colors.danger} size={19} />
          </Pressable>
        </View>
      ))}
      {offers.length < 3 ? (
        <View style={[styles.offerForm, {borderColor: colors.border}]}>
          <Text style={[styles.formTitle, {color: colors.text}]}>Add offer {offers.length + 1}</Text>
          <Text style={[styles.formCaption, {color: colors.textMuted}]}>Use the same loan amount for every offer to get a fair comparison.</Text>
          <Controller control={control} name="name" render={({field}) => <FormField label="Offer name" hint="Use the lender or plan name so you can recognise this option in the results. The name does not affect the calculation." placeholder="Bank A" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} error={errors.name?.message} />} />
          <Controller
            control={control}
            name="principal"
            render={({field}) => (
              <FormField
                label="Loan amount"
                hint="The amount this lender will finance after your down payment. Keep it the same across offers for a fair comparison."
                prefix="₹"
                keyboardType="number-pad"
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={value => field.onChange(formatCurrencyInput(value))}
                error={errors.principal?.message}
                slider={{
                  value: parseCurrencyInput(field.value),
                  minimumValue: 1_000,
                  maximumValue: 50_000_000,
                  step: 50_000,
                  minimumLabel: '₹1K',
                  maximumLabel: '₹5 Cr',
                  valueLabel: `₹${field.value || '0'}`,
                  onValueChange: value => field.onChange(formatCurrencyInput(value)),
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="interestRate"
            render={({field}) => (
              <FormField
                label="Annual interest rate"
                hint="The lender’s yearly rate on the outstanding balance. A lower rate normally reduces both EMI and total interest."
                suffix="%"
                keyboardType="decimal-pad"
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={value => field.onChange(value.replace(/[^0-9.]/g, ''))}
                error={errors.interestRate?.message}
                slider={{
                  value: Number(field.value),
                  minimumValue: 0,
                  maximumValue: 50,
                  step: 0.1,
                  minimumLabel: '0%',
                  maximumLabel: '50%',
                  valueLabel: `${field.value || '0'}% per year`,
                  onValueChange: value => field.onChange(String(value)),
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="tenureUnit"
            render={({field}) => (
              <SegmentedControl
                value={field.value}
                onChange={field.onChange}
                options={[
                  {label: 'Years', value: 'years'},
                  {label: 'Months', value: 'months'},
                ]}
              />
            )}
          />
          <Controller
            control={control}
            name="tenure"
            render={({field}) => (
              <FormField
                label="Repayment tenure"
                hint="A longer tenure can lower the EMI, but usually increases total interest. Compare both numbers before deciding."
                keyboardType="number-pad"
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={value => field.onChange(value.replace(/[^0-9]/g, ''))}
                error={errors.tenure?.message}
                slider={{
                  value: Number(field.value),
                  minimumValue: 1,
                  maximumValue: tenureUnit === 'years' ? 50 : 600,
                  step: 1,
                  minimumLabel: tenureUnit === 'years' ? '1 year' : '1 month',
                  maximumLabel: tenureUnit === 'years' ? '50 years' : '600 months',
                  valueLabel: `${field.value || '0'} ${tenureUnit}`,
                  onValueChange: value => field.onChange(String(value)),
                }}
              />
            )}
          />
          <AppButton title="Add to comparison" variant="secondary" onPress={handleSubmit(addOffer)} icon={<Plus color={colors.text} size={18} />} />
        </View>
      ) : null}
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
  selector: {gap: 10},
  loanOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loanCopy: {flex: 1, minWidth: 0},
  loanName: {fontSize: 14, fontWeight: '800', letterSpacing: 0},
  loanTerms: {fontSize: 12, marginTop: 4, letterSpacing: 0},
  check: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    paddingVertical: 28,
    letterSpacing: 0,
  },
  selectionHint: {fontSize: 11, fontWeight: '800', letterSpacing: 0},
  chart: {borderWidth: 1, borderRadius: 8, padding: 16, overflow: 'hidden'},
  chartTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 18,
    letterSpacing: 0,
  },
  chartCaption: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: -12,
    marginBottom: 18,
    letterSpacing: 0,
  },
  axisLabel: {fontSize: 10},
  manualSection: {gap: 10},
  savedOffer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerForm: {borderTopWidth: 1, paddingTop: 18, gap: 16, marginTop: 4},
  formTitle: {fontSize: 16, fontWeight: '800', letterSpacing: 0},
  formCaption: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: -10,
    letterSpacing: 0,
  },
});
