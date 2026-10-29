import { Text, type TextProps } from 'react-native';

import { Fonts, usePalette } from '@/constants/theme';

type Variant = 'title' | 'heading' | 'body' | 'label' | 'muted' | 'read';

const styles = {
  title: { fontFamily: Fonts.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.8 },
  heading: { fontFamily: Fonts.display, fontSize: 20, lineHeight: 26, letterSpacing: -0.4 },
  body: { fontFamily: Fonts.ui, fontSize: 16, lineHeight: 24, letterSpacing: -0.2 },
  label: { fontFamily: Fonts.uiBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.2 },
  muted: { fontFamily: Fonts.ui, fontSize: 14, lineHeight: 21 },
  read: { fontFamily: Fonts.read, fontSize: 18, lineHeight: 30 },
} as const;

/** Texto con la tipografía y el color del tema. */
export function T({ variant = 'body', style, ...props }: TextProps & { variant?: Variant }) {
  const c = usePalette();
  const color = variant === 'label' || variant === 'muted' ? c.muted : c.text;
  return <Text style={[styles[variant], { color }, style]} {...props} />;
}
