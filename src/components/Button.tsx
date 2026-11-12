import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../utils/theme';
import { AppText } from './AppText';

type Variant = 'primary' | 'outline';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'primary', fullWidth, style }: Props) {
  const { colors, radius } = useTheme();
  const isPrimary = variant === 'primary';

  const s = StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      borderWidth: isPrimary ? 0 : 1,
      borderColor: colors.border,
      paddingVertical: 12,
      paddingHorizontal: 24,
      minHeight: 48,
      overflow: 'hidden',
    },
    primary: {
      backgroundColor: colors.dark,
    },
    outline: {
      backgroundColor: 'transparent',
    },
    fullWidth: {
      width: '100%',
    },
    text: {
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
  });

  return (
    <Pressable
      style={[s.base, isPrimary ? s.primary : s.outline, fullWidth ? s.fullWidth : null, style]}
      onPress={onPress}
    >
      <AppText variant="label" color={isPrimary ? colors.onDark : colors.text} style={s.text}>
        {title}
      </AppText>
    </Pressable>
  );
}
