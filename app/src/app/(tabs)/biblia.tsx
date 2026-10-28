import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressLink, Touchable } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Space, usePalette } from '@/constants/theme';
import { books, getBook, SECTIONS, VERSION } from '@/lib/bible';
import { useSettings } from '@/lib/settings';

type Testament = 'AT' | 'NT';

export default function Biblia() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { lastRead } = useSettings();
  const last = lastRead && getBook(lastRead.book);
  const [testament, setTestament] = useState<Testament>(last?.testament ?? 'AT');

  return (
    <ScrollView contentContainerStyle={[styles.page, { paddingTop: insets.top + Space.lg }]}>
      <T variant="label">{VERSION}</T>
      <T variant="title" style={{ marginTop: Space.sm }}>
        La{' '}
        <T variant="title" style={{ fontFamily: Fonts.displayItalic, color: c.accent }}>
          Biblia
        </T>
      </T>

      <PressLink
        href="/buscar"
        accessibilityRole="search"
        style={({ pressed }) => [
          styles.search,
          { borderColor: c.line, backgroundColor: c.surface, opacity: pressed ? 0.7 : 1 },
        ]}>
        <T variant="muted">Buscar: Juan 3 16, amor, “buen pastor”…</T>
      </PressLink>

      {last && lastRead.chapter <= last.chapters && (
        <PressLink
          href={{ pathname: '/[book]/[chapter]', params: { book: last.code, chapter: lastRead.chapter } }}
          style={({ pressed }) => [
            styles.continue,
            { backgroundColor: c.text, opacity: pressed ? 0.85 : 1 },
          ]}>
          <View>
            <T variant="label" style={{ color: c.bg, opacity: 0.7 }}>
              Seguir leyendo
            </T>
            <T variant="heading" style={{ color: c.bg, marginTop: Space.xs }}>
              {last.name} {lastRead.chapter}
            </T>
          </View>
          <T style={{ color: c.bg, fontSize: 22 }}>→</T>
        </PressLink>
      )}

      {/* Antiguo / Nuevo Testamento */}
      <View
        style={[styles.segment, { backgroundColor: c.surface, borderColor: c.line }]}
        accessibilityRole="tablist">
        {(['AT', 'NT'] as const).map((t) => {
          const on = t === testament;
          return (
            <Touchable
              key={t}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => setTestament(t)}
              style={[styles.segmentItem, on && { backgroundColor: c.text }]}>
              <T style={{ fontFamily: Fonts.displayMedium, fontSize: 15, color: on ? c.bg : c.muted }}>
                {t === 'AT' ? 'Antiguo Testamento' : 'Nuevo Testamento'}
              </T>
            </Touchable>
          );
        })}
      </View>

      {SECTIONS.filter((s) => s.testament === testament).map((section) => (
        <View key={section.title} style={styles.section}>
          <View style={styles.sectionHead}>
            <T variant="label">{section.title}</T>
            <View style={[styles.rule, { backgroundColor: c.line }]} />
          </View>
          <View style={styles.grid}>
            {books.slice(section.from - 1, section.to).map((b) => (
              <PressLink
                key={b.code}
                href={{ pathname: '/[book]', params: { book: b.code } }}
                accessibilityLabel={`${b.name}, ${b.chapters} capítulos`}
                style={({ pressed }) => [
                  styles.card,
                  { borderColor: c.line, backgroundColor: pressed ? c.surface : 'transparent' },
                ]}>
                <T style={styles.bookName} numberOfLines={1} adjustsFontSizeToFit>
                  {b.name}
                </T>
                <T variant="muted" style={{ fontSize: 13 }}>
                  {b.chapters} {b.chapters === 1 ? 'capítulo' : 'capítulos'}
                </T>
              </PressLink>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: Space.lg,
    paddingBottom: Space.xxl,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  search: {
    marginTop: Space.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: Space.md,
    paddingVertical: 14,
  },
  continue: {
    marginTop: Space.md,
    borderRadius: 18,
    padding: Space.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  segment: {
    flexDirection: 'row',
    marginTop: Space.xl,
    borderRadius: 999,
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 999 },
  section: { marginTop: Space.xl },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: Space.sm, marginBottom: Space.sm },
  rule: { flex: 1, height: StyleSheet.hairlineWidth },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: Space.md,
    paddingVertical: 14,
  },
  bookName: { fontFamily: Fonts.display, fontSize: 19, lineHeight: 24 },
});
