import React from 'react';
import {Alert, StyleSheet} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppButton} from '../components/AppButton';
import {FormField} from '../components/FormField';
import {LoanTypePicker} from '../components/LoanTypePicker';
import {Screen} from '../components/Screen';
import {SectionHeader} from '../components/SectionHeader';
import {SegmentedControl} from '../components/SegmentedControl';
import {useLoans} from '../context/LoanContext';
import type {HomeStackParamList} from '../navigation/types';
import type {LoanType} from '../types/loan';
import {formatCurrencyInput, parseCurrencyInput} from '../utils/currency';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter a loan name'),
  type: z.enum(['home', 'car', 'personal', 'education', 'other']),
  principal: z.string().refine(value => parseCurrencyInput(value) >= 1_000, 'Amount must be at least ₹1,000'),
  interestRate: z.string().refine(value => Number(value) >= 0 && Number(value) <= 50, 'Enter a rate from 0 to 50%'),
  tenure: z.string().refine(value => Number(value) > 0 && Number(value) <= 600, 'Enter a valid tenure'),
  tenureUnit: z.enum(['years', 'months']),
  startDate: z.string().refine(value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime()), 'Use YYYY-MM-DD'),
});

type FormValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<HomeStackParamList, 'LoanForm'>;

export function LoanFormScreen({navigation, route}: Props) {
  const {addLoan, updateLoan, getLoan} = useLoans();
  const loan = route.params?.loanId ? getLoan(route.params.loanId) : undefined;
  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: loan?.name ?? '',
      type: loan?.type ?? 'home',
      principal: loan ? formatCurrencyInput(loan.principal) : '',
      interestRate: loan ? String(loan.interestRate) : '',
      tenure: loan ? String(loan.tenureMonths) : '',
      tenureUnit: 'months',
      startDate: loan?.startDate ?? new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = (values: FormValues) => {
    const tenureMonths =
      values.tenureUnit === 'years' ? Math.round(Number(values.tenure) * 12) : Math.round(Number(values.tenure));
    const input = {
      name: values.name.trim(),
      type: values.type as LoanType,
      principal: parseCurrencyInput(values.principal),
      interestRate: Number(values.interestRate),
      tenureMonths,
      startDate: values.startDate,
    };

    try {
      if (loan) {
        updateLoan(loan.id, input);
      } else {
        addLoan(input);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Could not save loan', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <Screen>
      <SectionHeader title={loan ? 'Edit loan' : 'Add a loan'} caption="Use the terms from your lender's latest statement." />
      <Controller control={control} name="name" render={({field}) => (
        <FormField label="Loan name" placeholder="e.g. HDFC Home Loan" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} error={errors.name?.message} />
      )} />
      <Controller control={control} name="type" render={({field}) => (
        <LoanTypePicker value={field.value} onChange={field.onChange} />
      )} />
      <Controller control={control} name="principal" render={({field}) => (
        <FormField label="Loan amount" prefix="₹" placeholder="25,00,000" keyboardType="number-pad" value={field.value} onBlur={field.onBlur} onChangeText={value => field.onChange(formatCurrencyInput(value))} error={errors.principal?.message} />
      )} />
      <Controller control={control} name="interestRate" render={({field}) => (
        <FormField label="Annual interest rate" suffix="%" placeholder="8.5" keyboardType="decimal-pad" value={field.value} onBlur={field.onBlur} onChangeText={value => field.onChange(value.replace(/[^0-9.]/g, ''))} error={errors.interestRate?.message} />
      )} />
      <Controller control={control} name="tenureUnit" render={({field}) => (
        <SegmentedControl value={field.value} onChange={field.onChange} options={[{label: 'Years', value: 'years'}, {label: 'Months', value: 'months'}]} />
      )} />
      <Controller control={control} name="tenure" render={({field}) => (
        <FormField label="Tenure" placeholder="240" keyboardType="number-pad" value={field.value} onBlur={field.onBlur} onChangeText={value => field.onChange(value.replace(/[^0-9.]/g, ''))} error={errors.tenure?.message} />
      )} />
      <Controller control={control} name="startDate" render={({field}) => (
        <FormField label="Start date" placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} error={errors.startDate?.message} />
      )} />
      <AppButton title={loan ? 'Save changes' : 'Save loan'} onPress={handleSubmit(onSubmit)} loading={isSubmitting} style={styles.submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({submit: {marginTop: 4}});

