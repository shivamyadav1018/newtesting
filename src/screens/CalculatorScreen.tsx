import React, {useEffect, useState} from 'react';
import {Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, View} from 'react-native';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {BookmarkPlus, Calculator} from 'lucide-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, type NavigationProp} from '@react-navigation/native';
import {AppButton} from '../components/AppButton';
import {EMISummaryCard} from '../components/EMISummaryCard';
import {FormField} from '../components/FormField';
import {FormGrid} from '../components/FormGrid';
import {LoanTypePicker} from '../components/LoanTypePicker';
import {Screen} from '../components/Screen';
import {SectionHeader} from '../components/SectionHeader';
import {SegmentedControl} from '../components/SegmentedControl';
import {useLoans} from '../context/LoanContext';
import {useAppTheme} from '../context/ThemeContext';
import type {TabParamList} from '../navigation/types';
import type {LoanMetrics, LoanType} from '../types/loan';
import {formatCurrencyInput, parseCurrencyInput} from '../utils/currency';
import {calculateLoanMetrics} from '../utils/loanCalculations';
import {showInterstitialAd} from '../services/adMob';

const calculatorSchema = z
  .object({
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

const saveSchema = z.object({
  name: z.string().trim().min(2, 'Enter a name for this loan'),
  type: z.enum(['home', 'car', 'personal', 'education', 'other']),
  startDate: z.string().refine(value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime()), 'Use YYYY-MM-DD'),
});

type CalculatorValues = z.infer<typeof calculatorSchema>;
type SaveValues = z.infer<typeof saveSchema>;

interface CalculationResult extends LoanMetrics {
  principal: number;
  interestRate: number;
  tenureMonths: number;
}

export function CalculatorScreen() {
  const {colors} = useAppTheme();
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [saveVisible, setSaveVisible] = useState(false);
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<CalculatorValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      principal: '25,00,000',
      interestRate: '8.5',
      tenure: '20',
      tenureUnit: 'years',
    },
  });
  const [principal, interestRate, tenure, tenureUnit] = useWatch({
    control,
    name: ['principal', 'interestRate', 'tenure', 'tenureUnit'],
  });
  const hasCalculated = result !== null;

  useEffect(() => {
    if (!hasCalculated) return;
    const parsed = calculatorSchema.safeParse({
      principal,
      interestRate,
      tenure,
      tenureUnit,
    });
    if (parsed.success) {
      setResult(buildCalculationResult(parsed.data));
    }
  }, [hasCalculated, interestRate, principal, tenure, tenureUnit]);

  const calculate = (values: CalculatorValues) => {
    setResult(buildCalculationResult(values));
    showInterstitialAd();
  };

  return (
    <>
      <Screen>
        <SectionHeader title="Plan a loan you can afford" caption="Enter exact values or use the sliders to explore. We’ll show both your monthly payment and the loan’s full cost." />
        <FormGrid>
          <Controller
            control={control}
            name="principal"
            render={({field}) => (
              <FormField
                label="How much do you need to borrow?"
                hint="This is the amount financed after your down payment. Borrowing more increases both the monthly EMI and the total interest you pay."
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
                label="What interest rate were you offered?"
                hint="This is the lender’s yearly rate on the outstanding balance. Even a small rate reduction can save a meaningful amount over a long loan."
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
                label="How long will you take to repay?"
                hint="A longer tenure usually lowers your monthly EMI, but keeps you in debt longer and increases the total interest paid."
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
        </FormGrid>
        <AppButton title="See my monthly payment" onPress={handleSubmit(calculate)} icon={<Calculator color={colors.white} size={19} />} />
        {result ? (
          <View style={styles.result}>
            <SectionHeader title="Your repayment picture" caption="The EMI is due every month. Change any value above and this result will update instantly." />
            <EMISummaryCard principal={result.principal} emi={result.emi} totalInterest={result.totalInterest} totalPayment={result.totalPayment} />
            <AppButton title="Save this loan" variant="secondary" onPress={() => setSaveVisible(true)} icon={<BookmarkPlus color={colors.text} size={18} />} />
          </View>
        ) : null}
      </Screen>
      {result ? <SaveLoanSheet visible={saveVisible} result={result} onClose={() => setSaveVisible(false)} /> : null}
    </>
  );
}

function buildCalculationResult(values: CalculatorValues): CalculationResult {
  const principal = parseCurrencyInput(values.principal);
  const tenureMonths = Math.round(values.tenureUnit === 'years' ? Number(values.tenure) * 12 : Number(values.tenure));
  return {
    principal,
    interestRate: Number(values.interestRate),
    tenureMonths,
    ...calculateLoanMetrics(principal, Number(values.interestRate), tenureMonths),
  };
}

function SaveLoanSheet({visible, result, onClose}: {visible: boolean; result: CalculationResult; onClose: () => void}) {
  const {colors} = useAppTheme();
  const {addLoan} = useLoans();
  const navigation = useNavigation<NavigationProp<TabParamList>>();
  const {
    control,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<SaveValues>({
    resolver: zodResolver(saveSchema),
    defaultValues: {
      name: '',
      type: 'home',
      startDate: new Date().toISOString().slice(0, 10),
    },
  });

  const save = (values: SaveValues) => {
    try {
      const loan = addLoan({
        name: values.name.trim(),
        type: values.type as LoanType,
        principal: result.principal,
        interestRate: result.interestRate,
        tenureMonths: result.tenureMonths,
        startDate: values.startDate,
      });
      reset();
      onClose();
      showInterstitialAd();
      navigation.navigate('Home', {
        screen: 'LoanDetail',
        params: {loanId: loan.id},
      });
    } catch (error) {
      Alert.alert('Could not save loan', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.modalSafe, {backgroundColor: colors.background}]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalSafe}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <SectionHeader title="Save this loan" caption="Give this calculation a name so you can track it." />
              <AppButton title="Close" variant="ghost" onPress={onClose} style={styles.closeButton} />
            </View>
            <Controller control={control} name="name" render={({field}) => <FormField autoFocus label="Loan name" hint="Use a name you’ll recognise later, such as the lender and loan purpose. This does not change the calculation." placeholder="SBI Home Loan" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} error={errors.name?.message} />} />
            <Controller control={control} name="type" render={({field}) => <LoanTypePicker value={field.value} onChange={field.onChange} />} />
            <Controller control={control} name="startDate" render={({field}) => <FormField label="Start date" hint="The date your repayments begin. It is used to track your remaining tenure and does not change the EMI." placeholder="YYYY-MM-DD" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} error={errors.startDate?.message} />} />
            <AppButton title="Save to my loans" onPress={handleSubmit(save)} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  result: {gap: 16, marginTop: 8},
  modalSafe: {flex: 1},
  modalContent: {padding: 20, gap: 20},
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  closeButton: {minHeight: 38, paddingHorizontal: 12},
});
