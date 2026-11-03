import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PressLink, Touchable } from '@/components/press-link';
import { CARD_HEIGHT, CARD_WIDTH, StoryCard } from '@/components/story-card';
import { T } from '@/components/text';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { devocionalDelDia, shareRange, shareText, type Devocional } from '@/data/devocionales';
import { designsForDay } from '@/data/disenos';
import { MARKS } from '@/data/marcas';
import { TEMAS } from '@/data/temas';
import { formatRef, getBook, getChapter } from '@/lib/bible';

function verseOf(d: Devocional) {
  const [a, b] = shareRange(d);
  return {
    text: shareText(getChapter(d.book, d.chapter)!.slice(a - 1, b)),
    ref: formatRef(getBook(d.book)!, d.chapter, a, b),
    a,
    b,
  };
}

/** Portada de Hoy en computadora: el versículo grande y el diseño del día como imagen. */
export function HeroVerse({ devocional: d, date }: { devocional: Devocional; date: Date }) {
  const c = usePalette();
  const router = useRouter();
  const v = verseOf(d);
  const SCALE = 0.62;
  return (
    <View style={[styles.hero, { backgroundColor: c.surface }]}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <T variant="label">Versículo del día</T>
        <T style={{ fontFamily: Fonts.read, fontSize: 30, lineHeight: 44, marginTop: Space.sm }}>{v.text}</T>
        <T style={{ fontFamily: Fonts.uiBold, color: c.accent, marginTop: Space.md, fontSize: 16 }}>
          {v.ref}
        </T>
        <View style={styles.heroBtns}>
          <PressLink
            href={{ pathname: '/devocional/[id]', params: { id: d.id } }}
            style={({ pressed }) => [styles.btn, { backgroundColor: c.fill, opacity: pressed ? 0.85 : 1 }]}>
            <T style={{ color: c.fillInk, fontFamily: Fonts.uiBold }}>Leer el devocional</T>
          </PressLink>
          <Touchable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: '/compartir',
                params: { book: d.book, chapter: d.chapter, from: v.a, to: v.b },
              })
            }
            style={({ pressed }) => [
              styles.btn,
              styles.btnOutline,
              { borderColor: c.text, opacity: pressed ? 0.7 : 1 },
            ]}>
            <T style={{ fontFamily: Fonts.uiBold }}>Compartir</T>
          </Touchable>
        </View>
      </View>
      <View
        style={{
          width: CARD_WIDTH * SCALE,
          height: CARD_HEIGHT * SCALE,
          borderRadius: 18,
          overflow: 'hidden',
        }}>
        <View style={{ transform: [{ scale: SCALE }], transformOrigin: 'top left' }}>
          <StoryCard design={designsForDay(date)[0]} text={v.text} reference={v.ref} marks={MARKS[d.id]} />
        </View>
      </View>
    </View>
  );
}

/** "Versículos bíblicos sobre…": temas en una franja oscura, como en las webs de Biblia grandes. */
export function TemasBand() {
  return (
    <View style={styles.band}>
      <T style={styles.bandTitle}>Versículos bíblicos sobre…</T>
      <View style={styles.chips}>
        {TEMAS.map((t) => (
          <PressLink
            key={t.id}
            href={{ pathname: '/temas/[id]', params: { id: t.id } }}
            style={({ pressed }) => [styles.chip, { opacity: pressed ? 0.7 : 1 }]}>
            <T style={styles.chipText}>{t.title}</T>
          </PressLink>
        ))}
      </View>
      <PressLink
        href="/temas"
        style={({ pressed }) => ({ alignSelf: 'center', marginTop: Space.md, opacity: pressed ? 0.7 : 1 })}>
        <T style={{ color: '#ffffff', fontFamily: Fonts.uiBold, opacity: 0.85 }}>Ver todos los temas →</T>
      </PressLink>
    </View>
  );
}

/** Los versículos de los últimos días, para ponerse al día. */
export function SemanaList({ date }: { date: Date }) {
  const c = usePalette();
  const past = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (i + 1));
    return { date: d, devo: devocionalDelDia(d) };
  });
  return (
    <View style={{ gap: Space.sm }}>
      {past.map(({ date: d, devo }) => {
        const v = verseOf(devo);
        return (
          <PressLink
            key={d.toISOString()}
            href={{ pathname: '/devocional/[id]', params: { id: devo.id } }}
            style={({ pressed }) => [styles.week, { borderColor: c.line, opacity: pressed ? 0.7 : 1 }]}>
            <T variant="label">
              {d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
            </T>
            <T
              style={{ fontFamily: Fonts.read, fontSize: 17, lineHeight: 27, marginTop: 4 }}
              numberOfLines={3}>
              {v.text}
            </T>
            <T style={{ fontFamily: Fonts.uiBold, color: c.muted, marginTop: 4, fontSize: 13 }}>
              {v.ref} · {devo.title}
            </T>
          </PressLink>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    gap: Space.xl,
    padding: Space.xl,
    borderRadius: Radius.lg,
    marginTop: Space.lg,
    alignItems: 'center',
  },
  heroBtns: { flexDirection: 'row', gap: Space.sm, marginTop: Space.lg, flexWrap: 'wrap' },
  btn: { borderRadius: Radius.pill, paddingHorizontal: Space.lg, paddingVertical: 13 },
  btnOutline: { borderWidth: 1 },
  band: { backgroundColor: '#111114', borderRadius: Radius.lg, padding: Space.xl },
  bandTitle: {
    color: '#ffffff',
    fontFamily: Fonts.display,
    fontSize: 26,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.sm,
    justifyContent: 'center',
    marginTop: Space.lg,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ffffff40',
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  chipText: { color: '#ffffff', fontFamily: Fonts.uiBold, fontSize: 14 },
  week: { paddingVertical: Space.md, borderBottomWidth: StyleSheet.hairlineWidth },
});
