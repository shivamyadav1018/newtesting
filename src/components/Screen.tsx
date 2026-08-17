import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAppTheme} from '../context/ThemeContext';

export function Screen({children, contentContainerStyle, ...props}: ScrollViewProps) {
  const {colors} = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.flex, {backgroundColor: colors.background}]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        {...props}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: Math.max(insets.bottom, 16) + 24},
          contentContainerStyle,
        ]}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  content: {padding: 16, gap: 20},
});

