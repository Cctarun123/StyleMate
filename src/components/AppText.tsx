import React from 'react';
import { Text, TextStyle } from 'react-native';
import { text, useTheme } from '../utils/theme';

type Variant = 'title' | 'heading' | 'body' | 'label' | 'price';

type TextStyleFn = (colors: ReturnType<typeof useTheme>['colors']) => TextStyle;

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  color?: string;
  style?: TextStyle | TextStyle[];
  numberOfLines?: number;
};

const VARIANT_STYLES: Record<Variant, TextStyleFn> = {
  title: text.title,
  heading: text.heading,
  body: text.body,
  label: text.label,
  price: text.price,
};

export function AppText({ children, variant = 'body', color, style, numberOfLines }: Props) {
  const { colors } = useTheme();
  const base = VARIANT_STYLES[variant](colors);
  return (
    <Text style={[base, color ? { color } : null, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}
