import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Cover } from '@/components/cover';
import { NotFound } from '@/components/not-found';
import { PressLink, Touchable } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { shareText } from '@/data/devocionales';
import { TEMAS, getTema } from '@/data/temas';
import { track } from '@/lib/analytics';
import { formatRef, getBook, getChapter } from '@/lib/bible';
import { useWide } from '@/lib/layout';

/** Versículos de un tema, con el texto de la Reina-Valera 1909, para leer o compartir. */
export default function TemaDetalle() {
  const c = usePalette();
  const router = useRouter();
  const wide = useWide();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tema = getTema(id);
  useEffect(() => {
    if (tema) track('tema_abierto', { tema: tema.id });
  }, [tema]);
  if (!tema) return <NotFound />;

  const others = TEMAS.filter((t) => t.id !== tema.id).slice(0, 8);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={[styles.head, wide && { flexDirection: 'row', alignItems: 'flex-end' }]}>
        <Cover id={`tema-${tema.id}`} title={tema.title} colors={tema.colors} size={wide ? 180 : 120} />
        <View style={{ flex: 1 }}>
          <T variant="label">Versículos sobre</T>
          <T variant="title" style={{ marginTop: 2 }}>
            {tema.title}
          </T>
          <T variant="muted" style={{ fontSize: 16 }}>
            {tema.subtitle}
          </T>
        </View>
      </View>

      {tema.refs.map((r) => {
        const book = getBook(r.book)!;
        const to = r.to ?? r.from;
        const text = shareText(getChapter(r.book, r.chapter)!.slice(r.from - 1, to));
        const ref = formatRef(book, r.chapter, r.from, to);
        return (
          <View key={ref} style={[styles.verse, { borderColor: tema.colors[0] }]}>
            <T style={{ fontFamily: Fonts.read, fontSize: 19, lineHeight: 31 }}>{text}</T>
            <View style={styles.verseFoot}>
              <T style={{ fontFamily: Fonts.uiBold, color: c.accent }}>{ref}</T>
              <View style={{ flexDirection: 'row', gap: Space.sm }}>
                <PressLink
                  href={{
                    pathname: '/[book]/[chapter]',
                    params: { book: r.book, chapter: r.chapter, v: r.from },
                  }}
                  style={({ pressed }) => [styles.btn, { borderColor: c.line, opacity: pressed ? 0.7 : 1 }]}>
                  <T style={{ fontFamily: Fonts.uiBold, fontSize: 13 }}>Leer capítulo</T>
                </PressLink>
                <Touchable
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({
                      pathname: '/compartir',
                      params: { book: r.book, chapter: r.chapter, from: r.from, to },
                    })
                  }
                  style={({ pressed }) => [
                    styles.btn,
                    { backgroundColor: c.fill, borderColor: c.fill, opacity: pressed ? 0.85 : 1 },
                  ]}>
                  <T style={{ fontFamily: Fonts.uiBold, fontSize: 13, color: c.fillInk }}>Compartir</T>
                </Touchable>
              </View>
            </View>
          </View>
        );
      })}

      <T variant="heading" style={{ marginTop: Space.xl }}>
        Otros temas
      </T>
      <View style={styles.chips}>
        {others.map((t) => (
          <PressLink
            key={t.id}
            href={{ pathname: '/temas/[id]', params: { id: t.id } }}
            replace
            style={({ pressed }) => [
              styles.chip,
              { backgroundColor: c.surface, opacity: pressed ? 0.7 : 1 },
            ]}>
            <T style={{ fontFamily: Fonts.uiBold, fontSize: 14 }}>{t.title}</T>
          </PressLink>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: Space.lg, paddingBottom: Space.xxl, maxWidth: 760, width: '100%', alignSelf: 'center' },
  head: { gap: Space.lg, marginBottom: Space.md },
  verse: { marginTop: Space.lg, paddingLeft: Space.md, borderLeftWidth: 3 },
  verseFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Space.sm,
    flexWrap: 'wrap',
    gap: Space.sm,
  },
  btn: { borderWidth: 1, borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 7 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, marginTop: Space.sm },
  chip: { borderRadius: Radius.pill, paddingHorizontal: 16, paddingVertical: 9 },
});
