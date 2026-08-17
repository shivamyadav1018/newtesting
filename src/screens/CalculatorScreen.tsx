import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {BookmarkPlus, Calculator} from 'lucide-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, type NavigationProp} from '@react-navigation/native';
import {AppButton} from '../components/AppButton';
import {EMISummaryCard} from '../components/EMISummaryCard';
import {FormField} from '../components/FormField';
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
      context.addIssue({code: 'custom', path: ['tenure'], message: 'Tenure cannot exceed 50 years'});
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
    defaultValues: {principal: '25,00,000', interestRate: '8.5', tenure: '20', tenureUnit: 'years'},
  });

  const calculate = (values: CalculatorValues) => {
    const principal = parseCurrencyInput(values.principal);
    const tenureMonths = Math.round(values.tenureUnit === 'years' ? Number(values.tenure) * 12 : Number(values.tenure));
    setResult({
      principal,
      interestRate: Number(values.interestRate),
      tenureMonths,
      ...calculateLoanMetrics(principal, Number(values.interestRate), tenureMonths),
    });
  };

  return (
    <>
      <Screen>
        <SectionHeader title="EMI calculator" caption="Model the full cost of a reducing-balance loan." />
        <Controller control={control} name="principal" render={({field}) => (
          <FormField label="Loan amount" prefix="₹" keyboardType="number-pad" value={field.value} onBlur={field.onBlur} onChangeText={value => field.onChange(formatCurrencyInput(value))} error={errors.principal?.message} />
        )} />
        <Controller control={control} name="interestRate" render={({field}) => (
          <FormField label="Annual interest rate" suffix="%" keyboardType="decimal-pad" value={field.value} onBlur={field.onBlur} onChangeText={value => field.onChange(value.replace(/[^0-9.]/g, ''))} error={errors.interestRate?.message} />
        )} />
        <Controller control={control} name="tenureUnit" render={({field}) => (
          <SegmentedControl value={field.value} onChange={field.onChange} options={[{label: 'Years', value: 'years'}, {label: 'Months', value: 'months'}]} />
        )} />
        <Controller control={control} name="tenure" render={({field}) => (
          <FormField label="Tenure" keyboardType="decimal-pad" value={field.value} onBlur={field.onBlur} onChangeText={value => field.onChange(value.replace(/[^0-9.]/g, ''))} error={errors.tenure?.message} />
        )} />
        <AppButton title="Calculate EMI" onPress={handleSubmit(calculate)} icon={<Calculator color={colors.white} size={19} />} />
        {result ? (
          <View style={styles.result}>
            <SectionHeader title="Your repayment picture" />
            <EMISummaryCard principal={result.principal} emi={result.emi} totalInterest={result.totalInterest} totalPayment={result.totalPayment} />
            <AppButton
              title="Save this loan"
              variant="secondary"
              onPress={() => setSaveVisible(true)}
              icon={<BookmarkPlus color={colors.text} size={18} />}
            />
          </View>
        ) : null}
      </Screen>
      {result ? <SaveLoanSheet visible={saveVisible} result={result} onClose={() => setSaveVisible(false)} /> : null}
    </>
  );
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
    defaultValues: {name: '', type: 'home', startDate: new Date().toISOString().slice(0, 10)},
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
      navigation.navigate('Home', {screen: 'LoanDetail', params: {loanId: loan.id}});
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
            <Controller control={control} name="name" render={({field}) => (
              <FormField autoFocus label="Loan name" placeholder="e.g. SBI Home Loan" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} error={errors.name?.message} />
            )} />
            <Controller control={control} name="type" render={({field}) => <LoanTypePicker value={field.value} onChange={field.onChange} />} />
            <Controller control={control} name="startDate" render={({field}) => (
              <FormField label="Start date" placeholder="YYYY-MM-DD" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} error={errors.startDate?.message} />
            )} />
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
  modalHeader: {flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12},
  closeButton: {minHeight: 38, paddingHorizontal: 12},
});
