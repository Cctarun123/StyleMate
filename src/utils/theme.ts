import { ViewStyle, TextStyle } from 'react-native';

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
    display: 'Anton',
    mono: 'Space Mono',
    body: 'sans-serif',
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
  heading: (): TextStyle => ({
    fontFamily: theme.fonts.display,
    textTransform: 'uppercase',
    lineHeight: 1,
    color: theme.colors.text,
  }),
  label: (): TextStyle => ({
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: theme.colors.subtext,
  }),
  body: (): TextStyle => ({
    fontFamily: theme.fonts.body,
    color: theme.colors.text,
  }),
};

export type Theme = typeof theme;
