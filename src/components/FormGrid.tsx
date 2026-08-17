import React, {Children, type PropsWithChildren} from 'react';
import {StyleSheet, useWindowDimensions, View} from 'react-native';

export function FormGrid({children}: PropsWithChildren) {
  const {width} = useWindowDimensions();
  const isWide = width >= 700;

  return (
    <View style={styles.grid}>
      {Children.map(children, child => (
        <View style={isWide ? styles.wideItem : styles.item}>{child}</View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: 16},
  item: {width: '100%'},
  wideItem: {width: '47%', minWidth: 280, flexGrow: 1},
});
