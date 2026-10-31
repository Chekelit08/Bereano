import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CardThumb } from '@/components/card-thumb';
import { NotFound } from '@/components/not-found';
import { PressLink } from '@/components/press-link';
import { ShareCardButton } from '@/components/share-card-button';
import { CARD_HEIGHT, CARD_WIDTH, StoryCard } from '@/components/story-card';
import { T } from '@/components/text';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { DESIGN_STYLES, FREE_DESIGN, TONES, designName, sameDesign, type Design } from '@/data/disenos';
import { track } from '@/lib/analytics';
import { sharePassage } from '@/lib/compartir';
import { usePlus } from '@/lib/plus';

const BIG = 0.7;
const SMALL = 0.2;

/** Compartir cualquier versículo como imagen. Gratis: un diseño. Con Plus: todos, en 3 tonos. */
export default function Compartir() {
  const c = usePalette();
  const { isPlus } = usePlus();
  const params = useLocalSearchParams<{ book: string; chapter: string; from: string; to?: string }>();
  const passage = sharePassage(params);
  useEffect(() => {
    track('compartir_versiculo_abierto');
  }, []);
  const [design, setDesign] = useState<Design>(FREE_DESIGN);
  if (!passage) return <NotFound />;

  const { text, reference, tooLong } = passage;
  const locked = (d: Design) => !isPlus && !sameDesign(d, FREE_DESIGN);

  if (tooLong)
    return (
      <View style={styles.page}>
        <T variant="title">Es mucho texto</T>
        <T variant="muted" style={{ marginTop: Space.sm, fontSize: 16 }}>
          Para que se lea bien en una historia, elegí menos versículos.
        </T>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={[styles.preview, { width: CARD_WIDTH * BIG, height: CARD_HEIGHT * BIG }]}>
        <View style={{ transform: [{ scale: BIG }], transformOrigin: 'top left' }}>
          <StoryCard design={design} text={text} reference={reference} />
        </View>
      </View>

      <View style={styles.section}>
        <T variant="label">Estilo · {designName(design)}</T>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -Space.lg }}
          contentContainerStyle={styles.strip}>
          {DESIGN_STYLES.map((s) => {
            const d = { style: s.id, tone: s.id === design.style ? design.tone : 0 };
            return (
              <CardThumb
                key={s.id}
                design={d}
                text={text}
                reference={reference}
                scale={SMALL}
                selected={s.id === design.style}
                locked={locked(d)}
                onPress={() => setDesign(d)}
              />
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <T variant="label">Tono</T>
        <View style={[styles.strip, { paddingHorizontal: 0 }]}>
          {Array.from({ length: TONES }, (_, tone) => {
            const d = { style: design.style, tone };
            return (
              <CardThumb
                key={tone}
                design={d}
                text={text}
                reference={reference}
                scale={SMALL}
                selected={tone === design.tone}
                locked={locked(d)}
                onPress={() => setDesign(d)}
              />
            );
          })}
        </View>
      </View>

      <View style={{ marginTop: Space.lg, gap: Space.sm }}>
        <ShareCardButton design={design} text={text} reference={reference} locked={locked(design)} />
        {!isPlus && (
          <View style={[styles.note, { backgroundColor: c.surface }]}>
            <T style={{ fontFamily: Fonts.uiBold, fontSize: 15 }}>Gratis: el diseño Minimal</T>
            <T variant="muted" style={{ marginTop: 2 }}>
              Con Bereano Plus tenés los {DESIGN_STYLES.length} estilos en {TONES} tonos para cualquier
              versículo.
            </T>
            <PressLink
              href="/plus"
              style={({ pressed }) => ({ marginTop: Space.sm, opacity: pressed ? 0.6 : 1 })}>
              <T style={{ fontFamily: Fonts.uiBold, color: c.accent }}>Probar Plus gratis →</T>
            </PressLink>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: Space.lg, paddingBottom: Space.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  preview: { alignSelf: 'center', borderRadius: Radius.md, overflow: 'hidden' },
  section: { marginTop: Space.lg, gap: Space.sm },
  strip: { flexDirection: 'row', gap: Space.sm, paddingHorizontal: Space.lg },
  note: { padding: Space.md, borderRadius: Radius.md },
});
