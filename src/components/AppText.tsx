import React from 'react';
import { Text, TextStyle } from 'react-native';
import { theme } from '../utils/theme';

type Variant = 'display' | 'heading' | 'label' | 'body' | 'mono';

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  color?: string;
  style?: TextStyle | TextStyle[];
};

const VARIANT_STYLES: Record<Variant, TextStyle> = {
  display: {
    fontFamily: theme.fonts.display,
    color: theme.colors.text,
    textTransform: 'uppercase',
  },
  heading: {
    fontFamily: theme.fonts.display,
    color: theme.colors.text,
    textTransform: 'uppercase',
    lineHeight: 1.25,
  },
  label: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: theme.colors.subtext,
  },
  body: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.text,
  },
  mono: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.text,
  },
};

export function AppText({ children, variant = 'body', color, style }: Props) {
  const base = VARIANT_STYLES[variant];
  return <Text style={[base, color ? { color } : null, style]}>{children}</Text>;
}
