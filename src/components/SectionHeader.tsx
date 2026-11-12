import { Text, View, StyleSheet } from 'react-native';
import { theme, text } from '../utils/theme';

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
      <Text style={[text.label(), s.label]}>{label}</Text>
      <Text style={[text.heading(), s.heading]}>
        {body}
        <Text style={[text.heading(), s.period]}>{period}</Text>
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginBottom: 28 },
  label: { marginBottom: 8 },
  heading: { fontSize: 34, marginTop: -4 },
  period: { color: theme.colors.accent },
});
