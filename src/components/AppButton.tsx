import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';
import {useAppTheme} from '../context/ThemeContext';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  style,
}: AppButtonProps) {
  const {colors} = useAppTheme();
  const backgroundColor =
    variant === 'primary'
      ? colors.primary
      : variant === 'danger'
        ? colors.danger
        : variant === 'secondary'
          ? colors.surfaceMuted
          : 'transparent';
  const textColor =
    variant === 'primary' || variant === 'danger' ? colors.white : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        {backgroundColor, opacity: disabled ? 0.45 : pressed ? 0.78 : 1},
        variant === 'ghost' && {borderColor: colors.border, borderWidth: 1},
        style,
      ]}>
      {loading ? <ActivityIndicator color={textColor} /> : icon}
      <Text style={[styles.label, {color: textColor}]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0,
  },
});

