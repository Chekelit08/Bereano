import type { Ref } from 'react';
import { StyleSheet, Text, View, type ViewInstance } from 'react-native';

import type { Marks } from '@/data/marcas';

export const CARD_WIDTH = 360;
export const CARD_HEIGHT = 640; // 9:16, se exporta a 1080x1920 para historias

export type CardProps = {
  text: string;
  reference: string;
  marks?: Marks;
  tone: number;
  ref?: Ref<ViewInstance>;
};

/** Tamaño de letra según el largo del texto, para que entren hasta ~300 caracteres. */
export function fit(text: string, base: number): number {
  const n = text.length;
  if (n <= 90) return base + 4;
  if (n <= 130) return base;
  if (n <= 200) return base - 4;
  if (n <= 260) return base - 7;
  return base - 9;
}

/** Ruido fijo: el mismo número para la misma semilla (las imágenes no cambian entre capturas). */
export function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** La palabra para destacar: la marcada en el devocional o la más larga del texto. */
export function keyword(text: string, marks?: Marks): string {
  const clean = (w: string) => w.replace(/[^\p{L}]/gu, '');
  const marked = marks?.circle ?? marks?.bold?.[0];
  if (marked && clean(marked).length > 2) return clean(marked);
  return text
    .split(' ')
    .map(clean)
    .reduce((a, b) => (b.length > a.length ? b : a), '');
}

export function Brand({ color, bottom = 34 }: { color: string; bottom?: number }) {
  return (
    <View style={[cardStyles.brand, { bottom }]}>
      <Text style={{ fontFamily: 'Newsreader_500Medium', fontSize: 20, color, opacity: 0.9 }}>Bereano</Text>
      <Text style={{ fontFamily: 'Literata_400Regular', fontSize: 10, color, opacity: 0.6 }}>
        Reina-Valera 1909
      </Text>
    </View>
  );
}

export const cardStyles = StyleSheet.create({
  card: { width: CARD_WIDTH, height: CARD_HEIGHT, overflow: 'hidden', backgroundColor: '#0f0c0a' },
  brand: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
});
