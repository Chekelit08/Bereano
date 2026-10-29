import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { IconChevron, IconSearch } from '@/components/icons';
import { PressLink, Touchable } from '@/components/press-link';
import { PageHeader } from '@/components/page-header';
import { T } from '@/components/text';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { books, getBook, SECTIONS, VERSION } from '@/lib/bible';
import { useSettings } from '@/lib/settings';

type Testament = 'AT' | 'NT';

export default function Biblia() {
  const c = usePalette();
  const { lastRead } = useSettings();
  const last = lastRead && getBook(lastRead.book);
  const [testament, setTestament] = useState<Testament>(last?.testament ?? 'AT');

  return (
    <ScrollView style={{ backgroundColor: c.bg }}>
      <PageHeader kicker={VERSION} title="La" accent="Biblia">
        <PressLink
          href="/buscar"
          accessibilityRole="search"
          style={({ pressed }) => [
            styles.search,
            { backgroundColor: c.surface, borderColor: c.line, opacity: pressed ? 0.8 : 1 },
          ]}>
          <IconSearch color={c.muted} />
          <T style={{ fontFamily: Fonts.ui, fontSize: 15, color: c.muted }}>
            Juan 3 16, amor, “buen pastor”…
          </T>
        </PressLink>
      </PageHeader>
      <View style={[styles.page, styles.sheet, { backgroundColor: c.bg }]}>
        {last && lastRead.chapter <= last.chapters && (
          <PressLink
            href={{ pathname: '/[book]/[chapter]', params: { book: last.code, chapter: lastRead.chapter } }}
            style={({ pressed }) => [
              styles.continue,
              { backgroundColor: c.fill, opacity: pressed ? 0.85 : 1 },
            ]}>
            <View>
              <T variant="label" style={{ color: c.fillInk, opacity: 0.7 }}>
                Seguir leyendo
              </T>
              <T style={{ fontFamily: Fonts.display, fontSize: 24, color: c.fillInk, marginTop: 2 }}>
                {last.name} {lastRead.chapter}
              </T>
            </View>
            <IconChevron color={c.fillInk} size={22} />
          </PressLink>
        )}

        <PressLink
          href="/planes"
          style={({ pressed }) => [styles.plans, { backgroundColor: pressed ? c.surface2 : c.surface }]}>
          <View style={{ flex: 1 }}>
            <T style={{ fontFamily: Fonts.uiBold, fontSize: 16 }}>Planes de lectura</T>
            <T variant="muted">Ansiedad, perdón, familia, Juan en 21 días…</T>
          </View>
          <IconChevron color={c.muted} />
        </PressLink>

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
                style={[styles.segmentItem, on && { backgroundColor: c.fill }]}>
                <T style={{ fontFamily: Fonts.uiBold, fontSize: 15, color: on ? c.fillInk : c.muted }}>
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
                    { backgroundColor: pressed ? c.surface2 : c.surface },
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
      </View>
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
  sheet: { paddingTop: Space.sm },
  search: {
    marginTop: Space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Space.md,
    paddingVertical: 14,
  },
  continue: {
    borderRadius: Radius.md,
    padding: Space.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plans: {
    marginTop: Space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    padding: Space.lg,
    borderRadius: Radius.md,
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
    borderRadius: Radius.md,
    paddingHorizontal: Space.md,
    paddingVertical: 14,
  },
  bookName: { fontFamily: Fonts.uiBold, fontSize: 17, lineHeight: 22, letterSpacing: -0.3 },
});
