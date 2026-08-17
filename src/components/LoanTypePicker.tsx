import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useAppTheme} from '../context/ThemeContext';
import {LOAN_TYPE_LABELS, type LoanType} from '../types/loan';

const loanTypes = Object.keys(LOAN_TYPE_LABELS) as LoanType[];

interface LoanTypePickerProps {
  value: LoanType;
  onChange: (type: LoanType) => void;
}

export function LoanTypePicker({value, onChange}: LoanTypePickerProps) {
  const {colors} = useAppTheme();
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, {color: colors.textMuted}]}>Loan type</Text>
      <View style={styles.options}>
        {loanTypes.map(type => {
          const selected = type === value;
          return (
            <Pressable
              key={type}
              onPress={() => onChange(type)}
              style={[
                styles.option,
                {
                  backgroundColor: selected ? colors.primarySoft : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}>
              <Text style={[styles.optionText, {color: selected ? colors.primary : colors.text}]}>
                {LOAN_TYPE_LABELS[type]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {gap: 8},
  label: {fontSize: 13, fontWeight: '600', letterSpacing: 0},
  options: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  option: {height: 38, borderWidth: 1, borderRadius: 8, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center'},
  optionText: {fontSize: 13, fontWeight: '700', letterSpacing: 0},
});

