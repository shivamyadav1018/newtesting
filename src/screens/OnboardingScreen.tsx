import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {ArrowRight, IndianRupee, LineChart, ShieldCheck} from 'lucide-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../components/AppButton';
import {useAppTheme} from '../context/ThemeContext';

export function OnboardingScreen({onComplete}: {onComplete: () => void}) {
  const {colors} = useAppTheme();
  return (
    <SafeAreaView style={[styles.safe, {backgroundColor: colors.background}]}>
      <View style={styles.content}>
        <View style={[styles.mark, {backgroundColor: colors.primary}]}>
          <IndianRupee color={colors.white} size={30} strokeWidth={2.5} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, {color: colors.text}]}>EMI Planner</Text>
          <Text style={[styles.subtitle, {color: colors.textMuted}]}>
            Know the real cost of every loan before you commit.
          </Text>
        </View>
        <View style={styles.features}>
          <Feature icon={<LineChart color={colors.primary} size={22} />} title="See every payment" text="EMI, interest split and the full payoff timeline." />
          <Feature icon={<ShieldCheck color={colors.primary} size={22} />} title="Private by design" text="Your loans stay on this device. No account or backend." />
        </View>
      </View>
      <AppButton
        title="Calculate my EMI"
        onPress={onComplete}
        icon={<ArrowRight color={colors.white} size={19} />}
      />
    </SafeAreaView>
  );
}

function Feature({icon, title, text}: {icon: React.ReactNode; title: string; text: string}) {
  const {colors} = useAppTheme();
  return (
    <View style={styles.feature}>
      <View style={[styles.featureIcon, {backgroundColor: colors.primarySoft}]}>{icon}</View>
      <View style={styles.featureCopy}>
        <Text style={[styles.featureTitle, {color: colors.text}]}>{title}</Text>
        <Text style={[styles.featureText, {color: colors.textMuted}]}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, padding: 24, justifyContent: 'space-between'},
  content: {paddingTop: 52},
  mark: {width: 60, height: 60, borderRadius: 8, alignItems: 'center', justifyContent: 'center'},
  copy: {marginTop: 28},
  title: {fontSize: 38, lineHeight: 45, fontWeight: '800', letterSpacing: 0},
  subtitle: {fontSize: 17, lineHeight: 25, marginTop: 10, maxWidth: 330, letterSpacing: 0},
  features: {marginTop: 48, gap: 24},
  feature: {flexDirection: 'row', gap: 14},
  featureIcon: {width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center'},
  featureCopy: {flex: 1},
  featureTitle: {fontSize: 15, fontWeight: '800', letterSpacing: 0},
  featureText: {fontSize: 13, lineHeight: 19, marginTop: 4, letterSpacing: 0},
});

