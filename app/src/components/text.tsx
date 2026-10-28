import { Text, type TextProps } from 'react-native';

import { Fonts, usePalette } from '@/constants/theme';

type Variant = 'title' | 'heading' | 'body' | 'label' | 'muted';

const styles = {
  title: { fontFamily: Fonts.display, fontSize: 40, lineHeight: 44, letterSpacing: -0.8 },
  heading: { fontFamily: Fonts.displayMedium, fontSize: 20, lineHeight: 26 },
  body: { fontFamily: Fonts.body, fontSize: 17, lineHeight: 26 },
  label: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  muted: { fontFamily: Fonts.body, fontSize: 15, lineHeight: 22 },
} as const;

/** Texto con la tipografía y el color del tema. */
export function T({ variant = 'body', style, ...props }: TextProps & { variant?: Variant }) {
  const c = usePalette();
  const color = variant === 'label' || variant === 'muted' ? c.muted : c.text;
  return <Text style={[styles[variant], { color }, style]} {...props} />;
}
