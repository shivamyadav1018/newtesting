import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useAppTheme} from '../context/ThemeContext';

export function SectionHeader({title, caption}: {title: string; caption?: string}) {
  const {colors} = useAppTheme();
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.title, {color: colors.text}]}>{title}</Text>
      {caption ? <Text style={[styles.caption, {color: colors.textMuted}]}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {gap: 4},
  title: {fontSize: 20, fontWeight: '800', letterSpacing: 0},
  caption: {fontSize: 13, lineHeight: 19, letterSpacing: 0},
});

