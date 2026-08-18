import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View, type TextInputProps} from 'react-native';
import {Info} from 'lucide-react-native';
import {useAppTheme} from '../context/ThemeContext';
import {RangeSlider} from './RangeSlider';

interface SliderConfig {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  minimumLabel: string;
  maximumLabel: string;
  valueLabel?: string;
  onValueChange: (value: number) => void;
}

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  hint?: string;
  slider?: SliderConfig;
}

export function FormField({
  label,
  error,
  prefix,
  suffix,
  hint,
  slider,
  style,
  ...props
}: FormFieldProps) {
  const {colors} = useAppTheme();
  const [showHint, setShowHint] = useState(false);

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, {color: colors.textMuted}]}>{label}</Text>
        {hint ? (
          <Pressable
            accessibilityLabel={`More information about ${label}`}
            accessibilityRole="button"
            accessibilityState={{expanded: showHint}}
            hitSlop={8}
            onPress={() => setShowHint(current => !current)}
            style={({pressed}) => [styles.infoButton, pressed && styles.pressed]}>
            <Info color={showHint ? colors.primary : colors.textMuted} size={15} />
          </Pressable>
        ) : null}
      </View>
      {hint && showHint ? (
        <View
          accessibilityLiveRegion="polite"
          style={[styles.tooltip, {backgroundColor: colors.primarySoft}]}>
          <Text style={[styles.tooltipTitle, {color: colors.primary}]}>Why this matters</Text>
          <Text style={[styles.tooltipText, {color: colors.text}]}>{hint}</Text>
        </View>
      ) : null}
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
      {slider ? (
        <RangeSlider
          accessibilityLabel={`${label} slider`}
          value={slider.value}
          minimumValue={slider.minimumValue}
          maximumValue={slider.maximumValue}
          step={slider.step}
          minimumLabel={slider.minimumLabel}
          maximumLabel={slider.maximumLabel}
          valueLabel={slider.valueLabel}
          onValueChange={slider.onValueChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {gap: 7},
  labelRow: {flexDirection: 'row', alignItems: 'center', gap: 5},
  label: {fontSize: 13, fontWeight: '600', letterSpacing: 0},
  infoButton: {width: 24, height: 24, alignItems: 'center', justifyContent: 'center'},
  pressed: {opacity: 0.55},
  tooltip: {alignSelf: 'stretch', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, gap: 3},
  tooltipTitle: {fontSize: 11, fontWeight: '800', letterSpacing: 0},
  tooltipText: {fontSize: 12, lineHeight: 17, letterSpacing: 0},
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
