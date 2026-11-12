import { Pressable, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { AppText } from './AppText';

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
      <AppText
        variant="mono"
        color={isPrimary ? theme.colors.bg : theme.colors.accent}
        style={isPrimary ? s.primaryText : s.outlineText}
      >
        {title}
      </AppText>
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
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.accent,
  },
  outlineText: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  fullWidth: {
    width: '100%',
  },
});
