import { View, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { AppText } from './AppText';

type Props = {
  label: string;
  heading: string;
};

export function SectionHeader({ label, heading }: Props) {
  const hasPeriod = heading.endsWith('.');
  const body = hasPeriod ? heading.slice(0, -1) : heading;
  const period = hasPeriod ? '.' : '';

  return (
    <View style={s.container}>
      <AppText variant="label" style={s.label}>
        {label}
      </AppText>
      <View style={s.headingContainer}>
        <AppText variant="heading" style={s.headingText}>
          {body}
        </AppText>
        <AppText variant="heading" color={theme.colors.accent} style={s.period}>
          {period}
        </AppText>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginBottom: 28 },
  label: { marginBottom: 8 },
  headingContainer: { flexDirection: 'row' },
  headingText: { fontSize: 34 },
  period: { fontSize: 34 },
});
