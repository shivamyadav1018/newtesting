import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useAppTheme} from '../context/ThemeContext';

interface Option<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const {colors} = useAppTheme();
  return (
    <View style={[styles.shell, {backgroundColor: colors.surfaceMuted}]}>
      {options.map(option => {
        const selected = option.value === value;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{selected}}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.option,
              selected && {backgroundColor: colors.surface},
            ]}>
            <Text
              style={[
                styles.label,
                {color: selected ? colors.text : colors.textMuted},
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {flexDirection: 'row', borderRadius: 8, padding: 3},
  option: {flex: 1, minHeight: 38, borderRadius: 6, alignItems: 'center', justifyContent: 'center'},
  label: {fontSize: 13, fontWeight: '700', letterSpacing: 0},
});

