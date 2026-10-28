import { SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressLink } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Space, usePalette } from '@/constants/theme';
import { books, getBook, VERSION } from '@/lib/bible';
import { useSettings } from '@/lib/settings';

const sections = [
  { title: 'Antiguo Testamento', data: books.filter((b) => b.testament === 'AT') },
  { title: 'Nuevo Testamento', data: books.filter((b) => b.testament === 'NT') },
];

export default function Books() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { lastRead } = useSettings();
  const last = lastRead && getBook(lastRead.book);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(b) => b.code}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={{ paddingTop: insets.top + Space.lg, paddingBottom: insets.bottom + Space.xxl }}
      ListHeaderComponent={
        <View style={styles.header}>
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
            <T variant="muted">Buscar un versículo o una palabra…</T>
          </PressLink>

          {last && lastRead.chapter <= last.chapters && (
            <PressLink
              href={{ pathname: '/[book]/[chapter]', params: { book: last.code, chapter: lastRead.chapter } }}
              style={({ pressed }) => [
                styles.continue,
                { backgroundColor: c.text, opacity: pressed ? 0.85 : 1 },
              ]}>
              <T variant="label" style={{ color: c.bg, opacity: 0.7 }}>
                Seguir leyendo
              </T>
              <T variant="heading" style={{ color: c.bg, marginTop: Space.xs }}>
                {last.name} {lastRead.chapter}
              </T>
            </PressLink>
          )}
        </View>
      }
      renderSectionHeader={({ section }) => (
        <T variant="label" style={styles.section}>
          {section.title}
        </T>
      )}
      renderItem={({ item }) => (
        <PressLink
          href={{ pathname: '/[book]', params: { book: item.code } }}
          style={({ pressed }) => [
            styles.row,
            { borderColor: c.line, backgroundColor: pressed ? c.surface : 'transparent' },
          ]}>
          <T style={styles.bookName}>{item.name}</T>
          <T variant="muted">{item.chapters}</T>
        </PressLink>
      )}
    />
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Space.lg, marginBottom: Space.md },
  search: {
    marginTop: Space.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: Space.md,
    paddingVertical: 14,
  },
  continue: { marginTop: Space.md, borderRadius: 18, padding: Space.lg },
  section: { paddingHorizontal: Space.lg, paddingTop: Space.xl, paddingBottom: Space.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: Space.lg,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bookName: { fontFamily: Fonts.display, fontSize: 19 },
});
