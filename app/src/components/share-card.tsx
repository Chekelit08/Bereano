import type { Ref } from 'react';
import { StyleSheet, View, type ViewInstance } from 'react-native';

import { T } from '@/components/text';
import { Colors, Fonts } from '@/constants/theme';

export const CARD_WIDTH = 360;
export const CARD_HEIGHT = 640; // 9:16, se exporta a 1080x1920 para historias

/**
 * Imagen para historias de Instagram: siempre en tinta oscura (se ve bien sobre cualquier
 * fondo y no depende del modo del teléfono). El texto sale de la Biblia de la app.
 */
export function ShareCard({
  text,
  reference,
  title,
  ref,
}: {
  text: string;
  reference: string;
  title: string;
  ref?: Ref<ViewInstance>;
}) {
  const c = Colors.dark;
  const size = text.length > 220 ? 23 : text.length > 150 ? 26 : 30;
  return (
    <View ref={ref} collapsable={false} style={[styles.card, { backgroundColor: c.bg }]}>
      <T style={[styles.kicker, { color: c.muted }]}>{title}</T>
      <View>
        <T style={[styles.quote, { color: c.accent }]}>“</T>
        <T style={{ fontFamily: Fonts.display, fontSize: size, lineHeight: size * 1.32, color: c.text }}>
          {text}
        </T>
        <T style={[styles.ref, { color: c.accent }]}>{reference}</T>
      </View>
      <View style={[styles.footer, { borderColor: c.line }]}>
        <T style={{ fontFamily: Fonts.displayMedium, fontSize: 18, color: c.text }}>Bereano</T>
        <T style={{ fontFamily: Fonts.body, fontSize: 11, color: c.muted }}>Reina-Valera 1909</T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    paddingHorizontal: 32,
    paddingTop: 72,
    paddingBottom: 56,
    justifyContent: 'space-between',
  },
  kicker: { fontFamily: 'Literata_500Medium', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' },
  quote: { fontFamily: Fonts.display, fontSize: 96, lineHeight: 96, marginBottom: -28 },
  ref: { fontFamily: Fonts.displayItalic, fontSize: 18, marginTop: 20 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 16,
  },
});
