import { TextStyle, ViewStyle } from 'react-native';

export const FONT_CONFIG = {
  title: 'LibreBaskerville_700Bold',
  heading: 'LibreBaskerville_700Bold',
  body: 'Inter_400Regular',
  label: 'Inter_500Medium',
  price: 'Inter_600SemiBold',
} as const;

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
};

export const colors = {
  bg: '#FFFFFF',
  tile: '#E3E3E3',
  card: '#F5F5F5',
  text: '#111111',
  subtext: '#6B6B6B',
  border: '#DADADA',
  dark: '#1A1A1A',
  onDark: '#FFFFFF',
  price: '#1F6FA5',
  danger: '#C0392B',
} as const;

export type ThemeColors = typeof colors;

export function useTheme() {
  return {
    colors,
    fonts: FONT_CONFIG,
    spacing,
    radius,
  };
}

export type Theme = ReturnType<typeof useTheme>;

export const text = {
  title: (colors: ThemeColors): TextStyle => ({
    fontFamily: FONT_CONFIG.title,
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 30,
    color: colors.text,
  }),
  heading: (colors: ThemeColors): TextStyle => ({
    fontFamily: FONT_CONFIG.heading,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 26,
    color: colors.text,
  }),
  body: (colors: ThemeColors): TextStyle => ({
    fontFamily: FONT_CONFIG.body,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  }),
  label: (colors: ThemeColors): TextStyle => ({
    fontFamily: FONT_CONFIG.label,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    color: colors.subtext,
  }),
  price: (colors: ThemeColors): TextStyle => ({
    fontFamily: FONT_CONFIG.price,
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 20,
    color: colors.price,
  }),
};

export const border = (colors: ThemeColors): ViewStyle => ({
  borderWidth: 1,
  borderColor: colors.border,
});

export const surface = (colors: ThemeColors): ViewStyle => ({
  backgroundColor: colors.card,
  ...border(colors),
});

export const sheet = {
  page: (colors: ThemeColors): ViewStyle => ({
    flex: 1,
    backgroundColor: colors.bg,
  }),
  center: (colors: ThemeColors): ViewStyle => ({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }),
};
