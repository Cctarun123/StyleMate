import React from 'react';
import { Text, TextStyle } from 'react-native';
import { text } from '../utils/theme';

type Variant = 'display' | 'heading' | 'label' | 'body';

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  color?: string;
  style?: TextStyle | TextStyle[];
};

const VARIANT_STYLES: Record<Variant, TextStyle> = {
  display: text.display(),
  heading: text.heading(),
  label: text.label(),
  body: text.body(),
};

export function AppText({ children, variant = 'body', color, style }: Props) {
  const base = VARIANT_STYLES[variant];
  return <Text style={[base, color ? { color } : null, style]}>{children}</Text>;
}
