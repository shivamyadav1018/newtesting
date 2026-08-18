import React, {useMemo, useRef, useState} from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';
import {useAppTheme} from '../context/ThemeContext';

interface RangeSliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onValueChange: (value: number) => void;
  accessibilityLabel: string;
  minimumLabel: string;
  maximumLabel: string;
  valueLabel?: string;
}

export function RangeSlider({
  value,
  minimumValue,
  maximumValue,
  step,
  onValueChange,
  accessibilityLabel,
  minimumLabel,
  maximumLabel,
  valueLabel,
}: RangeSliderProps) {
  const {colors} = useAppTheme();
  const trackWidth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const safeValue = clamp(value, minimumValue, maximumValue);
  const percentage = maximumValue === minimumValue
    ? 0
    : (safeValue - minimumValue) / (maximumValue - minimumValue);

  const updateFromTouch = (event: GestureResponderEvent) => {
    if (!trackWidth.current) return;
    const ratio = clamp(event.nativeEvent.locationX / trackWidth.current, 0, 1);
    const rawValue = minimumValue + ratio * (maximumValue - minimumValue);
    const steppedValue = minimumValue + Math.round((rawValue - minimumValue) / step) * step;
    onValueChange(roundForStep(clamp(steppedValue, minimumValue, maximumValue), step));
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: event => {
          setDragging(true);
          updateFromTouch(event);
        },
        onPanResponderMove: updateFromTouch,
        onPanResponderRelease: () => setDragging(false),
        onPanResponderTerminate: () => setDragging(false),
      }),
    // The responder must track the latest limits and callback supplied by the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maximumValue, minimumValue, onValueChange, step],
  );

  const adjust = (direction: -1 | 1) => {
    onValueChange(roundForStep(clamp(safeValue + direction * step, minimumValue, maximumValue), step));
  };

  return (
    <View style={styles.wrapper}>
      <View
        {...panResponder.panHandlers}
        accessible
        accessibilityActions={[{name: 'increment'}, {name: 'decrement'}]}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="adjustable"
        accessibilityValue={{
          min: minimumValue,
          max: maximumValue,
          now: safeValue,
          text: valueLabel,
        }}
        onAccessibilityAction={event => {
          if (event.nativeEvent.actionName === 'increment') adjust(1);
          if (event.nativeEvent.actionName === 'decrement') adjust(-1);
        }}
        onLayout={event => {
          trackWidth.current = event.nativeEvent.layout.width;
        }}
        style={styles.touchArea}>
        <View style={[styles.track, {backgroundColor: colors.border}]}>
          <View
            style={[
              styles.activeTrack,
              {backgroundColor: colors.primary, width: `${percentage * 100}%`},
            ]}
          />
        </View>
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: colors.surface,
              borderColor: colors.primary,
              left: `${percentage * 100}%`,
              transform: [{translateX: -10}, {scale: dragging ? 1.14 : 1}],
            },
          ]}
        />
      </View>
      <View style={styles.rangeLabels}>
        <Text style={[styles.rangeLabel, {color: colors.textMuted}]}>{minimumLabel}</Text>
        <Text style={[styles.rangeLabel, {color: colors.textMuted}]}>{maximumLabel}</Text>
      </View>
    </View>
  );
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));
}

function roundForStep(value: number, step: number) {
  const decimals = String(step).split('.')[1]?.length ?? 0;
  return Number(value.toFixed(decimals));
}

const styles = StyleSheet.create({
  wrapper: {gap: 0},
  touchArea: {height: 30, justifyContent: 'center', marginHorizontal: 1},
  track: {height: 4, borderRadius: 2, overflow: 'hidden'},
  activeTrack: {height: '100%', borderRadius: 2},
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
  },
  rangeLabels: {flexDirection: 'row', justifyContent: 'space-between'},
  rangeLabel: {fontSize: 10, fontWeight: '600', letterSpacing: 0},
});
