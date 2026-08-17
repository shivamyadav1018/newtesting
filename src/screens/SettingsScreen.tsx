import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Crown, Database, ShieldCheck} from 'lucide-react-native';
import {Screen} from '../components/Screen';
import {SectionHeader} from '../components/SectionHeader';
import {SegmentedControl} from '../components/SegmentedControl';
import {appConfig} from '../config';
import {useLoans} from '../context/LoanContext';
import {useAppTheme} from '../context/ThemeContext';

export function SettingsScreen() {
  const {colors, preference, setPreference} = useAppTheme();
  const {loans} = useLoans();
  return (
    <Screen>
      <SectionHeader title="Settings" caption="Appearance, privacy and future plan controls." />
      <View style={styles.section}>
        <Text style={[styles.label, {color: colors.textMuted}]}>APPEARANCE</Text>
        <SegmentedControl
          value={preference}
          onChange={setPreference}
          options={[{label: 'System', value: 'system'}, {label: 'Light', value: 'light'}, {label: 'Dark', value: 'dark'}]}
        />
      </View>
      <View style={[styles.row, {borderColor: colors.border}]}>
        <View style={[styles.icon, {backgroundColor: colors.primarySoft}]}><Crown color={colors.primary} size={20} /></View>
        <View style={styles.copy}>
          <Text style={[styles.rowTitle, {color: colors.text}]}>Pro status</Text>
          <Text style={[styles.rowCaption, {color: colors.textMuted}]}>{appConfig.isPro ? 'Active for this build' : 'Free plan'}</Text>
        </View>
        <Text style={[styles.badge, {color: colors.primary, backgroundColor: colors.primarySoft}]}>{appConfig.isPro ? 'PRO' : 'FREE'}</Text>
      </View>
      <View style={[styles.row, {borderColor: colors.border}]}>
        <View style={[styles.icon, {backgroundColor: colors.surfaceMuted}]}><Database color={colors.text} size={20} /></View>
        <View style={styles.copy}>
          <Text style={[styles.rowTitle, {color: colors.text}]}>Local storage</Text>
          <Text style={[styles.rowCaption, {color: colors.textMuted}]}>{loans.length} {loans.length === 1 ? 'loan' : 'loans'} stored on this device</Text>
        </View>
      </View>
      <View style={[styles.notice, {backgroundColor: colors.surfaceMuted}]}>
        <ShieldCheck color={colors.primary} size={20} />
        <Text style={[styles.noticeText, {color: colors.textMuted}]}>EMI Planner has no account or backend. Your financial data never leaves this device.</Text>
      </View>
      <Text style={[styles.version, {color: colors.textMuted}]}>EMI Planner · MVP 1.0</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {gap: 10},
  label: {fontSize: 10, fontWeight: '800', letterSpacing: 0},
  row: {borderTopWidth: 1, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 12},
  icon: {width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center'},
  copy: {flex: 1},
  rowTitle: {fontSize: 14, fontWeight: '800', letterSpacing: 0},
  rowCaption: {fontSize: 12, marginTop: 3, letterSpacing: 0},
  badge: {fontSize: 10, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 4, overflow: 'hidden', letterSpacing: 0},
  notice: {borderRadius: 8, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 10},
  noticeText: {flex: 1, fontSize: 12, lineHeight: 18, letterSpacing: 0},
  version: {fontSize: 11, textAlign: 'center', marginTop: 12, letterSpacing: 0},
});

