import React from 'react';
import {StyleSheet, Text, TextInput, View, type TextInputProps} from 'react-native';
import {useAppTheme} from '../context/ThemeContext';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  prefix?: string;
  suffix?: string;
}

export function FormField({
  label,
  error,
  prefix,
  suffix,
  style,
  ...props
}: FormFieldProps) {
  const {colors} = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, {color: colors.textMuted}]}>{label}</Text>
      <View
        style={[
          styles.inputShell,
          {backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border},
        ]}>
        {prefix ? <Text style={[styles.affix, {color: colors.textMuted}]}>{prefix}</Text> : null}
        <TextInput
          {...props}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          style={[styles.input, {color: colors.text}, style]}
        />
        {suffix ? <Text style={[styles.affix, {color: colors.textMuted}]}>{suffix}</Text> : null}
      </View>
      {error ? <Text style={[styles.error, {color: colors.danger}]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {gap: 7},
  label: {fontSize: 13, fontWeight: '600', letterSpacing: 0},
  inputShell: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  input: {flex: 1, fontSize: 17, paddingVertical: 0, letterSpacing: 0},
  affix: {fontSize: 15, fontWeight: '600', marginHorizontal: 3, letterSpacing: 0},
  error: {fontSize: 12, letterSpacing: 0},
});

