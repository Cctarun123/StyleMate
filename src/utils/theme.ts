import { ViewStyle, TextStyle } from 'react-native';

export const FONT_CONFIG = {
  display: 'BarlowCondensed_700Bold',
  displayMedium: 'BarlowCondensed_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  label: 'Inter_600SemiBold',
} as const;

export const theme = {
  colors: {
    bg: '#0A0A0A',
    surface: '#141414',
    text: '#F5F5F5',
    subtext: '#888888',
    border: '#292929',
    accent: '#FF3838',
  },
  fonts: {
    display: FONT_CONFIG.display,
    displayMedium: FONT_CONFIG.displayMedium,
    body: FONT_CONFIG.body,
    bodyMedium: FONT_CONFIG.bodyMedium,
    label: FONT_CONFIG.label,
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
  borderWidth: 1,
} as const;

const display: TextStyle = {
  fontFamily: theme.fonts.display,
  fontWeight: '700',
  textTransform: 'uppercase',
  lineHeight: 1.15,
  letterSpacing: 0.5,
  color: theme.colors.text,
};

export const border: ViewStyle = {
  borderWidth: theme.borderWidth,
  borderColor: theme.colors.border,
};

export const surface: ViewStyle = {
  backgroundColor: theme.colors.surface,
  ...border,
};

export const sheet = {
  page: (): ViewStyle => ({
    flex: 1,
    backgroundColor: theme.colors.bg,
  }),
  center: (): ViewStyle => ({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }),
};

export const text = {
  display: (): TextStyle => display,
  heading: (): TextStyle => display,
  label: (): TextStyle => ({
    fontFamily: theme.fonts.label,
    fontWeight: '600',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: theme.colors.subtext,
  }),
  body: (): TextStyle => ({
    fontFamily: theme.fonts.body,
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.text,
  }),
};

export type Theme = typeof theme;
