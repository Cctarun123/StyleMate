import { View, Text, StyleSheet } from 'react-native';
import { theme, text } from '../utils/theme';
import { ANNOUNCEMENT, NEXT_DROP_LABEL } from '../constants/brand';

export function AnnouncementBar() {
  return (
    <View style={s.container}>
      <View style={s.redSquare} />
      <Text style={[text.label(), s.text]}>{ANNOUNCEMENT}</Text>
      <Text style={[text.label(), s.label]}>{NEXT_DROP_LABEL} ↗</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bg,
    borderBottomWidth: theme.borderWidth,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  redSquare: {
    width: 8,
    height: 8,
    backgroundColor: theme.colors.accent,
  },
  text: {
    flex: 1,
    textAlign: 'center',
  },
  label: {
    color: theme.colors.accent,
  },
});
