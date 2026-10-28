import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type ViewInstance } from 'react-native';

import { Touchable } from '@/components/press-link';
import { CARD_HEIGHT, CARD_STYLES, CARD_WIDTH, StoryCard } from '@/components/story-card';
import { T } from '@/components/text';
import { Fonts, Space, usePalette } from '@/constants/theme';
import { shareRange, shareText, type Devocional } from '@/data/devocionales';
import { MARKS } from '@/data/marcas';
import { formatRef, getBook, getChapter } from '@/lib/bible';
import { useSettings } from '@/lib/settings';
import { shareCard } from '@/lib/share';

const SCALE = 0.62;
const W = CARD_WIDTH * SCALE;
const H = CARD_HEIGHT * SCALE;
const GAP = 12;

/** El versículo del día en cuatro diseños para historias. Se elige deslizando. */
export function VersiculoDelDia({ devocional: d }: { devocional: Devocional }) {
  const c = usePalette();
  const { cardStyle, setCardStyle } = useSettings();
  const card = useRef<ViewInstance>(null);
  const [busy, setBusy] = useState(false);

  const [a, b] = shareRange(d);
  const text = shareText(getChapter(d.book, d.chapter)!.slice(a - 1, b));
  const reference = formatRef(getBook(d.book)!, d.chapter, a, b);
  const index = Math.max(
    0,
    CARD_STYLES.findIndex((s) => s.id === cardStyle),
  );

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={W + GAP}
        decelerationRate="fast"
        contentContainerStyle={{ gap: GAP, paddingHorizontal: Space.lg }}
        style={{ marginHorizontal: -Space.lg }}
        contentOffset={{ x: index * (W + GAP), y: 0 }}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / (W + GAP));
          const s = CARD_STYLES[Math.min(CARD_STYLES.length - 1, Math.max(0, i))];
          if (s) setCardStyle(s.id);
        }}>
        {CARD_STYLES.map((s) => (
          <Touchable
            key={s.id}
            accessibilityRole="button"
            accessibilityLabel={`Diseño ${s.name}`}
            accessibilityState={{ selected: s.id === cardStyle }}
            onPress={() => setCardStyle(s.id)}
            style={[styles.preview, { borderColor: s.id === cardStyle ? c.accent : 'transparent' }]}>
            <View style={{ width: W, height: H, overflow: 'hidden', borderRadius: 14 }}>
              <View style={{ transform: [{ scale: SCALE }], transformOrigin: 'top left' }}>
                <StoryCard variant={s.id} text={text} reference={reference} marks={MARKS[d.id]} />
              </View>
            </View>
          </Touchable>
        ))}
      </ScrollView>

      <View style={styles.row}>
        <View style={styles.dots}>
          {CARD_STYLES.map((s) => (
            <T
              key={s.id}
              style={{
                fontFamily: s.id === cardStyle ? Fonts.displayItalic : Fonts.body,
                fontSize: 14,
                color: s.id === cardStyle ? c.accent : c.muted,
              }}>
              {s.name}
            </T>
          ))}
        </View>
        <Touchable
          accessibilityRole="button"
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            await shareCard(card, `“${text}”\n— ${reference} (RV1909)\n\nBereano`, reference);
            setBusy(false);
          }}
          style={({ pressed }) => [
            styles.share,
            { backgroundColor: c.accent, opacity: pressed || busy ? 0.7 : 1 },
          ]}>
          <T style={{ color: c.accentInk, fontFamily: Fonts.displayMedium, fontSize: 16 }}>
            Compartir en historias
          </T>
        </Touchable>
      </View>

      {/* Tamaño real, fuera de pantalla: es la que se exporta. */}
      <View style={styles.offscreen} pointerEvents="none" aria-hidden>
        <StoryCard ref={card} variant={cardStyle} text={text} reference={reference} marks={MARKS[d.id]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: { borderWidth: 2, borderRadius: 17, padding: 1 },
  row: { marginTop: Space.md, gap: Space.md },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: Space.lg },
  share: { borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  offscreen: { position: 'absolute', left: -CARD_WIDTH * 3, top: 0 },
});
