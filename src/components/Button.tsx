import { Pressable, Text, StyleSheet } from 'react-native';
import { theme, text } from '../utils/theme';

type Variant = 'primary' | 'outline';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  fullWidth?: boolean;
};

export function Button({ title, onPress, variant = 'primary', fullWidth }: Props) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      style={[
        s.base,
        isPrimary ? s.primary : s.outline,
        fullWidth ? s.fullWidth : null,
      ]}
      onPress={onPress}
    >
      <Text style={[text.body(), isPrimary ? s.primaryText : s.outlineText]}>{title}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
    borderWidth: theme.borderWidth,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 52,
  },
  primary: {
    backgroundColor: theme.colors.text,
    borderColor: theme.colors.text,
  },
  primaryText: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: theme.colors.bg,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.accent,
  },
  outlineText: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: theme.colors.accent,
  },
  fullWidth: {
    width: '100%',
  },
});
